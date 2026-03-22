/*
 * NOTELY — LESSON DATA
 * All lesson step definitions, keyed by lesson ID
 * Extracted from Lesson.tsx to support multi-lesson routing
 *
 * Pedagogical framework: Orff Schulwerk + Constructivist + Experiential (Kolb)
 * Sequence: body percussion → unpitched percussion → pitched instruments → pentatonic → composition
 * Each lesson: Explore/Experience → Reflect/Observe → Name/Conceptualize → Create/Experiment
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
  // Pattern / Form lesson fields
  patternBlocks?: { color: string; label: string; notes: string[] }[];
  patternQuiz?: { phraseA: string[]; phraseB: string[]; answer: "same" | "different" }[];
  formBuilder?: { sectionA: string[]; sectionB: string[] };
  // Capstone fields
  capstoneInstrumentPicker?: boolean;
  recorder?: boolean;
  recorderKeys?: { note: string; label: string; color: string }[];
  compositionPlayback?: boolean;
  choicePicker?: { label: string; emoji: string; value: string }[];
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

// ─── KEY SETS ────────────────────────────────────────────────────────────────

// Pentatonic scale (C-D-E-G-A) — Orff Schulwerk: every combination sounds consonant
const PENTATONIC_KEYS = [
  { note: "C", label: "C", color: "#FFB800" },
  { note: "D", label: "D", color: "#FF5C35" },
  { note: "E", label: "E", color: "#4AABF5" },
  { note: "G", label: "G", color: "#9C27B0" },
  { note: "A", label: "A", color: "#FF5C35" },
];

// Full keyboard with F and B dimmed — visual cue to stay pentatonic
const PENTATONIC_DIMMED_KEYS = [
  { note: "C", label: "C", color: "#FFB800" },
  { note: "D", label: "D", color: "#FF5C35" },
  { note: "E", label: "E", color: "#4AABF5" },
  { note: "F", label: "F", color: "#3ECFA4", dimmed: true },
  { note: "G", label: "G", color: "#9C27B0" },
  { note: "A", label: "A", color: "#FF5C35" },
  { note: "B", label: "B", color: "#4AABF5", dimmed: true },
];

// High/Low pentatonic — extremes highlighted, middle dimmed
const LOW_HIGH_PENTATONIC_KEYS = [
  { note: "C", label: "C", color: "#FFB800" },
  { note: "D", label: "D", color: "#FF5C35", dimmed: true },
  { note: "E", label: "E", color: "#4AABF5", dimmed: true },
  { note: "G", label: "G", color: "#9C27B0", dimmed: true },
  { note: "A", label: "A", color: "#FF5C35" },
];

const CDE_KEYS = [
  { note: "C", label: "C", color: "#FFB800" },
  { note: "D", label: "D", color: "#FF5C35" },
  { note: "E", label: "E", color: "#4AABF5" },
];

// ─── DRUM PADS (used from Lesson 1 onward — Orff: rhythm before pitch) ──────
const DRUM_PADS = [
  { id: "boom", label: "Boom", emoji: "🥁", color: "#3ECFA4", sound: "kick" as const },
  { id: "tick", label: "Tick", emoji: "🔔", color: "#4AABF5", sound: "hihat" as const },
];

// ─── INSTRUMENT CARDS (used by capstone) ────────────────────────────────────
const INSTRUMENT_CARDS = [
  { id: "piano", label: "Keyboard", emoji: "🎹", color: "#FFB800" },
  { id: "guitar", label: "Guitar", emoji: "🎸", color: "#FF5C35" },
  { id: "drums", label: "Drums", emoji: "🥁", color: "#3ECFA4" },
  { id: "flute", label: "Winds", emoji: "🪈", color: "#4AABF5" },
  { id: "trumpet", label: "Brass", emoji: "🎺", color: "#9C27B0" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// LESSON 1: Let's Make Sounds! (6 steps, ~5 min)
// Orff: Body percussion + speech rhythms — the FIRST musical experience
// Kolb: Experience (tap) → Observe (watch) → Conceptualize (drums) → Experiment (create)
// ═══════════════════════════════════════════════════════════════════════════════
const lesson1: LessonData = {
  name: "Lesson 1: Let's Make Sounds!",
  steps: [
    // 0 — Concrete Experience: feel the beat with your body
    {
      type: "explore",
      title: "Tap Along! 👏",
      instruction: "Tap along with the heartbeat! Clap your hands, pat your legs, stomp your feet — any way you like!",
      tapAnywhere: true,
      pulsingCircle: true,
      backgroundBeat: { bpm: 100 },
      minTaps: 8,
    },
    // 1 — Reflective Observation: name what just happened (AFTER experience)
    {
      type: "watch",
      title: "Your Body Is an Instrument! 👏",
      instruction: "Did you feel that? YOU just made music!",
      content: "Your hands can clap, your feet can stomp, your legs can pat. Your body is the first instrument you ever had! Every kind of music starts with people making sounds — just like you did. Rhythm is the heartbeat of all music!",
    },
    // 2 — Transfer: body percussion → unpitched percussion (Orff sequence)
    {
      type: "explore",
      title: "Boom and Tick! 🥁",
      instruction: "Boom is like stomping your feet. Tick is like snapping your fingers. Try both!",
      drumPads: DRUM_PADS,
      minTaps: 6,
    },
    // 3 — Imitation: copy drum patterns (Orff process step 1)
    {
      type: "play",
      title: "Copy My Pattern! 🎯",
      instruction: "Listen to each pattern, then copy it with the drums. Can you match all 3?",
      drumPads: DRUM_PADS,
      rhythmPatterns: [
        { sequence: ["kick", "kick", "hihat", "hihat"], bpm: 110 },
        { sequence: ["kick", "hihat", "kick", "hihat"], bpm: 110 },
        { sequence: ["kick", "kick", "kick", "hihat"], bpm: 120 },
      ],
    },
    // 4 — Improvisation: make your own (Orff process step 3)
    {
      type: "explore",
      title: "Make Your Own Pattern! 🎶",
      instruction: "Now make YOUR own rhythm! There's no wrong pattern — just play what feels good!",
      drumPads: DRUM_PADS,
      backgroundBeat: { bpm: 100 },
      minTaps: 8,
    },
    // 5 — Abstract Conceptualization: visual rhythm reading
    {
      type: "quiz",
      title: "Read the Rhythm! 📖",
      instruction: "Look at the blocks! Wide = Boom (long), narrow = Tick (short). Which pattern matches?",
      rhythmQuizOptions: [
        { pattern: ["long", "long", "short", "short"], correct: true, label: "Boom Boom Tick Tick" },
        { pattern: ["short", "short", "long", "long"], correct: false, label: "Tick Tick Boom Boom" },
      ],
    },
  ],
  reflections: {
    4: {
      prompt: "How did making your own rhythm feel?",
      optionA: { label: "I loved it! 🎶", value: "loved" },
      optionB: { label: "I want to try more! 🥁", value: "more" },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// LESSON 2: Feel the Beat (6 steps, ~5 min)
// Orff: Deepen steady beat internalization before any pitch
// Kolb: Feel beat → Hear contrast → Name steady beat → Experiment with tempo
// ═══════════════════════════════════════════════════════════════════════════════
const lesson2: LessonData = {
  name: "Lesson 2: Feel the Beat",
  steps: [
    // 0 — Warm up: reconnect with body percussion from L1
    {
      type: "explore",
      title: "Warm Up! 👏",
      instruction: "Welcome back! Tap along with the beat to warm up — you know how!",
      tapAnywhere: true,
      pulsingCircle: true,
      backgroundBeat: { bpm: 100 },
      minTaps: 6,
    },
    // 1 — Concrete Experience: hear same melody at two speeds
    {
      type: "listen",
      title: "Two Speeds! 🐢🐇",
      instruction: "Tap to hear the same pattern played two ways — first slow, then fast!",
      content: "Some beats walk slowly like a tortoise, some run fast like a rabbit — but both are STEADY, like a clock! A beat that keeps going evenly is called a steady beat.",
      tempoListenDemo: {
        slowBpm: 80,
        fastBpm: 160,
        sequence: ["C", "D", "E", "D", "C"],
      },
    },
    // 2 — Active Experimentation: control the speed
    {
      type: "explore",
      title: "Speed Control! 🎚️",
      instruction: "Drag the slider to change the speed! Can you tap along at every speed?",
      tempoSlider: true,
      tempoRange: [60, 180],
      tempoSliderMinMoves: 3,
      minTaps: 0,
    },
    // 3 — Imitation: steady patterns at different tempos
    {
      type: "play",
      title: "Keep the Beat! 🎯",
      instruction: "Copy these steady patterns. Keep the beat going even and strong!",
      drumPads: DRUM_PADS,
      rhythmPatterns: [
        { sequence: ["kick", "kick", "kick", "kick"], bpm: 100 },
        { sequence: ["hihat", "hihat", "hihat", "hihat"], bpm: 120 },
        { sequence: ["kick", "hihat", "kick", "hihat"], bpm: 110 },
      ],
    },
    // 4 — Abstract Conceptualization: name the concept (AFTER feeling it)
    {
      type: "watch",
      title: "The Heartbeat of Music! 💓",
      instruction: "Let's name what you've been feeling!",
      content: "Every song has a BEAT — a steady pulse that never stops! When you clap along to a song, you're feeling the beat. Fast or slow, the beat keeps going steady, like your heartbeat. The beat is what makes music feel alive!",
    },
    // 5 — Creative application: drum circle
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
    5: {
      prompt: "What speed did you like best?",
      optionA: { label: "Slow and steady 🐢", value: "slow" },
      optionB: { label: "Fast and exciting! 🐇", value: "fast" },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// LESSON 3: Long and Short Sounds (7 steps, ~6 min)
// Orff: Duration concepts through body/unpitched percussion before pitch
// Kolb: Hear contrast → Explore freely → Name duration → Create patterns
// ═══════════════════════════════════════════════════════════════════════════════
const lesson3: LessonData = {
  name: "Lesson 3: Long and Short Sounds",
  steps: [
    // 0 — Warm up with drums
    {
      type: "explore",
      title: "Warm Up! 🥁",
      instruction: "Welcome back! Play the drums to warm up — try Boom and Tick!",
      drumPads: DRUM_PADS,
      backgroundBeat: { bpm: 100 },
      minTaps: 4,
    },
    // 1 — Concrete Experience: hear long vs short
    {
      type: "listen",
      title: "Hear the Difference! 👂",
      instruction: "Tap each drum and listen carefully. Which sound rings longer?",
      content: "Boom is a LONG sound — it rings out and fills the room. Tick is a SHORT sound — it's quick and snappy! Music is made of long and short sounds mixed together.",
      drumPads: DRUM_PADS,
    },
    // 2 — Exploration: free drumming with awareness
    {
      type: "explore",
      title: "Long and Short! 🥁",
      instruction: "Play Boom for long sounds and Tick for short sounds. Can you feel the difference?",
      drumPads: DRUM_PADS,
      minTaps: 6,
    },
    // 3 — Imitation: copy varied long/short patterns
    {
      type: "play",
      title: "Copy the Pattern! 🎯",
      instruction: "These patterns mix long and short sounds. Listen, then copy!",
      drumPads: DRUM_PADS,
      rhythmPatterns: [
        { sequence: ["kick", "kick", "hihat", "hihat"], bpm: 110 },
        { sequence: ["kick", "hihat", "hihat", "kick"], bpm: 110 },
        { sequence: ["hihat", "hihat", "hihat", "kick", "hihat"], bpm: 120 },
      ],
    },
    // 4 — Abstract Conceptualization: visual block reading
    {
      type: "quiz",
      title: "Read the Rhythm! 📖",
      instruction: "Wide blocks are LONG sounds, narrow blocks are SHORT sounds. Which pattern matches?",
      rhythmQuizOptions: [
        { pattern: ["long", "short", "short", "long"], correct: true, label: "Boom Tick Tick Boom" },
        { pattern: ["short", "long", "long", "short"], correct: false, label: "Tick Boom Boom Tick" },
        { pattern: ["long", "short", "long", "short"], correct: true, label: "Boom Tick Boom Tick" },
        { pattern: ["short", "short", "long", "long"], correct: false, label: "Tick Tick Boom Boom" },
      ],
    },
    // 5 — Reflective Observation: name what was discovered
    {
      type: "watch",
      title: "Rhythm Has a Shape! 🧩",
      instruction: "Let's name what you discovered!",
      content: "Rhythms are made of LONG and SHORT sounds! When you mix them together in different orders, you get patterns. Every song in the world is built from these patterns — just long and short sounds arranged in creative ways!",
    },
    // 6 — Creation: make your own rhythm
    {
      type: "explore",
      title: "Create a Rhythm! ⭐",
      instruction: "Make up your own rhythm pattern! Mix long Booms and short Ticks however you like!",
      drumPads: DRUM_PADS,
      backgroundBeat: { bpm: 110 },
      minTaps: 8,
    },
  ],
  reflections: {
    6: {
      prompt: "What kind of rhythms do you like?",
      optionA: { label: "Long steady booms! 🥁", value: "long" },
      optionB: { label: "Quick snappy ticks! 🔔", value: "short" },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// LESSON 4: Meet the Piano (6 steps, ~5 min)
// Orff: Transition from unpitched to pitched percussion; pentatonic safety net
// Kolb: Free explore → Hear staircase → Name keys → Create a tune
// ═══════════════════════════════════════════════════════════════════════════════
const lesson4: LessonData = {
  name: "Lesson 4: Meet the Piano",
  steps: [
    // 0 — Concrete Experience: free exploration with pentatonic (no wrong sounds!)
    {
      type: "explore",
      title: "Try It Yourself! 🎹",
      instruction: "No rules yet — just tap any keys and listen. What sounds interesting to you?",
      notes: PENTATONIC_DIMMED_KEYS,
      minTaps: 4,
    },
    // 1 — Listen: hear the pentatonic scale ascending
    {
      type: "listen",
      title: "The Sound Staircase 🪜",
      instruction: "Tap to hear these 5 special notes climbing from low to high!",
      content: "Listen to the notes go from low to high — each one is a step up the staircase! These 5 notes are special — they always sound good together, no matter what order you play them!",
      previewNotes: ["C4", "D4", "E4", "G4", "A4"],
    },
    // 2 — Abstract Conceptualization: name the keys (AFTER exploration)
    {
      type: "watch",
      title: "Meet Your Piano! 🎹",
      instruction: "Let's learn about the keys you just played!",
      content: "Piano keys have letter names! The ones you played are C, D, E, G, and A. Left side is low, right side is high. These 5 notes are called the pentatonic scale — and they always sound beautiful together! No matter what order you play them, it sounds like music.",
    },
    // 3 — Active Experimentation: play all 5 by name
    {
      type: "explore",
      title: "Play Them All! 🎵",
      instruction: "Now that you know their names, play all 5! Go low to high, high to low, or jump around!",
      notes: PENTATONIC_KEYS,
      minTaps: 5,
    },
    // 4 — Assessment: ear training
    {
      type: "quiz",
      quizLayout: "piano",
      title: "Which Is Lower? 🐻",
      instruction: "Listen to each sound. Which one sounds the LOWEST?",
      options: [
        { label: "1", correct: true, emoji: "🐻", note: "C3", discoveryText: "Yes! That's the lowest sound — deep and warm!" },
        { label: "2", correct: false, emoji: "🎵", note: "E4", discoveryText: "That one is in the middle! The lowest sound is deeper. Try sound 1!" },
        { label: "3", correct: false, emoji: "🐦", note: "A4", discoveryText: "That's actually the highest! The lowest is sound 1!" },
      ],
    },
    // 5 — Creation: make a pentatonic tune
    {
      type: "explore",
      title: "Make a Tune! ⭐",
      instruction: "Make up your own little tune with these 5 notes. There are NO wrong sounds — everything sounds beautiful!",
      notes: PENTATONIC_KEYS,
      minTaps: 6,
    },
  ],
  reflections: {
    5: {
      prompt: "What did you notice about the piano?",
      optionA: { label: "Low notes are deep! 🐻", value: "low" },
      optionB: { label: "High notes are bright! 🐦", value: "high" },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// LESSON 5: High and Low (7 steps, ~6 min)
// Orff: Pitch exploration within pentatonic context
// Kolb: Explore extremes → Hear staircase → Name high/low → Create contrasts
// ═══════════════════════════════════════════════════════════════════════════════
const lesson5: LessonData = {
  name: "Lesson 5: High and Low",
  steps: [
    // 0 — Warm up: reconnect with pentatonic piano
    {
      type: "explore",
      title: "Warm Up! 🎹",
      instruction: "Welcome back! Play any keys to warm up. Remember — no wrong sounds!",
      notes: PENTATONIC_KEYS,
      minTaps: 4,
    },
    // 1 — Concrete Experience: explore extremes (low C vs high A highlighted)
    {
      type: "explore",
      title: "Go Low, Go High! 🐻🐦",
      instruction: "Try the LEFT keys for deep sounds... now try the RIGHT keys for bright sounds!",
      notes: LOW_HIGH_PENTATONIC_KEYS,
      minTaps: 5,
    },
    // 2 — Reflective Observation: name with metaphor (AFTER exploration)
    {
      type: "watch",
      title: "Sounds Go Up and Down! 📏",
      instruction: "Let's name what you just heard!",
      content: "Notes on the LEFT side sound LOW — like a big bear growling 🐻. Notes on the RIGHT side sound HIGH — like a little bird singing 🐦! Music moves up and down like climbing stairs. Low notes feel deep and warm, high notes feel bright and light!",
    },
    // 3 — Listen: hear pentatonic ascending staircase
    {
      type: "listen",
      title: "The Sound Staircase 🪜",
      instruction: "Listen to the notes climb from low to high — each step gets a little brighter!",
      content: "Each note is a step up the staircase! C is the lowest, then D, E, G, and A is the highest. Going up sounds bright and hopeful. Going down sounds deep and calm.",
      previewNotes: ["C4", "D4", "E4", "G4", "A4"],
    },
    // 4 — Quiz: which is lower?
    {
      type: "quiz",
      quizLayout: "piano",
      title: "Which Is Lower? 🐻",
      instruction: "Listen to each sound. Which one sounds the LOWEST — like a big bear?",
      options: [
        { label: "1", correct: true, emoji: "🐻", note: "C3", discoveryText: "Yes! That's the lowest sound — deep and warm like a bear!" },
        { label: "2", correct: false, emoji: "🎵", note: "E4", discoveryText: "That's in the middle! The bear sound is even deeper. Try sound 1!" },
        { label: "3", correct: false, emoji: "🐦", note: "A4", discoveryText: "That's the highest sound — it sings like a bird. The bear sound is 1!" },
      ],
    },
    // 5 — Quiz: which is higher?
    {
      type: "quiz",
      quizLayout: "piano",
      title: "Which Is Higher? 🐦",
      instruction: "Now listen again. Which sound is the HIGHEST — like a little bird?",
      options: [
        { label: "1", correct: false, emoji: "🐻", note: "C3", discoveryText: "That's the low one — the bear! The bird sound is much higher. Try sound 3!" },
        { label: "2", correct: false, emoji: "🎵", note: "E4", discoveryText: "That's in the middle — higher than the bear but not the highest. The bird is sound 3!" },
        { label: "3", correct: true, emoji: "🐦", note: "A4", discoveryText: "That's right! That's the highest — it sings like a little bird!" },
      ],
    },
    // 6 — Creation: mix high and low
    {
      type: "explore",
      title: "Make a High-Low Tune! ⭐",
      instruction: "Mix low and high notes together! Try jumping from one end to the other. What patterns can you make?",
      notes: PENTATONIC_KEYS,
      minTaps: 6,
    },
  ],
  reflections: {},
};

// ═══════════════════════════════════════════════════════════════════════════════
// LESSON 6: My First Notes (8 steps, ~8 min)
// Orff: Named pitches within pentatonic; imitation → exploration → creation
// Kolb: Hear each note → Explore individually → Play sequence → Create freely
// Constructivist: scaffold note-by-note, building on pitch direction from L5
// ═══════════════════════════════════════════════════════════════════════════════
const lesson6: LessonData = {
  name: "Lesson 6: My First Notes",
  steps: [
    // 0 — Warm up on pentatonic
    {
      type: "explore",
      title: "Warm Up! 🎹",
      instruction: "Play any keys to warm up — remember, low on the left, high on the right!",
      notes: PENTATONIC_KEYS,
      minTaps: 4,
    },
    // 1 — Listen: meet note C
    {
      type: "listen",
      title: "Meet Note C! 🌟",
      instruction: "This is C — the first note! Tap to hear what C sounds like.",
      content: "C is the first note of music. Think of C as 'home' — songs love to start and end here! C has a warm, steady sound.",
      previewNotes: ["C4"],
    },
    // 2 — Explore: play only C
    {
      type: "explore",
      title: "Play Only C! 🌟",
      instruction: "Tap C a few times — get to know its sound. This is your home note!",
      notes: [{ note: "C", label: "C", color: "#FFB800" }],
      minTaps: 3,
    },
    // 3 — Listen: meet D and E
    {
      type: "listen",
      title: "Meet D and E! 🎵",
      instruction: "Now meet C's neighbors! Tap to hear all three together.",
      content: "D is one step up from C. E is another step up! Together, C, D, E are like climbing 3 stairs. Each step goes a little higher.",
      previewNotes: ["C4", "D4", "E4"],
    },
    // 4 — Explore: try D and E
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
    // 5 — Play: guided sequence C-D-E
    {
      type: "play",
      title: "Play C, D, E! 🎹",
      instruction: "Tap the notes from low to high: C, then D, then E. Use Listen First if you need a reminder!",
      notes: CDE_KEYS,
      sequence: ["C", "D", "E"],
    },
    // 6 — Creation: make a tune with C, D, E
    {
      type: "explore",
      title: "Make a Tune With C, D, E! ⭐",
      instruction: "You know three notes now! Play them in any order — make up your own little tune. There's no wrong way!",
      notes: CDE_KEYS,
      minTaps: 6,
    },
    // 7 — Bonus: expand back to full pentatonic
    {
      type: "explore",
      title: "Pentatonic Playground! 🌈",
      instruction: "You've learned 3 notes — now explore all 5 again! Hear how C, D, E fit together with G and A?",
      notes: PENTATONIC_KEYS,
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

// ═══════════════════════════════════════════════════════════════════════════════
// LESSON 7: My First Song (8 steps, ~10 min)
// Orff: Imitation of real melody, then improvisation; ostinato introduced (D-D-D)
// Kolb: Hear melody → Learn chunks → Play full → Create your own version
// Constructivist: scaffolded phrase-by-phrase, then creative ownership
// ═══════════════════════════════════════════════════════════════════════════════
const lesson7: LessonData = {
  name: "Lesson 7: My First Song",
  steps: [
    // 0 — Warm up with C, D, E
    {
      type: "explore",
      title: "Warm Up! 🎹",
      instruction: "Welcome back! Play C, D, and E to warm up your fingers.",
      notes: CDE_KEYS,
      minTaps: 4,
    },
    // 1 — Listen: hear the full melody
    {
      type: "listen",
      title: "Hear a Melody 🎵",
      instruction: "Tap to hear a real melody played with just three notes! Watch the keys light up.",
      content: "This melody is called 'Hot Cross Buns' — one of the most famous beginner songs! It uses only the three notes you already know: E, D, and C. Listen to how they go down like stairs.",
      previewNotes: ["E4", "D4", "C4", "D4", "D4", "D4", "E4", "D4", "C4"],
    },
    // 2 — Reflective Observation: name what melody is
    {
      type: "watch",
      title: "Notes Tell Stories! 🎶",
      instruction: "Let's learn how notes make melodies!",
      content: "When you play notes in a row, they make a melody — like words making a sentence. A melody is a series of notes that tell a musical story. You already know C, D, and E — that's enough to play a real song!",
    },
    // 3 — Imitation: learn Part 1 (E-D-C)
    {
      type: "play",
      title: "Learn Part 1 🎹",
      instruction: "Play the first phrase: E, D, C — going down the stairs! The next note glows to help you.",
      notes: CDE_KEYS,
      sequence: ["E", "D", "C"],
    },
    // 4 — Imitation: learn Part 2 (D-D-D) — ostinato concept
    {
      type: "play",
      title: "Learn Part 2 🎹",
      instruction: "Now the middle part: D, D, D — three times! This repeating pattern is called an ostinato!",
      notes: CDE_KEYS,
      sequence: ["D", "D", "D"],
    },
    // 5 — Play: full melody (active experimentation)
    {
      type: "play",
      title: "Put It Together! ⭐",
      instruction: "Play the full melody: E-D-C, D-D-D, E-D-C. You've got this!",
      notes: CDE_KEYS,
      sequence: ["E", "D", "C", "D", "D", "D", "E", "D", "C"],
    },
    // 6 — Improvisation: creative reinterpretation (Orff process)
    {
      type: "explore",
      title: "Make It Yours! ⭐",
      instruction: "Can you change the song to sound different? Try mixing up the order of C, D, and E — create your own melody!",
      notes: CDE_KEYS,
      minTaps: 6,
    },
    // 7 — Reflection + creative closure
    {
      type: "explore",
      title: "You Did It! 🌟",
      instruction: "You just played your first song! Keep playing, or tell us what you want to do next.",
      notes: CDE_KEYS,
      minTaps: 0,
    },
  ],
  reflections: {
    7: {
      prompt: "What do you want to do next?",
      optionA: { label: "Play more songs! 🎵", value: "more_songs" },
      optionB: { label: "Make my own! ✨", value: "create_own" },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// LESSON 8: Loud and Soft (7 steps, ~6 min)
// Orff: Dynamics through body percussion FIRST, then piano (body → instrument)
// Kolb: Feel volume with body → Hear on piano → Name dynamics → Create with volume
// ═══════════════════════════════════════════════════════════════════════════════
const lesson8: LessonData = {
  name: "Lesson 8: Loud and Soft",
  steps: [
    // 0 — Body percussion warm-up with volume awareness
    {
      type: "explore",
      title: "Warm Up! 👏",
      instruction: "Tap along with the beat! Try tapping softly... now try tapping HARD!",
      tapAnywhere: true,
      pulsingCircle: true,
      backgroundBeat: { bpm: 100 },
      minTaps: 6,
    },
    // 1 — Concrete Experience: hear the same note soft vs loud
    {
      type: "listen",
      title: "Soft and Loud! 🔊",
      instruction: "Tap to hear the SAME note played two ways — first soft, then LOUD! Watch the wave change size.",
      content: "The same note can feel totally different! A soft note sounds gentle and quiet. A loud note sounds bold and strong. You can control this!",
      previewNotes: ["C4", "C4"],
      previewVelocities: [0.2, 0.9],
    },
    // 2 — Transfer to piano: velocity-sensitive keys
    {
      type: "explore",
      title: "Touch and Feel! 🎹",
      instruction: "Tap the TOP of a key for soft... and the BOTTOM for loud! Hear the difference?",
      notes: PENTATONIC_KEYS,
      velocitySensitive: true,
      minTaps: 6,
    },
    // 3 — Play: dynamic scene matching
    {
      type: "play",
      title: "Match the Scene! 🎭",
      instruction: "Each scene needs a different volume. Play softly or loudly to match!",
      notes: PENTATONIC_KEYS,
      velocitySensitive: true,
      dynamicScenes: [
        { emoji: "😴", label: "Baby sleeping", level: "soft", emojiMedium: "😒", emojiBad: "😭" },
        { emoji: "🎉", label: "Dance party!", level: "loud", emojiMedium: "😐", emojiBad: "😴" },
        { emoji: "🐱", label: "Sneaky cat", level: "soft", emojiMedium: "🙀", emojiBad: "😾" },
      ],
    },
    // 4 — Quiz: ear training
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
    // 5 — Abstract Conceptualization: name dynamics (AFTER feeling them)
    {
      type: "watch",
      title: "You Control the Volume! 🔊",
      instruction: "Let's name what you've been doing!",
      content: "How HARD you play makes a big difference! Soft playing sounds gentle and calm. Loud playing sounds bold and exciting. In music, this is called dynamics — and YOU control it! Musicians use dynamics to tell stories and create feelings.",
    },
    // 6 — Creation: dynamic storytelling
    {
      type: "explore",
      title: "Your Dynamic Story! ⭐",
      instruction: "Tell a story with volume! Start quiet and get louder, or mix it up. What story does your music tell?",
      notes: PENTATONIC_KEYS,
      velocitySensitive: true,
      minTaps: 8,
    },
  ],
  reflections: {
    6: {
      prompt: "What did you like more?",
      optionA: { label: "Playing softly 🤫", value: "soft" },
      optionB: { label: "Playing loudly! 📢", value: "loud" },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// LESSON 9: Fast and Slow (7 steps, ~6 min)
// Orff: Tempo through body movement FIRST, then instruments
// Kolb: Feel tempo in body → Hear contrast → Control slider → Create at chosen speed
// ═══════════════════════════════════════════════════════════════════════════════
const lesson9: LessonData = {
  name: "Lesson 9: Fast and Slow",
  steps: [
    // 0 — Body percussion warm-up with tempo awareness
    {
      type: "explore",
      title: "Warm Up! 👏",
      instruction: "Tap along with the beat! Is this fast or slow?",
      tapAnywhere: true,
      pulsingCircle: true,
      backgroundBeat: { bpm: 100 },
      minTaps: 4,
    },
    // 1 — Concrete Experience: hear same melody at two speeds
    {
      type: "listen",
      title: "Two Speeds! 🐢🐇",
      instruction: "Tap to hear the same melody slow, then fast! Feel how different they are.",
      content: "Music can move slowly or quickly — this is called TEMPO! A slow tempo feels calm and relaxed. A fast tempo feels exciting and energetic. The same notes feel totally different depending on the speed!",
      tempoListenDemo: {
        slowBpm: 80,
        fastBpm: 180,
        sequence: ["C", "D", "E", "D", "C"],
      },
    },
    // 2 — Active Experimentation: tempo slider
    {
      type: "explore",
      title: "Speed Control! 🎚️",
      instruction: "Drag the slider to change the speed! Watch the character speed up and slow down.",
      tempoSlider: true,
      tempoRange: [60, 180],
      tempoSliderMinMoves: 3,
      minTaps: 0,
    },
    // 3 — Play: guided sequence at slow tempo
    {
      type: "play",
      title: "Slow Song 🐢",
      instruction: "Play C-D-E-D-C following the slow beat. Watch the pulse dots and play along!",
      notes: CDE_KEYS,
      sequence: ["C", "D", "E", "D", "C"],
      pulseGuide: { bpm: 80 },
    },
    // 4 — Play: same melody at fast tempo
    {
      type: "play",
      title: "Fast Song 🐇",
      instruction: "Same melody, but faster! Play C-D-E-D-C with the quick beat!",
      notes: CDE_KEYS,
      sequence: ["C", "D", "E", "D", "C"],
      pulseGuide: { bpm: 160 },
    },
    // 5 — Quiz: categorize audio clips
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
    // 6 — Creation: DJ Mode
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
    6: {
      prompt: "What speed do you like best?",
      optionA: { label: "Slow and chill 🐢", value: "slow" },
      optionB: { label: "Fast and exciting! 🐇", value: "fast" },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// LESSON 10: My Music — Capstone (6 steps, ~8 min)
// Orff: Full creative cycle — choose, set, compose, perform
// Kolb: Full cycle culminating in original creation
// Constructivist: synthesize all prior knowledge into original work
// ═══════════════════════════════════════════════════════════════════════════════
const lesson10: LessonData = {
  name: "Lesson 10: My Music",
  steps: [
    // 0 — Watch: recap the journey
    {
      type: "watch",
      title: "You're a Musician! 🎉",
      instruction: "Look how far you've come!",
      content: "You started by making sounds with your body — clapping, tapping, feeling the beat! Then you learned drums, discovered the piano, played high and low, learned C, D, and E, and played your first song. You can play loud and soft, fast and slow. Now it's time for the most exciting part — making YOUR OWN music!",
    },
    // 1 — Explore: instrument picker
    {
      type: "explore",
      title: "Choose Your Sound! 🎶",
      instruction: "Tap each instrument to hear it, then pick your FAVORITE — that's the sound for your song!",
      instruments: INSTRUMENT_CARDS,
      minTaps: 5,
      pickFavorite: true,
      capstoneInstrumentPicker: true,
    },
    // 2 — Explore: tempo + velocity + pentatonic piano
    {
      type: "explore",
      title: "Set the Stage! 🎚️",
      instruction: "Pick your speed and try playing soft and loud!",
      notes: PENTATONIC_KEYS,
      tempoSlider: true,
      tempoRange: [60, 180],
      tempoSliderMinMoves: 2,
      velocitySensitive: true,
      minTaps: 6,
    },
    // 3 — Explore: recorder + form builder with pentatonic
    {
      type: "explore",
      title: "Compose! 🎵",
      instruction: "Record two musical ideas (A and B), then arrange them into YOUR song!",
      recorder: true,
      recorderKeys: PENTATONIC_KEYS,
      minTaps: 0,
    },
    // 4 — Listen: composition playback
    {
      type: "listen",
      title: "Listen to Your Song! 🎧",
      instruction: "Tap Play to hear your composition!",
      content: "This is YOUR music — you chose the instrument, the speed, and every note. You're a composer now!",
      compositionPlayback: true,
    },
    // 5 — Explore: what's next
    {
      type: "explore",
      title: "What's Next? 🚀",
      instruction: "You've completed all the lessons! What do you want to do next?",
      choicePicker: [
        { label: "Learn more notes!", emoji: "🎹", value: "more_notes" },
        { label: "Try harder rhythms!", emoji: "🥁", value: "harder_rhythms" },
        { label: "Make another song!", emoji: "✨", value: "another_song" },
      ],
      minTaps: 0,
    },
  ],
  reflections: {},
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
  "9": lesson9,
  "10": lesson10,
};
