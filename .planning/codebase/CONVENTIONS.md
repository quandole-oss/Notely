# Coding Conventions

**Analysis Date:** 2026-03-21

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `ErrorBoundary.tsx`, `MoodCheck.tsx`, `BottomNav.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAudio.ts`, `usePersistFn.ts`, `useComposition.ts`)
- Utilities: camelCase (e.g., `utils.ts`, `const.ts`)
- Data files: camelCase (e.g., `lessons.ts`)
- UI components: lowercase kebab-case (e.g., `button.tsx`, `card.tsx`, `dialog.tsx`)

**Functions:**
- camelCase for all exported functions
- Private functions not exported (no underscore prefix convention observed)
- Hooks exported as `useXxx()` pattern

**Variables:**
- camelCase for all variables, constants, and state
- CSS variables use double-dash prefix in custom CSS (e.g., `--sunny`, `--coral`, `--primary`)
- Record/Map types use PascalCase for keys when representing enums (e.g., `KEY_TO_NOTE: Record<string, string>`)

**Types:**
- Interface names: PascalCase without prefix (e.g., `ThemeContextType`, `ThemeProviderProps`, `Props`, `State`)
- Type aliases: PascalCase (e.g., `Theme`, `Mood`, `LogSource`)
- Generic type parameters: Single letters or descriptive PascalCase (e.g., `T`, `UseCompositionReturn<T>`)
- Discriminated union types used (e.g., `type: "watch" | "listen" | "play" | "quiz" | "explore"`)

**Constants:**
- UPPER_SNAKE_CASE for module-level constants and magic numbers
- Examples: `NOTE_FREQUENCIES`, `SIMPLE_NOTE_MAP`, `PAGES_WITH_NAV`, `MOBILE_BREAKPOINT`, `MAX_LOG_SIZE_BYTES`
- Lowercase for data structures that are like configurations (e.g., `NAV_ITEMS`, `MOODS`, `LESSONS_DEF`, `ACHIEVEMENTS`)

## Code Style

**Formatting:**
- Prettier configured (dependency installed)
- Command: `pnpm format`
- No `.prettierrc` file present - uses Prettier defaults
- 2-space indentation (standard)

**Linting:**
- No ESLint configuration detected
- TypeScript strict mode enabled (`"strict": true` in tsconfig.json)
- Type checking available via `pnpm check` (tsc --noEmit)

**Type Safety:**
- TypeScript strict mode enforced
- Type annotations on function parameters and return types required
- All `any` usage avoided in observed code
- React component props typed via `interface Props { ... }`
- Generic types properly constrained (e.g., `<T extends HTMLInputElement | HTMLTextAreaElement>`)

## Import Organization

**Order:**
1. React/third-party library imports (`react`, `framer-motion`, `wouter`)
2. UI framework imports (`@/components/ui/`, `radix-ui/`)
3. Custom components (`@/components/`)
4. Hooks (`@/hooks/`)
5. Utilities and helpers (`@/lib/utils`)
6. Data and constants (`@/data/lessons`, `@/const`)
7. Types (inline or separate `type` imports)
8. CSS imports (typically last or inline)

**Path Aliases:**
- `@/*` resolves to `client/src/*` (configured in tsconfig.json)
- `@shared/*` resolves to `shared/*`
- `@assets/*` resolves to `attached_assets/` (used in vite.config.ts)
- All imports use aliases, no relative paths observed in application code

**Type Imports:**
- Use `import type { X }` for TypeScript-only imports (e.g., `import type { LessonStep }`)
- Destructured type imports used when appropriate

## Error Handling

**Patterns:**
- Try-catch blocks used in sensitive operations (e.g., `useAudio.ts` playback functions)
- Error logging via `console.warn()` for non-critical failures (audio playback)
- Error logging via `console.error()` for significant failures (Map component, ErrorBoundary)
- Error Boundary component (class-based) wraps entire app to catch render errors
- Context hooks throw with `throw new Error(message)` if used outside provider (e.g., `useTheme()`)
- Graceful fallbacks: audio functions return early if audioContext unavailable

**Error Display:**
- ErrorBoundary displays error stack in development
- User-friendly error UI with reload button
- Uses `AlertTriangle` icon from lucide-react for visual feedback

## Logging

**Framework:** `console` object (no logging library)

**Patterns:**
- `console.warn()` for non-critical issues (audio playback failures, DOM unavailable)
- `console.error()` for critical failures (asset loading, required DOM elements missing)
- No `console.log()` observed in production code (clean logs)
- Development logging added via Vite plugin (`vitePluginManusDebugCollector`) that captures:
  - Browser console logs → `.manus-logs/browserConsole.log`
  - Network requests → `.manus-logs/networkRequests.log`
  - Session replay events → `.manus-logs/sessionReplay.log`
- Log files auto-trimmed to 1MB, keeping newest entries

## Comments

**When to Comment:**
- Block comments (/* ... */) used for file headers describing purpose
- Inline comments used to explain "why" not "what" (code should be self-documenting)
- Comment headers precede complex systems (e.g., `useAudio.ts`, `vite.config.ts`)
- Section comments with dashes used to organize data definitions (e.g., `// ─── LESSON 1: ... ───`)

**JSDoc/TSDoc:**
- JSDoc comments (/** ... */) used for public functions and hooks
- Single-line JSDoc format for simple descriptions
- Multi-line JSDoc format for complex APIs with parameter descriptions
- Examples from codebase:
  ```typescript
  /**
   * Play a piano-like note using Web Audio API synthesis.
   * Uses a combination of sine + triangle oscillators with ADSR envelope
   * to approximate a warm piano tone without any sample files.
   */
  export function playNote(note: string, duration: number = 1.2, velocity: number = 0.8): void
  ```

## Function Design

**Size:**
- Most functions keep to single responsibility
- Largest file (Lesson.tsx at 2884 lines) is a page component with collocated data and logic
- Utility functions average 10-50 lines
- Hooks average 20-80 lines with some complex hooks exceeding 100 lines

**Parameters:**
- Prefer simple types over complex destructuring in callbacks
- Use `Partial<T>` for optional configuration objects
- Props interfaces preferred over tuple parameters
- Default parameters used in some functions (e.g., `playNote(note, duration = 1.2, velocity = 0.8)`)

**Return Values:**
- Explicit return types required on all exported functions
- Void functions used for side effects (audio playback, event handlers)
- React hooks return typed objects with properties (e.g., `UseCompositionReturn<T>`)
- Components return JSX.Element implicitly

## Module Design

**Exports:**
- Named exports preferred over default exports
- Default exports used only for page components (React routing)
- Mix of named and default in some files (not consistent)
- Barrel exports not observed; imports are specific to modules

**React Patterns:**
- Functional components exclusively
- Hooks used for state and effects
- Context API used for theme management (ThemeContext.tsx)
- No Redux/Zustand observed - minimal state management philosophy
- Props passed as single `Props` interface vs. spreading common React props
- Children always typed as `React.ReactNode`

**File Co-location:**
- Lesson data co-located with step components in same page file (Dashboard.tsx)
- Constant definitions at top of component files
- UI primitives from shadcn/ui in `components/ui/` directory (not hand-edited)
- Custom components in `components/` root
- Pages in `pages/` directory
- Hooks organized in `hooks/` directory

## State Management

**Pattern:** Minimal state, React `useState` + `localStorage`

- localStorage keys used: `notely_student`, `notely_session`, `notely_progress`, `theme`
- State loaded on mount with `useEffect`
- No prop drilling observed; context used when needed
- Lesson progress persisted as JSON object in localStorage

## Async Handling

**Promises:**
- No explicit `.catch()` handlers observed
- Audio functions use try-catch instead of promise error handling
- No async/await in observed code except for server startup

**Component Effects:**
- useEffect dependency arrays properly specified
- useCallback used in some cases; usePersistFn preferred pattern (`usePersistFn` hook reduces cognitive load)
- No infinite loop patterns detected

## CSS & Styling

**Framework:** Tailwind CSS 4 + custom CSS variables

**Patterns:**
- `cn()` utility function used for class merging (tailwind-merge + clsx)
- Class merging examples: `cn("px-4 py-2", active && "bg-primary")`
- Inline styles used alongside Tailwind for dynamic values and colors
- CSS variables accessed via `style={{ color: "var(--sunny)" }}`
- Tailwind semantic colors mapped to Notely brand palette in `index.css`
- Custom animations defined with Framer Motion, not Tailwind animation utilities

## Interop Patterns

**Web Audio API:**
- Direct oscillator and gain node manipulation (no Tone.js or other audio library)
- audioContext persisted in module scope, initialized on first use
- Browser autoplay policy handled with `audioContext.resume()`

**localStorage:**
- Direct `JSON.parse()` / `JSON.stringify()` usage
- No abstraction layer - accessed directly from components
- Safe defaults with `||` operator (e.g., `JSON.parse(...) || {}`)

**External Libraries:**
- Framer Motion for animations (motion components)
- Wouter for routing (lightweight alternative to React Router)
- shadcn/ui + Radix UI primitives for component library
- Tailwind CSS for styling
- nanoid for ID generation (unused in observed code)

---

*Convention analysis: 2026-03-21*
