# CLAUDE.md

This file is the always-on entry point Claude Code loads when working in
this repository. It gives Claude project context automatically instead of
starting every session with none.

## What this repo is

**Everything Claude Code** is a Claude Code **plugin** distributing
production configs: `agents/`, `skills/`, `commands/`, `rules/`, `hooks/`,
`contexts/`, `mcp-configs/`, and cross-platform Node.js `scripts/`. See
[README.md](README.md) for the full directory map and installation options.

## Conventions when contributing

- **Agents** (`agents/*.md`) require YAML frontmatter with `name`,
  `description`, `tools`, and `model`. See any file in `agents/` for the
  pattern.
- **Commands** (`commands/*.md`) require a `description` field in
  frontmatter.
- **Skills** (`skills/**/SKILL.md`) require `name` and `description` in
  frontmatter — this is what Claude Code uses to discover and route to a
  skill. A skill without it is silently invisible.
- Run `node scripts/validate-frontmatter.js` before committing to catch
  missing/malformed frontmatter in agents, commands, and skills.
- See [CONTRIBUTING.md](CONTRIBUTING.md) for where to place new
  contributions and the PR process.

## Test command

```bash
node tests/run-all.js
```

Runs the full suite (`tests/lib/*.test.js`, `tests/hooks/*.test.js`). CI runs
this automatically on every push and pull request — see
`.github/workflows/ci.yml`.

## Scripts

Cross-platform Node.js utilities live in `scripts/`. See
[scripts/AGENTS.md](scripts/AGENTS.md) for conventions specific to that
directory (package-manager detection, hook implementations).
