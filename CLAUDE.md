# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev              # Start Vite dev server (port 3000)
pnpm build            # Build client (Vite) + server (esbuild) → dist/
pnpm start            # Run production server
pnpm check            # TypeScript type-check (no emit)
pnpm format           # Prettier formatting
```

Package manager is **pnpm** (not npm/yarn). There are no tests configured.

## Architecture

**Notely** is a child-focused music EdTech app (ages 6-12) with a React frontend and a minimal Express static server. Currently frontend-only — lesson data is hard-coded in page components, no backend API.

### Tech Stack

- React 19 + TypeScript (strict) + Tailwind CSS 4 + Vite 7
- Wouter for routing (lightweight, with a custom patch in `patches/`)
- Radix UI primitives + shadcn/ui component library (50+ components in `client/src/components/ui/`)
- Framer Motion for animations
- Web Audio API for sound synthesis (no external audio libraries)

### Project Layout

- `client/src/pages/` — Route pages: Onboarding, Dashboard, Lesson, Practice, Progress, SkillTree
- `client/src/hooks/useAudio.ts` — Piano synthesis engine (ADSR envelope, harmonics, percussion) using Web Audio API
- `client/src/index.css` — Design system ("Sunny Studio") with custom CSS variables and Tailwind utilities
- `client/src/components/ui/` — shadcn/ui components (do not hand-edit; use shadcn CLI to update)
- `server/index.ts` — Express server serving static files with SPA fallback
- `shared/const.ts` — Constants shared between client and server

### Path Aliases

- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`

### Routing

Routes defined in `client/src/App.tsx` using Wouter:
- `/` → Onboarding (3-step wizard)
- `/dashboard` → Main dashboard
- `/lesson/:id` → Lesson player (watch → listen → play → quiz flow)
- `/practice` → Piano + rhythm + songs
- `/progress` → Achievements and stats
- `/skill-tree` → Visual learning path

Bottom nav is conditionally rendered based on `PAGES_WITH_NAV` in App.tsx.

### Design System (Sunny Studio)

Bauhaus-inspired, child-friendly design defined in `client/src/index.css`:
- Brand colors: `--sunny` (yellow), `--coral` (red), `--sky` (blue), `--mint` (green), `--charcoal` (text), `--cream` (background)
- Fonts: Baloo 2 (headings, 700-800 weight), DM Sans (body/UI)
- Animation: springy easing `cubic-bezier(0.34, 1.56, 0.64, 1)`, 300-500ms durations

### Audio System

`useAudio()` hook provides: `playNote()`, `playSuccessChime()`, `playErrorSound()`, `playCelebration()`, `playDrumTap()`. All synthesis is built on Web Audio API oscillators with no external dependencies.

### Keyboard Support

Piano keys mapped: A=C, S=D, D=E, F=F, G=G, H=A, J=B. Active in both Practice Room and Lesson Player.

### State Management

Minimal: React `useState` + `localStorage` (student profile stored as `notely_student`). No Redux/Zustand.

### Data Pattern

Lesson steps, songs, achievements, and skill nodes are defined as typed arrays at the top of their respective page components. These are ready to be extracted to a database when a backend API is added.
