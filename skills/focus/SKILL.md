---
description: Show how focused the user was and where their time went, using Worklog's focus score and tracked activity. Use when the user asks about focus, deep work, distractions, meetings load or "where did my time go?".
argument-hint: "[today | yesterday | this week | last week]"
---

# Focus report from Worklog

Period requested: $ARGUMENTS (default: this week).

1. Call `get_focus_report` from the `worklog` MCP server for the period.
2. Summarize in a few lines: average focus score, total deep focus, meetings and distractions, the best day, and the biggest categories.
3. If useful, add one or two concrete suggestions based only on the data (for example, a day with heavy meetings and little deep focus).
4. If there is no tracked time, explain that Worklog's browser extension (Tracking page at worklog.pro.et) or focus sessions provide this data.
