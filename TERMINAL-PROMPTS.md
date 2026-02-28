# Terminal Prompts — Fullerton Rotary Platform

**Project:** ~/projects/datawake-rotary
**Last updated:** 2026-02-28

---

## Status

| Prompt | Status | Assignee |
|--------|--------|----------|
| Wave 1: T1–T5, T4A/T4B (Build) | COMPLETE | Claude |
| P1: Bryn Droplet Provisioning | READY | Any terminal |
| P2: Production Environment | READY (partial) | Dustin |
| P3: Middleware → Proxy Migration | READY | Any terminal |
| P4: Data Migration (localStorage → DB) | READY | Any terminal |

---

## Completed (Wave 1 — Build Phase)

All 6 build terminals finished. Code is complete, TypeScript clean, build passes (71 routes).

- **T1:** Auth & Infrastructure — Clerk, 13 tables, middleware, 3 layouts
- **T2:** Member Portal — 7 pages, 11 API routes
- **T3:** Public Website + CMS — 8 pages, header/footer, seed script
- **T4A:** Bryn Backend — system-prompt, 17 tools, executors, streaming chat API
- **T4B:** Bryn Chat UI — chat page, hook, message/confirmation/widget components
- **T5:** Uncorked Hub + Admin — 8 admin pages, 12 admin APIs

Full build prompts archived in git history (commit `2ccca85` and earlier).

---

## P1: Bryn Droplet Provisioning

**Prerequisites:** None (can start now)
**Time estimate:** ~1 hour

```
You are setting up the Bryn OpenClaw agent deployment for the Fullerton Rotary Club (Datawake client).

## Context
- Project repo: ~/projects/datawake-rotary
- Agent name: Bryn
- Runtime: OpenClaw
- Agent config: openclaw.json (repo root)
- Workspace files: workspace/ directory (SOUL.md, IDENTITY.md, AGENTS.md, USER.md, MEMORY.md)
- Cron jobs: cron/jobs.json
- Slack channel: #internal-rotary (C0AGHLNCL6S) in Datawake workspace

## IMPORTANT: Read docs first
Read the Bryn product documentation at ~/projects/datawake-bryn/docs/ BEFORE doing anything. Key files:
- 04-architecture-and-deployment.md — droplet sizing, fleet management, provisioning
- 07-implementation-playbook.md — step-by-step provisioning workflow
- 08-security-framework.md — secrets management (1Password CLI)
- 09-reliability-and-operations.md — health checks, disaster recovery
- 15-observability-and-monitoring.md — Langfuse, LLM proxy, Komodo

Also read these files in the rotary repo:
- openclaw.json — agent configuration (already updated for new infra stack)
- workspace/AGENTS.md — operating rules & config governance
- workspace/SOUL.md — Bryn's personality
- cron/jobs.json — scheduled tasks
- ROGER-CONFIG.md — context on multi-agent workflow

## Infrastructure Stack
- Fleet management: Komodo (Core on bryn-monitor) + Ansible playbooks + Tailscale mesh VPN
- Monitoring VPS: bryn-monitor at 137.184.4.57 (Langfuse + Komodo Core already running)
- Secrets: 1Password CLI (`op` provider) — NO plaintext credentials
- LLM observability: Langfuse via LLM API proxy (port 4010)

## Tasks (in order)

1. PROVISION DROPLET
   - DigitalOcean: 2GB RAM / 1 vCPU ($12/mo), hostname: bryn-rotary
   - Region: SFO3
   - Use OpenClaw marketplace image if available, otherwise Ubuntu 24.04
   - Check ~/projects/datawake-bryn/ for existing Ansible playbooks (provision-client.yml)

2. NETWORKING & FLEET
   - Install Tailscale, join to Datawake tailnet
   - Install Komodo Periphery agent
   - Register bryn-rotary in Komodo Core on bryn-monitor

3. CLONE & CONFIGURE
   - Clone github.com/dustinmcole/datawake-rotary (private — needs deploy key or PAT)
   - Workspace directory from repo: workspace/
   - Agent config: openclaw.json

4. SECRETS (via 1Password CLI)
   - Configure with `openclaw secrets configure`
   - Required: ANTHROPIC_API_KEY, SLACK_BOT_TOKEN, DATABASE_URL, CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   - Validate: `openclaw secrets audit --check` must exit 0

5. SLACK BOT
   - Bryn needs socket-mode Slack bot for #internal-rotary (C0AGHLNCL6S)
   - Also needs #bryn-rotary channel for config governance (Dustin-only)

6. CRON JOBS (from cron/jobs.json)
   - Morning Briefing: daily 7:00 AM PT
   - Meeting Follow-up: every 30 min during business hours
   - Weekly Updates: Saturday 8 PM draft, Monday 5 AM send
   - Event Coordination: on-demand (no cron)

7. OBSERVABILITY
   - Configure LLM API proxy to route Claude calls through Langfuse on bryn-monitor
   - Set ANTHROPIC_BASE_URL to local proxy endpoint (port 4010)
   - Verify traces appear in Langfuse dashboard

8. VERIFY
   - `openclaw secrets audit --check` — must exit 0
   - Health check passes (gateway, Slack, ClickUp)
   - Post test message to #internal-rotary
   - Cron fires on schedule

## Key Rules
- ALL secrets via 1Password — no plaintext .env files on the droplet
- Bryn config governance: ONLY Dustin can modify (workspace/AGENTS.md)
- Follow procedures from ~/projects/datawake-bryn/docs/ exactly
```

---

## P2: Production Environment

**Prerequisites:** Clerk account configured, Vercel project exists
**Note:** Vercel env vars on hold — will be set at production deploy time

```
You are configuring the production environment for the Fullerton Rotary Club unified platform.

## Context
- Project: ~/projects/datawake-rotary/app (Next.js 16 app)
- Deployed on Vercel: https://app-sigma-seven-46.vercel.app
- Vercel project: dustin-coles-projects-548eb4b9/app
- Auth: Clerk (@clerk/nextjs)
- Database: Neon PostgreSQL (created, schema pushed, CMS pages seeded)
- Deploy command: `npx vercel --yes --prod` from app/ directory

## Tasks

1. VERCEL ENVIRONMENT VARIABLES
   Set these in the Vercel dashboard or via CLI (`npx vercel env add`):

   Required (copy from app/.env.local):
   - DATABASE_URL — Neon PostgreSQL connection string
   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY — Clerk publishable key
   - CLERK_SECRET_KEY — Clerk secret key

   Required for Bryn AI chat:
   - ANTHROPIC_API_KEY — Datawake API key for Claude

   Verify all are set: `npx vercel env ls`

2. CLERK CONFIGURATION
   In the Clerk dashboard (clerk.com):

   a. Set your user's roles:
      - Go to Users → find your account → Metadata
      - Set publicMetadata to: {"roles": ["super_admin"]}
      - This gives you full access to all portal/admin/uncorked-hub sections

   b. Verify allowed redirect URLs include:
      - https://app-sigma-seven-46.vercel.app (or your custom domain)
      - http://localhost:3000 (for local dev)

   c. Review sign-in/sign-up settings match what the app expects

3. DEPLOY AND VERIFY
   cd ~/projects/datawake-rotary/app
   npx vercel --yes --prod

   After deploy, verify:
   - [ ] Homepage loads (public Rotary site at /)
   - [ ] /login shows Clerk sign-in
   - [ ] After login, /portal loads with your name
   - [ ] /admin is accessible (you have super_admin role)
   - [ ] /uncorked-hub loads the planning dashboard
   - [ ] /portal/bryn shows the Bryn chat page
   - [ ] /join form submits successfully
   - [ ] /about, /programs, /events, /contact all render

4. CUSTOM DOMAIN (optional, future)
   - If setting up fullertonrotaryclub.com:
     - Add domain in Vercel dashboard
     - Update DNS records
     - Update Clerk allowed origins
     - Update any hardcoded URLs

## Notes
- The app uses Tailwind CSS 4 — build should work out of the box on Vercel
- If build fails, check that all env vars are set (the app will fail at import time if DATABASE_URL is missing)
- Clerk middleware protects /portal/*, /admin/*, /uncorked-hub/*
```

---

## P3: Middleware → Proxy Migration

**Prerequisites:** None (can start now)
**Why:** Next.js 16 warns that `middleware.ts` is deprecated in favor of `proxy.ts`

```
You are migrating the Next.js middleware to the new proxy file convention for the Fullerton Rotary Club platform.

## Context
- Project: ~/projects/datawake-rotary/app (Next.js 16.1.6)
- Current middleware: src/middleware.ts (uses Clerk's clerkMiddleware)
- Auth: Clerk (@clerk/nextjs ^6.39.0)
- The dev server shows: "The 'middleware' file convention is deprecated. Please use 'proxy' instead."

## BEFORE YOU START
1. Read the current middleware: app/src/middleware.ts
2. Read the Next.js 16 proxy docs: https://nextjs.org/docs/messages/middleware-to-proxy
3. Check Clerk's docs for proxy/middleware compatibility with @clerk/nextjs v6
4. Read PLANNING.md and BUILD-COORD.md for route structure context

## Tasks

1. RESEARCH
   - Read Next.js 16 proxy documentation
   - Check if @clerk/nextjs v6 has proxy support yet
   - If Clerk doesn't support proxy yet, document the blocker and stop
   - If it does, proceed with migration

2. MIGRATE
   - Create src/proxy.ts (or wherever Next.js 16 expects it)
   - Move the route protection logic from middleware.ts
   - Preserve ALL current behavior:
     - Public routes: /, /about, /programs, /events, /join, /contact, /uncorked, /sponsors, /vendors, /vendor-interest, /login, /register
     - Public APIs: /api/vendor-interest, /api/pages, /api/membership-inquiries
     - Protected routes: /portal/*, /admin/*, /uncorked-hub/*
   - Remove old middleware.ts after proxy.ts is verified

3. VERIFY
   - Run `npx tsc --noEmit` — must pass
   - Run `npm run build` — must pass
   - Start dev server — no deprecation warning
   - Test: unauthenticated user can access / but not /portal
   - Test: all public API routes accessible without auth

## Rules
- Do NOT change any auth logic — only change the file convention
- If Clerk doesn't support proxy yet, stop and report back
- Update BUILD-COORD.md with results
```

---

## P4: Data Migration (localStorage → Database)

**Prerequisites:** Database is live (done)
**Why:** Uncorked hub modules still use localStorage. Need to migrate to Neon DB.

```
You are migrating the Uncorked Hub data layer from localStorage to the Neon PostgreSQL database for the Fullerton Rotary Club platform.

## Context
- Project: ~/projects/datawake-rotary/app (Next.js 16)
- Database: Neon PostgreSQL via Drizzle ORM (src/lib/db/schema.ts, src/lib/db/client.ts)
- The Uncorked Hub pages at /uncorked-hub/* currently use localStorage via src/lib/store.ts
- These pages were the original standalone planning site, migrated into the unified platform
- The database already has tables for: contacts, activities, meetings, actionItems, tasks, budgetItems, vendorInterestSubmissions, eventConfig

## BEFORE YOU START
1. Read src/lib/store.ts — understand the localStorage layer
2. Read src/lib/db/schema.ts — see what tables already exist
3. Read the Uncorked Hub pages to understand data flow:
   - src/app/uncorked-hub/sponsors/page.tsx
   - src/app/uncorked-hub/vendors/page.tsx
   - src/app/uncorked-hub/budget/page.tsx
   - src/app/uncorked-hub/tasks/page.tsx
   - src/app/uncorked-hub/meetings/page.tsx
   - src/app/uncorked-hub/committee/page.tsx
4. Read src/lib/queries/*.ts — see existing query functions
5. Read BUILD-COORD.md for context

## Tasks

1. AUDIT current data flow
   - Map which pages use localStorage vs database
   - Identify all store.ts functions being called
   - List the data types: contacts, activities, meetings, actionItems, tasks, budgetItems

2. CREATE QUERY FUNCTIONS
   - Add query functions in src/lib/queries/ for any Uncorked data not yet covered
   - Follow existing patterns (use db client from src/lib/db/client.ts, generateId() for IDs)
   - Existing query files to check: contacts.ts, activities.ts, meetings.ts, tasks.ts, budget.ts

3. CREATE API ROUTES (if needed)
   - The Uncorked pages are client components using localStorage
   - They need API routes to talk to the database
   - Check if /api/contacts, /api/budget, /api/meetings, /api/tasks already exist
   - Add missing routes following the auth pattern in BUILD-COORD.md

4. MIGRATE PAGES
   - Update each Uncorked Hub page to fetch from API routes instead of localStorage
   - Preserve all existing UI and functionality
   - The pages can remain client components — just swap localStorage calls for fetch() calls

5. COMMITTEE PAGE
   - src/app/uncorked-hub/committee/page.tsx uses hardcoded COMMITTEE_MEMBERS array
   - Migrate to query the users table (committee members with uncorked_committee role)
   - Or create a dedicated committee members table/query if needed

6. SEED DATA
   - The existing localStorage seed data (30+ sponsors, 35+ vendors, etc.) needs to be in the DB
   - Create a seed script at scripts/seed-uncorked.ts
   - Use existing seed data from store.ts as the source
   - Script should be idempotent (skip existing records)

7. VERIFY
   - Run `npx tsc --noEmit` — must pass
   - Run `npm run build` — must pass
   - All Uncorked Hub pages render with data from DB
   - CRUD operations work (create, edit, delete contacts/tasks/budget items)
   - No more localStorage usage in Uncorked Hub pages

## Rules
- Do NOT delete store.ts until all pages are migrated
- Preserve ALL existing UI — this is a data layer swap only
- Follow existing auth patterns (Clerk auth in API routes)
- Follow existing DB patterns (varchar IDs, generateId(), Drizzle queries)
- Update BUILD-COORD.md when done
```

---

## Execution Order

These can run in parallel — no dependencies between them:

| Prompt | Can run now? | Notes |
|--------|-------------|-------|
| **P1** (Bryn droplet) | Yes | Infra work, independent of code |
| **P2** (Production env) | Partial | Clerk roles now, Vercel env vars later |
| **P3** (Middleware migration) | Yes | Code change, independent |
| **P4** (Data migration) | Yes | Code change, independent |
