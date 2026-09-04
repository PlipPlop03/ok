#!/usr/bin/env node
/**
 * PostToolUse Hook - Type-check edited TypeScript files
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs after Edit on .ts/.tsx files. Runs `tsc --noEmit` from the nearest
 * tsconfig.json directory, using the project's package manager (pnpm/bun/yarn/
 * npm) instead of hardcoding npx, and surfaces any errors for the edited file.
 */

const fs = require('fs');
const path = require('path');
const { readStdinJson, runCommand, log, output } = require('../lib/utils');
const { getExecCommand } = require('../lib/package-manager');

const TS_FILE = /\.(ts|tsx)$/;

/**
 * Walk up from a file to find the directory holding tsconfig.json.
 */
function findTsconfigDir(filePath) {
  let dir = path.dirname(filePath);
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'tsconfig.json'))) return dir;
    dir = path.dirname(dir);
  }
  return null;
}

async function main() {
  const input = await readStdinJson();
  const filePath = input.tool_input && input.tool_input.file_path;

  if (filePath && TS_FILE.test(filePath) && fs.existsSync(filePath)) {
    const tsconfigDir = findTsconfigDir(filePath);
    if (tsconfigDir) {
      const cmd = getExecCommand('tsc', '--noEmit --pretty false', { projectDir: tsconfigDir });
      // runCommand returns stderr/stdout in .output whether it passes or fails.
      const result = runCommand(`${cmd} 2>&1`, { cwd: tsconfigDir });
      const lines = (result.output || '')
        .split('\n')
        .filter(line => line.includes(filePath))
        .slice(0, 10);
      if (lines.length) log(lines.join('\n'));
    }
  }

  output(input);
  process.exit(0);
}

main().catch(() => process.exit(0));
