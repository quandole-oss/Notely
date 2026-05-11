# Retention & Repetition Mechanisms — Research

**Scope.** Four proposed mechanisms to improve learning outcomes in Notely, a self-guided browser music app for ages 6–12. Target user is a child playing alone, ~5–10 min per session, possibly only once a week (PRD A7), with no teacher, no instrument, no account.

**Methodological caveat upfront.** The retention/repetition literature is dominated by adults learning declarative facts (vocabulary, history) in instrumented lab studies. Notely teaches *embodied procedural* skills (tapping a pulse, hearing duration) to *unsupervised young children* in *short, infrequent* sessions. Effect sizes from college-student spacing studies do not transfer 1:1. Where the evidence below cites large effects, those numbers are upper bounds; honest expectations for Notely are uniformly smaller.

**Context-specific reality check.** Several of the four proposals assume the child returns. The PRD itself flags this as risk #4 ("Parent-engagement assumption … no discovery mechanism"). Retention features that pay off only on session N+1 are bottlenecked by whatever brings the child back at all — which is currently unsolved.

---

### 1. Spaced retrieval via lesson warmups

**Evidence:** **strong** in general; **moderate** for age 6–12 and procedural music skill. The combined spacing + retrieval-practice literature is one of the most robust findings in cognitive science — Cepeda et al. (2006, *Psych Bulletin*) meta-analysed 254 spacing comparisons, finding spaced > massed in 81% with mean d ≈ 0.4. Karpicke & Roediger (2008, *Science*) showed retrieval-practice effects on delayed recall (d ≈ 0.5–0.8 vs restudy). Bjork's "desirable difficulties" framework predicts that effortful retrieval — even of just-learned material — strengthens encoding. For children specifically: Karpicke, Blunt & Smith (2016) replicated the testing effect in elementary-school kids, though smaller (d ≈ 0.3). Music-ed work is thinner but consistent — Stambaugh (2011) found distributed practice beat massed practice on novel motor sequences in 7th-grade band students; Simmons (2012) reviewed spacing in music practice and concluded the effect holds, just with smaller magnitudes than verbal-learning studies.

**Magnitude:** **moderate** in lab terms; **marginal-to-moderate** for Notely. A 30-second warmup at the start of L7 that asks "Tap C, D, E — remember these?" exercises retrieval of letter-name → key mapping (a fact-like skill where the testing effect is largest). But three things compress the gain:
1. Notely **already** has warmups in 6 of 10 lessons (L2, L5, L6, L7, L8, L9 — `lessons.ts:208,421,497,583,664,751`). They are *re-engagement* warmups ("Welcome back! Tap along!") not *retrieval* warmups ("which key was C?"). The marginal improvement is the *retrieval framing*, not the warmup-step itself.
2. The spacing benefit assumes meaningful gaps between exposures. A child completing L6 then L7 in the same 10-minute sitting gets no spacing benefit — it's effectively massed practice. The benefit accrues only for the sub-population that genuinely returns days later (PRD A7).
3. Procedural skills (tapping pulse, holding sustain) consolidate primarily through repetition during the lesson itself; retrieval-practice gains are largest for *declarative* recall (note names, "long vs short" labels), which is a smaller fraction of Notely's outcomes.

**Feasibility:** **easy, ~6–10 hours.** Notely already supports warmup steps; what's missing is the *retrieval framing*. The cleanest implementation reuses existing step types — change the `instruction` copy and add a small `previousLessonRef?: { lessonId: string; conceptLabel: string }` field. Specifically:
- Augment `LessonStep` (`lessons.ts:11–55`) with `previousLessonRef?: { lessonId: string; concept: string; promptCopy: string }` — additive, no breaking change.
- Update warmup steps in lessons.ts: L2 step 0 (`:206–214`), L5 step 0 (`:419–425`), L6 step 0 (`:495–501`), L7 step 0 (`:581–587`), L8 step 0 (`:662–670`), L9 step 0 (`:749–757`). Add new warmup steps at L3 step 0, L4 step 0, L10 step 0 — currently no warmup.
- No `Lesson.tsx` runtime changes required; this is pure content. Render path is the existing `explore` step renderer.
- Lower-risk than touching `Lesson.tsx`'s 3K-line render tree.

**Verdict:** **build small** — convert existing generic warmups to retrieval-framed warmups via copy + content data. Skip building a whole new step type. The mechanism is cheap, evidence is robust enough, and the upside is real for the subset of users who *do* return on a delay. Just don't claim it'll move the needle on a kid playing once.

---

### 2. Lesson variations on replay

**Evidence:** **weak-to-mixed.** The cluster of relevant work is *variability of practice* (Schmidt 1975, Shea & Morgan 1979 contextual interference) — varying surface features of a motor task improves long-term retention vs blocked practice, even though it depresses in-session performance. Effect sizes d ≈ 0.3–0.5 in adult motor-learning labs. **But:** the contextual interference effect *attenuates in children under ~12* (Pollock & Lee 1997; Granda Vera & Montilla 2003). Younger learners often benefit more from *blocked* repetition because their working memory can't tolerate the cognitive load of varied trials. Klingberg's work on working memory in children (2010, *Trends Cog Sci*) reinforces this — variability adds load, and 6–8 year olds have ~half adult capacity. There's effectively no evidence that surface-variant drums-patterns improve retention in a 7-year-old over hearing the same set twice.

**Magnitude:** **marginal.** The *intended* benefit is novelty-on-replay → higher willingness to revisit. That's a *retention/engagement* effect, not a *learning* effect, and it's also speculative — a 7-year-old who finished a lesson rarely chooses to replay it; they advance. The PRD flow (8.2) and SkillTree linear unlock (PRD §6.7) push forward, not back. Honest expectation: most children complete each lesson exactly once. Variations on replay benefit ~0% of single-pass users and an uncertain fraction of repeat users (whose existence is itself unverified).

**Feasibility:** **medium, ~12–20 hours.** Mechanically straightforward — change `rhythmPatterns`, `dynamicsQuiz`, `durationQuiz`, `tempoQuiz`, `options` from arrays to arrays-of-arrays, pick one at runtime. But the surface area is wide:
- Schema changes in `lessons.ts:11–55` to every quiz-like field (`options`, `rhythmPatterns`, `dynamicsQuiz`, `durationQuiz`, `tempoQuiz`, `patternQuiz`, `dynamicScenes`) — 7 fields.
- Selection logic somewhere in `Lesson.tsx`. The lesson loads via `LESSONS[lessonId]` at `:38`; you'd insert a variant-picker that reads e.g. `notely_progress[lessonId].playCount` and rotates.
- Quiz multi-question state (`tempoQuizQuestion`, `rhythmQuizQuestion`, etc., `:91, :102, :115, :119, :124`) iterates through arrays — variant selection has to happen *before* those indices are computed, or you get desync.
- Authoring cost is the real hidden tax: 3× the quiz content per lesson means writing and reviewing 2 more sets of options per quiz step across ~25 quiz steps. Pedagogically *equivalent* variants are not trivial to write — Lesson 6 has C/D/E as the literal curriculum content; "varying" it is artificial.
- Risk: silent regressions from random-selection state in `Lesson.tsx` (PRD risk #6 — no tests).

**Verdict:** **skip.** The evidence against helping children under 12 is real, the use case (replay) is rare, and the authoring cost is highest of the four. If the underlying goal is "make repeat sessions feel fresh," there are better mechanisms (Practice Room song additions, R-1 in roadmap). Do not build variant content for an audience that doesn't replay.

---

### 3. Cross-lesson callbacks

**Evidence:** **moderate**, indirectly. There is no body of work titled "cross-lesson callbacks" but the underlying mechanism — *elaborative encoding* via integration with prior knowledge — is well established (Craik & Lockhart 1972 depth-of-processing; Anderson's ACT-R memory model). Bransford's *How People Learn* (2000) repeatedly emphasizes that new learning is built on prior knowledge made explicit. For children, Hallam's work on music practice (2001, 2011) notes that expert teachers explicitly link new material to previously mastered material, and that this verbal scaffolding has measurable effects on retention. Lehmann & Sloboda (2007, *Psychology for Musicians*) treat "connection-making" as a core feature of effective music instruction. Effect sizes for elaborative encoding hover d ≈ 0.3–0.5 in classroom studies; nothing music-specific or age-specific is precise.

**Magnitude:** **moderate, but the realized impact depends almost entirely on copy quality.** "Remember the long sound you held in L3? Now make it loud" is good when the child *did* hold a long sound in L3 — but kids who skipped L3, replayed only L8, or forgot what "long" felt like will be confused. The benefit is theoretical and high *for the child following the linear sequence with retained memory*; it shrinks fast otherwise. There's also a real risk of making the lesson feel like school ("remember when…?") — a tone violation that the PRD §2 explicitly designs against.

**Feasibility:** **easy, ~3–5 hours.** This is pure copy. No type changes, no runtime changes:
- Edit `instruction` and `content` strings in `lessons.ts` for selected steps in L4–L10 where a callback to an earlier concept is natural. Roughly 8–12 edits across the file.
- No `Lesson.tsx` changes.
- Lowest-risk of the four. Trivially reversible.

**Verdict:** **build first.** Smallest effort, no schema/runtime risk, and the principle (elaborative linking) is well-grounded enough that even a small improvement is worth the cost. Be ruthless about tone — these should feel like a friendly nudge, not a quiz. Five well-crafted callback lines across the curriculum probably out-deliver the entire variations-on-replay system.

---

### 4. Reflection surfacing

**Evidence:** **weak** for learning outcomes; **moderate** for engagement/identity. The PRD logs A/B reflections to `notely_reflections` (`Lesson.tsx:914–920`) but never reads them back. Resurfacing them ("Last time you said long sounds feel calm…") draws on two literatures:
- **Self-referential encoding** (Rogers, Kuiper & Kirker 1977; Symons & Johnson 1997 meta-analysis, d ≈ 0.5 for adults): information linked to the self is retained better. But the original reflection is the *self-reference*, not the resurfacing — the encoding benefit was captured at the reflection moment, weeks ago.
- **Identity formation in learners** (Dweck on mindset; Yeager on belonging): being told "you're the kind of learner who prefers X" can reinforce continued engagement.
- For children 6–12 specifically: nothing precise. Most reflection-as-pedagogy work (Hattie & Timperley on feedback, d ≈ 0.7) is on *feedback about performance*, not surfaced self-descriptions, and is for older students.

There is essentially **no rigorous evidence** that resurfacing a previous A/B answer ("I liked long sounds") improves *music learning outcomes* in a 7-year-old. It might improve a sense of continuity, which could marginally aid return — but that's a second-order engagement effect, not a learning gain.

**Magnitude:** **marginal for learning; possibly moderate for emotional continuity (which is real value).** A child who returns after a week and sees "Last time you said long sounds feel calm — let's build on that" gets a small but meaningful "this app remembers me" moment. That helps PRD G2 (joy/retention) more than G1 (learning outcomes). Don't sell it as a learning improvement; sell it as a re-engagement hook.

**Feasibility:** **medium, ~8–12 hours.** Plumbing exists; consumption doesn't.
- Reflections are written at `Lesson.tsx:914–920` to `notely_reflections` with shape `{ lessonId, stepIndex, answer, timestamp }` (PRD §6.6).
- A read-back component would live most naturally on Dashboard (after onboarding/mood, before lesson list) or as a one-off line on the first warmup step of the next lesson.
- A simple V1: at Dashboard mount, if `notely_reflections` non-empty AND `now - lastReflection > 24h`, show a banner pulling the most recent answer text. Add to `Dashboard.tsx` near where mood-check / session-recap render (PRD §6.9 — there's existing space for these prompts).
- A more integrated V1: pass `priorReflection` into the first `explore`/`watch` step of each lesson and render it in instruction copy. Requires reading `notely_reflections` at the top of `Lesson.tsx` (next to `:38`) and threading it through to the render functions — touches the 3K-line file (risk).
- Hard case: reflection answers are `{ value: "long" | "short" | "loved" | "fast" }` — short tokens, not sentences. The "Last time you said long sounds feel calm" copy is the *app's* expansion of the tag. So you also need a mapping table from `(lessonId, stepIndex, value)` → resurface-copy. Authoring lift ~20 mappings.

**Verdict:** **experiment first.** Build a small Dashboard-only version (no `Lesson.tsx` touch). If qualitative response is "kids smile / parents notice," graduate to inline. If it lands flat, kill it without sunk cost. Do not invest in the full inline-during-lesson version until the dashboard probe shows signal.

---

## Cluster Conclusion

**Comparison summary**

| Improvement | Evidence | Magnitude | Cost (hrs) | Risk | Verdict |
|---|---|---|---|---|---|
| 1. Retrieval warmups | strong | moderate | 6–10 | low | build small |
| 2. Variations on replay | weak/mixed | marginal | 12–20 | medium | skip |
| 3. Cross-lesson callbacks | moderate | moderate | 3–5 | very low | build first |
| 4. Reflection surfacing | weak (learning) | marginal-moderate | 8–12 | medium | experiment first |

**Ship order: 3 → 1 → 4 (probe) → drop 2.**

Cross-lesson callbacks (#3) should ship first. It is the cheapest, lowest-risk change in the cluster — pure copy edits to `lessons.ts` — and it leverages elaborative-encoding evidence that, while not music-specific, is robust enough to justify a 4-hour investment. The downside is bounded: if the callbacks read poorly, they're trivially reversible. There's no good reason to delay this.

Retrieval-framed warmups (#1) should ship second. Six of the ten lessons already have warmup steps that do nothing pedagogically — they're nostalgia bumpers ("Welcome back! Tap along"). Reframing the existing slot to do explicit retrieval is the highest-evidence intervention in the cluster, but only the *delta* from "generic warmup" to "retrieval warmup" is novel — the warmup architecture is sunk cost. So size the expectation accordingly: a modest gain on top of an existing structure, mostly visible in the minority of users who return on a multi-day gap.

Reflection surfacing (#4) is genuinely uncertain. The strongest case for it is emotional continuity — making the app feel like it knows the child — which serves PRD G2 (joy) more than G1 (learning outcomes). Build the cheap Dashboard-only version as an experiment; if it generates qualitative warmth, expand. Do not build the full inline version on faith.

Variations on replay (#2) should be dropped. It's the most expensive option, the evidence base actively works against it for children under 12 (contextual-interference effect attenuates in young learners; working-memory load can hurt them), and the use case — children replaying completed lessons — contradicts both the SkillTree linear-unlock UI and observed child behavior in self-paced apps. If the real underlying goal is "make returning feel fresh," that's better solved by expanding the Practice Room (R-1 in PRD roadmap) than by triple-authoring quiz content.

**The most important honest critique of the cluster.** All four mechanisms assume a returning user. The PRD itself flags the parent-engagement assumption (risk #4) as high-likelihood / high-impact and unmitigated. A retention-and-repetition cluster optimizes for the back half of a funnel whose front half — *the child opening the URL a second time* — has no instrumentation, no parent reminder, no notification surface, and no telemetry to even measure the problem. Before investing in mechanisms that pay off on session 2+, the larger leverage is anything that makes session 2 happen at all: a parent-mailer hook, a "save-this-link" pattern, mood-check tied to a return moment, or an actual measurement of return rate to know whether retention/repetition features are firing at all. Spending 30+ hours on the four proposals here without first instrumenting "does this child ever come back?" is optimizing the inside of a leaky bucket. Ship #3 because it's nearly free; ship #1 as a small incremental polish; probe #4 cheaply; and put the rest of the cluster's budget toward the comeback problem instead.
