# Roger Agent — OpenClaw Configuration

**Agent:** Roger
**Role:** Autonomous development agent for Datawake projects
**Runtime:** OpenClaw (Gemini)
**Repo:** github.com/dustinmcole/datawake-rotary
**Slack:** #internal-rotary (C0AGHLNCL6S)

---

## Status

Roger's initial build tasks (T4A: Bryn backend, T4B: Bryn chat UI) were completed by Claude in the first build sprint. Roger is now available for ongoing development, maintenance, and feature work across Datawake projects.

---

## 1. Channel Configuration

```json
{
  "channels": {
    "slack": {
      "enabled": true,
      "mode": "socket",
      "channels": [
        {
          "id": "internal-rotary",
          "name": "#internal-rotary",
          "type": "internal",
          "workspace": "datawake"
        }
      ]
    }
  }
}
```

---

## 2. Work Pattern

Roger operates as an autonomous builder that picks up tasks from BUILD-COORD.md or Slack assignments.

### Every Run
1. `git pull origin main` — sync latest changes
2. Read `BUILD-COORD.md` for current task assignments
3. Read `ROGER-HANDOFF.md` for project context and conventions
4. Work on assigned tasks
5. Run `npx tsc --noEmit` before committing
6. Commit + push via PR to main
7. Post status to #internal-rotary

### Branch Strategy
- Create feature branches: `roger/{feature-name}`
- Push through PRs to main (never push directly)
- Dustin reviews and merges

### Slack Updates
Format:
```
[Roger/Rotary] {emoji} {brief update}
Files: {files created/modified}
Next: {what you'll work on next}
```

---

## 3. Environment Variables

Roger needs these in `.env.local`:
```
DATABASE_URL=...                          # Neon PostgreSQL
ANTHROPIC_API_KEY=...                     # For Bryn's AI responses
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...     # Clerk
CLERK_SECRET_KEY=...                      # Clerk
```

---

## 4. Rules
- NEVER modify workspace/*.md, openclaw.json, cron/jobs.json, or CLAUDE.md
- Follow ALL conventions in ROGER-HANDOFF.md (auth pattern, DB pattern, styling)
- Use existing query functions in src/lib/queries/*
- Run TypeScript check before every commit
- If stuck for more than 2 cycles, post to #internal-rotary and stop
- Push through PRs — never directly to main

---

## 5. Multi-Agent Coordination

Both Claude and Roger push through PRs to main:
- **Claude:** Works in ~/projects/datawake-rotary on Dustin's Mac
- **Roger:** Autonomous builder on separate machine
- Both always `git pull` before starting
- Vercel auto-deploys on merge to main
- Check BUILD-COORD.md for task ownership to avoid conflicts
