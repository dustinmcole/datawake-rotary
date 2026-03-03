# Fullerton Rotary Club — Unified Platform

A single Next.js application replacing three separate systems for the Rotary Club of Fullerton, built and managed by [Datawake](https://datawake.io).

## What This Replaces

| Legacy System | Replacement |
|---|---|
| fullertonrotaryclub.com (Wix) | Public website — club info, events, join, programs |
| DACdb (legacy SaaS) | Member portal — directory, attendance, committees, profile |
| Uncorked planning site (standalone Vercel app) | Integrated Uncorked Hub module |
| fullertonuncorked.org (needs rebuild) | Uncorked public event site — tickets, sponsors, vendors |

## Architecture

Four products in one codebase, served on two domains:

| Product | Route Group | Domain |
|---|---|---|
| Public Club Website | `(rotary)/*` | fullertonrotaryclub.com |
| Members Portal | `/portal/*` | fullertonrotaryclub.com/portal |
| Uncorked Management Hub | `/uncorked-hub/*` | fullertonrotaryclub.com/uncorked-hub |
| Uncorked Public Website | `(uncorked)/*` | fullertonuncorked.org |

Domain-based routing is handled by Next.js middleware — requests to `fullertonuncorked.org` resolve to the `(uncorked)/*` route group.

### Additional Capabilities

- **Bryn AI Assistant** — role-aware chatbot embedded in the portal (Anthropic Claude)
- **Membership Pipeline CRM** — track prospective members from inquiry to induction
- **SMS Broadcast System** — admin messaging to members
- **Check-In Kiosk** — tablet-based attendance at weekly meetings

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 16 (App Router)
- **Language:** TypeScript
- **UI:** [Radix UI](https://www.radix-ui.com/) + [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Auth:** [Clerk](https://clerk.com/) (RBAC with admin, club_admin, member roles)
- **Database:** [Neon](https://neon.tech/) (serverless Postgres) + [Drizzle ORM](https://orm.drizzle.team/)
- **AI:** [Vercel AI SDK](https://sdk.vercel.ai/) + Anthropic Claude
- **CI:** GitHub Actions (lint + type check)

## Project Structure

```
datawake-rotary/
├── app/                        # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (rotary)/       # Public club pages
│   │   │   ├── (uncorked)/     # Uncorked public pages
│   │   │   ├── (kiosk)/        # Check-in kiosk
│   │   │   ├── portal/         # Member portal
│   │   │   ├── admin/          # Admin dashboard
│   │   │   ├── uncorked-hub/   # Uncorked committee hub
│   │   │   └── api/            # API routes
│   │   ├── components/         # Shared UI components
│   │   └── lib/                # Utilities, DB, queries
│   ├── drizzle/                # Database migrations
│   └── package.json
├── docs/
│   └── test-plans/             # QA test scripts
├── MASTER-PLAN.md              # Full architecture & module breakdown
├── PLANNING.md                 # Build plan & terminal assignments
├── .env.template               # Environment variable reference
└── openclaw.json               # Bryn AI agent configuration
```

## Getting Started

### Prerequisites

- Node.js 22+
- A [Neon](https://neon.tech/) Postgres database
- A [Clerk](https://clerk.com/) application
- An [Anthropic](https://console.anthropic.com/) API key

### Setup

```bash
# Clone the repo
git clone https://github.com/dustinmcole/datawake-rotary.git
cd datawake-rotary

# Copy environment template and fill in values
cp .env.template app/.env.local

# Install dependencies
cd app
npm install

# Push database schema
npm run db:push

# Seed initial data (optional)
npm run db:seed

# Start dev server
npm run dev
```

The app runs at `http://localhost:3000`.

### Key URLs (local dev)

| URL | What |
|---|---|
| `/` | Public homepage |
| `/login` | Clerk sign-in |
| `/portal` | Member dashboard |
| `/admin` | Admin dashboard |
| `/checkin` | Meeting check-in kiosk |
| `/uncorked-hub` | Uncorked committee hub |

## Environment Variables

See [`.env.template`](.env.template) for the full list. Required variables are validated at startup via `src/lib/env.ts` — the app will fail fast with clear errors if anything is missing.

## CI

GitHub Actions runs on every push and PR to `main`:

- **ESLint** — zero-warning policy (`--max-warnings=0`)
- **TypeScript** — strict type checking (`tsc --noEmit`)

## Documentation

- **[MASTER-PLAN.md](MASTER-PLAN.md)** — Complete architecture, RBAC, database schema, module breakdown
- **[PLANNING.md](PLANNING.md)** — Build plan, terminal assignments, status log
- **[docs/test-plans/](docs/test-plans/)** — QA test scripts for each feature area
- **[CHANGELOG.md](CHANGELOG.md)** — Release history

## License

Private. © 2026 Datawake / Dustin Cole. All rights reserved.
