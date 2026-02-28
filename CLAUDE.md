# Datawake Rotary — Bryn Agent Deployment

## Client: Fullerton Rotary Club

**Agent Name:** Bryn
**Runtime:** OpenClaw
**Managed by:** Datawake (datawake.io)
**Primary Contact:** Dustin Cole (dustin@datawake.io)
**Project Alias:** `cc-rotary` — ~/projects/datawake-rotary

## Overview

This is the dedicated Bryn (OpenClaw) agent deployment for the Fullerton Rotary Club. Bryn serves as the club's AI operations assistant — handling meeting follow-up, member communications, event coordination, and administrative tasks.

## Architecture

```
datawake-rotary/
├── CLAUDE.md                  ← this file
├── workspace/
│   ├── SOUL.md                ← agent personality & behavior
│   ├── IDENTITY.md            ← organizational identity
│   ├── USER.md                ← primary user profile
│   ├── AGENTS.md              ← agent rules & constraints
│   ├── MEMORY.md              ← persistent memory (evolves over time)
│   └── skills/                ← installed skill definitions
│       ├── morning-briefing/
│       ├── meeting-follow-up/
│       ├── weekly-updates/
│       └── event-coordination/
├── cron/
│   └── jobs.json              ← scheduled tasks
├── scripts/                   ← deployment & maintenance scripts
├── logs/                      ← runtime logs
├── openclaw.json              ← main agent configuration
├── .env                       ← credentials (NEVER commit)
└── .env.template              ← credential checklist
```

## Deployment

- **Hosting:** Docker on DigitalOcean ($24/mo droplet)
- **Timezone:** America/Los_Angeles (Pacific)
- **Channels:** Slack (primary), Email (weekly updates)

## Installed Skills

| Skill | Schedule | Description |
|-------|----------|-------------|
| Morning Briefing | Daily 7:00 AM PT | Club agenda, upcoming events, action items |
| Meeting Follow-up | Every 30 min (business hours) | Extract action items from Rotary meetings |
| Weekly Updates | Sat 8 PM draft / Mon 5 AM send | Club status summary for leadership |
| Event Coordination | On-demand | Track event planning tasks and logistics |

## Key Integrations

- **Slack:** #internal-rotary (Datawake internal), club workspace TBD
- **ClickUp:** Rotary folder in Datawake workspace
- **Google Calendar:** Club meeting schedule
- **Email:** Weekly updates to club leadership

## Conventions

- Follow existing Datawake client project patterns
- Authoritative config lives in this repo (deploy to agent machine from here)
- All secrets in .env only — never in config files
- Log all config changes to workspace/MEMORY.md

## Change Log

| Date | Change | By |
|------|--------|----|
| 2026-02-28 | Initial deployment created | Dustin |
