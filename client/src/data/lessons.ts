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

// ─── LESSON REGISTRY ─────────────────────────────────────────────────────────
export const LESSONS: Record<string, LessonData> = {
  "1": lesson1,
  "2": lesson2,
  "3": lesson3,
  "4": lesson4,
};
