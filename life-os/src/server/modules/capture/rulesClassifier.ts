import { parseRelativeDate, type DateKey } from "@/lib/dates";
import type { CaptureType, Classification } from "@/lib/schemas/capture";
import type { DomainKey } from "@/lib/schemas/common";

// Deterministic, local classifier. It is always available (no network, no
// consent needed) and is the fallback whenever the AI provider is off or
// fails. It aims to be right on common phrasings and honest otherwise: low
// confidence makes the UI ask the user to choose.

const LEISURE_ACTIVITIES =
  /\b(play(ing)?|gam(e|es|ing)|minecraft|video ?games?|watch(ing)?|movie|film|series|netflix|read(ing)? (a |for )|paint(ing)? miniatures?|miniatures?|relax(ing)?|chill(ing)?|nap|hobby)\b/;
const TIME_OF_DAY = /\b(tonight|this evening|this afternoon|this weekend|ce soir|tomorrow|demain|on (saturday|sunday))\b/;
const DURATION = /\b(\d+(?:\.\d+)?|an?|one|two|three|four|half an?)\s*(hours?|hrs?|h|minutes?|mins?)\b/;

const TASK_PREFIX =
  /^(remind me to|reminder:|todo:?|to do:?|don't forget to|need to|i need to|must|have to|i have to|rappelle-moi de|penser à)\s+/i;
const IMPERATIVE =
  /^(call|email|e-mail|text|message|buy|book|pay|send|schedule|renew|fix|clean|cancel|order|pick up|drop off|return|submit|file|prepare|review|finish|write|reply|check|ask|contact|plan|organi[sz]e|update|appeler|acheter|envoyer|payer|réserver)\b/i;
const QUESTION_START = /^(how|why|what|when|where|who|which|could|can|is|are|does|did|do|would|comment|pourquoi|quel|quelle|qui)\b/i;
const SELF_QUESTION = /\b(why do i|why am i|should i|am i|do i|me|myself|je|moi)\b/i;
const FEELING =
  /\b(i (feel|felt|am feeling|was feeling)|i'm (feeling|so|really|a bit|tired|stressed|anxious|happy|sad|frustrated|exhausted|proud|grateful)|i had (a|an) |today (i|was)|this (morning|afternoon|evening) i|i (loved|enjoyed|hated)|je me sens|j'ai passé)\b/i;
const GOAL_START = /^(i want to|i'd like to|i would like to|my goal is to|i aim to|goal:|je veux|j'aimerais)\s+/i;
const GOAL_VERBS = /\b(improve|get better at|run|lose|gain|reach|become|achieve|save|master|get fit|be able to|spend more|spend less)\b/i;
const PROJECT_WORDS =
  /\b(build|create|make|develop|design|write a (book|blog|novel)|start a|launch|code|program|paint|study|learn( how)? to|learn|set up|renovate|tool|app|application|website|world|collection|course)\b/i;
const PROJECT_START = /^(i (would love|'d love|want|wanna|plan|intend) to|idea:|project:|maybe i could|i could|i should)\s+/i;
const MEMORY_START =
  /^(i (value|prefer|tend to|usually|always|never|love|enjoy|hate|dislike|work best|am (an? )?(introvert|extravert|morning|night))|i'm (an? )?(introvert|extravert|morning person|night owl)|my values?|j'aime|je préfère)\b/i;
const CONSIDERING = /^(i am|i'm) (considering|thinking about|thinking of|wondering whether|torn)\b/i;

const DOMAIN_HINTS: Array<[RegExp, DomainKey]> = [
  [/\b(run|running|gym|train|training|boxing|strength|sleep|health|weight|fitness|exercise|doctor|dentist)\b/i, "health"],
  [/\b(kids?|children|son|daughter|partner|wife|husband|family|friend|parents?)\b/i, "relationships"],
  [/\b(learn|study|course|book|read|history|psychology|science|python|language)\b/i, "learning"],
  [/\b(money|save|savings|invest|budget|salary|finance|financial|mortgage)\b/i, "finance"],
  [/\b(career|job|work|promotion|manager|team|business)\b/i, "achievement"],
  [/\b(game|minecraft|paint|miniature|hobby|fun|play)\b/i, "recreation"],
];

function guessDomain(text: string): DomainKey | null {
  for (const [re, key] of DOMAIN_HINTS) if (re.test(text)) return key;
  return null;
}

function parseMinutes(text: string): number | null {
  const m = text.toLowerCase().match(DURATION);
  if (!m) return null;
  const word = m[1]!;
  const n =
    word === "a" || word === "an" || word === "one" ? 1 : word === "two" ? 2 : word === "three" ? 3 : word === "four" ? 4 : word.startsWith("half") ? 0.5 : Number(word);
  const unit = m[2]!;
  const minutes = unit.startsWith("h") ? n * 60 : n;
  return Number.isFinite(minutes) && minutes >= 5 && minutes <= 1440 ? Math.round(minutes) : null;
}

function stripDate(title: string, match?: string) {
  let t = title;
  if (match) t = t.replace(new RegExp(`\\s*\\b${match.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"), "");
  return t.replace(/\s{2,}/g, " ").replace(/[\s,.;:!-]+$/, "").trim();
}

function capitalise(s: string) {
  return s ? s[0]!.toUpperCase() + s.slice(1) : s;
}

function result(
  proposal: Classification["proposal"],
  confidence: number,
  rationale: string,
  alternatives: CaptureType[] = [],
): Classification {
  return { proposal, confidence, rationale, alternatives: alternatives.filter((a) => a !== proposal.type).slice(0, 3) };
}

export function classifyWithRules(raw: string, today: DateKey): Classification {
  const text = raw.trim().replace(/\s+/g, " ");
  const lower = text.toLowerCase();
  const date = parseRelativeDate(text, today);

  // 1. Chosen leisure: a recreational activity framed as an intention.
  if (
    LEISURE_ACTIVITIES.test(lower) &&
    (/\b(i want to|i'm going to|i am going to|i will|i'll|planning to|i plan to|going to|je vais)\b/.test(lower) || TIME_OF_DAY.test(lower)) &&
    !FEELING.test(text)
  ) {
    const label = capitalise(
      stripDate(
        text
          .replace(/^(tonight|this evening|tomorrow|ce soir|demain)[, ]+/i, "")
          .replace(/^(i want to|i'm going to|i am going to|i will|i'll|i plan to|planning to|going to)\s+/i, ""),
        date?.match,
      ),
    );
    return result(
      { type: "leisure", label: label || text, date: date?.date ?? today, minutes: parseMinutes(text) },
      0.8,
      "Reads as an intention to spend time on something you enjoy.",
      ["task", "journal"],
    );
  }

  // 2. Explicit reminders / to-dos and imperative verbs.
  if (TASK_PREFIX.test(text) || IMPERATIVE.test(text)) {
    const title = capitalise(stripDate(text.replace(TASK_PREFIX, ""), date?.match));
    return result(
      { type: "task", title: title || text, dueDate: date?.date ?? null, estimateMinutes: parseMinutes(text), effort: null },
      TASK_PREFIX.test(text) ? 0.92 : 0.78,
      "Starts like something to do.",
      ["project"],
    );
  }

  // 3. Feelings and experiences.
  if (FEELING.test(text)) {
    return result({ type: "journal", body: text, tags: [] }, 0.85, "Describes how you feel or something you experienced.", ["memory"]);
  }

  // 4. Considering a decision → a reflection, for now (decision journal is Phase 2).
  if (CONSIDERING.test(text)) {
    return result(
      { type: "journal", body: text, tags: ["considering"] },
      0.65,
      "Sounds like something you are weighing up; saved as a reflection so you can come back to it.",
      ["goal", "project"],
    );
  }

  // 5. Durable statements about yourself.
  if (MEMORY_START.test(text) && !PROJECT_START.test(text)) {
    return result(
      { type: "memory", content: text, domainKey: guessDomain(text) },
      0.75,
      "A lasting statement about you — a preference, value or tendency.",
      ["journal"],
    );
  }

  // 6. Questions about the world → curiosity inbox.
  if ((text.endsWith("?") || QUESTION_START.test(text)) && !SELF_QUESTION.test(text)) {
    return result({ type: "curiosity", question: text, theme: guessDomain(text) }, text.endsWith("?") ? 0.82 : 0.6, "A question to explore later.", ["task"]);
  }
  if (text.endsWith("?")) {
    return result({ type: "curiosity", question: text, theme: null }, 0.5, "A question — possibly about yourself, which you may prefer to journal.", [
      "journal",
      "memory",
    ]);
  }

  // 7. Goals vs projects: "I want to <improve/run/become…>" is a goal, "I'd
  //    love to <build/learn/paint…>" is a project idea.
  const goalMatch = text.match(GOAL_START);
  const projectMatch = text.match(PROJECT_START);
  if (goalMatch || projectMatch) {
    const rest = text.replace(goalMatch ? GOAL_START : PROJECT_START, "");
    const title = capitalise(stripDate(rest, date?.match));
    const isProject = PROJECT_WORDS.test(rest) && !GOAL_VERBS.test(rest.split(" ").slice(0, 3).join(" "));
    if (isProject) {
      const kind = /\b(learn|study|course)\b/i.test(rest)
        ? "LEARNING"
        : /\b(paint|draw|miniature|write|music|minecraft|world)\b/i.test(rest)
          ? "CREATIVE"
          : /\b(renovate|garden|house|home)\b/i.test(rest)
            ? "HOME"
            : "PERSONAL";
      return result(
        { type: "project", title, purpose: null, kind },
        0.72,
        "Sounds like something to build or explore over several sessions.",
        ["goal", "curiosity"],
      );
    }
    return result(
      { type: "goal", title, domainKey: guessDomain(rest), motivation: null },
      0.7,
      "Describes an outcome you want to work toward.",
      ["project", "task"],
    );
  }

  // 8. Unknown: default to journal (keeps the user's words intact), low confidence.
  return result({ type: "journal", body: text, tags: [] }, 0.4, "Not sure where this belongs — saving it as a note keeps your words intact.", [
    "task",
    "memory",
    "curiosity",
  ]);
}
