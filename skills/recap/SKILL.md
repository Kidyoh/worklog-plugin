---
description: Find past work in the user's Worklog by keyword, ticket key or project. Use when the user asks "when did I work on X?", "did I already fix Y?", or wants entries about a topic.
argument-hint: "<keyword, ticket key or project>"
---

# Search Worklog

Search for: $ARGUMENTS

1. Call `search_entries` from the `worklog` MCP server with the query. For a project, use `list_entries` with `project`.
2. Answer with the matching entries (date, title, project, duration), newest first. If nothing matches, say so plainly.
