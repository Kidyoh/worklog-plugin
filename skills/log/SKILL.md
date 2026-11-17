---
description: Record finished work in the user's Worklog. Use when the user describes work they did or asks to log something ("log that I…", "I just finished…", "today I…"), and once after Claude completes a meaningful task such as a feature, fix, refactor, investigation, document or analysis.
argument-hint: "[what you did]"
---

# Log work to Worklog

Use the `log_work` tool from the `worklog` MCP server.

If the user passed text with this command, log it: $ARGUMENTS

How to log well:
- One entry per task, not per step or tool call. Skip trivial steps.
- `title`: a short plain-language description of what was done, e.g. "Added retries to the webhook sender".
- `summary` (optional): 1–3 plain sentences on what changed and why.
- Set `category` (development, meeting, analysis, documentation, review, planning, research, stakeholder, admin) and `duration_minutes` when known. Use `project` for the project name.
- If the user lists several items, call `log_work` once per item.
- Log only the work itself. Do not include links, code, file paths, commit hashes, branch names, credentials, customer data, emails or phone numbers.
- If an entry needs fixing, use `update_entry`. If several entries describe the same task, offer to combine them with `merge_entries`.

After logging, confirm in one short line what was recorded.
