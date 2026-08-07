# Everything Kiro

**Battle-tested development configurations for [Kiro](https://kiro.dev) — migrated from the original "Everything Claude Code" plugin.**

Production-ready steering files, hooks, and MCP configurations evolved over 10+ months of intensive daily use building real products, now adapted for Kiro's architecture.

---

## What's Inside

```
.kiro/
├── steering/                  # Always-on and on-demand guidance
│   ├── coding-style.md            # Immutability, file size limits, error handling
│   ├── security.md                # No hardcoded secrets, input validation
│   ├── testing.md                 # TDD requirements, 80% coverage minimum
│   ├── git-workflow.md            # Conventional commits, PR process
│   ├── patterns.md               # API response format, common patterns
│   ├── performance.md            # Context management, code performance
│   ├── agents-orchestration.md   # When to delegate, multi-perspective analysis
│   ├── security-review.md        # [Conditional] Deep OWASP checks for auth/api files
│   ├── tdd-workflow.md            # [Manual] Full TDD step-by-step guide
│   ├── planning.md               # [Manual] Implementation planning template
│   └── code-review.md            # [Manual] Code review checklist
│
├── hooks/                     # Automated agent actions on IDE events
│   ├── prettier-format.json       # Auto-format JS/TS on save
│   ├── typescript-check.json      # Run tsc after editing TS files
│   ├── console-log-warning.json   # Warn about leftover console.log
│   ├── security-check-on-api.json # Security prompt when creating API files
│   ├── git-push-review.json       # Review reminder before git push
│   ├── review-write-operations.json # Validate standards before writes
│   └── post-task-verify.json      # Type-check after spec task completion
│
└── settings/
    └── mcp.json               # Pre-configured MCP servers (disabled by default)
```

---

## Installation

### Global Setup (Recommended)

Install `everything-kiro` as a global command you can run from any project. Works on **Windows, macOS, and Linux** (requires Node.js 14+).

```bash
# 1. Clone the repo to a permanent location
git clone https://github.com/aliakbr/everything-claude-code-kiro-migration.git ~/.everything-kiro

# 2. Link the CLI globally
cd ~/.everything-kiro
npm link
```

Now you can run it from any project directory:

```bash
cd ~/my-project
everything-kiro install
```

#### Windows (PowerShell)

```powershell
# 1. Clone the repo
git clone https://github.com/aliakbr/everything-claude-code-kiro-migration.git $HOME\.everything-kiro

# 2. Link the CLI globally
cd $HOME\.everything-kiro
npm link
```

Then use it the same way:

```powershell
cd C:\Users\you\my-project
everything-kiro install
```

#### Updating

Pull the latest configurations at any time:

```bash
everything-kiro update
```

---

### Usage

Navigate to any project and run:

```bash
everything-kiro install
```

That's it. Open the project in Kiro and everything is active.

#### Install specific components

```bash
everything-kiro install --steering-only   # Only steering files
everything-kiro install --hooks-only      # Only hooks
everything-kiro install --mcp-only        # Only MCP server config
```

#### Upgrade existing installation

```bash
everything-kiro install --force    # Overwrites existing files with latest
```

#### Preview before installing

```bash
everything-kiro install --dry-run
```

Output:
```
▶ Installing steering files...
  would create .kiro/steering/coding-style.md
  would create .kiro/steering/security.md
  ...
▶ Installing hooks...
  would create .kiro/hooks/prettier-format.json
  ...
Dry run complete — no files were changed.
```

#### Install into a different directory

```bash
KIRO_TARGET_DIR=/path/to/other-project everything-kiro install
```

---

### All CLI Options

```
everything-kiro <command> [flags]

Commands:
  install       Install .kiro config into the current directory
  update        Pull the latest configurations from GitHub
  help          Show help message

Install Flags:
  --force           Overwrite existing files (for upgrades)
  --dry-run         Preview changes without writing anything
  --steering-only   Install only .kiro/steering/ files
  --hooks-only      Install only .kiro/hooks/ files
  --mcp-only        Install only .kiro/settings/mcp.json

Platforms: Windows, macOS, Linux (requires Node.js 14+)
```

---

## How It Works in Kiro

### Steering Files

Steering files are markdown instructions that guide Kiro's behavior. They come in three flavors:

**Always active** — Included in every interaction automatically:
| File | What it does |
|------|--------------|
| `coding-style.md` | Enforces immutability, small files, proper error handling |
| `security.md` | Blocks hardcoded secrets, mandates input validation |
| `testing.md` | Requires TDD workflow and 80%+ test coverage |
| `git-workflow.md` | Enforces conventional commits, feature branches |
| `patterns.md` | Defines standard API response format, repository pattern |
| `performance.md` | Guides efficient algorithms, caching, context management |
| `agents-orchestration.md` | Determines when to plan vs act, delegation rules |

**Conditional** — Auto-included when you open matching files:
| File | Triggers on |
|------|-------------|
| `security-review.md` | Files in `**/auth/**`, `**/api/**`, `**/middleware/**`, or named `*auth*`, `*security*`, `*token*`, `*session*` |

**Manual** — Include on demand by typing `#` in chat and selecting the file:
| File | Use when |
|------|----------|
| `tdd-workflow.md` | Starting a TDD session |
| `planning.md` | Planning a complex feature before coding |
| `code-review.md` | Asking Kiro to review your code |

### Hooks

Hooks fire automatically on IDE events. No action needed from you — they just work.

| Hook | Trigger | What happens |
|------|---------|--------------|
| **Prettier Format** | Save a JS/TS file | Runs `prettier --write` |
| **TypeScript Check** | Save a TS file | Runs `tsc --noEmit` |
| **Console.log Warning** | Save a JS/TS file | Greps for `console.log`, warns if found |
| **Security Check** | Create a file in `api/` or `routes/` | Prompts Kiro to verify auth, validation, rate limiting |
| **Git Push Review** | Before any shell command | If it's `git push`, reminds to review diff first |
| **Write Review** | Before any file write | Checks for secrets, mutations, file size |
| **Post-Task Verify** | After completing a spec task | Runs type checking |

### MCP Servers

Pre-configured but **disabled by default**. Enable what your project needs in `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "github": { "disabled": false, ... },
    "supabase": { "disabled": false, ... }
  }
}
```

Available servers: GitHub, Firecrawl, Supabase, Memory, Sequential Thinking, Context7.

**Tip:** Keep under 10 servers enabled to preserve context window quality.

---

## Customization

### Add your own steering rules

Create a new file in `.kiro/steering/`:

```markdown
---
inclusion: always
---

# My Project Rules

- Use React Query for all API calls
- Use Tailwind CSS, never inline styles
- All components must be accessible (WCAG 2.1 AA)
```

### Add project-specific hooks

Create a new JSON file in `.kiro/hooks/`:

```json
{
  "name": "Lint on Save",
  "version": "1.0.0",
  "when": {
    "type": "fileEdited",
    "patterns": ["*.ts", "*.tsx"]
  },
  "then": {
    "type": "runCommand",
    "command": "npx eslint --fix \"$KIRO_FILE_PATH\""
  }
}
```

### Disable a hook

Delete the JSON file from `.kiro/hooks/`, or rename it to `.json.disabled`.

### Enable an MCP server

Edit `.kiro/settings/mcp.json` and set `"disabled": false` for the server you want. Replace `YOUR_*_HERE` placeholders with actual credentials.

---

## How Kiro Differs from Claude Code

Kiro and Claude Code are both AI-powered development environments, but they have different architectures for customization:

### Architecture Comparison

| Concept | Claude Code | Kiro |
|---------|-------------|------|
| **Configuration location** | `~/.claude/` (global) + project root | `.kiro/` in project root |
| **Instruction files** | `CLAUDE.md` at project root | `.kiro/steering/*.md` with frontmatter |
| **Custom commands** | `~/.claude/commands/*.md` (slash commands) | No slash commands — use manual steering files or hooks |
| **Custom agents** | `~/.claude/agents/*.md` with model/tools metadata | Built-in sub-agents; custom behavior via steering |
| **Hook system** | Single `hooks.json` with matcher expressions | Individual `.json` files per hook in `.kiro/hooks/` |
| **Hook events** | PreToolUse, PostToolUse, Stop, SessionStart, etc. | fileEdited, fileCreated, preToolUse, postToolUse, promptSubmit, etc. |
| **MCP config** | `~/.claude.json` (global) | `.kiro/settings/mcp.json` (per-workspace) |
| **Skills/workflows** | `~/.claude/skills/` directories | Folded into steering files |
| **Context injection** | Always-on via CLAUDE.md | Three modes: `always`, `fileMatch`, `manual` |
| **Plugin system** | `.claude-plugin/` marketplace format | No plugin marketplace (copy `.kiro/` directory) |

### Key Differences in Practice

**1. Steering files replace multiple Claude Code concepts**

In Claude Code you had separate directories for rules, agents, skills, contexts, and commands. In Kiro, all of these collapse into `.kiro/steering/*.md` files with a frontmatter header controlling when they activate:

```markdown
---
inclusion: always          # Every interaction (like Claude Code rules)
inclusion: fileMatch       # When matching files are opened (like contexts)
inclusion: manual          # On-demand via # in chat (like commands)
---
```

**2. Hooks are simpler but less granular**

Claude Code hooks used complex matcher expressions:
```json
"matcher": "tool == \"Bash\" && tool_input.command matches \"git push\""
```

Kiro hooks use event types + file patterns or tool categories:
```json
{
  "when": { "type": "fileEdited", "patterns": ["*.ts"] },
  "then": { "type": "runCommand", "command": "npx tsc --noEmit" }
}
```

This is easier to write but less precise for filtering specific tool invocations.

**3. No dedicated agent definitions**

Claude Code let you define agents with specific `model` and `tools` restrictions. Kiro doesn't have this — instead it has built-in sub-agents (context-gatherer, general-task-execution) and you influence behavior through steering files rather than creating named agents.

**4. MCP is workspace-scoped**

Claude Code put MCP configuration in a global `~/.claude.json`. Kiro scopes it to `.kiro/settings/mcp.json` per workspace, making it easier to share project-specific server configs with your team.

**5. No session persistence hooks needed**

Claude Code required custom hooks (SessionStart, SessionEnd, PreCompact) to persist context across sessions. Kiro handles context continuity natively — you don't need to manage this yourself.

---

## Migration Reference

This plugin was migrated from the [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) repository.

### Component Mapping

Here's how each original component was translated:

| Claude Code Source | Kiro Destination | What Changed |
|--------------------|------------------|--------------|
| `rules/coding-style.md` | `.kiro/steering/coding-style.md` | Added `inclusion: always` frontmatter |
| `rules/security.md` | `.kiro/steering/security.md` | Added `inclusion: always` frontmatter |
| `rules/testing.md` | `.kiro/steering/testing.md` | Added `inclusion: always` frontmatter |
| `rules/git-workflow.md` | `.kiro/steering/git-workflow.md` | Added `inclusion: always` frontmatter |
| `rules/patterns.md` | `.kiro/steering/patterns.md` | Added `inclusion: always` frontmatter |
| `rules/performance.md` | `.kiro/steering/performance.md` | Added `inclusion: always` frontmatter |
| `rules/agents.md` | `.kiro/steering/agents-orchestration.md` | Adapted for Kiro's sub-agent model |
| `agents/security-reviewer.md` | `.kiro/steering/security-review.md` | Converted to conditional steering (`fileMatch`) |
| `commands/tdd.md` + `agents/tdd-guide.md` | `.kiro/steering/tdd-workflow.md` | Merged into manual steering file |
| `commands/plan.md` + `agents/planner.md` | `.kiro/steering/planning.md` | Merged into manual steering file |
| `commands/code-review.md` + `agents/code-reviewer.md` | `.kiro/steering/code-review.md` | Merged into manual steering file |
| `hooks/hooks.json` (PostToolUse: Prettier) | `.kiro/hooks/prettier-format.json` | Converted to Kiro hook format |
| `hooks/hooks.json` (PostToolUse: tsc check) | `.kiro/hooks/typescript-check.json` | Converted to Kiro hook format |
| `hooks/hooks.json` (PostToolUse: console.log) | `.kiro/hooks/console-log-warning.json` | Converted to Kiro hook format |
| `hooks/hooks.json` (PreToolUse: git push) | `.kiro/hooks/git-push-review.json` | Converted to preToolUse askAgent |
| `hooks/hooks.json` (PreToolUse: doc blocker) | `.kiro/hooks/review-write-operations.json` | Generalized to all write operations |
| `hooks/hooks.json` (SessionStart/End/PreCompact) | *Removed* | Not needed — Kiro handles natively |
| `mcp-configs/mcp-servers.json` | `.kiro/settings/mcp.json` | Kept 6 most useful servers, added `disabled` flag |
| `skills/*` | *Folded into steering* | Domain knowledge merged into relevant steering files |
| `contexts/dev.md`, `research.md`, `review.md` | *Removed* | Use manual steering for mode-switching |
| `examples/`, `scripts/`, `tests/` | *Removed* | Infrastructure not needed for Kiro |
| `.claude-plugin/` | *Removed* | Kiro has no plugin marketplace format |

### What Was Removed and Why

| Removed | Reason |
|---------|--------|
| `scripts/hooks/session-start.js` | Kiro manages context persistence natively |
| `scripts/hooks/session-end.js` | Same — no manual session tracking needed |
| `scripts/hooks/pre-compact.js` | Kiro handles compaction without user hooks |
| `scripts/hooks/suggest-compact.js` | Not applicable to Kiro's context model |
| `scripts/hooks/evaluate-session.js` | Continuous learning not supported via hooks in Kiro |
| `scripts/lib/utils.js` | Only existed to support the Node.js hook scripts |
| `scripts/lib/package-manager.js` | Package manager detection was a Claude Code feature |
| `agents/*.md` (all 9) | No agent definition format in Kiro; knowledge folded into steering |
| `skills/` (all 11 dirs) | Merged into steering files where relevant |
| `tests/` | Tested the now-removed Node.js scripts |

---

## License

MIT — Use freely, modify as needed, contribute back if you can.
