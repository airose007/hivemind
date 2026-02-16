# 🐝 HiveMind - AI Company Dashboard

A Next.js web dashboard for managing an autonomous AI agent company.

## Features

- 🔐 **Authentication** - Secure login with bcrypt and iron-session
- 🏢 **Department Management** - Organize agents into departments
- 🤖 **Agent Monitoring** - Track agent health, status, and activity
- 📋 **Task Management** - View and manage agent tasks
- 📊 **Analytics Dashboard** - Real-time stats and metrics
- ⚙️ **Settings Panel** - Edit OpenClaw config and agent files
- 📜 **Audit Logs** - Complete activity history

## Tech Stack

- **Next.js 14** (App Router)
- **PostgreSQL** with Prisma ORM
- **TypeScript**
- **Tailwind CSS** (dark theme)
- **iron-session** for auth

## Setup

1. **Database is already created** (`hivemind`)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run migrations and seed:**
   ```bash
   npx prisma migrate dev
   npm run seed
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Access the dashboard:**
   - URL: http://localhost:3000
   - Username: `scott`
   - Password: `HiveMind2026!`

## Production Deployment

The app is configured to run on port 3000 behind Caddy reverse proxy at `scottai.duckdns.org`.

```bash
npm run build
npm start
```

Or use PM2 for process management:

```bash
pm2 start npm --name "hivemind" -- start
```

## Database Schema

- **User** - Authentication
- **Department** - Organization units (Research, Engineering, Strategy, Health/Ops)
- **Agent** - AI agents with health monitoring
- **Task** - Agent tasks with status tracking
- **HealthCheck** - Agent health history
- **AuditLog** - System activity logs
- **Message** - Inter-agent communication
- **SystemConfig** - Application configuration

## Default Seed Data

### Departments
- 🔬 Research (core)
- 🛠️ Engineering (core)
- 📊 Strategy (core)
- 🏥 Health/Ops (core)

### Agents
- Master Agent (opus, no department)
- Pam (opus, personal assistant)
- Intelligence Router (haiku)
- Research Manager (sonnet)
- Engineering Manager (sonnet)
- Strategy Manager (sonnet)
- Health Monitor (haiku)

## Environment Variables

See `.env` file:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_PASSWORD` - Session encryption key
- `OPENCLAW_CONFIG` - Path to OpenClaw config
- `OPENCLAW_WORKSPACE` - Path to workspace directory

## Development

```bash
# Run dev server with hot reload
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Re-seed database
npm run seed

# Prisma studio (database GUI)
npx prisma studio
```

## API Routes

All API routes are in `app/api/`:
- `/api/auth/*` - Authentication
- `/api/departments/*` - Department CRUD
- `/api/agents/*` - Agent management
- `/api/tasks/*` - Task operations
- `/api/health/*` - System health
- `/api/logs` - Audit logs
- `/api/stats` - Dashboard statistics
- `/api/settings/*` - Configuration management

## Pages

- `/login` - Authentication
- `/` - Dashboard overview
- `/departments` - Department list and management
- `/departments/[id]` - Department details
- `/agents` - Agent list
- `/agents/[id]` - Agent details with health history
- `/tasks` - Task list with filters
- `/tasks/[id]` - Task details with event timeline
- `/logs` - Audit log viewer
- `/settings` - Config editor, file editor, system info

## License

Proprietary - AI Company Internal Use
