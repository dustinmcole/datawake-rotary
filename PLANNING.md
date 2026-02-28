# Fullerton Rotary Club — Unified Platform Planning

**Client:** Rotary Club of Fullerton (Fullerton South Rotary)
**Developer:** Datawake (datawake.io)
**Project Alias:** cc-rotary
**Repo:** ~/projects/datawake-rotary
**Master Plan:** MASTER-PLAN.md (full architecture, RBAC, module breakdown, schema)

---

## Table of Contents
1. [Vision](#vision)
2. [Architecture Overview](#architecture-overview)
3. [Terminal 1: Auth & Infrastructure (DONE)](#terminal-1-auth--infrastructure)
4. [Terminal 2: Member Portal (PENDING)](#terminal-2-member-portal)
5. [Terminal 3: Public Website (PENDING)](#terminal-3-public-website)
6. [Terminal 4: Bryn AI Integration (PENDING)](#terminal-4-bryn-ai-integration)
7. [Terminal 5: Uncorked Migration + Polish (PENDING)](#terminal-5-uncorked-migration--polish)
8. [Event Research](#event-research)
9. [Status Log](#status-log)

---

## Vision

One unified Next.js app replacing **three separate systems**:

| Current System | Replacement |
|---|---|
| fullertonrotaryclub.com (Wix) | Public website — club info, events, join, programs |
| DACdb (legacy SaaS) | Member portal — directory, attendance, committees, profile |
| Uncorked planning site (standalone Vercel app) | Integrated Uncorked Hub module at /uncorked-hub/* |

Plus two net-new capabilities:
- **Bryn AI Assistant** — role-aware chatbot embedded in the portal
- **Event Submission System** — members can submit club events

---

## Architecture Overview

```
fullertonrotaryclub.com
├── /                           → Auth check → /portal or /login
├── /login, /register           → Clerk auth (catch-all routes)
│
├── /(public)/*                 → Uncorked public pages (existing)
│   ├── /                       → Uncorked homepage
│   ├── /about                  → About
│   ├── /sponsors               → Public sponsors
│   ├── /vendors                → Public vendors
│   └── /vendor-interest        → Vendor interest form
│
├── /portal/*                   → Member Portal (8 routes)
│   ├── /portal                 → Dashboard
│   ├── /portal/directory       → Member directory
│   ├── /portal/profile         → Edit profile
│   ├── /portal/attendance      → Attendance
│   ├── /portal/committees      → Committees
│   ├── /portal/events          → Events
│   ├── /portal/announcements   → Announcements
│   └── /portal/bryn            → Bryn AI chat
│
├── /admin/*                    → Admin Panel (9 routes)
│   ├── /admin                  → Admin dashboard
│   ├── /admin/members          → Member management
│   ├── /admin/attendance       → Attendance reports
│   ├── /admin/committees       → Committee management
│   ├── /admin/events           → Event management
│   ├── /admin/announcements    → Announcements
│   ├── /admin/website          → Website CMS
│   ├── /admin/reports          → Reports
│   └── /admin/settings         → Settings
│
├── /uncorked-hub/*             → Uncorked Planning Hub (8 routes, migrated from /admin/*)
│   ├── /uncorked-hub           → Dashboard (countdown, stats, quick actions)
│   ├── /uncorked-hub/meetings  → Meeting notes CRUD
│   ├── /uncorked-hub/tasks     → Kanban task management
│   ├── /uncorked-hub/budget    → Budget tracker (charts, P&L)
│   ├── /uncorked-hub/sponsors  → Sponsor CRM
│   ├── /uncorked-hub/vendors   → Vendor CRM
│   ├── /uncorked-hub/committee → Committee directory
│   └── /uncorked-hub/vendor-interest → Vendor submissions
│
└── /api/*                      → API routes (existing, unchanged)
```

### Auth (Clerk)
- 8 roles: super_admin, club_admin, board_member, website_admin, uncorked_committee, committee_chair, member, guest
- Roles stored in Clerk publicMetadata.roles
- Permissions are ADDITIVE (union of all assigned roles)
- Middleware protects /portal/*, /admin/*, /uncorked-hub/*

### Database (Neon Postgres + Drizzle ORM)
- **21 total tables** (8 existing Uncorked + 13 new platform)
- Existing: contacts, activities, meetings, actionItems, tasks, budgetItems, vendorInterestSubmissions, eventConfig
- New: users, committees, committeeMemberships, events, eventRsvps, attendance, announcements, pages, pageVersions, chatThreads, chatMessages, membershipInquiries

---

## Terminal 1: Auth & Infrastructure

**Status: COMPLETE**
**Completed: 2026-02-28**

### What was built:

1. **Clerk Auth**
   - `@clerk/nextjs` installed
   - Root layout wrapped with `<ClerkProvider>`
   - Middleware at `src/middleware.ts` with public/protected route separation
   - Login page at `/login/[[...sign-in]]`
   - Register page at `/register/[[...sign-up]]`

2. **Auth Utility** (`src/lib/auth.ts`)
   - `getCurrentUser()` — returns Clerk user + DB user record + roles
   - `hasRole(userId, role)` — check specific user for a role
   - `hasAnyRole(userId, roles[])` — check specific user for any role
   - `requireRole(role)` / `requireAnyRole(roles[])` — server-side role gates
   - Helper: `isAdmin()`, `canAccessUncorkedHub()`, `getHighestRole()`

3. **Database Schema** — 13 new tables added to `src/lib/db/schema.ts`
   - users, committees, committeeMemberships, events, eventRsvps, attendance
   - announcements, pages, pageVersions, chatThreads, chatMessages, membershipInquiries

4. **Query Layer** — 8 new query files in `src/lib/queries/`
   - users.ts, events-club.ts, attendance.ts, committees-club.ts
   - announcements.ts, pages.ts, chat.ts, membership-inquiries.ts

5. **Three Layout Shells**
   - **Portal** (`/portal/*`) — Slate/blue sidebar, Clerk UserButton, neutral professional design
   - **Admin** (`/admin/*`) — Gray/amber sidebar, admin-focused design
   - **Uncorked Hub** (`/uncorked-hub/*`) — Wine-themed sidebar (preserved), "Back to Portal" link

6. **Route Migration**
   - Existing Uncorked admin pages moved from `/admin/*` to `/uncorked-hub/*`
   - All internal links updated (dashboard, sidebar)
   - Original sidebar now `UncorkedSidebar` with /uncorked-hub paths

7. **Placeholder Pages** — 17 new placeholder pages for portal/* and admin/*

8. **Root Page** — `/` checks auth → redirects to /portal (authenticated) or /login (not)

### Files created/modified:
```
CREATED:
  src/middleware.ts
  src/lib/auth.ts
  src/app/login/[[...sign-in]]/page.tsx
  src/app/register/[[...sign-up]]/page.tsx
  src/app/portal/layout.tsx
  src/app/portal/page.tsx + 7 placeholder pages
  src/app/admin/layout.tsx (rewritten for platform admin)
  src/app/admin/page.tsx (rewritten) + 8 placeholder pages
  src/app/uncorked-hub/layout.tsx
  src/app/uncorked-hub/page.tsx (migrated from admin)
  src/app/uncorked-hub/meetings/page.tsx (migrated)
  src/app/uncorked-hub/tasks/page.tsx (migrated)
  src/app/uncorked-hub/budget/page.tsx (migrated)
  src/app/uncorked-hub/sponsors/page.tsx (migrated)
  src/app/uncorked-hub/vendors/page.tsx (migrated)
  src/app/uncorked-hub/committee/page.tsx (migrated)
  src/app/uncorked-hub/vendor-interest/page.tsx (migrated)
  src/components/layout/portal-sidebar.tsx
  src/components/layout/admin-sidebar.tsx
  src/components/layout/uncorked-sidebar.tsx
  src/lib/queries/users.ts
  src/lib/queries/events-club.ts
  src/lib/queries/attendance.ts
  src/lib/queries/committees-club.ts
  src/lib/queries/announcements.ts
  src/lib/queries/pages.ts
  src/lib/queries/chat.ts
  src/lib/queries/membership-inquiries.ts

MODIFIED:
  src/app/layout.tsx (added ClerkProvider)
  src/app/page.tsx (auth-aware redirect)
  src/lib/db/schema.ts (13 new tables)
  src/components/layout/sidebar.tsx (paths updated to /uncorked-hub)
  package.json (added @clerk/nextjs, db:migrate script)
  .env.template (added Clerk vars, DATABASE_URL)
```

### Migration command (run after DATABASE_URL is set):
```bash
cd app && npm run db:push
```

---

## Terminal 2: Member Portal

**Status: PENDING**
**Depends on:** Terminal 1 (complete)

Builds all `/portal/*` pages: dashboard, directory, profile, attendance, committees, events, announcements.

---

## Terminal 3: Public Website

**Status: PENDING**
**Depends on:** Terminal 1 (complete)

Builds new public Rotary website pages, CMS system, join form, contact form.

---

## Terminal 4: Bryn AI Integration

**Status: PENDING**
**Depends on:** Terminal 1 (complete), Terminal 3 (CMS basics)

Builds chat API, tool definitions, chat UI, role-based tool filtering.

---

## Terminal 5: Uncorked Migration + Polish

**Status: PENDING**
**Depends on:** Terminal 1 (complete)

Wraps existing Uncorked pages with auth checks, adapts committee data to use users table, polishes integration.

---

## Event Research

### What is Fullerton Uncorked?
An annual evening tasting event featuring fine wine, craft beer, and culinary bites from local artisans. It's the flagship fundraiser for the Rotary Club of Fullerton.

### Key Facts
- **Organizer:** Rotary Club of Fullerton / Fullerton South Rotary
- **Beneficiary:** Fullerton Rotary Foundation (501(c)(3), est. 1991)
- **Charitable Impact:** Over $1.3 million in total charitable donations
- **2024 Results:** 350 guests, $70,000+ net proceeds
- **2026 Date:** October 17, 2026, 5:00 PM – 9:00 PM
- **2026 Venue:** Fullerton YMCA
- **Website:** https://www.fullertonuncorked.org/
- **Tickets:** Presale only, no door sales, limited capacity

### Committee Structure (from email research)

| Name | Role | Email | Affiliation |
|------|------|-------|-------------|
| Jordan Garcia | Event Chair | jgarcia@ymcaoc.org | Fullerton Family YMCA |
| Dan Ouweleen | Co-Chair / Operations | danrotary5320@gmail.com | RPIC Zone 26, PDG D5320 |
| Leslie McCarthy | Club President | lesliemccarthy23@gmail.com | Rotary Club of Fullerton |
| Dustin Cole | Operations / Tech | dustin.cole@datawakepartners.com | Datawake |
| Jim Williams | Vendor Coordinator | jimwilliamsins@gmail.com | |
| Cathy Gach | Treasurer / Finance | cathygach1@gmail.com | Immediate Past President |
| Patrick Hartnett | President-Elect | phartnett@hartnettlawgroup.com | Hartnett Law Group |

(Full list: 20 members — see src/lib/types.ts COMMITTEE_MEMBERS)

---

## Status Log

| Date | Action | Status |
|------|--------|--------|
| 2026-02-28 | Event research completed | Done |
| 2026-02-28 | Planning website (Project A) built and deployed | Done |
| 2026-02-28 | Neon Postgres database + Drizzle ORM added | Done |
| 2026-02-28 | Public Uncorked pages built (homepage, sponsors, vendors, about) | Done |
| 2026-02-28 | Vendor interest form + API built | Done |
| 2026-02-28 | Master Plan drafted (MASTER-PLAN.md) — unified platform architecture | Done |
| 2026-02-28 | Terminal 1: Clerk auth, 13 new DB tables, 3 layout shells, route migration | Done |
| | Terminal 2: Member Portal pages | Pending |
| | Terminal 3: Public Rotary website + CMS | Pending |
| | Terminal 4: Bryn AI integration | Pending |
| | Terminal 5: Uncorked polish + auth wiring | Pending |
