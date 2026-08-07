# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is **not an application** — it's a Claude Code **plugin**: a curated collection of agents, skills,
commands, rules, hooks, and MCP configs meant to be installed into a user's `~/.claude/` directory (or
loaded as a plugin via `/plugin install`). Changes here are authored as Markdown/JSON config files and a
small set of cross-platform Node.js scripts that implement the hooks. There is no app to build or serve.

## Commands

```bash
# Run the full test suite
node tests/run-all.js

# Run an individual test file
node tests/lib/utils.test.js
node tests/lib/package-manager.test.js
node tests/hooks/hooks.test.js
```

Tests are plain Node scripts (no test framework/runner dependency, no `package.json`). Each test file is
directly executable and prints pass/fail counts; `tests/run-all.js` just shells out to each one in turn and
aggregates results.

There is no lint/build/typecheck step — the only "source code" is the hook implementation under `scripts/`.

## Architecture

### Component types and where they live

| Dir | Purpose | Installed to |
|---|---|---|
| `agents/` | Subagent definitions (frontmatter + system prompt) for delegation | `~/.claude/agents/` |
| `skills/` | Workflow/domain-knowledge docs invoked by commands or agents | `~/.claude/skills/` |
| `commands/` | Slash commands (`/plan`, `/tdd`, `/code-review`, etc.) | `~/.claude/commands/` |
| `rules/` | Always-follow guidelines, kept modular by topic | `~/.claude/rules/` |
| `hooks/` | `hooks.json` (event → matcher → command wiring) + hook subsystems | `~/.claude/hooks/` + merged into `~/.claude/settings.json` |
| `scripts/` | The actual Node.js implementations that hooks invoke | referenced via `${CLAUDE_PLUGIN_ROOT}/scripts/...` |
| `mcp-configs/` | MCP server config templates (GitHub, Supabase, Vercel, Railway, ...) | copied into `~/.claude.json` |
| `contexts/` | Dynamic system-prompt injection snippets (dev/review/research modes) | referenced by hooks/commands |
| `examples/` | Example `CLAUDE.md` / user-level config for reference — not installed | — |
| `.claude-plugin/` | `plugin.json` (metadata, points at `commands`/`skills`) and `marketplace.json` (self-hosted marketplace catalog) | — |

Everything under `agents/`, `commands/`, `rules/`, `skills/` is a leaf config file (or small directory for
multi-file skills) — there's no cross-file coupling between them beyond naming conventions, so most changes
are additive and isolated to a single file.

### Hooks: config vs. implementation split

`hooks/hooks.json` is the declarative wiring: for each lifecycle event (`PreToolUse`, `PostToolUse`,
`PreCompact`, `Stop`, etc.) it lists `matcher` expressions (evaluated against `tool` / `tool_input`) and the
`command` to run. Two shapes of command appear:
- Inline `node -e "..."` one-liners for simple checks (e.g. blocking `npm run dev` outside tmux, warning
  about stray `.md` file creation).
- Calls into `scripts/hooks/*.js` via `${CLAUDE_PLUGIN_ROOT}/scripts/hooks/<name>.js` for anything
  non-trivial (session memory persistence, pre-compact state saving, strategic-compact suggestions,
  session evaluation/pattern extraction).

When adding or changing hook behavior, decide which shape fits: trivial and self-contained → inline in
`hooks.json`; stateful, multi-step, or shared logic → a script under `scripts/hooks/` using the shared
helpers in `scripts/lib/utils.js` (cross-platform file/path/system helpers) and
`scripts/lib/package-manager.js` (package-manager detection).

`tests/hooks/hooks.test.js` validates `hooks.json` itself (valid JSON, required event types present, all
commands use `node` — not bash/sh, for Windows compatibility — and script references use the
`${CLAUDE_PLUGIN_ROOT}` variable rather than hardcoded paths). Keep hook scripts Node-only; this repo
explicitly supports Windows/macOS/Linux and previously bash-only hooks were rewritten in Node.js for that
reason.

### Package manager detection

`scripts/lib/package-manager.js` picks npm/pnpm/yarn/bun using a fixed priority order: `CLAUDE_PACKAGE_MANAGER`
env var → `.claude/package-manager.json` (project) → `package.json` `packageManager` field → lock file
detection → `~/.claude/package-manager.json` (global) → first available. `scripts/setup-package-manager.js`
is the interactive/CLI entry point (`--global`, `--project`, `--detect`), also exposed as the `/setup-pm`
slash command. Any hook or script that shells out to a package manager should go through this detection
rather than hardcoding `npm`.

### Authoring conventions (enforced by CONTRIBUTING.md, not by tooling)

- **Agents** (`agents/*.md`): YAML frontmatter with `name`, `description`, `tools`, `model`, followed by the
  system prompt.
- **Skills** (`skills/<name>/` or `skills/<name>.md`): sections `## When to Use`, `## How It Works`,
  `## Examples`.
- **Commands** (`commands/*.md`): frontmatter with `description`, then the command body.
- **Rules** (`rules/*.md`): one topic per file, kept short and imperative.
- **Hooks**: every entry in `hooks.json` should carry a `description` explaining what it does.
- File naming: lowercase-with-hyphens, descriptive (`tdd-workflow.md`, not `workflow.md`).

### Two audiences for docs

`README.md` is the public/generic install & usage doc for any Claude Code user. `WORLDFLOWAI.md` is a
project-specific quick-reference for this maintainer's own `synapse` (Rust) and `arbiter` (Python/ML)
projects — it documents which agents/commands to reach for in each, and assumes symlink-based installation
from `~/dev/worldflowai/everything-claude-code`. Don't merge these — they serve different readers.
