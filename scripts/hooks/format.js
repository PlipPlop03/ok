#!/usr/bin/env node
/**
 * PostToolUse Hook - Auto-format edited JS/TS files
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs after Edit/Write on .ts/.tsx/.js/.jsx files. Formats the file with
 * Prettier using whatever package manager the file's project uses (pnpm/bun/
 * yarn/npm) instead of hardcoding npx.
 */

const fs = require('fs');
const path = require('path');
const { readStdinJson, runCommand, output } = require('../lib/utils');
const { getExecCommand } = require('../lib/package-manager');

const FORMATTABLE = /\.(ts|tsx|js|jsx)$/;

/**
 * Walk up from a file to find the directory holding package.json
 * (falls back to the file's own directory).
 */
function findProjectDir(filePath) {
  let dir = path.dirname(filePath);
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    dir = path.dirname(dir);
  }
  return path.dirname(filePath);
}

async function main() {
  const input = await readStdinJson();
  const filePath = input.tool_input && input.tool_input.file_path;

  if (filePath && FORMATTABLE.test(filePath) && fs.existsSync(filePath)) {
    const projectDir = findProjectDir(filePath);
    const cmd = getExecCommand('prettier', `--write "${filePath}"`, { projectDir });
    runCommand(cmd, { cwd: projectDir });
  }

  // Pass the hook payload through unchanged.
  output(input);
  process.exit(0);
}

main().catch(() => process.exit(0));
