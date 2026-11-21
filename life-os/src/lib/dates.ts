// Date helpers. Date-only values ("2026-11-21") are stored as UTC midnight in
// @db.Date columns; "today" is always computed in the user's own timezone.

export type DateKey = string; // YYYY-MM-DD

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function isDateKey(value: string): value is DateKey {
  if (!DATE_KEY.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function localDateKey(timeZone: string, now: Date = new Date()): DateKey {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function dateKeyToDate(key: DateKey): Date {
  return new Date(`${key}T00:00:00Z`);
}

export function dateToKey(date: Date): DateKey {
  return date.toISOString().slice(0, 10);
}

export function addDays(key: DateKey, days: number): DateKey {
  const d = dateKeyToDate(key);
  d.setUTCDate(d.getUTCDate() + days);
  return dateToKey(d);
}

/** 0 = Sunday … 6 = Saturday */
export function weekday(key: DateKey): number {
  return dateKeyToDate(key).getUTCDay();
}

export function startOfWeek(key: DateKey, weekStartsOn: number): DateKey {
  const diff = (weekday(key) - weekStartsOn + 7) % 7;
  return addDays(key, -diff);
}

export function diffDays(a: DateKey, b: DateKey): number {
  return Math.round((dateKeyToDate(a).getTime() - dateKeyToDate(b).getTime()) / 86_400_000);
}

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const WEEKDAYS_FR = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

/**
 * Finds a date expression in free text, relative to `today`.
 * Deliberately small and predictable: it understands the phrases people
 * actually type into a capture box, and returns null rather than guessing.
 */
export function parseRelativeDate(text: string, today: DateKey): { date: DateKey; match: string } | null {
  const t = text.toLowerCase();
  const rules: Array<[RegExp, (m: RegExpMatchArray) => DateKey | null]> = [
    [/\b(\d{4}-\d{2}-\d{2})\b/, (m) => (isDateKey(m[1]!) ? m[1]! : null)],
    [/\b(today|tonight|this evening|aujourd'hui|ce soir)\b/, () => today],
    [/\b(day after tomorrow|après-demain)\b/, () => addDays(today, 2)],
    [/\b(tomorrow|demain)\b/, () => addDays(today, 1)],
    [/\bin (\d{1,3}) days?\b/, (m) => addDays(today, Number(m[1]))],
    [/\bdans (\d{1,3}) jours?\b/, (m) => addDays(today, Number(m[1]))],
    [/\b(next week|la semaine prochaine)\b/, () => addDays(startOfWeek(today, 1), 7)],
    [/\b(this weekend|ce week-end)\b/, () => addDays(today, (6 - weekday(today) + 7) % 7)],
    [
      new RegExp(`\\b(?:on |next |this )?(${WEEKDAYS.join("|")})\\b`),
      (m) => nextWeekday(today, WEEKDAYS.indexOf(m[1]!)),
    ],
    [new RegExp(`\\b(${WEEKDAYS_FR.join("|")})( prochain)?\\b`), (m) => nextWeekday(today, WEEKDAYS_FR.indexOf(m[1]!))],
  ];
  for (const [re, fn] of rules) {
    const m = t.match(re);
    if (m) {
      const date = fn(m);
      if (date) return { date, match: m[0] };
    }
  }
  return null;
}

function nextWeekday(today: DateKey, target: number): DateKey {
  const diff = (target - weekday(today) + 7) % 7 || 7;
  return addDays(today, diff);
}

export function formatDateKey(key: DateKey, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) {
  return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(dateKeyToDate(key));
}
