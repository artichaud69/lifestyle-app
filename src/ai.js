const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-5'

const SYSTEM_PROMPT = `You are a habit-planning assistant inside a personal habit tracker app. Given a goal the user wants to achieve, respond with a short, practical set of 2-5 recurring habits that would help them reach it, each with a realistic weekly frequency. Respond with ONLY valid JSON, no other text and no markdown fences, in exactly this shape:
{"habits":[{"name":"short habit name, max 40 chars","timesPerWeek":1-7,"reason":"one short sentence on why this helps"}]}`

export async function generateHabitPlan(goalText, apiKey) {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Goal: ${goalText}` }],
    }),
  })

  if (!response.ok) {
    if (response.status === 401) throw new Error('That API key was rejected. Double-check it and try again.')
    const body = await response.text()
    throw new Error(`AI request failed (${response.status}): ${body.slice(0, 200)}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text ?? ''
  const cleaned = text.trim().replace(/^```(json)?\s*/i, '').replace(/```\s*$/i, '')

  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error('Could not understand the AI response. Try rephrasing your goal.')
  }

  if (!Array.isArray(parsed.habits) || parsed.habits.length === 0) {
    throw new Error('The AI did not suggest any habits. Try rephrasing your goal.')
  }

  return parsed.habits
    .filter((habit) => typeof habit.name === 'string' && habit.name.trim())
    .map((habit) => ({
      name: habit.name.trim().slice(0, 60),
      timesPerWeek: Math.min(7, Math.max(1, Math.round(Number(habit.timesPerWeek) || 3))),
      reason: typeof habit.reason === 'string' ? habit.reason.trim() : '',
    }))
}
