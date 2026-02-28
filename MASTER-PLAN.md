# Fullerton Rotary Club — Unified Platform Master Plan

**Client:** Rotary Club of Fullerton (Fullerton South Rotary)
**Developer:** Datawake (datawake.io)
**Author:** Dustin Cole
**Created:** 2026-02-28
**Status:** ACTIVE — Build in progress

---

## Table of Contents

1. [Vision](#1-vision)
2. [What We're Replacing](#2-what-were-replacing)
3. [Unified Platform Architecture](#3-unified-platform-architecture)
4. [Authentication & Permissions (RBAC)](#4-authentication--permissions-rbac)
5. [Module Breakdown](#5-module-breakdown)
6. [Bryn AI Assistant Integration](#6-bryn-ai-assistant-integration)
7. [Database Schema](#7-database-schema)
8. [Tech Stack](#8-tech-stack)
9. [Routing & Navigation](#9-routing--navigation)
10. [Migration Strategy](#10-migration-strategy)
11. [Domain & Deployment](#11-domain--deployment)
12. [Parallel Build Plan](#12-parallel-build-plan)
13. [Open Questions](#13-open-questions)
14. [Roger Developer Agent](#14-roger-developer-agent)
15. [Status Log](#15-status-log)
16. [Planned Feature Sets](#16-planned-feature-sets)

---

## 1. Vision

One unified Next.js application that replaces **three separate systems** with a single, modern platform:

| What exists today | What replaces it |
|---|---|
| **fullertonrotaryclub.com** (Wix) | Public website — club info, events, join, programs |
| **DACdb** (legacy SaaS) | Member portal — directory, attendance, committees, profile |
| **Uncorked planning site** (standalone Vercel app) | Integrated module — accessible to Uncorked committee only |

Plus two net-new capabilities:
- **Bryn AI Assistant** — role-aware chatbot embedded in the portal that can edit the public site, pull reports, and answer questions
- **Event Submission System** — any member can submit new club events without going through a chatbot

The result: a single platform at **fullertonrotaryclub.com** that serves the public, the membership, the board, the Uncorked committee, and the website administrators — all with appropriate access controls.

---

## 2. What We're Replacing

### DACdb (current member portal)
DACdb is the standard Rotary district database. It handles:
- Member profiles and directory
- Attendance tracking and makeups
- Committee management (hierarchical, with history)
- Events calendar with registration
- Club financials and dues invoicing
- 75+ canned reports
- Mobile app (DACdb Mobile)
- RI Direct integration (Rotary International sync)

**Why replace it:** Clunky UX, generic to all Rotary clubs, no customization, can't integrate with modern tools, no AI capabilities, members don't use it because it's painful.

**What we keep from DACdb:** The data. We'll export member records (CSV) and import them into the new system. We do NOT need to replicate RI integration — that stays in DACdb/MyRotary for district compliance.

### fullertonrotaryclub.com (current Wix site)
Standard Wix site with:
- Home page with club info
- Member resources page (links to DACdb, District calendar)
- About/history
- Events
- Contact/join info

**Why replace it:** Wix is limiting, can't integrate with member portal, can't be edited by AI, costs money for no reason.

### fullertonuncorked.org (being rebuilt separately)
The public-facing Uncorked event website is being rebuilt by another agent. That stays separate for now — it has its own domain and branding. The *planning/committee coordination* site (currently at app-sigma-seven-46.vercel.app) gets absorbed into this unified platform as a permissioned module.

---

## 3. Unified Platform Architecture

```
fullertonrotaryclub.com
├── / ............................ Public homepage (editable via Bryn)
├── /about ....................... Club history, mission, Four-Way Test
├── /programs .................... Service projects, speakers, initiatives
├── /events ...................... Public events calendar (member-submitted)
├── /events/[slug] ............... Individual event page
├── /join ........................ Membership inquiry form
├── /uncorked .................... Public Uncorked landing (links to fullertonuncorked.org)
├── /contact ..................... Contact form
│
├── /login ....................... Authentication
├── /register .................... New member onboarding (invite-only)
│
├── /portal ...................... 🔒 Member Portal (authenticated)
│   ├── /portal .................. Personalized dashboard
│   ├── /portal/directory ........ Member directory (searchable)
│   ├── /portal/profile .......... Edit own profile
│   ├── /portal/attendance ....... View/record attendance, makeups
│   ├── /portal/committees ....... Browse & join committees
│   ├── /portal/events ........... Submit events, RSVP, calendar view
│   ├── /portal/announcements .... Club news and updates
│   └── /portal/bryn ............. 💬 AI assistant (role-aware)
│
├── /admin ....................... 🔒 Admin Panel (board + officers)
│   ├── /admin ................... Admin dashboard (reports, stats)
│   ├── /admin/members ........... Member management (CRUD, roles)
│   ├── /admin/attendance ........ Attendance reports, bulk entry
│   ├── /admin/committees ........ Create/manage committees
│   ├── /admin/events ............ Approve/manage events
│   ├── /admin/announcements ..... Create announcements
│   ├── /admin/website ........... CMS — edit public pages via Bryn or forms
│   ├── /admin/reports ........... Analytics, membership trends, finances
│   └── /admin/settings .......... Club settings, integrations
│
├── /uncorked-hub ................ 🔒 Uncorked Planning (committee only)
│   ├── /uncorked-hub ............ Dashboard (countdown, stats, quick actions)
│   ├── /uncorked-hub/meetings ... Meeting notes
│   ├── /uncorked-hub/tasks ...... Kanban task management
│   ├── /uncorked-hub/budget ..... Budget tracker (charts, P&L)
│   ├── /uncorked-hub/sponsors ... Sponsor CRM (pipeline, tiers)
│   ├── /uncorked-hub/vendors .... Vendor CRM (pipeline, categories)
│   ├── /uncorked-hub/committee .. Committee directory
│   └── /uncorked-hub/vendor-interest . Public submission review
│
├── /board ....................... 🔒 Board Management Portal (board members + officers)
│   ├── /board ................... Board dashboard (upcoming meetings, open action items)
│   ├── /board/meetings .......... Meeting agendas, minutes, attendance
│   ├── /board/resolutions ....... Board votes, motions, and resolutions log
│   ├── /board/documents ......... Document library (bylaws, policies, standing rules)
│   ├── /board/officers .......... Officer directory with terms and responsibilities
│   ├── /board/action-items ...... Action item tracker (assignee, due date, status)
│   ├── /board/budget ............ Annual budget overview + YTD vs budget
│   └── /board/calendar .......... Governance calendar (terms, elections, deadlines)
│
└── /api ......................... API routes
    ├── /api/auth/[...] .......... Auth endpoints
    ├── /api/members/[...] ....... Member CRUD
    ├── /api/events/[...] ........ Event CRUD
    ├── /api/attendance/[...] ..... Attendance
    ├── /api/committees/[...] ..... Committees
    ├── /api/announcements/[...] .. Announcements
    ├── /api/pages/[...] ......... CMS content
    ├── /api/bryn/[...] .......... AI chat endpoints
    ├── /api/uncorked/[...] ...... Existing Uncorked API (contacts, meetings, etc.)
    ├── /api/messaging/[...] ..... SMS broadcast (send, history, opt-outs)
    ├── /api/community-crm/[...] . External community contacts
    ├── /api/membership-pipeline/[...] . Prospect/recruitment pipeline
    └── /api/board/[...] ......... Board management data
```

**New route groups planned:**
- `(board)/` — Board Management Portal, `board_member`+ access, blue/silver palette
- Admin subpages for SMS, Community CRM, and Membership Pipeline under `/admin/*`

---

## 4. Authentication & Permissions (RBAC)

### Auth Provider: Clerk

**Why Clerk:**
- Best-in-class Next.js App Router integration
- Handles login, registration, session, MFA out of the box
- Supports invite-only registration (perfect for a club)
- Organization/role primitives built in
- Free tier covers club-sized membership (<10K MAU)
- Beautiful prebuilt components (sign-in, user profile)

### Role Hierarchy

| Role | Level | Who | Access |
|------|-------|-----|--------|
| `super_admin` | 0 | Dustin, 1-2 club officers | Everything. Manages all permissions. Bryn full control. |
| `club_admin` | 1 | President, Secretary | Member management, reports, announcements, event approval |
| `board_member` | 2 | Board of Directors | View reports, manage committees they chair |
| `website_admin` | 3 | Designated tech person(s) | Edit public website pages via CMS/Bryn |
| `uncorked_committee` | 4 | Uncorked planning team (~20 people) | Full access to Uncorked Hub |
| `committee_chair` | 5 | Committee chairs | Manage their committee, submit events |
| `member` | 6 | All active Rotary members | Portal: directory, profile, attendance, events, Bryn (basic) |
| `guest` | 7 | Prospective members | Limited portal view (public + some events) |

### Permission Matrix

| Feature | Super Admin | Club Admin | Board | Website Admin | Uncorked | Chair | Member | Guest |
|---------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Public website | Edit | View | View | Edit | View | View | View | View |
| Member directory | Full | Full | View | View | View | View | View | — |
| Own profile | Full | Full | Full | Full | Full | Full | Full | — |
| Attendance (own) | Full | Full | Full | Full | Full | Full | Full | — |
| Attendance (all) | Full | Full | View | — | — | — | — | — |
| Committees | Full | Full | Manage own | — | — | Manage own | View | — |
| Events (submit) | Full | Full | Full | Full | Full | Full | Full | — |
| Events (approve) | Full | Full | — | — | — | — | — | — |
| Announcements | Full | Full | — | — | — | — | — | — |
| Reports | Full | Full | View | — | — | — | — | — |
| Manage members | Full | Full | — | — | — | — | — | — |
| Manage roles | Full | — | — | — | — | — | — | — |
| Uncorked Hub | Full | Full | — | — | Full | — | — | — |
| Bryn (website edit) | Full | — | — | Full | — | — | — | — |
| Bryn (reports) | Full | Full | View | — | — | — | — | — |
| Bryn (basic Q&A) | Full | Full | Full | Full | Full | Full | Full | — |
| Admin panel | Full | Full | Partial | Partial | — | — | — | — |
| Settings | Full | — | — | — | — | — | — | — |
| **SMS Broadcast** | **Full** | **Full** | **—** | **—** | **—** | **—** | **—** | **—** |
| **Community CRM** | **Full** | **Full** | **View** | **—** | **—** | **—** | **—** | **—** |
| **Membership Pipeline** | **Full** | **Full** | **View** | **—** | **—** | **—** | **—** | **—** |
| **Board Portal** | **Full** | **Full** | **Full** | **—** | **—** | **—** | **—** | **—** |

### Implementation

```
Clerk Organization → "Fullerton Rotary Club"
  └── Roles defined in Clerk Dashboard
      ├── super_admin
      ├── club_admin
      ├── board_member
      ├── website_admin
      ├── uncorked_committee
      ├── committee_chair
      ├── member
      └── guest

Middleware (middleware.ts):
  - Public routes: /, /about, /programs, /events, /join, /contact, /uncorked, /login
  - Protected routes: /portal/*, /admin/*, /uncorked-hub/*
  - Role checks via Clerk's auth() + custom metadata
```

Users can have **multiple roles** (e.g., a board member who is also on the Uncorked committee). Permissions are additive — the union of all assigned roles.

---

## 5. Module Breakdown

### 5A. Public Website (replaces fullertonrotaryclub.com)

**Pages:**

| Page | Content | Editable via Bryn? |
|------|---------|:--:|
| Home | Hero, club intro, upcoming events, testimonials, CTA | Yes |
| About | Club history (est. 1924, 100+ years), mission, Four-Way Test, leadership | Yes |
| Programs | Service projects, youth programs, international work | Yes |
| Events | Public calendar with upcoming events (auto-populated from member submissions) | Auto |
| Event Detail | Individual event page with RSVP/registration link | Auto |
| Join | Membership inquiry form → stored in DB, notification to membership chair | Yes |
| Uncorked | Landing page with link to fullertonuncorked.org, sponsor logos | Yes |
| Contact | Contact form, meeting time/location, map | Yes |

**CMS Architecture:**
- Public pages stored in a `pages` database table
- Each page: slug, title, content (MDX or structured JSON blocks), metadata
- Bryn can update page content via API with `website_admin` or `super_admin` permission
- Version history (store previous versions for rollback)
- Admin UI at `/admin/website` for manual editing too

### 5B. Member Portal (replaces DACdb)

**Dashboard (`/portal`):**
- Welcome message with member name
- Next meeting date/time/location
- Upcoming events (personalized — shows committees they're on)
- Recent announcements
- Attendance summary (% this Rotary year)
- Quick actions: Record attendance, submit event, view directory

**Directory (`/portal/directory`):**
- Searchable, filterable member list
- Filter by: classification, committee, active/honorary/alumni
- Each member card: photo, name, classification, company, phone, email
- Click through to full profile
- Exportable (for authorized roles)

**My Profile (`/portal/profile`):**
- Edit own info: name, photo, company, classification, email, phone, address
- Bio / about me
- Committee memberships (read-only — managed by admin)
- Attendance record

**Attendance (`/portal/attendance`):**
- Record attendance at weekly meetings
- Record makeups (visiting other clubs, online meetings, service projects)
- View personal attendance history and rate
- Admin view: bulk attendance entry, attendance report by member

**Committees (`/portal/committees`):**
- List all club committees
- View committee members and chair
- Sign up for committees (request to join → chair/admin approves)
- Committee-specific announcements and documents

**Events (`/portal/events`):**
- **Any member can submit a new event** (no chatbot needed)
  - Form: title, date/time, location, description, category, RSVP link (optional)
  - Goes to "pending" → admin approves → appears on public calendar
- RSVP to events
- Personal event calendar (syncs with Google Calendar via iCal?)
- Past events archive

**Announcements (`/portal/announcements`):**
- Club news, updates, reminders
- Created by club_admin or super_admin
- Optionally sent via email to membership

### 5C. Uncorked Planning Hub (existing → migrated)

This is the **existing app** currently at app-sigma-seven-46.vercel.app, moved to `/uncorked-hub/*`.

**What stays the same:**
- All 7 modules (dashboard, meetings, tasks, budget, sponsors, vendors, committee)
- Wine-themed design palette
- All existing data (already in Neon PostgreSQL)

**What changes:**
- Moves from standalone app to route group within unified app
- Gets wrapped in auth middleware (requires `uncorked_committee` role or higher)
- Sidebar adapts to show both Uncorked nav and link back to main portal
- Committee members table migrates from hardcoded `types.ts` → `users` table
- `assignedTo` fields link to actual user records

### 5D. Admin Panel

**Member Management (`/admin/members`):**
- CRUD all members
- Assign/revoke roles
- Invite new members (sends Clerk invitation email)
- Import members (CSV upload from DACdb export)
- View member activity, attendance, committee history

**Attendance Reports (`/admin/attendance`):**
- Weekly attendance entry (checkbox grid)
- Attendance reports by date range, member, percentage
- Export for district reporting

**Committee Management (`/admin/committees`):**
- Create/edit/archive committees
- Assign chairs and members
- Set committee descriptions and goals

**Event Management (`/admin/events`):**
- Approve/reject member-submitted events
- Edit events
- View RSVP lists

**Website CMS (`/admin/website`):**
- Visual editor for public pages (or structured form fields)
- Preview before publish
- Version history with rollback
- Also accessible via Bryn chat for `website_admin` role

**Reports (`/admin/reports`):**
- Membership trends (new members, resignations, net growth)
- Attendance trends
- Event participation
- Committee activity
- Financial overview (link to Uncorked budget for Uncorked data)

---

### 5E. SMS Broadcast (`/admin/messaging`)

**Planned feature — not yet built.**

Authorized users can send text messages to targeted groups of members.

**Access:** `club_admin`, `super_admin` only.

**Send targets:**
- All members
- Board members only
- Specific committee members
- Members matching a filter (classification, status, etc.)
- Custom list (paste phone numbers or select from directory)

**Features:**
- Compose & preview message before sending
- Character count with MMS/SMS boundary indicator
- Scheduled sending (send now vs. schedule for specific time)
- Delivery report (sent, delivered, failed by recipient)
- Full send history with filter/search
- Opt-out management: members can reply STOP, opt-outs respected and tracked
- Opt-in confirmation for new members (first text includes opt-out instructions)

**Tech:** Twilio (SMS/MMS). Webhook handler for delivery receipts and STOP replies.

**DB Tables:** `text_broadcasts`, `text_broadcast_recipients`, `text_opt_outs`

**Constraints:**
- Cannot send to opted-out numbers
- Must comply with TCPA (prior consent — members implicitly consent as part of registration acknowledgment)
- Rate limiting to prevent accidental mass sends

---

### 5F. Community CRM (`/admin/community-crm`)

**Planned feature — not yet built.**

A lightweight CRM for tracking community contacts — people the club engages with who are not (yet) members. Think community partners, event guests, local business contacts, referrals, past speakers, etc.

**Access:** `club_admin`, `super_admin` can edit. `board_member` can view.

**Contact record fields:**
- Name, email, phone, company/org, title
- Type: community partner, event guest, speaker, referral, business contact, other
- Tags (freeform)
- Source (how did we meet them?)
- Notes / relationship history
- Status: cold, warm, active, inactive
- Assigned to (which member manages this relationship?)
- Last contact date

**Features:**
- Contact list with search, filter by type/status/tags
- Timeline/activity log per contact (notes, calls, emails, meetings)
- Add activity: log a touchpoint manually
- Bulk import (CSV)
- Export to CSV
- Relationship linkage: can flag a community contact as "referred by [member]"
- Handoff: if a community contact becomes a prospective member, promote them to the Membership Pipeline

**DB Tables:** `community_contacts`, `community_contact_activities`

---

### 5G. Membership Pipeline / Recruitment CRM (`/admin/membership-pipeline`)

**Planned feature — not yet built.**

A CRM specifically for tracking prospective members through the Rotary induction pipeline. Separate from the general Community CRM because it has a defined stage-gated process.

**Access:** `club_admin`, `super_admin` can edit. `board_member` can view. Potentially a future `membership_chair` role.

**Pipeline stages:**
1. **Identified** — Someone flagged as a potential member
2. **Reached Out** — Initial contact made
3. **Visited** — Attended a meeting as a guest
4. **Sponsor Found** — An existing member agreed to sponsor them
5. **Application Submitted** — Formal application received
6. **Board Approved** — Board voted to approve
7. **Inducted** — New member! (triggers creation of member account)
8. **Declined / Withdrawn** — Didn't proceed (track reason)

**Prospect record fields:**
- Name, email, phone, company, classification (proposed Rotary classification)
- Source: member referral, walk-in, community event, web inquiry
- Referred by (link to existing member)
- Sponsor (assigned sponsor/champion — existing member)
- Current stage
- Stage history with dates and notes
- Next action + due date
- Notes

**Features:**
- Kanban board view (drag cards across pipeline stages)
- List view with filters (by stage, sponsor, date, classification)
- Activity log per prospect
- Assign sponsor to prospect
- "Convert to Member" action at Inducted stage (creates user + sends Clerk invite)
- Pull from Membership Inquiries: incoming `/join` form submissions can be promoted to pipeline
- Pull from Community CRM: community contacts can be promoted to pipeline
- Reports: conversion rates, time-in-stage, source attribution

**DB Tables:** `prospects`, `prospect_activities`

---

### 5H. Board Management Portal (`/board/*`)

**Planned feature — not yet built.**

A dedicated board-only space for governance and operations — similar in spirit to the Uncorked Planning Hub, but for the board of directors. Separate route group with its own layout and design.

**Access:** `board_member`, `club_admin`, `super_admin`. Members cannot access.

**Design:** Professional/civic palette — blue/silver/white, formal feel. Not the warm community palette of the portal.

**Modules:**

**Dashboard (`/board`):**
- Upcoming board meetings
- Open action items (mine + all)
- Pending resolutions for vote
- Officer terms ending within 60 days
- Quick links to documents and minutes

**Meetings (`/board/meetings`):**
- Meeting list (past and upcoming)
- Per meeting: agenda, attendees, minutes (rich text), attachments
- Create meeting, generate agenda template
- Mark attendance for board members
- Extract action items from meeting notes (Bryn integration)

**Resolutions & Voting (`/board/resolutions`):**
- Log of board motions, votes, and outcomes
- Fields: motion text, mover, seconder, vote count (Y/N/Abstain), outcome, meeting date
- Searchable history

**Documents (`/board/documents`):**
- Categorized library: Bylaws, Standing Rules, Policies, Minutes Archive, Templates
- Upload, version, download
- Public vs. board-only visibility flag

**Officers (`/board/officers`):**
- Directory of current officers with photos, titles, terms, and contact info
- Historical officer list (past presidents, etc.)
- Term calendar: who's up for re-election and when

**Action Items (`/board/action-items`):**
- Kanban or list view of all open board action items
- Assignee, due date, source meeting, status (open, in progress, done, deferred)
- My items vs. all items toggle

**Budget (`/board/budget`):**
- Annual budget by category (admin, programs, service, fundraising, Uncorked)
- YTD actuals vs. budget (manual entry or future integration)
- Surplus/deficit tracking

**Governance Calendar (`/board/calendar`):**
- Annual governance timeline: elections, officer transitions, district deadlines, reporting dates
- Integration with club events calendar

**DB Tables:** `board_meetings`, `board_meeting_attendees`, `board_resolutions`, `board_documents`, `board_action_items`, `officer_terms`

---

## 6. Bryn AI Assistant Integration

### Architecture

```
User (in portal) → Chat Widget → /api/bryn/chat → Anthropic API
                                       ↓
                                 Role-based tool selection
                                       ↓
                              Tool calls → Database / CMS / Reports
                                       ↓
                                 Response back to user
```

### How It Works

Bryn is an **embedded chat widget** in the portal sidebar (or a dedicated `/portal/bryn` page). When a user opens it, the system:

1. Identifies the user's roles via Clerk session
2. Constructs a system prompt that includes:
   - Bryn's personality (from SOUL.md)
   - The user's name, role, permissions
   - Available tools (filtered by role)
3. Streams responses from the Anthropic API
4. Executes tool calls server-side (the user never gets direct DB access)

### Role-Based Tool Access

| Tool | Description | Required Role |
|------|-------------|---------------|
| `search_directory` | Search member directory | member+ |
| `get_upcoming_events` | List upcoming events | member+ |
| `get_my_attendance` | View own attendance record | member+ |
| `get_club_info` | General club info and FAQ | member+ |
| `get_committee_info` | Committee details and members | member+ |
| `edit_public_page` | Modify public website content | website_admin, super_admin |
| `get_attendance_report` | Pull attendance reports | club_admin, super_admin |
| `get_membership_report` | Membership analytics | club_admin, super_admin |
| `search_sponsors` | Search Uncorked sponsors | uncorked_committee+ |
| `search_vendors` | Search Uncorked vendors | uncorked_committee+ |
| `create_announcement` | Draft an announcement | club_admin, super_admin |
| `manage_event` | Edit/approve events | club_admin, super_admin |

### Chat Persistence
- Chat history stored in DB (per user)
- Conversations organized by thread
- Users can start new threads or continue existing ones

### Implementation
- **Model:** Claude Sonnet 4.6 for chat, Claude Opus 4.6 for complex reasoning
- **API:** Anthropic Messages API with streaming
- **Tools:** Defined as Anthropic tool-use functions
- **Safety:** All mutations require confirmation ("I'll update the About page. Here's the preview — shall I publish?")
- **Widget:** Custom React component, not a third-party widget

---

## 7. Database Schema

### Existing Tables (Uncorked — keep as-is)
- `contacts` — sponsors + vendors
- `activities` — contact activity log
- `meetings` — Uncorked meeting notes
- `action_items` — meeting action items
- `tasks` — Uncorked task management
- `budget_items` — Uncorked budget
- `vendor_interest_submissions` — public vendor form
- `event_config` — Uncorked event settings

### New Tables

```sql
-- ============================================
-- users — extends Clerk user data
-- ============================================
CREATE TABLE users (
  id VARCHAR(128) PRIMARY KEY,           -- Clerk user ID
  clerk_id VARCHAR(256) UNIQUE NOT NULL, -- Clerk external ID
  email VARCHAR(256) NOT NULL,
  first_name VARCHAR(128) NOT NULL DEFAULT '',
  last_name VARCHAR(128) NOT NULL DEFAULT '',
  photo_url VARCHAR(1024),
  phone VARCHAR(64) DEFAULT '',
  company VARCHAR(256) DEFAULT '',
  classification VARCHAR(128) DEFAULT '', -- Rotary classification (e.g., "Attorney", "Real Estate")
  bio TEXT DEFAULT '',
  address VARCHAR(512) DEFAULT '',
  member_since DATE,                     -- Date joined Rotary
  member_type VARCHAR(32) DEFAULT 'active', -- active, honorary, alumni, leave, prospect
  status VARCHAR(32) DEFAULT 'active',   -- active, inactive, suspended
  roles TEXT DEFAULT '["member"]',       -- JSON array of role strings
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- committees
-- ============================================
CREATE TABLE committees (
  id VARCHAR(128) PRIMARY KEY,
  name VARCHAR(256) NOT NULL,
  description TEXT DEFAULT '',
  chair_user_id VARCHAR(128) REFERENCES users(id),
  category VARCHAR(64) DEFAULT 'standing', -- standing, special, ad_hoc
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- committee_memberships
-- ============================================
CREATE TABLE committee_memberships (
  id VARCHAR(128) PRIMARY KEY,
  committee_id VARCHAR(128) NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  user_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(32) DEFAULT 'member', -- chair, co-chair, member
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(committee_id, user_id)
);

-- ============================================
-- events — club events (member-submitted)
-- ============================================
CREATE TABLE events (
  id VARCHAR(128) PRIMARY KEY,
  title VARCHAR(512) NOT NULL,
  description TEXT DEFAULT '',
  date VARCHAR(16) NOT NULL,             -- 'YYYY-MM-DD'
  start_time VARCHAR(8) DEFAULT '',      -- 'HH:MM'
  end_time VARCHAR(8) DEFAULT '',
  location VARCHAR(512) DEFAULT '',
  category VARCHAR(64) DEFAULT 'general', -- meeting, service, social, fundraiser, speaker, general
  rsvp_url VARCHAR(1024) DEFAULT '',
  is_public BOOLEAN DEFAULT FALSE,       -- Show on public website?
  status VARCHAR(32) DEFAULT 'pending',  -- pending, approved, cancelled
  submitted_by VARCHAR(128) REFERENCES users(id),
  approved_by VARCHAR(128) REFERENCES users(id),
  slug VARCHAR(256),
  image_url VARCHAR(1024),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- event_rsvps
-- ============================================
CREATE TABLE event_rsvps (
  id VARCHAR(128) PRIMARY KEY,
  event_id VARCHAR(128) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(32) DEFAULT 'attending', -- attending, maybe, declined
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- ============================================
-- attendance — weekly meeting attendance
-- ============================================
CREATE TABLE attendance (
  id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date VARCHAR(16) NOT NULL,             -- 'YYYY-MM-DD'
  type VARCHAR(32) DEFAULT 'regular',    -- regular, makeup, online, service
  makeup_club VARCHAR(256),              -- If makeup, which club?
  notes TEXT DEFAULT '',
  recorded_by VARCHAR(128) REFERENCES users(id), -- Who entered this
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date, type)
);

-- ============================================
-- announcements
-- ============================================
CREATE TABLE announcements (
  id VARCHAR(128) PRIMARY KEY,
  title VARCHAR(512) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(64) DEFAULT 'general', -- general, urgent, event, committee
  author_id VARCHAR(128) REFERENCES users(id),
  pinned BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- pages — CMS for public website
-- ============================================
CREATE TABLE pages (
  id VARCHAR(128) PRIMARY KEY,
  slug VARCHAR(256) UNIQUE NOT NULL,     -- e.g., 'home', 'about', 'programs'
  title VARCHAR(512) NOT NULL,
  content TEXT NOT NULL DEFAULT '',       -- MDX or structured JSON
  meta_description VARCHAR(512) DEFAULT '',
  published BOOLEAN DEFAULT TRUE,
  updated_by VARCHAR(128) REFERENCES users(id),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- page_versions — CMS version history
-- ============================================
CREATE TABLE page_versions (
  id VARCHAR(128) PRIMARY KEY,
  page_id VARCHAR(128) NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  version INTEGER NOT NULL,
  edited_by VARCHAR(128) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- chat_threads — Bryn conversations
-- ============================================
CREATE TABLE chat_threads (
  id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(256) DEFAULT 'New conversation',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- chat_messages — individual messages
-- ============================================
CREATE TABLE chat_messages (
  id VARCHAR(128) PRIMARY KEY,
  thread_id VARCHAR(128) NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  role VARCHAR(16) NOT NULL,             -- 'user' | 'assistant'
  content TEXT NOT NULL,
  tool_calls TEXT,                        -- JSON: tool calls made (for audit)
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- membership_inquiries — public join form
-- ============================================
CREATE TABLE membership_inquiries (
  id VARCHAR(128) PRIMARY KEY,
  name VARCHAR(256) NOT NULL,
  email VARCHAR(256) NOT NULL,
  phone VARCHAR(64) DEFAULT '',
  company VARCHAR(256) DEFAULT '',
  classification VARCHAR(128) DEFAULT '',
  reason TEXT DEFAULT '',
  referred_by VARCHAR(256) DEFAULT '',
  status VARCHAR(32) DEFAULT 'new',      -- new, contacted, invited, declined
  processed_by VARCHAR(128) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Total Tables: 21 (current) + 17 planned
- 8 existing (Uncorked)
- 13 built (platform + member portal + CMS + AI)
- 17 planned (SMS, Community CRM, Membership Pipeline, Board Portal — see Section 16)

### Planned Tables (new feature sets)

```sql
-- ============================================
-- SMS Broadcast (Section 16A)
-- ============================================
CREATE TABLE text_broadcasts (
  id VARCHAR(128) PRIMARY KEY,
  subject VARCHAR(256) DEFAULT '',          -- internal label
  body TEXT NOT NULL,                        -- SMS message text
  target_type VARCHAR(64) NOT NULL,          -- all_members, board, committee, custom
  target_filter TEXT DEFAULT '',             -- JSON: filter criteria or comma-sep IDs
  status VARCHAR(32) DEFAULT 'draft',        -- draft, scheduled, sending, sent, failed
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  sent_by VARCHAR(128) REFERENCES users(id),
  total_recipients INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE text_broadcast_recipients (
  id VARCHAR(128) PRIMARY KEY,
  broadcast_id VARCHAR(128) NOT NULL REFERENCES text_broadcasts(id) ON DELETE CASCADE,
  user_id VARCHAR(128) REFERENCES users(id),
  phone VARCHAR(32) NOT NULL,
  status VARCHAR(32) DEFAULT 'pending',      -- pending, sent, delivered, failed, opted_out
  twilio_sid VARCHAR(128),
  error_message TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE text_opt_outs (
  id VARCHAR(128) PRIMARY KEY,
  phone VARCHAR(32) UNIQUE NOT NULL,
  user_id VARCHAR(128) REFERENCES users(id),
  opted_out_at TIMESTAMP DEFAULT NOW(),
  reason VARCHAR(64) DEFAULT 'STOP'          -- STOP, admin_remove, user_request
);

-- ============================================
-- Community CRM (Section 16B)
-- ============================================
CREATE TABLE community_contacts (
  id VARCHAR(128) PRIMARY KEY,
  first_name VARCHAR(128) NOT NULL,
  last_name VARCHAR(128) NOT NULL,
  email VARCHAR(256) DEFAULT '',
  phone VARCHAR(64) DEFAULT '',
  company VARCHAR(256) DEFAULT '',
  title VARCHAR(128) DEFAULT '',
  contact_type VARCHAR(64) DEFAULT 'other',  -- community_partner, event_guest, speaker, referral, business, other
  tags TEXT DEFAULT '[]',                    -- JSON array
  source VARCHAR(256) DEFAULT '',
  status VARCHAR(32) DEFAULT 'warm',         -- cold, warm, active, inactive
  assigned_to VARCHAR(128) REFERENCES users(id),
  referred_by VARCHAR(128) REFERENCES users(id),
  notes TEXT DEFAULT '',
  last_contact_date DATE,
  created_by VARCHAR(128) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE community_contact_activities (
  id VARCHAR(128) PRIMARY KEY,
  contact_id VARCHAR(128) NOT NULL REFERENCES community_contacts(id) ON DELETE CASCADE,
  activity_type VARCHAR(64) NOT NULL,        -- note, call, email, meeting, event, other
  description TEXT NOT NULL,
  activity_date DATE NOT NULL,
  logged_by VARCHAR(128) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Membership Pipeline (Section 16C)
-- ============================================
CREATE TABLE prospects (
  id VARCHAR(128) PRIMARY KEY,
  first_name VARCHAR(128) NOT NULL,
  last_name VARCHAR(128) NOT NULL,
  email VARCHAR(256) DEFAULT '',
  phone VARCHAR(64) DEFAULT '',
  company VARCHAR(256) DEFAULT '',
  classification VARCHAR(128) DEFAULT '',    -- proposed Rotary classification
  source VARCHAR(64) DEFAULT 'referral',     -- referral, walk_in, community_event, web_inquiry, crm_import
  referred_by VARCHAR(128) REFERENCES users(id),
  sponsor_id VARCHAR(128) REFERENCES users(id),
  stage VARCHAR(64) DEFAULT 'identified',   -- identified, reached_out, visited, sponsor_found, applied, board_approved, inducted, declined
  stage_updated_at TIMESTAMP DEFAULT NOW(),
  next_action TEXT DEFAULT '',
  next_action_due DATE,
  converted_user_id VARCHAR(128) REFERENCES users(id), -- set when inducted
  source_inquiry_id VARCHAR(128),            -- FK to membership_inquiries if from web form
  source_contact_id VARCHAR(128),            -- FK to community_contacts if promoted from CRM
  notes TEXT DEFAULT '',
  created_by VARCHAR(128) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE prospect_activities (
  id VARCHAR(128) PRIMARY KEY,
  prospect_id VARCHAR(128) NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  activity_type VARCHAR(64) NOT NULL,        -- stage_change, note, call, email, meeting, visit, other
  from_stage VARCHAR(64),
  to_stage VARCHAR(64),
  description TEXT NOT NULL,
  activity_date DATE NOT NULL,
  logged_by VARCHAR(128) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Board Management Portal (Section 16D)
-- ============================================
CREATE TABLE board_meetings (
  id VARCHAR(128) PRIMARY KEY,
  title VARCHAR(256) NOT NULL,
  meeting_date DATE NOT NULL,
  start_time VARCHAR(8) DEFAULT '',
  location VARCHAR(512) DEFAULT '',
  agenda TEXT DEFAULT '',                    -- markdown
  minutes TEXT DEFAULT '',                   -- markdown
  status VARCHAR(32) DEFAULT 'scheduled',   -- scheduled, completed, cancelled
  created_by VARCHAR(128) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE board_meeting_attendees (
  id VARCHAR(128) PRIMARY KEY,
  meeting_id VARCHAR(128) NOT NULL REFERENCES board_meetings(id) ON DELETE CASCADE,
  user_id VARCHAR(128) NOT NULL REFERENCES users(id),
  attended BOOLEAN DEFAULT FALSE,
  UNIQUE(meeting_id, user_id)
);

CREATE TABLE board_resolutions (
  id VARCHAR(128) PRIMARY KEY,
  meeting_id VARCHAR(128) REFERENCES board_meetings(id),
  motion_text TEXT NOT NULL,
  mover_id VARCHAR(128) REFERENCES users(id),
  seconder_id VARCHAR(128) REFERENCES users(id),
  votes_yes INTEGER DEFAULT 0,
  votes_no INTEGER DEFAULT 0,
  votes_abstain INTEGER DEFAULT 0,
  outcome VARCHAR(32) DEFAULT 'pending',     -- passed, failed, tabled, withdrawn, pending
  notes TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE board_documents (
  id VARCHAR(128) PRIMARY KEY,
  title VARCHAR(512) NOT NULL,
  category VARCHAR(64) DEFAULT 'general',   -- bylaws, standing_rules, policies, minutes, templates, general
  description TEXT DEFAULT '',
  file_url VARCHAR(1024) NOT NULL,           -- hosted file URL (Vercel Blob or similar)
  file_name VARCHAR(256) NOT NULL,
  file_size INTEGER,
  visibility VARCHAR(32) DEFAULT 'board',   -- board, members, public
  version INTEGER DEFAULT 1,
  uploaded_by VARCHAR(128) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE board_action_items (
  id VARCHAR(128) PRIMARY KEY,
  title VARCHAR(512) NOT NULL,
  description TEXT DEFAULT '',
  assignee_id VARCHAR(128) REFERENCES users(id),
  source_meeting_id VARCHAR(128) REFERENCES board_meetings(id),
  status VARCHAR(32) DEFAULT 'open',        -- open, in_progress, done, deferred
  due_date DATE,
  completed_at TIMESTAMP,
  created_by VARCHAR(128) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE officer_terms (
  id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL REFERENCES users(id),
  title VARCHAR(128) NOT NULL,               -- President, VP, Secretary, Treasurer, Sergeant-at-Arms, etc.
  start_date DATE NOT NULL,
  end_date DATE,
  active BOOLEAN DEFAULT TRUE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 8. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16 (App Router) | Already in use |
| Language | TypeScript | Already in use |
| Styling | Tailwind CSS 4 | Already in use |
| UI Components | Radix UI + custom | Already in use |
| Charts | Recharts | Already in use |
| Icons | Lucide React | Already in use |
| Database | Neon PostgreSQL | Already in use |
| ORM | Drizzle ORM | Already in use |
| Auth | Clerk | NEW — @clerk/nextjs |
| AI | Anthropic Claude API | NEW — @anthropic-ai/sdk |
| AI Streaming | Vercel AI SDK | NEW — ai + @ai-sdk/anthropic |
| Rich Text | Tiptap or MDXRemote | NEW — for CMS pages |
| Date Utilities | date-fns | Already in use |
| Email (optional) | Resend or React Email | NEW — for announcements |
| SMS | Twilio | PLANNED — SMS broadcast feature |
| File Storage | Vercel Blob | PLANNED — board document uploads |
| Hosting | Vercel | Already in use |
| Domain | fullertonrotaryclub.com | Needs DNS transfer from Wix |

### Current Dependencies (added)
```
@clerk/nextjs           # Auth
ai                      # Vercel AI SDK (streaming)
@ai-sdk/anthropic       # Anthropic provider for AI SDK
```

### Planned Dependencies (new feature sets)
```
twilio                  # SMS broadcast (Section 16A)
@vercel/blob            # Board document file storage (Section 16D)
resend                  # Transactional email — announcements, invite confirmations
@tiptap/react           # Rich text editor — board meeting agendas/minutes
@tiptap/starter-kit     # Tiptap extensions
```

---

## 9. Routing & Navigation

### Public Navigation (header)
```
[Logo] Fullerton Rotary Club    Home | About | Programs | Events | Join | Contact    [Login]
```

### Member Portal Navigation (sidebar)
```
[Logo] Fullerton Rotary
─────────────────────────
📊 Dashboard
👥 Directory
👤 My Profile
✅ Attendance
🏛️ Committees
📅 Events
📢 Announcements
💬 Ask Bryn
─────────────────────────
[Admin ▸]          (if admin role)
[Uncorked Hub ▸]   (if uncorked role)
─────────────────────────
Settings | Sign Out
```

### Admin Navigation (sidebar — extends portal)
```
[Logo] Admin Panel
─────────────────────────
📊 Admin Dashboard
👥 Members
✅ Attendance Reports
🏛️ Committees
📅 Events (manage)
📢 Announcements
🌐 Website (CMS)
📈 Reports
⚙️ Settings
─────────────────────────
[← Back to Portal]
```

### Uncorked Hub Navigation (sidebar — wine theme)
```
[🍷] Fullerton Uncorked 2026
Oct 17 • 5-9 PM
─────────────────────────
📊 Dashboard
📝 Meeting Notes
✅ Tasks
💰 Budget
🤝 Sponsors
🍽️ Vendors
👥 Committee
📋 Vendor Applications
─────────────────────────
[← Back to Portal]
```

### Board Portal Navigation (sidebar — blue/silver, planned)
```
[🏛️] Board Portal
Fullerton Rotary Club
─────────────────────────
📊 Dashboard
📅 Meetings
📜 Resolutions
📁 Documents
👔 Officers
✅ Action Items
💰 Budget
🗓️ Governance Calendar
─────────────────────────
[← Back to Portal]
```

### Admin Navigation additions (planned)
```
[existing admin nav items...]
─────────────────────────
📱 Messaging (SMS)
🏘️ Community CRM
🎯 Membership Pipeline
```

### Design System

**Public site:** Clean, professional Rotary blue/gold palette. Think modern nonprofit — welcoming, trustworthy, community-focused.

**Member portal:** Neutral/professional palette. Cards, clean tables, good spacing. Think modern SaaS dashboard.

**Uncorked Hub:** Existing wine-themed palette (wine-950 through wine-50, gold accents, cream backgrounds). This is already built and beautiful — keep it.

**Bryn chat:** Minimal, floating widget OR dedicated page. Datawake branded subtly.

---

## 10. Migration Strategy

### Phase 1: Foundation (auth + database + routing)
1. Install Clerk, set up organization, configure roles
2. Add middleware.ts with route protection
3. Run Drizzle migrations for new tables
4. Set up unified layout with three navigation contexts (public, portal, admin)
5. Move existing Uncorked routes to `/uncorked-hub/*`

### Phase 2: Member Portal
1. Build user profile sync (Clerk → users table)
2. Import DACdb members (CSV → users table)
3. Build directory, profile, attendance, committees, events
4. Build announcements system

### Phase 3: Public Website
1. Seed CMS pages table with content (scraped from current Wix site + improvements)
2. Build public page rendering (MDX/JSON → React)
3. Build public event listing (from approved events)
4. Build join/contact forms
5. DNS cutover: fullertonrotaryclub.com → Vercel

### Phase 4: Bryn AI
1. Build chat API routes with Anthropic tool use
2. Define tool functions (directory search, page edit, reports, etc.)
3. Build chat UI widget
4. Connect role-based tool filtering
5. Test with different user roles

### Phase 5: Polish & Launch
1. Mobile responsive pass on all new pages
2. Loading states, error boundaries
3. Email notifications (optional)
4. DACdb data import script
5. User acceptance testing with club leadership
6. DNS cutover and launch

---

## 11. Domain & Deployment

### Domain Plan
| Domain | Points to | Purpose |
|--------|-----------|---------|
| fullertonrotaryclub.com | Vercel (unified app) | Main platform |
| fullertonuncorked.org | Separate deployment | Public Uncorked site (managed by other agent) |
| app-sigma-seven-46.vercel.app | Redirect to fullertonrotaryclub.com/uncorked-hub | Legacy Uncorked planning URL |

### DNS Migration
1. Current: fullertonrotaryclub.com → Wix
2. Target: fullertonrotaryclub.com → Vercel
3. Need: Access to domain registrar (who controls DNS? Wix? GoDaddy? Confirm with Leslie/Dan)

### Environment Variables (add to existing .env)
```
# Existing
DATABASE_URL=...
ANTHROPIC_API_KEY=...

# New — Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/portal
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/portal

# New — Email (optional)
RESEND_API_KEY=re_...

# Planned — SMS Broadcast (Section 16A)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

---

## 12. Parallel Build Plan

Work split across **6 Claude Code terminals** (T4 was split into T4A backend + T4B UI). Full prompts in TERMINAL-PROMPTS.md. Coordination tracked in BUILD-COORD.md.

### Terminal 1: Auth & Infrastructure — DONE
```
Focus: Clerk setup, middleware, RBAC, database migrations, unified layout shell
Files: middleware.ts, layout files, db/schema.ts (13 new tables), lib/auth.ts
Model: Opus
```

### Terminal 2: Member Portal — DONE
```
Focus: /portal/* routes — dashboard, directory, profile, attendance, committees, events, announcements
Files: app/portal/**, api/members/**, api/attendance/**, api/events/**, api/committees/**
Model: Sonnet
```

### Terminal 3: Public Website + CMS — DONE
```
Focus: (rotary)/* public pages, Rotary header/footer, CMS system, page rendering, join form, contact form
Files: app/(rotary)/**, api/pages/**, api/membership-inquiries/**, components/layout/rotary-{header,footer}.tsx
Model: Opus
Note: Created 8 public Rotary pages, 4 API routes, full admin CMS editor, seed script
```

### Terminal 4A: Bryn Agent Backend — NEXT
```
Focus: System prompt builder from workspace files, 16+ tools with role filtering, 4 agent contexts, Vercel Cron routes, audit logging
Files: api/bryn/**, lib/bryn/**, api/cron/**
Model: Opus
Depends on: T1 (auth), T3 (CMS pages API)
```

### Terminal 4B: Bryn Chat UI — AFTER 4A
```
Focus: Dedicated /portal/bryn chat page, floating widget, react-markdown rendering, shared hooks
Files: app/portal/bryn/**, components/bryn/**
Model: Sonnet
Depends on: T4A (chat API)
```

### Terminal 5: Uncorked Migration + Admin Panel — DONE
```
Focus: Verify uncorked-hub migration, build admin pages, wire up auth
Files: app/uncorked-hub/**, app/admin/**
Model: Sonnet
```

### Execution Order (actual)
```
Wave 1:  T1 (auth + infrastructure) — DONE
Wave 2:  T2 (portal) + T3 (public site) + T5 (uncorked/admin) in parallel — ALL DONE
Wave 3:  T4A (Bryn backend) — NEXT
Wave 4:  T4B (Bryn chat UI) — AFTER 4A
```

### Key Notes
- **No Slack/ClickUp for Rotary** — Bryn operates through web interface only. Cron outputs go to platform announcements table, not Slack.
- **4 Bryn agent contexts**: member (basic Q&A), website (page editing), operations (reports/announcements), uncorked (sponsors/vendors/budget) — each with role-filtered tools
- **Bryn config governance**: Configuration managed exclusively by Dustin Cole through Datawake Slack #bryn-rotary. No club member or admin can modify Bryn's config. See workspace/AGENTS.md § Configuration Governance.

---

## 13. Open Questions

### Resolved

| # | Question | Decision | Date |
|---|----------|----------|------|
| 1 | Auth provider | **Clerk** — best Next.js DX, free tier covers 300 members | 2026-02-28 |
| 2 | Domain DNS | **Dustin can handle DNS** — will point fullertonrotaryclub.com to Vercel | 2026-02-28 |
| 5 | Member count | **~300 active members** — well within Clerk free tier (10K MAU) | 2026-02-28 |
| 8 | RI/District compliance | **Supplement DACdb** — keep DACdb for RI/district reporting, our platform for day-to-day | 2026-02-28 |
| 10 | Public website content | **Scrape + improve** — pull existing Wix content, rewrite better, fill gaps | 2026-02-28 |

### Still Open (can decide during build)

3. **DACdb data export:** Can you get a CSV export of current members from DACdb? We need: name, email, phone, company, classification, join date, committee assignments, member type.

4. **Club officer buy-in:** Does the club leadership know about this project? We need someone (Leslie? Patrick?) to validate the feature list and eventually test it.

6. **Email notifications:** Should announcements go out via email too? If so, we need Resend (or similar). Or is Slack sufficient for now?

7. **Attendance entry:** Who enters attendance? Is it self-reported (members check in) or does the secretary enter it after each meeting? Or both?

9. **Google Calendar sync:** Should events sync to a Google Calendar? This is a nice-to-have but adds complexity.

### Nice-to-Have (future)

11. **Mobile app:** PWA (progressive web app) or just responsive web? PWA gives "add to home screen" capability.

12. **Payment integration:** For event tickets, dues, donations — Stripe? Or keep using Givsum/Zeffy?

13. **Speaker program:** Should there be a module for scheduling weekly speakers? (Many Rotary clubs have a speaker coordinator.)

---

## 14. Roger Developer Agent

### Purpose

Roger is a **super_admin-only developer agent** built into the Planning Hub at `/admin/planning`. While Bryn serves club members with a warm, service-oriented personality, Roger serves platform developers with direct, technical communication.

### How Roger Differs from Bryn

| Aspect | Bryn | Roger |
|--------|------|-------|
| **Audience** | All members (role-filtered) | super_admin only |
| **Personality** | Warm, service-oriented, "we" language | Direct, technical, no-fluff |
| **Contexts** | member, website, operations, uncorked | developer (single context) |
| **Tools** | 17 (read + write, confirmation-gated) | 5 (read-only) |
| **Access** | Portal (/portal/bryn) + Uncorked Hub | Admin only (/admin/planning, Roger tab) |
| **Thread Persistence** | Yes (DB-backed threads) | No (session-only, v1) |
| **Model** | Claude Sonnet 4.6 | Claude Sonnet 4.6 |

### Roger's Tools (5)

| Tool | Description | Access |
|------|-------------|--------|
| `query_database` | Execute read-only SQL (SELECT/WITH only, 100 row limit) | Read-only |
| `get_table_stats` | Row counts for all 20 database tables | Read-only |
| `get_table_schema` | Column info for a specific table (via information_schema) | Read-only |
| `get_environment_status` | Which env vars are set (boolean only, never values) | Read-only |
| `get_platform_config` | Platform config summary (stack, routes, roles, agents) | Read-only |

### Security

- **Auth gate:** Clerk `auth()` + `hasRole(userId, "super_admin")` — returns 403 for non-super_admin
- **Read-only:** All tools are read-only. Write operations blocked at query level.
- **Query validation:** `query_database` validates SELECT/WITH prefix, blocks INSERT/UPDATE/DELETE/DROP/ALTER/TRUNCATE/CREATE/GRANT/REVOKE keywords, wraps in subquery for safe LIMIT enforcement
- **No env exposure:** Environment status returns booleans only, never actual values

### Key Files

```
src/lib/roger/system-prompt.ts     — Roger's system prompt builder
src/lib/roger/tools.ts             — 5 tool definitions (Vercel AI SDK)
src/lib/roger/tool-executors.ts    — Tool implementation (DB queries, config)
src/app/api/roger/chat/route.ts    — Streaming chat API (super_admin gated)
src/hooks/use-roger-chat.ts        — Client chat hook (SSE streaming)
src/components/roger/chat-message.tsx — Chat message component
src/app/admin/planning/_components/roger-chat-tab.tsx — Roger tab UI
```

### Planning Hub Overview

The Planning Hub (`/admin/planning`) is a super_admin-only command center with 6 tabs:

| Tab | Content | Data Source |
|-----|---------|-------------|
| Roles & Permissions | RBAC matrix, role hierarchy, route access | Static |
| Build Status | 5 terminal cards, module checklist, progress | Static |
| Bryn Config | Identity, personality, tools by context, agent rules | Static |
| Environment | Deployment info, integration status, env var checklist | Live API |
| Analytics | KPI cards, DB table row counts | Live API |
| Roger | Developer agent chat with read-only DB tools | Live API (streaming) |

---

## 15. Status Log

| Date | Action | Status |
|------|--------|--------|
| 2026-02-28 | Master plan drafted | Done |
| 2026-02-28 | Current systems researched (DACdb, Wix sites, existing app) | Done |
| 2026-02-28 | Database schema designed (13 new tables) | Done |
| 2026-02-28 | RBAC permission matrix defined (8 roles) | Done |
| 2026-02-28 | Bryn AI tool architecture defined | Done |
| 2026-02-28 | Parallel build plan created (5 terminals) | Done |
| 2026-02-28 | Clarifying questions answered (Clerk, DACdb supplement, 300 members, scrape+improve) | Done |
| 2026-02-28 | Parallel terminal prompts written | Done |
| 2026-02-28 | Terminal 1 completed — Clerk auth, 13 new tables, 3 layouts, route migration, 17 placeholders | Done |
| 2026-02-28 | BUILD-COORD.md created — central coordination log for all terminals | Done |
| 2026-02-28 | Terminal 2 completed — Member portal: 7 pages, 11 API routes, query additions | Done |
| 2026-02-28 | Terminal 3 completed — Public website: 8 (rotary)/* pages, rotary header/footer, 4 API routes, CMS editor, seed script | Done |
| 2026-02-28 | Terminal 5 completed — Uncorked migration verified, admin pages built | Done |
| 2026-02-28 | Bryn config governance formalized — AGENTS.md + openclaw.json updated | Done |
| 2026-02-28 | Terminal 4A+4B: Bryn AI Assistant (backend + chat UI) | Done |
| 2026-02-28 | Roger developer agent + Planning Hub — 6-tab admin command center, 5 Roger tools, streaming chat | Done |
| 2026-02-28 | Planned feature sets added: SMS Broadcast, Community CRM, Membership Pipeline, Board Portal | Planned |
| | Integration testing + polish | Final |

---

## 16. Planned Feature Sets

These feature sets are planned but not yet built. Each will become one or more future build terminals once the core platform is stable.

### 16A. SMS Broadcast

**Status:** Planned
**Detailed spec:** Section 5E
**Primary route:** `/admin/messaging`
**Tech:** Twilio
**New tables:** `text_broadcasts`, `text_broadcast_recipients`, `text_opt_outs`
**New env vars:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

**Scope of work:**
- `app/admin/messaging/page.tsx` — compose UI, recipient targeting, history
- `app/api/messaging/route.ts` — create/send broadcast
- `app/api/messaging/[id]/route.ts` — get status, recipient list
- `app/api/messaging/webhooks/twilio/route.ts` — delivery receipts + STOP handling
- `lib/queries/messaging.ts` — broadcast queries
- Admin sidebar: add Messaging nav item

---

### 16B. Community CRM

**Status:** Planned
**Detailed spec:** Section 5F
**Primary route:** `/admin/community-crm`
**New tables:** `community_contacts`, `community_contact_activities`

**Scope of work:**
- `app/admin/community-crm/page.tsx` — contact list with search/filter
- `app/admin/community-crm/[id]/page.tsx` — contact detail + activity timeline
- `app/api/community-crm/route.ts` — GET list, POST create
- `app/api/community-crm/[id]/route.ts` — GET, PATCH, DELETE
- `app/api/community-crm/[id]/activities/route.ts` — log activity
- `lib/queries/community-crm.ts` — contact queries
- "Promote to Pipeline" action: creates a prospect from a community contact
- Admin sidebar: add Community CRM nav item

---

### 16C. Membership Pipeline

**Status:** Planned
**Detailed spec:** Section 5G
**Primary route:** `/admin/membership-pipeline`
**New tables:** `prospects`, `prospect_activities`

**Scope of work:**
- `app/admin/membership-pipeline/page.tsx` — Kanban board + list view
- `app/admin/membership-pipeline/[id]/page.tsx` — prospect detail + activity timeline
- `app/api/membership-pipeline/route.ts` — GET list, POST create
- `app/api/membership-pipeline/[id]/route.ts` — GET, PATCH (incl. stage transitions), DELETE
- `app/api/membership-pipeline/[id]/activities/route.ts` — log activity
- `lib/queries/membership-pipeline.ts` — prospect queries
- "Convert to Member" action: triggers Clerk invite, marks prospect as inducted
- "Import from Inquiries" — pull unprocessed `/join` form submissions
- Admin sidebar: add Membership Pipeline nav item

---

### 16D. Board Management Portal

**Status:** Planned
**Detailed spec:** Section 5H
**Primary route group:** `(board)/` — separate layout, blue/silver palette
**New tables:** `board_meetings`, `board_meeting_attendees`, `board_resolutions`, `board_documents`, `board_action_items`, `officer_terms`
**New env vars:** none (Vercel Blob uses existing Vercel project credentials)

**Scope of work:**
- `app/(board)/layout.tsx` — board layout with sidebar, `requireAnyRole(["board_member", "club_admin", "super_admin"])`
- `app/(board)/board/page.tsx` — dashboard
- `app/(board)/board/meetings/page.tsx` + `[id]/page.tsx`
- `app/(board)/board/resolutions/page.tsx`
- `app/(board)/board/documents/page.tsx`
- `app/(board)/board/officers/page.tsx`
- `app/(board)/board/action-items/page.tsx`
- `app/(board)/board/budget/page.tsx`
- `app/(board)/board/calendar/page.tsx`
- Full API routes at `app/api/board/**`
- `lib/queries/board.ts` — all board queries
- Portal sidebar: add Board Portal link for `board_member`+ users
- Rich text (Tiptap) for meeting agendas and minutes
- File upload (Vercel Blob) for board documents

---

### Priority / Sequencing

| Feature | Build Priority | Dependency | Estimated Complexity |
|---------|:-:|---------|:-:|
| SMS Broadcast | High — high member value, admin-only | None | Medium |
| Membership Pipeline | High — core club ops | None | Medium |
| Community CRM | Medium | None (can link to pipeline later) | Medium |
| Board Management Portal | Medium — board-facing | None | High (many modules) |

**Recommended build order:** SMS → Membership Pipeline → Community CRM → Board Portal

Each feature set is self-contained and can be built in a single terminal session. No cross-dependencies between the four new feature sets.
