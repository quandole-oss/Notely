# Technology Stack

**Analysis Date:** 2026-03-21

## Languages

**Primary:**
- TypeScript 5.6.3 - Frontend and backend code (strict mode enabled)
- JavaScript (ES2025) - Generated output from TypeScript transpilation

**Secondary:**
- CSS 4 - Styling via Tailwind CSS 4.1.14

## Runtime

**Environment:**
- Node.js 24.x (current LTS)

**Package Manager:**
- pnpm 10.4.1+sha512...
- Lockfile: `pnpm-lock.yaml` (present)

## Frameworks

**Core:**
- React 19.2.1 - Frontend UI library
- Express 4.21.2 - Minimal static server (SPA fallback)

**Routing:**
- Wouter 3.3.5 - Lightweight client-side routing (with custom patch in `patches/wouter@3.7.1.patch`)

**UI Components:**
- Radix UI primitives (v1.x) - 20+ headless component primitives
  - Includes: Dialog, Popover, Select, Tooltip, Progress, Slider, Tabs, Accordion, Alert Dialog, and more
- shadcn/ui components - Pre-built component library built on Radix UI (50+ components in `client/src/components/ui/`)

**Animation:**
- Framer Motion 12.23.22 - React animations and transitions

**Styling:**
- Tailwind CSS 4.1.14 - Utility-first CSS framework
- @tailwindcss/vite 4.1.3 - Vite integration
- @tailwindcss/typography 0.5.15 - Typography plugin
- tailwindcss-animate 1.0.7 - Animation utilities

**Build Tools:**
- Vite 7.1.7 - Frontend bundler and dev server
  - @vitejs/plugin-react 5.0.4 - React JSX plugin
  - @builder.io/vite-plugin-jsx-loc 0.1.1 - JSX location tracking
  - vite-plugin-manus-runtime 0.0.57 - Custom Manus debug runtime plugin
- esbuild 0.25.0 - Server bundle compilation (ESM format)

**Form & Validation:**
- React Hook Form 7.64.0 - Form state management
- @hookform/resolvers 5.2.2 - Validation schema resolvers
- Zod 4.1.12 - TypeScript-first schema validation
- input-otp 1.4.2 - OTP input component

**Utilities:**
- Axios 1.12.0 - HTTP client (dependency present but not actively used in current frontend)
- React DOM 19.2.1 - React rendering
- nanoid 5.1.5 - Unique ID generation
- clsx 2.1.1 - Conditional className utility
- class-variance-authority 0.7.1 - CSS class variance helper
- tailwind-merge 3.3.1 - Tailwind class conflict resolution

**UI Libraries:**
- lucide-react 0.453.0 - Icon library
- Embla Carousel 8.6.0 - Carousel/slider component
- recharts 2.15.2 - Charts library
- sonner 2.0.7 - Toast notifications
- react-day-picker 9.11.1 - Date picker
- react-resizable-panels 3.0.6 - Resizable panels
- vaul 1.1.2 - Drawer/sheet component

**Theming:**
- next-themes 0.4.6 - Theme provider (for light/dark mode support)

**Other:**
- streamdown 1.4.0 - Stream processing utility

## Configuration

**Environment:**
- Environment variables loaded from project root (via `envDir` in Vite config)
- No `.env` file present; defaults are hardcoded or inferred from runtime
- `COOKIE_NAME = "app_session_id"` defined in `shared/const.ts` (not currently used)

**Build:**
- TypeScript configuration: `tsconfig.json` (strict mode)
- Vite configuration: `vite.config.ts`
- Prettier formatter: 3.6.2 (no custom config file; uses defaults)

**Path Aliases:**
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets` → `attached_assets/`

## Platform Requirements

**Development:**
- Node.js 24.x or compatible
- pnpm 10.4.1 or compatible
- TypeScript type checking: `pnpm check` (tsc --noEmit)
- Development server: `pnpm dev` (Vite on port 3000)
- Formatting: `pnpm format` (Prettier)

**Production:**
- Node.js 24.x runtime
- Built artifacts:
  - Client: `dist/public/` (Vite bundle)
  - Server: `dist/index.js` (esbuild ESM bundle)
- Start: `pnpm start` (Express server, port 3000 by default)

**Browser Support:**
- ES2025 JavaScript (no transpilation for older browsers)
- Web Audio API for synthesis (modern browsers)
- DOM APIs for localStorage and basic interactivity

---

*Stack analysis: 2026-03-21*
