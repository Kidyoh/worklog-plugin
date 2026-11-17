---
description: Write a standup or status update from the user's real Worklog entries. Use when the user asks for a standup, daily update, weekly status, timesheet summary, or "what did I do yesterday / this week?".
argument-hint: "[today | yesterday | this week | last week]"
---

# Standup from Worklog

Period requested: $ARGUMENTS (default: yesterday and today).

1. Call `get_summary` from the `worklog` MCP server for the period (use `period` such as `yesterday`, `today`, `this_week`, `last_week`, or `from`/`to` dates). Use `list_entries` if you need item-level detail.
2. Write a short update:
   - **Done**: the finished items, grouped by project, with time when known.
   - **In progress**: items with status in_progress.
   - **Next / blockers**: only if the user mentioned them or entries show them. Never invent work.
3. Keep it plain text the user can paste into Slack or email. Base everything on the entries returned; if there are none, say so and offer to log what they did.
