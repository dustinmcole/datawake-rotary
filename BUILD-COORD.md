# Build Coordination Log — Fullerton Rotary Unified Platform

**Purpose:** Central tracking file for all parallel build terminals. Each terminal MUST read this before starting and update it when finished.

**Rules:**
1. Read this file FIRST before doing any work
2. Check the "Completed" section to understand what's already been built
3. Check "Known Issues" for anything that affects your work
4. When you finish, add your terminal to "Completed" with a summary of what you built, files you created/modified, and any issues
5. If you encounter a problem that affects another terminal, add it to "Known Issues"
6. If you need something from another terminal that isn't done yet, add it to "Blocked / Waiting"

---

## Reference Documents

| Document | Purpose |
|----------|---------|
| MASTER-PLAN.md | Full architecture, schema, permissions, module breakdown |
| PLANNING.md | Uncorked-specific planning history + existing app architecture |
| TERMINAL-PROMPTS.md | All terminal prompt definitions |
| workspace/SOUL.md | Bryn personality |
| workspace/AGENTS.md | Bryn operating rules + config governance |
| openclaw.json | Agent runtime config |

---

## Completed

### Terminal 1: Auth & Infrastructure — DONE
- **Clerk auth** installed and configured (@clerk/nextjs ^6.39.0)
- **middleware.ts** protects /portal/*, /admin/*, /uncorked-hub/*
- **13 new DB tables** added to schema.ts (users, committees, committeeMemberships, events, eventRsvps, attendance, announcements, pages, pageVersions, chatThreads, chatMessages, membershipInquiries)
- **8 new query files** in src/lib/queries/ (users, events-club, attendance, committees-club, announcements, pages, chat, membership-inquiries)
- **Auth utility** at src/lib/auth.ts (getCurrentUser, hasRole, hasAnyRole, requireRole, requireAnyRole, isAdmin, canAccessUncorkedHub, getHighestRole)
- **3 layout shells** with sidebars:
  - Portal: src/components/layout/portal-sidebar.tsx (slate/blue)
  - Admin: src/components/layout/admin-sidebar.tsx (gray/amber)
  - Uncorked Hub: src/components/layout/uncorked-sidebar.tsx (wine/gold)
- **Route migration:** existing /admin/* pages moved to /uncorked-hub/*
- **17 placeholder pages** created for /portal/* and /admin/*
- **Login/register pages** with Clerk components
- **Root page** redirects authenticated users to /portal, unauthenticated to /login
- **.env.template** updated with Clerk vars

**Files created/modified:**
- src/middleware.ts (new)
- src/lib/auth.ts (new)
- src/lib/db/schema.ts (modified — 13 tables added)
- src/lib/queries/{users,events-club,attendance,committees-club,announcements,pages,chat,membership-inquiries}.ts (new)
- src/components/layout/{portal-sidebar,admin-sidebar,uncorked-sidebar}.tsx (new)
- src/app/portal/layout.tsx + page.tsx + 7 subpages (new)
- src/app/admin/layout.tsx + page.tsx + 8 subpages (new/modified)
- src/app/uncorked-hub/layout.tsx + all existing admin pages moved here
- src/app/login/[[...sign-in]]/page.tsx (new)
- src/app/register/[[...sign-up]]/page.tsx (new)
- src/app/layout.tsx (modified — ClerkProvider)
- src/app/page.tsx (modified — auth redirect)

### Terminal 2: Member Portal — DONE
**Portal pages built** (all replace placeholder stubs):
- `app/portal/page.tsx` — Server component dashboard: welcome message, attendance stats, next meeting card, upcoming events list, recent announcements, quick action buttons
- `app/portal/directory/page.tsx` — Client component: member card grid, search + filter, Radix Dialog profile modal with full member info
- `app/portal/profile/page.tsx` — Client component: editable profile form (phone, company, classification, bio, address, photo URL), read-only fields (name, email, roles, member since), save to `/api/members/[id]`
- `app/portal/attendance/page.tsx` — Client component: stats (rate, regular, makeups), Recharts BarChart monthly trend, history table, Radix Dialog record attendance modal (date, type, makeup club, notes)
- `app/portal/committees/page.tsx` — Client component: expandable committee cards with member list (loads on demand), "Request to Join" button, grouped by category
- `app/portal/events/page.tsx` — Client component with Radix Tabs: Upcoming tab (events with RSVP toggle), Submit Event tab (full form + submitted events list with status badges)
- `app/portal/announcements/page.tsx` — Server component: pinned first, category badges (urgent/event/committee/general), styled cards

**API routes created** (all auth-gated with Clerk):
- `api/members/route.ts` — GET (list + search/filter), POST (admin only)
- `api/members/me/route.ts` — GET current user's DB record by Clerk ID
- `api/members/[id]/route.ts` — GET, PUT (own profile or admin), DELETE (admin only)
- `api/events-club/route.ts` — GET (with `?upcoming=true` or `?status=` filters), POST (any member, pending status)
- `api/events-club/[id]/route.ts` — GET (with RSVP count), PUT/DELETE (admin only)
- `api/events-club/[id]/rsvp/route.ts` — POST (RSVP), DELETE (un-RSVP)
- `api/attendance/route.ts` — GET (own records; admin can query `?userId=`), POST (create record)
- `api/committees-club/route.ts` — GET all active committees
- `api/committees-club/[id]/route.ts` — GET with members
- `api/committees-club/[id]/join/route.ts` — POST (join committee, duplicate check)
- `api/announcements/route.ts` — GET published announcements

**Query file additions:**
- `lib/queries/events-club.ts` — Added: `getRsvpsForEvent`, `getUserRsvps`, `getRsvp`, `createRsvp`, `deleteRsvp`, `getRsvpCountForEvent`, `getEventsSubmittedBy`
- `lib/queries/attendance.ts` — Added: `getAttendanceByUserInRange`, `getRotaryYear`, `getWeeksElapsedInRotaryYear`

**Known issues / notes:**
- Profile page fetches `/api/members/me` — this endpoint exists at `api/members/me/route.ts` (static path takes Next.js precedence over `[id]`)
- RSVP count isn't pre-loaded on events list (API returns count from `GET /api/events-club/[id]` only)
- `getAttendanceRate()` in attendance queries still uses old approximation; new `getRotaryYear()` helper added alongside it

### Terminal 3: Public Website + CMS — DONE
- **Routing strategy:** Created `(rotary)` route group for all public Rotary club pages. Deleted conflicting files: `app/page.tsx` (auth redirect), `(public)/page.tsx` (Uncorked home), `(public)/about/page.tsx` (Uncorked about). The `(public)` route group still serves `/sponsors`, `/vendors`, `/vendor-interest` with the Uncorked-themed layout.
- **Custom theme colors:** Added `navy-50` through `navy-950` to globals.css (navy-700 = #003366, Rotary blue)
- **Layout components:** Created `rotary-header.tsx` (sticky white header with Rotary wheel SVG, nav links, mobile hamburger, Login CTA) and `rotary-footer.tsx` (navy-700 bg, 4-col grid: brand, quick links, meeting info, connect)
- **8 public pages** in `(rotary)/` route group:
  - `page.tsx` — Homepage: hero (navy gradient), stats (100+ years, $1.3M+, 300+), upcoming events from DB, programs grid, Uncorked callout, join CTA
  - `about/page.tsx` — Club history (est. 1924), Four-Way Test (prominent display), mission, meeting info, District 5320
  - `programs/page.tsx` — Community service, youth programs (Interact, Rotaract, Exchange, RYLA, scholarships), international service, vocational service, Rotary Foundation
  - `events/page.tsx` — Upcoming/past events from DB, category badges, empty state, weekly meeting reminder
  - `events/[slug]/page.tsx` — Event detail with generateMetadata, RSVP button, notFound() for missing events
  - `join/page.tsx` — Client component: benefits cards, membership inquiry form (POSTs to /api/membership-inquiries), FAQ accordion
  - `contact/page.tsx` — Contact info cards, Google Maps link, Rotary links
  - `uncorked/page.tsx` — Fullerton Uncorked landing: hero (navy-to-wine gradient), impact stats, what to expect, event details, sponsor logos from DB, CTAs
- **4 API routes:**
  - `api/pages/route.ts` — GET all (public: published only, admin: all), POST create (admin)
  - `api/pages/[slug]/route.ts` — GET by slug, PUT update with version history, DELETE (admin)
  - `api/pages/[slug]/versions/route.ts` — GET version history (admin)
  - `api/membership-inquiries/route.ts` — GET all (admin), POST (public, validates name+email)
- **Admin CMS** — Replaced `admin/website/page.tsx` placeholder with full CMS: page list, markdown editor with preview toggle, title/slug/meta/published controls, version history with restore, "View Live" link
- **Seed script** — `scripts/seed-pages.ts` populates 7 CMS pages (home, about, programs, events, join, contact, uncorked) with initial content. Run: `cd app && npx tsx scripts/seed-pages.ts`. Won't overwrite existing pages.
- **Middleware update** — Added public routes: `/uncorked(.*)`, `/sponsors(.*)`, `/vendors(.*)`, `/vendor-interest(.*)`, `/api/pages(.*)`, `/api/membership-inquiries` (these were missing and blocking unauthenticated access)

**Files created:**
- src/components/layout/rotary-header.tsx (new)
- src/components/layout/rotary-footer.tsx (new)
- src/app/(rotary)/layout.tsx (new)
- src/app/(rotary)/page.tsx (new — homepage)
- src/app/(rotary)/about/page.tsx (new)
- src/app/(rotary)/programs/page.tsx (new)
- src/app/(rotary)/events/page.tsx (new)
- src/app/(rotary)/events/[slug]/page.tsx (new)
- src/app/(rotary)/join/page.tsx (new)
- src/app/(rotary)/contact/page.tsx (new)
- src/app/(rotary)/uncorked/page.tsx (new)
- src/app/api/pages/route.ts (new)
- src/app/api/pages/[slug]/route.ts (new)
- src/app/api/pages/[slug]/versions/route.ts (new)
- src/app/api/membership-inquiries/route.ts (new)
- scripts/seed-pages.ts (new)

**Files modified:**
- src/app/admin/website/page.tsx (replaced placeholder with full CMS)
- src/middleware.ts (added missing public routes)
- src/app/globals.css (added navy-* color scale)

**Files deleted:**
- src/app/page.tsx (auth redirect — replaced by (rotary)/page.tsx homepage)
- src/app/(public)/page.tsx (Uncorked homepage — content moved to /uncorked)
- src/app/(public)/about/page.tsx (Uncorked about — replaced by Rotary /about)

**Routing notes for Terminal 4 (Bryn AI):**
- CMS pages are stored in the `pages` table (slug, title, content as markdown, metaDescription, published, version)
- Bryn can edit pages via `PUT /api/pages/{slug}` with `website_admin` or `super_admin` role — this auto-creates a version snapshot
- Page API is public for GET (published only), admin-gated for mutations
- The seed script (`cd app && npx tsx scripts/seed-pages.ts`) creates initial content in the DB

---

### Terminal 5: Uncorked Hub Polish + Admin Panel — DONE

**Part A: Uncorked Hub verification + polish:**
- All 8 uncorked-hub pages confirmed at correct paths (/uncorked-hub/*) — no /admin/ references found
- `uncorked-hub/layout.tsx` — Added `requireAnyRole(["super_admin", "club_admin", "uncorked_committee"])` server-side auth guard
- `uncorked-sidebar.tsx` — Added "Ask Bryn" nav item (MessageSquare icon → /uncorked-hub/bryn)
- `uncorked-hub/bryn/page.tsx` — Created Bryn placeholder page with agentContext='uncorked', tool preview cards, governance notice
- `uncorked-hub/committee/page.tsx` — Added TODO comment: replace COMMITTEE_MEMBERS hardcoded data with users table query

**Part B: Admin Panel — all pages built:**
- `admin/page.tsx` — Full dashboard: 4 KPI stats cards (members, attendance rate, pending events, new inquiries) via `/api/admin/stats`, recent members + announcements activity feed, quick action links, reports CTA strip
- `admin/members/page.tsx` — Member management: searchable/filterable table (200+ member rows), click-to-edit slide-over (all fields + role multi-select), Invite Member modal (Clerk invitation), Import CSV modal (preview + bulk create)
- `admin/events/page.tsx` — 3-tab event management (Pending/Approved/Cancelled), Approve/Reject buttons on pending events, Create/Edit event modal
- `admin/announcements/page.tsx` — CRUD with pin/unpin, publish/unpublish, category badges, filter tabs (All/Published/Drafts)
- `admin/attendance/page.tsx` — Bulk entry (date picker + member checklist with select all/none, save to bulk API), Reports tab (member list + attendance summary)
- `admin/committees/page.tsx` — Split view: committee list (left) + detail panel (right), create committee modal, add/remove members from committee
- `admin/reports/page.tsx` — 3 tabs (Membership/Attendance/Events) with Recharts PieChart (member types), LineChart (attendance trend), KPI strip; graceful empty states
- `admin/settings/page.tsx` — Club info display, integration status cards (Clerk/Neon/Vercel/Bryn/Email), Bryn governance notice, advanced section (export/version)
- `admin/website/page.tsx` — Already built by Terminal 3 (full CMS with markdown editor, version history, preview)

**Admin API routes created:**
- `api/admin/stats/route.ts` — GET: totalMembers, attendanceRate, pendingEvents, newInquiries, recentAnnouncements, recentMembers
- `api/admin/members/route.ts` — GET all users, POST create user
- `api/admin/members/[id]/route.ts` — GET, PATCH (all fields + roles), DELETE (super_admin only)
- `api/admin/members/invite/route.ts` — POST: Clerk invitation with role metadata
- `api/admin/members/import/route.ts` — POST: CSV parse (DACdb-compatible column names), preview mode, bulk insert
- `api/admin/attendance/bulk/route.ts` — POST: bulk attendance upsert (handles conflicts)
- `api/admin/events/route.ts` — GET all club events, POST create
- `api/admin/events/[id]/route.ts` — GET, PATCH (incl. approve/reject actions), DELETE
- `api/admin/announcements/route.ts` — GET all, POST create (with publish option)
- `api/admin/announcements/[id]/route.ts` — PATCH (incl. publish/unpublish actions), DELETE
- `api/admin/committees/route.ts` — GET all active, POST create
- `api/admin/committees/[id]/route.ts` — GET (with ?members=true), PATCH (incl. add_member/remove_member), no DELETE

**Auth pattern:** All admin API routes gate with `hasAnyRole(userId, ["super_admin", "club_admin"])`. Role-check uses Clerk publicMetadata.roles via `getRolesForUser()` in auth.ts.

**Design system followed:** Admin pages use gray/blue palette (bg-white cards, border-gray-200, blue-600 CTA buttons, amber-600 for admin highlights). Consistent with shared conventions.

## In Progress

### Terminal 4A: Bryn Agent Backend — ASSIGNED (Jacob)
Agent: Jacob (OpenClaw, Gemini)
Branch: `jacob/bryn-build`
Handoff: `JACOB-HANDOFF.md`
Slack: #internal-rotary (C0AGHLNCL6S)

- [ ] System prompt builder (`src/lib/bryn/system-prompt.ts`)
- [ ] Tool definitions (`src/lib/bryn/tools.ts`)
- [ ] Tool executors (`src/lib/bryn/tool-executors.ts`)
- [ ] Chat API route (`src/app/api/bryn/chat/route.ts`)
- [ ] Thread API routes (`src/app/api/bryn/threads/`)
- [ ] Audit logging (`src/lib/bryn/audit.ts`)

### Terminal 4B: Bryn Chat UI — QUEUED (Jacob, after 4A)
- [ ] Chat page (`src/app/portal/bryn/page.tsx`)
- [ ] Chat hook (`src/hooks/use-bryn-chat.ts`)
- [ ] Message components (`src/components/bryn/`)
- [ ] Floating widget (`src/components/bryn/bryn-widget.tsx`)

---

## Known Issues

_(Add any issues that affect other terminals here)_

- The old sidebar.tsx still exists at src/components/layout/sidebar.tsx with paths updated to /uncorked-hub/ but is no longer imported by any layout. Other terminals should use the new sidebar components (portal-sidebar, admin-sidebar, uncorked-sidebar).
- Terminal 3 deleted the root `app/page.tsx` (which was an auth redirect). The homepage is now always the Rotary public site at `/`. Authenticated users are NOT auto-redirected to `/portal` — they use the "Member Login" link in the header. If this behavior needs to change, it can be added back to the (rotary)/page.tsx as a conditional redirect.

---

## Blocked / Waiting

_(If your terminal needs something from another terminal, note it here)_

---

## Shared Conventions

These conventions apply to ALL terminals:

### API Routes
- Auth check: `import { auth } from '@clerk/nextjs/server'` then `const { userId } = await auth()`
- Return 401 if not authenticated: `if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })`
- Role check: `import { hasRole, hasAnyRole } from '@/lib/auth'`
- Use query functions from src/lib/queries/* — don't write raw SQL

### Components
- Tailwind CSS 4 for all styling
- Radix UI primitives for dialogs, dropdowns, tabs, etc.
- Lucide React for icons
- Recharts for charts
- cn() utility from src/lib/utils.ts for class merging

### Design Palettes
- **Portal (member):** Slate/blue — bg-slate-50, text-slate-900, accent blue-600
- **Admin:** Gray/amber — bg-gray-50, text-gray-900, accent amber-600
- **Uncorked Hub:** Wine/gold — bg-wine-950, wine-50, gold accents, cream backgrounds
- **Public Rotary site:** Rotary blue (#003366 / blue-900) + gold (#C8A951 / amber-500)

### File Naming
- Pages: src/app/{section}/page.tsx
- API routes: src/app/api/{resource}/route.ts + [id]/route.ts
- Query files: src/lib/queries/{resource}.ts
- Components: src/components/{feature}/{name}.tsx

### Database
- Use generateId() from utils.ts for primary keys
- All tables use varchar IDs, not serial/auto-increment
- JSON arrays stored as text columns (parse with JSON.parse)
- Timestamps use Drizzle's timestamp().defaultNow()

### Bryn Configuration Governance
- Bryn's configuration is managed EXCLUSIVELY by Dustin Cole through #bryn-rotary Slack
- NO admin UI for Bryn configuration — club members USE Bryn but cannot configure her
- If users ask to change Bryn's behavior: politely decline, direct to dustin@datawake.io
