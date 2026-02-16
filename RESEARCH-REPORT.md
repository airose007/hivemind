# 🔬 HiveMind Infrastructure Research Report

**Generated:** 2026-02-16  
**Agent:** Infrastructure Research Agent (Pam subagent)  
**Server:** 69.67.173.156 (Bucharest)  
**Domain:** scottai.duckdns.org

---

## Executive Summary

The HiveMind dashboard has **multiple critical security vulnerabilities** that need immediate attention. The most severe issues are: an outdated Next.js version with known auth bypass CVEs, no firewall enabled, Next.js port 3000 exposed directly to the internet (bypassing Caddy), and API routes that rely solely on bypassable middleware for authentication. These issues combined mean an attacker could access all dashboard data and APIs without authentication.

---

## 🚨 CRITICAL ISSUES (Escalate to Scott)

### 1. Next.js 14.1.0 Has 15+ Known CVEs Including Auth Bypass (CVSS 9.1)

**What:** The app runs Next.js 14.1.0 which has multiple critical security vulnerabilities:

| CVE | Severity | Description |
|-----|----------|-------------|
| **CVE-2025-29927** | **CRITICAL (9.1)** | Authorization bypass via `x-middleware-subrequest` header — attacker can skip ALL middleware auth checks |
| CVE-2024-34351 | HIGH (7.5) | SSRF in Server Actions — attacker can make requests from the server |
| CVE-2025-55184 | HIGH | Denial of Service |
| CVE-2025-55183 | HIGH | Source code exposure |
| GHSA-gp8f-8m3g-qvj9 | HIGH | Cache poisoning |
| GHSA-7gfc-8cq8-jh5f | HIGH | Authorization bypass |
| GHSA-f82v-jwr5-mffw | HIGH | Authorization bypass in middleware |
| GHSA-4342-x723-ch2f | HIGH | Improper middleware redirect handling → SSRF |

**Why it matters:** CVE-2025-29927 is particularly devastating for HiveMind because the app relies **entirely** on middleware for authentication. An attacker can add `x-middleware-subrequest: middleware` header and access ALL protected routes and API endpoints without logging in. Public exploit code exists. EPSS score: 92.56% (extremely likely to be exploited).

**Fix:**
```bash
cd /home/openclaw/.openclaw/workspace/hivemind
npm install next@14.2.35 eslint-config-next@14.2.35
npm run build
pm2 restart hivemind
```

No breaking changes between 14.1.0 → 14.2.35 (same major.minor line).

**Sources:**
- https://www.offsec.com/blog/cve-2025-29927/
- https://jfrog.com/blog/cve-2025-29927-next-js-authorization-bypass/
- https://nextjs.org/blog/security-update-2025-12-11

---

### 2. UFW Firewall is INACTIVE — Server is Completely Unprotected

**What:** `ufw status` returns `Status: inactive`. There is **no firewall** protecting this server.

**Currently exposed ports on public IP (69.67.173.156):**

| Port | Service | Risk |
|------|---------|------|
| **3000** | Next.js (direct) | **CRITICAL** — Bypasses Caddy entirely |
| **3389** | RDP (xrdp) | **HIGH** — Remote desktop open to internet |
| **53** | DNS (BIND) | **HIGH** — DNS amplification attacks |
| 22 | SSH | Medium — Should be restricted |
| 80 | Caddy HTTP | Expected |
| 443 | Caddy HTTPS | Expected |

**Why it matters:** Port 3000 being publicly accessible means anyone can access the Next.js app directly, completely bypassing Caddy's reverse proxy (and any future security headers/rate limiting added there). Combined with CVE-2025-29927, this means full unauthenticated access to the dashboard.

**Fix:**
```bash
# Enable UFW with safe defaults
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (Caddy)
sudo ufw allow 443/tcp   # HTTPS (Caddy)
sudo ufw enable

# Block direct access to Next.js
# Port 3000 should only be accessible from localhost (Caddy → Next.js)
```

Additionally, bind Next.js to localhost only in `package.json`:
```json
"start": "next start -H 127.0.0.1"
```

---

### 3. API Routes Have NO Server-Side Auth Checks (Rely Solely on Bypassable Middleware)

**What:** All API routes (`/api/agents`, `/api/tasks`, `/api/departments`, `/api/logs`, `/api/settings/*`, `/api/health/*`, `/api/stats`) perform zero authentication checks. They trust that middleware has already verified the user. However, middleware can be bypassed (CVE-2025-29927) or accessed directly on port 3000.

**Verified:** `grep -rn "getSession" app/api/` shows `getSession()` is only called in `/api/auth/login` and `/api/auth/logout` — nowhere else.

**Why it matters:** Any API endpoint can be called without authentication if middleware is bypassed. This includes:
- Reading all agent data, tasks, departments, audit logs
- Creating/modifying/deleting agents and tasks
- Reading/writing workspace files (SOUL.md, AGENTS.md, etc.)
- Executing `openclaw gateway restart` via `/api/settings/restart`
- Reading system information (hostname, memory, CPU)

**Fix:** Add session validation to every API route:
```typescript
// In each API route handler:
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... rest of handler
}
```

Or create a reusable wrapper:
```typescript
// lib/api-auth.ts
import { getSession } from './auth'
import { NextResponse } from 'next/server'

export async function requireAuth() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return { authorized: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { authorized: true, session }
}
```

---

### 4. Restart Endpoint Executes Shell Commands Without Auth

**What:** `/api/settings/restart` calls `exec('openclaw gateway restart')` — a shell command — and has no authentication check of its own.

**Why it matters:** An unauthenticated attacker can restart the OpenClaw gateway at will, causing denial of service. The `exec()` call pattern could also be a vector for command injection if any user input is ever added.

**Fix:** Add auth check AND validate this is only callable by admins:
```typescript
const session = await getSession()
if (!session.isLoggedIn || session.role !== 'admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

---

### 5. Weak/Default Session Secret

**What:** The `.env` file contains:
```
SESSION_PASSWORD="super-secret-session-password-at-least-32-chars-long-hivemind-2026"
```

**Why it matters:** While this is 64+ chars (meeting iron-session's minimum), it's essentially a descriptive/default string that could be guessed. If an attacker obtains this, they can forge session cookies and authenticate as any user.

**Fix:** Generate a proper random secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Update `.env` with the generated value.

---

## ⚠️ HIGH PRIORITY ISSUES

### 6. No Rate Limiting on Any Endpoint

**What:** Zero rate limiting exists anywhere — not in Caddy, not in Next.js middleware, not in API routes. 

**Why it matters:**
- Login endpoint is vulnerable to brute force (no lockout, no delay)
- API endpoints can be scraped at unlimited speed
- DoS is trivially easy

**Fix (Caddy-level, recommended):**
Install the rate limiting module and update Caddyfile:
```
scottai.duckdns.org {
    # Rate limit: 100 requests per minute per IP
    rate_limit {remote_host} 100r/m

    # Stricter limit on auth endpoints
    handle /api/auth/* {
        rate_limit {remote_host} 5r/m
    }

    reverse_proxy localhost:3000
}
```

**Fix (Application-level, for login):**
Add a simple in-memory rate limiter for the login route using a Map with IP + timestamp tracking.

---

### 7. No Security Headers (No CSP, No HSTS, No X-Frame-Options)

**What:** Neither Caddy nor Next.js sets any security headers. The Caddyfile is bare minimum:
```
scottai.duckdns.org {
    reverse_proxy localhost:3000
}
```

And `next.config.mjs` is empty:
```javascript
const nextConfig = {};
```

**Why it matters:** Missing headers expose the app to clickjacking, XSS, MIME sniffing, and other attacks.

**Fix (Caddyfile):**
```
scottai.duckdns.org {
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';"
        -Server
        -X-Powered-By
    }
    reverse_proxy localhost:3000
}
```

**Sources:**
- https://www.talkincyber.com/secure-caddy/
- https://caddyserver.com/docs/caddyfile/directives/header

---

### 8. PM2 Configuration Issues — Duplicate Processes, Fork Mode, No Ecosystem File

**What:**
- **Two PM2 processes named "hivemind"**: id 0 (stopped, 15 restarts) and id 1 (online, 4 restarts). This is messy.
- Running in **fork mode** instead of cluster mode on a 4-core CPU
- **No ecosystem.config.js** — using raw `pm2 start npm -- start`
- **No max_memory_restart** configured
- **Heap usage at 87.52%** — approaching OOM

**Why it matters:** Fork mode wastes 3 of 4 CPU cores. Multiple restarts suggest instability. No memory limits means OOM crashes.

**Fix:**
```bash
# Clean up
pm2 delete all
pm2 save

# Create ecosystem.config.js
cat > /home/openclaw/.openclaw/workspace/hivemind/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'hivemind',
    script: 'node_modules/.bin/next',
    args: 'start -H 127.0.0.1',
    cwd: '/home/openclaw/.openclaw/workspace/hivemind',
    instances: 2,        // Use 2 of 4 cores (leave room for other services)
    exec_mode: 'cluster',
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/openclaw/.pm2/logs/hivemind-error.log',
    out_file: '/home/openclaw/.pm2/logs/hivemind-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
  }]
};
EOF

pm2 start ecosystem.config.js
pm2 save
```

---

### 9. No Swap Space Configured

**What:** `free -m` shows `Swap: 0 0 0`. The server has 8GB RAM with ~6GB available.

**Why it matters:** Without swap, if memory spikes (e.g., during builds, or if Next.js/PostgreSQL/OpenClaw all spike), the OOM killer will terminate processes unpredictably.

**Fix:**
```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

---

### 10. Next.js Config Missing — No Standalone Output, No Image Optimization, No Headers

**What:** `next.config.mjs` is completely empty: `const nextConfig = {};`

**Why it matters:** Missing `output: 'standalone'` means the production build includes all of `node_modules` (wasteful). No image optimization config. No custom headers set at app level.

**Fix:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      ],
    }]
  },
};

export default nextConfig;
```

---

## 📋 NICE TO HAVE IMPROVEMENTS

### 11. No CI/CD Pipeline — Manual Deploys Only

**What:** The GitHub repo at `https://github.com/airose007/hivemind` has no GitHub Actions workflows. Deploys are manual (SSH → git pull → build → restart).

**Why it matters:** Manual deploys are error-prone, slow, and can lead to forgetting steps (like running migrations).

**Fix:** Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy HiveMind
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /home/openclaw/.openclaw/workspace/hivemind
            git pull origin main
            npm ci --production
            npx prisma migrate deploy
            npm run build
            pm2 reload hivemind
```

Add GitHub Secrets: `SSH_HOST`, `SSH_USERNAME`, `SSH_PRIVATE_KEY`.

**Source:** https://ayyaztech.com/blog/auto-deploy-nextjs-with-github-actions-complete-cicd-guide-2025

---

### 12. No Monitoring or Health Check Automation

**What:** No uptime monitoring, no alerting, no automated health checks. If the site goes down at 3am, nobody knows until someone checks.

**Why it matters:** Downtime goes undetected. Performance degradation is invisible.

**Recommended solutions (lightweight, self-hosted):**

| Tool | Purpose | Resource Usage |
|------|---------|---------------|
| **Uptime Kuma** | Uptime monitoring + alerting | ~50MB RAM |
| **Beszel** | Server resource monitoring | Minimal |
| **PM2 Plus** | PM2 monitoring dashboard (free tier) | Cloud-based |

**Quickest win — Uptime Kuma:**
```bash
docker run -d --name uptime-kuma -p 3001:3001 -v uptime-kuma:/app/data louislam/uptime-kuma:1
```
Configure to monitor `https://scottai.duckdns.org` and alert via Telegram.

---

### 13. No Input Validation on API Routes Beyond Basic Required Fields

**What:** API routes like POST `/api/agents` and POST `/api/tasks` only check for the presence of required fields (`if (!name || !role)`). No Zod validation, no type checking, no length limits.

**Why it matters:** Malformed data can be injected into the database. Extremely long strings could cause storage issues or rendering problems.

**Fix:** Add Zod schemas (already a dependency!):
```typescript
import { z } from 'zod'

const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.enum(['manager', 'worker', 'router', 'monitor']),
  departmentId: z.string().optional(),
  model: z.enum(['opus', 'sonnet', 'haiku']).default('sonnet'),
  config: z.record(z.unknown()).default({}),
})

// In handler:
const parsed = createAgentSchema.safeParse(body)
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
}
```

---

### 14. Database Password is Simple

**What:** `DATABASE_URL="postgresql://mission:mission123@localhost:5432/hivemind"` — the database password is `mission123`.

**Why it matters:** While PostgreSQL is only listening on localhost (good), if any local process is compromised, trivial password guessing gives database access.

**Fix:**
```bash
# Generate new password
NEW_PW=$(openssl rand -base64 24)
sudo -u postgres psql -c "ALTER USER mission PASSWORD '$NEW_PW';"
# Update .env with new password
```

---

### 15. PWA Service Worker Could Be Improved

**What:** The current `sw.js` is basic — caches app shell and uses network-first for API calls, cache-first for static assets. No push notification support, no background sync, no offline page.

**Why it matters:** For a dashboard that agents might check from mobile, push notifications for critical alerts (agent errors, task failures) would be valuable.

**Fix:** Consider `next-pwa-pack` for enhanced PWA:
```bash
npm install next-pwa-pack
```

Or implement push notifications using Web Push API with a VAPID key pair.

**Source:** https://nextjs.org/docs/app/guides/progressive-web-apps

---

### 16. No Error Boundaries or Loading States

**What:** The dashboard pages don't have `error.tsx` or `loading.tsx` files for graceful error handling and loading states (standard Next.js App Router patterns).

**Why it matters:** If a database query fails or is slow, users see a raw error or blank screen instead of a helpful message.

**Fix:** Add to each route group:
```
app/(dashboard)/error.tsx    — Error boundary with retry button
app/(dashboard)/loading.tsx  — Skeleton loading UI
```

---

### 17. Prisma Connection Pool Not Configured

**What:** The `DATABASE_URL` has no connection pool parameters.

**Why it matters:** Default Prisma pool size is `num_cpus * 2 + 1 = 9` connections. For a small app this is fine, but explicit configuration is a best practice.

**Fix:** Add to DATABASE_URL:
```
postgresql://mission:PASSWORD@localhost:5432/hivemind?connection_limit=5&pool_timeout=20
```

---

### 18. No Log Rotation for PM2 Logs

**What:** PM2 logs accumulate indefinitely in `~/.pm2/logs/`.

**Fix:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

---

### 19. Dashboard UX Improvements (2025 Trends)

Based on research into modern AI dashboard UX trends:

1. **Real-time updates via SSE/WebSocket** — Currently all data is fetched on page load with no live updates. Add polling or Server-Sent Events for agent status changes.

2. **Bento grid layout** — The dashboard could use a modular card-based layout for at-a-glance metrics.

3. **Micro-interactions** — Add subtle animations for status changes (agent going online/offline, task completing).

4. **Keyboard shortcuts** — Power users (like Scott) would benefit from keyboard navigation.

5. **Toast notifications** — For actions like "Agent updated" or "Task created" instead of just page refreshes.

---

### 20. Database Optimization (Future-Proofing)

**Current state:** DB is 8MB with very few rows. No optimization needed now, but for future:

- Add database indexes (Prisma schema already has some `@@index` annotations — good)
- Set up automated PostgreSQL vacuuming (default settings are fine for now)
- Consider `pg_stat_statements` extension for query performance monitoring
- Add database backup automation:
```bash
# Add to crontab
0 2 * * * pg_dump -U mission hivemind | gzip > /home/openclaw/backups/hivemind-$(date +\%Y\%m\%d).sql.gz
```

---

## 📊 Action Plan by Department

### 🔧 Engineering Department

| Priority | Task | Effort |
|----------|------|--------|
| 🚨 CRITICAL | Upgrade Next.js to 14.2.35 | 15 min |
| 🚨 CRITICAL | Add auth checks to ALL API routes | 2-3 hours |
| ⚠️ HIGH | Add Zod validation to API routes | 1-2 hours |
| ⚠️ HIGH | Configure `next.config.mjs` (standalone, headers, poweredByHeader) | 30 min |
| ⚠️ HIGH | Create PM2 ecosystem.config.js with cluster mode | 30 min |
| 📋 NICE | Add `error.tsx` and `loading.tsx` to route groups | 1 hour |
| 📋 NICE | Set up CI/CD with GitHub Actions | 1 hour |
| 📋 NICE | Add real-time updates (polling/SSE) | 3-4 hours |
| 📋 NICE | Improve PWA with push notifications | 4-6 hours |
| 📋 NICE | Add toast notifications for actions | 1-2 hours |

### 🏥 Health/Ops Department

| Priority | Task | Effort |
|----------|------|--------|
| 🚨 CRITICAL | Enable UFW firewall (block 3000, 3389, restrict 53) | 10 min |
| 🚨 CRITICAL | Bind Next.js to 127.0.0.1 only | 5 min |
| 🚨 CRITICAL | Rotate session secret to random value | 5 min |
| ⚠️ HIGH | Add security headers to Caddy | 15 min |
| ⚠️ HIGH | Add rate limiting to Caddy | 15 min |
| ⚠️ HIGH | Create swap space (4GB) | 5 min |
| ⚠️ HIGH | Clean up duplicate PM2 processes | 5 min |
| ⚠️ HIGH | Rotate database password | 10 min |
| 📋 NICE | Set up Uptime Kuma monitoring | 30 min |
| 📋 NICE | Install pm2-logrotate | 5 min |
| 📋 NICE | Set up automated database backups | 15 min |

### 📈 Strategy Department

| Priority | Task | Effort |
|----------|------|--------|
| ⚠️ HIGH | Prioritize security fixes over new features | — |
| 📋 NICE | Plan real-time dashboard updates (SSE/WebSocket) | — |
| 📋 NICE | Research bento grid layout for dashboard | — |
| 📋 NICE | Consider keyboard shortcuts for power users | — |
| 📋 NICE | Evaluate push notifications for critical alerts | — |

---

## Quick Win Checklist (Can be done in 1 hour)

These are the most impactful changes that can be done quickly:

- [ ] `sudo ufw enable` with proper rules (10 min)
- [ ] `npm install next@14.2.35 eslint-config-next@14.2.35` (15 min with rebuild)
- [ ] Add `-H 127.0.0.1` to Next.js start command (5 min)
- [ ] Rotate session secret (5 min)
- [ ] Update Caddyfile with security headers (10 min)
- [ ] Create swap space (5 min)
- [ ] Clean up duplicate PM2 process (5 min)

---

## References

- [Next.js Security Updates](https://nextjs.org/blog/security-update-2025-12-11)
- [CVE-2025-29927 Analysis](https://jfrog.com/blog/cve-2025-29927-next-js-authorization-bypass/)
- [CVE-2024-34351 SSRF](https://www.assetnote.io/resources/research/advisory-next-js-ssrf-cve-2024-34351/)
- [Caddy Security Headers](https://www.talkincyber.com/secure-caddy/)
- [PM2 Cluster Mode](https://pm2.keymetrics.io/docs/usage/cluster-mode/)
- [Prisma Connection Pooling](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections)
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [GitHub Actions Deploy Guide](https://ayyaztech.com/blog/auto-deploy-nextjs-with-github-actions-complete-cicd-guide-2025)
- [Complete Next.js Security Guide 2025](https://www.turbostarter.dev/blog/complete-nextjs-security-guide-2025-authentication-api-protection-and-best-practices)
