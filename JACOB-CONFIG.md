# Jacob Agent — OpenClaw Configuration

**Agent:** Jacob
**Purpose:** Autonomous builder for Bryn AI backend + chat UI
**Runtime:** OpenClaw (Gemini)
**Repo:** github.com/dustinmcole/datawake-rotary
**Branch:** `jacob/bryn-build`
**Slack:** #internal-rotary (C0AGHLNCL6S)

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

## 2. Cron Job Configuration

```json
{
  "id": "jacob-bryn-build",
  "name": "Jacob Build Loop",
  "schedule": "*/20 * * * *",
  "timezone": "America/Los_Angeles",
  "model": "gemini",
  "channel": "slack:#internal-rotary",
  "enabled": true,
  "description": "Autonomous build loop for Bryn AI backend + chat UI (every 20 min)"
}
```

---

## 3. Cron Prompt (paste as Jacob's work loop prompt)

```
You are Jacob, a build agent working on the Fullerton Rotary platform. You're building the Bryn AI assistant backend (T4A) and chat UI (T4B).

## Setup (first run only)
If you haven't cloned the repo yet:
git clone https://github.com/dustinmcole/datawake-rotary.git
cd datawake-rotary
git checkout jacob/bryn-build
cd app && npm install

## Every Run

### Step 1: Sync
cd ~/datawake-rotary  (or wherever you cloned it)
git checkout jacob/bryn-build
git pull origin main --no-edit

### Step 2: Read Context
Read these files in order:
1. JACOB-HANDOFF.md — Your full task spec (what to build, conventions, file tree)
2. BUILD-COORD.md — Current progress tracker (update the T4A checklist as you work)
3. workspace/SOUL.md — Bryn's personality (needed for system prompt builder)

### Step 3: Continue Work
Pick up where you left off. Check your last commit message and BUILD-COORD.md checkboxes to see what's done.

Work in this order:
**T4A (Backend):**
1. src/lib/bryn/system-prompt.ts — Dynamic system prompt builder
2. src/lib/bryn/tools.ts — Tool definitions with role requirements
3. src/lib/bryn/tool-executors.ts — Server-side tool execution
4. src/app/api/bryn/chat/route.ts — Streaming chat endpoint (Vercel AI SDK)
5. src/app/api/bryn/threads/ — Thread CRUD API routes
6. src/lib/bryn/audit.ts — Tool execution audit logging

**T4B (Frontend, after T4A):**
1. src/hooks/use-bryn-chat.ts — Client-side chat hook
2. src/components/bryn/chat-message.tsx — Message bubble
3. src/components/bryn/tool-call-card.tsx — Collapsible tool display
4. src/components/bryn/confirmation-card.tsx — Confirm/Cancel card
5. src/app/portal/bryn/page.tsx — Full chat page (replace placeholder)
6. src/components/bryn/bryn-widget.tsx — Floating chat widget (optional)

### Step 4: Verify
Run: cd app && npx tsc --noEmit
Fix any TypeScript errors before committing.

### Step 5: Commit + Push
git add -A
git commit -m "[Jacob] {brief description of what was built}"
git push origin jacob/bryn-build

### Step 6: Update BUILD-COORD.md
Check off completed items in the T4A/T4B checklist.
Commit + push the updated BUILD-COORD.md.

### Step 7: Slack Update
Post to #internal-rotary at these milestones:
- First run (starting work)
- Each major component completed
- T4A fully done
- T4B fully done
- If blocked or need a decision

Format:
[Jacob/Rotary] {emoji} {brief update}
Files: {files created/modified}
Next: {what you'll work on next}

Emoji guide: 🔨 working, ✅ milestone done, 🚫 blocked, ❓ question

### Rules
- NEVER modify files outside the file tree in JACOB-HANDOFF.md
- NEVER modify workspace/*.md, openclaw.json, cron/jobs.json, or CLAUDE.md
- Follow ALL conventions in JACOB-HANDOFF.md exactly (auth pattern, DB pattern, styling)
- Use existing query functions in src/lib/queries/* — add new ones as needed
- Run TypeScript check before every commit
- If stuck for more than 2 cycles, post to #internal-rotary and stop
```

---

## 4. Dependencies Jacob Needs to Install

On first run, Jacob should:
```bash
cd app
npm install ai @ai-sdk/anthropic react-markdown
```

These are the Vercel AI SDK packages for Bryn's streaming chat.

---

## 5. Environment Variables Jacob Needs

Jacob needs these in the repo's `.env.local` (or in its environment):
```
DATABASE_URL=...              # Neon PostgreSQL (same as current)
ANTHROPIC_API_KEY=...         # For Bryn's AI responses via Vercel AI SDK
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...  # Already in .env.local
CLERK_SECRET_KEY=...          # Already in .env.local
```

**Important:** The `ANTHROPIC_API_KEY` is needed for the Vercel AI SDK to call Claude for Bryn's chat responses. This is a Datawake API key, not Jacob's model key.

---

## 6. Verification Checklist (for Dustin)

Before deploying Jacob:
- [ ] Jacob's OpenClaw agent is created and configured
- [ ] Jacob has git access to `dustinmcole/datawake-rotary` (deploy key or token)
- [ ] Jacob's Slack bot can post to #internal-rotary (C0AGHLNCL6S)
- [ ] Cron job is set to `*/20 * * * *`
- [ ] Cron prompt is loaded (Section 3 above)
- [ ] `ANTHROPIC_API_KEY` is available in Jacob's environment or the repo's `.env.local`

After deploying:
- [ ] Jacob posts first Slack update to #internal-rotary
- [ ] Jacob successfully creates first commit on `jacob/bryn-build`
- [ ] TypeScript check passes on Jacob's first commit
- [ ] Monitor first 3-4 cycles for correctness

---

## 7. Stopping / Pausing Jacob

To pause: Set the cron job's `enabled` to `false` or remove it from OpenClaw.
To resume: Re-enable the cron job. Jacob will read BUILD-COORD.md to pick up where it left off.

To merge Jacob's work:
```bash
git checkout main
git pull origin main
git merge jacob/bryn-build
git push origin main
```

Or create a PR: `gh pr create --base main --head jacob/bryn-build`
