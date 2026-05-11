# Notely Improvements — Synthesis

| Field    | Value                                                                          |
| -------- | ------------------------------------------------------------------------------ |
| Version  | 0.1 (2026-05-11)                                                               |
| Source   | Four parallel research agents — `.planning/research/improvements-{retention, feedback, session-orff, quality}.md` |
| Audience | Future contributors and self                                                   |
| Method   | Evidence (with citations) + magnitude + feasibility (file:line anchors) + honest verdict, calibrated to push back when a change wouldn't really improve anything |

This doc reconciles the four cluster reports into a single prioritized list. **Read the four cluster files for the actual evidence and reasoning** — this is the executive layer.

---

## TL;DR — what to ship, in order

| # | Improvement | Cluster | Why | Effort |
| - | --- | --- | --- | --- |
| 1 | **Persistent compositions** | Session+Orff | Closes the most embarrassing pedagogy bug in v1 — L10 throws the kid's work away on completion (`Lesson.tsx:1050-1052`). The only item that increases what the kid *owns* vs. what they *do*. | ~1 day |
| 2 | **Honest progress derivation** | Quality | Replaces hardcoded fake numbers (`Progress.tsx:12-49`, `Dashboard.tsx:105-106`) with real values from `notely_progress` / `notely_reflections` / `notely_best_moments`. Cheapest credibility win. Unblocks Roadmap R-2 (parent view). | ~1 day |
| 3 | **Multi-octave pitch class** | Quality | The *only* item across all four clusters that earns the words "learning outcome." Engine already supports 3 octaves (`useAudio.ts:9-22`); lessons need to use them. Foundational abstraction for everything downstream (intervals, transposition, chord inversions). | ~2 days |
| 4 | **Cross-lesson callbacks (copy only)** | Retention | Pure `lessons.ts` copy edits. Elaborative-encoding evidence is solid (Bransford, Hallam, Lehmann/Sloboda). Lowest risk, fastest delivery. | ~half day |
| 5 | **Post-lesson cooldown (60s pentatonic free play)** | Session+Orff | Plugs an active Kolb-cycle failure — currently lesson ends → dumps to Dashboard, skipping the "Experiment" step. Reuses Lesson 10's recorder UI. | ~half day |

These five together: ~5 working days of build. They span all four clusters' top picks and avoid double-spending on items that conflict.

If a sixth: **Accessibility tranche A** (reduce-motion + icon/text-redundant quiz feedback). ~half day. Closes PRD §16 gap #2.

---

## The single most important finding

**All four clusters independently flagged the same upstream problem: there is no mechanism to bring the kid back.** Spaced retrieval, lesson variations, persistent compositions, even diagnostic feedback — every retention-flavored improvement pays off on session N+1. Notely has no instrumentation, no notification surface, no parent reminder, and no telemetry to even *measure* session N+1.

> "Spending 30+ hours on the four proposals here without first instrumenting 'does this child ever come back?' is optimizing the inside of a leaky bucket." — Cluster A conclusion.

Concrete implication: before shipping a retention-improving feature in earnest, decide whether to invest first in **a return mechanism** (parent mailer, save-this-link card, calendar reminder hand-off) or **return measurement** (a single localStorage timestamp + session count). Both are cheap; the absence of either makes every other retention investment unfalsifiable.

This is *not* a reason to delay the top-5 list above — those are valuable on first session as much as on return — but it should sit alongside them as a parallel track.

---

## Cross-cutting themes that shaped the verdicts

### 1. "Diagnostic theater"
Most Notely quizzes are 2–4-option multiple choice (`rhythmQuizOptions`, `dynamicsQuiz`, `durationQuiz`, `tempoQuiz`, `patternQuiz`, generic `options`). There is **no continuous error signal** in those — you can't say "you were close" to a binary pick honestly. Adding diagnostic copy to MC quizzes is hint copy dressed as analysis. Only L8 dynamics (real velocity number, `Lesson.tsx:110`) and L7 song play (`sequenceErrorNote`, `:82`) have a genuine close-ness signal. **Don't generalize diagnostic feedback past those two lessons.**

### 2. "Orff in a solo browser tab"
Orff Schulwerk's primary sources (Orff & Keetman, Frazee, Wuytack, Saliba) all assume **a teacher in the room and a group of children**. Features that translate the framework literally to a solo digital context — DeviceMotion stomping, on-screen speech rhythms — are at high risk of being "Orff-shaped" in code but pedagogically inert in practice. The literature can't tell you whether they work; only watching a real kid use them can.

### 3. Learning outcome ≠ access ≠ perceived progress
The user asked about "learning outcomes," but most candidate improvements are **not** that. Categorically:
- **Learning outcome** (kid learns more deeply): Multi-octave pitch class. That's basically the only one.
- **Access** (more kids can use the app): Accessibility pass.
- **Perceived progress** (kid feels their effort counts): Honest progress derivation.
- **Retention** (kid returns): Persistent compositions, post-lesson cooldown, callbacks.

All four matter. They're not interchangeable. Be honest about which one a given improvement serves.

### 4. Session-budget pressure
A 6-year-old alone for 5 minutes has finite attention. Every proposed improvement *adds* to the session; none simplify. Picking 2-3 high-leverage items and protecting the kid's attention beats picking 7 and hoping they each fire. **The ship list of 5 above is already a stretch; do not stack a warmup + cooldown + daily drill + callbacks + diagnostic + chant in the same session.**

### 5. "Added because it sounds responsible"
Two items recur across the clusters as features that *adults* find pedagogically satisfying but that the literature does not actually support for the target user:
- **Mood-shaped lesson filtering.** No RCT evidence for self-reported-mood-to-content-mapping in K-6 ed-tech. Kids under 10 label emotions noisily. The mood-check modal already captures whatever SEL value exists; wiring it further would be product theater.
- **Lesson variations on replay.** The contextual-interference effect (which would justify this) *attenuates* in children under 12 (Pollock & Lee 1997). Working-memory load can hurt them. Authoring cost is high. The audience (replayers) is small.

These are the clearest skip-with-confidence items in the cluster.

---

## Full ranked verdict (all 17 candidates across 4 clusters)

| # | Improvement | Cluster | Verdict | Why | Effort |
| - | --- | --- | --- | --- | --- |
| 1 | Persistent compositions | C #5 | **Build first** | Fixes literal pedagogy bug; only item that builds ownership | 1d |
| 2 | Honest progress derivation | D #1 | **Build first** | Lying about effort actively hurts SDT-style intrinsic motivation; unblocks parent view | 1d |
| 3 | Multi-octave pitch class | D #3 | **Build first** | Only true learning-outcome item; engine ready | 2d |
| 4 | Cross-lesson callbacks (copy) | A #3 | **Build first** | Elaborative encoding evidence solid; pure copy, lowest risk | 0.5d |
| 5 | Post-lesson cooldown | C #2 | **Build first** | Closes Kolb cycle's Experiment step | 0.5d |
| 6 | Pre-lesson warmup (30s body) | C #1 | **Build second** | Habit cue + Pesce/Tomporowski exercise priming; but session-budget overlap with #5 | 0.5d |
| 7 | Accessibility tranche A (motion + icons) | D #4a | **Build second** | Closes PRD §16 gap #2; ~half day | 0.5d |
| 8 | Retrieval-framed warmups | A #1 | **Build small** | Reframe existing 6/10 warmup steps; depends on returning users | 1d |
| 9 | Drum kick fix (FM tail + transient) | D #2 partial | **Build small** | 20-minute synth fix; current kick sounds like a phone notification | 0.5h |
| 10 | Diagnostic feedback — L8 pilot | B | **Pilot** | Real velocity signal exists; ≤7-word forward-framed copy | 0.5d |
| 11 | Diagnostic feedback — L7 pilot | B | **Pilot** | Half-implemented already via `sequenceErrorNote` | 0.5d |
| 12 | Reflection surfacing (Dashboard-only) | A #4 | **Experiment first** | Engagement gain, not learning gain; cheap probe | 1d |
| 13 | Pentatonic improvisation playground | C #6 | **Experiment first** | Most Orff-credibility-relevant; minimal version (one vamp, one key) | 1-2d |
| 14 | DeviceMotion body integration | C #4 | **Experiment first** | Real Orff move *if* iOS UX cooperates; watch a kid before committing | 2-4d |
| 15 | Speech rhythms (one chant in L2) | C #7 | **Experiment first** | Watch one real kid; if they don't say words aloud, it's decorative | 0.5d for probe |
| 16 | Accessibility tranche B (full ARIA pass) | D #4b | **Sequence with R-2** | Multi-day; same chrome work supports parent view | 2-3d |
| 17 | Daily ear-training drill | C #3 | **Skip or defer** | Risks chore-app conversion; existing in-lesson quizzes cover it | n/a |
| 18 | Lesson variations on replay | A #2 | **Skip** | Contextual interference attenuates <age 12; audience is rare; highest authoring cost | n/a |
| 19 | Mood-shaped lesson filtering | D #5 | **Skip** | No evidence; invented mapping; "product theater" | n/a |
| 20 | Music-box timbre preset | D #2 partial | **Skip** | No lesson uses it; feature-creep dressed as polish | n/a |
| 21 | Diagnostic feedback on MC quizzes (L1-6, L9) | B | **Skip — use `discoveryText` instead** | No close-ness signal; would be diagnostic theater. Repurpose the unused `discoveryText` field (`lessons.ts:16`) as a static wrong-answer hint | n/a |

---

## Suggested sequence

### Sprint 1 (~3 days) — credibility + the missing artifact
- **Persistent compositions** (1d) — fixes L10's broken capstone promise.
- **Honest progress derivation** (1d) — stops lying about effort.
- **Drum kick fix** (30 min) — free win en route.
- **Cross-lesson callbacks** (0.5d) — copy pass across `lessons.ts`.

### Sprint 2 (~3 days) — the only real learning win
- **Multi-octave pitch class** (2d) — the only "learning outcome" improvement on the list. Adds 2-3 steps to L5/L6 plus a new "three-Cs landmark" widget.
- **Post-lesson cooldown** (0.5d) — closes Kolb cycle.

### Sprint 3 (~3 days) — access + measurement
- **Accessibility tranche A** (0.5d) — reduce-motion + icon/text redundancy.
- **Return-measurement instrumentation** (1d) — single localStorage timestamp; session-count counter; nothing more. Just so you can answer "do kids come back?" with data.
- **L8 diagnostic pilot** (0.5d) + **L7 diagnostic pilot** (0.5d). Behind a feature flag.
- **Manual UAT with 3-5 kids** (0.5d) — observe whether they read diagnostic copy at all. If they ignore it, stop. If they engage, evaluate scaling.

### Sprint 4+ — the experiments
- Pentatonic improv playground minimal version (1-2d). Ship behind a Practice Room tab.
- Reflection surfacing Dashboard probe (1d). Kill if it doesn't generate qualitative warmth.
- DeviceMotion experiment (2-4d). Build only if Sprint 1-3 above have shipped and a kid has been observed wanting more body engagement.

### Explicit non-goals for v1.x
- Lesson variations on replay
- Daily ear-training drill (as a daily-gate)
- Mood → lesson filter
- Music-box timbre preset
- Diagnostic feedback beyond L7/L8 pilots

---

## Honest critique — what's wrong with this whole list

Three meta-issues worth naming:

**1. Everything here is "what to add."** None of the 21 candidates *simplifies* the session. The most pedagogy-aligned next move might actually be to *remove* something — a step, a quiz, a screen — rather than add. None of the four research agents proposed this; that's a hole in the framing the user (you) might want to push on.

**2. The retention-feature-without-return-mechanism contradiction is unresolved.** Items 1, 4, 5, 6, 8, 12 all assume return. Items 10/11 measure within-session. The only item that addresses "does session 2 happen at all" is the Sprint 3 measurement task, which is not really a feature. There is a real question of whether parent-engagement and discovery work should pre-empt all of this.

**3. We have no telemetry to validate any of these.** Sprints can ship, kids can play, and we'll have approximately the same evidence as today about whether any individual change moved any outcome. Manual UAT with 3-5 kids (as recommended for the diagnostic pilot) is the minimum acceptable signal. Anything more rigorous requires backend (PRD R-4) which is itself a deferred decision.

---

## How to use this document

- **If you have 1 week:** Sprint 1 only.
- **If you have 2 weeks:** Sprints 1 + 2.
- **If you have 1 month:** Sprints 1 + 2 + 3, plus pick one experiment from Sprint 4.
- **If you have less than 1 week:** ship persistent compositions and the drum kick fix. Both are framework-perfect and span the "ownership" and "polish" categories that this audit named as underdelivered.

---

## References

- `.planning/research/improvements-retention.md` — Cluster A (Bjork, Cepeda, Karpicke, Bransford, Hallam, etc.)
- `.planning/research/improvements-feedback.md` — Cluster B (Hattie, Shute, Kluger & DeNisi, McPherson, Welch)
- `.planning/research/improvements-session-orff.md` — Cluster C (Pesce, Tomporowski, Glenberg, Goldin-Meadow, Orff & Keetman, Frazee, Wuytack, Kratus, Patel)
- `.planning/research/improvements-quality.md` — Cluster D (Deci & Ryan SDT, Dweck, Lepper-Greene, Trehub, Sergeant, Costa-Giomi, WCAG 2.1, D'Mello et al.)
- `.planning/PRD.md` — product spec being improved against
