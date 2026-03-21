# Codebase Structure

**Analysis Date:** 2026-03-21

## Directory Layout

```
notely/
├── client/                       # React frontend (Vite root)
│   ├── src/
│   │   ├── pages/               # Route pages (6 main routes)
│   │   ├── components/          # Feature components + shadcn/ui library (50+)
│   │   ├── hooks/               # Custom hooks (useAudio, useComposition, etc.)
│   │   ├── contexts/            # React context providers (ThemeContext)
│   │   ├── data/                # Static lesson & content definitions
│   │   ├── lib/                 # Utilities (cn utility from shadcn)
│   │   ├── const.ts             # Client constants
│   │   ├── index.css            # Design system (Sunny Studio)
│   │   ├── App.tsx              # Router + layout wrapper
│   │   └── main.tsx             # React DOM entry point
│   └── public/                  # Static assets (favicon, __manus__ debug assets)
├── server/                       # Express static server
│   └── index.ts                 # Production server (SPA fallback)
├── shared/                       # Shared code (minimal)
│   └── const.ts                 # Session cookie constant
├── patches/                      # Patch files for dependencies
│   └── wouter@3.7.1.patch       # Custom Wouter router patch
├── dist/                         # Build output
│   └── public/                  # Static files (Vite output)
├── .planning/codebase/          # This codebase documentation
├── vite.config.ts               # Vite + esbuild + debug collector config
├── tsconfig.json                # TypeScript config (strict mode)
├── package.json                 # pnpm dependencies
└── CLAUDE.md                     # Developer instructions
```

## Directory Purposes

**client/src/pages/:**
- Purpose: Route-matched page components (one per main route)
- Contains: `Dashboard.tsx`, `Lesson.tsx`, `Practice.tsx`, `Progress.tsx`, `SkillTree.tsx`, `Onboarding.tsx`, `Home.tsx`, `NotFound.tsx`
- Key files:
  - `Lesson.tsx` — Main learning experience, 800+ lines, handles 5 lesson types (watch, listen, play, quiz, rhythm, tempo, dynamics, patterns, capstone)
  - `Dashboard.tsx` — Home page with lesson list, achievements, mood check, session recap
  - `Practice.tsx` — Free-play piano, rhythm game, song player
  - `SkillTree.tsx` — Visual learning map (musical note shape), progressive unlock tracking
  - `Progress.tsx` — Achievement badges, skill levels, weekly practice chart
  - `Onboarding.tsx` — 3-step profile creation wizard

**client/src/components/:**
- Purpose: Reusable feature components and shadcn/ui library
- Contains: 50+ shadcn/ui primitive components (`ui/`) + feature components (BestMomentsWall.tsx, BottomNav.tsx, MoodCheck.tsx, SessionRecap.tsx, ErrorBoundary.tsx, ManusDialog.tsx, Map.tsx)
- Key files:
  - `ui/` — Radix UI primitives (button, dialog, slider, tabs, etc.) — do not hand-edit, use shadcn CLI
  - `BottomNav.tsx` — Fixed footer nav (conditionally rendered), 5 main destinations
  - `ErrorBoundary.tsx` — React error boundary for crash recovery
  - `MoodCheck.tsx` — Modal for emotional state (energetic, calm, tired)
  - `SessionRecap.tsx` — Post-lesson summary banner with notes played

**client/src/hooks/:**
- Purpose: Custom React hooks
- Contains:
  - `useAudio.ts` — Web Audio API synthesis (playNote, playSuccessChime, playDrumTap, playCelebration, playInstrumentNote)
  - `useComposition.ts` — Composition builder for capstone lesson
  - `useMobile.tsx` — Detect mobile viewport
  - `usePersistFn.ts` — Memoize callback via useCallback wrapper

**client/src/contexts/:**
- Purpose: React context providers for app-wide state
- Contains: `ThemeContext.tsx` (light/dark theme, currently light-only)

**client/src/data/:**
- Purpose: Static lesson and content definitions
- Contains: `lessons.ts` — All 10 lesson definitions (LESSONS object keyed by ID), TypeScript interfaces for LessonStep, LessonData

**client/src/lib/:**
- Purpose: Utility functions
- Contains: `utils.ts` — shadcn classname utility (cn function)

**server/:**
- Purpose: Production Express server
- Contains: `index.ts` — Static file serving with SPA fallback route

**shared/:**
- Purpose: Code shared between client and server
- Contains: `const.ts` — Session cookie constant (COOKIE_NAME, ONE_YEAR_MS)

**patches/:**
- Purpose: Monkeypatch for external dependencies
- Contains: `wouter@3.7.1.patch` — Custom Wouter router patch (reason unclear from reading, but needed for this codebase)

## Key File Locations

**Entry Points:**
- `client/src/main.tsx` — Browser entry, mounts React to #root
- `client/src/App.tsx` — Router and app layout, wraps pages in providers
- `server/index.ts` — Production server entry, listens on port 3000

**Configuration:**
- `vite.config.ts` — Vite dev server + build + custom Manus debug logger plugin
- `tsconfig.json` — TypeScript strict mode
- `package.json` — pnpm workspace, scripts (dev, build, start)
- `CLAUDE.md` — Developer instructions for AI

**Core Logic:**
- `client/src/hooks/useAudio.ts` — Web Audio synthesis engine (150+ lines)
- `client/src/data/lessons.ts` — All lesson step definitions (1000+ lines)
- `client/src/pages/Lesson.tsx` — Main lesson player (800+ lines)
- `client/src/index.css` — Sunny Studio design system with CSS custom properties

**Design System:**
- `client/src/index.css` — Color tokens (--sunny, --coral, --sky, --mint, --charcoal, --cream), Baloo 2 + DM Sans fonts, animation easing

**State Persistence:**
- localStorage keys: `notely_student`, `notely_progress`, `notely_bestMoments`, `notely_mood`

## Naming Conventions

**Files:**
- Page components: PascalCase, one per route (`Dashboard.tsx`, `Lesson.tsx`)
- Feature components: PascalCase (`BottomNav.tsx`, `MoodCheck.tsx`)
- Hooks: camelCase with `use` prefix (`useAudio.ts`, `useComposition.ts`)
- Data files: lowercase plural or descriptive (`lessons.ts`, `const.ts`)
- shadcn/ui components: kebab-case (`button.tsx`, `dialog.tsx`, `slider.tsx`)

**Directories:**
- Feature-grouped: `pages/`, `components/`, `hooks/`, `contexts/`, `data/`, `lib/`
- Lowercase: `ui/` subdirectory for Radix primitives

**TypeScript/Variables:**
- Interfaces: PascalCase (`LessonStep`, `ThemeContextType`, `SkillNode`)
- Constants: UPPER_SNAKE_CASE (`KEY_TO_NOTE`, `SKILL_NODES`, `ACHIEVEMENTS`)
- Functions: camelCase (`playNote()`, `getFrequency()`, `getLessons()`)
- Component props: camelCase (`defaultTheme`, `switchable`)

## Where to Add New Code

**New Feature (e.g., new lesson or game mode):**
- Primary code: `client/src/pages/` (if page-level) or `client/src/components/` (if reusable)
- Data: Add to `client/src/data/lessons.ts` or component-level constant
- Tests: Not yet configured (see CLAUDE.md — "There are no tests configured")

**New Component/Module:**
- Implementation: `client/src/components/MyComponent.tsx` (feature) or use shadcn CLI for Radix primitives
- Hook dependencies: Create in `client/src/hooks/useMyHook.ts` if stateful
- Import path: Use `@/*` alias (resolves to `client/src/`)

**Utilities:**
- Shared helpers: `client/src/lib/utils.ts`
- Design utilities: Add custom utilities to `client/src/index.css` (CSS custom property or Tailwind layer)

**Audio Synthesis:**
- Extend `useAudio.ts` — add new playback functions alongside existing playNote, playSuccessChime, etc.
- Example: `playInstrumentNote(note, instrument)` for Lesson 1

**Design Changes:**
- Color changes: Edit CSS custom properties in `client/src/index.css` (lines 50–81 `:root`)
- Font changes: Update `@layer base` in `client/src/index.css`
- Animation changes: Add to Tailwind config or use `@apply` with existing animation utilities

## Special Directories

**client/public/__manus__:**
- Purpose: Manus debug assets (development only)
- Generated: Yes (by Vite plugin)
- Committed: No

**dist/:**
- Purpose: Build output
- Generated: Yes (pnpm build)
- Committed: No

**.planning/codebase/:**
- Purpose: GSD codebase documentation (this directory)
- Generated: By /gsd:map-codebase
- Committed: Yes

**.manus-logs/:**
- Purpose: Debug logs from development (browserConsole.log, networkRequests.log, sessionReplay.log)
- Generated: Yes (by Vite plugin)
- Committed: No

**patches/:**
- Purpose: Applied patches for external dependencies
- Generated: No (manually maintained)
- Committed: Yes

## Build and Output Structure

**Vite Build (Tailwind + React):**
```bash
pnpm build
# Outputs:
# - dist/public/index.html
# - dist/public/assets/*.js (React bundles)
# - dist/public/assets/*.css (Tailwind compiled)
# - dist/public/assets/*.png (images, if any)
```

**esbuild Server:**
```bash
# Same build command also runs:
esbuild server/index.ts --platform=node --bundle --outdir=dist
# Outputs:
# - dist/index.js (production server)
```

**Production Start:**
```bash
NODE_ENV=production node dist/index.js
# Serves static files from dist/public/ with SPA fallback
```

---

*Structure analysis: 2026-03-21*
