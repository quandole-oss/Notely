# Codebase Concerns

**Analysis Date:** 2026-03-21

## Tech Debt

**Monolithic Lesson Component:**
- Issue: `client/src/pages/Lesson.tsx` is 2,884 lines with 61 state variables and refs managing independent lesson features (sequences, rhythm, tempo, dynamics, patterns, composition)
- Files: `client/src/pages/Lesson.tsx`
- Impact: Extremely difficult to test, debug, or modify any single feature without affecting others. Component exceeds cognitive complexity limits for safe maintenance.
- Fix approach: Extract each lesson type (rhythm, tempo, dynamics, patterns, capstone) into separate sub-components or custom hooks. Create a feature-based internal module structure (`useLessonSequence()`, `useLessonRhythm()`, `useLessonTempo()`, etc.) to isolate state and side effects by concern.

**Disabled ESLint React Hooks Rules:**
- Issue: Five instances of `eslint-disable-next-line react-hooks/exhaustive-deps` in `client/src/pages/Lesson.tsx` at lines 736, 794, 803, 812, 821 skip dependency validation
- Files: `client/src/pages/Lesson.tsx`
- Impact: Risks stale closures, missed re-runs, and undetected missing dependencies. Dangerous in async/interval scenarios where deps matter for cleanup timing.
- Fix approach: Refactor to eliminate disabled rules by either (a) restructuring effect dependencies, (b) extracting logic to hooks with proper deps, or (c) using useCallback to memoize handler functions explicitly.

**Excessive useState Count:**
- Issue: 61 state declarations in Lesson.tsx spread across different concerns (demo play, rhythm, tempo, dynamics, patterns, composition recording) with interdependencies
- Files: `client/src/pages/Lesson.tsx` (lines 43–100+)
- Impact: State updates are difficult to reason about; transitions between lesson types risk state pollution or incomplete resets.
- Fix approach: Use a reducer (`useReducer`) to co-locate related state updates, or split into feature-specific hooks that each manage a cohesive subset of state.

## Known Bugs

**Metronome/Interval Cleanup Risk:**
- Symptoms: If Lesson component unmounts while intervals are running (`beatLoopRef`, `tempoLoopRef`, `pulseRef`), cleanup may race with setInterval causing memory leaks or dangling audio playback
- Files: `client/src/pages/Lesson.tsx` (lines 740–786 useEffect blocks, refs at lines 77, 86, 87)
- Trigger: Navigate away from Lesson during active beat loop or pulse guide; unmount before clearInterval fires
- Workaround: Always trigger lesson completion before leaving; manually stop beat by switching lesson types before navigation

**Song Demo Timeout Array Not Cleared on Tab Switch:**
- Symptoms: Switching tabs (piano → rhythm → songs) while song demo is playing leaves timeouts in `songDemoTimeoutsRef.current` running in background, causing continued note highlights and audio
- Files: `client/src/pages/Practice.tsx` (lines 129–156, specifically line 409 where song change clears but nested cleanup is incomplete)
- Trigger: Start song listen demo, click another song tab button mid-playback, old timeouts still fire
- Workaround: Manually click "Listen First" again to overwrite the array, or navigate away and back to Practice

**Audio Context May Fail Silently:**
- Symptoms: If browser denies AudioContext creation (strict security policy) or getUserMedia is unavailable, errors are caught and logged to console.warn but audio plays nothing; UI gives no feedback
- Files: `client/src/hooks/useAudio.ts` (lines 129–131, 220–222, 303–305); `client/src/pages/Lesson.tsx` composition recording
- Trigger: Strict Content Security Policy, incognito mode on Safari, iOS with restricted permissions
- Workaround: Test on target device before deployment; check browser console for warnings

## Security Considerations

**Student Profile Stored in localStorage:**
- Risk: `localStorage.setItem("notely_student", ...)` in `client/src/pages/Onboarding.tsx` (line 65–68) stores profile data (name, avatar, instrument choice) unencrypted in browser storage; accessible by any script on domain
- Files: `client/src/pages/Onboarding.tsx`, `client/src/pages/Dashboard.tsx` (reads from localStorage)
- Current mitigation: Data is non-sensitive (only UI preferences); no passwords or auth tokens stored
- Recommendations: (1) If future versions add progress tracking or real user accounts, migrate to secure session storage. (2) Add localStorage versioning to handle schema changes. (3) Consider adding a "clear data" button in settings for GDPR compliance.

**External Image CDN Dependency:**
- Risk: Onboarding hero image loaded from `https://d2xsxph8kpxj0f.cloudfront.net/...` (line 102 in Onboarding.tsx); failure causes broken layout, no fallback
- Files: `client/src/pages/Onboarding.tsx` (line 102)
- Current mitigation: CSS provides minimum height; image is non-critical to flow
- Recommendations: (1) Host image locally in `client/public/` instead of external CDN. (2) Add `onerror` handler or fallback `<noscript>` for image fail. (3) Test with network throttling or CDN outage simulation.

**Web Audio API Type Safety:**
- Risk: `window as any` cast at line 42 in `useAudio.ts` bypasses type checking for webkit AudioContext fallback
- Files: `client/src/hooks/useAudio.ts` (line 42)
- Current mitigation: Only affects non-standard browser APIs; cast is confined to single location
- Recommendations: Define a proper type declaration (`declare global { interface Window { webkitAudioContext?: typeof AudioContext } }`) to replace the `any` cast and restore type safety.

## Performance Bottlenecks

**Large Lesson Data Object:**
- Problem: `client/src/data/lessons.ts` is 811 lines defining 10 full lessons with all steps, options, quiz questions, and musical sequences as inline objects; no lazy loading or code splitting
- Files: `client/src/data/lessons.ts`
- Cause: All lesson data imported into memory on app startup; bundle includes unused lessons until navigated to
- Improvement path: (1) Split lessons into separate files per lesson ID, then lazy-load only on `/lesson/:id` route. (2) Use dynamic imports and React.lazy to split chunks. (3) Eventually move to a backend API so lessons are fetched server-side.

**Multiple Audio Oscillators Without Cleanup:**
- Problem: `playNote()` and `playInstrumentNote()` create 3–4 Web Audio API nodes (oscillators, gains, filters) per call; if called rapidly (e.g., rapid drum taps), nodes accumulate in memory until GC
- Files: `client/src/hooks/useAudio.ts` (lines 66–306, specifically nodes at 90–127 and 238–302)
- Cause: No explicit `disconnect()` calls; oscillators auto-stop at duration, but gain/filter nodes may persist
- Improvement path: (1) Add explicit `masterGain.disconnect()` and `filter.disconnect()` after stop time. (2) Implement an object pool for frequently-used nodes (kick drum). (3) Cap concurrent notes to 8 simultaneously.

**No Memoization of Large Component Trees:**
- Problem: Lesson component re-renders entire UI even when only internal state (e.g., beatIndex) changes; step content, quiz options, piano keyboard re-render unnecessarily
- Files: `client/src/pages/Lesson.tsx` (rendering at lines 1000+)
- Cause: No React.memo or useMemo on sub-components; effects trigger parent re-renders
- Improvement path: Extract step-specific renderers to memoized sub-components; only re-render when `currentStep` or step content changes, not internal timing variables.

## Fragile Areas

**Song Progress State in Practice Room:**
- Files: `client/src/pages/Practice.tsx` (lines 49–50: `songProgress`, `songDemoNoteIdx`)
- Why fragile: Song completion logic (line 74–85) resets `songProgress` after celebration timeout; if timeout doesn't fire or user navigates away, `songProgress` may be inconsistent with button state
- Safe modification: Consolidate song state into a reducer or custom hook that ensures all related state (progress, demo playing, demo note) is updated atomically
- Test coverage: No test for song completion edge cases (rapid clicks, navigation, tab switch)

**Rhythm Tap Feedback Color Logic:**
- Files: `client/src/pages/Practice.tsx` (line 371–373 ternary for button color based on `lastTapFeedback`)
- Why fragile: Three-state logic (great/good/miss) with tight coupling to setTimeout(600ms) at line 105; if state resets before render, button may flash wrong color
- Safe modification: Extract to a small hook or helper with guaranteed state isolation
- Test coverage: No test for rapid successive taps or state transition timing

**Lesson Step Type Routing:**
- Files: `client/src/pages/Lesson.tsx` (1000+ lines of conditional rendering based on `step.type`)
- Why fragile: Adding new step type requires modifying central switch logic; missing a handler in one section (watch/listen/play/quiz/explore) will silently skip that feature
- Safe modification: Use explicit type guards and feature handlers; consider plugin system where each step type is a separately-imported module with known interface
- Test coverage: No automated tests; manual testing required for each step type

## Scaling Limits

**All Lesson Data in Client:**
- Current capacity: 10 lessons × ~100 lines each = 811 lines; bundle size ~34KB when minified
- Limit: At 100 lessons, data file grows to 8,100 lines (~340KB); with 500 lessons, parsing/search becomes slow
- Scaling path: Implement backend lesson API (REST or GraphQL) that delivers only current lesson; add caching layer for offline access

**Audio Synthesis CPU Usage:**
- Current capacity: Web Audio API can typically handle 10–15 concurrent oscillators on mid-range mobile devices
- Limit: Rapid tapping (>10 notes/second) or simultaneous instrument playback (lesson 1 "Music Has Voices") may cause audio glitches or CPU spike
- Scaling path: Implement note queueing and sampling-based synth fallback for older devices; profile on target devices (iPad, Chromebook)

**localStorage Limits:**
- Current capacity: Single `notely_student` entry (< 1KB)
- Limit: If future versions add per-lesson progress (10 lessons × 100 bytes), storage grows to ~1KB, still well under 5–10MB browser limit
- Scaling path: Consider IndexedDB for larger datasets (e.g., audio recordings); migration path from localStorage to IndexedDB when storage exceeds 100KB

## Dependencies at Risk

**Wouter Patch in Use:**
- Risk: `wouter@3.7.1` is patched (see `patches/wouter@3.7.1.patch` in package.json); patch may break on upgrade
- Impact: Custom routing behavior depends on patch; upgrading Wouter without re-applying patch will break routes
- Migration plan: (1) Review what the patch does and why it's needed. (2) Contribute patch upstream to Wouter if it's a bug fix. (3) Alternatively, replace Wouter with TanStack Router or React Router if feature set grows beyond Wouter's scope

**Tailwind CSS v4:**
- Risk: Project uses `tailwindcss@4.1.14` (cutting edge); v5 will eventually release and may have breaking changes
- Impact: Design tokens in `client/src/index.css` use Tailwind utilities; breaking changes could require CSS refactoring
- Migration plan: (1) Lock Tailwind version in package.json until v5 is stable and tested. (2) Use Tailwind's compatibility layer during migration. (3) Test design system thoroughly before upgrading.

**Radix UI Component Updates:**
- Risk: 30+ Radix UI components imported from shadcn/ui; components are auto-generated and should not be hand-edited per CLAUDE.md instructions
- Impact: If Radix or shadcn/ui introduces breaking changes, many components must be regenerated
- Migration plan: Use `shadcn-ui add --update` command to regenerate all components; review CHANGELOG before running

## Missing Critical Features

**No Offline Support:**
- Problem: No service worker or offline cache; if network disconnects, app becomes unresponsive
- Blocks: Users cannot practice while offline (e.g., on flights, in areas with poor connectivity)
- Current workaround: All logic runs client-side; a static version could theoretically be cached, but no manifest/service worker is configured

**No Account/Progress Persistence:**
- Problem: Student progress (lesson completion, practice scores, favorite instrument) exists only in memory or localStorage; closing browser loses all progress
- Blocks: Cannot track long-term learning; cannot sync across devices
- Current workaround: Manually store progress in localStorage; no cloud backup or analytics

**No Content Management System:**
- Problem: Lessons, songs, and skill tree are hardcoded in TypeScript; adding new content requires code changes and rebuild
- Blocks: Teachers or content creators cannot add custom lessons; deployment required for each content update
- Current workaround: None; requires engineer involvement for all content updates

**No Mobile Keyboard Alternative for Physical Keyboard Support:**
- Problem: Keyboard mapping (A=C, S=D, etc.) only works on desktop; mobile devices have no physical keyboard
- Blocks: Mobile users cannot use keyboard shortcuts; must rely on touch buttons (which is intended, but limits accessibility for external keyboard users on tablets)
- Current workaround: Touch buttons work fine on mobile; external keyboards on iPad are not prioritized

## Test Coverage Gaps

**No Automated Tests:**
- What's not tested: All logic (component rendering, audio playback, state transitions, keyboard handling)
- Files: Entire `client/src/` tree; vitest is installed but unused
- Risk: Regressions in critical paths (lesson flow, quiz logic, rhythm timing) go undetected until manual testing
- Priority: **High** — Start with snapshot tests for Lesson/Practice pages, then unit tests for useAudio hook

**Audio Playback Not Tested:**
- What's not tested: Web Audio API context creation, oscillator frequency accuracy, ADSR envelope timing
- Files: `client/src/hooks/useAudio.ts`
- Risk: Changes to synthesis logic may produce audibly bad results without catching errors
- Priority: **Medium** — Mock Web Audio API, write unit tests for frequency lookup and envelope shapes

**State Transition Not Tested:**
- What's not tested: Lesson step progression, quiz logic (correct/incorrect), rhythm pattern recognition
- Files: `client/src/pages/Lesson.tsx`
- Risk: Edge cases (selecting wrong answer twice, skipping steps, rapid clicks) may break quiz or lesson flow
- Priority: **High** — Write integration tests for core lesson progression flow

**Keyboard Handling Not Tested:**
- What's not tested: Key press detection, note mapping, keyboard cleanup on unmount
- Files: `client/src/pages/Lesson.tsx` (lines 616–737), `client/src/pages/Practice.tsx` (lines 162–180)
- Risk: Keyboard may remain active after navigating away or double-register notes
- Priority: **Medium** — Write tests for keyboard event listeners and cleanup

**Composition Recording Not Tested:**
- What's not tested: Recording engine (if implemented), note sequence capture, playback of recorded composition
- Files: `client/src/pages/Lesson.tsx` (capstone recording state at lines 55–57, unclear if fully implemented)
- Risk: Capstone lesson (Lesson 10) recording feature may be incomplete or have silent failures
- Priority: **High** — Verify recording feature is complete and test thoroughly before shipping capstone lesson

---

*Concerns audit: 2026-03-21*
