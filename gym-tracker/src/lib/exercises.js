// Built-in exercise library. `increment` is the default jump in kg the coach
// reaches for on a successful session (small for isolation work, bigger for
// heavy lower-body compounds) — see suggestNextTarget() in coach.js. `cue`
// is a short, single-focus form reminder shown on the exercise card during
// a workout — not a full how-to, just the one thing worth thinking about
// mid-set.
//
// A handful of these IDs (e.g. 'back-squat', 'barbell-bench-press',
// 'lat-pulldown') are hardcoded into the program templates in coach.js —
// don't rename an existing entry's `name` without checking there first,
// since that changes its slug ID. New entries are always safe to add.
export const CATEGORIES = ['chest', 'back', 'shoulders', 'legs', 'arms', 'core', 'neck', 'cardio']

export const CATEGORY_LABELS = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  legs: 'Legs',
  arms: 'Arms',
  core: 'Core',
  neck: 'Neck',
  cardio: 'Cardio',
}

export const EQUIPMENT = ['barbell', 'dumbbell', 'machine', 'cable', 'band', 'bodyweight', 'kettlebell', 'other']

const E = (name, category, equipment, compound, increment, cue) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  name,
  category,
  equipment,
  compound,
  increment,
  cue: cue ?? null,
  isCustom: false,
})

export const BUILT_IN_EXERCISES = [
  // Chest
  E('Barbell Bench Press', 'chest', 'barbell', true, 2.5, 'Retract the shoulder blades, drive the feet into the floor, bar path slightly toward the chin.'),
  E('Incline Barbell Bench Press', 'chest', 'barbell', true, 2.5, 'Lower to the upper chest, keep elbows around 45°, drive up and slightly back.'),
  E('Decline Barbell Bench Press', 'chest', 'barbell', true, 2.5, 'Lower to the lower chest, keep the shoulder blades pinned throughout.'),
  E('Close-Grip Barbell Bench Press', 'chest', 'barbell', true, 2.5, 'Keep elbows tucked close to the body to bias the triceps.'),
  E('Smith Machine Bench Press', 'chest', 'machine', true, 2.5, 'Set the bar path to touch mid-chest; keep shoulder blades pinned.'),
  E('Dumbbell Bench Press', 'chest', 'dumbbell', true, 2, 'Let the dumbbells travel slightly inward at the top, full stretch at the bottom.'),
  E('Incline Dumbbell Press', 'chest', 'dumbbell', true, 2, 'Press up and slightly back, control the stretch at the bottom.'),
  E('Decline Dumbbell Press', 'chest', 'dumbbell', true, 2, 'Keep wrists stacked over elbows, control the descent.'),
  E('Dumbbell Fly', 'chest', 'dumbbell', false, 1, 'Keep a slight bend in the elbows throughout, feel a stretch across the chest at the bottom.'),
  E('Incline Dumbbell Fly', 'chest', 'dumbbell', false, 1, 'Wide arc, slight elbow bend, squeeze the chest at the top.'),
  E('Cable Fly', 'chest', 'cable', false, 1, 'Lean slightly forward, squeeze the chest at the finish rather than just moving the arms.'),
  E('Low-to-High Cable Fly', 'chest', 'cable', false, 1, 'Pull up and across, finish with the hands near eye level.'),
  E('High-to-Low Cable Fly', 'chest', 'cable', false, 1, 'Pull down and across toward the opposite hip, squeeze at the bottom.'),
  E('Cable Crossover', 'chest', 'cable', false, 1, 'Cross the hands past the midline at the finish, squeeze the chest.'),
  E('Machine Chest Press', 'chest', 'machine', true, 2.5, 'Set the seat so the handles align with mid-chest, press without flaring the elbows too high.'),
  E('Incline Machine Press', 'chest', 'machine', true, 2.5, 'Set the seat so the handles align with the upper chest.'),
  E('Incline Smith Machine Bench Press', 'chest', 'machine', true, 2.5, 'Bar path toward the upper chest, elbows around 45°.'),
  E('Band Chest Fly', 'chest', 'band', false, 1, 'Anchor behind you, squeeze the chest at the finish, control the return.'),
  E('Pec Deck', 'chest', 'machine', false, 2.5, 'Light stretch at the back, squeeze the chest without shrugging the shoulders.'),
  E('Push-Up', 'chest', 'bodyweight', true, 0, 'Straight line from head to heels, elbows about 45° from the body.'),
  E('Incline Push-Up', 'chest', 'bodyweight', true, 0, 'Hands elevated, keep the body in a straight line.'),
  E('Decline Push-Up', 'chest', 'bodyweight', true, 0, 'Feet elevated, brace the core so the hips don’t sag.'),
  E('Diamond Push-Up', 'chest', 'bodyweight', true, 0, 'Hands close together under the chest to bias the triceps.'),
  E('Chest Dip', 'chest', 'bodyweight', true, 0, 'Lean forward and let the elbows flare slightly to target the chest.'),
  E('Landmine Press', 'chest', 'barbell', true, 2.5, 'Press up and slightly forward, brace the core to control the angle.'),
  E('Svend Press', 'chest', 'other', false, 1, 'Squeeze the plates together throughout the press to keep chest tension.'),

  // Back
  E('Deadlift', 'back', 'barbell', true, 5, 'Push the floor away, keep the bar close to the shins, chest up as it passes the knees.'),
  E('Sumo Deadlift', 'back', 'barbell', true, 5, 'Wide stance, knees pushed out over the toes, chest tall.'),
  E('Rack Pull', 'back', 'barbell', true, 5, 'Start with the bar at the pins, drive the hips forward hard at lockout.'),
  E('Deficit Deadlift', 'back', 'barbell', true, 5, 'Stand on a small platform for extra range, keep the back flat off the floor.'),
  E('Good Morning', 'back', 'barbell', true, 2.5, 'Hinge at the hips with a soft knee bend, keep the back flat.'),
  E('Barbell Row', 'back', 'barbell', true, 2.5, 'Hinge forward, pull the bar to the lower ribs, avoid using momentum.'),
  E('Pendlay Row', 'back', 'barbell', true, 2.5, 'Start each rep from a dead stop on the floor, pull explosively to the torso.'),
  E('T-Bar Row', 'back', 'barbell', true, 2.5, 'Chest supported or hinged, pull the elbows back and squeeze the shoulder blades.'),
  E('Chest-Supported Row', 'back', 'machine', true, 2.5, 'Keep the chest against the pad, pull without shrugging.'),
  E('Meadows Row', 'back', 'barbell', true, 2, 'Pull up and back, let the shoulder blade drive the movement.'),
  E('One-Arm Dumbbell Row', 'back', 'dumbbell', true, 2, 'Brace on the bench, pull the elbow back past the ribs.'),
  E('Kettlebell Row', 'back', 'kettlebell', true, 2, 'Hinge and brace the core, pull the elbow straight back.'),
  E('Seated Cable Row', 'back', 'cable', true, 2.5, 'Sit tall, pull to the torso, avoid rounding the lower back.'),
  E('Wide-Grip Cable Row', 'back', 'cable', true, 2.5, 'Pull to the upper abs with elbows flared, squeeze the shoulder blades.'),
  E('Machine Row', 'back', 'machine', true, 2.5, 'Chest against the pad, pull without jerking the torso.'),
  E('Inverted Row', 'back', 'bodyweight', true, 0, 'Straight body line, pull the chest to the bar.'),
  E('Lat Pulldown', 'back', 'cable', true, 2.5, 'Pull the bar to the upper chest, lead with the elbows, avoid leaning back too far.'),
  E('Wide-Grip Lat Pulldown', 'back', 'cable', true, 2.5, 'Wide grip, pull the elbows down and slightly back.'),
  E('Close-Grip Lat Pulldown', 'back', 'cable', true, 2.5, 'Pull to the chest, let the elbows travel close to the torso.'),
  E('Single-Arm Lat Pulldown', 'back', 'cable', true, 2, 'Pull the elbow down and back, avoid twisting the torso.'),
  E('Straight-Arm Pulldown', 'back', 'cable', false, 1, 'Keep the arms nearly straight, pull down using the lats, not the arms.'),
  E('Pull-Up', 'back', 'bodyweight', true, 0, 'Pull the chest toward the bar, avoid kipping unless that’s the intent.'),
  E('Weighted Pull-Up', 'back', 'bodyweight', true, 1.25, 'Same strict form as bodyweight — avoid swinging the added load.'),
  E('Chin-Up', 'back', 'bodyweight', true, 0, 'Underhand grip, pull the chest to the bar, control the descent.'),
  E('Neutral-Grip Pull-Up', 'back', 'bodyweight', true, 0, 'Palms facing each other, pull the elbows down and back.'),
  E('Assisted Pull-Up', 'back', 'machine', true, 2.5, 'Use just enough assistance to complete full-range reps with control.'),
  E('Face Pull', 'back', 'cable', false, 1, 'Pull to eye level, lead with the elbows high, squeeze the rear delts.'),
  E('Band Face Pull', 'back', 'band', false, 1, 'Pull high, lead with the elbows, squeeze the rear delts and upper back.'),
  E('Band Pulldown', 'back', 'band', true, 1, 'Pull the band down and back, squeeze the lats at the bottom.'),
  E('Back Extension', 'back', 'bodyweight', false, 0, 'Hinge at the hips, avoid hyperextending the lower back at the top.'),
  E('Weighted Back Extension', 'back', 'other', false, 2.5, 'Same hip hinge as bodyweight — control the extra load through the range.'),

  // Shoulders
  E('Overhead Press', 'shoulders', 'barbell', true, 2.5, 'Brace the core, press straight up, tuck the chin slightly to clear the bar.'),
  E('Seated Barbell Overhead Press', 'shoulders', 'barbell', true, 2.5, 'Back supported, press straight overhead without over-arching.'),
  E('Push Press', 'shoulders', 'barbell', true, 2.5, 'Dip the knees slightly, drive up, then press the bar overhead.'),
  E('Smith Machine Shoulder Press', 'shoulders', 'machine', true, 2.5, 'Press straight up, avoid shrugging the shoulders to move the weight.'),
  E('Dumbbell Shoulder Press', 'shoulders', 'dumbbell', true, 2, 'Press up and slightly in, avoid flaring the elbows too far back.'),
  E('Seated Dumbbell Shoulder Press', 'shoulders', 'dumbbell', true, 2, 'Back supported, press without arching the lower back.'),
  E('Arnold Press', 'shoulders', 'dumbbell', true, 2, 'Rotate the palms out as you press, finish with palms facing forward.'),
  E('Machine Shoulder Press', 'shoulders', 'machine', true, 2.5, 'Set the seat so the handles start at shoulder height.'),
  E('Landmine Shoulder Press', 'shoulders', 'barbell', true, 2.5, 'Press up and slightly across the body, brace the core.'),
  E('Lateral Raise', 'shoulders', 'dumbbell', false, 1, 'Lead with the elbows, raise to about shoulder height, avoid using momentum.'),
  E('Cable Lateral Raise', 'shoulders', 'cable', false, 1, 'Constant tension from the cable, raise with a slight forward lean of the torso.'),
  E('Leaning Cable Lateral Raise', 'shoulders', 'cable', false, 1, 'Lean away from the cable to load the delt through the full range.'),
  E('Machine Lateral Raise', 'shoulders', 'machine', false, 2.5, 'Raise with the elbows, not by shrugging the traps.'),
  E('Band Lateral Raise', 'shoulders', 'band', false, 1, 'Lead with the elbows, raise to shoulder height, avoid shrugging.'),
  E('Front Raise', 'shoulders', 'dumbbell', false, 1, 'Raise to about shoulder height, avoid swinging the torso for momentum.'),
  E('Cable Front Raise', 'shoulders', 'cable', false, 1, 'Constant tension, raise to shoulder height without leaning back.'),
  E('Rear Delt Fly', 'shoulders', 'dumbbell', false, 1, 'Hinge forward, raise with the elbows, squeeze the rear delts.'),
  E('Cable Rear Delt Fly', 'shoulders', 'cable', false, 1, 'Cross the cables in front, pull out and back, squeeze at the top.'),
  E('Band Rear Delt Fly', 'shoulders', 'band', false, 1, 'Hinge forward and squeeze the rear delts at the finish.'),
  E('Reverse Pec Deck', 'shoulders', 'machine', false, 2.5, 'Raise with the elbows, squeeze the shoulder blades together.'),
  E('Upright Row', 'shoulders', 'barbell', false, 2.5, 'Pull to about chest height, lead with the elbows, stop if the shoulders pinch.'),
  E('Cable Upright Row', 'shoulders', 'cable', false, 1, 'Lead with the elbows, stop below shoulder height if it pinches.'),
  E('Barbell Shrug', 'shoulders', 'barbell', false, 5, 'Shrug straight up, avoid rolling the shoulders.'),
  E('Dumbbell Shrug', 'shoulders', 'dumbbell', false, 2, 'Shrug straight up and squeeze at the top, avoid rolling.'),
  E('Cable Shrug', 'shoulders', 'cable', false, 2.5, 'Constant tension, shrug straight up and hold briefly at the top.'),

  // Legs
  E('Back Squat', 'legs', 'barbell', true, 5, 'Brace the core, chest up, drive through the whole foot out of the bottom.'),
  E('Front Squat', 'legs', 'barbell', true, 2.5, 'Elbows high to keep the torso upright, sit straight down between the hips.'),
  E('Safety-Bar Squat', 'legs', 'barbell', true, 5, 'The torso naturally sits more upright than a back squat — don’t fight it.'),
  E('Box Squat', 'legs', 'barbell', true, 5, 'Sit back to the box under control, then drive straight back up — don’t relax at the bottom.'),
  E('Zercher Squat', 'legs', 'barbell', true, 2.5, 'Bar cradled in the elbows — brace hard, this loads the core heavily.'),
  E('Hack Squat', 'legs', 'machine', true, 5, 'Feet slightly forward on the platform, control the descent, drive through the heels.'),
  E('Smith Machine Squat', 'legs', 'machine', true, 5, 'Feet slightly forward of the bar path, drive through the whole foot.'),
  E('Belt Squat', 'legs', 'machine', true, 5, 'Torso stays upright since the load hangs at the hips — squat straight down.'),
  E('Goblet Squat', 'legs', 'dumbbell', true, 2, 'Hold the weight at the chest, elbows inside the knees at the bottom.'),
  E('Kettlebell Goblet Squat', 'legs', 'kettlebell', true, 2, 'Elbows inside the knees at the bottom, chest up.'),
  E('Sissy Squat', 'legs', 'bodyweight', true, 0, 'Knees travel forward, keep a straight line from knees to shoulders.'),
  E('Bulgarian Split Squat', 'legs', 'dumbbell', true, 2, 'Most of the weight on the front foot, drive straight down and up.'),
  E('Walking Lunge', 'legs', 'dumbbell', true, 2, 'Step out, drop the back knee toward the floor, drive through the front heel.'),
  E('Reverse Lunge', 'legs', 'dumbbell', true, 2, 'Step back, keep the front shin close to vertical.'),
  E('Lateral Lunge', 'legs', 'dumbbell', true, 2, 'Step wide, push the hips back, keep the other leg straight.'),
  E('Step-Up', 'legs', 'dumbbell', true, 2, 'Drive through the elevated foot, avoid pushing off the trailing leg.'),
  E('Leg Press', 'legs', 'machine', true, 5, 'Feet shoulder-width, don’t let the lower back round off the pad at the bottom.'),
  E('Romanian Deadlift', 'legs', 'barbell', true, 5, 'Push the hips back, soft knees, feel a stretch in the hamstrings.'),
  E('Dumbbell Romanian Deadlift', 'legs', 'dumbbell', true, 2, 'Push the hips back, keep the back flat, feel the hamstring stretch.'),
  E('Stiff-Leg Deadlift', 'legs', 'barbell', true, 5, 'Slight knee bend, hinge at the hips, keep the bar close to the legs.'),
  E('Kettlebell Deadlift', 'legs', 'kettlebell', true, 2, 'Hinge at the hips, keep the bell close to the shins.'),
  E('Kettlebell Swing', 'legs', 'kettlebell', true, 4, 'Hip hinge, not a squat — snap the hips forward to drive the bell up.'),
  E('Glute Ham Raise', 'legs', 'bodyweight', false, 0, 'Control the descent with the hamstrings, don’t just fall forward.'),
  E('Nordic Curl', 'legs', 'bodyweight', false, 0, 'Lower under control for as long as possible, catch yourself with the hands if needed.'),
  E('Hip Thrust', 'legs', 'barbell', true, 5, 'Drive through the heels, squeeze the glutes hard at the top, chin tucked.'),
  E('Barbell Glute Bridge', 'legs', 'barbell', true, 5, 'Same as a hip thrust from the floor — squeeze the glutes at the top.'),
  E('Cable Pull-Through', 'legs', 'cable', true, 2.5, 'Hinge at the hips, let the cable pull you back, squeeze the glutes forward.'),
  E('Cable Kickback', 'legs', 'cable', false, 1, 'Squeeze the glute at the top, avoid arching the lower back.'),
  E('Leg Extension', 'legs', 'machine', false, 2.5, 'Squeeze the quads at the top, control the descent.'),
  E('Leg Curl', 'legs', 'machine', false, 2.5, 'Squeeze the hamstrings at the top, avoid lifting the hips off the pad.'),
  E('Seated Leg Curl', 'legs', 'machine', false, 2.5, 'Squeeze the hamstrings at the top, control the return.'),
  E('Standing Calf Raise', 'legs', 'machine', false, 5, 'Full stretch at the bottom, rise onto the toes and pause briefly at the top.'),
  E('Seated Calf Raise', 'legs', 'machine', false, 2.5, 'Bent-knee position biases the soleus — full range, pause at the top.'),
  E('Calf Raise', 'legs', 'machine', false, 5, 'Full stretch at the bottom, rise onto the toes and pause at the top.'),
  E('Donkey Calf Raise', 'legs', 'machine', false, 5, 'Hinged position, full stretch at the bottom, pause at the top.'),
  E('Adductor Machine', 'legs', 'machine', false, 2.5, 'Controlled squeeze inward, avoid using momentum.'),
  E('Abductor Machine', 'legs', 'machine', false, 2.5, 'Controlled push outward, keep the torso still.'),

  // Arms
  E('Barbell Curl', 'arms', 'barbell', false, 2.5, 'Keep the elbows pinned to the sides, avoid swinging the torso.'),
  E('EZ-Bar Curl', 'arms', 'barbell', false, 2.5, 'Elbows pinned to the sides, curl without swinging.'),
  E('Dumbbell Curl', 'arms', 'dumbbell', false, 1, 'Elbows stay at the sides, full stretch at the bottom.'),
  E('Alternating Dumbbell Curl', 'arms', 'dumbbell', false, 1, 'Curl one arm at a time, keep the resting arm still.'),
  E('Incline Dumbbell Curl', 'arms', 'dumbbell', false, 1, 'The incline biases a longer stretch — let the arm hang fully at the bottom.'),
  E('Hammer Curl', 'arms', 'dumbbell', false, 1, 'Neutral grip throughout, elbows pinned to the sides.'),
  E('Cross-Body Hammer Curl', 'arms', 'dumbbell', false, 1, 'Curl toward the opposite shoulder, keep the elbow pinned.'),
  E('Concentration Curl', 'arms', 'dumbbell', false, 1, 'Brace the elbow against the inner thigh, curl slowly with control.'),
  E('Preacher Curl', 'arms', 'barbell', false, 2.5, 'Arm fully supported by the pad, avoid bouncing out of the bottom.'),
  E('Dumbbell Preacher Curl', 'arms', 'dumbbell', false, 1, 'Control the stretch at the bottom, no bouncing.'),
  E('Spider Curl', 'arms', 'barbell', false, 2.5, 'Chest against the pad removes momentum — curl strictly.'),
  E('Drag Curl', 'arms', 'barbell', false, 2.5, 'Drag the bar up close to the torso, elbows travel back, not forward.'),
  E('Zottman Curl', 'arms', 'dumbbell', false, 1, 'Curl with palms up, rotate to palms down on the way back.'),
  E('Cable Curl', 'arms', 'cable', false, 1, 'Constant tension from the cable, elbows pinned to the sides.'),
  E('Cable Hammer Curl', 'arms', 'cable', false, 1, 'Neutral grip, constant tension, elbows pinned.'),
  E('Kettlebell Curl', 'arms', 'kettlebell', false, 2, 'Elbows pinned to the sides, control the descent.'),
  E('Bayesian Curl', 'arms', 'cable', false, 1, 'Cable behind you biases a stretch at the bottom — keep the elbow back and still.'),
  E('Band Curl', 'arms', 'band', false, 1, 'Constant tension throughout, elbows pinned to the sides.'),
  E('Close-Grip Bench Press', 'arms', 'barbell', true, 2.5, 'Elbows tucked close, bar path toward the lower chest.'),
  E('Skull Crusher', 'arms', 'barbell', false, 2.5, 'Elbows stay pointed at the ceiling, lower the bar toward the forehead or just behind.'),
  E('Dumbbell Skull Crusher', 'arms', 'dumbbell', false, 1, 'Elbows fixed, lower under control.'),
  E('Overhead Triceps Extension', 'arms', 'dumbbell', false, 1, 'Elbows stay close to the head, full stretch at the bottom.'),
  E('Cable Overhead Triceps Extension', 'arms', 'cable', false, 1, 'Elbows fixed overhead, extend through the triceps only.'),
  E('Triceps Pushdown', 'arms', 'cable', false, 1, 'Elbows pinned to the sides, extend fully without leaning on the bar.'),
  E('Rope Triceps Pushdown', 'arms', 'cable', false, 1, 'Spread the rope apart at the bottom for a full triceps squeeze.'),
  E('Single-Arm Triceps Pushdown', 'arms', 'cable', false, 1, 'Elbow pinned to the side, extend fully, avoid twisting the torso.'),
  E('Triceps Kickback', 'arms', 'dumbbell', false, 1, 'Hinge forward, upper arm parallel to the floor, extend from the elbow only.'),
  E('Band Triceps Extension', 'arms', 'band', false, 1, 'Elbows pinned, extend fully against the band tension.'),
  E('Dip', 'arms', 'bodyweight', true, 0, 'Lean forward slightly to bias the chest, or stay upright to bias the triceps.'),
  E('Bench Dip', 'arms', 'bodyweight', true, 0, 'Hands on the bench behind you, lower under control, avoid shrugging.'),
  E('Wrist Curl', 'arms', 'dumbbell', false, 1, 'Forearms supported, curl through the wrist only.'),
  E('Reverse Wrist Curl', 'arms', 'dumbbell', false, 1, 'Palms down, extend the wrist against the weight.'),
  E('Reverse Curl', 'arms', 'barbell', false, 1, 'Overhand grip, curl without swinging — this hits the forearms hard.'),

  // Core
  E('Plank', 'core', 'bodyweight', false, 0, 'Straight line from head to heels, brace the core, don’t let the hips sag.'),
  E('Side Plank', 'core', 'bodyweight', false, 0, 'Stack the hips, keep a straight line from head to feet.'),
  E('Hanging Leg Raise', 'core', 'bodyweight', false, 0, 'Curl the pelvis up at the top rather than just swinging the legs.'),
  E('Hanging Knee Raise', 'core', 'bodyweight', false, 0, 'Curl the knees up toward the chest using the abs, not momentum.'),
  E('Toes to Bar', 'core', 'bodyweight', false, 0, 'Control the swing, drive the toes up using the abs.'),
  E('Cable Crunch', 'core', 'cable', false, 2.5, 'Crunch from the spine, not the hips — keep the hips still.'),
  E('Machine Crunch', 'core', 'machine', false, 2.5, 'Crunch through the spine, control the return.'),
  E('Ab Wheel Rollout', 'core', 'bodyweight', false, 0, 'Brace hard, roll out only as far as you can control the return from.'),
  E('Sit-Up', 'core', 'bodyweight', false, 0, 'Curl up through the spine, avoid yanking with the neck.'),
  E('Weighted Sit-Up', 'core', 'other', false, 2.5, 'Curl through the spine, control the extra load.'),
  E('Crunch', 'core', 'bodyweight', false, 0, 'Small range — lift the shoulder blades off the floor using the abs.'),
  E('Bicycle Crunch', 'core', 'bodyweight', false, 0, 'Rotate the shoulder to the opposite knee, keep the motion controlled.'),
  E('Reverse Crunch', 'core', 'bodyweight', false, 0, 'Curl the hips up toward the ribs, avoid swinging the legs.'),
  E('Decline Sit-Up', 'core', 'bodyweight', false, 0, 'Curl through the spine, control the descent.'),
  E('V-Up', 'core', 'bodyweight', false, 0, 'Reach the hands to the feet, lift both halves of the body together.'),
  E('Russian Twist', 'core', 'other', false, 1, 'Rotate through the torso, keep the chest up rather than rounding forward.'),
  E('Dead Bug', 'core', 'bodyweight', false, 0, 'Keep the lower back pressed into the floor throughout.'),
  E('Mountain Climber', 'core', 'bodyweight', false, 0, 'Keep the hips level, drive the knees in with control, not just speed.'),
  E('Cable Woodchopper', 'core', 'cable', false, 1, 'Rotate through the torso, keep the arms relatively straight.'),
  E('Pallof Press', 'core', 'cable', false, 1, 'Resist the cable’s pull to rotate you — that anti-rotation is the whole point.'),
  E('Band Pallof Press', 'core', 'band', false, 1, 'Resist rotation, press straight out and back.'),
  E('Kettlebell Turkish Get-Up', 'core', 'kettlebell', false, 2, 'Keep eyes on the kettlebell throughout, move slowly and deliberately.'),

  // Neck — go conservative here: light load, slow reps (2s contraction,
  // 2-3s eccentric), and progress in much smaller jumps than everything
  // else in this file. Not part of any auto-generated program template;
  // available for anyone who wants to add it deliberately.
  E('Neck Flexion', 'neck', 'other', false, 1, 'Slow and controlled — about 2s up, 2-3s down, light load.'),
  E('Neck Extension', 'neck', 'other', false, 1, 'Slow and controlled — stop immediately for dizziness or sharp pain.'),
  E('Neck Lateral Flexion', 'neck', 'other', false, 1, 'Slow and controlled, equal work on both sides.'),

  // Cardio
  E('Treadmill Run', 'cardio', 'other', false, 0, 'Settle into a pace you can hold for the full duration.'),
  E('Treadmill Incline Walk', 'cardio', 'other', false, 0, 'Upright posture, avoid holding the rails for support.'),
  E('Outdoor Run', 'cardio', 'other', false, 0, 'Settle into a sustainable pace and breathing rhythm.'),
  E('Rowing Machine', 'cardio', 'machine', false, 0, 'Legs drive first, then lean back, then pull with the arms — reverse the order on the return.'),
  E('Stationary Bike', 'cardio', 'machine', false, 0, 'Seat height set so the knee has a slight bend at full extension.'),
  E('Assault Bike', 'cardio', 'machine', false, 0, 'Push and pull with the arms while driving with the legs for full effort.'),
  E('Elliptical', 'cardio', 'machine', false, 0, 'Even pressure through both feet, upright posture.'),
  E('Stair Climber', 'cardio', 'machine', false, 0, 'Full foot on each step, upright posture, avoid leaning on the rails.'),
  E('Jump Rope', 'cardio', 'other', false, 0, 'Small hops, land softly on the balls of the feet.'),
  E('Sled Push', 'cardio', 'other', false, 0, 'Low body angle, drive through the legs in short powerful steps.'),
  E('Sled Pull', 'cardio', 'other', false, 0, 'Lean back slightly, drive through the heels.'),
  E('Battle Ropes', 'cardio', 'other', false, 0, 'Keep the core braced, generate waves from the shoulders.'),
  E('Swimming', 'cardio', 'other', false, 0, 'Focus on a long, efficient stroke rather than just speed.'),
]

export function getAllExercises(customExercises = []) {
  return [...BUILT_IN_EXERCISES, ...customExercises]
}

export function findExercise(exerciseId, customExercises = []) {
  return getAllExercises(customExercises).find((exercise) => exercise.id === exerciseId) ?? null
}

export function makeCustomExercise(name, category, equipment) {
  return {
    id: genIdForCustom(name),
    name: name.trim(),
    category,
    equipment,
    compound: false,
    increment: equipment === 'dumbbell' || equipment === 'band' ? 1 : 2.5,
    cue: null,
    isCustom: true,
  }
}

function genIdForCustom(name) {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `custom-${base}-${Date.now().toString(36)}`
}
