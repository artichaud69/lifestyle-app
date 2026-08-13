import { useState, useEffect } from 'react'
import { loadApiKey, saveApiKey } from '../aiSettings.js'
import { loadGoals, saveGoals } from '../goals.js'
import { generateHabitPlan } from '../ai.js'
import { todayISO } from '../dates.js'
import { weeklyCompletionPercent } from '../frequency.js'
import FrequencyPicker from './FrequencyPicker.jsx'
import PageHeader from './PageHeader.jsx'
import { PAGE_ICONS } from '../navIcons.js'

function GoalsPage({ habits, onAddHabits }) {
  const [apiKey, setApiKey] = useState(() => loadApiKey())
  const [apiKeyDraft, setApiKeyDraft] = useState('')
  const [showApiKeyForm, setShowApiKeyForm] = useState(false)
  const [goals, setGoals] = useState(() => loadGoals())
  const [goalText, setGoalText] = useState('')
  const [suggestions, setSuggestions] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    saveGoals(goals)
  }, [goals])

  function handleSaveApiKey(event) {
    event.preventDefault()
    const trimmed = apiKeyDraft.trim()
    if (!trimmed) return
    saveApiKey(trimmed)
    setApiKey(trimmed)
    setApiKeyDraft('')
    setShowApiKeyForm(false)
  }

  async function handleGenerate(event) {
    event.preventDefault()
    const trimmed = goalText.trim()
    if (!trimmed) return
    setIsGenerating(true)
    setErrorMessage(null)
    setSuggestions(null)
    try {
      const plan = await generateHabitPlan(trimmed, apiKey)
      setSuggestions(plan.map((habit) => ({ ...habit, included: true })))
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  function toggleIncluded(index) {
    setSuggestions(suggestions.map((s, i) => (i === index ? { ...s, included: !s.included } : s)))
  }

  function updateName(index, name) {
    setSuggestions(suggestions.map((s, i) => (i === index ? { ...s, name } : s)))
  }

  function updateFrequency(index, timesPerWeek) {
    setSuggestions(suggestions.map((s, i) => (i === index ? { ...s, timesPerWeek } : s)))
  }

  function handleAccept() {
    const accepted = suggestions.filter((s) => s.included && s.name.trim())
    if (accepted.length === 0) return
    const newHabits = accepted.map((s) => ({
      id: crypto.randomUUID(),
      name: s.name.trim(),
      startDate: todayISO(),
      timesPerWeek: s.timesPerWeek,
      doneDates: [],
    }))
    onAddHabits(newHabits)
    const newGoal = {
      id: crypto.randomUUID(),
      text: goalText.trim(),
      createdAt: todayISO(),
      habitIds: newHabits.map((h) => h.id),
    }
    setGoals([newGoal, ...goals])
    setGoalText('')
    setSuggestions(null)
  }

  function handleRemoveGoal(goalId) {
    setGoals(goals.filter((g) => g.id !== goalId))
  }

  return (
    <div className="wallpaper-page">
      <PageHeader title="Goals" icon={PAGE_ICONS.goals} />

      {!apiKey || showApiKeyForm ? (
        <form className="edit-panel" onSubmit={handleSaveApiKey}>
          <p className="journal-prompt">
            Paste your Anthropic API key to let the app suggest habits for your goals. It's stored only on
            this device and sent straight to Anthropic when you generate a plan.
          </p>
          <input
            type="password"
            className="text-input"
            value={apiKeyDraft}
            onChange={(event) => setApiKeyDraft(event.target.value)}
            placeholder="sk-ant-..."
            autoFocus
          />
          <div className="button-row">
            <button type="submit" className="button button-primary" disabled={!apiKeyDraft.trim()}>
              Save key
            </button>
            {apiKey && (
              <button type="button" className="button button-secondary" onClick={() => setShowApiKeyForm(false)}>
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        <>
          <form className="edit-panel" onSubmit={handleGenerate}>
            <label className="field-label">
              What do you want to achieve?
              <input
                type="text"
                className="text-input"
                value={goalText}
                onChange={(event) => setGoalText(event.target.value)}
                placeholder="e.g. Run a 10k in 3 months"
              />
            </label>
            <div className="button-row">
              <button type="submit" className="button button-primary" disabled={!goalText.trim() || isGenerating}>
                {isGenerating ? 'Thinking…' : 'Suggest habits'}
              </button>
              <button type="button" className="button button-secondary" onClick={() => setShowApiKeyForm(true)}>
                Change API key
              </button>
            </div>
            {errorMessage && <p className="goal-error">{errorMessage}</p>}
          </form>

          {suggestions && (
            <div className="edit-panel">
              <div className="modal-title">Suggested habits</div>
              {suggestions.map((s, index) => (
                <div key={index} className="suggestion-row">
                  <div className="suggestion-header">
                    <input
                      type="checkbox"
                      checked={s.included}
                      onChange={() => toggleIncluded(index)}
                      aria-label={`Include ${s.name}`}
                    />
                    <input
                      type="text"
                      className="text-input suggestion-name-input"
                      value={s.name}
                      onChange={(event) => updateName(index, event.target.value)}
                    />
                  </div>
                  {s.reason && <p className="suggestion-reason">{s.reason}</p>}
                  <FrequencyPicker timesPerWeek={s.timesPerWeek} onChange={(n) => updateFrequency(index, n)} />
                </div>
              ))}
              <div className="button-row">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={handleAccept}
                  disabled={!suggestions.some((s) => s.included)}
                >
                  Add to my habits
                </button>
                <button type="button" className="button button-secondary" onClick={() => setSuggestions(null)}>
                  Discard
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <h2 className="section-heading">Your goals</h2>
      {goals.length === 0 ? (
        <p className="summary-empty">No goals yet.</p>
      ) : (
        <div className="summary-list">
          {goals.map((goal) => {
            const linkedHabits = habits.filter((habit) => goal.habitIds.includes(habit.id))
            return (
              <div key={goal.id} className="summary-row">
                <div className="summary-row-name">{goal.text}</div>
                <div className="summary-row-stats">
                  {linkedHabits.length === 0
                    ? 'No linked habits'
                    : linkedHabits
                        .map(
                          (habit) =>
                            `${habit.name} (${weeklyCompletionPercent(habit.startDate, habit.doneDates, habit.timesPerWeek)}%)`,
                        )
                        .join(' · ')}
                </div>
                <button type="button" className="button button-danger" onClick={() => handleRemoveGoal(goal.id)}>
                  Remove
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default GoalsPage
