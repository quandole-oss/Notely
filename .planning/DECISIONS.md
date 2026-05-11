# Notely — Decisions & Findings Log

| Field    | Value                                                                              |
| -------- | ---------------------------------------------------------------------------------- |
| Version  | 0.1 (2026-05-11)                                                                   |
| Purpose  | Single index of project-shaping decisions, codebase findings, and open questions.  |
| Style    | ADR-lite, append-only. Each entry one short block + pointer to detailed rationale. |
| Audience | Future contributors and self — for "why did we decide X?" questions.               |

## How to read this doc

- **Decisions (D-NN)** — choices already made. The *what* is here; the *why* lives in detail in PRD, IMPROVEMENTS, or research files.
- **Findings (F-NN)** — things we uncovered (codebase oddities, pedagogical risks, cross-cutting insights). Not choices — facts to remember.
- **Open Questions (Q-NN)** — decisions we know we need to make and have not. Each names a trigger condition.

If you're about to revisit a settled decision, find its D-NN and read why before unwinding. If you're about to build something, scan F-NN entries — some are blockers in disguise.

---

## Decisions

### D-01 — Letter names in lesson copy, not solfege
**Date:** 2026-05-11 (codified) — pre-existing product decision
**Status:** Decided
**Context:** A solo child in a browser has no sung-pitch reference.
**Decision:** Lesson copy uses C-D-E-F-G-A-B exclusively. Engine accepts solfege aliases (see F-07) but lessons must not use them.
**Rationale:** Letter names map 1:1 to visible keys and to A-S-D-F-G-H-J on a laptop. Solfege requires external pitch anchoring.
**See:** PRD §5 (Pedagogical principles), `~/.claude/.../memory/feedback_no_solfege.md`

### D-02 — Pentatonic default (C-D-E-G-A); F and B visually dimmed pre-L5
**Status:** Decided
**Decision:** Default key set is pentatonic; F and B come online in L5.
**Rationale:** Eliminates dissonance as a discouragement source. Mashing the keyboard sounds intentional.
**See:** PRD §5; `lessons.ts:72-89`

### D-03 — Web Audio synthesis, not sample files
**Status:** Decided
**Decision:** All sound is synthesized in-browser. No `.mp3`/`.wav` assets.
**Rationale:** Zero load time, zero bandwidth, real continuous velocity and duration. L3 (long/short) and L8 (loud/soft) require continuous synthesis.
**See:** PRD §5, §12; `useAudio.ts`

### D-04 — Frontend-only for v1
**Status:** Decided
**Decision:** No backend, no accounts, no multi-device sync at v1.
**Rationale:** Removes activation cost. URL → playing in seconds.
**Trade-off accepted:** No multi-device sync; closing browser starts fresh state. Single-child-on-single-device is the dominant use case.
**See:** PRD §7, §12

### D-05 — No scoring, no XP, no leaderboards
**Status:** Decided
**Decision:** Constructivist principle — wrong answers re-try with gentle feedback; no penalty state.
**Rationale:** Six-year-old should never feel they "failed" the app.
**See:** PRD §5, AC-5.1

### D-06 — PRD audience and location
**Status:** Decided
**Decision:** PRD lives at `.planning/PRD.md`, written for future contributors and self. Source of truth for *intent*; codebase is source of truth for *behavior*.
**See:** PRD header metadata

### D-07 — Acceptance Criteria adopted as PRD requirement format
**Status:** Decided
**Decision:** PRD §9 uses AC-N.M structured criteria with verification status. Replaced earlier vague functional requirements.
**Rationale:** Testable assertions support honest claims about what is/isn't verified.
**See:** PRD §9, change log v0.2

### D-08 — v1.1 ship list (5 items, ~5 working days)
**Date:** 2026-05-11
**Status:** Decided (priority ranking; specific sequencing still open — Q-07)
**Decision:** Top-5 build list:
1. Persistent compositions
2. Honest progress derivation
3. Multi-octave pitch class
4. Cross-lesson callbacks
5. Post-lesson cooldown
**Rationale:** Spans all four research clusters' top picks; avoids session-budget overload; only multi-octave is "learning outcome" in strict sense; others serve access, retention, perceived-progress, or close a literal pedagogy bug.
**See:** IMPROVEMENTS.md §TL;DR + §Suggested sequence

### D-09 — v1.1 skip list (explicit non-goals)
**Date:** 2026-05-11
**Status:** Decided
**Decision:** Will **not** ship in v1.1:
- Lesson variations on replay (contextual interference attenuates <12)
- Daily ear-training drill (chore-app risk; in-lesson quizzes cover)
- Mood → lesson filter (no evidence; invented mapping; product theater)
- Music-box timbre preset (no lesson uses it)
- Diagnostic feedback on MC quizzes outside L7/L8 (no continuous error signal)
**Rationale:** Each is documented in the research files with citation-backed reasoning for the skip.
**See:** IMPROVEMENTS.md §Honest critique, `research/improvements-{retention,session-orff,quality,feedback}.md`

### D-10 — Diagnostic feedback scope: pilot only on L7 + L8
**Date:** 2026-05-11
**Status:** Decided
**Decision:** Build diagnostic feedback only where a continuous error signal exists — L8 dynamics (velocity captured) and L7 song play (`sequenceErrorNote` half-implemented). Behind a feature flag. Manual UAT with 3-5 kids before any expansion.
**Rationale:** Hattie effect size *d* ≈ 0.7 averages teacher-mediated multi-session work. For unsupervised solo screen use by 6-12yo, realistic effect *d* ≈ 0.1-0.3 with Kluger-DeNisi-flavored ~38% risk of harm. MC quizzes have no close-ness signal — diagnostic copy on them would be theater.
**See:** `research/improvements-feedback.md` §5 Pilot recommendation

### D-11 — Planning approach: Path B (lightweight per-improvement plans)
**Date:** 2026-05-11
**Status:** Decided
**Decision:** Skip full GSD scaffolding (no ROADMAP.md). Write a short PLAN.md per Sprint-1 improvement; build atomically; revisit after Sprint 1 lands.
**Rationale:** Five PLAN.md files is light enough to write but heavy enough to catch "forgot to update PRD" issues. Path A (full ROADMAP/phase structure) is overkill until Sprint 1 demonstrates clean execution.
**See:** Conversation 2026-05-11; user agreement pending

### D-12 — Keep solfege aliases in audio engine (sleeper-risk acknowledged)
**Date:** 2026-05-11
**Status:** Decided
**Decision:** `useAudio.ts:33-36` solfege aliases (`DO/RE/MI/...`) stay. They are engine convenience, not curriculum. Future lesson authors must continue to avoid them in copy.
**Mitigation:** Code-review check before any L11+ ships. Could remove aliases if not needed by Practice Room.
**See:** PRD §5 sleeper-risk callout, F-07

### D-13 — Top priority is fixing L10 capstone persistence
**Date:** 2026-05-11
**Status:** Decided
**Decision:** Persistent compositions ships *first* in Sprint 1 (over honest progress, multi-octave, etc.).
**Rationale:** It's the only item across 17 candidates that increases what the kid *owns* rather than what they *do*. The current "session-only" capstone undermines L10's whole pedagogical promise. Pedagogy bug, not feature gap.
**See:** IMPROVEMENTS.md, `research/improvements-session-orff.md` §5

---

## Findings

### F-01 — `useComposition.ts` is an IME helper, not music composition
**Category:** Codebase
**Summary:** Despite the suggestive name, `client/src/hooks/useComposition.ts` is an Input Method Editor helper for `<input>` / `<textarea>` (Chinese/Japanese text composition).
**Implication:** Do not refactor Lesson 10 capstone logic into it. The capstone lives entirely in `Lesson.tsx` state (see PRD §6.5).
**See:** PRD §6.5

### F-02 — Lesson const naming is swapped vs. content
**Category:** Codebase
**Summary:** `const lesson4` in `lessons.ts` holds "Meet the Piano" content; `const lesson5` holds "High and Low" content. The `LESSONS` map swaps them back (`"4": lesson5, "5": lesson4`) so users see the right thing.
**Implication:** When reading code, trust the lesson's `name` field, not the variable identifier. Originated from commit `92c94ee` (lesson reordering).
**See:** `lessons.ts:346-348, 415-417, 903-913`

### F-03 — Progress page is hardcoded placeholder
**Category:** Codebase / Honesty gap
**Summary:** `Progress.tsx` ACHIEVEMENTS (`:12-21`), SKILLS (`:23-29`), WEEKLY_PRACTICE (`:31-39`), totalStars (`:48`), practiceStreak (`:49`) are all constants. Dashboard.tsx `xpPercent=42` / `streak=3` (`:105-106`) similarly hardcoded.
**Implication:** The page lies about effort. The kid who returns is the one most likely to notice. Honest progress derivation is Sprint 1.
**See:** PRD §6.7, IMPROVEMENTS.md item #2

### F-04 — Mood capture is wired to nothing
**Category:** Codebase / Half-built feature
**Summary:** `MoodCheck.tsx:26-29` writes `notely_session.mood`. `Dashboard.tsx:60-81` reads it. `Dashboard.tsx:102` is `filteredLessons = lessons` — a no-op pass-through.
**Implication:** The mood check captures whatever weak SEL value the prompt offers. Wiring it to lesson filtering would be product theater (D-09).
**See:** PRD §6.9

### F-05 — Reflections are logged but never resurface
**Category:** Codebase / Half-built feature
**Summary:** `Lesson.tsx:564-566, :917-919` append A/B answers to `notely_reflections`. No read path exists.
**Implication:** Kolb's "Observe" loop is half-built. Resurfacing is in IMPROVEMENTS.md as "experiment first" (engagement gain, not learning gain).
**See:** PRD §6.8, IMPROVEMENTS.md item #12

### F-06 — Capstone compositions don't persist
**Category:** Codebase / Pedagogy bug
**Summary:** `Lesson.tsx:1050-1052` resets `phraseA`, `phraseB`, `compositionForm` to `[]` on lesson completion. The kid's composition is discarded.
**Implication:** L10's "I composed my own piece" claim is undermined every time the lesson ends. Drives D-13.
**See:** PRD §6.5, IMPROVEMENTS.md item #1

### F-07 — Solfege aliases exist in the audio engine
**Category:** Codebase / Sleeper risk
**Summary:** `useAudio.ts:33-36` maps `DO/RE/MI/FA/SOL/LA/SI` → C-D-E-F-G-A-B. The engine *accepts* solfege input.
**Implication:** Curriculum decision (D-01) "letter names only" is a UX rule, not engine-enforced. Future lesson authors could violate it by accident.
**See:** PRD §5 sleeper-risk row

### F-08 — "Wobble" animation is aspirational README copy, not implemented
**Category:** Codebase / Doc drift
**Summary:** README describes wrong quiz answers "wobbling." No such animation in `Lesson.tsx`. Only `notely-shake` animation exists, scoped to L8 dynamic-scene velocity mismatches (`Lesson.tsx:1627-1628`). Wrong-answer UI is coral border + ✗ icon + error chime.
**Implication:** PRD AC-5.1 corrected at v0.3. README still mentions wobble; consider syncing.
**See:** PRD AC-5.1, change log v0.3

### F-09 — Returning-user problem is unmitigated
**Category:** Cross-cutting / Strategy
**Summary:** All retention features assume the kid returns. Notely has no return mechanism (no parent reminder, no notification surface, no calendar hand-off) and no return measurement (no telemetry, no session counter).
**Implication:** Every retention feature is unfalsifiable until "does session 2 happen?" is instrumented. Sprint 3 includes a minimum measurement task.
**See:** PRD risk #4, IMPROVEMENTS.md §The single most important finding

### F-10 — Orff Schulwerk literature assumes a facilitated classroom
**Category:** Cross-cutting / Pedagogy risk
**Summary:** Orff & Keetman, Frazee, Wuytack, Saliba — every primary Schulwerk source describes a teacher in the room with a group of children. Notely's user is alone in a tab.
**Implication:** Features that translate the framework literally (DeviceMotion stomping, speech rhythms, parts of improv playground) are at high risk of being "Orff-shaped" in code but pedagogically inert in practice. Watch a real kid before committing.
**See:** `research/improvements-session-orff.md` §Crucial honest critique

### F-11 — Most Notely quizzes lack a continuous error signal
**Category:** Codebase / Design implication
**Summary:** `rhythmQuizOptions`, `durationQuiz`, `tempoQuiz`, `patternQuiz`, generic `options` MC — all 2-4 discrete picks. Only L8 dynamics velocity and L7 song `sequenceErrorNote` produce real close-ness signals.
**Implication:** Drives D-10 (diagnostic pilot limited to L7+L8). Diagnostic copy on MC quizzes would be "theater."
**See:** `research/improvements-feedback.md` §3, F-12 (the alternative)

### F-12 — Unused `discoveryText` field exists in LessonStep
**Category:** Codebase / Hidden capability
**Summary:** `lessons.ts:16` declares `discoveryText?: string` on quiz options. Currently unused.
**Implication:** Can be repurposed as a static wrong-answer hint for the MC quizzes that would otherwise get diagnostic theater. Honest, cheap, schema-aligned.
**See:** `research/improvements-feedback.md` §5

### F-13 — "Learning outcome" is one of four distinct categories
**Category:** Cross-cutting / Framing
**Summary:** Candidate improvements split across: **learning outcome** (kid learns more deeply), **access** (more kids can use), **retention** (kid returns), **perceived progress** (kid feels effort counts). Most aren't interchangeable.
**Implication:** When asked for "learning outcome" improvements, only multi-octave pitch class qualified across 17 candidates. Be honest about category when proposing.
**See:** `research/improvements-quality.md` §Separation table

---

## Open Questions

### Q-01 — Parent/teacher view: local toggle or backend?
**Raised:** 2026-05-11
**Owner:** Quan
**Blocks:** Roadmap R-2 implementation
**Trigger:** When R-2 is being scoped for build (not before).
**Context:** Could exist as a "Parent" mode in the existing UI (local-only) or require multi-device sync (forces R-4 backend).
**See:** PRD R-2, R-3, R-4

### Q-02 — Return mechanism: how does session N+1 happen?
**Raised:** 2026-05-11
**Owner:** Quan / product
**Blocks:** Confidence in all retention features (D-08 items 1, 4, 5)
**Trigger:** Before investing in retention features as the primary strategy. Sprint 3 measurement task is the prerequisite.
**Context:** Options range from cheap (save-this-link card after lesson 1) to heavy (parent email opt-in, calendar hand-off). PRD risk #4 names this as unmitigated.
**See:** F-09, IMPROVEMENTS.md §The single most important finding

### Q-03 — When to add automated test coverage?
**Raised:** 2026-05-11
**Owner:** Quan
**Blocks:** Confidence in refactors touching `Lesson.tsx` (3K LOC)
**Trigger:** When a second contributor lands, OR when a refactor goes wrong.
**Context:** `vitest` is installed (`package.json:89`) but no tests exist. Likely first targets: `useAudio.ts` pure functions, lesson data integrity.
**See:** PRD §7, §15 #3

### Q-04 — iOS Safari Web Audio test pass timing
**Raised:** 2026-05-11
**Owner:** Quan
**Blocks:** Any external launch (autoplay policy is the most likely silent-first-session bounce cause)
**Trigger:** Before any public push.
**Context:** Engine resumes from suspended state (`useAudio.ts:47-50`) but iOS-specific UX has not been validated.
**See:** PRD risk #1

### Q-05 — Multi-octave concept timing per learner
**Raised:** 2026-05-11
**Owner:** Design (during Sprint 2)
**Blocks:** Multi-octave pitch class build (D-08 item #3)
**Trigger:** While building the multi-octave step in Sprint 2.
**Context:** Sergeant 1983 places explicit octave-equivalence around ages 7-10. Some 6-year-olds too early; some 9-12-year-olds need it as the first thing that "clicks." Implementation needs a graceful approach for both ends.
**See:** `research/improvements-quality.md` §3

### Q-06 — How to instrument return rate without violating privacy-by-default?
**Raised:** 2026-05-11
**Owner:** Quan
**Blocks:** Sprint 3 measurement task
**Trigger:** Sprint 3 planning.
**Context:** PRD §10 commits to "no network requests after page load." Return measurement via localStorage (timestamp + counter) is consistent with that. A single integer + ISO date is enough to answer "did this kid open the app today?" without telemetry.
**See:** PRD §10 Privacy row

### Q-07 — Within-Sprint-1 ordering: which of the 5 builds in which sub-order?
**Raised:** 2026-05-11
**Owner:** Quan (or whoever drafts Sprint 1 PLAN.md)
**Blocks:** Sprint 1 execution
**Trigger:** Sprint 1 kickoff.
**Context:** D-13 puts persistent compositions first. Honest progress derivation and multi-octave can run in parallel if not sharing files. Cross-lesson callbacks (copy-only) and post-lesson cooldown (half-day each) can slot anywhere.
**Suggestion:** persistent comps → honest progress → multi-octave → callbacks → cooldown.

### Q-08 — Improv playground: how is chord backing implemented?
**Raised:** 2026-05-11
**Owner:** Design + audio
**Blocks:** Pentatonic improv playground (IMPROVEMENTS.md "experiment first")
**Trigger:** When the improv playground experiment is scoped.
**Context:** Engine has `playNote` for monophonic synthesis. Chord backing would require either rapid arpeggiation tricks or a small `playChord` helper (~30 LOC). For v1: a C drone with occasional G (I-V) is enough; richer backing can wait.
**See:** `research/improvements-session-orff.md` §6

---

## Change log

- **0.1 (2026-05-11)** — Initial extraction. Decisions D-01..D-13 pulled from PRD §5/§7/§12 and IMPROVEMENTS.md. Findings F-01..F-13 pulled from research files and audit passes. Open questions Q-01..Q-08 pulled from PRD §16 plus newly-surfaced items from the improvements research.
