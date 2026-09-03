// Extended per-exercise reference content: a longer written guide plus
// start/end position photos, shown from the "+ More info" library sheet.
// Sparse by design — most exercises only have the short `cue` field from
// exercises.js until a guide/photos are added here, and the sheet falls
// back gracefully to just the cue when an id has no entry.

function imagesFor(id) {
  const base = import.meta.env.BASE_URL
  return {
    start: `${base}exercises/${id}-start.webp`,
    end: `${base}exercises/${id}-end.webp`,
  }
}

export const EXERCISE_LIBRARY = {
  'incline-smith-machine-bench-press': {
    images: imagesFor('incline-smith-machine-bench-press'),
    guide: {
      overview:
        'A guided-bar-path press on an incline bench that biases the upper chest and front shoulders. The Smith machine\'s fixed track removes the balance demand of a free-weight incline press, so it\'s a reliable way to load the upper chest hard without needing a spotter.',
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
      overview:
        'A single-arm lateral raise done on a low cable pulley instead of a dumbbell. The cable keeps constant tension on the side delt through the entire range — including the bottom, where a dumbbell raise loses tension — which makes it one of the more efficient ways to build the middle deltoid.',
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
      overview:
        'The pec deck machine used facing the pad, pulling the handles backward instead of forward. It isolates the rear deltoids and upper back with a fixed, supported path — a reliable way to train a muscle group that\'s easy to neglect and hard to feel with free-weight exercises.',
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
      overview:
        'A cable fly performed from a low pulley position, pulling up and across the body. The upward angle biases the upper chest specifically, complementing flat or decline pressing/fly work that targets the mid and lower chest.',
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
