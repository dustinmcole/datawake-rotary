# Changelog

All notable changes to the Fullerton Rotary Club unified platform.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

---

## [Unreleased]

### Added
- Environment variable validation with t3-env — startup fails fast on missing/malformed config (#48)

---

## [0.1.0] — 2026-03-02

First wave of features merged to main. Foundation + core modules.

### Added
- **Dashboard loading skeletons** — portal and admin dashboards show skeleton UI while data loads (#44)
- **404 page and global error boundary** — custom not-found page and error.tsx at app root (#29)
- **Domain-based routing middleware** — Next.js middleware routes `fullertonuncorked.org` requests to `(uncorked)/*` route group (#28)
- **Membership Pipeline CRM** — admin module to track prospective members through stages (inquiry → meeting → sponsor → induction), with activity log and status management (#13)
- **SMS Broadcast System** — API stubs for admin-to-member messaging via SMS (#1)

### Fixed
- **Silent error handling** — added user-facing error feedback (toast/console) to 46 catch blocks that previously swallowed errors silently (#17)

### Infrastructure
- CI pipeline (GitHub Actions) — ESLint + TypeScript type checking on push/PR to main
- ESLint warnings resolved to zero (CI unblock)
- QA test plan framework with templates and member check-in test script
- Master plan updated with 4-product architecture and Uncorked public site spec
- Cron jobs disabled until go-live

---

## Foundation (pre-0.1.0)

Initial codebase established with:

- **Next.js 16** App Router with TypeScript
- **Clerk authentication** with RBAC (admin, club_admin, member roles)
- **Neon Postgres** database with Drizzle ORM schema and migrations
- **Four route groups:** `(rotary)`, `(uncorked)`, `(kiosk)`, and portal/admin/uncorked-hub
- **Public pages:** home, about, contact, events, join, programs, uncorked
- **Member portal:** dashboard, directory, profile, attendance, committees, events, announcements, Bryn chat
- **Admin dashboard:** members, events, attendance, committees, announcements, messaging, reports, settings, website editor, planning hub
- **Uncorked Hub:** budget, committee, meetings, sponsors, tasks, vendors, vendor interest, Bryn chat
- **Bryn AI assistant:** chat API with thread management (Anthropic Claude via Vercel AI SDK)
- **Check-in kiosk:** tablet-optimized attendance interface
- **API routes:** full CRUD for members, events, attendance, committees, announcements, budget, pages, tasks, vendor interest, membership inquiries, membership pipeline
- **Component library:** Radix UI + Tailwind CSS + shadcn/ui
