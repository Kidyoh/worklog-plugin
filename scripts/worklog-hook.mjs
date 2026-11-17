#!/usr/bin/env node
/**
 * Worklog session hook — zero dependencies, Node 18+.
 *
 * Claude Code: register as a "Stop" hook; reads the hook JSON from stdin.
 * Codex:       set `notify = ["node", "/path/to/worklog-hook.mjs"]`; reads JSON from argv.
 *
 * Env: WORKLOG_URL (e.g. https://worklog.example.com), WORKLOG_API_KEY.
 * Optional: WORKLOG_DEBUG=1 to print errors to stderr.
 *
 * Privacy: sends only the project name, the first line of the request, a short
 * excerpt of the final answer and timing. No PR links, commits, branches or paths.
 *
 * Sends one snapshot per agent session; the server updates the same entry
 * every time this runs. Never blocks or fails the agent.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// Settings come from the environment, or from the Claude Code plugin's options
// (exposed to hooks as CLAUDE_PLUGIN_OPTION_<KEY>).
const OPT = (k) => process.env[`CLAUDE_PLUGIN_OPTION_${k}`];
const URL_BASE = (process.env.WORKLOG_URL || OPT("WORKLOG_URL") || (OPT("WORKLOG_API_KEY") ? "https://worklog.pro.et" : "")).replace(/\/$/, "");
const KEY = process.env.WORKLOG_API_KEY || OPT("WORKLOG_API_KEY") || "";
const AUTO_CAPTURE_OFF = /^(false|0|no|off)$/i.test(OPT("AUTO_CAPTURE") || "");
const DEBUG = process.env.WORKLOG_DEBUG === "1";

function log(...args) {
  if (DEBUG) console.error("[worklog]", ...args);
}

function git(cwd, args) {
  try {
    return execFileSync("git", args, { cwd, stdio: ["ignore", "pipe", "ignore"], timeout: 3000 }).toString().trim();
  } catch {
    return undefined;
  }
}

function normalizeRemote(url) {
  if (!url) return undefined;
  return url
    .replace(/^git@([^:]+):/, "$1/")
    .replace(/^https?:\/\/([^@/]+@)?/, "")
    .replace(/\.git$/, "");
}

function gitInfo(cwd) {
  // Only used to name the project. Branch, commit and PR link are not collected.
  if (!cwd) return {};
  const remote = normalizeRemote(git(cwd, ["remote", "get-url", "origin"]));
  return { repo: remote || git(cwd, ["rev-parse", "--show-toplevel"]) || undefined };
}

function textOf(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((c) => c && c.type === "text" && typeof c.text === "string")
      .map((c) => c.text)
      .join("\n");
  }
  return "";
}

/** Extract first real user prompt, last assistant text and timing from a Claude Code transcript. */
function parseClaudeTranscript(path) {
  const out = { first_prompt: undefined, last_message: undefined, started_at: undefined, ended_at: undefined, turns: 0 };
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch (e) {
    log("cannot read transcript", e.message);
    return out;
  }
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    let rec;
    try {
      rec = JSON.parse(line);
    } catch {
      continue;
    }
    if (rec.isSidechain) continue;
    if (rec.timestamp) {
      out.started_at ??= rec.timestamp;
      out.ended_at = rec.timestamp;
    }
    if (rec.type === "user" && !rec.isMeta && rec.message) {
      const t = textOf(rec.message.content).trim();
      // Skip tool results, slash-command wrappers and system reminders.
      if (t && !t.startsWith("<")) {
        out.first_prompt ??= t;
        out.turns++;
      }
    } else if (rec.type === "assistant" && rec.message) {
      const t = textOf(rec.message.content).trim();
      if (t) out.last_message = t;
    }
  }
  return out;
}

async function readStdin() {
  if (process.stdin.isTTY) return "";
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
}

/** Codex notify fires per turn; remember the first prompt and start time per thread. */
function codexState(threadId, firstPrompt) {
  const dir = join(homedir(), ".worklog", "state");
  const file = join(dir, `${threadId.replace(/[^\w-]/g, "_")}.json`);
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    const state = { first_prompt: firstPrompt, started_at: new Date().toISOString(), turns: 0 };
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(file, JSON.stringify(state));
    } catch {}
    return state;
  }
}

function saveCodexState(threadId, state) {
  try {
    writeFileSync(join(homedir(), ".worklog", "state", `${threadId.replace(/[^\w-]/g, "_")}.json`), JSON.stringify(state));
  } catch {}
}

async function buildPayload() {
  // Codex passes a JSON argument.
  const arg = process.argv[2];
  if (arg && arg.trim().startsWith("{")) {
    const n = JSON.parse(arg);
    if (n.type && n.type !== "agent-turn-complete") return null;
    const threadId = n["thread-id"] || n["session-id"] || n["turn-id"] || "unknown";
    const inputs = n["input-messages"] || [];
    const state = codexState(threadId, inputs.join("\n"));
    state.turns = (state.turns || 0) + 1;
    saveCodexState(threadId, state);
    const cwd = n.cwd || process.cwd();
    return {
      agent: "codex",
      session_id: threadId,
      cwd,
      ...gitInfo(cwd),
      first_prompt: state.first_prompt || inputs.join("\n") || undefined,
      last_message: n["last-assistant-message"] || undefined,
      started_at: state.started_at,
      ended_at: new Date().toISOString(),
      turns: state.turns,
    };
  }

  // Claude Code passes JSON on stdin.
  const input = await readStdin();
  if (!input.trim()) return null;
  const h = JSON.parse(input);
  if (!h.session_id) return null;
  const cwd = h.cwd || process.cwd();
  const t = h.transcript_path ? parseClaudeTranscript(h.transcript_path) : {};
  return {
    agent: "claude-code",
    session_id: h.session_id,
    cwd,
    ...gitInfo(cwd),
    ...t,
    last_message: h.last_assistant_message || t.last_message,
  };
}

async function main() {
  if (AUTO_CAPTURE_OFF) return;
  if (!URL_BASE || !KEY) {
    log("WORKLOG_URL or WORKLOG_API_KEY not set; skipping");
    return;
  }
  const raw = await buildPayload();
  if (!raw) return;
  // Privacy: send only what describes the work. No PR links, commits, branches, local
  // paths or remote URLs leave this machine, and the server redacts the text again.
  const project = (raw.repo || raw.cwd || "").replace(/\/+$/, "").split(/[\\/:]/).filter(Boolean).pop();
  const payload = {
    agent: raw.agent,
    session_id: raw.session_id,
    repo: project,
    first_prompt: raw.first_prompt?.trim().split("\n").find((l) => l.trim())?.slice(0, 300),
    last_message: raw.last_message?.slice(0, 2000),
    started_at: raw.started_at,
    ended_at: raw.ended_at,
    turns: raw.turns,
  };
  for (const k of Object.keys(payload)) if (payload[k] === undefined || payload[k] === "") delete payload[k];

  const res = await fetch(`${URL_BASE}/api/v1/hooks/agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) log("server responded", res.status, await res.text());
}

main()
  .catch((e) => log(e?.message || e))
  .finally(() => process.exit(0));
