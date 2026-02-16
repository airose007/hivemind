# 🔬 HiveMind Infrastructure Research Report

**Last Updated:** 2026-02-16 (Session 2)  
**Agent:** Infrastructure Research Agent (Pam subagent)  
**Server:** 69.67.173.156 (Bucharest)  
**Domain:** scottai.duckdns.org

---

## Session 2 Summary (2026-02-16)

### Server State
- **CPU:** 4 cores, 91% idle (healthy)
- **RAM:** 7.8GB total, 5.8GB available
- **Swap:** 2GB configured (NEW - was 0)
- **Disk:** 15GB / 145GB (11%)
- **Uptime:** Stable, Next.js 16.1.6 on port 3000 (localhost only)
- **Response times:** All pages <20ms

### Changes Made This Session

#### Security Improvements
- ✅ **Login brute force protection** — In-memory rate limiter (5 attempts/15min) with IP tracking
- ✅ **Session hardening** — Changed sameSite from `lax` → `strict`, maxAge from 7 days → 24 hours
- ✅ **Zod validation** — Added input validation schemas for agents, tasks, departments, and login endpoints
- ✅ **robots.txt** — Added `app/robots.ts` to block all search engine crawling of private dashboard
- ✅ **Caddy -Server header** — Removed server identification header

#### Next.js 16 Improvements
- ✅ **middleware.ts → proxy.ts migration** — Fixed Next.js 16 deprecation warning
- ✅ **next.config.mjs** — Added `reactStrictMode: true`, `poweredByHeader: false`, security headers
- ✅ **Error boundaries** — Added `error.tsx`, `loading.tsx` (dashboard), `global-error.tsx`
- ✅ **Custom 404 page** — Added `app/not-found.tsx`
- ✅ **Page metadata** — Added unique `<title>` to all 6 dashboard pages

#### Dependency Updates
- ✅ **bcryptjs** 2.4.3 → 3.0.3 (ESM module, built-in types, 2b hashes by default)
- ✅ **@types/react** 18.3.28 → 19.2.14 (matches React 19)
- ✅ **@types/react-dom** 18.3.7 → 19.2.3 (matches React 19)
- ✅ **Removed @types/bcryptjs** (v3 ships its own TypeScript types)

#### Infrastructure
- ✅ **2GB swap space** — Created `/swapfile`, persistent via fstab, swappiness=10
- ✅ **PM2 cleanup** — Removed duplicate stopped process (id 0), cleaned old error logs
- ✅ **PM2 ecosystem.config.js** — Created with memory limits (512MB restart threshold)
- ✅ **PM2 startup** — Configured systemd auto-start on boot (`pm2-openclaw.service`)
- ✅ **PM2 log rotation** — Installed pm2-logrotate (10MB max, 7 files, compressed)
- ✅ **Caddy access logging** — JSON format to `/var/log/caddy/access.log` with file rotation
- ✅ **Database backups** — Daily cron at 2am, 30-day retention, tested successfully
- ✅ **Prisma connection pool** — Added `connection_limit=5&pool_timeout=20` to DATABASE_URL

#### Monitoring
- ✅ **Health check endpoint** — `/api/ping` (unauthenticated) returns DB status, uptime, timestamp
- ✅ **CI/CD template** — Created `.github/workflows/deploy.yml` (local only, needs workflow scope token)

#### Accessibility
- ✅ **Login form** — Added `autocomplete` and `aria-required` attributes
- ✅ **Focus styles** — Verified Tailwind focus utilities on all interactive elements

---

## Previous Session (2026-02-16, Session 1)

### Critical Issues Fixed
- ✅ Next.js upgraded 14.1.0 → 16.1.6 (15+ CVEs patched, including auth bypass CVE-2025-29927)
- ✅ API auth added to ALL routes via `lib/apiAuth.ts`
- ✅ UFW firewall enabled (only ports 80, 443)
- ✅ Next.js bound to localhost (`-H 127.0.0.1`)
- ✅ Security headers added to Caddy (HSTS, X-Frame-Options, etc.)
- ✅ Session secret rotated to random 64-char hex
- ✅ Async params fixed for Next.js 16 compatibility

---

## Current Stack Versions

| Package | Current | Latest | Status |
|---------|---------|--------|--------|
| Next.js | 16.1.6 | 16.1.6 | ✅ Current |
| React | 19.2.4 | 19.2.4 | ✅ Current |
| Prisma | 5.22.0 | 7.4.0 | ⚠️ Major update available |
| Tailwind CSS | 3.4.19 | 4.1.18 | ⚠️ Major update available |
| Zod | 3.25.76 | 4.3.6 | ⚠️ Major update available |
| bcryptjs | 3.0.3 | 3.0.3 | ✅ Current |
| iron-session | 8.0.4 | 8.0.4 | ✅ Current |
| Node.js | 22.22.0 | 22.x LTS | ✅ Current |
| PM2 | 6.0.14 | 6.0.14 | ✅ Current |
| Caddy | 2.x | 2.x | ✅ Current |

---

## Needs Scott's Decision

### 1. Prisma 7 Migration
Prisma 7 is a major rewrite (Rust-free engine, adapter-based client, new `prisma.config.ts`). Significant code changes required. Benefits: better performance, ESM support, simpler architecture. Risk: Breaking changes in client initialization and imports.

### 2. Tailwind CSS v4 Migration
Complete rewrite: CSS-first config (`@theme` directive), no `tailwind.config.js`, new `@import "tailwindcss"` syntax. Run `npx @tailwindcss/upgrade@latest` for ~80% automated migration. Estimated effort: 1-2 hours.

### 3. Database Password Rotation
Current password `mission123` is weak. Recommend rotating to a random string. Requires updating `.env` and `.pgpass`.

### 4. CI/CD Setup
GitHub Actions workflow file is ready locally (`.github/workflows/deploy.yml`). Needs:
- GitHub PAT with `workflow` scope to push
- SSH key pair for GitHub → server deploy
- GitHub Secrets: `SSH_HOST`, `SSH_USERNAME`, `SSH_PRIVATE_KEY`

### 5. Monitoring Setup
Recommend Uptime Kuma for uptime monitoring with Telegram alerts. Health endpoint `/api/ping` is ready. Requires Docker (not installed) or direct installation.

---

## Queued for Next Session

### High Priority
- [ ] Implement CSP (Content-Security-Policy) with nonces for inline scripts
- [ ] Add toast notifications (react-hot-toast) for action feedback
- [ ] Implement keyboard shortcuts for power users (Cmd+K command palette)
- [ ] Add real-time data polling/SSE for dashboard updates
- [ ] Research and evaluate auth alternatives (better-auth, lucia-auth) given iron-session's limited Next.js 16 compatibility

### Medium Priority
- [ ] Tailwind CSS v4 migration (if Scott approves)
- [ ] Prisma 7 migration (if Scott approves)
- [ ] Zod v4 migration
- [ ] Add `output: 'standalone'` for smaller production builds
- [ ] Implement error tracking (Telebugs or similar lightweight self-hosted)
- [ ] Add database indexing for audit logs (createdAt for time-range queries)

### Low Priority / Nice to Have
- [ ] PWA push notifications for critical alerts
- [ ] Background sync for offline task creation
- [ ] Bento grid dashboard layout
- [ ] Micro-interactions / animations for status changes
- [ ] Implement React Compiler (`reactCompiler: true` in next.config)
- [ ] Add E2E tests with Playwright
- [ ] Set up staging environment

---

## Architecture Notes

### Security Layers
1. **UFW Firewall** — Only ports 80/443 open
2. **Caddy** — HTTPS, security headers, access logging
3. **Next.js Proxy** — Session-based auth redirect
4. **API Auth** — `requireAuth()` on every API route
5. **Rate Limiting** — Login brute force protection
6. **Zod Validation** — Input validation on write endpoints
7. **iron-session** — Encrypted, httpOnly, secure, strict sameSite cookies

### File Structure
```
hivemind/
├── app/
│   ├── (dashboard)/     # Protected pages with sidebar layout
│   │   ├── error.tsx    # Error boundary
│   │   ├── loading.tsx  # Loading skeleton
│   │   └── [pages]
│   ├── api/             # API routes (all auth-protected except /api/ping)
│   ├── login/           # Public login page
│   ├── not-found.tsx    # Custom 404
│   ├── global-error.tsx # App-wide error boundary
│   ├── robots.ts        # Block search engines
│   └── layout.tsx       # Root layout with PWA support
├── lib/
│   ├── apiAuth.ts       # API route auth wrapper
│   ├── auth.ts          # Session management
│   ├── db.ts            # Prisma singleton
│   ├── rateLimit.ts     # Login rate limiter
│   ├── session.ts       # Session config
│   └── validations.ts   # Zod schemas
├── proxy.ts             # Request interception (auth)
├── ecosystem.config.js  # PM2 config
└── next.config.mjs      # Next.js config
```

### Backup Strategy
- **Database:** Daily at 2am UTC via cron, `pg_dump | gzip`, 30-day retention
- **Code:** GitHub repository (main branch)
- **Logs:** PM2 logrotate (10MB/7 files), Caddy logrotate (50MB/5 files/30 days)
