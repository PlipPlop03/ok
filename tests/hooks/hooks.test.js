/**
 * Tests for hook scripts
 *
 * Run with: node tests/hooks/hooks.test.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Async test helper
async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

// Run a script and capture output
function runScript(scriptPath, input = '', env = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [scriptPath], {
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', data => stdout += data);
    proc.stderr.on('data', data => stderr += data);

    if (input) {
      proc.stdin.write(input);
    }
    proc.stdin.end();

    proc.on('close', code => resolve({ code, stdout, stderr }));
    proc.on('error', reject);
  });
}

// Test suite
async function runTests() {
  console.log('\n=== Testing Hook Scripts ===\n');

  let passed = 0;
  let failed = 0;

  const scriptsDir = path.join(__dirname, '..', '..', 'scripts', 'hooks');

  // session-start.js tests
  console.log('session-start.js:');

  if (await asyncTest('runs without error', async () => {
    const result = await runScript(path.join(scriptsDir, 'session-start.js'));
    assert.strictEqual(result.code, 0, `Exit code should be 0, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('reports the detected package manager', async () => {
    const result = await runScript(path.join(scriptsDir, 'session-start.js'));
    assert.ok(
      result.stderr.includes('[SessionStart]') && result.stderr.includes('Package manager'),
      'Should report the package manager'
    );
  })) passed++; else failed++;

  // format.js tests (use a non-existent file so no formatter actually runs)
  console.log('\nformat.js:');

  if (await asyncTest('runs without error and passes payload through', async () => {
    const payload = JSON.stringify({ tool_input: { file_path: '/nonexistent/file.ts' } });
    const result = await runScript(path.join(scriptsDir, 'format.js'), payload);
    assert.strictEqual(result.code, 0, `Exit code should be 0, got ${result.code}`);
    assert.ok(result.stdout.includes('file.ts'), 'Should echo the hook payload to stdout');
  })) passed++; else failed++;

  // tsc-check.js tests
  console.log('\ntsc-check.js:');

  if (await asyncTest('runs without error and passes payload through', async () => {
    const payload = JSON.stringify({ tool_input: { file_path: '/nonexistent/file.ts' } });
    const result = await runScript(path.join(scriptsDir, 'tsc-check.js'), payload);
    assert.strictEqual(result.code, 0, `Exit code should be 0, got ${result.code}`);
    assert.ok(result.stdout.includes('file.ts'), 'Should echo the hook payload to stdout');
  })) passed++; else failed++;

  // hooks.json validation
  console.log('\nhooks.json Validation:');

  const hooksPath = path.join(__dirname, '..', '..', 'hooks', 'hooks.json');

  if (test('hooks.json is valid JSON', () => {
    JSON.parse(fs.readFileSync(hooksPath, 'utf8'));
  })) passed++; else failed++;

  if (test('hooks.json has the expected event types', () => {
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));
    assert.ok(hooks.hooks.PreToolUse, 'Should have PreToolUse hooks');
    assert.ok(hooks.hooks.PostToolUse, 'Should have PostToolUse hooks');
    assert.ok(hooks.hooks.SessionStart, 'Should have SessionStart hooks');
    assert.ok(hooks.hooks.Stop, 'Should have Stop hooks');
  })) passed++; else failed++;

  if (test('does not reference removed subsystems', () => {
    const raw = fs.readFileSync(hooksPath, 'utf8');
    for (const gone of ['PreCompact', 'SessionEnd', 'session-end', 'pre-compact', 'suggest-compact', 'evaluate-session']) {
      assert.ok(!raw.includes(gone), `hooks.json should not reference '${gone}'`);
    }
  })) passed++; else failed++;

  if (test('all hook commands use node', () => {
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));
    for (const hookArray of Object.values(hooks.hooks)) {
      for (const entry of hookArray) {
        for (const hook of entry.hooks) {
          if (hook.type === 'command') {
            assert.ok(hook.command.startsWith('node'), `Hook command should start with 'node'`);
          }
        }
      }
    }
  })) passed++; else failed++;

  if (test('script references use CLAUDE_PLUGIN_ROOT', () => {
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));
    for (const hookArray of Object.values(hooks.hooks)) {
      for (const entry of hookArray) {
        for (const hook of entry.hooks) {
          if (hook.type === 'command' && hook.command.includes('scripts/hooks/')) {
            assert.ok(
              hook.command.includes('${CLAUDE_PLUGIN_ROOT}'),
              `Script paths should use CLAUDE_PLUGIN_ROOT`
            );
          }
        }
      }
    }
  })) passed++; else failed++;

  // Summary
  console.log('\n=== Test Results ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
