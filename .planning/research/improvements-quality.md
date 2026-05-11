# Quality-refinement improvements — evidence, magnitude, feasibility, verdict

Five candidate refinements for Notely v1.x evaluated against the actual brief: kids 6–12, using the app alone, in a browser, with no facilitator. The user explicitly asked to be told when a change won't really move the needle. Evidence is rated honestly; some of these are genuinely well-supported, others are dressed-up assumptions.

A note on framing the user requested upfront: not every "quality improvement" is a learning-outcome improvement. Two of these (accessibility, honest progress) are *access* and *perceived-progress* changes — they don't make any individual kid learn more deeply per lesson, they make the existing learning reach more kids or feel earned. Mood-shaping and audio-character changes have weaker theoretical claims to per-session learning gains than the literature is usually willing to assert. That separation drives the final ranking.

---

### 1. Honest progress derivation

**Category dominant:** perceived progress (with a smaller retention assist). *Not* a learning-outcome improvement.

**Evidence:** Strong but indirect. Self-Determination Theory (Deci & Ryan, 2000) argues that perceived **competence** is one of three psychological needs that sustain intrinsic motivation; competence requires *informational* feedback that maps to real effort, not fabricated feedback. Lepper, Greene & Nisbett's overjustification work (1973, replicated many times since) showed that extrinsic rewards perceived as decoupled from effort can *erode* intrinsic interest in an otherwise enjoyable activity — and a fake streak / fake badge is exactly that, an extrinsic reward decoupled from effort. Dweck's mindset literature (2006–2017) emphasises feedback that reflects *process*, not arbitrary points; fake numbers fail this test by construction. In K-6 ed-tech specifically, Plass, Homer & Kinzer (2015, *Educational Psychologist*) note that gamification effects depend on the credibility of the feedback loop. Effect sizes from gamification meta-analyses (Sailer & Homner, 2020, *Educational Psychology Review*) cluster around small-to-moderate (g ≈ 0.36 cognitive, 0.43 motivational) — but those are studies of *real* gamification, not placebo gamification. There's no body of evidence that fake numbers help; there's an evidence-based reason to think they hurt the kid who notices.

The kid most likely to notice that the "3-day streak" never changed is the kid who returned three days in a row — i.e. exactly the kid we most want to keep.

**Magnitude:** Medium for *perceived honesty* and *retention of the engaged kid*. Near-zero for per-session learning. This change does not teach pitch, pulse, or anything else more effectively — it only stops the app from lying about effort.

**Feasibility:** Medium. `Progress.tsx:12-21,23-29,31-39,48-49` and `Dashboard.tsx:105-106` all hardcode. The shape of `notely_progress` (Lesson.tsx:1045-1047 — `Record<id, {completed, stars}>`), `notely_reflections` (Lesson.tsx:564-566 — append log with timestamps), and `notely_best_moments` (Lesson.tsx:1062-1064) is sufficient to compute: lessons completed → totalStars; reflection timestamps → daily activity → streak; lesson count by category → "skill levels" (Notes from L4/L5/L6/L7, Rhythm from L1/L2/L3, etc.). PRD §6.6 confirms shapes. No backend needed. Real effort: ~1 day to derive computed values and 0.5 day to redesign achievement triggers from invented descriptions ("3 different chords" — Notely has zero chord lessons) to ones that match the actual curriculum. The harder part is the *design*, not the *code*.

**Verdict:** **Build first.** This is the cheapest credibility win in the list. It also unblocks the parent/teacher view (Roadmap R-2) which depends on the same derivations.

---

### 2. Audio character upgrades (FM-tail drums, music-box timbre option)

**Category dominant:** perceived progress + (very mild) retention. Not a learning-outcome improvement.

**Evidence:** Thin to weak for children specifically. Trehub's pitch-perception work (Trehub & Hannon, 2006, *Cognition*; Trehub, 2003) consistently finds infants and young children are competent listeners — they discriminate pitch contour, consonance, and timbre — but the work establishes children's *capacity*, not a preference for richer timbres. Music-ed research on instrument fidelity in early stages (Hargreaves & North, 1997) suggests that for *engagement* and *expressive feedback*, instrumental realism matters less than *responsiveness* — which Notely already has (synchronous note-on, continuous velocity, sustain mode). The literature has very little to say about whether a "music-box" preset makes a 7-year-old learn pitch faster; it does not. There's some weak evidence that timbral variety extends free-play time in early-childhood music apps, but the studies are small and confounded (Young, 2008, *Early Years*).

Where the evidence *is* strong: poor drums (a flat sine thump) sound like a generic phone notification, and Notely's current kick (`useAudio.ts:175-185` — a sine that sweeps 150 → 40 Hz, no FM tail, no transient click) is exactly that. Children do notice the difference between "drum" and "boop" — Trehub & Trainor (1998) on infant categorization of percussive vs sustained sounds. So fixing the drums has a plausible engagement payoff; adding a "music-box" timbre is mostly cosmetic.

**Magnitude:** Small. The kid plays a few more drum taps, a few more piano notes, before getting bored. The lesson curriculum is unchanged. No documented effect on retention measured in days, let alone weeks.

**Feasibility:**
- FM tail + pitch envelope on kick: ~10 lines added to `useAudio.ts:173-186`. Add a small FM modulator and a click transient (5-10 ms of filtered noise). Easy.
- Music-box timbre: add a `playInstrumentNote("musicbox", …)` branch alongside the existing 5 (`useAudio.ts:232-305`). 20–30 lines. Easy.
- Wiring it into Practice Room as a selectable timbre: ~30 lines in `Practice.tsx`. Easy.

Half a day total.

**Verdict:** **Build small.** Specifically: improve the kick drum (real win, real cheap). Skip the music-box preset until there's a lesson that uses it. Adding presets that no lesson features is feature-creep dressed as polish.

---

### 3. Multi-octave pitch class understanding (low-C / middle-C / high-C are all "C")

**Category dominant:** learning outcome. The only item on this list that's actually a *pedagogical* claim.

**Evidence:** Moderate-to-strong and developmentally specific.

- **Octave equivalence in children.** Sergeant (1983, *Psychomusicology*) and follow-ups by Demany & Armand on infants showed octave equivalence as a perceptual primitive even in preverbal listeners. But *conscious* pitch-class abstraction — the move from "two notes" to "same note, different register" — is the gateway to staff notation, transposition, and singing along with anything not in your vocal range. Costa-Giomi & Descombes (1996), Hargreaves (1986 *The Developmental Psychology of Music*) place explicit octave-equivalence understanding around ages 7–10 — exactly Notely's target range.
- **Spiral curricula (Bruner, Bamberger).** Returning to a concept at increasing levels of abstraction is the *defining* move of a music curriculum. "C is C across octaves" is the *first* abstraction step after letter names.
- **Practical pedagogy.** Orff and Kodály method materials introduce high-low contrast before pitch names (which Notely does in L4) but then explicitly demonstrate octave equivalence with body movement and sung intervals before staff. Notely currently stops at the lower step.

The kid who finishes L7 ("Hot Cross Buns" — E-D-C) and then plays middle-C and high-C and hears "two different notes" has missed a concept that would otherwise transfer directly to every future lesson on intervals, transposition, and chord inversions.

**Magnitude:** Real per-session and per-curriculum. Adds a transferable abstraction that compounds in every lesson after it. Among the five items, this is the one with the clearest claim on *learning outcomes*.

**Feasibility:** Medium.
- Engine: already supports it. `useAudio.ts:9-22` defines C3 through B5; the lesson layer passes octave-less strings like `"C"` which fall back to C4 via `SIMPLE_NOTE_MAP` at `useAudio.ts:25-36`. To use other octaves, lesson keys would need to emit `"C3"`, `"C4"`, `"C5"` explicitly. Trivial.
- Lesson content: needs a new step type or extended `explore`/`quiz` step. Probably 2 small steps appended to L5 (Meet the Piano) and one new step in L6 — show the keyboard's three Cs, hear them in succession, then a 3-option quiz "Which one is also a C?". Medium — this is curriculum design.
- Keyboard widget: the current piano renders 5 or 7 keys (the pentatonic / dimmed-pentatonic arrays at `lessons.ts:72-89`). A new "three-octave landmark" widget showing low-C / middle-C / high-C as three big buttons would be cleaner than expanding the regular keyboard. Easy if scoped as its own component.

~2 days. The risk is making it land at the right age — for some 6-year-olds it will be premature, for most 9–12 year olds it will be the first thing that "clicks" as a real music concept.

**Verdict:** **Build first.** This is the one item that arguably moves G1 ("learning outcomes achieved" — PRD §4). Everything else on this list is polish around an existing learning experience.

---

### 4. Accessibility pass (reduced motion, color-independent feedback, screen reader)

**Category dominant:** access. *Not* a deepening of learning, an *enabling* of it for kids currently locked out.

**Evidence:** Strong and well-codified.

- **WCAG 2.1 Success Criterion 1.4.1 (Use of Color):** "Color is not used as the only visual means of conveying information." Notely's quiz feedback currently relies on mint border (`#3ECFA4`) for correct and coral border (`#FF5C35`) for wrong (PRD AC-5.1/5.2, verified at `Lesson.tsx:2801-2831`). The ✓ / ✗ icons are present, which partially satisfies 1.4.1 — but the *primary* salience is color. About **8% of boys** have red-green colorblindness (Birch, 2012, *Journal of the Optical Society of America*); deuteranopia in particular makes mint and coral nearly indistinguishable in saturation. In Notely's target audience (assume 50/50 split), that's ~4% of all users where the most distinctive single piece of feedback is partially lost.
- **WCAG 2.3.3 (Animation from Interactions) + Pause/Stop/Hide:** Reduced-motion support is now standard. `prefers-reduced-motion` is supported by all evergreen browsers. The vestibular literature (Sutton et al., 2019; AAP guidance on screen-induced motion in pediatric populations) flags that motion sensitivity affects roughly 1–2% of children with diagnosed conditions and a larger fraction with subclinical sensitivity. For most kids the animations are fine; for the affected kids they're the difference between using the app and not. Cost of supporting them is trivial (one `@media` block).
- **Screen reader use by children:** The "Designing for Children's Rights" guide (UNICEF/Designing for Children) and the W3C/WAI WAI-AIRA Authoring Practices for Children's Content emphasise that children with low or no vision use screen readers from age 5+. Notely's synthesizer cannot be voiced (sound *is* the content), but the *chrome* — onboarding wizard, dashboard nav, lesson titles, quiz prompts, feedback states — is text and is voicable. Currently a global grep across `client/src/pages/*.tsx` and `client/src/components/*.tsx` for `aria-label`, `role=`, or `aria-` returns **zero hits**. Onboarding is screen-reader-hostile by default.

Effect size on the *affected* sub-population is enormous (use vs. cannot-use). Effect size on the *whole* population averaged is small, because the affected fraction is small. Both numbers are true; the ethics of the choice depend on whose population you're optimising for.

**Magnitude:**
- *More kids reach the learning* — yes, by a few percent. For a curriculum that markets itself on "any kid with a browser," failing to deliver on that for the 4–10% of kids with colorblindness, vestibular issues, or vision impairment undermines a core product claim (PRD §4 G4, §10 Accessibility row, §16 gap #2).
- *Each individual kid learns more deeply* — no.
- *Retention* — neutral on average; positive on the affected sub-population.

**Feasibility:** Mixed.
- `prefers-reduced-motion` media query in `index.css` reducing the 8+ keyframes (`notely-bounce`, `notely-wiggle`, `notely-shake`, `notely-float`, `slide-up`, `slide-in-right`, `confetti-fall`, `star-pulse`, `notely-beat-pulse`, `notely-glow-pulse` at `index.css:178-241`) to no-op transforms: ~20 lines. Easy. Half a day.
- Color-redundant feedback (icons + text "Yes!"/"Try again!" alongside the colored border): a few changes to the quiz render at `Lesson.tsx:2801-2831`. Easy. Half a day.
- ARIA pass on chrome: ~20+ components and pages. The 3K-line `Lesson.tsx` is the biggest target. Adding `aria-label` to all icon-only buttons, `role="status"`/`aria-live="polite"` to feedback regions, `aria-pressed` to drum pads and piano keys, a `<main>` landmark per page. Medium-hard. 2–3 days for a real pass, plus a NVDA / VoiceOver test session.

Total: ~4 days for a credible v1.1 accessibility pass.

**Verdict:** **Build first — but in two tranches.** The first tranche (reduced-motion + color-redundant icons + text labels on quiz feedback) is half a day and pays for itself in product credibility. The second tranche (full ARIA pass) is a multi-day investment that should be sequenced with R-2 (parent view) because the same chrome work supports both.

This is also the item the PRD has *already acknowledged as a known gap* (§10 Accessibility row, §16 Open question #2). Shipping it closes an admitted debt, not just an aspirational improvement.

---

### 5. Mood-shaped sessions (Dashboard.tsx:102 wiring)

**Category dominant:** intended perceived progress / "the app sees me." Marketed in §6.9 as adaptive but functionally cosmetic.

**Evidence:** **Weak.** This is the item I'd push back on hardest.

- Adaptive content delivery in K-6 ed-tech has a literature, but it's overwhelmingly about **knowledge state** (Bayesian Knowledge Tracing, mastery learning) — what the kid knows — not **affective state**. Meta-analyses of affective adaptive systems (e.g. D'Mello, Lehman, Pekrun & Graesser, 2014, *Learning and Instruction*) report effects in *tutoring agents* that detect frustration in real time and adjust scaffolding. They don't validate "self-reported mood at session start → filter the lesson list."
- The honest comparison: a kid reports "tired," the app shows shorter lessons → does the kid actually learn more? There's no RCT evidence for this in the children's music-app space. The *intervention* (kid sees a banner saying "Short session today") is the kind of UX that *adults reviewing the demo* find responsible, but the kid has already self-selected: a tired kid won't start a 10-minute lesson regardless.
- Self-reported emotional state in children under 10 is also noisy. The MoodCheck component asks for one of three labels (`MoodCheck.tsx:14-18`) once per day; children's emotion labelling at this age is imprecise (Pons, Harris & de Rosnay, 2004, *European Journal of Developmental Psychology*) and the same kid will pick different answers given different framings or different facial-pictograms.

There's a steelman: the *act* of being asked "how are you feeling" is a tiny SEL (social-emotional learning) intervention, and a few minutes of metacognitive check-in has weak evidence (Durlak et al., 2011, *Child Development* — SEL meta-analysis, average g ≈ 0.27 on academic outcomes, but those are *programs*, not single check-ins). Even that benefit is captured by the *current* mood check — i.e. the prompt is already there, doing the work. Wiring it to lesson filtering doesn't add SEL value; it adds a personalisation feeling.

**Magnitude:** Small at best on perceived personalisation. Zero documented on learning outcomes. The kid who sees "Short session today — just 2 lessons" gets a banner; whether they learn more in those 2 lessons than they would have in their natural attention budget is unknown and probably unmeasurable without telemetry the app explicitly doesn't have (§7).

**Feasibility:** Trivial in code, hard in design.
- Code: `Dashboard.tsx:102` is literally `const filteredLessons = lessons;` — replace with a `switch(mood)` mapping. ~10 lines.
- Design: defining a defensible mood → lesson map. Tired → calm listening (L4 High/Low?), energetic → drums (L1, L2)? The mapping is invented; there's no curriculum-pedagogical reason `mood=energetic` should preferentially show L2 over L7. The user could reasonably pick any mapping and none of them are wrong because none are right. That's a clue the feature is in search of a justification.

**Verdict:** **Skip — or rather, wait.** The hook is there in the PRD (§6.9 "Mood … no behavioral filtering wired in yet"; §16 Open question #7 — "behavior is a pending product call"). The right product call is that without a way to *measure* an effect, wiring mood to filtering is theatre. Keep the mood check (the SEL value is real and free). Don't wire it.

If the team wants something here, the cheaper and more defensible move is to use mood to *change the recap copy* ("you finished a lesson on a tired day — that's awesome") rather than to gate content. That respects the kid's self-report without making the app pretend to be adaptive.

---

## Separation table — which category does each improvement actually serve?

| # | Improvement | Learning outcome | Access | Retention | Perceived progress |
| --- | --- | --- | --- | --- | --- |
| 1 | Honest progress derivation | — | — | small | **dominant** |
| 2 | Audio character upgrades | — | — | small | small |
| 3 | Multi-octave pitch class | **dominant** | — | small | small |
| 4 | Accessibility pass | — | **dominant** | sub-population | small |
| 5 | Mood-shaped sessions | — | — | — | small (illusory) |

Only **#3** clearly serves learning outcomes. **#4** serves access — different population, but real. **#1** is the only credibility fix on the list. **#2** is polish with a defensible kick-drum sub-win. **#5** is the weakest justification of the five.

---

## Ship recommendation — top 1–2 for the next iteration

1. **Honest progress derivation (#1).** Cheapest, highest credibility return. It also retires a §13 risk #5 already flagged in the PRD. The Progress page is currently the place a skeptical parent or reviewer will lose trust in 10 seconds. Half-to-one day of work; unblocks R-2 (parent view) later. Ship.

2. **Multi-octave pitch class (#3).** The only item that earns the word "learning improvement" honestly. Two days, fits cleanly inside the existing Orff/Kolb progression, builds on engine capability already present. The pedagogy is established; the gap in Notely is real (kids who finish v1 don't know that "C" exists at multiple octaves and that's the whole foundation of staff and chord theory). Ship.

If a third slot were available, the **half-day half of accessibility** (reduced-motion + icon/text-redundant feedback) would be it. It closes an admitted gap (§16 #2) for the cost of a long afternoon.

What to **explicitly defer**:

- **Audio polish (#2) beyond the kick drum.** The kick fix is 20 minutes. Anything more is gilding.
- **Mood-shaped sessions (#5).** No mechanism, no measurement, invented mapping. The MoodCheck modal already extracts whatever SEL value the prompt offers; wiring it to lesson filtering will look thoughtful in a screenshot and change nothing.

---

## Honest critique — which of these is "added because it sounds responsible"?

**Mood-shaped sessions (#5)** is the clearest example on the list. It has the *language* of personalisation, the *posture* of empathy, the *mechanic* of adaptive content — and the *evidence base* of a focus-group quote. The mood check is *already* doing the only thing that has any literature behind it (the meta-cognitive prompt itself). Wiring it further would be product theatre.

Honourable mention: the **"music-box timbre" half of #2**. It sounds responsible ("polish, character, expressivity") and serves no curriculum, no lesson, no measurable goal. The drums fix is real; the music-box preset is a feature with no scene to play.

A more uncomfortable second push-back: **audio character upgrades broadly (#2)** are easy to overrate because they're *fun to build*. They produce a visible (audible) demo. They feel like quality. They do not, on any reading of the literature, meaningfully change whether a 7-year-old learns to find middle C. Build the kick fix; resist the urge to add three more presets in the same PR.

Finally, the contrarian honest take on **#4 accessibility**: it is not, in the strict sense, a "learning outcome improvement" — and the user's framing distinguishes that. It is more important than that. It's the difference between the product claim ("any kid, any browser") being true or false. That's a category the user named: *access*. Don't let the framing make accessibility feel like a tier-two concern; it's tier-one for a *different* reason than #3.

---

**Bottom line.** Of the five, only #3 sharpens learning per session. #1 and the cheap half of #4 sharpen the *truthfulness* of the experience. #2 is mostly cosmetic with one real sub-win. #5 is the item to skip with confidence.
