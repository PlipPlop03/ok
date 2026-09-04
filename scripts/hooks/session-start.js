#!/usr/bin/env node
/**
 * SessionStart Hook - Detect the project's package manager
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Reports which package manager (pnpm/bun/yarn/npm) this project resolves to,
 * so the toolkit's hooks and commands can use the right one. Prompts for a
 * preference only when nothing could be detected.
 */

const { log } = require('../lib/utils');
const { getPackageManager, getSelectionPrompt } = require('../lib/package-manager');

async function main() {
  const pm = getPackageManager();
  log(`[SessionStart] Package manager: ${pm.name} (${pm.source})`);

  if (pm.source === 'fallback' || pm.source === 'default') {
    log('[SessionStart] No package manager preference found.');
    log(getSelectionPrompt());
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[SessionStart] Error:', err.message);
  process.exit(0); // Don't block on errors
});
