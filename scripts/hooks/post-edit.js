#!/usr/bin/env node
/**
 * PostToolUse Hook (Edit|Write) - Checks after editing JS/TS files
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * For the edited file:
 * - Formats it with the project's local Prettier (if installed)
 * - Warns about console.log statements
 * - For .ts/.tsx, runs the project's local TypeScript compiler (if installed)
 *   and reports errors in that file only
 *
 * Tools are never downloaded, and the file path is always passed as an
 * argument (never through a shell).
 */

const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { readStdinJson, readFile, log, isWindows } = require('../lib/utils');

const JS_TS = /\.(ts|tsx|js|jsx)$/;
const TS = /\.(ts|tsx)$/;

/**
 * Find a package's bin script in the project that contains fromDir.
 * Returns null when the package isn't installed there.
 */
function resolveLocalBin(pkg, binName, fromDir) {
  try {
    const pkgJson = require.resolve(`${pkg}/package.json`, { paths: [fromDir] });
    const { bin } = JSON.parse(fs.readFileSync(pkgJson, 'utf8'));
    const rel = typeof bin === 'string' ? bin : bin?.[binName];
    return rel ? path.join(path.dirname(pkgJson), rel) : null;
  } catch {
    return null;
  }
}

function runPrettier(filePath) {
  const bin = resolveLocalBin('prettier', 'prettier', path.dirname(filePath));
  if (!bin) return;
  try {
    execFileSync(process.execPath, [bin, '--write', filePath], { stdio: 'pipe' });
  } catch {
    // Formatting is best-effort
  }
}

function warnConsoleLog(filePath) {
  const content = readFile(filePath);
  if (!content) return;

  const matches = [];
  content.split('\n').forEach((line, idx) => {
    if (/console\.log/.test(line)) matches.push(`${idx + 1}: ${line.trim()}`);
  });

  if (matches.length > 0) {
    log(`[Hook] WARNING: console.log found in ${filePath}`);
    matches.slice(0, 5).forEach(m => log(m));
    log('[Hook] Remove console.log before committing');
  }
}

function findTsconfigDir(filePath) {
  let dir = path.dirname(filePath);
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'tsconfig.json'))) return dir;
    dir = path.dirname(dir);
  }
  return null;
}

function samePath(a, b) {
  const na = path.resolve(a);
  const nb = path.resolve(b);
  return isWindows ? na.toLowerCase() === nb.toLowerCase() : na === nb;
}

function runTypeCheck(filePath) {
  const projectDir = findTsconfigDir(filePath);
  if (!projectDir) return;

  const bin = resolveLocalBin('typescript', 'tsc', projectDir);
  if (!bin) return;

  let output = '';
  try {
    execFileSync(process.execPath, [bin, '--noEmit', '--pretty', 'false'], {
      cwd: projectDir,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return;
  } catch (err) {
    output = err.stdout || '';
  }

  // tsc lines look like: src/a/index.ts(3,5): error TS2322: ...
  const errors = output.split('\n').filter(line => {
    const m = line.match(/^(.+?)\(\d+,\d+\): /);
    return m && samePath(path.resolve(projectDir, m[1]), filePath);
  });

  if (errors.length > 0) {
    log(errors.slice(0, 10).join('\n'));
  }
}

async function main() {
  const input = await readStdinJson();
  const filePath = input.tool_input?.file_path;

  if (!filePath || !JS_TS.test(filePath) || !fs.existsSync(filePath)) {
    process.exit(0);
  }

  runPrettier(filePath);
  warnConsoleLog(filePath);
  if (TS.test(filePath)) runTypeCheck(filePath);

  process.exit(0);
}

main().catch(err => {
  console.error('[PostEdit] Error:', err.message);
  process.exit(0);
});
