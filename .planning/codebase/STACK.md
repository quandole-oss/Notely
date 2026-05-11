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
- pnpm 10.4.1+sha512... - Only package manager supported (enforced via packageManager in package.json)
- Lockfile: `pnpm-lock.yaml` (present)

## Frameworks

**Core:**
- React 19.2.1 - Frontend UI library
- React DOM 19.2.1 - DOM rendering
- Express 4.21.2 - Minimal static server with SPA fallback routing

**Routing:**
- Wouter 3.3.5 - Lightweight client-side router
  - Routes defined in `client/src/App.tsx`
  - All pages route through Wouter to support SPA navigation
  - Patched version: Custom patch in `patches/wouter@3.7.1.patch` for custom behavior

**UI Components:**
- Radix UI primitives (v1.x) - 20+ headless component primitives
  - Full list: accordion, alert-dialog, aspect-ratio, avatar, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, toggle, toggle-group, tooltip
  - Location: `client/src/components/ui/` - Do not hand-edit; use shadcn/ui CLI to update
- shadcn/ui - Pre-built Tailwind-styled component library based on Radix UI (50+ components)

**Animation:**
- Framer Motion 12.23.22 - React motion library for animations and transitions

**Styling:**
- Tailwind CSS 4.1.14 - Utility-first CSS framework
  - Config via Vite (no tailwind.config.js file)
  - @tailwindcss/vite 4.1.3 - Vite plugin for Tailwind
  - @tailwindcss/typography 0.5.15 - Typography plugin
  - tailwindcss-animate 1.0.7 - Animation utilities
- PostCSS 8.4.47 - CSS transformation
- Autoprefixer 10.4.20 - Vendor prefix injection

**Build Tools:**
- Vite 7.1.7 - Frontend bundler and dev server (port 3000)
  - @vitejs/plugin-react 5.0.4 - React JSX plugin
  - @builder.io/vite-plugin-jsx-loc 0.1.1 - JSX location tracking
  - vite-plugin-manus-runtime 0.0.57 - Custom debug runtime
  - tw-animate-css 1.4.0 - CSS animation utilities
- esbuild 0.25.0 - Server bundle compilation (ESM, single file)

**Form & Validation:**
- React Hook Form 7.64.0 - Form state management
- @hookform/resolvers 5.2.2 - Validation schema resolvers
- Zod 4.1.12 - TypeScript-first schema validation and type inference
- input-otp 1.4.2 - OTP input field component

**UI & Layout Components:**
- lucide-react 0.453.0 - Icon library (450+ icons)
- Embla Carousel 8.6.0 - Carousel/slider component
- recharts 2.15.2 - React chart library
- sonner 2.0.7 - Toast notification library
- react-day-picker 9.11.1 - Date picker component
- react-resizable-panels 3.0.6 - Resizable panel layouts
- vaul 1.1.2 - Drawer/sheet component (headless)

**CSS Utilities:**
- clsx 2.1.1 - Conditional className utility
- class-variance-authority 0.7.1 - Component variant pattern for Tailwind
- tailwind-merge 3.3.1 - Intelligent Tailwind class merging

**Theming:**
- next-themes 0.4.6 - Theme provider for light/dark mode support

**Utilities:**
- nanoid 5.1.5 - Unique ID generation
- axios 1.12.0 - HTTP client (dependency present but not actively used in current frontend-only implementation)
- streamdown 1.4.0 - Stream processing utility

## Configuration

**Environment:**
- Environment variables loaded from project root (via `envDir` in Vite config)
- Variables prefixed with `VITE_` are available in browser at build time
- Key env vars referenced in code:
  - `VITE_OAUTH_PORTAL_URL` - OAuth portal URL (from `client/src/const.ts`)
  - `VITE_APP_ID` - App ID for OAuth flow (from `client/src/const.ts`)
  - `VITE_FRONTEND_FORGE_API_KEY` - API key for Forge Maps proxy (from `client/src/components/Map.tsx`)
  - `VITE_FRONTEND_FORGE_API_URL` - Forge API base URL, defaults to `https://forge.butterfly-effect.dev`
  - `NODE_ENV` - Set to "production" for release builds
  - `PORT` - Server port (default 3000)

**Build:**
- TypeScript configuration: `tsconfig.json`
  - `strict: true` - All strict type checking enabled
  - `jsx: preserve` - Let Vite/React handle JSX
  - `moduleResolution: bundler` - Modern module resolution
  - Incremental compilation enabled
- Vite configuration: `vite.config.ts`
  - Dev server: port 3000, finds next available if busy
  - Client root: `client/`
  - Build output: `dist/public/` (Vite client) + `dist/index.js` (esbuild server)
  - Allowed hosts: manuspre.computer, manus.computer, manus-asia.computer, manuscomputer.ai, manusvm.computer, localhost, 127.0.0.1
- Prettier formatter: 3.6.2 (default config, no custom .prettierrc)

**Path Aliases:**
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

**Package Manager:**
- `type: "module"` in package.json - ES modules enabled
- Patched dependencies:
  - `wouter@3.7.1` - Custom patch in `patches/wouter@3.7.1.patch`
- Overrides:
  - `tailwindcss>nanoid@3.3.7` - Force specific nanoid version

## Scripts

**Development:**
- `pnpm dev` - Start Vite dev server with host binding
- `pnpm check` - TypeScript type-check only (`tsc --noEmit`)
- `pnpm preview` - Preview production build locally

**Production:**
- `pnpm build` - Build Vite client + esbuild server → `dist/`
- `pnpm start` - Run production server from `dist/index.js` (requires NODE_ENV=production)

**Utilities:**
- `pnpm format` - Run Prettier on entire codebase

## Platform Requirements

**Development:**
- Node.js 24.x or compatible (based on @types/node 24.7.0)
- pnpm 10.4.1+
- macOS/Linux/Windows

**Production:**
- Node.js 24.x runtime
- ES2025 JavaScript (no transpilation for legacy browsers)
- Web Audio API support (for synthesized audio)
- localStorage support (for persistent state)
- Built artifacts:
  - Client: `dist/public/` (Vite bundled React app)
  - Server: `dist/index.js` (ESM bundle, single file)
- Start: `pnpm start` or `NODE_ENV=production node dist/index.js`
- Port: 3000 (configurable via PORT env var)

## Design System (Sunny Studio)

Located in `client/src/index.css`:

**Brand Colors (CSS variables):**
- `--sunny` - Sunflower yellow (#FFB800)
- `--coral` - Coral red (#FF5C35)
- `--sky` - Sky blue (#4AABF5)
- `--mint` - Mint green (#3ECFA4)
- `--charcoal` - Deep charcoal (#1A1A2E)
- `--cream` - Warm off-white (#FEFAF3)

**Typography:**
- Headings: Baloo 2 (700-800 weight)
- Body/UI: DM Sans

**Motion:**
- Spring easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- Durations: 300-500ms

**Radius:**
- Base: 1rem (16px)

---

*Stack analysis: 2026-03-21*
