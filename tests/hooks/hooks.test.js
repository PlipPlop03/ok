/**
 * Tests for hook scripts
 *
 * Run with: node tests/hooks/hooks.test.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync, spawn } = require('child_process');
const { getDateString, getSessionsDir } = require('../../scripts/lib/utils');

// Test helper
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

// Run a script and capture output
function runScript(scriptPath, input = '', env = {}, cwd = undefined) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [scriptPath], {
      cwd,
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

    proc.on('close', code => {
      resolve({ code, stdout, stderr });
    });

    proc.on('error', reject);
  });
}

// Message a hook returned as JSON on stdout (systemMessage or additionalContext)
function hookMessage(result) {
  if (!result.stdout.trim()) return '';
  const json = JSON.parse(result.stdout);
  return json.systemMessage || json.hookSpecificOutput?.additionalContext || '';
}

// Create a temporary test directory
function createTestDir() {
  const testDir = path.join(os.tmpdir(), `hooks-test-${Date.now()}`);
  fs.mkdirSync(testDir, { recursive: true });
  return testDir;
}

// Clean up test directory
function cleanupTestDir(testDir) {
  fs.rmSync(testDir, { recursive: true, force: true });
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

  if (await asyncTest('outputs session info to stderr', async () => {
    const result = await runScript(path.join(scriptsDir, 'session-start.js'));
    assert.ok(
      result.stderr.includes('[SessionStart]') ||
      result.stderr.includes('Package manager'),
      'Should output session info'
    );
  })) passed++; else failed++;

  // session-end.js tests
  console.log('\nsession-end.js:');

  if (await asyncTest('runs without error', async () => {
    const result = await runScript(path.join(scriptsDir, 'session-end.js'));
    assert.strictEqual(result.code, 0, `Exit code should be 0, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('creates or updates session file', async () => {
    // Read the date before and after, in case the run crosses midnight
    const before = getDateString();
    await runScript(path.join(scriptsDir, 'session-end.js'));
    const after = getDateString();

    const sessionFiles = [before, after].map(d => path.join(getSessionsDir(), `${d}-session.tmp`));
    assert.ok(sessionFiles.some(f => fs.existsSync(f)), 'Session file should exist');
  })) passed++; else failed++;

  // pre-compact.js tests
  console.log('\npre-compact.js:');

  if (await asyncTest('runs without error', async () => {
    const result = await runScript(path.join(scriptsDir, 'pre-compact.js'));
    assert.strictEqual(result.code, 0, `Exit code should be 0, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('outputs PreCompact message', async () => {
    const result = await runScript(path.join(scriptsDir, 'pre-compact.js'));
    assert.ok(result.stderr.includes('[PreCompact]'), 'Should output PreCompact message');
  })) passed++; else failed++;

  if (await asyncTest('creates compaction log', async () => {
    await runScript(path.join(scriptsDir, 'pre-compact.js'));
    const logFile = path.join(os.homedir(), '.claude', 'sessions', 'compaction-log.txt');
    assert.ok(fs.existsSync(logFile), 'Compaction log should exist');
  })) passed++; else failed++;

  // suggest-compact.js tests
  console.log('\nsuggest-compact.js:');

  if (await asyncTest('runs without error', async () => {
    const result = await runScript(path.join(scriptsDir, 'suggest-compact.js'), '', {
      CLAUDE_SESSION_ID: 'test-session-' + Date.now()
    });
    assert.strictEqual(result.code, 0, `Exit code should be 0, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('increments counter on each call', async () => {
    const sessionId = 'test-counter-' + Date.now();

    // Run multiple times
    for (let i = 0; i < 3; i++) {
      await runScript(path.join(scriptsDir, 'suggest-compact.js'), '', {
        CLAUDE_SESSION_ID: sessionId
      });
    }

    // Check counter file
    const counterFile = path.join(os.tmpdir(), `claude-tool-count-${sessionId}`);
    const count = parseInt(fs.readFileSync(counterFile, 'utf8').trim(), 10);
    assert.strictEqual(count, 3, `Counter should be 3, got ${count}`);

    // Cleanup
    fs.unlinkSync(counterFile);
  })) passed++; else failed++;

  if (await asyncTest('suggests compact at threshold', async () => {
    const sessionId = 'test-threshold-' + Date.now();
    const counterFile = path.join(os.tmpdir(), `claude-tool-count-${sessionId}`);

    // Set counter to threshold - 1
    fs.writeFileSync(counterFile, '49');

    const result = await runScript(path.join(scriptsDir, 'suggest-compact.js'), '', {
      CLAUDE_SESSION_ID: sessionId,
      COMPACT_THRESHOLD: '50'
    });

    assert.ok(
      result.stderr.includes('50 tool calls reached'),
      'Should suggest compact at threshold'
    );

    // Cleanup
    fs.unlinkSync(counterFile);
  })) passed++; else failed++;

  // evaluate-session.js tests
  console.log('\nevaluate-session.js:');

  if (await asyncTest('runs without error when no transcript', async () => {
    const result = await runScript(path.join(scriptsDir, 'evaluate-session.js'));
    assert.strictEqual(result.code, 0, `Exit code should be 0, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('skips short sessions', async () => {
    const testDir = createTestDir();
    const transcriptPath = path.join(testDir, 'transcript.jsonl');

    // Create a short transcript (less than 10 user messages)
    const transcript = Array(5).fill('{"type":"user","content":"test"}\n').join('');
    fs.writeFileSync(transcriptPath, transcript);

    const result = await runScript(path.join(scriptsDir, 'evaluate-session.js'), '', {
      CLAUDE_TRANSCRIPT_PATH: transcriptPath
    });

    assert.ok(
      result.stderr.includes('Session too short'),
      'Should indicate session is too short'
    );

    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (await asyncTest('processes sessions with enough messages', async () => {
    const testDir = createTestDir();
    const transcriptPath = path.join(testDir, 'transcript.jsonl');

    // Create a longer transcript (more than 10 user messages)
    const transcript = Array(15).fill('{"type":"user","content":"test"}\n').join('');
    fs.writeFileSync(transcriptPath, transcript);

    const result = await runScript(path.join(scriptsDir, 'evaluate-session.js'), '', {
      CLAUDE_TRANSCRIPT_PATH: transcriptPath
    });

    assert.ok(
      result.stderr.includes('15 messages'),
      'Should report message count'
    );

    cleanupTestDir(testDir);
  })) passed++; else failed++;

  // hooks.json validation
  console.log('\nhooks.json Validation:');

  if (test('hooks.json is valid JSON', () => {
    const hooksPath = path.join(__dirname, '..', '..', 'hooks', 'hooks.json');
    const content = fs.readFileSync(hooksPath, 'utf8');
    JSON.parse(content); // Will throw if invalid
  })) passed++; else failed++;

  if (test('hooks.json has required event types', () => {
    const hooksPath = path.join(__dirname, '..', '..', 'hooks', 'hooks.json');
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));

    assert.ok(hooks.hooks.PreToolUse, 'Should have PreToolUse hooks');
    assert.ok(hooks.hooks.PostToolUse, 'Should have PostToolUse hooks');
    assert.ok(hooks.hooks.SessionStart, 'Should have SessionStart hooks');
    assert.ok(hooks.hooks.Stop, 'Should have Stop hooks');
    assert.ok(hooks.hooks.PreCompact, 'Should have PreCompact hooks');
  })) passed++; else failed++;

  if (test('all hook commands use node', () => {
    const hooksPath = path.join(__dirname, '..', '..', 'hooks', 'hooks.json');
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));

    const checkHooks = (hookArray) => {
      for (const entry of hookArray) {
        for (const hook of entry.hooks) {
          if (hook.type === 'command') {
            assert.ok(
              hook.command.startsWith('node'),
              `Hook command should start with 'node': ${hook.command.substring(0, 50)}...`
            );
          }
        }
      }
    };

    for (const [eventType, hookArray] of Object.entries(hooks.hooks)) {
      checkHooks(hookArray);
    }
  })) passed++; else failed++;

  if (test('script references use CLAUDE_PLUGIN_ROOT variable', () => {
    const hooksPath = path.join(__dirname, '..', '..', 'hooks', 'hooks.json');
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));

    const checkHooks = (hookArray) => {
      for (const entry of hookArray) {
        for (const hook of entry.hooks) {
          if (hook.type === 'command' && hook.command.includes('scripts/hooks/')) {
            // Check for the literal string "${CLAUDE_PLUGIN_ROOT}" in the command
            const hasPluginRoot = hook.command.includes('${CLAUDE_PLUGIN_ROOT}');
            assert.ok(
              hasPluginRoot,
              `Script paths should use CLAUDE_PLUGIN_ROOT: ${hook.command.substring(0, 80)}...`
            );
          }
        }
      }
    };

    for (const [eventType, hookArray] of Object.entries(hooks.hooks)) {
      checkHooks(hookArray);
    }
  })) passed++; else failed++;

  if (test('matchers are tool-name patterns, not expressions', () => {
    const hooksPath = path.join(__dirname, '..', '..', 'hooks', 'hooks.json');
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));

    for (const hookArray of Object.values(hooks.hooks)) {
      for (const entry of hookArray) {
        if (entry.matcher === undefined) continue;
        assert.ok(
          /^(\*|[A-Za-z_]+(\|[A-Za-z_]+)*)$/.test(entry.matcher),
          `Matcher should be a tool name pattern like "Edit|Write": ${entry.matcher}`
        );
      }
    }
  })) passed++; else failed++;

  // git-push-reminder.js tests
  console.log('\ngit-push-reminder.js:');

  if (await asyncTest('reminds on git push only', async () => {
    const script = path.join(scriptsDir, 'git-push-reminder.js');
    const push = await runScript(script, JSON.stringify({ tool_input: { command: 'git push origin main' } }));
    const other = await runScript(script, JSON.stringify({ tool_input: { command: 'git status' } }));
    assert.strictEqual(push.code, 0);
    assert.ok(hookMessage(push).includes('Review changes before push'), 'Should remind on git push');
    assert.strictEqual(hookMessage(other), '', 'Should be silent for other commands');
  })) passed++; else failed++;

  // pr-url-logger.js tests
  console.log('\npr-url-logger.js:');

  if (await asyncTest('logs PR URL and review command', async () => {
    const input = {
      tool_input: { command: 'gh pr create --fill' },
      tool_response: { stdout: 'https://github.com/acme/app/pull/42\n' }
    };
    const result = await runScript(path.join(scriptsDir, 'pr-url-logger.js'), JSON.stringify(input));
    assert.ok(hookMessage(result).includes('PR created: https://github.com/acme/app/pull/42'));
    assert.ok(hookMessage(result).includes('gh pr review 42 --repo acme/app'));
  })) passed++; else failed++;

  // post-edit.js tests
  console.log('\npost-edit.js:');

  // Writes a fake package whose bin records its arguments, or prints canned output
  const fakePackage = (dir, name, binName, body) => {
    const pkgDir = path.join(dir, 'node_modules', name);
    fs.mkdirSync(path.join(pkgDir, 'bin'), { recursive: true });
    fs.writeFileSync(path.join(pkgDir, 'package.json'), JSON.stringify({
      name, version: '1.0.0', bin: { [binName]: './bin/cli.js' }
    }));
    fs.writeFileSync(path.join(pkgDir, 'bin', 'cli.js'), body);
  };

  if (await asyncTest('warns about console.log in edited file', async () => {
    const testDir = createTestDir();
    const file = path.join(testDir, 'a.js');
    fs.writeFileSync(file, 'const a = 1;\nconsole.log(a);\n');
    const result = await runScript(path.join(scriptsDir, 'post-edit.js'), JSON.stringify({ tool_input: { file_path: file } }));
    assert.ok(hookMessage(result).includes('console.log found'), 'Should warn about console.log');
    assert.ok(hookMessage(result).includes('2: console.log(a);'), 'Should show line number');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (await asyncTest('passes file path to Prettier without a shell', async () => {
    const testDir = createTestDir();
    const marker = path.join(testDir, 'prettier-args.json');
    fakePackage(testDir, 'prettier', 'prettier',
      `require('fs').writeFileSync(${JSON.stringify(marker)}, JSON.stringify(process.argv.slice(2)));`);
    const file = path.join(testDir, '$(touch pwned).ts');
    fs.writeFileSync(file, 'const a = 1;\n');

    await runScript(path.join(scriptsDir, 'post-edit.js'), JSON.stringify({ tool_input: { file_path: file } }), {}, testDir);

    assert.deepStrictEqual(JSON.parse(fs.readFileSync(marker, 'utf8')), ['--write', file]);
    assert.ok(!fs.existsSync(path.join(testDir, 'pwned')), 'Filename must not be executed');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (await asyncTest('reports Prettier failures', async () => {
    const testDir = createTestDir();
    fakePackage(testDir, 'prettier', 'prettier',
      "console.error('SyntaxError: Unexpected token (1:7)'); process.exit(2);");
    const file = path.join(testDir, 'broken.js');
    fs.writeFileSync(file, 'const = ;\n');

    const result = await runScript(path.join(scriptsDir, 'post-edit.js'), JSON.stringify({ tool_input: { file_path: file } }));

    assert.ok(hookMessage(result).includes('Prettier failed'), 'Should report the failure');
    assert.ok(hookMessage(result).includes('Unexpected token'), 'Should include Prettier error');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (await asyncTest('reports tsc errors only for the edited file', async () => {
    const testDir = createTestDir();
    fs.writeFileSync(path.join(testDir, 'tsconfig.json'), '{}');
    fakePackage(testDir, 'typescript', 'tsc', [
      "console.log('src/a/index.ts(1,7): error TS2322: in a');",
      "console.log('src/b/index.ts(2,7): error TS2322: in b');",
      'process.exit(2);'
    ].join('\n'));
    const file = path.join(testDir, 'src', 'a', 'index.ts');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, 'const a: number = "x";\n');

    const result = await runScript(path.join(scriptsDir, 'post-edit.js'), JSON.stringify({ tool_input: { file_path: file } }));

    assert.ok(hookMessage(result).includes('in a'), 'Should report error in edited file');
    assert.ok(!hookMessage(result).includes('in b'), 'Should not report same-named file elsewhere');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (await asyncTest('ignores non-JS/TS files', async () => {
    const testDir = createTestDir();
    const file = path.join(testDir, 'notes.md');
    fs.writeFileSync(file, 'console.log in prose\n');
    const result = await runScript(path.join(scriptsDir, 'post-edit.js'), JSON.stringify({ tool_input: { file_path: file } }));
    assert.strictEqual(result.code, 0);
    assert.strictEqual(hookMessage(result), '');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  // console-log-audit.js tests
  console.log('\nconsole-log-audit.js:');

  if (await asyncTest('finds modified and untracked files from a subdirectory', async () => {
    const testDir = createTestDir();
    const gitIn = args => execSync(`git ${args}`, { cwd: testDir, stdio: 'pipe' });
    gitIn('init -q');
    gitIn('config user.email test@example.com');
    gitIn('config user.name test');
    const sub = path.join(testDir, 'packages', 'web');
    fs.mkdirSync(sub, { recursive: true });
    fs.writeFileSync(path.join(sub, 'tracked.js'), 'const a = 1;\n');
    gitIn('add -A');
    gitIn('commit -qm init');
    fs.writeFileSync(path.join(sub, 'tracked.js'), 'console.log(1);\n');
    fs.writeFileSync(path.join(sub, 'new.ts'), 'console.log(2);\n');

    const result = await runScript(path.join(scriptsDir, 'console-log-audit.js'), '{}', {}, sub);

    assert.ok(hookMessage(result).includes('tracked.js'), 'Should flag modified file');
    assert.ok(hookMessage(result).includes('new.ts'), 'Should flag untracked file');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (await asyncTest('exits quietly outside a git repo', async () => {
    const testDir = createTestDir();
    const result = await runScript(path.join(scriptsDir, 'console-log-audit.js'), '{}', {}, testDir);
    assert.strictEqual(result.code, 0);
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  // Summary
  console.log('\n=== Test Results ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
