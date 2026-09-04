# AI Toolbox

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white)

My personal Claude Code toolkit — the agents, skills, commands, rules, and hooks I reach for
across TypeScript/React and C#/.NET work, packaged as an installable Claude Code plugin.

This is a personal, evolving toolkit rather than a general-purpose distribution: things get added
when they earn their place and removed when they don't.

---

## What's inside

| Component | What it is |
|-----------|------------|
| **Agents** (9) | Specialized subagents: `architect`, `planner`, `tdd-guide`, `code-reviewer`, `security-reviewer`, `build-error-resolver`, `refactor-cleaner`, `doc-updater`, `e2e-runner` |
| **Commands** (15) | Slash commands: `/plan` `/tdd` `/verify` `/code-review` `/build-fix` `/refactor-clean` `/e2e` `/eval` `/test-coverage` `/checkpoint` `/learn` `/orchestrate` `/update-docs` `/update-codemaps` `/setup-pm` |
| **Skills** (7) | `coding-standards`, `backend-patterns`, `frontend-patterns`, `tdd-workflow`, `verification-loop`, `eval-harness`, `security-review` |
| **Rules** (8) | Always-follow guidelines: `security`, `coding-style`, `testing`, `git-workflow`, `agents`, `patterns`, `performance`, `hooks` |
| **Hooks** | Prettier auto-format, `tsc` type-check, `console.log` warnings, PR-URL logging, and a git-push reminder (see below) |
| **Contexts** (3) | Dynamic mode presets: `dev`, `review`, `research` |
| **MCP configs** | Reference `mcp-servers.json` for GitHub, Supabase, Vercel, Railway, filesystem, context7, and more |

### Hooks

All hooks are cross-platform Node.js (Windows/macOS/Linux). The active set:

- **`SessionStart`** — detects the project's package manager and reports it.
- **`PostToolUse`** — after editing a `.ts/.tsx/.js/.jsx` file: auto-format with Prettier, run a
  `tsc --noEmit` check on TypeScript, and warn about leftover `console.log`. After `gh pr create`,
  log the PR URL and a ready-to-run review command.
- **`Stop`** — flag `console.log` in modified files before you commit.
- **`PreToolUse`** — a light reminder to review changes before `git push`.

The format and type-check hooks run through the project's own package manager (see below), so they
use `pnpm dlx` / `bunx` / `yarn dlx` / `npx` to match each repo instead of hardcoding `npx`.

---

## Package manager detection

The toolkit auto-detects which JavaScript package manager a project uses (npm, pnpm, yarn, or bun),
in priority order:

1. `CLAUDE_PACKAGE_MANAGER` environment variable
2. Project config: `.claude/package-manager.json`
3. `package.json` `packageManager` field
4. Lock file (`pnpm-lock.yaml`, `bun.lockb`, `yarn.lock`, `package-lock.json`)
5. Global config: `~/.claude/package-manager.json`
6. Fallback: first installed manager (pnpm > bun > yarn > npm)

Set a preference:

```bash
export CLAUDE_PACKAGE_MANAGER=pnpm            # environment override
node scripts/setup-package-manager.js --global pnpm
node scripts/setup-package-manager.js --project bun
node scripts/setup-package-manager.js --detect   # show current resolution
```

Or use the `/setup-pm` command inside Claude Code.

---

## Layout

```
AI-toolbox/
|-- .claude-plugin/       # Plugin + marketplace manifests
|-- agents/               # Specialized subagents
|-- commands/             # Slash commands
|-- skills/               # Workflow definitions and domain knowledge
|-- rules/                # Always-follow guidelines
|-- hooks/hooks.json      # Hook configuration
|-- scripts/
|   |-- lib/              # utils.js, package-manager.js
|   |-- hooks/            # session-start.js, format.js, tsc-check.js
|   |-- setup-package-manager.js
|-- contexts/             # Dynamic mode presets
|-- mcp-configs/          # MCP server reference configs
|-- tests/                # Test suite (node tests/run-all.js)
```

---

## Installation

### As a plugin (recommended)

```bash
/plugin marketplace add Arenteria518/AI-toolbox
/plugin install ai-toolbox@ai-toolbox
```

Or add directly to `~/.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "ai-toolbox": {
      "source": { "source": "github", "repo": "Arenteria518/AI-toolbox" }
    }
  },
  "enabledPlugins": {
    "ai-toolbox@ai-toolbox": true
  }
}
```

### Manual / selective

Clone and copy or symlink just the pieces you want:

```bash
git clone https://github.com/Arenteria518/AI-toolbox.git
cp AI-toolbox/agents/*.md    ~/.claude/agents/
cp AI-toolbox/commands/*.md  ~/.claude/commands/
cp -r AI-toolbox/skills/*    ~/.claude/skills/
```

For hooks, merge the entries you want from `hooks/hooks.json` into your `~/.claude/settings.json`.
For MCPs, copy the servers you use from `mcp-configs/mcp-servers.json` into `~/.claude.json` and
replace the `YOUR_*_HERE` placeholders with real values.

> **Context tip:** keep well under ~10 MCPs enabled per project — too many tools shrink the usable
> context window. Use `disabledMcpServers` in project config to turn off the ones you're not using.

---

## Running tests

```bash
node tests/run-all.js
```

---

## License

MIT — see [LICENSE](LICENSE).
