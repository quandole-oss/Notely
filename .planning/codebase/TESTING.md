# Testing Patterns

**Analysis Date:** 2026-03-21

## Test Framework Status

**Current State:** No tests configured

**Runner:**
- Vitest installed as devDependency (^2.1.4)
- No vitest.config.ts file present
- No test files found in codebase (no `*.test.ts`, `*.spec.ts` files)
- CLAUDE.md confirms: "There are no tests configured"

**Assertion Library:**
- Not determined (no test setup)

**Run Commands:**
```bash
# Not configured - would require:
# pnpm test              # Run all tests (not set up)
# pnpm test:watch       # Watch mode (not set up)
# pnpm test:coverage    # Coverage report (not set up)
```

## Test Infrastructure Available

**TypeScript Strict Mode:**
- Type checking via `pnpm check` (runs tsc --noEmit)
- Provides compile-time safety for type errors
- Acts as lightweight static analysis pre-test

**Error Boundary Testing:**
- Class-based ErrorBoundary component (`client/src/components/ErrorBoundary.tsx`) exists
- Catches render-time errors in React tree
- Displays stack trace and reload button in development
- Would need to be tested manually via error injection

## Testing Gap Analysis

**Untested Areas:**

**Audio System (`client/src/hooks/useAudio.ts`):**
- 320 lines of synthesizer code
- Multiple oscillators, ADSR envelope shaping, Web Audio API interactions
- Functions with side effects: `playNote()`, `playSuccessChime()`, `playErrorSound()`, `playCelebration()`, `playDrumTap()`, `playInstrumentNote()`, `useAudio()` hook
- Risk: Audio synthesis bugs silently fail (try-catch blocks exist but log to console only)
- No ability to verify correct frequencies, envelope timing, or audio output

**Lesson Data & Step Logic (`client/src/pages/Lesson.tsx`):**
- 2,884 lines (largest file in codebase)
- Complex state machine: step progression, quiz logic, keyboard input handling
- Untested: note sequence validation, quiz answer checking, step transitions
- Risk: Lessons could display wrong content, accept invalid answers, or fail silently

**State Persistence (`client/src/pages/Dashboard.tsx`, all pages):**
- localStorage operations directly in components
- Untested: JSON serialization/deserialization, data type coercion
- Risk: Corrupted localStorage could crash app with JSON.parse() errors

**Navigation & Routing (`client/src/App.tsx`, pages):**
- Wouter routing with custom path aliases
- Untested: route matching, URL parameters (`:id`), fallback to 404
- Risk: Invalid lesson IDs could load wrong content or crash with undefined reference

**Form Handling & Validation:**
- React Hook Form integrated (`@hookform/resolvers`, `react-hook-form` dependencies)
- UI components have validation patterns (FormField, field utilities)
- Untested: form submission, validation logic, error state display

**Keyboard Input (`client/src/pages/Lesson.tsx`, `client/src/pages/Practice.tsx`):**
- Piano keys mapped: A=C, S=D, D=E, F=F, G=G, H=A, J=B
- Untested: key event handling, preventDefault behavior, case sensitivity
- Risk: Keyboard input might not respond, or wrong notes might play

**Component Rendering:**
- 50+ shadcn/ui components in `client/src/components/ui/`
- Custom components: ErrorBoundary, BottomNav, MoodCheck, SessionRecap, etc.
- Untested: component props, conditional rendering, animations, accessibility
- Risk: Visual bugs, missing content, broken interactions

**Mood Tracking & Session Logic:**
- localStorage-based session tracking
- Mood check modal logic
- Untested: date comparison, mood persistence, session summary display
- Risk: Mood check appears multiple times or never, session data lost

## Manual Testing Recommendations

**Since no automated tests exist, establish manual testing workflow:**

1. **Audio Testing:**
   - Test each note plays at correct frequency
   - Verify ADSR envelope produces smooth attack/decay/sustain/release
   - Check success chime, error sound, celebration, drum taps play correctly
   - Validate velocity affects volume appropriately

2. **Lesson Flow Testing:**
   - Complete each lesson end-to-end (1-10)
   - Verify each step type displays correctly: watch, listen, play, quiz, explore
   - Check quiz answer validation (correct answers pass, wrong answers fail)
   - Confirm step transitions work forward/backward
   - Validate progress is saved to localStorage and persists on reload

3. **Keyboard Testing:**
   - Test piano keyboard mapping (A-J keys)
   - Verify held keys don't repeat unwanted sounds
   - Check that other keyboard shortcuts don't interfere

4. **State Testing:**
   - localStorage operations (student profile, progress, session, theme)
   - Test with corrupted localStorage (invalid JSON, missing fields)
   - Verify graceful degradation and defaults

5. **Navigation Testing:**
   - Test all routes (/, /dashboard, /lesson/:id, /practice, /progress, /skill-tree, /404)
   - Test invalid lesson IDs and non-existent routes
   - Verify bottom nav shows/hides correctly on each route

6. **Mobile Testing:**
   - Responsive design on small screens
   - Touch input for buttons and interactive elements
   - Mobile keyboard handling (no physical piano keys)

7. **Browser Compatibility:**
   - Audio Context initialization and resume
   - localStorage availability
   - Wouter routing on different browsers

## Testing Setup Path (Future)

**To implement automated testing:**

1. **Configure Vitest:**
   - Create `vitest.config.ts` in root
   - Configure jsdom for DOM testing
   - Set up module resolution for `@/*` and `@shared/*` aliases

2. **Set up test structure:**
   - Decide: co-located tests (alongside source) or centralized `__tests__/` directory
   - Suggested pattern: co-located (easier to maintain with features)
   - File naming: `FileName.test.ts` or `FileName.spec.ts` (pick one)

3. **Choose assertion/mocking approach:**
   - Use `vitest` built-in assertion API
   - Mock Web Audio API for audio tests (AudioContext, Oscillator, Gain nodes)
   - Mock React components for integration tests
   - Use React Testing Library patterns for component testing

4. **Priority test files to create:**
   - `client/src/hooks/useAudio.test.ts` - Mock Web Audio API
   - `client/src/pages/Lesson.test.tsx` - Test step progression and quiz logic
   - `client/src/components/ErrorBoundary.test.tsx` - Test error catching
   - `client/src/App.test.tsx` - Test routing
   - `client/src/pages/Dashboard.test.tsx` - Test localStorage interactions

5. **Add to package.json:**
   ```json
   "test": "vitest",
   "test:watch": "vitest --watch",
   "test:coverage": "vitest --coverage"
   ```

## Example Test Patterns (Not Yet Implemented)

**Audio Hook Mocking Pattern (Recommended):**
```typescript
// Would mock Web Audio API oscillators and gain nodes
// Test note frequencies are correct
// Test ADSR envelope produces expected gain values over time
// Challenge: no real audio output, only mathematical verification
```

**Component Testing Pattern (Not Yet Implemented):**
```typescript
// Would use React Testing Library for component tests
// Render component, verify DOM structure
// Simulate user interactions (clicks, keyboard, input)
// Check rendered content and state changes
```

**localStorage Pattern (Not Yet Implemented):**
```typescript
// Would mock localStorage globally
// Test JSON serialization/deserialization
// Test default values when localStorage is empty
// Test error handling for corrupted data
```

## Development Tooling

**Available for development:**
- TypeScript strict mode (`pnpm check`)
- Vite dev server with hot reload
- Browser DevTools for debugging
- Console logs (captured to `.manus-logs/` during development)
- Error stack traces in ErrorBoundary

**Missing:**
- Automated test runner
- Code coverage reporting
- Pre-commit test hooks
- CI/CD test pipeline (no GitHub Actions detected)

## Notes

- Vitest is installed but not configured - ready for quick setup
- No existing test patterns to reference in codebase
- Audio testing is most complex due to Web Audio API mocking requirements
- Form validation testing would need react-hook-form mocking strategy
- LocalStorage testing requires cleanup between test runs
- The codebase is well-typed via TypeScript strict mode, which provides some type safety benefits

---

*Testing analysis: 2026-03-21*
