# External Integrations

**Analysis Date:** 2026-03-21

## APIs & External Services

**Google Maps (Optional):**
- Type: Maps and geocoding service
- SDK: `@types/google.maps` 3.58.1 (TypeScript types only)
- Status: Declared in package.json but not actively integrated in current build
- Documentation: Available in `client/src/components/Map.tsx` showing potential usage patterns for Places, Markers, and Geocoding APIs

**No Other External APIs:**
- No Stripe, Supabase, Firebase, or third-party service integrations detected
- No API calls to backend endpoints (frontend is standalone)

## Data Storage

**Databases:**
- None configured. Data persistence is not implemented.

**Client-Side Storage:**
- localStorage only - Browser local storage for persistent state
  - `notely_student` - Student profile data
  - `notely_session` - Session/mood check data
  - `notely_best_moments` - Favorites/achievements
  - `notely_progress` - Lesson completion and star ratings
  - `theme` - UI theme preference (light/dark)

**File Storage:**
- Not applicable. No file uploads or storage service integrated.

**Caching:**
- Not applicable. No caching layer (Redis, Memcached, etc.) configured.

## Authentication & Identity

**Auth Provider:**
- None configured. No authentication system implemented.

**User Management:**
- Frontend-only approach: Student profile stored in localStorage (`notely_student`)
- No user sessions, JWT tokens, or server-side authentication
- No role-based access control
- Public access to all routes

## Monitoring & Observability

**Error Tracking:**
- None detected. No Sentry, LogRocket, or error tracking service.

**Logs:**
- Browser console output only
- Development: Manus debug collector (custom Vite plugin) captures browser logs to `.manus-logs/` directory:
  - `browserConsole.log` - Console output
  - `networkRequests.log` - Network traffic
  - `sessionReplay.log` - Session events
- Logs written to disk via POST to `/__manus__/logs` endpoint (development only)

**Application Monitoring:**
- Not detected. No performance monitoring or analytics integration.

## CI/CD & Deployment

**Hosting:**
- Express static server (self-hosted)
- No cloud platform integration (AWS, Vercel, Netlify, etc.)

**Build Process:**
- Vite builds client to `dist/public/`
- esbuild bundles server to `dist/index.js`
- Single command: `pnpm build`

**CI Pipeline:**
- None detected. No GitHub Actions, CircleCI, or other CI service configured.

## Environment Configuration

**Required env vars:**
- Not used in current build. Code contains no references to `process.env` variables except `NODE_ENV` for conditional logic.

**Optional env vars:**
- `NODE_ENV` - Set to "production" for release builds (defaults to development)
- `PORT` - Server port (defaults to 3000)

**Secrets location:**
- No secrets management. No `.env` file or secrets vault integration.
- `COOKIE_NAME` and timing constants defined in `shared/const.ts` (not secrets)

## Webhooks & Callbacks

**Incoming:**
- Development debug endpoint: `POST /__manus__/logs` (Manus debug collector only, development mode)
- No production webhooks

**Outgoing:**
- None detected. No external service callbacks or webhooks.

## Patched Dependencies

**Wouter Router:**
- `wouter@3.7.1` - Custom patch applied via pnpm
- Patch file: `patches/wouter@3.7.1.patch`
- Purpose: Custom modification to router behavior (patch details in file)

## Dependency Overrides

**pnpm Overrides:**
- `tailwindcss>nanoid: 3.3.7` - Force specific version of nanoid used by Tailwind

---

*Integration audit: 2026-03-21*
