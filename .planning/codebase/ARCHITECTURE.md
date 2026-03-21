# Architecture

**Analysis Date:** 2026-03-21

## Pattern Overview

**Overall:** Client-first SPA with minimal backend

Notely is a frontend-heavy React application with a thin Express static server. The architecture is **presentation-driven** — lesson data, achievements, and progress are hard-coded in page components and persisted to `localStorage`. No backend API currently exists; all lesson logic, audio synthesis, and state management happen client-side.

**Key Characteristics:**
- Single-page application (Wouter router, client-side navigation)
- Web Audio API synthesis for all audio (no external audio libraries)
- localStorage for persistent student profile and lesson progress
- Design system-first (Sunny Studio colors and animations in CSS)
- Page components own their data definitions (lessons, achievements, skills)
- Heavy use of React hooks for local state management

## Layers

**Presentation Layer:**
- Purpose: Child-friendly UI components and page layouts
- Location: `client/src/pages/`, `client/src/components/`
- Contains: React page components (Lesson, Dashboard, Practice, Progress, SkillTree, Onboarding), UI components from shadcn/ui (50+ in `client/src/components/ui/`)
- Depends on: Hooks (useAudio, useLocation, useRoute), design system (index.css)
- Used by: App router, user interactions

**Routing Layer:**
- Purpose: Client-side navigation and page matching
- Location: `client/src/App.tsx`, `client/src/components/BottomNav.tsx`
- Contains: Wouter router with 6 main routes, conditional bottom nav rendering
- Depends on: Wouter library (custom patched in `patches/wouter@3.7.1.patch`)
- Used by: All pages and navigation

**Audio/Synthesis Layer:**
- Purpose: Web Audio API piano synthesis without external audio files
- Location: `client/src/hooks/useAudio.ts`
- Contains: Note frequency maps (C3–B5), ADSR envelope control, oscillator synthesis, percussion sounds
- Depends on: Web Audio API (browser native)
- Used by: Lesson, Practice, and other interactive pages

**State Management Layer:**
- Purpose: Persistent and ephemeral state using React hooks + localStorage
- Location: `client/src/` (distributed across page components)
- Contains: `useState` for UI state, localStorage keys: `notely_student` (profile), `notely_progress` (lesson completion), `notely_bestMoments` (recordings)
- Depends on: React hooks, browser localStorage API
- Used by: All pages for reading/writing student progress

**Design System Layer:**
- Purpose: Color tokens, typography, animation easing, responsive utilities
- Location: `client/src/index.css` (CSS custom properties), `tailwind.config.ts`
- Contains: Sunny Studio palette (--sunny, --coral, --sky, --mint, --charcoal, --cream), Baloo 2 (headings), DM Sans (body)
- Depends on: Tailwind CSS 4, CSS custom properties
- Used by: All UI components via className props

**Data Layer:**
- Purpose: Lesson definitions and static educational content
- Location: `client/src/data/lessons.ts`, page component top-level constants
- Contains: LessonStep[], ReflectionPrompt[], lesson metadata (LESSONS, LESSONS_DEF, ACHIEVEMENTS, SKILLS)
- Depends on: TypeScript interfaces (LessonStep, LessonData)
- Used by: Lesson, Dashboard, Progress pages

**Server Layer:**
- Purpose: Static file serving with SPA fallback
- Location: `server/index.ts`
- Contains: Express app, static middleware, catch-all route to serve index.html
- Depends on: Express, Node.js fs/path APIs
- Used by: Production deployment only

## Data Flow

**Lesson Play Flow (Example: Lesson Page):**

1. User navigates to `/lesson/5` (Rhythm & Beat)
2. `Lesson.tsx` reads URL params via `useRoute("/lesson/:id")`
3. Looks up `lessonId` in `LESSONS` from `data/lessons.ts` → gets LessonData with steps array
4. Component state tracks `currentStep` (0–n), quiz answers, note sequences, etc.
5. As user completes steps (plays notes, answers quiz), component calls `useAudio().playNote()` for audio feedback
6. On lesson completion, component writes to `localStorage.notely_progress[lessonId] = {completed: true, stars: n}`
7. SkillTree page polls localStorage via `useEffect` → updates unlocked nodes in real-time
8. Bottom nav link shows current lesson as "current" badge in Dashboard

**Progress Tracking:**

```
User Action
    ↓
Page State Update (useState)
    ↓
localStorage.setItem("notely_progress", ...)
    ↓
SkillTree listens via storage event → re-renders
Dashboard reads on mount → shows updated lesson list
```

**State Management:**
- Ephemeral: Component-local `useState` (currentStep, showFeedback, activeKey)
- Persistent: localStorage with keys `notely_student`, `notely_progress`, `notely_bestMoments`
- No Redux/Zustand — state is scattered across page components
- Best moments (audio recordings) stored as Base64 blobs in localStorage

## Key Abstractions

**LessonStep Type:**
- Purpose: Describes a single interactive lesson segment (watch, listen, play, quiz, explore)
- Examples: `client/src/data/lessons.ts` lines 7–49
- Pattern: Union of optional fields based on step type (watch has `content`, listen has `previewNotes`, play has `sequence`, rhythm has `drumPads` + `rhythmPatterns`)
- Flexible but difficult to type-check exhaustively

**useAudio Hook:**
- Purpose: Provides playback functions (playNote, playSuccessChime, playErrorSound, playCelebration, playDrumTap, playInstrumentNote)
- Examples: `client/src/hooks/useAudio.ts` (150+ lines)
- Pattern: Singleton AudioContext, returns object with named methods, handles note frequency lookup and ADSR envelope synthesis

**Page Components as Data Owners:**
- Purpose: Each page owns its static content (lessons, achievements, skill nodes)
- Examples: `LESSONS_DEF` in Dashboard.tsx (lines 19–30), `ACHIEVEMENTS` in Progress.tsx (lines 12–21), `SKILL_NODES` in SkillTree.tsx (lines 24–38)
- Pattern: Extractable constants that should move to a database when backend API is added

## Entry Points

**Browser Entry:**
- Location: `client/src/main.tsx`
- Triggers: HTML load → ReactDOM.createRoot
- Responsibilities: Mount React App to #root

**App Router:**
- Location: `client/src/App.tsx`
- Triggers: Every route change
- Responsibilities: Render route-matched page component, wrap in providers (ThemeProvider, TooltipProvider, ErrorBoundary), conditionally render BottomNav

**Page Entry Points:**
- Onboarding (`/`): 3-step profile wizard, saves to `notely_student` localStorage
- Dashboard (`/dashboard`): Home page, lesson list, mood check modal, session recap
- Lesson (`/lesson/:id`): Main learning experience, reads step definitions, manages play/quiz states
- Practice (`/practice`): Free-play piano, rhythm tapper, song player
- Progress (`/progress`): Achievement badges, skill level display, weekly practice chart
- SkillTree (`/skill-tree`): Musical note visualization, progressive unlock tracking

**Server Entry:**
- Location: `server/index.ts`
- Triggers: `npm start` or production deployment
- Responsibilities: Listen on port (default 3000), serve static files from `dist/public/`, catch-all route to index.html for SPA

## Error Handling

**Strategy:** Component-level error boundary wraps entire app, unhandled errors logged to console

**Patterns:**
- Try-catch in audio synthesis (`useAudio.ts` playNote function)
- Fallback in data lookups: `const lessonData = LESSONS[lessonId] ?? LESSONS["1"]` (Lesson.tsx line 38)
- No global error state — errors are either gracefully handled (e.g., invalid note defaults to C4) or allowed to propagate to ErrorBoundary
- ErrorBoundary component (`client/src/components/ErrorBoundary.tsx`) catches React render errors

## Cross-Cutting Concerns

**Logging:** No structured logging framework. Uses `console.log` sparingly in development. Manus runtime plugin captures logs to `.manus-logs/browserConsole.log` for debugging.

**Validation:** TypeScript strict mode enforces types at compile time. Zod schema in dependencies but not actively used. Lesson step structures validate via TypeScript interfaces.

**Authentication:** None. Single-student app — profile stored in localStorage as `notely_student` (name, avatar, instrument).

**Accessibility:** Keyboard support for piano keys (A=C, S=D, D=E, F=F, G=G, H=A, J=B). Radix UI primitives provide semantic HTML. Large touch targets (>44px) for child usability. No ARIA labels or focus management yet.

**Performance:** Vite build outputs to `dist/public/` for static serving. Tailwind CSS compiled inline (no external CSS file). Web Audio AudioContext is singleton (lazy-loaded on first playback). No code splitting or lazy routes.

**Observability:** Only Manus debug plugin. No analytics, error tracking, or monitoring in production. localStorage mutations are not tracked.

---

*Architecture analysis: 2026-03-21*
