# Worklog for Claude Code

Your work log, kept by Claude. This plugin connects Claude Code to your [Worklog](https://worklog.pro.et) account.

## What you get

- **Worklog MCP server**: tools to log work, update and merge entries, search and list your log, write summaries, export, and read your focus report.
- **Skills**
  - `/worklog:log [what you did]`: log work (Claude also logs finished tasks on its own).
  - `/worklog:standup [period]`: a standup or status update from your real log.
  - `/worklog:focus [period]`: focus score, deep work, meetings and distractions.
  - `/worklog:recap <keyword>`: find past work by keyword, ticket or project.
- **Optional automatic capture**: a Stop hook that records each finished session.

## Setup

1. Create a free account at [worklog.pro.et](https://worklog.pro.et) and create an API key under **Connect AI**.
2. Install the plugin:
   ```
   /plugin marketplace add Kidyoh/worklog-plugin
   /plugin install worklog@worklog
   ```
3. Paste your API key when asked (stored in your system's secure storage).

## Data handling

All data goes to one place: the Worklog server you configure (default `https://worklog.pro.et`), over HTTPS, authenticated with your API key.

- **MCP tools** send what Claude passes to them (titles, summaries, categories, durations, search terms).
- **Automatic capture** (on by default, turn off with the `auto_capture` option) sends, once per session: the project name (the folder or repository name), the first line of your first request (up to 300 characters), the start of Claude's final answer (up to 2,000 characters), start/end time and number of turns. It does **not** send code, file contents, branch names, commit hashes or full repository URLs.
- **The server removes** links, code blocks, file paths, credentials and API keys, emails, phone numbers, IP addresses and card numbers from everything it stores.
- Nothing is sent to any third party. Data is kept until you delete it or your account. Privacy policy: https://worklog.pro.et/privacy

## Support

Issues and questions: https://github.com/Kidyoh/worklog-plugin/issues
