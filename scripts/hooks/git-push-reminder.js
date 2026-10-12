#!/usr/bin/env node
/**
 * PreToolUse Hook (Bash) - Reminder before git push
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Prints a reminder to review changes when Claude is about to run git push.
 * Never blocks the command.
 */

const { readStdinJson, output } = require('../lib/utils');

async function main() {
  const input = await readStdinJson();
  const command = input.tool_input?.command || '';

  if (/\bgit push\b/.test(command)) {
    output({
      systemMessage: '[Hook] Review changes before push. Continuing with push (remove this hook to add interactive review)'
    });
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[GitPushReminder] Error:', err.message);
  process.exit(0);
});
