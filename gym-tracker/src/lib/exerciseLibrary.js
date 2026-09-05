// Extended per-exercise reference content: a longer written guide plus
// start/end position photos, shown from the "+ More info" library sheet.
// Sparse by design for photos — an entry can have a `guide` with no
// `images` yet, and the sheet falls back to just the short cue when an
// id has no entry at all here.

function imagesFor(id) {
  const base = import.meta.env.BASE_URL
  return {
    start: `${base}exercises/${id}-start.webp`,
    end: `${base}exercises/${id}-end.webp`,
  }
}

export const EXERCISE_LIBRARY = {
  // ---------------------------------------------------------------------
  // CHEST
  // ---------------------------------------------------------------------
  'barbell-bench-press': {
    guide: {
      overview: 'The benchmark upper-body pressing movement — a flat barbell press that builds raw chest, shoulder, and triceps strength.',
      setup: [
        'Lie on the bench with eyes roughly under the bar, feet flat on the floor.',
        'Grip just outside shoulder width, retract the shoulder blades and pin them to the bench, and unrack.',
      ],
      execution: [
        'Lower the bar under control to mid-chest, elbows at roughly a 45-75° angle to the torso.',
        'Drive the bar back up in a slight arc toward the shoulders, pushing the feet into the floor for stability.',
      ],
      mistakes: [
        'Flaring the elbows to 90°, which stresses the shoulder joint.',
        'Losing the shoulder blade retraction partway through the set.',
        'Bouncing the bar off the chest instead of controlling the descent.',
      ],
      primaryMuscles: ['Chest (pectoralis major)'],
      secondaryMuscles: ['Front deltoid', 'Triceps'],
    },
  },
  'incline-barbell-bench-press': {
    guide: {
      overview: 'A bench press performed on an incline to shift more of the load onto the upper chest and front delts.',
      setup: [
        'Set the bench to a 30-45° incline.',
        'Grip just outside shoulder width, retract the shoulder blades, and unrack.',
      ],
      execution: [
        'Lower the bar to the upper chest, elbows around 45° to the torso.',
        'Drive up and slightly back, following the incline\'s natural bar path.',
      ],
      mistakes: [
        'Setting the incline too steep, which turns it into more of a shoulder press.',
        'Letting the bar drift toward the neck instead of the upper chest.',
        'Losing the arch and shoulder blade retraction under heavier loads.',
      ],
      primaryMuscles: ['Upper chest (clavicular pec major)'],
      secondaryMuscles: ['Front deltoid', 'Triceps'],
    },
  },
  'decline-barbell-bench-press': {
    guide: {
      overview: 'A bench press on a decline bench that shifts emphasis toward the lower chest.',
      setup: [
        'Secure the legs/feet under the pads on a decline bench.',
        'Grip just outside shoulder width and unrack with control.',
      ],
      execution: [
        'Lower the bar to the lower chest, keeping the shoulder blades pinned throughout.',
        'Press back up along the same path.',
      ],
      mistakes: [
        'Bouncing the bar off the chest since the shorter range tempts a faster tempo.',
        'Letting the elbows flare wide.',
        'Not securing the legs properly before unracking.',
      ],
      primaryMuscles: ['Lower chest (sternal pec major)'],
      secondaryMuscles: ['Front deltoid', 'Triceps'],
    },
  },
  'close-grip-barbell-bench-press': {
    guide: {
      overview: 'A bench press with a narrower grip that shifts more of the work onto the triceps while still training the chest.',
      setup: [
        'Grip just inside shoulder width — narrow enough to bias the triceps, not so narrow it strains the wrists.',
        'Retract the shoulder blades and unrack.',
      ],
      execution: [
        'Keep the elbows tucked close to the body throughout the descent.',
        'Press back up, focusing on triceps lockout at the top.',
      ],
      mistakes: [
        'Gripping so narrow that the wrists bend backward under load.',
        'Letting the elbows flare out, which turns it back into a regular bench press.',
        'Flaring the elbows out at lockout instead of driving straight up.',
      ],
      primaryMuscles: ['Triceps'],
      secondaryMuscles: ['Chest (pectoralis major)', 'Front deltoid'],
    },
  },
  'smith-machine-bench-press': {
    guide: {
      overview: 'A bench press on a guided Smith machine bar, removing the balance demand of a free-weight press.',
      setup: [
        'Position the bench so the bar path lines up with mid-chest.',
        'Grip just outside shoulder width and unrack by rotating the bar out of the hooks.',
      ],
      execution: [
        'Lower the bar to mid-chest with the shoulder blades pinned back.',
        'Press back up along the machine\'s fixed vertical path.',
      ],
      mistakes: [
        'Positioning the bench wrong so the bar path doesn\'t match natural shoulder mechanics.',
        'Letting the shoulders roll forward at the bottom since the machine removes the stabilizing demand.',
        'Bouncing off the chest since the fixed path feels "safer" than it is.',
      ],
      primaryMuscles: ['Chest (pectoralis major)'],
      secondaryMuscles: ['Front deltoid', 'Triceps'],
    },
  },
  'dumbbell-bench-press': {
    guide: {
      overview: 'A bench press with dumbbells instead of a barbell, allowing a deeper stretch and independent arm paths.',
      setup: [
        'Sit on the bench with a dumbbell on each thigh, then lie back, using the thighs to help kick them up into position.',
        'Start with the dumbbells at chest level, palms facing forward.',
      ],
      execution: [
        'Lower the dumbbells until a full stretch is felt across the chest, letting them travel slightly inward at the top.',
        'Press back up without letting the dumbbells drift too far apart or clank together.',
      ],
      mistakes: [
        'Lowering so far the shoulders round forward at the bottom.',
        'Pressing unevenly, letting one arm lead.',
        'Flaring the elbows to a full 90°.',
      ],
      primaryMuscles: ['Chest (pectoralis major)'],
      secondaryMuscles: ['Front deltoid', 'Triceps'],
    },
  },
  'incline-dumbbell-press': {
    guide: {
      overview: 'A dumbbell press on an incline bench, biasing the upper chest with the extra range dumbbells allow.',
      setup: [
        'Set the bench to a 30-45° incline and get the dumbbells up to chest level.',
        'Start with palms facing forward, elbows under the wrists.',
      ],
      execution: [
        'Press up and slightly back, controlling the stretch at the bottom on the way down.',
        'Avoid locking out so hard the shoulders round forward at the top.',
      ],
      mistakes: [
        'Setting the incline too steep, shifting the work to the front delts.',
        'Rushing the eccentric and losing the stretch benefit dumbbells offer.',
        'Letting the elbows flare to 90°.',
      ],
      primaryMuscles: ['Upper chest (clavicular pec major)'],
      secondaryMuscles: ['Front deltoid', 'Triceps'],
    },
  },
  'decline-dumbbell-press': {
    guide: {
      overview: 'A dumbbell press on a decline bench, emphasizing the lower chest.',
      setup: [
        'Secure the legs on a decline bench and bring the dumbbells to chest level.',
        'Keep the wrists stacked directly over the elbows.',
      ],
      execution: [
        'Lower under control, feeling a stretch across the lower chest.',
        'Press back up along the same path.',
      ],
      mistakes: [
        'Letting the wrists drift behind the elbows, straining the wrist joint.',
        'Rushing the descent since the range feels shorter.',
        'Not securing the legs before starting.',
      ],
      primaryMuscles: ['Lower chest (sternal pec major)'],
      secondaryMuscles: ['Front deltoid', 'Triceps'],
    },
  },
  'dumbbell-fly': {
    guide: {
      overview: 'A chest isolation move that stretches and squeezes the pecs through a wide arcing motion, with no elbow-extension component.',
      setup: [
        'Lie on a flat bench with a dumbbell in each hand, arms extended above the chest, palms facing each other.',
        'Keep a slight, fixed bend in the elbows throughout.',
      ],
      execution: [
        'Lower the dumbbells out to the sides in a wide arc until a stretch is felt across the chest.',
        'Bring them back together over the chest, squeezing at the top rather than just moving the arms.',
      ],
      mistakes: [
        'Bending the elbows more as the set gets harder, turning it into a press.',
        'Lowering so far the shoulder joint is put under unnecessary strain.',
        'Using too much weight and losing control of the stretch.',
      ],
      primaryMuscles: ['Chest (pectoralis major)'],
      secondaryMuscles: ['Front deltoid'],
    },
  },
  'incline-dumbbell-fly': {
    guide: {
      overview: 'A dumbbell fly performed on an incline bench to bias the upper chest.',
      setup: [
        'Set the bench to a 30-45° incline, dumbbells extended above the chest with a slight elbow bend.',
      ],
      execution: [
        'Lower in a wide arc until a stretch is felt across the upper chest.',
        'Bring the dumbbells back together, squeezing the chest at the top.',
      ],
      mistakes: [
        'Setting the incline too steep, which shifts the stretch toward the front delts.',
        'Bending the elbows progressively more as fatigue sets in.',
        'Rushing the stretch position at the bottom.',
      ],
      primaryMuscles: ['Upper chest (clavicular pec major)'],
      secondaryMuscles: ['Front deltoid'],
    },
  },
  'cable-fly': {
    guide: {
      overview: 'A chest fly done on a cable crossover machine, keeping constant tension through the whole range unlike a dumbbell fly.',
      setup: [
        'Set both pulleys to chest height and grab a handle in each hand.',
        'Step forward slightly to create tension, staggered stance for stability.',
      ],
      execution: [
        'Bring the handles together in front of the chest in a wide arc, leaning slightly forward.',
        'Squeeze the chest at the finish rather than just moving the arms, then return under control.',
      ],
      mistakes: [
        'Standing too far back, slackening the cable at the start of the stretch.',
        'Turning it into a press by bending the elbows more over the set.',
        'Rushing the return and losing tension.',
      ],
      primaryMuscles: ['Chest (pectoralis major)'],
      secondaryMuscles: ['Front deltoid'],
    },
  },
  'high-to-low-cable-fly': {
    guide: {
      overview: 'A cable fly from a high pulley position, pulling down and across to bias the lower chest.',
      setup: [
        'Set both pulleys above head height and grab a handle in each hand.',
        'Step forward to create tension, staggered stance.',
      ],
      execution: [
        'Pull down and across toward the opposite hip in an arcing motion.',
        'Squeeze at the bottom, then return under control to the stretch position.',
      ],
      mistakes: [
        'Bending the elbows more as the set fatigues, turning it into a press.',
        'Using too much weight and relying on body momentum.',
        'Stopping the return short instead of feeling the full stretch at the top.',
      ],
      primaryMuscles: ['Lower chest (sternal pec major)'],
      secondaryMuscles: ['Front deltoid'],
    },
  },
  'cable-crossover': {
    guide: {
      overview: 'A standing cable fly variation performed low-to-high or across the midline, finishing with the hands crossing past the body\'s centerline for a full chest squeeze.',
      setup: [
        'Set both pulleys to roughly chest height, grab a handle in each hand, and step forward to create tension.',
      ],
      execution: [
        'Pull the handles down and across the body, crossing the hands past the midline at the finish.',
        'Squeeze the chest at the crossover point, then return under control.',
      ],
      mistakes: [
        'Not crossing the hands past the midline, cutting the range short.',
        'Using momentum instead of a controlled squeeze.',
        'Standing too far forward or back, losing tension somewhere in the range.',
      ],
      primaryMuscles: ['Chest (pectoralis major)'],
      secondaryMuscles: ['Front deltoid'],
    },
  },
  'machine-chest-press': {
    guide: {
      overview: 'A chest press on a fixed-path machine — a reliable, joint-friendly way to load the chest without the stabilization demands of free weights.',
      setup: [
        'Set the seat height so the handles line up with mid-chest.',
        'Grip the handles with the elbows at roughly 45-75° to the torso.',
      ],
      execution: [
        'Press the handles forward without flaring the elbows too high.',
        'Return under control, feeling a stretch across the chest at the back position.',
      ],
      mistakes: [
        'Setting the seat too high or low, misaligning the press path with the shoulders.',
        'Flaring the elbows to 90°.',
        'Letting the weight stack slam down between reps.',
      ],
      primaryMuscles: ['Chest (pectoralis major)'],
      secondaryMuscles: ['Front deltoid', 'Triceps'],
    },
  },
  'incline-machine-press': {
    guide: {
      overview: 'A machine chest press set at an incline angle to bias the upper chest.',
      setup: [
        'Set the seat so the handles align with the upper chest.',
      ],
      execution: [
        'Press forward and slightly up, following the machine\'s fixed path.',
        'Return under control, feeling the stretch at the back position.',
      ],
      mistakes: [
        'Misaligning the seat height so the handles don\'t match the upper chest.',
        'Rushing the eccentric.',
        'Flaring the elbows too high.',
      ],
      primaryMuscles: ['Upper chest (clavicular pec major)'],
      secondaryMuscles: ['Front deltoid', 'Triceps'],
    },
  },
  'band-chest-fly': {
    guide: {
      overview: 'A chest fly using a resistance band anchored behind the body — a portable, joint-friendly alternative to cables.',
      setup: [
        'Anchor the band behind you at roughly chest height, one handle in each hand.',
        'Step forward to create tension, arms extended in front of the chest.',
      ],
      execution: [
        'Open the arms out to the sides in a wide arc, feeling a stretch across the chest.',
        'Bring the hands back together, squeezing the chest at the finish, and control the return.',
      ],
      mistakes: [
        'Anchoring the band too high or low, misaligning the resistance angle.',
        'Rushing the return and losing tension.',
        'Using momentum instead of a controlled squeeze.',
      ],
      primaryMuscles: ['Chest (pectoralis major)'],
      secondaryMuscles: ['Front deltoid'],
    },
  },
  'pec-deck': {
    guide: {
      overview: 'A seated machine fly that isolates the chest through a fixed arcing path.',
      setup: [
        'Set the seat so the handles/pads are at chest height, arms resting against the pads.',
      ],
      execution: [
        'Bring the arms together in front of the chest, squeezing without shrugging the shoulders.',
        'Return under control, feeling a light stretch at the back.',
      ],
      mistakes: [
        'Shrugging the shoulders up toward the ears as the arms come together.',
        'Letting the weight stack slam down on the return.',
        'Using a seat height that misaligns the pads with the chest.',
      ],
      primaryMuscles: ['Chest (pectoralis major)'],
      secondaryMuscles: ['Front deltoid'],
    },
  },
  'push-up': {
    guide: {
      overview: 'The classic bodyweight chest press — trains the chest, shoulders, and triceps with no equipment needed.',
      setup: [
        'Hands slightly wider than shoulder width, body in a straight line from head to heels.',
      ],
      execution: [
        'Lower the chest toward the floor with elbows at about 45° from the body.',
        'Press back up to a fully extended, but not locked-out-and-sagging, position.',
      ],
      mistakes: [
        'Letting the hips sag or pike up instead of holding a straight line.',
        'Flaring the elbows to 90°.',
        'Only lowering partway instead of using the full range.',
      ],
      primaryMuscles: ['Chest (pectoralis major)'],
      secondaryMuscles: ['Front deltoid', 'Triceps', 'Core'],
    },
  },
  'incline-push-up': {
    guide: {
      overview: 'A push-up with the hands elevated on a bench or box, reducing the bodyweight load — a good regression for building toward a standard push-up.',
      setup: [
        'Hands on an elevated surface, slightly wider than shoulder width, body in a straight line.',
      ],
      execution: [
        'Lower the chest toward the elevated surface, elbows at about 45°.',
        'Press back up while keeping the body straight.',
      ],
      mistakes: [
        'Letting the hips sag.',
        'Using a surface so high the exercise becomes too easy to be useful.',
        'Flaring the elbows out to 90°.',
      ],
      primaryMuscles: ['Chest (pectoralis major)'],
      secondaryMuscles: ['Front deltoid', 'Triceps', 'Core'],
    },
  },
  'decline-push-up': {
    guide: {
      overview: 'A push-up with the feet elevated, increasing the bodyweight load and biasing the upper chest.',
      setup: [
        'Feet on an elevated surface, hands on the floor slightly wider than shoulder width.',
      ],
      execution: [
        'Lower the chest toward the floor, bracing the core so the hips don\'t sag.',
        'Press back up to a straight-body position.',
      ],
      mistakes: [
        'Letting the hips sag as fatigue sets in.',
        'Using a surface so high it strains the shoulders excessively.',
        'Flaring the elbows out to 90°.',
      ],
      primaryMuscles: ['Upper chest (clavicular pec major)'],
      secondaryMuscles: ['Front deltoid', 'Triceps', 'Core'],
    },
  },
  'diamond-push-up': {
    guide: {
      overview: 'A push-up with the hands close together under the chest, shifting most of the work onto the triceps.',
      setup: [
        'Hands together under the chest, thumbs and index fingers forming a diamond shape.',
      ],
      execution: [
        'Lower the chest toward the hands, elbows staying close to the body.',
        'Press back up focusing on triceps lockout.',
      ],
      mistakes: [
        'Letting the elbows flare out, which reduces the triceps emphasis.',
        'Letting the hips sag.',
        'Placing the hands so close the wrists are strained.',
      ],
      primaryMuscles: ['Triceps'],
      secondaryMuscles: ['Chest (pectoralis major)', 'Front deltoid'],
    },
  },
  'chest-dip': {
    guide: {
      overview: 'A dip performed leaning forward to bias the chest over the triceps — a demanding bodyweight (or weighted) chest builder.',
      setup: [
        'Grip the parallel bars, support the body with arms extended, and lean the torso forward.',
      ],
      execution: [
        'Lower under control, letting the elbows flare slightly to target the chest.',
        'Press back up to the starting position without losing the forward lean.',
      ],
      mistakes: [
        'Staying too upright, which shifts the emphasis to the triceps instead.',
        'Descending so deep the front of the shoulder is strained.',
        'Using momentum/bouncing at the bottom.',
      ],
      primaryMuscles: ['Chest (pectoralis major)'],
      secondaryMuscles: ['Front deltoid', 'Triceps'],
    },
  },
  'landmine-press': {
    guide: {
      overview: 'A single-arm press using a barbell anchored in a landmine attachment, pressing along a natural diagonal arc that\'s gentle on the shoulders.',
      setup: [
        'Load one end of a barbell into a landmine attachment; hold the loaded end at shoulder height with one hand.',
        'Stagger the stance and brace the core.',
      ],
      execution: [
        'Press up and slightly forward along the bar\'s natural arc.',
        'Lower back to the shoulder under control.',
      ],
      mistakes: [
        'Letting the torso twist to help drive the weight up.',
        'Pressing straight up instead of following the natural forward arc.',
        'Not bracing the core, letting the low back arch excessively.',
      ],
      primaryMuscles: ['Chest (pectoralis major)', 'Front deltoid'],
      secondaryMuscles: ['Triceps', 'Core'],
    },
  },
  'svend-press': {
    guide: {
      overview: 'A chest-squeeze isolation exercise pressing two plates together in front of the body — light weight, high chest activation.',
      setup: [
        'Hold two weight plates together with flat palms in front of the chest.',
      ],
      execution: [
        'Squeeze the plates together hard and press straight out from the chest.',
        'Bring back to the chest under control without losing the squeeze.',
      ],
      mistakes: [
        'Letting the squeeze on the plates relax mid-rep, losing chest tension.',
        'Using too much weight, which makes it impossible to keep the plates pressed together.',
        'Pressing in an arc instead of straight out.',
      ],
      primaryMuscles: ['Chest (pectoralis major)'],
      secondaryMuscles: ['Front deltoid', 'Triceps'],
    },
  },

  // ---------------------------------------------------------------------
  // BACK
  // ---------------------------------------------------------------------
  deadlift: {
    guide: {
      overview: 'The full-body hinge movement — pulling a loaded barbell off the floor to hip level. One of the best overall strength builders there is.',
      setup: [
        'Stand with the bar over mid-foot, shins close to the bar.',
        'Hinge down and grip just outside the legs, chest up, back flat, hips higher than the knees but lower than the shoulders.',
      ],
      execution: [
        'Push the floor away through the whole foot, keeping the bar close to the shins as it rises.',
        'Stand fully upright at the top, then reverse the pattern to lower it back down under control.',
      ],
      mistakes: [
        'Letting the bar drift away from the body, turning it into a bent-over row from the floor.',
        'Rounding the lower back at the start of the pull.',
        'Hyperextending the back at lockout instead of just standing tall.',
      ],
      primaryMuscles: ['Hamstrings', 'Glutes', 'Lower back'],
      secondaryMuscles: ['Lats', 'Traps', 'Forearms'],
    },
  },
  'sumo-deadlift': {
    guide: {
      overview: 'A deadlift variation with a wide stance and hands inside the knees, shifting emphasis toward the quads and inner thighs with a more upright torso.',
      setup: [
        'Wide stance, toes turned out, shins close to the bar.',
        'Grip inside the knees, knees pushed out over the toes, chest tall.',
      ],
      execution: [
        'Drive the floor apart with the feet while standing up, keeping the bar path vertical and close to the body.',
        'Lower back down under control, hips leading the way down.',
      ],
      mistakes: [
        'Letting the knees cave inward during the pull.',
        'Starting with the hips too low, turning it into a squat.',
        'Rounding the upper back.',
      ],
      primaryMuscles: ['Quads', 'Glutes', 'Adductors'],
      secondaryMuscles: ['Hamstrings', 'Lower back', 'Traps'],
    },
  },
  'rack-pull': {
    guide: {
      overview: 'A partial deadlift starting from pins set at knee height or above, overloading the top portion of the pull with heavier weight than a full deadlift.',
      setup: [
        'Set the pins so the bar starts around knee height.',
        'Grip and set the back flat, same as a normal deadlift starting position.',
      ],
      execution: [
        'Drive the hips forward hard to lock out at the top.',
        'Lower back to the pins under control — don\'t just drop it.',
      ],
      mistakes: [
        'Setting the pins so high the exercise becomes just a shrug.',
        'Using the reduced range as an excuse to round the back.',
        'Yanking the bar off the pins instead of driving through the legs first.',
      ],
      primaryMuscles: ['Lower back', 'Glutes'],
      secondaryMuscles: ['Traps', 'Forearms', 'Hamstrings'],
    },
  },
  'deficit-deadlift': {
    guide: {
      overview: 'A deadlift performed standing on a small platform, increasing the range of motion off the floor.',
      setup: [
        'Stand on a plate or low platform (1-2 inches), bar over mid-foot.',
        'Set up as a normal deadlift, keeping the back flat despite the extra depth.',
      ],
      execution: [
        'Pull the same way as a standard deadlift, just from a lower starting position.',
        'Stand fully upright, then lower back to the platform under control.',
      ],
      mistakes: [
        'Using a deficit so large the back rounds at the start.',
        'Rushing the setup and starting with the hips out of position.',
        'Letting the bar drift forward off the shins.',
      ],
      primaryMuscles: ['Hamstrings', 'Glutes', 'Lower back'],
      secondaryMuscles: ['Lats', 'Traps', 'Forearms'],
    },
  },
  'good-morning': {
    guide: {
      overview: 'A barbell hip hinge with the bar on the back, loading the hamstrings and lower back through a bent-over position.',
      setup: [
        'Bar on the upper back as in a squat, feet shoulder-width, soft knee bend.',
      ],
      execution: [
        'Hinge at the hips, pushing them back while keeping the back flat, until the torso is roughly parallel to the floor.',
        'Drive the hips forward to return to standing.',
      ],
      mistakes: [
        'Rounding the back as the torso lowers.',
        'Bending the knees more instead of hinging at the hips.',
        'Using too much weight before the hinge pattern is solid.',
      ],
      primaryMuscles: ['Hamstrings', 'Lower back'],
      secondaryMuscles: ['Glutes'],
    },
  },
  'barbell-row': {
    guide: {
      overview: 'A bent-over barbell row that builds overall back thickness by pulling the bar to the torso from a hinged position.',
      setup: [
        'Hinge forward to roughly 45°, knees soft, back flat, bar hanging at arm\'s length.',
      ],
      execution: [
        'Pull the bar to the lower ribs, leading with the elbows, without using momentum from the legs or back.',
        'Lower back to a full stretch under control.',
      ],
      mistakes: [
        'Standing too upright, which turns it into a shrug.',
        'Using body momentum (heaving the torso) to move the weight.',
        'Rounding the lower back under load.',
      ],
      primaryMuscles: ['Lats', 'Mid-back'],
      secondaryMuscles: ['Rear deltoid', 'Biceps'],
    },
  },
  'pendlay-row': {
    guide: {
      overview: 'A strict barbell row where each rep starts from a dead stop on the floor, removing momentum and demanding an explosive pull.',
      setup: [
        'Hinge forward until the torso is roughly parallel to the floor, bar on the floor beneath the shoulders.',
      ],
      execution: [
        'Pull the bar explosively from the floor to the lower ribs.',
        'Return the bar fully to the floor between every rep — no bouncing.',
      ],
      mistakes: [
        'Letting the torso rise up during the pull instead of staying parallel to the floor.',
        'Resting on the floor long enough to lose tension in the back.',
        'Yanking with the arms before the back initiates the pull.',
      ],
      primaryMuscles: ['Lats', 'Mid-back'],
      secondaryMuscles: ['Rear deltoid', 'Biceps'],
    },
  },
  't-bar-row': {
    guide: {
      overview: 'A chest-supported or hinged row using a landmine-style bar, allowing heavy loading with a neutral grip.',
      setup: [
        'Straddle the bar or use a chest-support pad, grip the handles, hinge or lean into the pad.',
      ],
      execution: [
        'Pull the bar to the torso, elbows back, squeezing the shoulder blades together.',
        'Lower under control to a full stretch.',
      ],
      mistakes: [
        'Using momentum from the hips to heave the weight up.',
        'Not squeezing the shoulder blades at the top of the pull.',
        'Rounding the back if hinged rather than chest-supported.',
      ],
      primaryMuscles: ['Lats', 'Mid-back'],
      secondaryMuscles: ['Rear deltoid', 'Biceps'],
    },
  },
  'chest-supported-row': {
    guide: {
      overview: 'A row performed with the chest braced against a pad, removing lower-back involvement and isolating the pulling muscles.',
      setup: [
        'Chest against the pad, grip the handles with arms extended.',
      ],
      execution: [
        'Pull the handles to the torso without shrugging, squeezing the shoulder blades together.',
        'Extend back out under control.',
      ],
      mistakes: [
        'Shrugging the shoulders up to move the weight instead of pulling with the back.',
        'Lifting the chest off the pad to cheat the weight up.',
        'Using a partial range of motion.',
      ],
      primaryMuscles: ['Lats', 'Mid-back'],
      secondaryMuscles: ['Rear deltoid', 'Biceps'],
    },
  },
  'meadows-row': {
    guide: {
      overview: 'A single-arm landmine row performed from a split stance, letting the shoulder blade drive a long range of motion.',
      setup: [
        'Load one end of a barbell in a landmine, stand alongside it in a split stance, grip near the sleeve.',
      ],
      execution: [
        'Pull up and back, letting the shoulder blade retract and drive the movement.',
        'Lower to a full stretch under control.',
      ],
      mistakes: [
        'Twisting the torso to help move the weight.',
        'Using a stance that doesn\'t allow a full range of motion.',
        'Yanking with the arm instead of leading with the shoulder blade.',
      ],
      primaryMuscles: ['Lats', 'Mid-back'],
      secondaryMuscles: ['Rear deltoid', 'Biceps'],
    },
  },
  'one-arm-dumbbell-row': {
    guide: {
      overview: 'A single-arm row bracing on a bench, allowing a long stretch and a strong contraction with less lower-back demand than a bent-over barbell row.',
      setup: [
        'Knee and hand braced on the bench, other foot on the floor, back flat and roughly parallel to the floor.',
      ],
      execution: [
        'Pull the dumbbell up, elbow passing back past the ribs.',
        'Lower to a full stretch under control.',
      ],
      mistakes: [
        'Twisting the torso to help heave the weight up.',
        'Not achieving a full stretch at the bottom.',
        'Shrugging the shoulder instead of driving the elbow back.',
      ],
      primaryMuscles: ['Lats', 'Mid-back'],
      secondaryMuscles: ['Rear deltoid', 'Biceps'],
    },
  },
  'kettlebell-row': {
    guide: {
      overview: 'A single-arm row with a kettlebell, using the same hinge-and-pull pattern as a dumbbell row.',
      setup: [
        'Hinge forward, back flat, kettlebell hanging at arm\'s length.',
      ],
      execution: [
        'Pull the elbow straight back to the torso.',
        'Lower under control to a full stretch.',
      ],
      mistakes: [
        'Rounding the back under load.',
        'Using momentum from the hips instead of the back.',
        'Letting the torso rotate toward the working side.',
      ],
      primaryMuscles: ['Lats', 'Mid-back'],
      secondaryMuscles: ['Rear deltoid', 'Biceps'],
    },
  },
  'seated-cable-row': {
    guide: {
      overview: 'A cable row performed seated, building back thickness with constant tension through the whole range.',
      setup: [
        'Sit tall with feet braced, knees slightly bent, grip the handle with arms extended.',
      ],
      execution: [
        'Pull the handle to the torso, keeping the back upright, avoiding rounding at the bottom.',
        'Extend back out under control to a full stretch.',
      ],
      mistakes: [
        'Rounding the lower back to reach further at the stretch position.',
        'Using the torso to heave the weight (leaning back excessively at the top).',
        'Shrugging the shoulders instead of pulling with the back.',
      ],
      primaryMuscles: ['Lats', 'Mid-back'],
      secondaryMuscles: ['Rear deltoid', 'Biceps'],
    },
  },
  'wide-grip-cable-row': {
    guide: {
      overview: 'A seated cable row with a wide grip and flared elbows, shifting emphasis toward the upper back and rear delts.',
      setup: [
        'Sit tall, grip a wide bar attachment, arms extended.',
      ],
      execution: [
        'Pull to the upper abs with the elbows flared out to the sides, squeezing the shoulder blades together.',
        'Extend back out under control.',
      ],
      mistakes: [
        'Rounding the lower back to reach further at the stretch.',
        'Letting the elbows drop instead of staying flared.',
        'Using momentum instead of a controlled pull.',
      ],
      primaryMuscles: ['Upper back', 'Rear deltoid'],
      secondaryMuscles: ['Lats', 'Biceps'],
    },
  },
  'machine-row': {
    guide: {
      overview: 'A row on a fixed-path machine, usually chest-supported, for building back thickness with minimal technique demands.',
      setup: [
        'Chest against the pad (if supported) or seated with feet braced, grip the handles.',
      ],
      execution: [
        'Pull the handles to the torso without jerking, squeezing the shoulder blades together.',
        'Extend back out under control.',
      ],
      mistakes: [
        'Jerking the torso to move the weight.',
        'Using a partial range of motion.',
        'Shrugging instead of pulling with the back.',
      ],
      primaryMuscles: ['Lats', 'Mid-back'],
      secondaryMuscles: ['Rear deltoid', 'Biceps'],
    },
  },
  'inverted-row': {
    guide: {
      overview: 'A bodyweight row pulling the chest up to a bar set at hip height while the body hangs at an angle — a great bodyweight back builder.',
      setup: [
        'Bar set at roughly hip height, lie underneath it, grip it and hang with a straight body line, heels on the floor.',
      ],
      execution: [
        'Pull the chest to the bar, keeping the body straight throughout.',
        'Lower under control to full arm extension.',
      ],
      mistakes: [
        'Letting the hips sag instead of holding a straight line.',
        'Using a bar height that makes the exercise too easy or too hard to complete with good form.',
        'Not pulling the chest all the way to the bar.',
      ],
      primaryMuscles: ['Lats', 'Mid-back'],
      secondaryMuscles: ['Rear deltoid', 'Biceps', 'Core'],
    },
  },
  'lat-pulldown': {
    guide: {
      overview: 'A cable pulldown that trains the same pulling pattern as a pull-up, with adjustable resistance for building toward one.',
      setup: [
        'Sit with thighs secured under the pad, grip the bar slightly wider than shoulder width.',
      ],
      execution: [
        'Pull the bar to the upper chest, leading with the elbows, avoiding leaning back too far.',
        'Extend back up under control to a full stretch.',
      ],
      mistakes: [
        'Leaning back excessively to use body momentum.',
        'Pulling the bar behind the neck, which strains the shoulder joint.',
        'Using a partial range of motion.',
      ],
      primaryMuscles: ['Lats'],
      secondaryMuscles: ['Mid-back', 'Biceps'],
    },
  },
  'wide-grip-lat-pulldown': {
    guide: {
      overview: 'A lat pulldown with a wider grip, emphasizing the outer lats.',
      setup: [
        'Sit with thighs secured, grip the bar well outside shoulder width.',
      ],
      execution: [
        'Pull the elbows down and slightly back, bar toward the upper chest.',
        'Extend back up to a full stretch under control.',
      ],
      mistakes: [
        'Gripping so wide the range of motion shortens significantly.',
        'Leaning back excessively.',
        'Using momentum instead of a controlled pull.',
      ],
      primaryMuscles: ['Lats'],
      secondaryMuscles: ['Mid-back', 'Biceps'],
    },
  },
  'close-grip-lat-pulldown': {
    guide: {
      overview: 'A lat pulldown with a close, often neutral, grip that allows a longer range of motion and more biceps involvement.',
      setup: [
        'Sit with thighs secured, grip a close/neutral handle attachment.',
      ],
      execution: [
        'Pull to the chest, letting the elbows travel close to the torso.',
        'Extend back up to a full stretch under control.',
      ],
      mistakes: [
        'Leaning back excessively to use momentum.',
        'Not achieving a full stretch at the top.',
        'Letting the elbows flare out to the sides.',
      ],
      primaryMuscles: ['Lats'],
      secondaryMuscles: ['Biceps', 'Mid-back'],
    },
  },
  'single-arm-lat-pulldown': {
    guide: {
      overview: 'A lat pulldown performed one arm at a time, letting each side work through its full, unassisted range.',
      setup: [
        'Sit facing the machine (or side-on depending on the setup), grip a single handle.',
      ],
      execution: [
        'Pull the elbow down and back without twisting the torso.',
        'Extend back up to a full stretch under control.',
      ],
      mistakes: [
        'Twisting the torso to help move the weight.',
        'Leaning away from the working side.',
        'Using momentum instead of a controlled pull.',
      ],
      primaryMuscles: ['Lats'],
      secondaryMuscles: ['Mid-back', 'Biceps'],
    },
  },
  'straight-arm-pulldown': {
    guide: {
      overview: 'A lat isolation move pulling a bar down with straight arms, removing the biceps from the movement almost entirely.',
      setup: [
        'Stand facing a high pulley, grip a bar or rope with arms extended overhead.',
      ],
      execution: [
        'Keeping the arms nearly straight, pull the bar down to the thighs using the lats.',
        'Return under control to the starting position.',
      ],
      mistakes: [
        'Bending the elbows to turn it into a pushdown.',
        'Using body momentum to swing the bar down.',
        'Not feeling the lats initiate the movement.',
      ],
      primaryMuscles: ['Lats'],
      secondaryMuscles: ['Triceps (long head)'],
    },
  },
  'pull-up': {
    guide: {
      overview: 'The classic bodyweight vertical pull — one of the best overall back and grip builders there is.',
      setup: [
        'Grip the bar slightly wider than shoulder width, hang with arms fully extended.',
      ],
      execution: [
        'Pull the chest toward the bar, driving the elbows down.',
        'Lower back to a full-arm-extension hang under control.',
      ],
      mistakes: [
        'Using momentum/kipping unless that\'s specifically the intent.',
        'Only completing half the range of motion.',
        'Not achieving a dead hang at the bottom.',
      ],
      primaryMuscles: ['Lats'],
      secondaryMuscles: ['Mid-back', 'Biceps', 'Forearms'],
    },
  },
  'weighted-pull-up': {
    guide: {
      overview: 'A pull-up performed with additional weight (belt, vest, or dumbbell) once bodyweight reps are no longer challenging.',
      setup: [
        'Attach the added weight securely, grip the bar, hang with arms fully extended.',
      ],
      execution: [
        'Pull the chest toward the bar with the same strict form as a bodyweight rep.',
        'Lower under control to a full hang — avoid swinging the added load.',
      ],
      mistakes: [
        'Adding weight before bodyweight form is solid.',
        'Letting the added load swing and pull the body off-balance.',
        'Shortening the range of motion to handle more weight.',
      ],
      primaryMuscles: ['Lats'],
      secondaryMuscles: ['Mid-back', 'Biceps', 'Forearms'],
    },
  },
  'chin-up': {
    guide: {
      overview: 'A pull-up performed with an underhand grip, shifting more of the work onto the biceps.',
      setup: [
        'Underhand grip, roughly shoulder width, hang with arms fully extended.',
      ],
      execution: [
        'Pull the chest to the bar under control.',
        'Lower to a full hang before the next rep.',
      ],
      mistakes: [
        'Using momentum instead of a controlled pull.',
        'Only completing a partial range of motion.',
        'Gripping too wide, which reduces the biceps involvement chin-ups are meant to add.',
      ],
      primaryMuscles: ['Lats', 'Biceps'],
      secondaryMuscles: ['Mid-back', 'Forearms'],
    },
  },
  'neutral-grip-pull-up': {
    guide: {
      overview: 'A pull-up using parallel handles, a grip position that\'s often more comfortable on the shoulders and wrists.',
      setup: [
        'Grip parallel handles, palms facing each other, hang with arms fully extended.',
      ],
      execution: [
        'Pull the elbows down and back, chest toward the handles.',
        'Lower to a full hang under control.',
      ],
      mistakes: [
        'Using momentum instead of a controlled pull.',
        'Not achieving a full hang between reps.',
        'Shrugging the shoulders up instead of driving the elbows down.',
      ],
      primaryMuscles: ['Lats'],
      secondaryMuscles: ['Mid-back', 'Biceps'],
    },
  },
  'assisted-pull-up': {
    guide: {
      overview: 'A pull-up performed on a machine that counterbalances part of the bodyweight, useful for building toward an unassisted rep.',
      setup: [
        'Kneel or stand on the assistance platform/pad, grip the bar, set the assistance level.',
      ],
      execution: [
        'Pull the chest toward the bar through the full range.',
        'Lower under control to a full hang.',
      ],
      mistakes: [
        'Using more assistance than needed, which slows progress toward an unassisted pull-up.',
        'Bouncing off the assistance pad at the bottom.',
        'Only completing a partial range of motion.',
      ],
      primaryMuscles: ['Lats'],
      secondaryMuscles: ['Mid-back', 'Biceps'],
    },
  },
  'face-pull': {
    guide: {
      overview: 'A cable pull to face level that targets the rear delts and upper back — a staple for shoulder health and posture.',
      setup: [
        'Set a rope attachment at roughly face height, grip with both hands, step back to create tension.',
      ],
      execution: [
        'Pull the rope to eye level, leading with the elbows high, squeezing the rear delts and upper back.',
        'Return under control to a full stretch.',
      ],
      mistakes: [
        'Pulling low toward the chest instead of high toward the face.',
        'Using too much weight, sacrificing the squeeze at the finish.',
        'Letting the elbows drop instead of staying high through the pull.',
      ],
      primaryMuscles: ['Rear deltoid'],
      secondaryMuscles: ['Mid-back', 'Rotator cuff'],
    },
  },
  'band-face-pull': {
    guide: {
      overview: 'A face pull performed with a resistance band — a portable version of the same rear-delt and upper-back exercise.',
      setup: [
        'Anchor the band at roughly face height, grip both ends, step back to create tension.',
      ],
      execution: [
        'Pull high toward the face, leading with the elbows, squeezing the rear delts and upper back.',
        'Return under control to a full stretch.',
      ],
      mistakes: [
        'Pulling low instead of high.',
        'Standing too close, losing tension at the stretch position.',
        'Rushing the squeeze at the finish.',
      ],
      primaryMuscles: ['Rear deltoid'],
      secondaryMuscles: ['Mid-back', 'Rotator cuff'],
    },
  },
  'band-pulldown': {
    guide: {
      overview: 'A lat pulldown pattern using a band anchored overhead — a portable substitute for a cable machine.',
      setup: [
        'Anchor the band overhead, grip with both hands, kneel or stand facing the anchor.',
      ],
      execution: [
        'Pull the band down and back, squeezing the lats at the bottom.',
        'Return under control to full arm extension.',
      ],
      mistakes: [
        'Leaning back excessively to use body momentum.',
        'Using an anchor point too low to allow a proper pulling angle.',
        'Rushing the return and losing tension.',
      ],
      primaryMuscles: ['Lats'],
      secondaryMuscles: ['Mid-back', 'Biceps'],
    },
  },
  'back-extension': {
    guide: {
      overview: 'A hip-hinge exercise on a bench or GHD that trains the lower back and glutes through a controlled range of motion.',
      setup: [
        'Hips positioned at the pad\'s edge, legs secured, torso hanging down.',
      ],
      execution: [
        'Hinge up at the hips until the body forms a straight line, avoiding hyperextending at the top.',
        'Lower back down under control.',
      ],
      mistakes: [
        'Hyperextending the lower back at the top instead of stopping at a straight line.',
        'Using momentum to snap up instead of a controlled hip hinge.',
        'Rounding the back at the bottom of the range.',
      ],
      primaryMuscles: ['Lower back'],
      secondaryMuscles: ['Glutes', 'Hamstrings'],
    },
  },
  'weighted-back-extension': {
    guide: {
      overview: 'A back extension performed holding extra weight (a plate or dumbbell) once bodyweight reps are no longer challenging.',
      setup: [
        'Hips at the pad\'s edge, legs secured, weight held at the chest.',
      ],
      execution: [
        'Hinge up to a straight-body position, same pattern as the bodyweight version.',
        'Lower under control through the extra load.',
      ],
      mistakes: [
        'Hyperextending the lower back at the top.',
        'Adding weight before the bodyweight version is controlled and pain-free.',
        'Using momentum instead of a controlled hinge.',
      ],
      primaryMuscles: ['Lower back'],
      secondaryMuscles: ['Glutes', 'Hamstrings'],
    },
  },

  // ---------------------------------------------------------------------
  // SHOULDERS
  // ---------------------------------------------------------------------
  'overhead-press': {
    guide: {
      overview: 'A standing barbell press overhead — a core strength movement for the shoulders and triceps.',
      setup: [
        'Bar racked at shoulder height, grip just outside shoulder width, elbows slightly in front of the bar.',
        'Brace the core hard before unracking.',
      ],
      execution: [
        'Press straight up, tucking the chin slightly to let the bar pass, then pushing the head through at the top.',
        'Lower back to the shoulders under control.',
      ],
      mistakes: [
        'Leaning back excessively to help drive the bar up.',
        'Pressing the bar forward in an arc instead of straight up.',
        'Not bracing the core, letting the lower back arch.',
      ],
      primaryMuscles: ['Front deltoid'],
      secondaryMuscles: ['Triceps', 'Upper chest'],
    },
  },
  'seated-barbell-overhead-press': {
    guide: {
      overview: 'An overhead press performed seated with back support, removing leg drive and isolating the shoulders and triceps.',
      setup: [
        'Sit with back against a support, bar at shoulder height, grip just outside shoulder width.',
      ],
      execution: [
        'Press straight overhead without over-arching the lower back.',
        'Lower back to the shoulders under control.',
      ],
      mistakes: [
        'Arching the lower back excessively off the support.',
        'Pressing in an arc instead of a straight vertical path.',
        'Using a grip too wide, cutting the pressing range short.',
      ],
      primaryMuscles: ['Front deltoid'],
      secondaryMuscles: ['Triceps', 'Upper chest'],
    },
  },
  'push-press': {
    guide: {
      overview: 'An overhead press that uses a small leg drive to help move heavier weight than a strict press allows.',
      setup: [
        'Bar racked at shoulder height, grip just outside shoulder width, feet shoulder-width.',
      ],
      execution: [
        'Dip the knees slightly, then drive up explosively through the legs as the arms press the bar overhead.',
        'Lower back to the shoulders under control, resetting the dip position for the next rep.',
      ],
      mistakes: [
        'Turning the dip into a squat instead of a short, quick dip.',
        'Relying entirely on the legs with no arm press contribution.',
        'Losing the brace and leaning back excessively.',
      ],
      primaryMuscles: ['Front deltoid'],
      secondaryMuscles: ['Triceps', 'Quads', 'Upper chest'],
    },
  },
  'smith-machine-shoulder-press': {
    guide: {
      overview: 'An overhead press on a guided Smith machine bar, removing the balance demand of a free-weight press.',
      setup: [
        'Set the bench/seat so the bar starts at shoulder height, grip just outside shoulder width.',
      ],
      execution: [
        'Press straight up without shrugging the shoulders to help move the weight.',
        'Lower back to the shoulders under control.',
      ],
      mistakes: [
        'Shrugging the traps to help move the bar instead of pressing with the shoulders.',
        'Setting the seat too high or low, misaligning the press path.',
        'Rushing the descent.',
      ],
      primaryMuscles: ['Front deltoid'],
      secondaryMuscles: ['Triceps', 'Upper chest'],
    },
  },
  'dumbbell-shoulder-press': {
    guide: {
      overview: 'An overhead press with dumbbells, allowing a more natural pressing arc and independent arm paths than a barbell.',
      setup: [
        'Dumbbells at shoulder height, palms facing forward or slightly angled in.',
      ],
      execution: [
        'Press up and slightly in, avoiding flaring the elbows too far back.',
        'Lower back to the shoulders under control.',
      ],
      mistakes: [
        'Flaring the elbows straight out to the sides, straining the shoulder joint.',
        'Arching the lower back excessively to help press the weight up.',
        'Pressing unevenly, letting one arm lead.',
      ],
      primaryMuscles: ['Front deltoid'],
      secondaryMuscles: ['Triceps', 'Upper chest'],
    },
  },
  'seated-dumbbell-shoulder-press': {
    guide: {
      overview: 'A dumbbell shoulder press performed seated with back support, removing leg drive and lower-back compensation.',
      setup: [
        'Sit with back supported, dumbbells at shoulder height.',
      ],
      execution: [
        'Press up without arching the lower back off the support.',
        'Lower under control to shoulder height.',
      ],
      mistakes: [
        'Arching the lower back excessively.',
        'Flaring the elbows too far back.',
        'Pressing unevenly.',
      ],
      primaryMuscles: ['Front deltoid'],
      secondaryMuscles: ['Triceps', 'Upper chest'],
    },
  },
  'arnold-press': {
    guide: {
      overview: 'A dumbbell shoulder press that adds a rotation through the bottom portion, engaging the shoulder through a fuller range.',
      setup: [
        'Start with dumbbells at shoulder height, palms facing the body.',
      ],
      execution: [
        'Rotate the palms outward as you press up, finishing with palms facing forward at the top.',
        'Reverse the rotation on the way back down.',
      ],
      mistakes: [
        'Rushing the rotation instead of syncing it with the press.',
        'Flaring the elbows too far back at the top.',
        'Using too much weight before the rotation pattern feels smooth.',
      ],
      primaryMuscles: ['Front deltoid'],
      secondaryMuscles: ['Lateral deltoid', 'Triceps'],
    },
  },
  'machine-shoulder-press': {
    guide: {
      overview: 'An overhead press on a fixed-path machine, useful for isolating the shoulders without stabilization demands.',
      setup: [
        'Set the seat so the handles start at shoulder height.',
      ],
      execution: [
        'Press up along the machine\'s fixed path.',
        'Return under control to shoulder height.',
      ],
      mistakes: [
        'Setting the seat height wrong, misaligning the press path with the shoulders.',
        'Shrugging instead of pressing with the shoulders.',
        'Using a partial range of motion.',
      ],
      primaryMuscles: ['Front deltoid'],
      secondaryMuscles: ['Triceps', 'Upper chest'],
    },
  },
  'landmine-shoulder-press': {
    guide: {
      overview: 'A single-arm overhead press using a landmine-anchored barbell, pressing along a shoulder-friendly diagonal path.',
      setup: [
        'Load one end of a barbell into a landmine attachment, hold the loaded end at shoulder height.',
      ],
      execution: [
        'Press up and slightly across the body, bracing the core throughout.',
        'Lower back to the shoulder under control.',
      ],
      mistakes: [
        'Letting the torso twist to help drive the weight up.',
        'Not bracing the core, causing the low back to arch.',
        'Pressing straight up instead of following the bar\'s natural arc.',
      ],
      primaryMuscles: ['Front deltoid'],
      secondaryMuscles: ['Triceps', 'Core'],
    },
  },
  'lateral-raise': {
    guide: {
      overview: 'The classic dumbbell side-delt isolation move — raising the arms out to the sides to build shoulder width.',
      setup: [
        'Stand with a dumbbell in each hand at the sides, slight bend in the elbows.',
      ],
      execution: [
        'Raise the arms out to the sides, leading with the elbows, up to about shoulder height.',
        'Lower under control, avoiding using momentum to swing the weight up.',
      ],
      mistakes: [
        'Using momentum/body swing instead of raising with the shoulder.',
        'Raising past shoulder height, which shifts load onto the traps.',
        'Leading with the hands/wrists instead of the elbows.',
      ],
      primaryMuscles: ['Lateral deltoid'],
      secondaryMuscles: ['Front deltoid', 'Trapezius'],
    },
  },
  'leaning-cable-lateral-raise': {
    guide: {
      overview: 'A cable lateral raise performed leaning away from the machine, loading the side delt through its full range including the bottom of the movement.',
      setup: [
        'Set the pulley low, grip the handle in the far hand, lean away from the machine holding onto the frame for support.',
      ],
      execution: [
        'Raise the arm out to the side, leading with the elbow, to about shoulder height.',
        'Lower under control, feeling the stretch increase as the lean loads the bottom of the range.',
      ],
      mistakes: [
        'Not leaning far enough to actually load the bottom of the range.',
        'Using momentum/body swing to raise the weight.',
        'Raising past shoulder height.',
      ],
      primaryMuscles: ['Lateral deltoid'],
      secondaryMuscles: ['Front deltoid', 'Trapezius'],
    },
  },
  'machine-lateral-raise': {
    guide: {
      overview: 'A side-delt raise on a fixed-path machine, useful for isolating the movement without needing to stabilize free weight.',
      setup: [
        'Set the seat so the pads align with the upper arms just below the elbow.',
      ],
      execution: [
        'Raise the arms out to the sides, leading with the elbows, not by shrugging the traps.',
        'Lower under control.',
      ],
      mistakes: [
        'Shrugging the traps up to help move the weight.',
        'Setting the seat height wrong, misaligning the pads.',
        'Using a partial range of motion.',
      ],
      primaryMuscles: ['Lateral deltoid'],
      secondaryMuscles: ['Trapezius'],
    },
  },
  'band-lateral-raise': {
    guide: {
      overview: 'A lateral raise using a resistance band anchored underfoot — a portable version of the classic dumbbell exercise.',
      setup: [
        'Stand on the band, grip the handle at the side with a slight elbow bend.',
      ],
      execution: [
        'Raise the arm out to the side, leading with the elbow, to about shoulder height.',
        'Lower under control, avoiding shrugging.',
      ],
      mistakes: [
        'Shrugging the shoulder up instead of raising with the elbow.',
        'Using momentum instead of a controlled raise.',
        'Raising past shoulder height.',
      ],
      primaryMuscles: ['Lateral deltoid'],
      secondaryMuscles: ['Front deltoid', 'Trapezius'],
    },
  },
  'front-raise': {
    guide: {
      overview: 'A dumbbell isolation move raising the arms in front of the body to target the front delts.',
      setup: [
        'Stand with a dumbbell in each hand in front of the thighs, slight elbow bend.',
      ],
      execution: [
        'Raise one or both arms in front of the body to about shoulder height.',
        'Lower under control, avoiding swinging the torso for momentum.',
      ],
      mistakes: [
        'Swinging the torso to help move the weight.',
        'Raising above shoulder height.',
        'Using so much weight the shoulders shrug to compensate.',
      ],
      primaryMuscles: ['Front deltoid'],
      secondaryMuscles: ['Upper chest'],
    },
  },
  'cable-front-raise': {
    guide: {
      overview: 'A front raise on a low cable pulley, keeping constant tension on the front delt through the whole range.',
      setup: [
        'Set the pulley low, grip the handle with one hand, stand facing away from the machine.',
      ],
      execution: [
        'Raise the arm in front of the body to shoulder height without leaning back.',
        'Lower under control against the cable\'s pull.',
      ],
      mistakes: [
        'Leaning back to help swing the weight up.',
        'Raising above shoulder height.',
        'Standing too close to the machine, slackening the cable at the bottom.',
      ],
      primaryMuscles: ['Front deltoid'],
      secondaryMuscles: ['Upper chest'],
    },
  },
  'rear-delt-fly': {
    guide: {
      overview: 'A bent-over dumbbell raise targeting the rear delts — a key exercise for shoulder balance and posture.',
      setup: [
        'Hinge forward at the hips, dumbbells hanging below the shoulders, slight elbow bend.',
      ],
      execution: [
        'Raise the arms out to the sides, leading with the elbows, squeezing the rear delts at the top.',
        'Lower under control.',
      ],
      mistakes: [
        'Standing too upright instead of hinged forward.',
        'Using momentum/body swing to raise the weight.',
        'Shrugging the traps instead of isolating the rear delts.',
      ],
      primaryMuscles: ['Rear deltoid'],
      secondaryMuscles: ['Mid-back'],
    },
  },
  'band-rear-delt-fly': {
    guide: {
      overview: 'A rear delt fly using a resistance band, hinged forward like the dumbbell version.',
      setup: [
        'Anchor the band in front at chest height, hinge forward, grip a handle in each hand.',
      ],
      execution: [
        'Raise the arms out to the sides, squeezing the rear delts at the finish.',
        'Return under control.',
      ],
      mistakes: [
        'Standing too upright instead of hinged forward.',
        'Using momentum instead of a controlled raise.',
        'Not squeezing the rear delts at the finish.',
      ],
      primaryMuscles: ['Rear deltoid'],
      secondaryMuscles: ['Mid-back'],
    },
  },
  'upright-row': {
    guide: {
      overview: 'A vertical pull of a barbell from the thighs to chest height, targeting the side delts and traps.',
      setup: [
        'Grip the bar with hands close together, arms extended, bar resting against the thighs.',
      ],
      execution: [
        'Pull the bar up to about chest height, leading with the elbows.',
        'Lower under control, stopping short if the shoulders start to pinch.',
      ],
      mistakes: [
        'Pulling above chest height, which increases shoulder impingement risk.',
        'Using a very narrow grip, which increases strain on the shoulder joint.',
        'Swinging the torso to move the weight.',
      ],
      primaryMuscles: ['Lateral deltoid', 'Trapezius'],
      secondaryMuscles: ['Biceps'],
    },
  },
  'cable-upright-row': {
    guide: {
      overview: 'An upright row on a low cable pulley, keeping constant tension through the pull.',
      setup: [
        'Set the pulley low, grip a bar or rope attachment with hands close together.',
      ],
      execution: [
        'Pull up, leading with the elbows, stopping below shoulder height if it pinches.',
        'Lower under control.',
      ],
      mistakes: [
        'Pulling too high, increasing shoulder impingement risk.',
        'Using momentum instead of a controlled pull.',
        'Gripping too narrow, straining the wrists.',
      ],
      primaryMuscles: ['Lateral deltoid', 'Trapezius'],
      secondaryMuscles: ['Biceps'],
    },
  },
  'barbell-shrug': {
    guide: {
      overview: 'A straight-up shrug with a barbell to build the trapezius muscles.',
      setup: [
        'Stand holding the bar at arm\'s length in front of the thighs, shoulder-width grip.',
      ],
      execution: [
        'Shrug the shoulders straight up toward the ears, avoiding rolling them forward or back.',
        'Lower under control to a full stretch.',
      ],
      mistakes: [
        'Rolling the shoulders in a circular motion instead of a straight vertical shrug.',
        'Using momentum from the knees to heave the weight up.',
        'Only using a partial range of motion.',
      ],
      primaryMuscles: ['Trapezius'],
      secondaryMuscles: ['Forearms'],
    },
  },
  'dumbbell-shrug': {
    guide: {
      overview: 'A straight-up shrug with dumbbells at the sides.',
      setup: [
        'Stand holding a dumbbell in each hand at the sides.',
      ],
      execution: [
        'Shrug straight up and squeeze at the top, avoiding rolling the shoulders.',
        'Lower under control to a full stretch.',
      ],
      mistakes: [
        'Rolling the shoulders instead of a straight vertical shrug.',
        'Using momentum to bounce the weight up.',
        'Rushing through without pausing at the top.',
      ],
      primaryMuscles: ['Trapezius'],
      secondaryMuscles: ['Forearms'],
    },
  },
  'cable-shrug': {
    guide: {
      overview: 'A shrug performed on a low cable pulley, keeping constant tension on the traps.',
      setup: [
        'Stand facing away from a low pulley, grip the handle(s) at arm\'s length.',
      ],
      execution: [
        'Shrug straight up and hold briefly at the top.',
        'Lower under control against the cable\'s pull.',
      ],
      mistakes: [
        'Rolling the shoulders instead of a straight vertical shrug.',
        'Rushing through without the top-position hold.',
        'Using momentum instead of a controlled shrug.',
      ],
      primaryMuscles: ['Trapezius'],
      secondaryMuscles: ['Forearms'],
    },
  },
  'cable-rear-delt-fly': {
    guide: {
      overview: 'A rear delt fly performed on crossed cables, keeping constant tension on the rear delts through the full range.',
      setup: [
        'Set two pulleys to roughly chest height, cross the cables, and grip the opposite handle in each hand.',
        'Stand tall in the middle, arms crossed in front of the chest.',
      ],
      execution: [
        'Pull both handles out and back in a wide arc, squeezing the rear delts at the top.',
        'Return under control to the crossed starting position.',
      ],
      mistakes: [
        'Using the arms to curl the handles instead of a wide, straight-arm arc.',
        'Shrugging the traps instead of isolating the rear delts.',
        'Choosing a weight heavy enough to force momentum into the movement.',
      ],
      primaryMuscles: ['Rear deltoid'],
      secondaryMuscles: ['Upper back', 'Trapezius'],
    },
  },

  // ---------------------------------------------------------------------
  // LEGS
  // ---------------------------------------------------------------------
  'back-squat': {
    guide: {
      overview: 'The foundational lower-body strength movement — a barbell squat with the bar across the upper back.',
      setup: [
        'Bar across the upper traps, feet shoulder-width, toes slightly turned out.',
        'Brace the core hard before unracking and stepping back.',
      ],
      execution: [
        'Sit down and back, keeping the chest up, until the hips drop below the knees.',
        'Drive through the whole foot to stand back up.',
      ],
      mistakes: [
        'Letting the knees cave inward on the way up.',
        'Rounding the lower back at the bottom.',
        'Rising onto the toes instead of driving through the whole foot.',
      ],
      primaryMuscles: ['Quads', 'Glutes'],
      secondaryMuscles: ['Hamstrings', 'Lower back', 'Core'],
    },
  },
  'front-squat': {
    guide: {
      overview: 'A squat with the bar racked across the front delts, demanding a more upright torso and biasing the quads.',
      setup: [
        'Bar racked across the front delts, elbows lifted high to create a stable shelf.',
      ],
      execution: [
        'Sit straight down between the hips, keeping the torso upright since the elbows-high position won\'t tolerate leaning forward.',
        'Drive through the whole foot to stand back up.',
      ],
      mistakes: [
        'Letting the elbows drop, which causes the bar to roll off the shoulders.',
        'Leaning forward, which is much harder to recover from than in a back squat.',
        'Letting the knees cave inward.',
      ],
      primaryMuscles: ['Quads'],
      secondaryMuscles: ['Glutes', 'Core'],
    },
  },
  'safety-bar-squat': {
    guide: {
      overview: 'A squat using a specialty bar with shoulder-level handles, letting the torso sit more upright than a standard back squat.',
      setup: [
        'Bar racked across the upper back using the handles, hands resting on the handles (not gripping a straight bar).',
      ],
      execution: [
        'Sit down and back, letting the torso naturally sit more upright than a back squat — don\'t fight it.',
        'Drive through the whole foot to stand back up.',
      ],
      mistakes: [
        'Trying to lean forward like a back squat instead of letting the bar dictate a more upright torso.',
        'Letting the knees cave inward.',
        'Rising onto the toes instead of driving through the whole foot.',
      ],
      primaryMuscles: ['Quads', 'Glutes'],
      secondaryMuscles: ['Hamstrings', 'Core'],
    },
  },
  'box-squat': {
    guide: {
      overview: 'A squat performed sitting back to a box, useful for training the hip hinge pattern and pausing under control at depth.',
      setup: [
        'Set a box or bench behind you at the desired squat depth, bar on the back as in a normal squat.',
      ],
      execution: [
        'Sit back to the box under control, keeping the shins relatively vertical.',
        'Once seated, drive straight back up without relaxing or bouncing off the box.',
      ],
      mistakes: [
        'Relaxing completely on the box, losing tension in the hips.',
        'Bouncing off the box instead of a controlled pause-and-drive.',
        'Using a box height that doesn\'t match the intended squat depth.',
      ],
      primaryMuscles: ['Quads', 'Glutes'],
      secondaryMuscles: ['Hamstrings', 'Core'],
    },
  },
  'zercher-squat': {
    guide: {
      overview: 'A squat holding the bar in the crooks of the elbows, demanding heavy core bracing and an upright torso.',
      setup: [
        'Bar cradled in the crooks of both elbows, held close to the torso.',
      ],
      execution: [
        'Sit down and back while bracing hard against the bar pulling the torso forward.',
        'Drive through the whole foot to stand back up.',
      ],
      mistakes: [
        'Not bracing hard enough, letting the torso fold forward.',
        'Letting the bar drift away from the body.',
        'Using too much weight before the position feels stable.',
      ],
      primaryMuscles: ['Quads', 'Core'],
      secondaryMuscles: ['Glutes', 'Upper back'],
    },
  },
  'hack-squat': {
    guide: {
      overview: 'A squat on an angled machine that supports the back, allowing heavy quad-focused loading with less balance demand.',
      setup: [
        'Shoulders and back against the pads, feet slightly forward on the platform.',
      ],
      execution: [
        'Control the descent until the hips are near full depth.',
        'Drive through the heels to extend back up.',
      ],
      mistakes: [
        'Placing the feet too high or low on the platform, shifting the exercise away from the quads.',
        'Letting the knees cave inward.',
        'Bouncing at the bottom instead of a controlled descent.',
      ],
      primaryMuscles: ['Quads'],
      secondaryMuscles: ['Glutes'],
    },
  },
  'smith-machine-squat': {
    guide: {
      overview: 'A squat on a guided Smith machine bar, useful for isolating the leg drive without the balance demand of a free-weight squat.',
      setup: [
        'Bar across the upper back, feet slightly forward of the bar path.',
      ],
      execution: [
        'Sit down and back, driving through the whole foot.',
        'Extend back up along the machine\'s fixed vertical path.',
      ],
      mistakes: [
        'Positioning the feet directly under the bar, which forces an unnatural path.',
        'Letting the knees cave inward.',
        'Rising onto the toes instead of through the whole foot.',
      ],
      primaryMuscles: ['Quads', 'Glutes'],
      secondaryMuscles: ['Hamstrings'],
    },
  },
  'belt-squat': {
    guide: {
      overview: 'A squat where the load hangs from a belt at the hips rather than on the back, letting the spine stay unloaded.',
      setup: [
        'Attach the load to the belt, stand on the platform with feet shoulder-width.',
      ],
      execution: [
        'Squat straight down since the torso naturally stays upright with the load hanging at the hips.',
        'Drive through the whole foot to stand back up.',
      ],
      mistakes: [
        'Leaning forward unnecessarily since the hanging load doesn\'t require it.',
        'Letting the knees cave inward.',
        'Using a stance too narrow or wide for a comfortable squat pattern.',
      ],
      primaryMuscles: ['Quads', 'Glutes'],
      secondaryMuscles: ['Hamstrings'],
    },
  },
  'goblet-squat': {
    guide: {
      overview: 'A squat holding a single dumbbell or kettlebell at the chest — a great teaching tool for the squat pattern.',
      setup: [
        'Hold the weight vertically at the chest with both hands, feet shoulder-width.',
      ],
      execution: [
        'Sit down between the hips, letting the elbows travel inside the knees at the bottom.',
        'Drive through the whole foot to stand back up.',
      ],
      mistakes: [
        'Letting the chest collapse forward as the weight gets heavy.',
        'Letting the knees cave inward.',
        'Not reaching full depth.',
      ],
      primaryMuscles: ['Quads', 'Glutes'],
      secondaryMuscles: ['Core'],
    },
  },
  'kettlebell-goblet-squat': {
    guide: {
      overview: 'A goblet squat holding a kettlebell by the horns — the same pattern with a kettlebell\'s grip.',
      setup: [
        'Hold the kettlebell by the horns at the chest, feet shoulder-width.',
      ],
      execution: [
        'Sit down between the hips, elbows inside the knees at the bottom.',
        'Drive through the whole foot to stand back up, chest up throughout.',
      ],
      mistakes: [
        'Letting the chest collapse forward.',
        'Letting the knees cave inward.',
        'Not reaching full depth.',
      ],
      primaryMuscles: ['Quads', 'Glutes'],
      secondaryMuscles: ['Core'],
    },
  },
  'sissy-squat': {
    guide: {
      overview: 'A bodyweight quad-isolation squat where the knees travel far forward and the torso leans back, putting intense stretch and tension on the quads.',
      setup: [
        'Hold onto something stable for balance, or use a sissy squat bench, feet hip-width.',
      ],
      execution: [
        'Let the knees travel forward while leaning the torso back, keeping a straight line from knees to shoulders.',
        'Return to standing by extending through the quads.',
      ],
      mistakes: [
        'Bending at the hips instead of keeping a straight knees-to-shoulders line.',
        'Not controlling the descent.',
        'Using so much assistance from the hands that the quads aren\'t actually working.',
      ],
      primaryMuscles: ['Quads'],
      secondaryMuscles: ['Core'],
    },
  },
  'bulgarian-split-squat': {
    guide: {
      overview: 'A single-leg squat with the rear foot elevated on a bench, demanding balance and heavily loading the front leg.',
      setup: [
        'Rear foot up on a bench behind you, front foot forward enough to keep the knee from traveling too far past the toes.',
      ],
      execution: [
        'Lower straight down, most of the weight on the front foot.',
        'Drive straight back up through the front heel.',
      ],
      mistakes: [
        'Placing the front foot too close to the bench, forcing the knee too far forward.',
        'Letting the front knee cave inward.',
        'Pushing off the rear (trailing) leg to help complete the rep.',
      ],
      primaryMuscles: ['Quads', 'Glutes'],
      secondaryMuscles: ['Hamstrings', 'Core'],
    },
  },
  'walking-lunge': {
    guide: {
      overview: 'A lunge performed stepping continuously forward, combining strength and a balance/coordination demand.',
      setup: [
        'Stand tall, dumbbells at the sides (optional), feet together.',
      ],
      execution: [
        'Step forward, dropping the back knee toward the floor, front shin roughly vertical.',
        'Drive through the front heel to bring the back foot forward into the next step.',
      ],
      mistakes: [
        'Taking too short a step, driving the front knee too far past the toes.',
        'Letting the front knee cave inward.',
        'Leaning the torso too far forward.',
      ],
      primaryMuscles: ['Quads', 'Glutes'],
      secondaryMuscles: ['Hamstrings', 'Core'],
    },
  },
  'reverse-lunge': {
    guide: {
      overview: 'A lunge stepping backward instead of forward, generally easier on the knees than a forward or walking lunge.',
      setup: [
        'Stand tall, feet together, dumbbells at the sides (optional).',
      ],
      execution: [
        'Step back, keeping the front shin close to vertical as the back knee drops toward the floor.',
        'Drive through the front heel to return to standing.',
      ],
      mistakes: [
        'Letting the front knee travel too far forward past the toes.',
        'Leaning the torso too far forward.',
        'Taking a step too short to properly load the front leg.',
      ],
      primaryMuscles: ['Quads', 'Glutes'],
      secondaryMuscles: ['Hamstrings', 'Core'],
    },
  },
  'lateral-lunge': {
    guide: {
      overview: 'A lunge stepping out to the side, training the legs and hips through the frontal plane.',
      setup: [
        'Stand tall, feet together, dumbbells at the sides (optional).',
      ],
      execution: [
        'Step wide to one side, pushing the hips back and bending the stepping leg while keeping the other leg straight.',
        'Push off the bent leg to return to standing.',
      ],
      mistakes: [
        'Letting the bent knee cave inward.',
        'Rounding the back instead of hinging at the hips.',
        'Not keeping the straight leg actually straight.',
      ],
      primaryMuscles: ['Quads', 'Glutes', 'Adductors'],
      secondaryMuscles: ['Hamstrings'],
    },
  },
  'step-up': {
    guide: {
      overview: 'A single-leg movement stepping up onto an elevated platform, building unilateral leg strength.',
      setup: [
        'Stand facing a box or bench at a height that allows a controlled step-up, dumbbells at the sides (optional).',
      ],
      execution: [
        'Drive through the elevated foot to stand fully on the platform.',
        'Step back down under control, avoiding pushing off the trailing leg.',
      ],
      mistakes: [
        'Pushing off the trailing (floor) leg to help complete the rep.',
        'Using a platform so high that form breaks down.',
        'Not standing fully upright at the top before stepping down.',
      ],
      primaryMuscles: ['Quads', 'Glutes'],
      secondaryMuscles: ['Hamstrings', 'Core'],
    },
  },
  'leg-press': {
    guide: {
      overview: 'A machine squat pattern pressing a weighted platform with the legs, allowing heavy loading with the back supported.',
      setup: [
        'Sit in the machine, feet shoulder-width on the platform, back flat against the pad.',
      ],
      execution: [
        'Lower the platform under control until the knees approach the chest, without letting the lower back round off the pad.',
        'Press back up without locking the knees out violently.',
      ],
      mistakes: [
        'Letting the lower back round off the pad at the bottom of the range.',
        'Using a range of motion so deep the hips lift off the seat.',
        'Locking the knees out hard at the top.',
      ],
      primaryMuscles: ['Quads', 'Glutes'],
      secondaryMuscles: ['Hamstrings'],
    },
  },
  'romanian-deadlift': {
    guide: {
      overview: 'A hip-hinge movement lowering a barbell down the legs, one of the best hamstring and glute builders there is.',
      setup: [
        'Hold the bar at arm\'s length in front of the thighs, feet hip-width, soft knee bend.',
      ],
      execution: [
        'Push the hips back, lowering the bar close to the legs until a stretch is felt in the hamstrings.',
        'Drive the hips forward to return to standing.',
      ],
      mistakes: [
        'Bending the knees more instead of hinging at the hips.',
        'Rounding the lower back as the bar lowers.',
        'Lowering so far the back rounds just to add range.',
      ],
      primaryMuscles: ['Hamstrings'],
      secondaryMuscles: ['Glutes', 'Lower back'],
    },
  },
  'dumbbell-romanian-deadlift': {
    guide: {
      overview: 'A Romanian deadlift performed with dumbbells, using the same hip-hinge pattern.',
      setup: [
        'Hold a dumbbell in each hand in front of the thighs, feet hip-width, soft knee bend.',
      ],
      execution: [
        'Push the hips back, keeping the back flat, feeling a stretch in the hamstrings as the dumbbells lower.',
        'Drive the hips forward to return to standing.',
      ],
      mistakes: [
        'Bending the knees more instead of hinging at the hips.',
        'Rounding the lower back.',
        'Letting the dumbbells drift away from the legs.',
      ],
      primaryMuscles: ['Hamstrings'],
      secondaryMuscles: ['Glutes', 'Lower back'],
    },
  },
  'stiff-leg-deadlift': {
    guide: {
      overview: 'A hip hinge with straighter legs than a Romanian deadlift, placing even more emphasis on the hamstrings and lower back.',
      setup: [
        'Hold the bar at arm\'s length, feet hip-width, only a slight knee bend.',
      ],
      execution: [
        'Hinge at the hips, keeping the bar close to the legs throughout.',
        'Drive the hips forward to return to standing.',
      ],
      mistakes: [
        'Rounding the lower back to reach further.',
        'Locking the knees out completely, which strains them.',
        'Letting the bar drift away from the legs.',
      ],
      primaryMuscles: ['Hamstrings', 'Lower back'],
      secondaryMuscles: ['Glutes'],
    },
  },
  'kettlebell-deadlift': {
    guide: {
      overview: 'A hip hinge lifting a kettlebell from the floor — a simple, joint-friendly entry point to the deadlift pattern.',
      setup: [
        'Kettlebell between the feet, hinge down and grip it, back flat, chest up.',
      ],
      execution: [
        'Hinge at the hips to stand up, keeping the bell close to the shins.',
        'Lower back down under control, hips leading the way.',
      ],
      mistakes: [
        'Rounding the back at the start of the pull.',
        'Letting the bell drift forward away from the body.',
        'Squatting the weight up instead of hinging.',
      ],
      primaryMuscles: ['Hamstrings', 'Glutes'],
      secondaryMuscles: ['Lower back'],
    },
  },
  'kettlebell-swing': {
    guide: {
      overview: 'An explosive hip-hinge movement that snaps a kettlebell forward using the hips, not the arms or a squat.',
      setup: [
        'Kettlebell on the floor in front, hinge down and grip it with both hands.',
      ],
      execution: [
        'Hike the bell back between the legs, then snap the hips forward hard to drive it up to chest/shoulder height.',
        'Let the bell swing back down between the legs under control, hinging at the hips again to absorb it.',
      ],
      mistakes: [
        'Squatting the weight instead of hinging — this is a hip movement, not a knee-dominant one.',
        'Using the arms to lift the bell instead of letting the hip snap drive it.',
        'Rounding the back at the bottom of the swing.',
      ],
      primaryMuscles: ['Glutes', 'Hamstrings'],
      secondaryMuscles: ['Core', 'Lower back'],
    },
  },
  'glute-ham-raise': {
    guide: {
      overview: 'A hamstring-focused bodyweight exercise on a GHD machine, curling the body up from a face-down position using the hamstrings.',
      setup: [
        'Feet secured in the machine, body extended and roughly straight, facing the floor.',
      ],
      execution: [
        'Curl the body up using the hamstrings, controlling the descent back down rather than just falling forward.',
        'Reset to a straight-body position for the next rep.',
      ],
      mistakes: [
        'Letting momentum carry the descent instead of controlling it with the hamstrings.',
        'Using the hip flexors to help rather than isolating the hamstring curl.',
        'Stopping the range short of a full curl.',
      ],
      primaryMuscles: ['Hamstrings'],
      secondaryMuscles: ['Glutes'],
    },
  },
  'nordic-curl': {
    guide: {
      overview: 'An intense bodyweight hamstring exercise lowering the torso forward from a kneeling, feet-anchored position.',
      setup: [
        'Kneel with the feet anchored (partner, bar, or machine), torso upright.',
      ],
      execution: [
        'Lower the torso forward as slowly and controlled as possible, resisting with the hamstrings.',
        'Catch yourself with the hands at the bottom if needed, then push back up.',
      ],
      mistakes: [
        'Letting the hips bend, turning it into a fold instead of a straight-body lower.',
        'Dropping too fast instead of controlling the descent.',
        'Attempting full reps before building up eccentric control.',
      ],
      primaryMuscles: ['Hamstrings'],
      secondaryMuscles: ['Glutes'],
    },
  },
  'hip-thrust': {
    guide: {
      overview: 'A glute-focused hip extension with the upper back braced on a bench and a barbell across the hips — one of the best direct glute builders.',
      setup: [
        'Upper back against a bench, barbell across the hips (padded), feet flat, knees bent.',
      ],
      execution: [
        'Drive through the heels, extending the hips up until the torso is roughly parallel to the floor.',
        'Squeeze the glutes hard at the top, chin tucked, then lower under control.',
      ],
      mistakes: [
        'Hyperextending the lower back at the top instead of stopping at a straight hip line.',
        'Pushing through the toes instead of the heels.',
        'Not achieving full hip extension at the top.',
      ],
      primaryMuscles: ['Glutes'],
      secondaryMuscles: ['Hamstrings'],
    },
  },
  'barbell-glute-bridge': {
    guide: {
      overview: 'The same glute-focused hip extension as a hip thrust, performed from the floor instead of with the back braced on a bench.',
      setup: [
        'Lie on the floor, barbell across the hips (padded), knees bent, feet flat.',
      ],
      execution: [
        'Drive through the heels, extending the hips up, squeezing the glutes hard at the top.',
        'Lower under control.',
      ],
      mistakes: [
        'Hyperextending the lower back at the top.',
        'Pushing through the toes instead of the heels.',
        'Rushing the squeeze at the top.',
      ],
      primaryMuscles: ['Glutes'],
      secondaryMuscles: ['Hamstrings'],
    },
  },
  'cable-pull-through': {
    guide: {
      overview: 'A hip-hinge exercise pulling a cable from between the legs, teaching the hip hinge with constant tension and less spinal loading than a deadlift.',
      setup: [
        'Face away from a low pulley, rope between the legs, hinge forward slightly to start.',
      ],
      execution: [
        'Hinge at the hips, letting the cable pull you back, keeping the back flat.',
        'Squeeze the glutes to drive the hips forward and stand back up.',
      ],
      mistakes: [
        'Squatting the weight instead of hinging at the hips.',
        'Rounding the back at the bottom of the hinge.',
        'Using the arms to pull instead of letting the hip hinge move the cable.',
      ],
      primaryMuscles: ['Glutes', 'Hamstrings'],
      secondaryMuscles: ['Lower back'],
    },
  },
  'cable-kickback': {
    guide: {
      overview: 'A single-leg glute isolation move kicking a cable back and up behind the body.',
      setup: [
        'Attach a cuff to the ankle, hinge forward slightly, hold onto the machine for balance.',
      ],
      execution: [
        'Kick the leg back and up, squeezing the glute at the top.',
        'Return under control, avoiding arching the lower back.',
      ],
      mistakes: [
        'Arching the lower back to gain extra range instead of isolating the glute.',
        'Using momentum to swing the leg instead of a controlled squeeze.',
        'Standing too upright, reducing the glute\'s involvement.',
      ],
      primaryMuscles: ['Glutes'],
      secondaryMuscles: ['Hamstrings'],
    },
  },
  'leg-extension': {
    guide: {
      overview: 'A machine quad isolation exercise extending the knees against resistance.',
      setup: [
        'Sit with the pad against the shins, knees at the machine\'s pivot point.',
      ],
      execution: [
        'Extend the knees to squeeze the quads at the top.',
        'Control the descent back down.',
      ],
      mistakes: [
        'Letting the hips lift off the seat to help extend the weight.',
        'Slamming the weight stack down instead of controlling the descent.',
        'Using so much weight the range of motion shortens.',
      ],
      primaryMuscles: ['Quads'],
      secondaryMuscles: [],
    },
  },
  'leg-curl': {
    guide: {
      overview: 'A machine hamstring isolation exercise curling the lower legs against resistance, usually lying face down.',
      setup: [
        'Lie face down, pad against the back of the ankles, knees at the machine\'s pivot point.',
      ],
      execution: [
        'Curl the heels toward the glutes, squeezing the hamstrings at the top.',
        'Control the descent back down, avoiding lifting the hips off the pad.',
      ],
      mistakes: [
        'Lifting the hips off the pad to help move the weight.',
        'Using momentum instead of a controlled curl.',
        'Not achieving a full stretch on the descent.',
      ],
      primaryMuscles: ['Hamstrings'],
      secondaryMuscles: [],
    },
  },
  'seated-leg-curl': {
    guide: {
      overview: 'A hamstring curl performed seated rather than face-down, often allowing a better stretch at the bottom.',
      setup: [
        'Sit with the pad against the back of the lower legs, knees at the machine\'s pivot point.',
      ],
      execution: [
        'Curl the legs down and back, squeezing the hamstrings at the bottom of the arc.',
        'Control the return to a full stretch.',
      ],
      mistakes: [
        'Using momentum instead of a controlled curl.',
        'Not achieving a full stretch on the return.',
        'Letting the hips shift instead of staying seated squarely.',
      ],
      primaryMuscles: ['Hamstrings'],
      secondaryMuscles: [],
    },
  },
  'standing-calf-raise': {
    guide: {
      overview: 'A standing calf isolation exercise, usually on a machine, that trains the gastrocnemius through a full range.',
      setup: [
        'Shoulders under the pads (or hands on a support), balls of the feet on the platform edge.',
      ],
      execution: [
        'Lower the heels for a full stretch at the bottom.',
        'Rise onto the toes and pause briefly at the top before lowering again.',
      ],
      mistakes: [
        'Bouncing at the bottom instead of pausing for a real stretch.',
        'Using a partial range of motion.',
        'Rushing through reps without the top-position pause.',
      ],
      primaryMuscles: ['Calves (gastrocnemius)'],
      secondaryMuscles: [],
    },
  },
  'seated-calf-raise': {
    guide: {
      overview: 'A calf raise performed seated with the knees bent, which biases the soleus muscle underneath the gastrocnemius.',
      setup: [
        'Sit with the pad across the knees, balls of the feet on the platform edge.',
      ],
      execution: [
        'Lower the heels for a full stretch, then rise onto the toes and pause briefly at the top.',
      ],
      mistakes: [
        'Bouncing at the bottom instead of a real stretch.',
        'Using a partial range of motion.',
        'Rushing without pausing at the top.',
      ],
      primaryMuscles: ['Calves (soleus)'],
      secondaryMuscles: [],
    },
  },
  'calf-raise': {
    guide: {
      overview: 'A general calf raise — standing, on a machine, or with a barbell/dumbbells — training the calves through a full range of motion.',
      setup: [
        'Balls of the feet on a raised platform or the floor, standing tall.',
      ],
      execution: [
        'Lower the heels for a full stretch at the bottom.',
        'Rise onto the toes and pause at the top before lowering again.',
      ],
      mistakes: [
        'Bouncing at the bottom instead of pausing for a real stretch.',
        'Using a partial range of motion.',
        'Rushing through without the top pause.',
      ],
      primaryMuscles: ['Calves'],
      secondaryMuscles: [],
    },
  },
  'donkey-calf-raise': {
    guide: {
      overview: 'A calf raise performed hinged forward at the hips, which changes the loading angle on the calves compared to a standing raise.',
      setup: [
        'Hinge forward at the hips, torso roughly parallel to the floor, balls of the feet on a platform.',
      ],
      execution: [
        'Lower the heels for a full stretch at the bottom.',
        'Rise onto the toes and pause at the top.',
      ],
      mistakes: [
        'Losing the hip hinge position and standing up partway through the set.',
        'Bouncing at the bottom instead of pausing for a stretch.',
        'Using a partial range of motion.',
      ],
      primaryMuscles: ['Calves'],
      secondaryMuscles: [],
    },
  },
  'adductor-machine': {
    guide: {
      overview: 'A machine exercise squeezing the legs together against resistance, isolating the inner thighs.',
      setup: [
        'Sit with the pads against the outsides of the knees/thighs, legs spread to the machine\'s start position.',
      ],
      execution: [
        'Squeeze the legs together in a controlled motion.',
        'Return under control, avoiding using momentum.',
      ],
      mistakes: [
        'Using momentum to bounce the weight instead of a controlled squeeze.',
        'Setting the range of motion too aggressively for current flexibility.',
        'Rushing through reps.',
      ],
      primaryMuscles: ['Adductors (inner thigh)'],
      secondaryMuscles: [],
    },
  },
  'abductor-machine': {
    guide: {
      overview: 'A machine exercise pushing the legs apart against resistance, isolating the outer hip muscles.',
      setup: [
        'Sit with the pads against the outsides of the knees/thighs, legs together at the machine\'s start position.',
      ],
      execution: [
        'Push the legs apart in a controlled motion, keeping the torso still.',
        'Return under control.',
      ],
      mistakes: [
        'Using momentum to swing the legs apart.',
        'Leaning the torso to help move the weight.',
        'Rushing through reps.',
      ],
      primaryMuscles: ['Hip abductors (outer glutes)'],
      secondaryMuscles: [],
    },
  },

  // ---------------------------------------------------------------------
  // ARMS
  // ---------------------------------------------------------------------
  'barbell-curl': {
    guide: {
      overview: 'The classic bicep-building exercise, curling a barbell with a shoulder-width grip.',
      setup: [
        'Stand holding the bar at arm\'s length, palms facing forward, elbows at the sides.',
      ],
      execution: [
        'Curl the bar up, keeping the elbows pinned to the sides, avoiding swinging the torso.',
        'Lower under control to a full stretch.',
      ],
      mistakes: [
        'Swinging the torso/using momentum to move the weight.',
        'Letting the elbows drift forward during the curl.',
        'Not achieving a full stretch at the bottom.',
      ],
      primaryMuscles: ['Biceps'],
      secondaryMuscles: ['Forearms'],
    },
  },
  'ez-bar-curl': {
    guide: {
      overview: 'A barbell curl using an angled EZ-bar, often more comfortable on the wrists than a straight bar.',
      setup: [
        'Grip the angled part of the bar, elbows pinned to the sides.',
      ],
      execution: [
        'Curl up without swinging the torso.',
        'Lower under control to a full stretch.',
      ],
      mistakes: [
        'Swinging the torso to help move the weight.',
        'Letting the elbows drift forward.',
        'Using a partial range of motion.',
      ],
      primaryMuscles: ['Biceps'],
      secondaryMuscles: ['Forearms'],
    },
  },
  'dumbbell-curl': {
    guide: {
      overview: 'A bicep curl with dumbbells, allowing independent arm paths and a full range of motion.',
      setup: [
        'Stand holding a dumbbell in each hand, palms facing forward, elbows at the sides.',
      ],
      execution: [
        'Curl up, keeping the elbows pinned in place.',
        'Lower under control to a full stretch at the bottom.',
      ],
      mistakes: [
        'Swinging the torso to help move the weight.',
        'Letting the elbows drift forward.',
        'Rushing the eccentric.',
      ],
      primaryMuscles: ['Biceps'],
      secondaryMuscles: ['Forearms'],
    },
  },
  'alternating-dumbbell-curl': {
    guide: {
      overview: 'A dumbbell curl performed one arm at a time, alternating sides each rep.',
      setup: [
        'Stand holding a dumbbell in each hand, palms facing forward or neutral.',
      ],
      execution: [
        'Curl one arm at a time, keeping the resting arm still at the side.',
        'Lower under control before starting the other arm.',
      ],
      mistakes: [
        'Swinging the resting arm or torso for momentum.',
        'Letting the working elbow drift forward.',
        'Rushing through without a full stretch on each rep.',
      ],
      primaryMuscles: ['Biceps'],
      secondaryMuscles: ['Forearms'],
    },
  },
  'incline-dumbbell-curl': {
    guide: {
      overview: 'A dumbbell curl performed lying back on an incline bench, which increases the stretch on the biceps at the bottom.',
      setup: [
        'Lie back on an incline bench, arms hanging straight down holding the dumbbells.',
      ],
      execution: [
        'Curl up, keeping the elbows pinned by the sides.',
        'Lower slowly, letting the arm hang fully at the bottom for the extra stretch this position offers.',
      ],
      mistakes: [
        'Letting the elbows drift forward off the torso.',
        'Rushing the stretch position at the bottom.',
        'Using so much weight that the shoulders round forward.',
      ],
      primaryMuscles: ['Biceps'],
      secondaryMuscles: ['Forearms'],
    },
  },
  'hammer-curl': {
    guide: {
      overview: 'A dumbbell curl with a neutral (palms-facing-in) grip throughout, emphasizing the brachialis and forearms alongside the biceps.',
      setup: [
        'Stand holding a dumbbell in each hand, palms facing each other.',
      ],
      execution: [
        'Curl up keeping the neutral grip throughout, elbows pinned to the sides.',
        'Lower under control to a full stretch.',
      ],
      mistakes: [
        'Rotating the wrist during the curl instead of staying neutral.',
        'Swinging the torso for momentum.',
        'Letting the elbows drift forward.',
      ],
      primaryMuscles: ['Brachialis', 'Biceps'],
      secondaryMuscles: ['Forearms'],
    },
  },
  'cross-body-hammer-curl': {
    guide: {
      overview: 'A hammer curl bringing the dumbbell across the body toward the opposite shoulder instead of straight up.',
      setup: [
        'Stand holding a dumbbell at the side, palm facing in.',
      ],
      execution: [
        'Curl toward the opposite shoulder, keeping the elbow pinned in place.',
        'Lower under control to the starting position.',
      ],
      mistakes: [
        'Letting the elbow drift away from the body to make the crossing motion.',
        'Swinging the torso for momentum.',
        'Using too much weight to control the diagonal path.',
      ],
      primaryMuscles: ['Brachialis', 'Biceps'],
      secondaryMuscles: ['Forearms'],
    },
  },
  'concentration-curl': {
    guide: {
      overview: 'A seated single-arm curl bracing the elbow against the inner thigh, isolating the bicep with no momentum available.',
      setup: [
        'Sit on a bench, brace the working elbow against the inner thigh, dumbbell hanging at arm\'s length.',
      ],
      execution: [
        'Curl up slowly with strict control, squeezing the bicep at the top.',
        'Lower under control to a full stretch.',
      ],
      mistakes: [
        'Letting the elbow lift off the thigh to cheat the weight up.',
        'Rushing the tempo instead of a slow, controlled curl.',
        'Using too much weight to maintain the strict position.',
      ],
      primaryMuscles: ['Biceps'],
      secondaryMuscles: ['Forearms'],
    },
  },
  'preacher-curl': {
    guide: {
      overview: 'A curl performed with the arm braced against an angled pad, removing shoulder movement and isolating the biceps.',
      setup: [
        'Arms braced on the preacher pad, grip the bar with the armpits at the top edge of the pad.',
      ],
      execution: [
        'Curl up, keeping the upper arms flat against the pad.',
        'Lower under control, avoiding bouncing out of the bottom stretch.',
      ],
      mistakes: [
        'Bouncing out of the bottom position instead of controlling the stretch.',
        'Lifting the upper arms off the pad to cheat the weight up.',
        'Using a partial range of motion.',
      ],
      primaryMuscles: ['Biceps'],
      secondaryMuscles: ['Forearms'],
    },
  },
  'dumbbell-preacher-curl': {
    guide: {
      overview: 'A preacher curl using a single dumbbell, following the same braced-arm pattern.',
      setup: [
        'Arm braced on the preacher pad, dumbbell held at arm\'s length.',
      ],
      execution: [
        'Curl up with control, upper arm flat against the pad.',
        'Lower under control, no bouncing at the bottom.',
      ],
      mistakes: [
        'Bouncing out of the bottom stretch.',
        'Lifting the upper arm off the pad.',
        'Twisting the wrist to cheat the weight up.',
      ],
      primaryMuscles: ['Biceps'],
      secondaryMuscles: ['Forearms'],
    },
  },
  'spider-curl': {
    guide: {
      overview: 'A curl performed leaning chest-first against an incline bench, which removes momentum even more strictly than a preacher curl.',
      setup: [
        'Chest and stomach against a steep incline bench, arms hanging straight down holding the bar.',
      ],
      execution: [
        'Curl up strictly, since the chest-supported position removes any body english.',
        'Lower under control to a full stretch.',
      ],
      mistakes: [
        'Using too much weight since there\'s no way to cheat it up from this position.',
        'Rushing the tempo instead of a controlled curl.',
        'Not achieving a full stretch at the bottom.',
      ],
      primaryMuscles: ['Biceps'],
      secondaryMuscles: ['Forearms'],
    },
  },
  'drag-curl': {
    guide: {
      overview: 'A curl variation dragging the bar up close to the torso, keeping the elbows traveling back rather than forward, which increases biceps tension.',
      setup: [
        'Stand holding the bar at arm\'s length, close grip or shoulder-width.',
      ],
      execution: [
        'Drag the bar up the torso, letting the elbows travel back rather than staying fixed or moving forward.',
        'Lower back down the same path under control.',
      ],
      mistakes: [
        'Letting the elbows move forward instead of back.',
        'Losing contact between the bar and the torso.',
        'Swinging the torso for momentum.',
      ],
      primaryMuscles: ['Biceps'],
      secondaryMuscles: ['Forearms'],
    },
  },
  'zottman-curl': {
    guide: {
      overview: 'A curl that goes up with palms facing up like a normal curl, then rotates to palms-down for the lowering portion, adding forearm work to the descent.',
      setup: [
        'Stand holding a dumbbell in each hand, palms facing forward.',
      ],
      execution: [
        'Curl up with palms facing up as in a normal curl.',
        'At the top, rotate the palms to face down, and lower slowly in that position.',
      ],
      mistakes: [
        'Rotating too early or too late relative to the top of the curl.',
        'Rushing the palms-down descent instead of controlling it.',
        'Using too much weight to control the rotation.',
      ],
      primaryMuscles: ['Biceps', 'Forearms'],
      secondaryMuscles: [],
    },
  },
  'cable-curl': {
    guide: {
      overview: 'A bicep curl on a low cable pulley, keeping constant tension through the whole range unlike a free-weight curl.',
      setup: [
        'Stand facing a low pulley, grip a bar or handle attachment, elbows at the sides.',
      ],
      execution: [
        'Curl up, keeping the elbows pinned to the sides.',
        'Lower under control against the cable\'s pull.',
      ],
      mistakes: [
        'Swinging the torso for momentum.',
        'Letting the elbows drift forward.',
        'Standing too close to the machine, losing tension at the top.',
      ],
      primaryMuscles: ['Biceps'],
      secondaryMuscles: ['Forearms'],
    },
  },
  'cable-hammer-curl': {
    guide: {
      overview: 'A hammer curl performed on a cable with a rope attachment, keeping a neutral grip and constant tension.',
      setup: [
        'Stand facing a low pulley, grip a rope attachment with a neutral grip, elbows at the sides.',
      ],
      execution: [
        'Curl up keeping the neutral grip throughout.',
        'Lower under control against the cable\'s pull.',
      ],
      mistakes: [
        'Rotating the wrists during the curl instead of staying neutral.',
        'Swinging the torso for momentum.',
        'Letting the elbows drift forward.',
      ],
      primaryMuscles: ['Brachialis', 'Biceps'],
      secondaryMuscles: ['Forearms'],
    },
  },
  'kettlebell-curl': {
    guide: {
      overview: 'A bicep curl using kettlebells, following the same pattern as a dumbbell curl.',
      setup: [
        'Stand holding a kettlebell in each hand at the sides.',
      ],
      execution: [
        'Curl up, elbows pinned to the sides.',
        'Control the descent to a full stretch.',
      ],
      mistakes: [
        'Swinging the torso for momentum.',
        'Letting the elbows drift forward.',
        'Rushing the descent.',
      ],
      primaryMuscles: ['Biceps'],
      secondaryMuscles: ['Forearms'],
    },
  },
  'bayesian-curl': {
    guide: {
      overview: 'A cable curl performed facing away from the machine with the cable behind the body, which biases a deep stretch at the bottom of the curl.',
      setup: [
        'Stand facing away from a low pulley, arm extended behind the body, grip the handle.',
      ],
      execution: [
        'Curl up while keeping the elbow back and still, letting the cable position load the stretch.',
        'Lower under control back to the stretched position.',
      ],
      mistakes: [
        'Letting the elbow drift forward, which loses the deep-stretch advantage of this angle.',
        'Using momentum instead of a controlled curl.',
        'Standing so close the stretch position is lost.',
      ],
      primaryMuscles: ['Biceps'],
      secondaryMuscles: ['Forearms'],
    },
  },
  'band-curl': {
    guide: {
      overview: 'A bicep curl using a resistance band anchored underfoot, a portable substitute for a barbell or cable curl.',
      setup: [
        'Stand on the band, grip the handles with elbows at the sides.',
      ],
      execution: [
        'Curl up against the band\'s resistance, keeping the elbows pinned throughout.',
        'Lower under control to a full stretch.',
      ],
      mistakes: [
        'Swinging the torso for momentum.',
        'Letting the elbows drift forward.',
        'Standing on the band unevenly, causing uneven resistance.',
      ],
      primaryMuscles: ['Biceps'],
      secondaryMuscles: ['Forearms'],
    },
  },
  'close-grip-bench-press': {
    guide: {
      overview: 'A bench press variant with a narrow grip, biasing the triceps while still hitting the chest and shoulders.',
      setup: [
        'Grip just inside shoulder width, retract the shoulder blades, unrack.',
      ],
      execution: [
        'Lower the bar with elbows tucked close to the body.',
        'Press back up focusing on triceps lockout.',
      ],
      mistakes: [
        'Letting the elbows flare out, which reduces triceps involvement.',
        'Gripping so narrow the wrists are strained.',
        'Bouncing the bar off the chest.',
      ],
      primaryMuscles: ['Triceps'],
      secondaryMuscles: ['Chest (pectoralis major)', 'Front deltoid'],
    },
  },
  'skull-crusher': {
    guide: {
      overview: 'A lying triceps extension lowering a barbell toward the forehead — a classic triceps mass builder.',
      setup: [
        'Lie on a bench, bar held at arm\'s length above the chest, elbows pointed at the ceiling.',
      ],
      execution: [
        'Lower the bar toward the forehead or just behind it, keeping the elbows fixed in place.',
        'Extend back up through the triceps to full arm extension.',
      ],
      mistakes: [
        'Letting the elbows flare out or drift back during the lower.',
        'Lowering too fast and losing control near the head.',
        'Using so much weight the elbows can\'t stay fixed.',
      ],
      primaryMuscles: ['Triceps'],
      secondaryMuscles: [],
    },
  },
  'dumbbell-skull-crusher': {
    guide: {
      overview: 'A skull crusher performed with dumbbells, allowing a slightly more natural wrist path than a barbell.',
      setup: [
        'Lie on a bench, dumbbells at arm\'s length above the chest, elbows pointed at the ceiling.',
      ],
      execution: [
        'Lower the dumbbells toward the head, elbows fixed in place.',
        'Extend back up through the triceps.',
      ],
      mistakes: [
        'Letting the elbows flare out during the lower.',
        'Losing control of the dumbbells near the head.',
        'Rushing the tempo.',
      ],
      primaryMuscles: ['Triceps'],
      secondaryMuscles: [],
    },
  },
  'overhead-triceps-extension': {
    guide: {
      overview: 'A triceps isolation move extending a weight overhead, loading the long head of the triceps through a deep stretch.',
      setup: [
        'Hold a dumbbell overhead with both hands, elbows pointed forward and close to the head.',
      ],
      execution: [
        'Lower the weight behind the head, keeping the elbows close and still.',
        'Extend back up to full arm extension.',
      ],
      mistakes: [
        'Letting the elbows flare out to the sides.',
        'Arching the lower back to help move the weight.',
        'Using a partial range of motion.',
      ],
      primaryMuscles: ['Triceps'],
      secondaryMuscles: [],
    },
  },
  'cable-overhead-triceps-extension': {
    guide: {
      overview: 'An overhead triceps extension using a cable, keeping constant tension through the movement.',
      setup: [
        'Stand or kneel facing away from a low pulley, rope overhead, elbows fixed near the head.',
      ],
      execution: [
        'Extend through the triceps only, elbows staying fixed overhead.',
        'Return under control against the cable\'s pull.',
      ],
      mistakes: [
        'Letting the elbows flare out or drop.',
        'Using the shoulders to help move the weight.',
        'Standing too close, losing tension at the stretch position.',
      ],
      primaryMuscles: ['Triceps'],
      secondaryMuscles: [],
    },
  },
  'triceps-pushdown': {
    guide: {
      overview: 'A cable triceps isolation move pushing a bar or attachment straight down — a gym staple for building the triceps.',
      setup: [
        'Stand facing a high pulley, grip the attachment, elbows pinned to the sides.',
      ],
      execution: [
        'Extend fully without leaning on the bar or letting the elbows drift forward.',
        'Return under control to a stretch position.',
      ],
      mistakes: [
        'Letting the elbows drift forward away from the torso.',
        'Leaning the body weight into the bar to move more weight.',
        'Using a partial range of motion.',
      ],
      primaryMuscles: ['Triceps'],
      secondaryMuscles: [],
    },
  },
  'rope-triceps-pushdown': {
    guide: {
      overview: 'A triceps pushdown using a rope attachment, allowing the hands to spread apart at the bottom for a fuller squeeze.',
      setup: [
        'Stand facing a high pulley, grip the rope with a neutral grip, elbows pinned to the sides.',
      ],
      execution: [
        'Extend down, spreading the rope apart at the bottom for a full triceps squeeze.',
        'Return under control to a stretch position.',
      ],
      mistakes: [
        'Not spreading the rope apart at the bottom, missing the extra squeeze.',
        'Letting the elbows drift forward.',
        'Leaning on the attachment to move more weight.',
      ],
      primaryMuscles: ['Triceps'],
      secondaryMuscles: [],
    },
  },
  'single-arm-triceps-pushdown': {
    guide: {
      overview: 'A triceps pushdown performed one arm at a time, letting each side work through its own full range.',
      setup: [
        'Stand facing a high pulley, grip a single handle, elbow pinned to the side.',
      ],
      execution: [
        'Extend fully without twisting the torso.',
        'Return under control to a stretch position.',
      ],
      mistakes: [
        'Twisting the torso to help move the weight.',
        'Letting the elbow drift away from the side.',
        'Using a partial range of motion.',
      ],
      primaryMuscles: ['Triceps'],
      secondaryMuscles: [],
    },
  },
  'triceps-kickback': {
    guide: {
      overview: 'A triceps isolation move extending a dumbbell backward from a hinged position.',
      setup: [
        'Hinge forward at the hips, upper arm held parallel to the floor, elbow bent.',
      ],
      execution: [
        'Extend the forearm back until the arm is straight, using only the elbow joint.',
        'Return under control, keeping the upper arm still throughout.',
      ],
      mistakes: [
        'Letting the upper arm drop instead of staying parallel to the floor.',
        'Using momentum/swinging instead of a controlled extension.',
        'Standing too upright, reducing the range of motion.',
      ],
      primaryMuscles: ['Triceps'],
      secondaryMuscles: [],
    },
  },
  'band-triceps-extension': {
    guide: {
      overview: 'A triceps pushdown pattern using a resistance band anchored overhead — a portable substitute for a cable pushdown.',
      setup: [
        'Anchor the band overhead, grip with elbows pinned to the sides.',
      ],
      execution: [
        'Extend fully against the band tension.',
        'Return under control to a stretch position.',
      ],
      mistakes: [
        'Letting the elbows drift forward.',
        'Using body weight/leaning to move the band instead of the triceps.',
        'Using a partial range of motion.',
      ],
      primaryMuscles: ['Triceps'],
      secondaryMuscles: [],
    },
  },
  dip: {
    guide: {
      overview: 'A bodyweight (or weighted) pressing exercise on parallel bars, hitting the chest and triceps depending on body lean.',
      setup: [
        'Grip the parallel bars, support the body with arms extended.',
      ],
      execution: [
        'Lower under control, leaning forward slightly to bias the chest or staying upright to bias the triceps.',
        'Press back up to full arm extension.',
      ],
      mistakes: [
        'Descending so deep the front of the shoulder is strained.',
        'Using momentum/bouncing at the bottom.',
        'Not deciding on a lean and drifting between chest and triceps emphasis mid-set.',
      ],
      primaryMuscles: ['Triceps', 'Chest (pectoralis major)'],
      secondaryMuscles: ['Front deltoid'],
    },
  },
  'bench-dip': {
    guide: {
      overview: 'A dip performed with the hands on a bench behind the body, a more accessible variation than parallel bar dips.',
      setup: [
        'Hands on the bench behind you, legs extended in front, hips just off the bench.',
      ],
      execution: [
        'Lower under control until the elbows reach roughly 90°, avoiding shrugging the shoulders.',
        'Press back up to full arm extension.',
      ],
      mistakes: [
        'Shrugging the shoulders up toward the ears.',
        'Lowering too deep, straining the front of the shoulder.',
        'Letting the hips drift away from the bench instead of staying close.',
      ],
      primaryMuscles: ['Triceps'],
      secondaryMuscles: ['Front deltoid', 'Chest (pectoralis major)'],
    },
  },
  'wrist-curl': {
    guide: {
      overview: 'A forearm isolation exercise curling the wrist upward against resistance.',
      setup: [
        'Sit with the forearms supported on a bench or the thighs, wrists just past the edge, palms up.',
      ],
      execution: [
        'Curl the wrists up through the full range.',
        'Lower under control to a full stretch.',
      ],
      mistakes: [
        'Using the whole forearm/elbow to help move the weight instead of just the wrist.',
        'Using a partial range of motion.',
        'Using too much weight, sacrificing control.',
      ],
      primaryMuscles: ['Forearms (flexors)'],
      secondaryMuscles: [],
    },
  },
  'reverse-wrist-curl': {
    guide: {
      overview: 'A forearm isolation exercise extending the wrist upward with the palms facing down.',
      setup: [
        'Sit with the forearms supported, palms facing down, wrists just past the edge.',
      ],
      execution: [
        'Extend the wrists up against the weight through the full range.',
        'Lower under control to a full stretch.',
      ],
      mistakes: [
        'Moving the whole forearm instead of isolating the wrist.',
        'Using too much weight for this small muscle group.',
        'Using a partial range of motion.',
      ],
      primaryMuscles: ['Forearms (extensors)'],
      secondaryMuscles: [],
    },
  },
  'reverse-curl': {
    guide: {
      overview: 'A curl performed with an overhand grip, shifting emphasis from the biceps toward the forearms and brachialis.',
      setup: [
        'Stand holding the bar with an overhand grip, elbows at the sides.',
      ],
      execution: [
        'Curl up without swinging, since the overhand grip makes this harder to cheat than a standard curl.',
        'Lower under control to a full stretch.',
      ],
      mistakes: [
        'Swinging the torso for momentum.',
        'Using too much weight since this grip is naturally weaker.',
        'Letting the elbows drift forward.',
      ],
      primaryMuscles: ['Forearms', 'Brachialis'],
      secondaryMuscles: ['Biceps'],
    },
  },

  // ---------------------------------------------------------------------
  // CORE
  // ---------------------------------------------------------------------
  plank: {
    guide: {
      overview: 'An isometric core hold on the forearms and toes — builds core bracing endurance with no movement required.',
      setup: [
        'Forearms on the floor, elbows under the shoulders, body in a straight line from head to heels.',
      ],
      execution: [
        'Brace the core and hold the straight-line position, breathing normally.',
        'Don\'t let the hips sag or pike up over time.',
      ],
      mistakes: [
        'Letting the hips sag toward the floor as fatigue sets in.',
        'Piking the hips up to make the hold easier.',
        'Holding the breath instead of breathing normally.',
      ],
      primaryMuscles: ['Core (rectus abdominis, transverse abdominis)'],
      secondaryMuscles: ['Shoulders'],
    },
  },
  'side-plank': {
    guide: {
      overview: 'An isometric core hold on one forearm and the side of the foot, targeting the obliques.',
      setup: [
        'Lie on one side, forearm on the floor under the shoulder, feet stacked.',
      ],
      execution: [
        'Lift the hips up, stacking them directly over each other, holding a straight line from head to feet.',
        'Hold the position, breathing normally.',
      ],
      mistakes: [
        'Letting the hips drop toward the floor.',
        'Rotating the torso forward or backward instead of staying stacked.',
        'Holding the breath.',
      ],
      primaryMuscles: ['Obliques'],
      secondaryMuscles: ['Core', 'Shoulders'],
    },
  },
  'hanging-leg-raise': {
    guide: {
      overview: 'A hanging core exercise raising the straight legs up, a demanding abdominal and hip flexor movement.',
      setup: [
        'Hang from a bar with arms fully extended, legs straight.',
      ],
      execution: [
        'Raise the legs up, curling the pelvis at the top rather than just swinging the legs forward.',
        'Lower under control back to a hang.',
      ],
      mistakes: [
        'Swinging the body to generate momentum instead of using the abs.',
        'Not curling the pelvis, which turns it into a hip-flexor-only movement.',
        'Bending the knees to make it easier without meaning to.',
      ],
      primaryMuscles: ['Core (rectus abdominis)'],
      secondaryMuscles: ['Hip flexors'],
    },
  },
  'hanging-knee-raise': {
    guide: {
      overview: 'A hanging core exercise raising the knees toward the chest, an easier regression of the hanging leg raise.',
      setup: [
        'Hang from a bar with arms fully extended.',
      ],
      execution: [
        'Curl the knees up toward the chest using the abs, not momentum.',
        'Lower under control back to a hang.',
      ],
      mistakes: [
        'Swinging the body to generate momentum.',
        'Only raising the knees a small amount instead of toward the chest.',
        'Using the hip flexors alone without curling the pelvis slightly.',
      ],
      primaryMuscles: ['Core (rectus abdominis)'],
      secondaryMuscles: ['Hip flexors'],
    },
  },
  'toes-to-bar': {
    guide: {
      overview: 'An advanced hanging core exercise bringing the toes all the way up to touch the bar.',
      setup: [
        'Hang from a bar with arms fully extended, a firm grip.',
      ],
      execution: [
        'Drive the toes up to the bar using the abs, controlling the swing rather than relying purely on momentum.',
        'Lower under control back to a hang.',
      ],
      mistakes: [
        'Relying entirely on momentum/kipping instead of ab strength.',
        'Bending the knees excessively instead of keeping the legs relatively straight.',
        'Losing grip control as fatigue sets in.',
      ],
      primaryMuscles: ['Core (rectus abdominis)'],
      secondaryMuscles: ['Hip flexors', 'Forearms'],
    },
  },
  'cable-crunch': {
    guide: {
      overview: 'A kneeling cable crunch loading the abs with external resistance through a spinal-flexion movement.',
      setup: [
        'Kneel facing a high pulley, rope behind the head, hips fixed in place.',
      ],
      execution: [
        'Crunch down by flexing the spine, not the hips — keep the hips still.',
        'Return under control to the starting position.',
      ],
      mistakes: [
        'Moving the hips back to help pull the weight down instead of flexing the spine.',
        'Using the arms/lats to pull instead of the abs.',
        'Using a partial range of motion.',
      ],
      primaryMuscles: ['Core (rectus abdominis)'],
      secondaryMuscles: [],
    },
  },
  'machine-crunch': {
    guide: {
      overview: 'A crunch performed on a fixed-path machine, loading the abs with adjustable resistance.',
      setup: [
        'Sit with the pads against the chest/shoulders, feet secured.',
      ],
      execution: [
        'Crunch through the spine, squeezing the abs at the bottom of the range.',
        'Control the return to the starting position.',
      ],
      mistakes: [
        'Using the arms to pull on the handles instead of the abs.',
        'Using a partial range of motion.',
        'Rushing through reps.',
      ],
      primaryMuscles: ['Core (rectus abdominis)'],
      secondaryMuscles: [],
    },
  },
  'ab-wheel-rollout': {
    guide: {
      overview: 'A demanding core exercise rolling a wheel out from a kneeling position and pulling it back — a serious anti-extension core challenge.',
      setup: [
        'Kneel on the floor holding the ab wheel with both hands.',
      ],
      execution: [
        'Brace hard and roll the wheel forward, only as far as can be controlled back from without the hips sagging.',
        'Pull back to the starting position using the abs.',
      ],
      mistakes: [
        'Rolling out further than can be controlled back from, collapsing the lower back.',
        'Letting the hips sag toward the floor during the rollout.',
        'Using the arms alone instead of bracing the whole core.',
      ],
      primaryMuscles: ['Core (rectus abdominis, transverse abdominis)'],
      secondaryMuscles: ['Lats', 'Shoulders'],
    },
  },
  'sit-up': {
    guide: {
      overview: 'A classic core exercise curling the entire torso up from the floor to a seated position.',
      setup: [
        'Lie on the floor, knees bent, feet flat, hands lightly touching the ears or crossed on the chest.',
      ],
      execution: [
        'Curl up through the spine to a seated position, avoiding yanking with the neck.',
        'Lower back down under control.',
      ],
      mistakes: [
        'Yanking the head/neck to generate momentum.',
        'Using the hip flexors to fling the torso up instead of a controlled curl.',
        'Anchoring the feet under something and using leg drive to cheat the movement.',
      ],
      primaryMuscles: ['Core (rectus abdominis)'],
      secondaryMuscles: ['Hip flexors'],
    },
  },
  'weighted-sit-up': {
    guide: {
      overview: 'A sit-up performed holding extra weight at the chest, once bodyweight reps are no longer challenging.',
      setup: [
        'Lie on the floor, knees bent, feet flat, weight held against the chest.',
      ],
      execution: [
        'Curl up through the spine, controlling the extra load.',
        'Lower back down under control.',
      ],
      mistakes: [
        'Yanking with the neck to generate momentum.',
        'Adding weight before the bodyweight movement is fully controlled.',
        'Using the hip flexors to fling the torso up.',
      ],
      primaryMuscles: ['Core (rectus abdominis)'],
      secondaryMuscles: ['Hip flexors'],
    },
  },
  crunch: {
    guide: {
      overview: 'A short-range core exercise lifting just the shoulder blades off the floor, isolating the upper abs without the hip-flexor involvement of a full sit-up.',
      setup: [
        'Lie on the floor, knees bent, feet flat, hands lightly touching the ears.',
      ],
      execution: [
        'Lift the shoulder blades off the floor using the abs, in a small controlled range.',
        'Lower back down under control.',
      ],
      mistakes: [
        'Yanking the neck/head to generate momentum.',
        'Trying to sit all the way up instead of keeping the range short.',
        'Rushing through reps instead of a controlled squeeze.',
      ],
      primaryMuscles: ['Core (rectus abdominis)'],
      secondaryMuscles: [],
    },
  },
  'bicycle-crunch': {
    guide: {
      overview: 'A rotational core exercise bringing the elbow toward the opposite knee in an alternating cycling motion.',
      setup: [
        'Lie on the floor, hands lightly touching the ears, knees raised with a bend.',
      ],
      execution: [
        'Rotate the shoulder toward the opposite knee, extending the other leg, alternating sides in a controlled motion.',
        'Keep the movement controlled rather than racing through reps.',
      ],
      mistakes: [
        'Yanking the neck with the hands instead of rotating through the torso.',
        'Moving too fast to control, turning it into leg-swinging rather than a true crunch.',
        'Not fully extending the opposite leg.',
      ],
      primaryMuscles: ['Core (rectus abdominis)', 'Obliques'],
      secondaryMuscles: ['Hip flexors'],
    },
  },
  'reverse-crunch': {
    guide: {
      overview: 'A core exercise curling the hips up toward the ribs, targeting the lower portion of the abs.',
      setup: [
        'Lie on the floor, knees bent toward the chest, hands at the sides or under the lower back.',
      ],
      execution: [
        'Curl the hips up toward the ribs using the abs, avoiding swinging the legs.',
        'Lower back down under control.',
      ],
      mistakes: [
        'Swinging the legs to generate momentum instead of curling with the abs.',
        'Using a range of motion so large it becomes a hip-flexor swing.',
        'Rushing through reps.',
      ],
      primaryMuscles: ['Core (lower rectus abdominis)'],
      secondaryMuscles: ['Hip flexors'],
    },
  },
  'decline-sit-up': {
    guide: {
      overview: 'A sit-up performed on a decline bench, increasing the range of motion and difficulty compared to a flat sit-up.',
      setup: [
        'Secure the feet on a decline bench, lie back with knees bent.',
      ],
      execution: [
        'Curl up through the spine to a seated position.',
        'Lower back down under control.',
      ],
      mistakes: [
        'Yanking the neck to generate momentum.',
        'Using too steep a decline before the flat version is controlled.',
        'Rushing the descent instead of a controlled lower.',
      ],
      primaryMuscles: ['Core (rectus abdominis)'],
      secondaryMuscles: ['Hip flexors'],
    },
  },
  'v-up': {
    guide: {
      overview: 'A core exercise folding the body into a V shape, lifting both the torso and legs simultaneously.',
      setup: [
        'Lie flat on the floor, arms extended overhead, legs straight.',
      ],
      execution: [
        'Lift both the torso and legs together, reaching the hands toward the feet.',
        'Lower back down under control without letting the lower back slam the floor.',
      ],
      mistakes: [
        'Only lifting the legs or only the torso instead of both together.',
        'Using momentum to fling both halves up.',
        'Letting the lower back arch excessively at the bottom.',
      ],
      primaryMuscles: ['Core (rectus abdominis)'],
      secondaryMuscles: ['Hip flexors'],
    },
  },
  'russian-twist': {
    guide: {
      overview: 'A rotational core exercise twisting a weight side to side from a seated, torso-leaned-back position.',
      setup: [
        'Sit with knees bent, torso leaned back at roughly 45°, holding a weight with both hands, feet may stay on the floor or lift for extra difficulty.',
      ],
      execution: [
        'Rotate the torso to bring the weight to one side, then the other, keeping the chest up rather than rounding forward.',
        'Control the rotation rather than swinging quickly.',
      ],
      mistakes: [
        'Rounding the upper back forward instead of keeping the chest up.',
        'Rotating so fast that momentum does the work instead of the obliques.',
        'Using so much weight the rotation range shortens dramatically.',
      ],
      primaryMuscles: ['Obliques'],
      secondaryMuscles: ['Core'],
    },
  },
  'dead-bug': {
    guide: {
      overview: 'A core stability exercise moving opposite arm and leg while keeping the lower back pressed to the floor — great for teaching core bracing.',
      setup: [
        'Lie on the floor, arms reaching toward the ceiling, knees bent at 90° with hips and knees stacked.',
      ],
      execution: [
        'Extend one arm overhead and the opposite leg out straight, keeping the lower back pressed into the floor.',
        'Return to the start and repeat on the other side.',
      ],
      mistakes: [
        'Letting the lower back arch off the floor as the limbs extend.',
        'Moving too fast to maintain control.',
        'Extending the limbs further than the core can control.',
      ],
      primaryMuscles: ['Core (transverse abdominis)'],
      secondaryMuscles: [],
    },
  },
  'mountain-climber': {
    guide: {
      overview: 'A dynamic core exercise driving the knees in toward the chest from a plank position, often used for conditioning too.',
      setup: [
        'Start in a push-up/plank position, hands under the shoulders.',
      ],
      execution: [
        'Drive one knee toward the chest with control, then return and switch legs, keeping the hips level throughout.',
        'Keep a steady rhythm rather than just going for speed.',
      ],
      mistakes: [
        'Letting the hips pike up or sag as the pace increases.',
        'Prioritizing speed over control, losing the plank position.',
        'Not driving the knee far enough forward to actually engage the core.',
      ],
      primaryMuscles: ['Core (rectus abdominis)'],
      secondaryMuscles: ['Hip flexors', 'Shoulders'],
    },
  },
  'cable-woodchopper': {
    guide: {
      overview: 'A rotational core exercise pulling a cable diagonally across the body, training rotational power and control.',
      setup: [
        'Set the pulley high (or low for the reverse pattern), stand side-on to the machine, grip the handle with both hands.',
      ],
      execution: [
        'Rotate through the torso, pulling the handle diagonally across the body, arms relatively straight.',
        'Return under control against the cable\'s pull.',
      ],
      mistakes: [
        'Using the arms to pull instead of rotating through the torso.',
        'Rotating from the lower back instead of the core/hips together.',
        'Using so much weight the movement becomes jerky.',
      ],
      primaryMuscles: ['Obliques'],
      secondaryMuscles: ['Core'],
    },
  },
  'pallof-press': {
    guide: {
      overview: 'An anti-rotation core exercise pressing a cable straight out from the chest while resisting its pull to rotate the body.',
      setup: [
        'Stand side-on to a cable pulley set at chest height, grip the handle with both hands at the chest.',
      ],
      execution: [
        'Press the handle straight out from the chest, resisting the cable\'s pull to rotate you — that resistance is the whole point.',
        'Return under control to the chest.',
      ],
      mistakes: [
        'Letting the torso rotate toward the machine, defeating the purpose of the exercise.',
        'Standing too close, reducing the rotational demand.',
        'Rushing the press instead of a controlled, braced motion.',
      ],
      primaryMuscles: ['Core (obliques, transverse abdominis)'],
      secondaryMuscles: [],
    },
  },
  'band-pallof-press': {
    guide: {
      overview: 'A Pallof press using a resistance band instead of a cable, the same anti-rotation core exercise.',
      setup: [
        'Anchor the band at chest height, stand side-on, grip with both hands at the chest.',
      ],
      execution: [
        'Press straight out, resisting rotation, then return under control.',
      ],
      mistakes: [
        'Letting the torso rotate toward the anchor point.',
        'Standing too close to the anchor, reducing the tension/demand.',
        'Rushing the press.',
      ],
      primaryMuscles: ['Core (obliques, transverse abdominis)'],
      secondaryMuscles: [],
    },
  },
  'kettlebell-turkish-get-up': {
    guide: {
      overview: 'A complex, full-body movement standing up from the floor while holding a kettlebell locked out overhead — builds core stability and shoulder control simultaneously.',
      setup: [
        'Lie on the floor holding a kettlebell locked out overhead with one arm, opposite knee bent.',
      ],
      execution: [
        'Move through the sequence (elbow, hand, hip bridge, knee, lunge, stand) slowly and deliberately, keeping eyes on the kettlebell throughout.',
        'Reverse the sequence to return to the floor under control.',
      ],
      mistakes: [
        'Rushing the sequence instead of moving deliberately through each step.',
        'Losing the overhead lockout position at any point.',
        'Attempting heavy loads before the bodyweight pattern is fully learned.',
      ],
      primaryMuscles: ['Core', 'Shoulders'],
      secondaryMuscles: ['Glutes', 'Quads'],
    },
  },

  // ---------------------------------------------------------------------
  // NECK
  // ---------------------------------------------------------------------
  'neck-flexion': {
    guide: {
      overview: 'A neck-strengthening exercise curling the head forward against light resistance (a plate, harness, or manual hand pressure).',
      setup: [
        'Lie on a bench with the head hanging off the edge, or use a neck harness, light resistance to start.',
      ],
      execution: [
        'Curl the chin toward the chest slowly and under control — about 2 seconds up, 2-3 seconds down.',
        'Return to the starting position without letting the head drop suddenly.',
      ],
      mistakes: [
        'Using resistance that\'s too heavy for such a small, sensitive muscle group.',
        'Moving quickly instead of a slow, controlled tempo.',
        'Continuing despite any sharp pain or dizziness.',
      ],
      primaryMuscles: ['Neck flexors'],
      secondaryMuscles: [],
    },
  },
  'neck-extension': {
    guide: {
      overview: 'A neck-strengthening exercise extending the head backward against light resistance.',
      setup: [
        'Lie face down with the head hanging off a bench edge, or use a neck harness, light resistance to start.',
      ],
      execution: [
        'Extend the head backward slowly and under control.',
        'Return to the starting position without letting the head drop suddenly.',
      ],
      mistakes: [
        'Using too much resistance for this small muscle group.',
        'Moving quickly instead of a slow, controlled tempo.',
        'Continuing despite dizziness or sharp pain — stop immediately if either occurs.',
      ],
      primaryMuscles: ['Neck extensors'],
      secondaryMuscles: [],
    },
  },
  'neck-lateral-flexion': {
    guide: {
      overview: 'A neck-strengthening exercise tilting the head sideways against light resistance, trained evenly on both sides.',
      setup: [
        'Lie on your side with the head unsupported off a bench edge, or use a neck harness, light resistance to start.',
      ],
      execution: [
        'Tilt the head toward the shoulder slowly and under control.',
        'Return to the starting position, then repeat evenly on both sides.',
      ],
      mistakes: [
        'Training one side more than the other.',
        'Using too much resistance for this small muscle group.',
        'Moving quickly instead of a slow, controlled tempo.',
      ],
      primaryMuscles: ['Neck (lateral flexors)'],
      secondaryMuscles: [],
    },
  },

  // ---------------------------------------------------------------------
  // CARDIO
  // ---------------------------------------------------------------------
  'treadmill-run': {
    guide: {
      overview: 'Steady-state or interval running on a treadmill — a controlled way to build cardiovascular fitness.',
      setup: [
        'Start the belt at a slow walking pace and gradually increase to your target speed.',
      ],
      execution: [
        'Settle into a pace that can be held for the full planned duration, landing softly under the hips.',
        'Use the incline setting to vary intensity without needing to run faster.',
      ],
      mistakes: [
        'Starting too fast and being unable to sustain the pace.',
        'Holding onto the front rails, which changes posture and reduces the workout.',
        'Overstriding, landing with the foot too far in front of the body.',
      ],
      primaryMuscles: ['Cardiovascular system'],
      secondaryMuscles: ['Quads', 'Hamstrings', 'Calves'],
    },
  },
  'treadmill-incline-walk': {
    guide: {
      overview: 'Walking on a treadmill at a steep incline — a lower-impact way to raise heart rate and heavily engage the glutes and calves.',
      setup: [
        'Start the belt at a comfortable walking pace, then gradually raise the incline to the target level.',
      ],
      execution: [
        'Maintain an upright posture, avoiding holding the rails for support.',
        'Keep a steady pace that matches the incline\'s difficulty.',
      ],
      mistakes: [
        'Holding onto the rails, which reduces the workout and encourages a hunched posture.',
        'Setting the incline so steep the stride becomes unnatural.',
        'Leaning too far forward instead of staying upright.',
      ],
      primaryMuscles: ['Cardiovascular system'],
      secondaryMuscles: ['Glutes', 'Calves'],
    },
  },
  'outdoor-run': {
    guide: {
      overview: 'Running outdoors — the same cardiovascular benefits as a treadmill with variable terrain and no belt to dictate pace.',
      setup: [
        'Choose a route and start at an easy warm-up pace.',
      ],
      execution: [
        'Settle into a sustainable pace and breathing rhythm for the planned distance/duration.',
        'Adjust the pace naturally for hills rather than forcing the same effort uphill and down.',
      ],
      mistakes: [
        'Starting too fast, especially on a route with hills early on.',
        'Ignoring surface changes (curbs, uneven ground) and rolling an ankle.',
        'Not adjusting the pace for terrain changes.',
      ],
      primaryMuscles: ['Cardiovascular system'],
      secondaryMuscles: ['Quads', 'Hamstrings', 'Calves'],
    },
  },
  'rowing-machine': {
    guide: {
      overview: 'A full-body cardio machine mimicking the rowing stroke — trains the legs, back, and cardiovascular system together.',
      setup: [
        'Strap in, grip the handle, start with knees bent and arms extended (the "catch" position).',
      ],
      execution: [
        'Drive with the legs first, then lean the torso back, then pull with the arms — reverse that order exactly on the way back to the catch.',
        'Keep the stroke rhythm smooth rather than yanking at any one phase.',
      ],
      mistakes: [
        'Pulling with the arms before the legs have finished driving.',
        'Rounding the back at the catch position.',
        'Rushing the return instead of controlling it back to the catch.',
      ],
      primaryMuscles: ['Cardiovascular system'],
      secondaryMuscles: ['Lats', 'Quads', 'Hamstrings'],
    },
  },
  'stationary-bike': {
    guide: {
      overview: 'A low-impact cardio machine pedaling against adjustable resistance.',
      setup: [
        'Set the seat height so the knee has a slight bend at full leg extension.',
      ],
      execution: [
        'Pedal at a steady cadence matched to the target intensity.',
        'Keep an upright or aero posture depending on the bike style, without locking the knees out.',
      ],
      mistakes: [
        'Setting the seat too low or high, straining the knees.',
        'Rocking the hips side to side to compensate for a seat that\'s too high.',
        'Gripping the handlebars so hard the upper body tenses unnecessarily.',
      ],
      primaryMuscles: ['Cardiovascular system'],
      secondaryMuscles: ['Quads', 'Hamstrings', 'Calves'],
    },
  },
  'assault-bike': {
    guide: {
      overview: 'A fan bike using both arms and legs, popular for high-intensity interval conditioning since resistance scales with effort.',
      setup: [
        'Sit with feet on the pedals and hands gripping the moving handles.',
      ],
      execution: [
        'Push and pull with the arms while driving with the legs simultaneously for full effort.',
        'Pace intervals so the target effort can actually be sustained for the planned work period.',
      ],
      mistakes: [
        'Using only the legs and letting the arms go along for the ride.',
        'Going all-out on the first interval and fading hard on the rest.',
        'Gripping the handles so hard the forearms fatigue before the legs do.',
      ],
      primaryMuscles: ['Cardiovascular system'],
      secondaryMuscles: ['Quads', 'Shoulders', 'Core'],
    },
  },
  elliptical: {
    guide: {
      overview: 'A low-impact cardio machine combining a striding motion for the legs with moving handles for the arms.',
      setup: [
        'Step onto the pedals, grip the moving or stationary handles depending on preference.',
      ],
      execution: [
        'Maintain even pressure through both feet and an upright posture as you stride.',
        'Match arm and leg effort to the machine\'s natural rhythm rather than fighting it.',
      ],
      mistakes: [
        'Leaning heavily on the handles, which reduces the leg workout.',
        'Taking strides so short the movement barely engages the legs.',
        'Hunching forward instead of staying upright.',
      ],
      primaryMuscles: ['Cardiovascular system'],
      secondaryMuscles: ['Quads', 'Glutes', 'Hamstrings'],
    },
  },
  'stair-climber': {
    guide: {
      overview: 'A cardio machine simulating continuous stair climbing — heavily engages the glutes and quads.',
      setup: [
        'Step onto the pedals/steps, hands lightly on the rails for balance only.',
      ],
      execution: [
        'Place the full foot on each step, maintaining an upright posture.',
        'Avoid leaning on the rails to take weight off the legs.',
      ],
      mistakes: [
        'Leaning heavily on the rails, which removes most of the workout.',
        'Taking very short, rapid steps instead of full steps at a sustainable pace.',
        'Hunching forward over the console.',
      ],
      primaryMuscles: ['Cardiovascular system'],
      secondaryMuscles: ['Glutes', 'Quads'],
    },
  },
  'jump-rope': {
    guide: {
      overview: 'A classic cardio and coordination exercise jumping over a rotating rope.',
      setup: [
        'Hold a handle in each hand, rope behind the heels, elbows close to the body.',
      ],
      execution: [
        'Take small hops, landing softly on the balls of the feet, turning the rope mainly with the wrists.',
        'Keep a steady rhythm rather than jumping unnecessarily high.',
      ],
      mistakes: [
        'Jumping too high, which wastes energy and increases impact.',
        'Turning the rope with the whole arm instead of the wrists.',
        'Landing flat-footed instead of on the balls of the feet.',
      ],
      primaryMuscles: ['Cardiovascular system'],
      secondaryMuscles: ['Calves', 'Shoulders'],
    },
  },
  'sled-push': {
    guide: {
      overview: 'A conditioning and leg-strength exercise pushing a weighted sled across the floor.',
      setup: [
        'Grip the sled handles at a height that allows a low body angle, feet set to drive.',
      ],
      execution: [
        'Drive through the legs in short, powerful steps, keeping a low body angle throughout.',
        'Maintain the push angle rather than standing upright partway through.',
      ],
      mistakes: [
        'Standing too upright, which reduces leg drive and shifts strain to the shoulders.',
        'Taking overly long strides instead of short, powerful steps.',
        'Loading so much weight that form breaks down entirely.',
      ],
      primaryMuscles: ['Quads', 'Glutes'],
      secondaryMuscles: ['Cardiovascular system', 'Core'],
    },
  },
  'sled-pull': {
    guide: {
      overview: 'A conditioning exercise pulling a weighted sled using a rope or harness, often walking backward or forward.',
      setup: [
        'Attach the rope/harness to the sled, grip or strap in, lean back slightly.',
      ],
      execution: [
        'Drive through the heels, pulling the sled with steady steps.',
        'Keep the lean consistent rather than standing upright partway through.',
      ],
      mistakes: [
        'Standing too upright, reducing the pulling leverage.',
        'Yanking with the arms instead of driving through the legs.',
        'Rushing the steps and losing a steady rhythm.',
      ],
      primaryMuscles: ['Hamstrings', 'Glutes'],
      secondaryMuscles: ['Cardiovascular system', 'Back'],
    },
  },
  'battle-ropes': {
    guide: {
      overview: 'A high-intensity conditioning exercise generating waves through heavy ropes anchored at one end.',
      setup: [
        'Grip one end of each rope, feet shoulder-width, knees slightly bent, core braced.',
      ],
      execution: [
        'Generate waves by driving the movement from the shoulders, keeping the core braced throughout.',
        'Maintain a steady rhythm matched to the target work period.',
      ],
      mistakes: [
        'Losing the core brace, letting the lower back take over the movement.',
        'Using only the wrists instead of driving from the shoulders.',
        'Going all-out immediately and fading before the interval ends.',
      ],
      primaryMuscles: ['Cardiovascular system'],
      secondaryMuscles: ['Shoulders', 'Core'],
    },
  },
  swimming: {
    guide: {
      overview: 'Full-body, low-impact cardiovascular exercise in water — easy on the joints while building endurance and upper-body strength.',
      setup: [
        'Choose a stroke suited to the goal (freestyle for pace, breaststroke for a gentler effort, etc.).',
      ],
      execution: [
        'Focus on a long, efficient stroke rather than just chasing speed.',
        'Keep breathing rhythm consistent with the stroke pattern.',
      ],
      mistakes: [
        'Chasing speed with a choppy stroke instead of building an efficient one first.',
        'Holding the breath instead of establishing a rhythm.',
        'Lifting the head too high to breathe, which drops the hips and increases drag.',
      ],
      primaryMuscles: ['Cardiovascular system'],
      secondaryMuscles: ['Lats', 'Shoulders', 'Core'],
    },
  },

  // ---------------------------------------------------------------------
  // Already-shipped prototype entries with real photos
  // ---------------------------------------------------------------------
  'incline-smith-machine-bench-press': {
    images: imagesFor('incline-smith-machine-bench-press'),
    guide: {
      overview: 'A guided-bar-path press on an incline bench that biases the upper chest and front shoulders. The Smith machine\'s fixed track removes the balance demand of a free-weight incline press, so it\'s a reliable way to load the upper chest hard without needing a spotter.',
      setup: [
        'Set the bench to a 30-45° incline underneath the Smith bar.',
        'Lie back so the bar sits directly over your upper chest/collarbone when unracked.',
        'Plant your feet flat on the floor, arch your upper back slightly, and pull your shoulder blades down and together.',
        'Grip the bar just outside shoulder width and unrack by rotating it out of the hooks.',
      ],
      execution: [
        'Lower the bar under control to touch your upper chest, keeping your elbows at roughly a 45° angle to your torso.',
        'Keep your shoulder blades pinned back throughout — don\'t let your shoulders roll forward at the bottom.',
        'Drive the bar back up and slightly toward your face, following the machine\'s fixed path.',
        'Lock out just short of hyperextending the elbows and repeat.',
      ],
      mistakes: [
        'Flaring the elbows out to 90° instead of ~45° — this shifts stress onto the front of the shoulder joint.',
        'Bouncing the bar off the chest instead of controlling the descent.',
        'Letting the shoulder blades round forward at the bottom, which turns it into a shoulder press.',
        'Setting the incline too steep (past ~45°), which turns it into more of a shoulder press than a chest press.',
      ],
      primaryMuscles: ['Upper chest (clavicular pec major)', 'Front deltoid'],
      secondaryMuscles: ['Triceps', 'Serratus anterior'],
    },
  },

  'cable-lateral-raise': {
    images: imagesFor('cable-lateral-raise'),
    guide: {
      overview: 'A single-arm lateral raise done on a low cable pulley instead of a dumbbell. The cable keeps constant tension on the side delt through the entire range — including the bottom, where a dumbbell raise loses tension — which makes it one of the more efficient ways to build the middle deltoid.',
      setup: [
        'Set the pulley to its lowest position and attach a single handle.',
        'Stand side-on to the machine, far enough away that there\'s tension on the cable with your arm at your side.',
        'Grip the handle with the hand furthest from the machine, so the cable crosses in front of your body.',
        'You can brace your free hand on the machine frame for stability.',
      ],
      execution: [
        'Keeping a slight bend in your elbow, raise your arm out to the side until it reaches shoulder height.',
        'Lead with your elbow, not your hand — think about lifting from the elbow rather than curling the wrist up.',
        'Pause briefly at the top, then lower under control back to the starting position, resisting the cable\'s pull the whole way down.',
        'Complete all reps on one side before switching arms.',
      ],
      mistakes: [
        'Using momentum/body swing to sling the weight up instead of raising it with the shoulder.',
        'Raising past shoulder height, which shifts load onto the traps.',
        'Letting the weight yank the arm back down on the eccentric instead of controlling it.',
        'Standing too close to the machine, which slackens the cable at the bottom and loses the tension advantage.',
      ],
      primaryMuscles: ['Lateral (middle) deltoid'],
      secondaryMuscles: ['Front deltoid', 'Trapezius'],
    },
  },

  'reverse-pec-deck': {
    images: imagesFor('reverse-pec-deck'),
    guide: {
      overview: 'The pec deck machine used facing the pad, pulling the handles backward instead of forward. It isolates the rear deltoids and upper back with a fixed, supported path — a reliable way to train a muscle group that\'s easy to neglect and hard to feel with free-weight exercises.',
      setup: [
        'Adjust the seat height so the handles are roughly at shoulder height when seated.',
        'Sit facing the pad with your chest against it, and grip a handle in each hand.',
        'Keep a slight bend in your elbows throughout — this isn\'t a straight-arm movement.',
      ],
      execution: [
        'Pull both handles backward and out to the sides in an arcing motion, leading with your elbows.',
        'Focus on squeezing your shoulder blades together at the back of the movement.',
        'Pause briefly at full contraction, then return under control to the starting position, letting the stretch happen across your upper back.',
      ],
      mistakes: [
        'Using too much weight and turning it into a jerky, momentum-driven motion.',
        'Straightening the elbows fully, which shifts the movement toward the triceps/lats instead of the rear delts.',
        'Not squeezing the shoulder blades at the back — just moving the arms without engaging the upper back.',
        'Setting the seat too low or high so the handles pull from an awkward angle relative to the shoulders.',
      ],
      primaryMuscles: ['Rear deltoid'],
      secondaryMuscles: ['Rhomboids', 'Mid-trapezius', 'Infraspinatus'],
    },
  },

  'low-to-high-cable-fly': {
    images: imagesFor('low-to-high-cable-fly'),
    guide: {
      overview: 'A cable fly performed from a low pulley position, pulling up and across the body. The upward angle biases the upper chest specifically, complementing flat or decline pressing/fly work that targets the mid and lower chest.',
      setup: [
        'Set both pulleys to their lowest position and attach single handles.',
        'Stand centered between the two towers, one handle in each hand, and step forward slightly to create tension.',
        'Stagger your stance for stability and keep a soft bend in your elbows.',
      ],
      execution: [
        'Pull both handles up and across your body in an arcing motion, finishing with your hands near eye level.',
        'Keep the slight elbow bend fixed throughout — this is a fly, not a press, so the elbows shouldn\'t drive the motion.',
        'Squeeze the chest at the top where your hands cross or meet, then return under control to the starting position, letting the chest stretch at the bottom.',
      ],
      mistakes: [
        'Bending the elbows more as the set gets harder, which turns it into a press and takes tension off the chest.',
        'Using too much weight and relying on body momentum to swing the handles up.',
        'Stopping the stretch short at the bottom instead of letting the arms travel back to shoulder level.',
        'Pulling straight up instead of across the body, which loses the inner-chest squeeze at the top.',
      ],
      primaryMuscles: ['Upper chest (clavicular pec major)'],
      secondaryMuscles: ['Front deltoid', 'Serratus anterior'],
    },
  },
}

export function getLibraryEntry(exerciseId) {
  return EXERCISE_LIBRARY[exerciseId] ?? null
}
