# Hooks System

## Hook Types

- **SessionStart**: When a session begins (context/environment detection)
- **PreToolUse**: Before tool execution (validation, reminders)
- **PostToolUse**: After tool execution (auto-format, checks)
- **Stop**: When the response ends (final verification)

## Current Hooks (in `hooks/hooks.json`)

### SessionStart
- **package-manager detection**: Reports which package manager the project resolves to
  (pnpm/bun/yarn/npm), so the format/check hooks use the right one.

### PreToolUse
- **git push reminder**: Prints a reminder to review changes before `git push`.

### PostToolUse
- **PR creation**: Logs the PR URL and a ready-to-run review command after `gh pr create`.
- **Prettier**: Auto-formats JS/TS files after edit, via the project's package manager.
- **TypeScript check**: Runs `tsc --noEmit` after editing .ts/.tsx files, via the project's
  package manager.
- **console.log warning**: Warns about `console.log` in the edited file.

### Stop
- **console.log audit**: Checks all modified files for `console.log` before the response ends.

## Auto-Accept Permissions

Use with caution:
- Enable for trusted, well-defined plans
- Disable for exploratory work
- Never use dangerously-skip-permissions flag
- Configure `allowedTools` in `~/.claude.json` instead

## TodoWrite Best Practices

Use TodoWrite tool to:
- Track progress on multi-step tasks
- Verify understanding of instructions
- Enable real-time steering
- Show granular implementation steps

Todo list reveals:
- Out of order steps
- Missing items
- Extra unnecessary items
- Wrong granularity
- Misinterpreted requirements
