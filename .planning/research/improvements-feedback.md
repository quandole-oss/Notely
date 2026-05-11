# Diagnostic Feedback in Notely — Research & Verdict

**Question.** Would replacing binary right/wrong quiz feedback with *diagnostic* feedback ("you were close — your soft was a bit loud") meaningfully improve learning outcomes for a 6–12 year old using Notely alone for 5 minutes?

**TL;DR.** Pilot on **Lesson 8 dynamics quiz** (`client/src/data/lessons.ts:707-713`) and **Lesson 7 song play** (`client/src/pages/Lesson.tsx:214-232`) only. Skip elsewhere. The pedagogy literature supports diagnostic feedback in general but is *much* thinner for unsupervised solo screen use in this age band than ed-tech marketing implies. Most quiz types in Notely cannot produce honest "close-ness" diagnostics — there is no continuous error signal to interpret — so retrofitting them would manufacture diagnostic theater (hint copy dressed up as analysis), not real formative feedback.

---

## 1. Evidence summary

The general claim — *specific feedback beats binary feedback* — has solid backing. The version of it most relevant to Notely (*young children, alone, on a screen, on a single 5-minute task*) does not.

**Hattie's syntheses** (Visible Learning, 2009/2012). Feedback as a category averages *d* ≈ 0.70 — one of the larger educational moderators. The average masks enormous variance: feedback *type* matters more than *presence*. Hattie & Timperley ("Power of Feedback," RER 2007) classify feedback at four levels — task, process, self-regulation, self — and find task-level feedback (the diagnostic kind) most useful during *acquisition*, less so when fluent. Effect sizes for *corrective* feedback specifically run *d* ≈ 0.4–0.5, not 0.7.

**Shute (2008), "Focus on Formative Feedback,"** RER 78(1). The reference text. Shute's design rules read like a challenge to "more = better": be specific *but short*; target the task, not the learner; immediate for simple tasks; **avoid long or complex feedback for low-prior-knowledge learners**. That last clause is load-bearing for Notely — 6–12-year-olds are by definition low-prior-knowledge in music, and elaborate feedback can *depress* learning in this group by exceeding working-memory capacity.

**Kluger & DeNisi (1996), Feedback Intervention Theory** (Psych Bulletin 119(2)). Meta-analysis of 131 studies. Uncomfortable headline: **~38% of feedback interventions made performance worse**. Mechanism is attention misdirection — feedback that focuses the learner on the self disrupts performance. Diagnostics naming a task variable (pulse, velocity, pitch) are on the right side; vague evaluative ("nice try!") is on the wrong side. Binary ✓/✗ with a chime is closer to safe-but-low-power than harmful; badly-worded diagnostics ("you were a little off") risk landing on the self-directed side and backfiring.

**Music-specific.** Welch et al. on child singing (ages 4–11): visual pitch feedback improved intonation, *but only when immediate, continuous, and required no interpretation* — discrete diagnostic *text* on wrong pitch did not. Hallam (2001) on instrumental practice: effective feedback for young instrumentalists is almost always *teacher-mediated* — an adult translates "wrong note" into next-action. McPherson & Renwick (2001) on self-regulated practice: children under ~10 lack metacognitive scaffolding to *use* diagnostic feedback to plan a correction — they retry identically or disengage. Adult-style "what to fix" feedback works after roughly age 10–11.

**Age-specific.** Hattie notes feedback effect sizes are **lower for primary than secondary** (~*d* = 0.2 difference), and the gap grows with feedback complexity. For 6–8-year-olds, evidence favors short, concrete, immediate, single-variable feedback — and *non-verbal* signals (color, sound, visual change) often outperform verbal explanations.

**Synthesis for Notely.** Realistic expected effect of adding diagnostic feedback over binary ✓/✗ — assuming it's well-designed and short — is *d* ≈ 0.1–0.3 on within-lesson learning, *if* it works. Hattie/Shute-level effects (*d* > 0.5) are not credible here; those come from teacher-mediated classroom interventions, not solo screen sessions. There's also a non-trivial probability (the Kluger-DeNisi 38%) that diagnostics *hurt*, especially if a 7-year-old reads "your soft was a little loud" as "you failed at the part you thought you did right."

---

## 2. Magnitude analysis — honest

Strip the literature down to the actual question: a 7-year-old, alone on a tablet, 4 minutes into Lesson 8, taps "loud" when the answer is "soft." Currently: coral border + ✗ + gentle descending chime. Proposed: an additional message — "You picked loud! It was actually soft — listen again."

**Does the second variant produce measurably more learning?** Marginally at best, and only for the older half of the age band (~9–12). Four reasons:

1. **The error is already binary.** "Loud or soft" is two-alternative forced choice. There is no close-ness. A diagnostic that says "you were close" when the option was literally one of two is dishonest — it's just hint copy ("the answer was soft — listen for a gentle, quiet sound"). That's valuable, but it's a *worked-example hint* (Renkl, Atkinson — smaller effects than feedback proper), not feedback in the literature's sense.

2. **"You were close" earns its keep only with a continuous, captured error signal.** Notely has exactly one place that holds: **dynamics velocity**. Expected velocity is a number (e.g., 0.15 for soft); the child's tap on a velocity-sensitive key produces another number (`lastVelocity`, `Lesson.tsx:110`). The difference is real, measurable, meaningful. Everywhere else — MC listen-and-identify, pattern recognition, rhythm-matching against a fixed sequence — there is no continuous error signal until the lesson is restructured.

3. **Working memory is the bottleneck.** A 12+-word message asks the child to parse, hold, replay the audio, re-compare, re-answer. By the time they re-read the sentence, the audio memory is gone. Binary feedback resolves in 150ms (a chime). Diagnostic text raises this to perhaps 3–4 seconds per item — in a 5-minute session, that's a real budget hit.

4. **Kids this age often ignore corrective text.** McPherson, Hallam, and anecdote agree: young learners on solo digital tasks skim or skip text feedback, especially after wrong answers (mild aversive valence). They look at the color, hear the chime, tap again. A diagnostic they don't read is wasted UI complexity.

The strongest case for diagnostic feedback in Notely is therefore not the usual ed-tech argument. It's narrower:

- **L8 dynamics:** the system has a real velocity number; diagnostic can be *informational* ("your soft was almost as loud as the loud one — listen for something gentler"). This is closer to Welch-style continuous visual feedback than to text — and could be visualized as a meter showing the gap, sidestepping the working-memory cost.
- **L7 song play:** the system already knows which note was expected (`sequenceErrorNote`, `Lesson.tsx:82`). "You played D — try E next!" is closer to teacher mediation, aligned with Hallam.

For MC quizzes (rhythm, dynamics, duration, tempo, pattern) with 2–4 discrete options, adding diagnostic text is cargo-culting — satisfies the adult designer's pedagogical instinct, gives the child nothing more actionable than color + chime + retry.

---

## 3. Per-lesson feasibility table

| Lesson | Quiz type | Data captured | Real diagnostic potential | Effort | Priority |
| --- | --- | --- | --- | --- | --- |
| **L8 Dynamics** | `dynamicsQuiz` (`lessons.ts:707-713`) | Expected `velocity` (0.15, 0.85, etc.); child's selection is binary BUT velocity-sensitive `explore` steps capture `lastVelocity` (`Lesson.tsx:110`) | **High.** Can show a real *velocity gap meter* on the velocity-sensitive steps preceding the quiz; on the quiz itself, hint copy can name the velocity in absolute terms ("that one was 0.15 — almost a whisper") | Low (math is trivial — compare two numbers; meter is one absolute-positioned div) | **Pilot #1** |
| **L7 Song play** | `sequence` (Hot Cross Buns E-D-C) | `sequenceErrorNote` already captured (`Lesson.tsx:82`, set at `:229`); already shows expected note for 1500ms (`:2665` `isErrorHint`) | **High.** Half-built already. Convert the 1500ms visual hint into a brief text + audio: "Try E next — listen!" with the expected note re-played. | Low (extend existing handler; lessons.ts unchanged) | **Pilot #2** |
| **L3 Duration** | `durationQuiz` (`lessons.ts:315-320`) | Duration in seconds (0.15–2.5); child's selection is binary | **Medium.** Like dynamics: no continuous child signal (it's a 2-option pick), so the diagnostic collapses to hint copy ("the long one rings for ~2.5 seconds — listen for the ring"). Real diagnostic *only* applies on sustain-mode `explore` steps where hold-time can be measured against a target. Currently no target exists. | Medium (would require defining hold-time targets — not a current data shape) | Low — defer |
| **L9 Tempo** | `tempoQuiz` (`lessons.ts:803-808`) | BPM is set on each clip; child's selection is binary | **Low–Medium.** Same problem: discrete choice → hint copy only. A meaningful diagnostic would require capturing child *tap timing* against the BPM, which the tempo-slider explore step doesn't currently log timestamps for. | Medium-High (would require timestamping taps + ITI math) | Skip |
| **L9 Pattern** | `patternQuiz` (`lessons.ts` form) | Two phrases compared for sameness | **Low.** Binary same/different. Diagnostic collapses to "the second phrase changed on note 3 — listen again." This is informative but requires per-note diff display copy. | Medium | Skip |
| **L2/L1 Rhythm** | `rhythmQuizOptions` (`lessons.ts:180-185`) | 4 pattern options; child picks one. Patterns are static. | **Low.** Pure pattern-match. No close-ness possible because the child doesn't produce a pattern; they pick from a list. Diagnostic = hint copy ("the answer was Boom Boom Tick Tick — wide blocks first"). | Low | Skip (binary is fine) |
| **L4, L5, L6** | Generic `options` MC (`Lesson.tsx:893-911`) | `option.correct: boolean` only | **None / hint copy only.** No close-ness signal exists. Best we can do is `option.discoveryText` (already in the type at `lessons.ts:16` — currently underused). | Trivial | Skip OR repurpose `discoveryText` as a wrong-answer hint, no new feature |

**Ranking by feasibility × pedagogical value:** L8 dynamics > L7 song > everything else.

---

## 4. Risks & mitigations

| Risk | L × S | Mitigation |
| --- | --- | --- |
| **R1. Over-explanation bores/confuses a 7-year-old.** Shute's "keep it short" is real. 3+ lines on a wrong answer → disengage. | H × M | Cap ≤ 8 words OR use a non-verbal indicator (meter, dot). Test by reading aloud at a 7-year-old's pace; > 2 seconds = cut. |
| **R2. False positives erode trust.** "Your soft was loud-ish" when the child played reasonably softly is worse than ✓. Kids stop reading after 1–2 unfair calls. | M × H | Use *generous* tolerance bands. For dynamics, flag only if velocity > 0.5 when target is 0.15. Grade obvious gaps, not nuance. |
| **R3. Constructivist tension — punishment-by-explanation.** Notely's pedagogy is "no failure" (PRD §5). A precise diagnostic feels like a graded result even without a score; converts gentle retry into "you got a B-". | M × H | Forward-frame ("try a softer touch") not retrospective ("you played too loud"). Diagnostic is *additive* to the existing coral border + chime, not a replacement. |
| **R4. Cognitive load — fixing two things at once.** "Pulse was rushed AND one note was wrong" → child gives up. | L × H | Diagnose **one dimension per item**. Never combine. Pick the lesson's current learning target; ignore other dimensions. |
| **R5. Diagnostic theater.** "You were close!" with no continuous signal is mild dishonesty. Adults find it satisfying; kids may not notice but the codebase pretends. | H × M | Restrict to the two pilots with a real signal. Elsewhere, repurpose `discoveryText` (`lessons.ts:16`) as a static hint — honest, no fake analysis. |
| **R6. Regression risk in 3K-line `Lesson.tsx`** (PRD §13 #7). | M × M | Pilot scoped: one new field (`diagnostic?: string`) rendered at `Lesson.tsx:2800-2840`, computed in existing handlers. No new state machine. |

Design rules in one line: short, forward-looking, real-signal-only, additive, one variable at a time. Anything that fails any of these should not ship.

---

## 5. Pilot recommendation

**Ship two pilots, behind a single PR, on lessons where the signal is real.**

### Pilot A — Lesson 8 dynamics quiz (`lessons.ts:707-713`, handlers at `Lesson.tsx:286-305`)

**What.** On a wrong answer to "soft or loud?", display a one-line diagnostic *before* the existing retry, plus a small visual amplitude indicator.

**Diagnostic copy spec** (≤ 7 words, forward-framed):
- Picked "loud" when answer was "soft": *"That one was a whisper — listen again."*
- Picked "soft" when answer was "loud": *"That one was strong — listen again."*

No "close-ness" claims. No grading words. The chime and coral border stay.

**Visual.** A two-bar amplitude indicator shows the played velocity vs. a child-friendly "whisper / shout" scale. Honest because the system *has* the velocity number.

**Implementation anchor.** Extend `handleDynamicsQuizSelect` (`Lesson.tsx:296-305`) to set a diagnostic string in state when `!correct`; render below the option grid (`:2800-2840` region).

### Pilot B — Lesson 7 song play (`Lesson.tsx:214-232`)

**What.** The sequence handler already knows the expected note and stores it in `sequenceErrorNote` for a visual hint. Extend the hint to a brief audio + text on wrong note.

**Diagnostic copy spec.** *"Try {note} next!"* — that's it. Where `{note}` is "C", "D", "E", etc. The expected note also re-plays at 0.5 velocity for 0.8 seconds (already in the engine: `playNote(expected, 0.8, 0.5)`).

**Implementation anchor.** In `handleSequenceNotePlay` at `Lesson.tsx:227-231`, where the wrong-answer branch already sets `sequenceErrorNote`, also schedule a `playNote(expected, ...)` after 400ms and surface the text near the keyboard. The 1500ms timeout already handles cleanup.

### How to measure if it worked

Measurement is the hard part — Notely has no telemetry (PRD §15 #1). Three options, increasing cost:

1. **Code-side proxy (free):** track wrong attempts per quiz item before correct in `notely_session`. Reduction from ~1.4 to ~1.1 = directional. Caveat: tiny sample, no control, confounded.
2. **Manual UAT with 3–5 kids, ages 7/9/11 (~1 day):** observe (a) do they read the diagnostic, (b) do they modify their next answer, (c) can they verbalize the why. Best test for R3 (does it feel like grading?). Do this *before* expanding.
3. **A/B with localStorage flag (~3 days):** flag diagnostic on/off; compare attempts and completion. Needs N > 50/arm, which Notely doesn't have.

Recommended: build pilot behind a flag, run option 2 first. Don't instrument 1 or 3 until UAT confirms kids attend to the diagnostic.

---

## 6. Honest verdict

**Pilot.** Ship Pilot A (L8 dynamics) and Pilot B (L7 song). Skip every other diagnostic. Do not generalize.

**Reasoning, in order:**

1. **The literature supports diagnostic feedback in general but not the version Notely is tempted to build.** Hattie's and Shute's effect sizes come from teacher-mediated, multi-session, age-appropriate-text feedback. Notely is solo, single short session, ages 6–12. Expected effect size at this scale is modest (~*d* = 0.1–0.3), lower-bounded by Kluger-DeNisi's 38%-hurt finding.

2. **Most Notely quizzes have no real close-ness signal.** MC listen-and-identify can only produce hint copy, not diagnostics. "You were close" UI on binary choices is theater — the codebase pretends to analyze something it isn't.

3. **The two lessons that *do* have real signals are worth piloting.** L8 velocity and L7 expected-note are honest, captured, kid-readable. L7 is essentially free — half the code is already in `sequenceErrorNote`.

4. **Constructivist tension is genuine.** Notely's no-failure stance is load-bearing (PRD §5). A bad diagnostic — graded, retrospective, comparative — would erode it. A good one — short, forward-looking, additive — would not. The discipline to stay in the second category is a real design tax on every message.

5. **Opportunity cost matters.** Same engineering effort could ship the parent/teacher view (PRD R-2), derive real progress data (R-3), or close the iOS Safari audio test gap (Risk #1). Each has higher confidence-of-impact. Diagnostic feedback is *plausibly* worth doing on two lessons; the others are *clearly* worth doing across the product.

**Counter-position considered.** "Even *d* = 0.1, applied across 10 lessons over many sessions, compounds into a real retention gain — you won't know unless you test." Fair. But it's also the reasoning behind over-engineered ed-tech full of UI adults love and kids skip. The pilot tests the argument honestly: build where the signal is real, measure where the signal is real, **only generalize if kids actually engage**. If UAT shows they ignore the well-built L8/L7 diagnostics, the answer is stop, not add more.

**Do not build:** diagnostic copy on L1/L2 rhythm quiz, L3 duration quiz, L4–L6 MC, L9 tempo/pattern. Repurpose `discoveryText` (unused field at `lessons.ts:16`) as a static wrong-answer hint there — honest, cheap, consistent with the existing data shape.

---

## Files referenced

- `/Users/q/Documents/Gauntlet/Notely/.planning/PRD.md` (§5 pedagogy, AC-5.1/5.2 feedback ACs, §15 Open Q's)
- `/Users/q/Documents/Gauntlet/Notely/client/src/hooks/useAudio.ts` (lines 69 `playNote(note, duration, velocity)`, 141 success chime, 150 error sound)
- `/Users/q/Documents/Gauntlet/Notely/client/src/pages/Lesson.tsx` (lines 82 `sequenceErrorNote` state, 110 `lastVelocity`, 214-232 sequence handler with existing hint pattern, 286-305 dynamics quiz handlers, 307-326 duration quiz handlers, 364-385 tempo quiz handlers, 410-435 pattern quiz handlers, 893-912 generic MC handler, 1068-1093 `canProceed`, 2800-2840 feedback color render)
- `/Users/q/Documents/Gauntlet/Notely/client/src/data/lessons.ts` (lines 16 unused `discoveryText` field, 180-185 rhythmQuizOptions, 315-320 durationQuiz, 707-713 dynamicsQuiz, 803-808 tempoQuiz)
