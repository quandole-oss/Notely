/*
 * NOTELY — LESSON DATA
 * All lesson step definitions, keyed by lesson ID
 * Extracted from Lesson.tsx to support multi-lesson routing
 */

export interface LessonStep {
  type: "watch" | "listen" | "play" | "quiz" | "explore";
  title: string;
  instruction: string;
  content?: string;
  options?: { label: string; correct: boolean; emoji: string; discoveryText?: string; note?: string }[];
  notes?: { note: string; label: string; color: string; dimmed?: boolean }[];
  instruments?: { id: string; label: string; emoji: string; color: string }[];
  pickFavorite?: boolean;
  minTaps?: number;
  quizLayout?: "piano" | "grid";
  previewNotes?: string[]; // for listen steps — notes to play on tap
  sequence?: string[]; // for guided play steps — ordered note names to play e.g. ["E","D","C"]
  // Rhythm lesson fields
  drumPads?: { id: string; label: string; emoji: string; color: string; sound: "kick" | "hihat" | "snare" }[];
  rhythmPatterns?: { sequence: ("kick" | "hihat")[]; bpm: number }[];
  backgroundBeat?: { bpm: number };
  pulsingCircle?: boolean;
  tapAnywhere?: boolean;
  rhythmQuizOptions?: { pattern: ("long" | "short")[]; correct: boolean; label: string }[];
  // Dynamics lesson fields
  velocitySensitive?: boolean;
  dynamicScenes?: { emoji: string; label: string; level: "soft" | "loud"; emojiMedium?: string; emojiBad?: string }[];
  dynamicsQuiz?: { note: string; velocity: number; answer: "loud" | "soft" }[];
  previewVelocities?: number[];
  // Tempo lesson fields
  tempoSlider?: boolean;
  tempoRange?: [number, number]; // [minBPM, maxBPM]
  tempoSliderMinMoves?: number;
  pulseGuide?: { bpm: number }; // visual metronome for guided play
  tempoQuiz?: { sequence: string[]; bpm: number; answer: "fast" | "slow" }[];
  tempoListenDemo?: { slowBpm: number; fastBpm: number; sequence: string[] };
}

export interface ReflectionPrompt {
  prompt: string;
  optionA: { label: string; value: string };
  optionB: { label: string; value: string };
}

export interface LessonData {
  name: string;
  steps: LessonStep[];
  reflections: Record<number, ReflectionPrompt>;
}

const ALL_KEYS = [
  { note: "C", label: "C", color: "#FFB800" },
  { note: "D", label: "D", color: "#FF5C35" },
  { note: "E", label: "E", color: "#4AABF5" },
  { note: "F", label: "F", color: "#3ECFA4" },
  { note: "G", label: "G", color: "#9C27B0" },
  { note: "A", label: "A", color: "#FF5C35" },
  { note: "B", label: "B", color: "#4AABF5" },
];

// L2 "Go Low, Go High" — middle notes dimmed to funnel kids to extremes
const LOW_HIGH_KEYS = [
  { note: "C", label: "C", color: "#FFB800" },
  { note: "D", label: "D", color: "#FF5C35" },
  { note: "E", label: "E", color: "#4AABF5", dimmed: true },
  { note: "F", label: "F", color: "#3ECFA4", dimmed: true },
  { note: "G", label: "G", color: "#9C27B0", dimmed: true },
  { note: "A", label: "A", color: "#FF5C35" },
  { note: "B", label: "B", color: "#4AABF5" },
];

const CDE_KEYS = [
  { note: "C", label: "C", color: "#FFB800" },
  { note: "D", label: "D", color: "#FF5C35" },
  { note: "E", label: "E", color: "#4AABF5" },
];

// ─── INSTRUMENT CARDS for Meet the Instruments lesson ────────────────────────
const INSTRUMENT_CARDS = [
  { id: "piano", label: "Keyboard", emoji: "🎹", color: "#FFB800" },
  { id: "guitar", label: "Guitar", emoji: "🎸", color: "#FF5C35" },
  { id: "drums", label: "Drums", emoji: "🥁", color: "#3ECFA4" },
  { id: "flute", label: "Winds", emoji: "🪈", color: "#4AABF5" },
  { id: "trumpet", label: "Brass", emoji: "🎺", color: "#9C27B0" },
];

// ─── LESSON 1: Meet the Instruments (3 steps, ~4 min) ───────────────────────
// Concept: Music has many different instruments — each with its own voice
const lesson1: LessonData = {
  name: "Lesson 1: Meet the Instruments",
  steps: [
    {
      type: "watch",
      title: "Music Has Many Voices! 🎶",
      instruction: "There are lots of instruments in music! Each one makes its own special sound. Let's hear some!",
      content: "Music is made by many different instruments. Some are played with keys, some with strings, some by blowing air, and some by hitting them! Each instrument family has its own special sound.",
    },
    {
      type: "explore",
      title: "Tap to Hear! 🎧",
      instruction: "Tap each instrument to hear what it sounds like. Try all five!",
      instruments: INSTRUMENT_CARDS,
      minTaps: 5,
    },
    {
      type: "explore",
      title: "Listen Again! ⭐",
      instruction: "Now that you've heard them all — which is YOUR favorite? Tap it again!",
      instruments: INSTRUMENT_CARDS,
      minTaps: 3,
      pickFavorite: true,
    },
  ],
  reflections: {},
};

// ─── LESSON 2: Meet the Piano (3 steps, ~3 min) ────────────────────────────
// Concept: What is a piano? What happens when I press keys?
// Theory: Humanism (self-directed, no judgment) + Experiential (concrete experience)
const lesson2: LessonData = {
  name: "Lesson 2: Meet the Piano",
  steps: [
    // 0 — Free explore (Humanism: self-directed discovery)
    {
      type: "explore",
      title: "Try It Yourself First! 🎹",
      instruction: "No rules yet — just tap any keys and listen. What sounds interesting to you?",
      notes: ALL_KEYS,
      minTaps: 3,
    },
    // 1 — Watch: intro to the piano
    {
      type: "watch",
      title: "Meet the Piano! 🎹",
      instruction: "Let's learn about the piano keys",
      content: "Piano has keys. Left side = low sounds, right side = high sounds. The 7 white keys are named C, D, E, F, G, A, B. Every key makes its own special sound!",
    },
    // 2 — Free explore: make a tune
    {
      type: "explore",
      title: "Make Your Own Tune! ⭐",
      instruction: "Now that you've met the piano, play any notes you like! Try going low to high, or make up a little melody.",
      notes: ALL_KEYS,
      minTaps: 5,
    },
  ],
  reflections: {},
};

// ─── LESSON 2: High and Low (7 steps, ~6 min) ──────────────────────────────
// Concept: Sounds have pitch — some are low (bear), some are high (bird)
// Theory: Constructivism (name what they felt in L1) + Experiential (full Kolb cycle)
// No note names taught — just the concept of pitch direction.
const lesson3: LessonData = {
  name: "Lesson 3: High and Low",
  steps: [
    // 0 — Warm up: reconnect with the piano
    {
      type: "explore",
      title: "Warm Up! 🎹",
      instruction: "Welcome back! Play any keys you remember from last time. There are no wrong notes — just warm up!",
      notes: ALL_KEYS,
      minTaps: 4,
    },
    // 1 — Watch: introduce pitch concept with bear/bird
    {
      type: "watch",
      title: "Sounds Go Up and Down! 📏",
      instruction: "Let's learn about low sounds and high sounds",
      content: "Notes on the LEFT side of the piano sound LOW — like a big bear growling 🐻. Notes on the RIGHT side sound HIGH — like a little bird singing 🐦! Left side is deep, right side is bright. Sounds go from low to high like climbing up stairs!",
    },
    // 2 — Listen: hear the staircase low→high
    {
      type: "listen",
      title: "The Sound Staircase 🪜",
      instruction: "Tap to hear all 7 notes climbing from low to high. Like walking up stairs!",
      content: "Listen to the notes go from low to high — each one is a step up the staircase! The first note is deep and warm, and each step gets a little brighter.",
      previewNotes: ["C4", "D4", "E4", "F4", "G4", "A4", "B4"],
    },
    // 3 — Explore: try low and high keys (middle greyed out)
    {
      type: "explore",
      title: "Go Low, Go High! 🐻🐦",
      instruction: "Try the LEFT keys for low bear sounds... now try the RIGHT keys for high bird sounds!",
      notes: LOW_HIGH_KEYS,
      minTaps: 5,
    },
    // 4 — Quiz: Which is lower? (ear training, no note names)
    {
      type: "quiz",
      quizLayout: "piano",
      title: "Which Is Lower? 🐻",
      instruction: "Listen to each sound. Which one sounds the LOWEST — like a big bear?",
      options: [
        { label: "1", correct: true, emoji: "🐻", note: "C3", discoveryText: "Yes! That's the lowest sound — deep and warm like a bear!" },
        { label: "2", correct: false, emoji: "🎵", note: "E4", discoveryText: "That one is in the middle! The bear sound is even deeper. Try sound 1!" },
        { label: "3", correct: false, emoji: "🐦", note: "B4", discoveryText: "That's actually the highest sound! It sings like a bird. The bear sound is 1!" },
      ],
    },
    // 5 — Quiz: Which is higher? (ear training, no note names)
    {
      type: "quiz",
      quizLayout: "piano",
      title: "Which Is Higher? 🐦",
      instruction: "Now listen again. Which sound is the HIGHEST — like a little bird?",
      options: [
        { label: "1", correct: false, emoji: "🐻", note: "C3", discoveryText: "That's the low one — the bear! The bird sound is much higher. Try sound 3!" },
        { label: "2", correct: false, emoji: "🎵", note: "E4", discoveryText: "That one is in the middle — higher than the bear but not the highest. The bird is sound 3!" },
        { label: "3", correct: true, emoji: "🐦", note: "B4", discoveryText: "That's right! That's the highest — it sings like a little bird!" },
      ],
    },
    // 6 — Explore: make a high-low tune (middle greyed out)
    {
      type: "explore",
      title: "Make a High-Low Tune! ⭐",
      instruction: "Mix low and high notes together! Try jumping from one side to the other. What patterns can you make?",
      notes: LOW_HIGH_KEYS,
      minTaps: 6,
    },
  ],
  reflections: {},
};

// ─── LESSON 3: Your First Notes (8 steps, ~8 min) ──────────────────────────
// Concept: Notes have letter names! Learn C, D, E.
// Theory: Constructivism (build on high/low) + Experiential + Humanism (reflection)
const lesson4: LessonData = {
  name: "Lesson 4: Your First Notes",
  steps: [
    // 0 — Warm up
    {
      type: "explore",
      title: "Warm Up! 🎹",
      instruction: "Welcome back! Play any keys to warm up your fingers. Remember — low on the left, high on the right!",
      notes: ALL_KEYS,
      minTaps: 4,
    },
    // 1 — Listen: Meet note C
    {
      type: "listen",
      title: "Meet Note C! 🌟",
      instruction: "This is C — the first note! It's like home base. Tap to hear what C sounds like.",
      content: "C is the first note of music. Think of C as 'home' — songs love to start and end here! C has a warm, steady sound.",
      previewNotes: ["C4"],
    },
    // 2 — Explore: Play only C (guided, single key)
    {
      type: "explore",
      title: "Play Only C! 🌟",
      instruction: "Tap C a few times — get to know its sound. This is your home note!",
      notes: [{ note: "C", label: "C", color: "#FFB800" }],
      minTaps: 3,
    },
    // 3 — Listen: Meet D and E
    {
      type: "listen",
      title: "Meet D and E! 🎵",
      instruction: "Now meet C's neighbors! Tap to hear all three together.",
      content: "D is one step up from C. E is another step up! Together, C, D, E are like climbing 3 stairs. Each step goes a little higher.",
      previewNotes: ["C4", "D4", "E4"],
    },
    // 4 — Explore: Try D and E (guided, two keys)
    {
      type: "explore",
      title: "Try D and E! 🎵",
      instruction: "Now tap D and E — hear how each one is a little higher than C!",
      notes: [
        { note: "D", label: "D", color: "#FF5C35" },
        { note: "E", label: "E", color: "#4AABF5" },
      ],
      minTaps: 3,
    },
    // 5 — Play: C, D, E in order
    {
      type: "play",
      title: "Play C, D, E! 🎹",
      instruction: "Tap the notes from low to high: C, then D, then E. Use Listen First if you need a reminder!",
      notes: CDE_KEYS,
    },
    // 6 — Explore: creative play with C, D, E
    {
      type: "explore",
      title: "Make a Tune With C, D, E! ⭐",
      instruction: "You know three notes now! Play them in any order — make up your own little tune. There's no wrong way to be creative!",
      notes: CDE_KEYS,
      minTaps: 6,
    },
    // 7 — Explore: bonus — try all 7
    {
      type: "explore",
      title: "Bonus: Try All 7! 🌈",
      instruction: "You've learned 3 notes — now explore the rest! All 7 keys are unlocked. See what sounds you can discover!",
      notes: ALL_KEYS,
      minTaps: 5,
    },
  ],
  reflections: {
    5: {
      prompt: "What did you notice about the notes?",
      optionA: { label: "They went up! ⬆️", value: "stairs" },
      optionB: { label: "Each one was different! 🎨", value: "different" },
    },
  },
};

// ─── LESSON 5: Rhythm & Beat (7 steps, ~7 min) ─────────────────────────────
// Concept: Music has a steady beat; sounds can be long or short; patterns repeat
// Theory: Constructivism (explore before explain) + Experiential (hands-on drumming)
const DRUM_PADS = [
  { id: "boom", label: "Boom", emoji: "🥁", color: "#3ECFA4", sound: "kick" as const },
  { id: "tick", label: "Tick", emoji: "🔔", color: "#4AABF5", sound: "hihat" as const },
];

const lesson5: LessonData = {
  name: "Lesson 5: Rhythm & Beat",
  steps: [
    // 0 — Explore: feel the beat (tap anywhere, pulsing circle, background beat)
    {
      type: "explore",
      title: "Feel the Beat! 💓",
      instruction: "Music has a heartbeat! Tap anywhere to join in with the beat. Can you keep up?",
      tapAnywhere: true,
      pulsingCircle: true,
      backgroundBeat: { bpm: 100 },
      minTaps: 8,
    },
    // 1 — Watch: heartbeat metaphor
    {
      type: "watch",
      title: "Music Has a Heartbeat! 💓",
      instruction: "Let's learn about the beat — the heartbeat of music!",
      content: "Every song has a BEAT — like a heartbeat that never stops! When you clap along to a song, you're feeling the beat. Some beats are fast, some are slow, but the beat keeps going steady, like a clock ticking. The beat is what makes you want to move and dance!",
    },
    // 2 — Listen: meet the drum pads
    {
      type: "listen",
      title: "Meet the Drums! 🥁",
      instruction: "Tap each drum to hear its sound. Boom is deep. Tick is bright!",
      content: "Drums are the heartbeat of a band! The big drum goes BOOM — deep and strong. The small one goes TICK — bright and quick. Together they make rhythm patterns!",
      drumPads: DRUM_PADS,
    },
    // 3 — Explore: free play with drum pads
    {
      type: "explore",
      title: "Free Drumming! 🥁",
      instruction: "Make your own beats! Tap Boom and Tick in any order you like. There's no wrong rhythm!",
      drumPads: DRUM_PADS,
      minTaps: 6,
    },
    // 4 — Play: pattern matching (3 rounds)
    {
      type: "play",
      title: "Copy the Pattern! 🎯",
      instruction: "Listen to the pattern, then copy it with the drum pads. Can you match all 3 rounds?",
      drumPads: DRUM_PADS,
      rhythmPatterns: [
        { sequence: ["kick", "kick", "hihat", "hihat"], bpm: 120 },
        { sequence: ["kick", "hihat", "kick", "hihat"], bpm: 120 },
        { sequence: ["kick", "kick", "hihat", "kick", "hihat"], bpm: 130 },
      ],
    },
    // 5 — Quiz: visual block notation (2 questions shown sequentially)
    {
      type: "quiz",
      title: "Read the Rhythm! 📖",
      instruction: "Look at the blocks! Wide = Boom (long), narrow = Tick (short). Which pattern matches what you hear?",
      rhythmQuizOptions: [
        { pattern: ["long", "long", "short", "short"], correct: true, label: "Boom Boom Tick Tick" },
        { pattern: ["short", "short", "long", "long"], correct: false, label: "Tick Tick Boom Boom" },
        { pattern: ["long", "short", "long", "short"], correct: true, label: "Boom Tick Boom Tick" },
        { pattern: ["short", "long", "short", "long"], correct: false, label: "Tick Boom Tick Boom" },
      ],
    },
    // 6 — Explore: drum circle with background beat + reflection
    {
      type: "explore",
      title: "Drum Circle! 🎶",
      instruction: "Play along with the beat! Add your own Booms and Ticks on top. Feel the groove!",
      drumPads: DRUM_PADS,
      backgroundBeat: { bpm: 110 },
      minTaps: 8,
    },
  ],
  reflections: {
    6: {
      prompt: "How did the drum circle make you feel?",
      optionA: { label: "I felt the groove! 🎶", value: "groove" },
      optionB: { label: "I liked making patterns! 🧩", value: "patterns" },
    },
  },
};

// ─── LESSON 6: Your First Song (8 steps, ~8 min) ─────────────────────────────
// Concept: A melody is a series of notes that tell a musical story. You can play one!
// Theory: Constructivism (scaffolded, chunked mastery) + Humanism (ownership, creative reinterpretation)
// Song: "Hot Cross Buns" — E-D-C, D-D-D, E-D-C (uses only C, D, E)
const lesson6: LessonData = {
  name: "Lesson 6: Your First Song",
  steps: [
    // 0 — Explore: Warm Up with C, D, E (re-activate prior knowledge)
    {
      type: "explore",
      title: "Warm Up! 🎹",
      instruction: "Welcome back! Play C, D, and E to warm up your fingers.",
      notes: CDE_KEYS,
      minTaps: 4,
    },
    // 1 — Watch: Notes Tell Stories (bridging analogy — constructivism)
    {
      type: "watch",
      title: "Notes Tell Stories! 🎶",
      instruction: "Let's learn how notes make melodies!",
      content: "When you play notes in a row, they make a melody — like words making a sentence. A melody is a series of notes that tell a musical story. You already know C, D, and E — that's enough to play a real song!",
    },
    // 2 — Listen: Hear "Hot Cross Buns" (observation phase — Kolb)
    {
      type: "listen",
      title: "Hear a Melody 🎵",
      instruction: "Tap to hear a real melody played with just three notes! Watch the keys light up as each note plays.",
      content: "This melody is called 'Hot Cross Buns' — one of the most famous beginner songs! It uses only the three notes you already know: E, D, and C. Listen to how they go down like stairs.",
      previewNotes: ["E4", "D4", "C4", "D4", "D4", "D4", "E4", "D4", "C4"],
    },
    // 3 — Play (guided): Learn Part 1 — E, D, C (scaffolded, zone of proximal development)
    {
      type: "play",
      title: "Learn Part 1 🎹",
      instruction: "Play the first phrase: E, D, C — going down the stairs! The next note glows to help you.",
      notes: CDE_KEYS,
      sequence: ["E", "D", "C"],
    },
    // 4 — Play (guided): Learn Part 2 — D, D, D (chunked mastery)
    {
      type: "play",
      title: "Learn Part 2 🎹",
      instruction: "Now the middle part: D, D, D — three times! Tap the glowing key.",
      notes: CDE_KEYS,
      sequence: ["D", "D", "D"],
    },
    // 5 — Play (full): Put It Together — full melody (active experimentation)
    {
      type: "play",
      title: "Put It Together! ⭐",
      instruction: "Play the full melody: E-D-C, D-D-D, E-D-C. You've got this!",
      notes: CDE_KEYS,
      sequence: ["E", "D", "C", "D", "D", "D", "E", "D", "C"],
    },
    // 6 — Explore: Make It Yours (ownership, creative reinterpretation)
    {
      type: "explore",
      title: "Make It Yours! ⭐",
      instruction: "Can you change the song to sound different? Try mixing up the order of C, D, and E!",
      notes: CDE_KEYS,
      minTaps: 6,
    },
    // 7 — Explore: How Did That Feel? (learner directs their path)
    {
      type: "explore",
      title: "How Did That Feel? 🌟",
      instruction: "You just played your first song! You can keep playing, and tell us what you want to do next.",
      notes: CDE_KEYS,
      minTaps: 0,
    },
  ],
  reflections: {
    7: {
      prompt: "What do you want to do next?",
      optionA: { label: "I want to play more songs! 🎵", value: "more_songs" },
      optionB: { label: "I want to make my own! ✨", value: "create_own" },
    },
  },
};

// ─── LESSON 7: Loud and Soft (6 steps, ~5 min) ─────────────────────────────
// Concept: Dynamics — sounds can be soft or loud; you control volume with touch
// Theory: Experiential (feel volume) + Constructivism (name what they feel)
// No Italian terms (forte/piano) — just "soft" and "loud"
const lesson7: LessonData = {
  name: "Lesson 7: Loud and Soft",
  steps: [
    // 0 — Warm up: standard free explore
    {
      type: "explore",
      title: "Warm Up! 🎹",
      instruction: "Welcome back! Play any keys to warm up your fingers.",
      notes: ALL_KEYS,
      minTaps: 4,
    },
    // 1 — Listen: hear the difference between soft and loud
    {
      type: "listen",
      title: "Soft and Loud! 🔊",
      instruction: "Tap to hear the SAME note played two ways — first soft, then LOUD! Watch the wave change size.",
      content: "Music isn't just about which note you play — it's also about HOW you play it! A soft note sounds gentle and quiet. A loud note sounds bold and strong. The same note can feel totally different!",
      previewNotes: ["C4", "C4"],
      previewVelocities: [0.2, 0.9],
    },
    // 2 — Explore: velocity-sensitive keys (tap position → volume)
    {
      type: "explore",
      title: "Touch and Feel! 🎹",
      instruction: "Try tapping the TOP of a key for soft... and the BOTTOM for loud! Hear the difference?",
      notes: ALL_KEYS,
      velocitySensitive: true,
      minTaps: 6,
    },
    // 3 — Play: dynamic match game (3 emoji scenes)
    {
      type: "play",
      title: "Match the Scene! 🎭",
      instruction: "Each scene needs a different volume. Play softly or loudly to match!",
      notes: ALL_KEYS,
      velocitySensitive: true,
      dynamicScenes: [
        { emoji: "😴", label: "Baby sleeping", level: "soft", emojiMedium: "😒", emojiBad: "😭" },
        { emoji: "🎉", label: "Dance party!", level: "loud", emojiMedium: "😐", emojiBad: "😴" },
        { emoji: "🐱", label: "Sneaky cat", level: "soft", emojiMedium: "🙀", emojiBad: "😾" },
      ],
    },
    // 4 — Quiz: dynamics audio quiz (4 questions)
    {
      type: "quiz",
      title: "Soft or Loud? 🤔",
      instruction: "Listen to each sound. Is it soft or loud?",
      dynamicsQuiz: [
        { note: "C4", velocity: 0.15, answer: "soft" },
        { note: "E4", velocity: 0.9, answer: "loud" },
        { note: "G4", velocity: 0.2, answer: "soft" },
        { note: "D4", velocity: 0.85, answer: "loud" },
      ],
    },
    // 5 — Explore: free play with velocity + reflection
    {
      type: "explore",
      title: "Your Dynamic Story! ⭐",
      instruction: "Play any notes soft or loud — tell a story with volume! Start quiet and get louder, or mix it up!",
      notes: ALL_KEYS,
      velocitySensitive: true,
      minTaps: 8,
    },
  ],
  reflections: {
    5: {
      prompt: "What did you like more?",
      optionA: { label: "Playing softly 🤫", value: "soft" },
      optionB: { label: "Playing loudly! 📢", value: "loud" },
    },
  },
};

// ─── LESSON 8: Fast and Slow (6 steps, ~5 min) ─────────────────────────────
// Concept: Music can move quickly or slowly — this is called tempo.
// Theory: Experiential (hear/feel tempo contrast) + Constructivism (slider gives learner control)
const lesson8: LessonData = {
  name: "Lesson 8: Fast and Slow",
  steps: [
    // 0 — Listen: hear the same melody at two speeds (tortoise vs rabbit)
    {
      type: "listen",
      title: "Two Speeds! 🐢🐇",
      instruction: "Tap to hear the same melody played two ways — first slow like a tortoise, then fast like a rabbit!",
      content: "Music can move slowly or quickly — this is called TEMPO! A slow tempo feels calm and relaxed. A fast tempo feels exciting and energetic. The same notes can feel totally different depending on the speed!",
      tempoListenDemo: {
        slowBpm: 80,
        fastBpm: 180,
        sequence: ["C", "D", "E", "D", "C"],
      },
    },
    // 1 — Explore: tempo slider with looping beat + character animation
    {
      type: "explore",
      title: "Speed Control! 🎚️",
      instruction: "Drag the slider to change the speed! Watch the character speed up and slow down.",
      tempoSlider: true,
      tempoRange: [60, 180],
      tempoSliderMinMoves: 3,
      minTaps: 0,
    },
    // 2 — Play: guided sequence at slow pulse
    {
      type: "play",
      title: "Slow Song 🐢",
      instruction: "Play C-D-E-D-C following the slow beat. Watch the pulse dots and play along!",
      notes: CDE_KEYS,
      sequence: ["C", "D", "E", "D", "C"],
      pulseGuide: { bpm: 80 },
    },
    // 3 — Play: same melody at fast pulse
    {
      type: "play",
      title: "Fast Song 🐇",
      instruction: "Same melody, but faster! Play C-D-E-D-C with the quick beat!",
      notes: CDE_KEYS,
      sequence: ["C", "D", "E", "D", "C"],
      pulseGuide: { bpm: 160 },
    },
    // 4 — Quiz: categorize 4 audio clips as fast or slow
    {
      type: "quiz",
      title: "Fast or Slow? 🤔",
      instruction: "Listen to each clip. Is it fast or slow?",
      tempoQuiz: [
        { sequence: ["C", "D", "E"], bpm: 70, answer: "slow" },
        { sequence: ["E", "D", "C"], bpm: 180, answer: "fast" },
        { sequence: ["C", "E", "D"], bpm: 75, answer: "slow" },
        { sequence: ["D", "E", "C"], bpm: 170, answer: "fast" },
      ],
    },
    // 5 — Explore: DJ Mode — piano keys + tempo slider, free play
    {
      type: "explore",
      title: "DJ Mode! 🎧",
      instruction: "Play the piano at any speed you like! Drag the slider to change tempo. What speed feels best to YOU?",
      notes: CDE_KEYS,
      tempoSlider: true,
      tempoRange: [60, 180],
      tempoSliderMinMoves: 0,
      minTaps: 6,
    },
  ],
  reflections: {
    5: {
      prompt: "What speed do you like best?",
      optionA: { label: "Slow and chill 🐢", value: "slow" },
      optionB: { label: "Fast and exciting! 🐇", value: "fast" },
    },
  },
};

// ─── LESSON REGISTRY ─────────────────────────────────────────────────────────
export const LESSONS: Record<string, LessonData> = {
  "1": lesson1,
  "2": lesson2,
  "3": lesson3,
  "4": lesson4,
  "5": lesson5,
  "6": lesson6,
  "7": lesson7,
  "8": lesson8,
};
