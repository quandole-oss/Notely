# Notely

A child-first music school for ages 6–12. Ten short lessons take a complete beginner from "I've never made music" to "I composed my own piece," using nothing but a browser — no teacher, no instrument, no account.

```bash
pnpm install
pnpm dev         # http://localhost:3000
```

---

## What a student learns

Ten lessons, roughly five to ten minutes each. The sequence is deliberate: body before hands, rhythm before pitch, listening before naming, naming before creating.

| # | Lesson                  | Learning outcome                                                                     |
| - | ----------------------- | ------------------------------------------------------------------------------------ |
| 1 | Let's Make Sounds       | Your body is an instrument. Clap, stomp, pat — that is already music.                |
| 2 | Feel the Beat           | Internalize a steady pulse. Tap with a heartbeat at 100 BPM.                         |
| 3 | Long and Short Sounds   | Hold a key to hear *long*; release quickly for *short*. Duration is a choice.        |
| 4 | High and Low            | Map pitch to space. Low notes live at the left of the keyboard, high notes at the right. |
| 5 | Meet the Piano          | Black and white keys, pattern of 2s and 3s, why middle C is middle.                  |
| 6 | My First Notes          | Letter names A–G. Find C, D, E by sight and by ear.                                  |
| 7 | My First Song           | Play "Hot Cross Buns" (E-D-C) by following a guided sequence.                        |
| 8 | Loud and Soft           | Dynamics. Velocity-sensitive keys: press hard for *forte*, softly for *piano*.       |
| 9 | Fast and Slow           | Tempo. Drag a slider from 60 to 180 BPM and hear the same phrase change character.   |
| 10 | My Music                | Compose and record a short piece on a pentatonic recorder. Play it back.            |

By the end, a student has: felt a pulse, distinguished duration/pitch/dynamics/tempo, named the notes C–G, played a real song, and composed and recorded something of their own.

---

## Why it's built the way it is

### Pedagogy drives the product

The lesson order and interaction patterns come from three converging frameworks:

- **Orff Schulwerk** — music starts with the body, moves to unpitched percussion, then to pitched instruments. Lesson 1 is literally clapping. Drum pads appear in Lesson 2. Melodic notes don't show up until Lesson 4. This is why there is no "Hello, press Middle C" first screen.
- **Kolb's experiential cycle** — every lesson runs Experience → Observe → Conceptualize → Experiment. The student *does* the thing before we name it. Step 0 of Lesson 1 is tapping along; step 1 is the explanation of what just happened. Naming comes after feeling, always.
- **Constructivism** — no punishment for wrong answers. Wrong options wobble and play a gentle prompt to try again; correct options flood with color and a chime. A six-year-old should never feel they "failed" this app.

### Pentatonic by default

The melody lessons use a C pentatonic scale (C-D-E-G-A) with F and B visually dimmed. Any combination of those five notes sounds musical together. A child mashing keys produces something that sounds intentional, which removes the single biggest source of early-learner discouragement. F and B only come online in the full-keyboard lesson once the student has ear-anchored the pentatonic.

### Letter names, not solfege

We teach **C D E F G A B**, not Do-Re-Mi. Solfege is powerful but requires sung pitch reference a child working alone in a browser doesn't have. Letter names map 1:1 to the keyboard keys they can see, and to the physical A-S-D-F-G-H-J mapping on their laptop.

### Web Audio API, not audio files

The piano is synthesized in `client/src/hooks/useAudio.ts` — sine + triangle oscillators through an ADSR envelope, with a biquad filter for warmth. No `.mp3`, no `.wav`, no asset pipeline. This matters because:

- Zero load time. A note plays the frame the key is pressed.
- No bandwidth cost on mobile or a school's spotty Wi-Fi.
- Velocity and duration are *real*, not picked from a small set of samples. Lesson 8 (dynamics) works because the oscillator's gain is a continuous function of how hard the key is pressed. Lesson 3 (long/short) works because `startNote` / `stopNote` literally hold the envelope open until `pointerup`.

### Frontend-only on purpose

Progress lives in `localStorage` (`notely_student`, `notely_progress`, `notely_bestMoments`). There is no backend account, no sign-up, no email. A parent or teacher can open the URL and have a kid playing in ten seconds. When the product graduates to a backend, the data contracts already exist — lesson steps are typed arrays in `client/src/data/lessons.ts` ready to move to a database.

### Sunny Studio design system

Bauhaus-inspired, warm, saturated. Yellow `#FFB800`, coral `#FF5C35`, sky `#4AABF5`, mint `#3ECFA4`, cream `#FEFAF3`, charcoal `#1A1A2E`. Baloo 2 for headings (rounded, reads well at size), DM Sans for body. Spring easing `cubic-bezier(0.34, 1.56, 0.64, 1)` — bouncy but never jittery. The goal is a UI that feels like a wooden toy, not a SaaS dashboard.

---

## Tech stack

- **React 19** + TypeScript (strict) + **Vite 7**
- **Tailwind CSS 4** with a custom design system in `client/src/index.css`
- **Wouter** for routing (patched; tiny footprint)
- **Radix UI + shadcn/ui** for primitives (50+ components in `client/src/components/ui/`)
- **Framer Motion** for feedback animations
- **Web Audio API** for all sound (no external audio libraries)
- **Express** for static serving in production
- **pnpm** package manager

## Project layout

```
client/src/
  pages/          Onboarding, Dashboard, Lesson, Practice, Progress, SkillTree
  data/lessons.ts All 10 lessons as typed step arrays
  hooks/
    useAudio.ts   Web Audio synthesis (piano, drums, chimes)
    useComposition.ts  Recording + playback for Lesson 10
  components/ui/  shadcn/ui — do not hand-edit
  index.css       Sunny Studio design tokens
server/index.ts   Express static server with SPA fallback
shared/           Cross-boundary constants
```

Path aliases: `@/*` → `client/src/*`, `@shared/*` → `shared/*`.

## Scripts

```bash
pnpm dev       # Vite dev server on :3000
pnpm build     # Vite client bundle + esbuild server bundle → dist/
pnpm start     # Production server (NODE_ENV=production)
pnpm check     # TypeScript type-check, no emit
pnpm format    # Prettier
```

## Keyboard

In the Lesson Player and Practice Room: `A S D F G H J` → `C D E F G A B`.

---

## Status

Frontend-only. No backend, no tests, no auth. Lesson content is hard-coded; progress is local. The app is production-deployable as a static bundle today and designed to grow a backend without rewriting the lesson layer.
