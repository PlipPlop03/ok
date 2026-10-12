# Hooks System

## Hook Types

- **PreToolUse**: Before tool execution (validation, parameter modification)
- **PostToolUse**: After tool execution (auto-format, checks)
- **Stop**: When session ends (final verification)

## Current Hooks (in ~/.claude/settings.json)

### PreToolUse
- **git push reminder**: Prints a reminder to review changes before push (does not block)
- **strategic compact**: Suggests /compact at logical intervals

### PostToolUse
- **PR creation**: Logs PR URL and a `gh pr review` command
- **Post-edit checks** (JS/TS files, after Edit or Write):
  - Prettier: formats the file if Prettier is installed in the project
  - console.log warning: warns about console.log in the edited file
  - TypeScript check: runs the project's tsc for .ts/.tsx files and reports errors in the edited file

### Stop
- **console.log audit**: Checks modified and untracked JS/TS files for console.log after each response

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
