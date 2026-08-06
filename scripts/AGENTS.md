# scripts/

Cross-platform Node.js utilities used by hooks and slash commands. Rewritten
from shell scripts so they work identically on Windows, macOS, and Linux.

## Structure

- `lib/` — shared utilities (`utils.js` for file/path/system helpers,
  `package-manager.js` for package-manager detection).
- `hooks/` — hook implementations invoked from `hooks/hooks.json`
  (`session-start.js`, `session-end.js`, `pre-compact.js`,
  `suggest-compact.js`, `evaluate-session.js`).
- `setup-package-manager.js` — interactive/CLI package-manager setup, also
  exposed as the `/setup-pm` command.
- `validate-frontmatter.js` — checks that `agents/*.md`, `commands/*.md`,
  and `skills/**/SKILL.md` have the required frontmatter fields. Run before
  committing new agents/commands/skills, and enforced in CI.

## Conventions

- Node.js only, no OS-specific shell calls — that's the entire reason these
  were rewritten from shell scripts. If you need a system operation, add it
  to `lib/utils.js` rather than shelling out to a platform-specific command.
- Every new script under `lib/` or `hooks/` should have a matching
  `*.test.js` under `tests/` and be added to the list in
  `tests/run-all.js`.
- Package-manager selection always goes through
  `lib/package-manager.js` — see the priority order documented in the root
  [README.md](../README.md#package-manager-detection). Don't hardcode
  `npm`/`pnpm`/`yarn`/`bun` elsewhere.
