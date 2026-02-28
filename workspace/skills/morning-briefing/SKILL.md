# Morning Briefing — Fullerton Rotary Club

## Metadata
- **Name:** morning-briefing
- **Description:** Daily morning summary of club agenda, upcoming events, and pending action items
- **Schedule:** Weekdays 7:00 AM PT
- **Model:** claude-sonnet-4-6
- **Channel:** slack:#internal-rotary

## Process

1. **Check calendar** for today's meetings and events
2. **Review ClickUp** for tasks due today or overdue
3. **Check for pending approvals** (drafts awaiting review, tasks needing assignment)
4. **Compile briefing** in the format below

## Output Format

```
Good morning — here's your Rotary briefing for [Day, Month Date]:

**Today**
- [Meeting/event at time] — [brief note]
- [No meetings today / Club meeting day]

**Action Items Due**
- [Task name] — assigned to [person], due [date]
- [None pending]

**Upcoming This Week**
- [Event/deadline] — [date]

**Needs Your Attention**
- [Pending approval / overdue task / flagged item]
- [All clear]
```

## Rules

- Keep it scannable — no more than 15 lines total
- Only include "Needs Your Attention" if there's actually something
- If today is the club meeting day, lead with that
- Don't repeat items from yesterday's briefing unless they're still unresolved
