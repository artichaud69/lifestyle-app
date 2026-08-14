// Quotes from ancient thinkers, chosen to sit alongside the app's Stoic and
// warrior framing. Translations of ancient texts vary, so these are the
// commonly published English renderings rather than any single edition.
export const QUOTES = [
  { text: 'You have power over your mind — not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
  { text: 'Waste no more time arguing what a good man should be. Be one.', author: 'Marcus Aurelius' },
  { text: 'The impediment to action advances action. What stands in the way becomes the way.', author: 'Marcus Aurelius' },
  { text: 'The best revenge is to be unlike him who performed the injury.', author: 'Marcus Aurelius' },
  { text: 'Confine yourself to the present.', author: 'Marcus Aurelius' },
  { text: 'If it is not right, do not do it; if it is not true, do not say it.', author: 'Marcus Aurelius' },
  { text: 'Never let the future disturb you. You will meet it with the same weapons of reason which today arm you against the present.', author: 'Marcus Aurelius' },
  { text: 'Begin at once to live, and count each separate day as a separate life.', author: 'Seneca' },
  { text: 'We suffer more often in imagination than in reality.', author: 'Seneca' },
  { text: 'It is not that we have a short time to live, but that we waste a lot of it.', author: 'Seneca' },
  { text: 'Difficulties strengthen the mind, as labour does the body.', author: 'Seneca' },
  { text: 'Luck is what happens when preparation meets opportunity.', author: 'Seneca' },
  { text: 'He who is brave is free.', author: 'Seneca' },
  { text: 'As long as you live, keep learning how to live.', author: 'Seneca' },
  { text: 'No man is free who is not master of himself.', author: 'Epictetus' },
  { text: 'It is impossible for a man to learn what he thinks he already knows.', author: 'Epictetus' },
  { text: 'First say to yourself what you would be; and then do what you have to do.', author: 'Epictetus' },
  { text: 'Men are disturbed not by things, but by the views which they take of things.', author: 'Epictetus' },
  { text: 'Don’t explain your philosophy. Embody it.', author: 'Epictetus' },
  { text: 'Make the best use of what is in your power, and take the rest as it happens.', author: 'Epictetus' },
  { text: 'The unexamined life is not worth living.', author: 'Socrates' },
  { text: 'The secret of change is to focus all of your energy not on fighting the old, but on building the new.', author: 'Socrates' },
  { text: 'He who is not contented with what he has, would not be contented with what he would like to have.', author: 'Socrates' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Will Durant, on Aristotle' },
  { text: 'Knowing yourself is the beginning of all wisdom.', author: 'Aristotle' },
  { text: 'Patience is bitter, but its fruit is sweet.', author: 'Aristotle' },
  { text: 'The energy of the mind is the essence of life.', author: 'Aristotle' },
  { text: 'The first and greatest victory is to conquer yourself.', author: 'Plato' },
  { text: 'The beginning is the most important part of the work.', author: 'Plato' },
  { text: 'Courage is knowing what not to fear.', author: 'Plato' },
  { text: 'No man ever steps in the same river twice.', author: 'Heraclitus' },
  { text: 'Character is destiny.', author: 'Heraclitus' },
  { text: 'The sun is new each day.', author: 'Heraclitus' },
  { text: 'The foundation of every state is the education of its youth.', author: 'Diogenes' },
  { text: 'It is not the man who has too little, but the man who craves more, that is poor.', author: 'Seneca' },
  { text: 'Well begun is half done.', author: 'Greek proverb' },
  { text: 'Nothing in excess.', author: 'Delphic maxim' },
  { text: 'Know thyself.', author: 'Delphic maxim' },
  { text: 'The greatest wealth is to live content with little.', author: 'Plato' },
  { text: 'Wonder is the beginning of wisdom.', author: 'Socrates' },
  { text: 'Victorious warriors win first and then go to war.', author: 'Sun Tzu' },
  { text: 'In the midst of chaos, there is also opportunity.', author: 'Sun Tzu' },
  { text: 'A journey of a thousand miles begins with a single step.', author: 'Lao Tzu' },
  { text: 'He who conquers others is strong; he who conquers himself is mighty.', author: 'Lao Tzu' },
  { text: 'Nature does not hurry, yet everything is accomplished.', author: 'Lao Tzu' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'The man who moves a mountain begins by carrying away small stones.', author: 'Confucius' },
  { text: 'Our life is what our thoughts make it.', author: 'Marcus Aurelius' },
  { text: 'Fall seven times, stand up eight.', author: 'Japanese proverb' },
  { text: 'What we achieve inwardly will change outer reality.', author: 'Plutarch' },
  { text: 'Fortune favours the bold.', author: 'Virgil' },
  { text: 'While we are postponing, life speeds by.', author: 'Seneca' },
]

// Deterministic per calendar day: the same date always yields the same quote,
// so it stays put through re-renders and reloads and only turns over at
// midnight.
export function quoteForDate(dateISO) {
  let hash = 0
  for (let index = 0; index < dateISO.length; index++) {
    hash = (hash * 31 + dateISO.charCodeAt(index)) >>> 0
  }
  return QUOTES[hash % QUOTES.length]
}
