#!/usr/bin/env node
/**
 * PostToolUse Hook (Bash) - Log PR URL after gh pr create
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * When a Bash command ran `gh pr create`, finds the PR URL in the tool
 * response and prints it with a ready-to-run review command.
 */

const { readStdinJson, output } = require('../lib/utils');

async function main() {
  const input = await readStdinJson();
  const command = input.tool_input?.command || '';

  if (/gh pr create/.test(command)) {
    const response = JSON.stringify(input.tool_response || '');
    const match = response.match(/https:\/\/github\.com\/([^/\s"]+\/[^/\s"]+)\/pull\/(\d+)/);

    if (match) {
      const [url, repo, pr] = match;
      output({
        systemMessage: `[Hook] PR created: ${url}\n[Hook] To review: gh pr review ${pr} --repo ${repo}`
      });
    }
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[PrUrlLogger] Error:', err.message);
  process.exit(0);
});
