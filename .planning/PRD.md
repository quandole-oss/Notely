# Notely — Product Requirements Document

| Field           | Value                                                                |
| --------------- | -------------------------------------------------------------------- |
| Version         | 0.3 (2026-05-11) — second audit pass; replaces 0.2 (which replaced 0.1) |
| Status          | v1 shipped (frontend-only, deployable as static client or Node app)  |
| Owner           | Quan Le                                                              |
| Audience        | Future contributors and self — for product intent and scope decisions |
| Source of truth | This document for *intent*; the codebase for *behavior*              |
| Amendment       | Edits to §3-§7 require updating §15 "Open questions"; pedagogy in §5 is load-bearing — change only with deliberate justification |

> **Verification convention.** Claims are grounded with `file:line` references where verifiable. Items prefixed *(unverified)* are stated but not empirically confirmed.

---

## 1. One-liner

Notely is a browser-based, child-first music school for ages 6–12. Ten short lessons take a complete beginner from "I've never made music" to "I composed my own piece," with no teacher, no physical instrument, and no account.

---

## 2. Problem statement

Beginner music education has three persistent failure modes:

1. **High activation cost.** A child needs an instrument, a teacher or app subscription, and a parent willing to set it up. Most kids never get past the setup.
2. **Notation-first curricula.** Apps and books typically teach staff reading and note names before the child has felt a pulse or distinguished pitch. Conceptualization precedes experience, which inverts how children actually learn.
3. **Punishing feedback loops.** "Wrong note" red X's, score-based grading, and atonal mistakes (mashing random keys produces dissonance) train kids to associate music with failure within minutes.

Notely is built to remove each of these.

| Problem               | Notely's response                                                                  |
| --------------------- | ---------------------------------------------------------------------------------- |
| Activation cost       | Open URL, play in seconds. No signup, no install, no instrument required.          |
| Notation-first        | Body before hands, rhythm before pitch, feeling before naming (Orff + Kolb).       |
| Punishing feedback    | Wrong answers wobble and offer a gentle retry; correct answers flood with color.   |
| Atonal mistakes       | Pentatonic by default (C-D-E-G-A). Any combination of notes sounds intentional.    |

---

## 3. Target users

### Primary: Beginner child, ages 6–12, working alone

- Can read at roughly a 1st-grade level (single-sentence instructions, large type, emoji cues).
- Owns or has access to a laptop, tablet, or phone with a modern browser. No piano, no MIDI keyboard.
- No teacher present during the session. A parent or guardian opened the URL and walked away.
- Attention budget per session: ~5–10 minutes per lesson; may not return for days.

### Secondary: Parent or teacher facilitating

- Wants something they can hand off ("here, play with this") without becoming the curriculum themselves.
- Needs zero technical setup. URL works; no accounts to manage.
- (Roadmap §11) Wants visibility into what the child did and what to try next.

### Non-users (explicit)

- Intermediate-to-advanced students wanting theory drills.
- Anyone needing staff notation, interval ear training, or chord theory at v1.
- Children under 6 (instructions assume some reading ability) or over 12 (tone is calibrated younger).

---

## 4. Goals & success metrics

### G1. Learning outcomes achieved
By Lesson 10 the student can demonstrably:
- Tap a steady pulse.
- Distinguish long vs. short, high vs. low, loud vs. soft, fast vs. slow.
- Name and locate C, D, E (and find G, A by extension).
- Play "Hot Cross Buns" (E-D-C) end-to-end.
- Compose and play back a short pentatonic piece (Lesson 10 capstone, *session-only — not persisted*).

**Measure:** Lesson 10 completion in `notely_progress` is the proxy. No telemetry today; see §15.

### G2. Joy / retention
A six-year-old should never feel they "failed" the app. Sessions end on a positive moment.

**Measure (qualitative, today):** UX rules enforce this — no red X's, no scoring, wrong answers wobble and retry (`Lesson.tsx:910-911`: success/error chimes, no failure state), every lesson ends in `playCelebration` (`Lesson.tsx:1040`). Quantitative measures require a backend.

### G3. Zero-friction onboarding
Parent or teacher opens the URL → child is making sound quickly.

**Measure:** Onboarding is 3 steps (welcome → name + avatar + instrument → 3-note melody play) and writes a single localStorage key (`Onboarding.tsx:65-68`). No network calls. The "10-second" promise from the README is a *target*, not a measured number.

### G4. Accessibility / reach
Runs on any modern browser, any device, any bandwidth. No app store, no install.

**Measure:**
- Bundle is static (Vite build → `dist/public/`), servable from any static host.
- Audio is synthesized (`useAudio.ts`) — no `.mp3`/`.wav` assets, zero audio bandwidth at runtime.
- Touch + keyboard both supported (`A-S-D-F-G-H-J` → `C-D-E-F-G-A-B`).
- *(unverified)* Device-class testing matrix: see §10 NFR for intended support.

---

## 5. Pedagogical principles (load-bearing — do not refactor away)

These drive lesson order, interaction patterns, and the audio engine. A contributor changing them is changing the product.

| Principle              | What it dictates                                                                  | Where it lives                                            |
| ---------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Orff Schulwerk**     | Body → unpitched percussion → pitched instruments. L1 is clapping; melodic notes don't appear until L4. | `client/src/data/lessons.ts` lesson order             |
| **Kolb experiential**  | Every lesson is Experience → Observe → Conceptualize → Experiment. Do before name. | Step types `explore`/`play` (do) → `watch`/`listen` (observe) → `quiz` (test understanding) |
| **Constructivism**     | No punishment. Wrong answer keeps the option active for a re-try — coral feedback + error chime, no score loss. Correct answer turns the option mint with a success chime. (README mentions a "wobble" animation; not in code today — see AC-5.1.) | `Lesson.tsx` quiz feedback handlers (`:905-912`, render at `:2801-2831`) |
| **Pentatonic default** | C-D-E-G-A. F and B visually dimmed until L5. Mashing keys sounds intentional.     | `PENTATONIC_KEYS`, `PENTATONIC_DIMMED_KEYS` (`lessons.ts:72-89`) |
| **Letter names only (UX rule)** | C-D-E-F-G-A-B. Lesson copy never uses Do-Re-Mi. | Lesson copy in `lessons.ts`; reinforced in user memory `feedback_no_solfege.md` |

**Sleeper risk on letter-names-only:** the audio engine *accepts* solfege input. `useAudio.ts:33-36` maps `DO/RE/MI/FA/SOL/LA/SI` to the chromatic notes. This is engine convenience, not a curriculum decision. New lesson copy must continue to avoid those tokens; a code review check is warranted before any L11+ ships.

---

## 6. Scope — in v1

### 6.1 Lesson curriculum (10 lessons)

All lessons live in `client/src/data/lessons.ts` keyed by string ID `"1"`–`"10"`. Each is a `LessonData` with `name`, `steps[]`, and `reflections{}`. Step types: `watch | listen | play | quiz | explore` (`lessons.ts:12`).

| ID  | Lesson                  | Learning outcome                                                                 |
| --- | ----------------------- | -------------------------------------------------------------------------------- |
| 1   | Let's Make Sounds       | Body percussion — clap, stomp, pat.                                              |
| 2   | Feel the Beat           | Tap a steady pulse at 100 BPM. Drum pads (boom/tick) introduced.                 |
| 3   | Long and Short Sounds   | Sustain vs. staccato. Mechanic mix (see §6.4 below).                             |
| 4   | High and Low            | Pitch ↔ horizontal position on the keyboard.                                     |
| 5   | Meet the Piano          | Black/white pattern, middle C. Full keyboard introduced.                         |
| 6   | My First Notes          | Letter names A–G. Find C, D, E by sight and by ear.                              |
| 7   | My First Song           | Play "Hot Cross Buns" (E-D-C) following a guided sequence.                       |
| 8   | Loud and Soft           | Dynamics via velocity-sensitive keys.                                            |
| 9   | Fast and Slow           | Tempo slider 60–180 BPM; same phrase, different character.                       |
| 10  | My Music                | Capstone: build A/B phrases on a pentatonic recorder, sequence them, play back.  |

### 6.2 Routes & pages

| Route          | Page          | What it does                                                                          | File                                  |
| -------------- | ------------- | ------------------------------------------------------------------------------------- | ------------------------------------- |
| `/`            | Onboarding    | 3-step wizard: welcome → name + avatar + instrument → first 3-note melody.            | `client/src/pages/Onboarding.tsx`     |
| `/dashboard`   | Dashboard     | Lesson list, mood check modal, session recap banner.                                  | `client/src/pages/Dashboard.tsx`      |
| `/lesson/:id`  | Lesson Player | Step-by-step lesson runner. Renders any of 5 step types.                              | `client/src/pages/Lesson.tsx` (~3K LOC) |
| `/practice`    | Practice Room | Free-play piano, rhythm tapper, "play along" songs.                                   | `client/src/pages/Practice.tsx`       |
| `/progress`    | Progress      | Achievement badges, skill display, weekly chart. **Mostly cosmetic in v1 (see §6.7).** | `client/src/pages/Progress.tsx`       |
| `/skill-tree`  | Skill Tree    | 10-node musical-note (♪) constellation. Linear unlock driven by real progress.        | `client/src/pages/SkillTree.tsx`      |
| `/404`         | NotFound      | Fallback for unmatched routes.                                                        | `client/src/pages/NotFound.tsx`       |

Conditional bottom nav: `PAGES_WITH_NAV = ["/dashboard", "/practice", "/progress", "/skill-tree"]` plus any path starting with `/lesson` (`App.tsx:16,20`).

### 6.3 Audio engine — `client/src/hooks/useAudio.ts`

Exposed via the `useAudio()` hook (`useAudio.ts:418-428`):

| Function | Signature | Purpose |
| --- | --- | --- |
| `playNote` | `(note, duration = 1.2, velocity = 0.8) => void` (`:69`) | Synthesize a piano-like note. 3 oscillators (sine fundamental, triangle 2nd harmonic, sine 3rd harmonic), ADSR envelope, lowpass biquad filter scaled by velocity. |
| `startNote` / `stopNote` | `(note, velocity = 0.8)` / `(note)` (`:316`, `:384`) | Sustain mode: opens envelope on press, releases on call. Used by Lesson 3. |
| `playSuccessChime` | `()` (`:141`) | C4-E4-G4 ascending arpeggio. Correct-answer feedback. |
| `playErrorSound` | `()` (`:150`) | E4-C4 descending. Wrong-answer feedback (no punishment, just acknowledgment). |
| `playCelebration` | `()` (`:158`) | C4-E4-G4-C5 fanfare. Lesson completion. |
| `playDrumTap` | `(type: "kick"\|"snare"\|"hihat")` (`:168`) | Filtered-noise + sine-thump percussion synthesis. |
| `playInstrumentNote` | `(instrument, note = "C4", duration = 0.8)` (`:232`) | Capstone playback: timbre varies by chosen instrument (piano/drums/guitar/winds/brass). |

**Hard constraint:** no external audio files. All sound is synthesized in-browser. Justification in §12.

**Solfege aliases exist in the engine but are not used by lesson copy** (`useAudio.ts:33-36`). See §5 sleeper risk.

### 6.4 Lesson 3 (Long and Short Sounds) — mechanic mix

Lesson 3 is **not** purely sustain. Breakdown of its 5 steps (`lessons.ts` lesson3 block):

| Step | Title | Type | Mechanic |
| --- | --- | --- | --- |
| 0 | Hold and Tap! 🎹 | explore | `sustainMode: true` — hold-to-play via `startNote`/`stopNote` |
| 1 | Long... and Short! 🎵 | explore | `sustainMode: true` |
| 2 | You Made Long and Short Sounds! 🧩 | watch | animation/explanation only |
| 3 | Long or Short? 👂 | quiz | `durationQuiz` — listen, identify |
| 4 | Your Long-Short Song! ⭐ | explore | `sustainMode: true` |

Sustain mode is the dominant mechanic but the lesson also uses a duration quiz to test pattern recognition independently of motor skill.

### 6.5 Capstone composition (Lesson 10)

**Lives entirely in `Lesson.tsx` state** — no dedicated hook. The misnamed `client/src/hooks/useComposition.ts` is an **IME text-input helper** unrelated to music; do not refactor capstone logic into it.

Capstone state (`Lesson.tsx:128-135`, all `useState` hooks under the `// ─── Capstone / Recording state` block):

- `capstoneInstrument: string | null` — chosen timbre. Engine supports piano / drums / guitar / flute / trumpet (`useAudio.ts:232-305`), surfaced as Keyboard / Drums / Guitar / Winds / Brass (`lessons.ts:113-119`).
- `phraseA: { note, velocity, time }[]` — recorded notes for phrase A. `time` is ms offset from `recordStartRef`.
- `phraseB: { note, velocity, time }[]` — same for phrase B.
- `compositionForm: ("A" | "B")[]` — sequence of section labels (max 6 entries, gated at `:518`).
- `compositionPlaying: boolean` — playback flag.

Playback (`:528-559`) walks `compositionForm`, plays each section's phrase with the chosen instrument timbre, gapped by 600ms between sections.

**Compositions are session-only.** On lesson completion (`:1050-1052`), `phraseA`, `phraseB`, and `compositionForm` are reset to empty. No persistence. The "save to best moments" button persists only a metadata stub — see §6.6.

### 6.6 Persistence — localStorage inventory (5 keys)

All keys are client-only. No server.

| Key | Shape | Written by | Purpose |
| --- | --- | --- | --- |
| `notely_student` | `{ name: string, avatar: string, instrument: string }` | `Onboarding.tsx:65-68` | Profile from onboarding wizard |
| `notely_progress` | `Record<lessonId, { completed: boolean, stars: number }>` | `Lesson.tsx:1045-1047` | Drives SkillTree unlock + Dashboard "current" badge |
| `notely_session` | `{ lastMoodDate?: "YYYY-MM-DD", mood?: "energetic"\|"calm"\|"tired", lastSessionSummary?: { lessonName, notesPlayed, dismissed } }` | `MoodCheck.tsx:26-29` (mood + date), `Lesson.tsx:1041-1043` (recap), `Dashboard.tsx:90-93` (recap dismissal) | Mood check daily prompt + post-lesson recap banner |
| `notely_reflections` | `Array<{ lessonId, stepIndex, answer, timestamp }>` | `Lesson.tsx:564-566`, `:917-919` | Per-lesson A/B reflection answers — append-only log |
| `notely_best_moments` | `Array<{ id, label, emoji, savedAt }>` | `Lesson.tsx:1062-1064` | **Metadata stubs only — no audio data.** Display on a "wall" via `BestMomentsWall` component. |

### 6.7 Progress page — placeholder data warning

`Progress.tsx` displays achievements, skill levels, weekly practice minutes, total stars, and a streak counter. **As of v0.2, these are hardcoded constants, not derived from real state.**

- `ACHIEVEMENTS` array with hardcoded `earned: true/false` (`Progress.tsx:12-21`).
- `SKILLS` levels hardcoded 1–3 (`:23-29`).
- `WEEKLY_PRACTICE` minutes hardcoded (`:31-39`).
- `totalStars = 7`, `practiceStreak = 3` hardcoded (`:48-49`).
- Dashboard similarly hardcodes `xpPercent = 42`, `streak = 3` (`Dashboard.tsx:105-106`).

This is a known v1 shortcut — the page exists for visual feedback and to communicate the *shape* of future progress tracking. Real derivation is a v1.1 task (see §11).

The only data-driven progress UI in v1 is **SkillTree.tsx**, which reads `notely_progress` and re-syncs on `storage` events and visibility change (`SkillTree.tsx:65-76`).

### 6.8 Per-lesson reflections

After certain `play` or `explore` steps, a 2-option A/B prompt appears (`Lesson.tsx:142` — `hasReflection` derivation). The `LessonData.reflections: Record<stepIndex, ReflectionPrompt>` map (`lessons.ts:63-67`) defines which steps prompt and with what copy:

```ts
type ReflectionPrompt = {
  prompt: string;
  optionA: { label: string; value: string };
  optionB: { label: string; value: string };
};
```

Answers are appended to `notely_reflections` (no aggregation or display in v1).

### 6.9 Mood check + session recap

Both run on Dashboard mount (`Dashboard.tsx:60-81`):

- **Mood check:** if `notely_session.lastMoodDate` ≠ today, show `<MoodCheck />`. Captures one of `"energetic" | "calm" | "tired"`. Used (currently) to seed Dashboard tone — no behavioral filtering wired in yet (`filteredLessons = lessons` at `:102`).
- **Session recap:** if `notely_session.lastSessionSummary` exists and isn't dismissed, show `<SessionRecap />` with last lesson name + note count. Dismiss flips the flag.

---

## 7. Scope — out of v1

Explicitly **not** in v1. Documented so future contributors don't reintroduce them by accident.

- **No accounts.** No email, password, OAuth, or server-side user record. Profile is local-only.
- **No backend API.** Lesson content is hard-coded in `client/src/data/lessons.ts`. No fetches, no DB.
- **No multi-device sync.** Closing the browser on device A and opening on device B starts a new student.
- **No teacher/parent dashboard.** Adults cannot view child progress in v1.
- **No real achievements engine.** Progress.tsx is a placeholder (§6.7).
- **No composition persistence.** Capstone compositions exist only for the session in which they're made.
- **No staff notation.** Letter names only.
- **No solfege in lesson copy.** Engine has aliases but lessons must not use them (§5).
- **No analytics or telemetry.** No tracking, no A/B framework, no error reporting.
- **No internationalization.** English only.
- **No tests in CI.** `vitest` is installed (`package.json:89`) but no test files exist; the README states this explicitly.

---

## 8. Key user flows

### 8.1 First-time user

```
Parent opens URL on tablet
  ↓
Onboarding step 0 — welcome splash + Noto bounce
  ↓
Onboarding step 1 — type name, pick avatar, pick instrument
  ↓
Onboarding step 2 — tap C/E/G keys → hear notes + celebration on 3rd
  ↓
notely_student persisted, navigate → /dashboard
  ↓
Mood check modal (if first session of day) → captures mood
  ↓
Lesson 1 highlighted as "current"
```

### 8.2 Completing a lesson

```
Dashboard → tap lesson card → /lesson/:id
  ↓
Lesson.tsx loads LESSONS[id] (fallback to "1" on miss; ARCHITECTURE.md confirms)
  ↓
Steps render in order. Per-step type:
  - explore  : interact freely (drum pads / piano / recorder / pickers)
  - watch    : animation / explanation
  - listen   : tap to hear, then identify
  - play     : guided sequence (e.g. E-D-C for Hot Cross Buns)
  - quiz     : 2–4 options; wrong wobbles, right floods + chime
  ↓
On certain play/explore steps: A/B reflection prompt → appended to notely_reflections
  ↓
On final step:
  - playCelebration() → audible
  - notely_session.lastSessionSummary updated
  - notely_progress[id] = { completed: true, stars: 3 }
  - "Save to Best Moments" button writes a metadata stub
  ↓
SkillTree storage listener fires → next node unlocks
  ↓
Return to Dashboard → "current" badge advances
```

### 8.3 Free practice

```
/practice → Practice Room
  ↓
Modes: piano free-play / rhythm tapper / play-along songs
  ↓
Same useAudio engine. No progress writes.
```

---

## 9. Acceptance criteria

Testable assertions tied to v1 features. *(unverified)* flag means the criterion has not been automated or manually run end-to-end.

### AC-1 Lessons
- **AC-1.1** All 10 lessons load via `/lesson/1` … `/lesson/10`. **Verified** by route definition (`App.tsx:28`) and lesson map (`lessons.ts:903-913`).
- **AC-1.2** Visiting `/lesson/{nonexistent}` falls back to lesson 1 without crashing. **Verified by code** (`Lesson.tsx:38`: `LESSONS[lessonId] ?? LESSONS["1"]`); no runtime test for the route round-trip.
- **AC-1.3** Step types are exactly `watch | listen | play | quiz | explore` (closed set). **Verified** (`lessons.ts:12`).
- **AC-1.4** Every lesson ends in `playCelebration` and writes `notely_progress[id]`. **Verified** (`Lesson.tsx:1040-1047`).

### AC-2 Audio
- **AC-2.1** `playNote(note, duration, velocity)` returns synchronously and starts the oscillator on the same frame as the call. *(unverified — no perf test)*
- **AC-2.2** Sustain via `startNote`/`stopNote` holds the envelope open until `stopNote` is called. **Verified by code path** (`useAudio.ts:316-414`); no automated test.
- **AC-2.3** Velocity input scales gain continuously, not in buckets. **Verified by code** (`useAudio.ts:74,87`).
- **AC-2.4** AudioContext auto-resumes from `suspended` state on first user interaction. **Verified** (`useAudio.ts:47-50`); *(unverified)* on iOS Safari specifically.

### AC-3 Input
- **AC-3.1** Piano UIs accept both pointer and keyboard (A-S-D-F-G-H-J → C-D-E-F-G-A-B). *(unverified — claim from README; no test coverage)*
- **AC-3.2** Touch targets ≥ 44px. *(unverified — no automated check)*

### AC-4 Persistence
- **AC-4.1** Onboarding writes `notely_student` synchronously before `navigate("/dashboard")`. **Verified** (`Onboarding.tsx:65-69`).
- **AC-4.2** Lesson completion writes `notely_progress[id]` before `setLessonComplete(true)`. **Verified** (`Lesson.tsx:1045-1054`).
- **AC-4.3** Absent or corrupted localStorage keys default safely (no crash). *(unverified — relies on `JSON.parse(... || "{}")` pattern; malformed JSON would throw)*

### AC-5 Feedback
- **AC-5.1** Wrong quiz answers play `playErrorSound` and apply a coral-bordered visual state (`bg #FFF3E0`, border `#FF5C35`) with a ✗ icon — never the word "wrong," never red, never a score deduction. **Verified** (handler: `Lesson.tsx:905-911`; render: `:2801-2831`). The README's "wobble" animation language is aspirational — no wobble/shake animation is wired to quiz wrong-answers in v1; the only `notely-shake` use is for dynamic-scene mismatches in Lesson 8 (`Lesson.tsx:1627-1628`).
- **AC-5.2** Correct answers play `playSuccessChime` and apply a mint-bordered visual state (`bg #E8F5E9`, border `#3ECFA4`) with a ✓ icon. **Verified** (`Lesson.tsx:910`, `:2801`, `:2831`).

---

## 10. Non-functional requirements

| Area              | Requirement                                                                          | Status |
| ----------------- | ------------------------------------------------------------------------------------ | ------ |
| Performance       | Target: time-to-first-note within seconds of page load. Note-on latency synchronous with input. | Target, unmeasured |
| Bandwidth         | No audio assets fetched at runtime. Initial JS bundle is the only payload.           | **Enforced by architecture** |
| Browser support   | Intended: evergreen browsers with Web Audio API + Pointer Events. Includes mobile Safari, Chrome, Firefox. | Intended; not validated by a tested matrix |
| Devices           | Intended: phone (portrait), tablet, laptop, desktop. Minimum 320px width.            | Intended; *(unverified)* |
| Accessibility     | Touch targets sized for children, charcoal-on-cream high contrast, keyboard piano support. **Gaps:** no ARIA audit, no focus management pass, no screen-reader support claim. | Partial; gap acknowledged |
| Privacy           | No network requests after page load. No tracking. Profile and progress local-only.   | **Enforced by architecture** |
| Offline           | Static bundle + localStorage means the app *should* work offline after first load. No service worker; not a true PWA. | Best-effort, not guaranteed |
| Security          | No auth surface. No user-supplied content rendered as HTML. No third-party runtime scripts. | **Enforced by architecture** |

---

## 11. Roadmap (post-v1)

Confirmed direction; no committed dates.

### R-1. More lessons / curriculum depth
- Intervals (2nds, 3rds, 5ths) by ear.
- Major triads first, then minor.
- Basic staff notation — introduced *after* fluent play (Orff order preserved).
- More songs in Practice Room. Currently three (`Practice.tsx:39-43`): "Mary Had a Little Lamb," "Hot Cross Buns," "Twinkle Twinkle." Candidate additions: "Ode to Joy," "Frère Jacques," "Old MacDonald."
- Additional capstone instruments beyond piano (the recorder timbre map already supports this — `INSTRUMENT_CARDS` at `lessons.ts:113-119`).

**Constraint:** new lessons slot in by *concept difficulty*, not chronologically appended.

### R-2. Parent / teacher view
- Read-only adult view: lessons completed, current skill node, best moments, reflections log, suggested next session.
- **Open question:** local-only ("Parent" toggle) or remote (requires R-3)?
- Must not gate the child experience — adult is observer, not gatekeeper.

### R-3. Real progress derivation (implicit prerequisite for R-2)
- Replace hardcoded ACHIEVEMENTS / SKILLS / streak / totalStars on `Progress.tsx` with values derived from `notely_progress`, `notely_reflections`, and (future) practice timing.
- Wire mood (`notely_session.mood`) into lesson filtering — Dashboard has the hook (`filteredLessons`, currently a no-op pass-through `:102`) but no logic.

### R-4. Backend (only if R-2 or R-1 demand it)
- localStorage keys map cleanly: `notely_student` → users row, `notely_progress` → lesson_progress rows, `notely_reflections` → reflections rows, `notely_best_moments` → moments rows.
- `notely_session` is per-device ephemera; would not move.
- Lesson data already typed (`LessonData`) — moves to a CMS or DB without rewriting the player.

### R-5. Composition persistence
- Save Lesson 10 compositions (the `phraseA`/`phraseB`/`compositionForm` triplet) so children can return to their own work. Either localStorage (risky — see §13 risk #3) or backend.

### Explicitly **not** roadmapped
- Gamification XP / leaderboards / pressure-streaks. Joy comes from the music, not the score.
- Social features. A tool for a child alone with music, not a community.
- Ads, IAP, subscription.

---

## 12. Constraints, decisions, and their reasons

### Frontend-only on purpose (for now)
Removes activation cost (URL → playing in seconds) and operational burden (no servers, no auth, no GDPR/COPPA surface). Cost: no multi-device sync. Accepted at v1 because a single-child-on-a-single-device session is the dominant use case.

### Web Audio API, no sample files
- Zero load time — a note plays the same frame the key is pressed.
- Zero bandwidth — school Wi-Fi friendly.
- Continuous velocity and duration are *real*, not snap-to-sample. Lessons 3 and 8 require this.

### Letter names in lesson copy (engine accepts solfege)
Solfege requires a sung pitch reference that a solo child doesn't have. Letter names map 1:1 to the visible keyboard and to the laptop's A-S-D-F-G-H-J. The engine maps solfege as a convenience (`useAudio.ts:33-36`) — but lesson copy must continue to avoid those tokens.

### Pentatonic by default
Eliminates dissonance as a discouragement source. Mashing the keyboard sounds intentional. F and B are visually dimmed in early lessons; both come online in Lesson 5.

### Sunny Studio design system
Bauhaus-inspired, warm and saturated, springy easing `cubic-bezier(0.34, 1.56, 0.64, 1)`. Goal: feels like a wooden toy, not a SaaS dashboard. Tokens in `client/src/index.css`.

### Deployment shape
`pnpm build` emits **both**:
- `dist/public/` — Vite client bundle (static).
- `dist/index.js` — esbuild Node bundle of `server/index.ts` (Express static server with SPA fallback).

Two deployment options:
1. **Node service:** `pnpm start` runs `node dist/index.js`. Any Node host (Fly, Render, Railway).
2. **Static-only:** serve `dist/public/` from any static host (Vercel, Netlify, S3, Cloudflare Pages). Configure SPA fallback to `index.html` at the host layer.

---

## 13. Risks

Things that could undermine the product premise. Each carries a rough mitigation note.

| # | Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- | --- |
| 1 | **iOS Safari Web Audio quirks.** Autoplay policy requires a user gesture before AudioContext can play. Suspension on backgrounding. Different scheduling resolution than desktop. | Medium | Med-High (silent first session = bounce) | Engine resumes from `suspended` (`useAudio.ts:47-50`). Needs an explicit iOS test pass before any external launch. |
| 2 | **Solo-digital Orff bet may not transfer.** Orff Schulwerk was designed for facilitated group settings. A child alone with a screen may not get the same kinesthetic anchoring. | Medium | High (entire pedagogy bet) | Lesson 1 maximizes body cues (clap/stomp/pat) in copy. Long-term, would benefit from user studies. |
| 3 | **localStorage quota and durability.** 5MB cap per origin; cleared by browser data clears, private mode. Reflections + best moments grow unbounded. | Low (v1 sizes) → Medium (over time) | Low–Med | Bounded shapes today (metadata-only). Composition persistence (R-5) requires a different strategy. |
| 4 | **Parent-engagement assumption.** "Parent opens URL and walks away" depends on parent finding the URL and bringing the child back. No discovery mechanism. | High | High (no retention loop) | Out of scope for v1; depends on go-to-market path not yet decided. |
| 5 | **Hardcoded progress display.** §6.7 — Progress page shows fake numbers. A skeptical user/reviewer will spot this. | High | Med | R-3 in roadmap. Until then, treat Progress as "visual placeholder" in any demo context. |
| 6 | **No test coverage.** Hand-tested in browser only. Refactors risk silent regressions, especially in the 3K-line `Lesson.tsx`. | Medium | Med-High | `vitest` already installed (`package.json:89`); just need to start. Likely first targets: `useAudio.ts` (pure functions) and lesson data integrity. |
| 7 | **`Lesson.tsx` complexity.** Single 3K-line component renders all 5 step types plus capstone. Future feature work concentrates risk here. | Medium | Med | Refactor by step-type only when a 6th type is added; don't pre-split. |

---

## 14. Competitive landscape

How Notely differs from the obvious adjacent products. (Conceptual positioning, not feature-by-feature audit.)

| Alternative | Strength | What Notely does differently |
| --- | --- | --- |
| **Yousician / Simply Piano** | Adaptive feedback against a real MIDI instrument; large song library. | Notely needs no physical instrument and no subscription; targets a younger, pre-instrument age. |
| **Hoffman Academy (and YouTube piano teachers)** | Real human teacher rapport; structured curriculum. | Notely is self-paced and self-contained — no video to watch, no waiting for the next episode. Targets the age below Hoffman's typical 7+. |
| **Chrome Music Lab** | Beautiful, free, exploratory. Excellent toys. | Chrome Music Lab is *toys without a curriculum*. Notely is a *curriculum that uses toy-like interactions*. |
| **School music class** | Group facilitation, embodied learning, social context. | Notely doesn't replace it — but works when a child has no access (no music program, summer, illness, homeschool). |
| **Generic "kids piano" iOS apps** | Native polish; app-store discovery. | Notely runs in a browser → no install friction, parent doesn't need an App Store account, works on any device including school Chromebooks. No ads, no IAP. |

**Notely's positioning:** the *first* music experience for a child who has none of the above — too young for Yousician, no access to a teacher, no parent fluent enough to facilitate.

---

## 15. Assumptions

Stated assumptions about the user, device, and context. If any is wrong for a given user, the experience degrades.

| # | Assumption | If wrong |
| --- | --- | --- |
| A1 | Child can read short sentences (~1st grade level). | Instructions don't land; child relies entirely on emoji cues. |
| A2 | A parent or guardian found and opened the URL on the child's behalf. | No discovery. Child cannot self-onboard. |
| A3 | Device has working audio output, unmuted. | Lessons function visually but the entire premise is gone. No fallback. |
| A4 | Browser supports Web Audio API + Pointer Events. (Modern Chrome/Safari/Firefox/Edge — all ship these.) | App crashes or silently fails on legacy browsers; no graceful messaging today. |
| A5 | Device has either a touchscreen or a physical keyboard. (Both supported for piano input.) | Edge case: a desktop without a touchscreen and a user who can't use the keyboard. Unaddressed. |
| A6 | Single child per device per browser profile. | Multiple children on the same browser overwrite each other's `notely_student`. |
| A7 | Session is short and infrequent (5–10 min per lesson, days apart). Used for sizing localStorage caps and engagement copy. | Heavier use is fine functionally but reflection/best-moment logs grow unbounded — see risk #3. |

---

## 16. Open questions and known gaps

| # | Question / gap | Why open |
| --- | --- | --- |
| 1 | How do we measure G1 (learning outcomes) and G2 (joy) without telemetry? | v1 has no analytics. If/when a backend ships, define event taxonomy first. |
| 2 | Accessibility audit hasn't happened. No ARIA labels, no focus order, no screen-reader pass. | Acknowledged in `.planning/codebase/ARCHITECTURE.md`. Owed before any public push. |
| 3 | No automated tests. `vitest` installed but unused. | Acceptable while single-author; the moment a second contributor lands, this needs to change. |
| 4 | Progress page is cosmetic (§6.7). | Tracked as R-3 in roadmap. |
| 5 | No service worker; "offline-after-first-load" is best-effort browser cache only. | True PWA install + offline guarantee is a post-v1 decision. |
| 6 | Compositions are session-only (§6.5). | Tracked as R-5 in roadmap. |
| 7 | Mood capture (`notely_session.mood`) is recorded but doesn't yet shape Dashboard or lesson selection. | Hook exists (`Dashboard.tsx:102`); behavior is a pending product call. |
| 8 | Parent/teacher view direction (R-2): local toggle or backend? | Pick when R-2 is actually scoped, not before. |
| 9 | Solfege aliases in the engine could be misused by future lesson authors (§5 sleeper risk). | Mitigation: code-review check; or remove aliases if not needed by Practice Room. |

---

## 17. Glossary

- **ADSR** — Attack-Decay-Sustain-Release envelope. How a synthesized note evolves over time.
- **Capstone** — Lesson 10. The student composes and plays back a piece. The "I made music" moment.
- **Kolb cycle** — Experience → Observe → Conceptualize → Experiment. Four-step learning loop every lesson runs.
- **Orff Schulwerk** — Music pedagogy: body percussion → unpitched percussion → pitched instruments. Dictates the lesson order.
- **Pentatonic** — Five-note scale (C-D-E-G-A) where every combination sounds consonant. Notely's default key set.
- **Sustain mode** — Lesson 3 mechanic where holding the key holds the envelope open until release. Backed by `startNote`/`stopNote`.

---

## 18. References

- `README.md` — public product summary.
- `CLAUDE.md` — contributor quick reference.
- `.planning/codebase/ARCHITECTURE.md` — architecture snapshot.
- `.planning/codebase/STACK.md` — dependency inventory.
- `.planning/codebase/CONCERNS.md` — surfaced concerns.
- `ideas.md` — original design brainstorm that produced Sunny Studio.
- `client/src/data/lessons.ts` — the curriculum, as code.

---

## Change log

- **0.3 (2026-05-11)** — Second audit pass. Corrected AC-5.1 — "wobble" animation is aspirational README copy, not implemented; wrong answers show a coral border + ✗ icon + error chime. Tightened §5 Constructivism row accordingly. Added MoodCheck.tsx as the actual writer of `notely_session.mood` (previously marked "unread"). Verified `/lesson/{nonexistent}` fallback to lesson 1 (AC-1.2). Fixed §11 R-1 — Twinkle Twinkle and Mary Had a Little Lamb already ship in `Practice.tsx`; updated candidate-additions list. Tightened §6.5 capstone state range and called out engine vs. UI label mapping for instruments.
- **0.2 (2026-05-11)** — Audit pass. Fixed §6.4 misattribution of `useComposition.ts`. Corrected localStorage inventory to 5 keys with verified shapes. Removed invented "Base64 recordings" claim. Fixed `playNote` signature. Added §6.4 Lesson 3 mechanic breakdown, §6.5 capstone state, §6.7 placeholder-data warning for Progress, §6.8 reflections, §6.9 mood + session recap. Added §13 Risks, §14 Competitive landscape, §15 Assumptions. Converted §9 to verifiable acceptance criteria. Added Change log, version metadata, solfege sleeper-risk callout.
- **0.1 (initial draft)** — superseded.
