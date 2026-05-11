# Session reshape + Orff-native features — research

**Scope:** Seven proposed additions to Notely's session shape and Orff-pedagogy surface area. Evaluated against the actual learner — a 6-12 year old, alone, in a browser tab, with no instrument and no teacher. Effect sizes from research. Feasibility traced to code. Verdicts are opinionated.

**Author's bias up front:** A pedagogy paper is not a kid in a browser. Several of these ideas are framework-correct but only pay off in a facilitated classroom — Orff Schulwerk's home turf. I will name those.

---

## 1. Pre-lesson warmup (30 sec body movement)

**Evidence — tier: strong.** The literature on acute exercise priming cognition in children is the most defensible claim in this list. Pesce et al. (2009, 2016) and Tomporowski et al. (2008, 2015 meta-analysis) show short bouts (typically 10-30 min) of moderate activity reliably improve subsequent executive-function performance in 6-12 year olds with effect sizes around d = 0.2-0.5; Best (2010) and Diamond (2015) find the largest effects when the movement is *cognitively engaging* rather than rote (so "stomp the beat" beats "stomp"). At the 30-second dose this study cluster is *under-tested* — most protocols use minutes, not seconds — so a strict reading is: we know minutes work, we hope seconds do. There's a separate Orff Schulwerk literature (Frazee, *Discovering Orff*, 1987; Wuytack & Boal-Palheiros, 2009) that treats body warmup as constitutive of the method, not optional. Embodied-cognition theory (Glenberg's "embodiment as foundation for cognition," Goldin-Meadow on gesture binding concepts to memory) provides the mechanism: rhythmic movement before a rhythmic task primes the same neural circuitry being recruited.

**Magnitude — moderate.** For learning outcomes proper, probably small (d = 0.1-0.3). For *what the kid feels* in the first 10 seconds, plausibly larger — a kid who stood up and stomped is no longer slumped at a screen. The bigger lever may be habit-formation: a ritual entry creates the cue Wood et al. (2002, 2016) identify as the engine of habit. Lally et al. (2010) put habit-formation around 66 days on average (range 18-254); a daily 30-second cue is a non-trivial habit lever for a kid using the app twice a week.

**Feasibility — easy. ~3-4 hours.** Pre-step injected before `currentStep = 0` in `Lesson.tsx:43`. Add a `warmup` step type or a `lessonData.warmup` field in `lessons.ts:11-55` interface. The "count 8 stomps" interaction needs nothing — show a number, decrement on screen-tap *or* on an "I did it" button. **Honest blocker:** verifying the kid actually stomped is unverifiable in-browser without device motion (see #4). So this is the honor system. That's fine for ages 6-12 but means the warmup converts more on "felt-like-music" than on "measurably-warmed-up."

**Framework alignment.** Direct Orff hit — body before instrument, every session. Generic but useful for Kolb (Concrete Experience phase made literal at session start).

**Verdict: build first.** Cheap, framework-aligned, ritual value. The smallest version (one screen: "Stand up. Stomp 4 times. Then tap.") is probably 80% of the value.

---

## 2. Post-lesson cooldown / free play (60 sec)

**Evidence — tier: moderate, mostly from spacing/transfer rather than "cooldown" per se.** There isn't a strong literature on a 60-second post-lesson play window specifically. The supporting evidence is indirect: (a) immediate consolidation studies (Roediger & Karpicke on retrieval practice; Pashler on testing effect) show that *applying* a skill right after learning it improves retention vs. ending on conceptualization; (b) Kolb's cycle (Experience → Observe → Conceptualize → **Experiment**) literally puts experimentation as the final loop closure; (c) skill-transfer research (Salomon & Perkins) suggests near-transfer happens within the same context and tools; (d) Sloboda & Howe on child practice habits emphasize that *unstructured noodling* with newly acquired skill is correlated with sustained engagement. The "dumps to Dashboard" current behavior is the textbook anti-pattern: it terminates the Kolb cycle one step early.

**Magnitude — moderate, with retention upside.** Specifically because Notely currently ends lessons by writing `progress[lessonId] = { completed: true, stars: 3 }` (Lesson.tsx:1046) and immediately resetting all capstone state (`:1049-1053`), the cooldown is plugging a *current* failure: the kid learns "high and low" then never plays freely with high/low. A 60-second pentatonic free-play with the skill's notes pre-loaded gives them one round of Experiment before they leave. Probably the second-largest win in this list after #5 (persistence).

**Feasibility — easy. ~4-6 hours.** Mechanically simple: at `Lesson.tsx:1039` when `isLastStep`, before `setLessonComplete(true)`, push a synthetic "cooldown" step. Reuse the existing pentatonic recorder UI from Lesson 10 (`step.recorder` rendering path) with a 60-second visible timer and no goal. **Implementation note:** the timer needs to be skippable and to *not* gate completion — a 6-year-old who's spent 8 minutes on a lesson will be done. Make the cooldown a celebration moment, not a chore.

**Framework alignment.** Closes Kolb's loop. Mirrors Orff's "improvisation as confirmation of learning." Constructivism: the kid uses what they built, immediately.

**Verdict: build first.** This is the highest-leverage no-cost change. The fact that the current flow throws away capstone state on completion is, frankly, a pedagogy bug.

---

## 3. Daily ear-training drill (1 min)

**Evidence — tier: mixed-to-weak for the specific format proposed.** Karpinski's *Aural Skills Acquisition* (2000) is the canonical reference and is unambiguous that interval and contour recognition improve with daily, short, repeated exposure — but his population is conservatory-bound adults. For 6-12 year olds, Pratt's (1989, 1990) work on pattern recognition development, Trehub on infant pitch processing, and Costa-Giomi (2004) on piano-learning kids all suggest pitch-direction discrimination is *learnable but slow* below age ~8, and that gains require dozens of sessions before they generalize. Hannon & Trainor (2007) on enculturation timing suggests the window is open but not narrow. The drill format itself ("did the second note go up or down?") is well-validated as a *measurement* (Edwin Gordon's IMMA/AMMA, Bentley's Measure of Musical Abilities) but its value as a *training tool in isolation* is contested — gains often don't transfer to real musical contexts (Murphy 1999, Klonoski 2006 on the "ear-training transfer problem").

**Magnitude — marginal-to-moderate. Speculative for this audience.** Honest assessment: a daily 60-second drill probably moves the needle on the *specific skill of saying "up" vs. "down" when asked* and modestly on the underlying perceptual sensitivity, but is unlikely to be the variable that changes a kid's musicianship over the v1 horizon. The bigger risk is that *making it daily* converts a joyful app into a chore app — see Wood et al. on the "have to" tax. Notely's existing in-lesson ear quizzes (durationQuiz, tempoQuiz, dynamicsQuiz, patternQuiz) already do this in context, which is the more defensible delivery.

**Feasibility — medium. ~6-10 hours.** Needs a new entry surface (Dashboard prompt or Onboarding-style modal), a streak tracker in `notely_session`, ~5-10 question banks, and visual treatment. The audio engine already supports it — `playNote("C4")` then `playNote("E4")` is the entire question.

**Framework alignment.** Generically aural-skills-aligned. Not specifically Orff (Orff is movement-first, not ear-drill-first; Karpinski-style ear training is more conservatory than Schulwerk). Kolb fit is weak because the drill is pure quiz — no Experience, no Experiment.

**Verdict: skip or experiment first.** If you build it, build it as an *optional* "Ear Gym" tab in Practice, not a daily-gate. The "daily drill at session start" framing risks the kid bouncing because they wanted to *play* and the app gave them a test. Notely's whole positioning (§2 of the PRD) is anti-punishing-feedback; a daily drill leans into the failure mode the product is designed against.

---

## 4. Body integration that uses the device less (DeviceMotion)

**Evidence — tier: strong for embodied cognition; weak-to-absent for solo digital implementations.** Goldin-Meadow's gesture-and-learning work, Kontra & Beilock on physical experience improving math understanding, Glenberg's embodied-cognition program — all argue that bodily engagement with a concept strengthens its encoding. For music specifically, Phillips-Silver & Trainor (2005, 2007) showed infants' rhythm perception is *altered by how they're bounced* — body movement is constitutive of rhythm perception, not decorative. So the *premise* (Lesson 1's "your body is an instrument!" while you tap a screen is a contradiction) is correct. The *fix* is where it gets thin. There is, to my knowledge, no published study of DeviceMotion API being used to teach music to children — it's a novel implementation.

**Magnitude — unknown. Plausibly huge for L1-L3; plausibly zero if the UX is hostile.** Two scenarios diverge: (a) the kid stomps and the app *sees* it via accelerometer — the embodiment claim becomes real, and L1's contradiction resolves. Effect size potentially large because the entire point of L1 is body-first. (b) the iOS permission prompt fires, the kid doesn't know what "Motion & Orientation Access" means, parent isn't there, the kid bounces. Effect size negative.

**Feasibility — hard. 2-4 days for a workable version; another day or two for the iOS permission UX.** Real blockers, ordered by severity:

1. **iOS 13+ requires `DeviceMotionEvent.requestPermission()` from a user gesture** and shows a system dialog with text the developer cannot control. A 6-year-old facing a permission modal is a bounce. Mitigation: prompt only after the kid taps a friendly "Let me move!" button, with adult-readable language above the system prompt.
2. **Accelerometer thresholding is hard.** Distinguishing a deliberate "stomp" from a "child walking around with a tablet" requires either a calibration step (ugh) or generous thresholds that risk false positives.
3. **Desktop has no accelerometer.** Need graceful degradation to button-tap mode.
4. **The PRD §10 NFR target is "any device" — DeviceMotion only works on phones and most tablets.** Forces a fallback path anyway, which raises the question: if you have to build the fallback, build the fallback and ship it; gate the DeviceMotion behind a feature flag.

Code anchors: would touch `Lesson.tsx:43` (new step type), `useAudio.ts` (no change — motion is input not output), new `useMotion` hook (~150 LOC), and L1 step copy in `lessons.ts`.

**Framework alignment.** *The* Orff move if it works. Body → unpitched → pitched literally encoded in the input device. Strong Kolb fit (Concrete Experience is now actually concrete).

**Verdict: experiment first.** Build the simpler version of #1 (warmup) first, observe the kid actually doing it, *then* decide whether DeviceMotion adds enough to justify the iOS UX cost. There's a real risk this is "cool demo, hostile reality." Don't ship this until you've watched a kid use it.

---

## 5. Persistent compositions (Lesson 10)

**Evidence — tier: strong (in the sense that the *absence* of persistence is the well-documented failure).** This isn't an "Orff effect-size" question — it's about whether the child can return to creative work. Hennessey & Amabile (2010) on intrinsic motivation, Csikszentmihalyi on flow, Bandura on self-efficacy: all converge on the claim that *the artifact of one's own work, revisitable*, is a primary driver of sustained creative engagement. Kratus (1991) — the load-bearing citation for child improvisation — describes seven stages where revisiting and refining one's own material (stages 4-7) is what differentiates "improvisation" from "exploration." Without persistence, every child in Notely is permanently stuck at stages 1-3.

**Magnitude — large for the specific child who returns.** The honest caveat: kids who never return to Lesson 10 see no benefit. Among kids who *do* play with composition more than once, the upside is large — they can iterate, share, identify their own pieces. This is the deepest "I made music" moment the app can produce.

**Feasibility — easy-to-medium. ~6-10 hours.** Code anchors:
- `Lesson.tsx:128-135` defines `phraseA`, `phraseB`, `compositionForm`, `capstoneInstrument`. All JSON-serializable.
- `Lesson.tsx:1050-1052` is the reset that throws this away. Replace with a `localStorage.setItem("notely_compositions", ...)` write.
- Shape: `{ id, createdAt, lessonId, instrument, phraseA, phraseB, form }[]`. A pair of phrases (10 notes each) plus a form of 6 entries plus metadata is well under 1 KB per composition.
- Replay UI lives naturally on Practice page or BestMomentsWall (`client/src/components/BestMomentsWall.tsx` exists already and currently shows metadata stubs — ideal home).

**Honest blockers:**
- **5MB localStorage cap (PRD §13 risk #3).** At ~1KB each, that's ~5,000 compositions per origin. Not a blocker.
- **No multi-device sync** — the kid who switched tablets loses their compositions. Tolerable for v1; documented in §7.
- **Pruning policy.** What if a kid creates 200 compositions? Keep last 20 by date, or let the user delete. Trivial.

**Framework alignment.** Constructivism in its strongest form — the artifact persists, the kid owns it, future selves build on past selves. Kolb's Experiment phase becomes durable rather than ephemeral. Orff alignment is incidental but real (Orff's *Schulwerk* literally means "schoolwork" in the sense of the body of created work).

**Verdict: build first.** This is the most important item on the list. The PRD itself flags it as R-5 in the roadmap. The current "session-only" capstone undermines the lesson's entire pedagogical claim. Ship it.

---

## 6. Pentatonic improvisation playground (vamp-under-me)

**Evidence — tier: strong from Orff Schulwerk; moderate from improvisation pedagogy.** This is Orff Schulwerk's signature mechanic. Orff & Keetman's *Schulwerk* Volumes I-V (1950-54) are organized around exactly this: ostinato patterns (often I-V or i-VII drones) under which children improvise on pentatonic. Frazee (*Discovering Orff*, 1987) and Saliba (*Accent on Orff*, 1991) both treat the ostinato/improvisation pair as the central Schulwerk mechanic, not an option. Kratus (1991) stage 4 (*"fluid improvisation"*) is *defined* by the child improvising over a stable backdrop. The pentatonic justification (every combination consonant) is identical to Notely's existing design choice (PRD §5).

**Magnitude — moderate-to-large, but contingent on framing.** If the kid understands "anything you play sounds good," they will play. If they don't (and a 6-year-old alone, with no teacher to say "go!", might not), the loop runs and they freeze. The risk is "music plays under me and I don't know what I'm supposed to do." Notely has the design vocabulary to solve this — bouncing prompts, "tap a key, any key!" — but it needs explicit scaffolding.

**Feasibility — medium. ~1-2 days.** Code anchors and notes:
- **Audio engine already supports it.** Looped scheduling is achievable today via `setTimeout` / `setInterval` over `playNote` (see existing `tempoLoopRef`/`beatLoopRef` in `Lesson.tsx:97,106`). A cleaner version uses Web Audio's `AudioBufferSourceNode.loop = true` or scheduled `oscillator.start(time)` calls. **No engine change required for v1.**
- **Vamp design:** simplest is a C drone + occasional G (I-V); slightly richer is a C-G-Am-F walk (the four chords of half of pop music) — but Am and F are not in Notely's current synth path beyond single-note `playNote`. Multi-note chord playback would need either rapid-arpeggiation tricks or a new `playChord` helper (~30 LOC).
- **Tempo control + key control:** trivial slider + dropdown. Already have tempo precedent in Lesson 9.
- **Lives in Practice.** Add a fourth tab to `Practice.tsx:48` alongside piano/rhythm/songs. Or replace the metronome-only "rhythm" tab with "jam."

**Framework alignment.** This is the single most Orff-native item on the list. If Notely is going to claim Orff Schulwerk pedagogy in §5 of the PRD, the absence of an ostinato/improvisation mode is a credibility gap. Constructivism fit is also strong.

**Verdict: build small.** Ship a minimal version (one vamp: C drone at 90 BPM with occasional kick + hat, child improvises on C-D-E-G-A). Iterate based on whether kids actually use it. Do not let scope creep this into "five vamps, three keys, tempo slider" before shipping the first one.

---

## 7. Speech rhythms / chant patterns ("pep-per-o-ni piz-za")

**Evidence — tier: strong for facilitated settings; weak-to-absent for solo digital.** This is the *literal* Orff entry point. Orff & Keetman Vol. I opens with speech patterns ("Pe-ter, Pe-ter / pump-kin ea-ter"), chant to clap to drum being the canonical transfer sequence. Frazee, Saliba, Wuytack — every Schulwerk primary source treats speech rhythms as how rhythm is internalized. Patel's *Music, Language, and the Brain* (2008) provides neural evidence: the same pulse-extraction circuitry processes prosodic stress in speech and beat in music. Bolduc & Lefebvre (2012) and Anvari et al. (2002) link phonological awareness to musical rhythm in children. The case for the *concept* is overwhelming.

The case for *Notely's implementation* is much weaker. Speech rhythms work because a child *says* the word and *feels* the rhythm in their own mouth. A browser app cannot make the child speak. It can *show* "say pep-per-o-ni piz-za while you clap" — but verification is zero (can't listen to the mic without permission, can't tell if the kid actually said anything). Without the somatic component, it collapses to "look at words on screen while tapping" — a syllable-counting exercise, not a Schulwerk move.

**Magnitude — small to moderate, with a large gap between the framework claim and the digital reality.** If the child does say the words, probably useful. If they don't (and a kid alone with a screen probably won't, especially the older end of 6-12 who are self-conscious), it's a typography flourish. There's no instrumentation to know which one happened.

**Feasibility — easy. ~4-6 hours.** Pure UI: animated syllables flash in time with `playDrumTap` over `setInterval`. Already have the rhythm-visualizer pattern in `Lesson.tsx` (rhythm steps render with beat highlights). No new audio capability needed. *(Mic-based verification is a separate, hard problem — `getUserMedia` plus a pitch/energy detector, several days, plus the same iOS permission UX issue as #4.)*

**Framework alignment.** Highest Orff alignment of any item — this is literally what Orff did first. Whether the *digital implementation* preserves that alignment is the open question.

**Verdict: experiment first.** Build a tiny version (one chant, one screen, in Lesson 2's rhythm section) and watch a real child use it. If they say the words aloud — keep going. If they don't, the speech-rhythm framing is just decorative text and the same syllable-rhythm content lands as well with a non-speech presentation. Don't build the whole speech-rhythm subsystem on the strength of the Orff literature alone — the literature assumes a teacher in the room.

---

## Top 3 of 7 — clearly worth shipping

1. **#5 Persistent compositions.** Largest learning-and-engagement upside, cheapest implementation, closes the most embarrassing pedagogy gap in v1. Already roadmapped (R-5). Ship first.
2. **#2 Post-lesson cooldown.** Plugs an active Kolb-cycle failure. ~4-6 hours of work. Highest hours-to-value ratio.
3. **#1 Pre-lesson warmup.** Habit formation lever, ritual entry, ~3-4 hours. The smallest-meaningful version is one screen.

If a fourth: **#6 Pentatonic improvisation playground**, in its minimal form (one vamp, one key). It's the most Orff-credibility-relevant item and the engine already supports it.

## The skip(s) — weakest items

- **#3 Daily ear-training drill.** Mixed evidence for the format. High risk of turning a joyful app into a chore app — a direct violation of Notely's §2 problem statement ("punishing feedback loops"). Existing in-lesson ear quizzes already deliver this in context. If anything daily belongs at session start, it should be #1 (warmup), not a quiz.
- **#7 Speech rhythms**, *in the form proposed*. Framework-perfect, digital-implementation-thin. The Schulwerk literature does not translate cleanly to a child alone with a muted-by-default screen. Experiment with a single chant in an existing lesson before building infrastructure.

## The crucial honest critique

The single biggest risk in this list — and the one I want to name plainly — is that **several items sound great in a pedagogy paper because Orff Schulwerk assumes a teacher and a group**. The literature is overwhelmingly from facilitated K-3 classroom settings. Wuytack and Frazee describe circles of children clapping, calling, responding to a teacher's body cue. Notely's user is alone in a tab. Items #4 (device motion), #7 (speech rhythms), and parts of #6 (improvisation without the social safety net of "we're all doing it") are most at risk of being "Orff-shaped" in code but pedagogically inert in practice.

The way to derisk this isn't more research. It's: **build the cheap items first (#1, #2, #5), watch a real 6-12 year old use them, then decide which of #3, #4, #6, #7 is worth the additional engineering**. The current literature cannot answer "does a solo digital DeviceMotion stomp game move learning outcomes for an 8-year-old in a browser tab" because no one has run that study. You'll be the one running it. Build accordingly.

A second related critique: **all seven items add to the session, none simplify it**. The current 10-lesson curriculum is already a lot for a 6-year-old to navigate alone (PRD assumption A7: "Session is short and infrequent"). A warmup *and* a cooldown *and* a daily drill *and* a chant intro is a session-budget problem. Pick the two or three highest-leverage items, ship them, and protect the kid's attention.

A third: **persistent compositions (#5) is the only item that increases what the kid *owns*** rather than what the kid *does*. Doing-items wash off; ownership-items compound. That's the strongest reason to put #5 first.
