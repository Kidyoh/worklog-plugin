# Worklog for Claude Code

Your work log, kept by Claude. This plugin connects Claude Code to your [Worklog](https://worklog.pro.et) account, so you can log work just by asking, find what you did, write standups and see your focus score.

## What you get

- **Worklog MCP server**: tools to log work, update and merge entries, search and list your log, write summaries, export, and read your focus report.
- **Skills**
  - `/worklog:log [what you did]`: log work. Claude also logs finished tasks on its own.
  - `/worklog:standup [period]`: a standup or status update from your real log.
  - `/worklog:focus [period]`: focus score, deep work, meetings and distractions.
  - `/worklog:recap <keyword>`: find past work by keyword, ticket or project.

## Setup

1. Create a free account at [worklog.pro.et](https://worklog.pro.et).
2. Install the plugin:
   ```
   /plugin marketplace add Kidyoh/worklog-plugin
   /plugin install worklog@worklog
   ```
3. The first time Claude uses Worklog, sign in to your Worklog account in the browser window that opens and click **Allow**. No keys to copy. You can disconnect it any time under Worklog → Settings → Connected apps.

## Data handling

The plugin runs no code on your machine. All data goes to one place, `https://worklog.pro.et`, over HTTPS, using the access you approved when signing in.

- The MCP tools send only what Claude passes to them: titles, summaries, categories, durations, project names and search terms.
- Worklog removes links, code blocks, file paths, credentials and API keys, emails, phone numbers, IP addresses and card numbers from everything it stores.
- Nothing is sent to third parties. Data is kept until you delete it or your account.

Privacy policy: https://worklog.pro.et/privacy · Terms: https://worklog.pro.et/terms

## Support

Help and contact: https://worklog.pro.et/support · Bug reports: https://github.com/Kidyoh/worklog-plugin/issues
