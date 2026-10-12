#!/usr/bin/env node
/**
 * Stop Hook - Audit changed files for console.log
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * After each response, checks modified and untracked JS/TS files in the
 * current git repo for console.log statements. Paths are resolved from the
 * repo root, so this works when Claude's working directory is a subfolder.
 * Findings are shown to the user as a systemMessage.
 */

const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { output } = require('../lib/utils');

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: 'pipe' }).trim();
}

function main() {
  let root;
  try {
    root = git(['rev-parse', '--show-toplevel']);
  } catch {
    process.exit(0); // Not a git repo
  }

  const listed = [];
  try {
    listed.push(...git(['-C', root, 'diff', '--name-only', 'HEAD']).split('\n'));
  } catch {
    // No HEAD yet (fresh repo) - untracked files below still apply
  }
  try {
    listed.push(...git(['-C', root, 'ls-files', '--others', '--exclude-standard']).split('\n'));
  } catch {
    // Ignore
  }

  const files = [...new Set(listed)]
    .filter(f => /\.(ts|tsx|js|jsx)$/.test(f))
    .map(f => path.join(root, f))
    .filter(f => fs.existsSync(f));

  const flagged = files
    .filter(file => fs.readFileSync(file, 'utf8').includes('console.log'))
    .map(file => `[Hook] WARNING: console.log found in ${path.relative(root, file)}`);

  if (flagged.length > 0) {
    output({
      systemMessage: [...flagged, '[Hook] Remove console.log statements before committing'].join('\n')
    });
  }

  process.exit(0);
}

try {
  main();
} catch (err) {
  console.error('[ConsoleLogAudit] Error:', err.message);
  process.exit(0);
}
