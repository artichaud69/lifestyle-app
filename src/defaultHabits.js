import { lastNDates } from './dates.js'

const demoDates = lastNDates(5)
// a longer history for one demo habit, so the heatmap has more than 5 squares to show
const meditateHistory = lastNDates(12)

export const defaultHabits = [
  {
    id: crypto.randomUUID(),
    name: 'Meditate',
    startDate: meditateHistory[0],
    doneDates: [
      meditateHistory[0],
      meditateHistory[3],
      meditateHistory[5],
      meditateHistory[7],
      meditateHistory[9],
      meditateHistory[10],
      meditateHistory[11],
    ],
  },
  {
    id: crypto.randomUUID(),
    name: 'Read',
    startDate: demoDates[0],
    doneDates: [demoDates[0], demoDates[1], demoDates[3]],
  },
  {
    id: crypto.randomUUID(),
    name: 'No sugar',
    startDate: demoDates[0],
    doneDates: [demoDates[1], demoDates[2]],
  },
]
