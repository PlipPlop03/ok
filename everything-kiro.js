#!/usr/bin/env node
/**
 * everything-kiro — Cross-platform CLI for managing Everything Kiro configurations
 *
 * Works on Windows, macOS, and Linux.
 *
 * Setup:
 *   git clone https://github.com/aliakbr/everything-claude-code-kiro-migration.git ~/.everything-kiro
 *   npm link   (from inside ~/.everything-kiro)
 *
 * Usage:
 *   everything-kiro install              # Install all components into current directory
 *   everything-kiro install --force      # Overwrite existing files
 *   everything-kiro install --dry-run    # Preview without changes
 *   everything-kiro install --steering-only
 *   everything-kiro install --hooks-only
 *   everything-kiro install --mcp-only
 *   everything-kiro update               # Update the CLI to latest
 *   everything-kiro help                 # Show help
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const VERSION = '1.0.0'

// Colors (with Windows fallback)
const supportsColor = process.stdout.isTTY && (process.env.TERM !== 'dumb')
const c = {
  red: supportsColor ? '\x1b[0;31m' : '',
  green: supportsColor ? '\x1b[0;32m' : '',
  yellow: supportsColor ? '\x1b[1;33m' : '',
  blue: supportsColor ? '\x1b[0;34m' : '',
  dim: supportsColor ? '\x1b[0;90m' : '',
  bold: supportsColor ? '\x1b[1m' : '',
  reset: supportsColor ? '\x1b[0m' : '',
}

// Utilities
const info = (msg) => console.log(`${c.blue}▶${c.reset} ${msg}`)
const success = (msg) => console.log(`${c.green}✓${c.reset} ${msg}`)
const warn = (msg) => console.log(`${c.yellow}⚠${c.reset} ${msg}`)
const skip = (msg) => console.log(`${c.dim}  skip${c.reset} ${msg} (already exists)`)
const dry = (msg) => console.log(`${c.dim}  would create${c.reset} ${msg}`)
const error = (msg) => console.error(`${c.red}✗${c.reset} ${msg}`)

// Resolve the source .kiro directory (follows symlinks)
function getSourceDir() {
  const scriptPath = fs.realpathSync(process.argv[1])
  const scriptDir = path.dirname(scriptPath)
  return path.join(scriptDir, '.kiro')
}

// Recursively create directory
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// Copy a single file with skip/force/dry-run logic
function installFile(src, dst, baseDir, options) {
  const relPath = path.relative(baseDir, dst)

  if (options.dryRun) {
    dry(relPath)
    return
  }

  if (fs.existsSync(dst) && !options.force) {
    skip(relPath)
    return
  }

  ensureDir(path.dirname(dst))
  fs.copyFileSync(src, dst)
  success(relPath)
}

// List files matching a pattern in a directory
function listFiles(dir, ext) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(ext))
    .map(f => path.join(dir, f))
}

// Commands
function cmdInstall(args) {
  const options = {
    force: args.includes('--force'),
    dryRun: args.includes('--dry-run'),
    steeringOnly: args.includes('--steering-only'),
    hooksOnly: args.includes('--hooks-only'),
    mcpOnly: args.includes('--mcp-only'),
  }

  // Validate flags
  const validFlags = ['--force', '--dry-run', '--steering-only', '--hooks-only', '--mcp-only']
  const unknownFlags = args.filter(a => a.startsWith('--') && !validFlags.includes(a))
  if (unknownFlags.length > 0) {
    error(`Unknown flag: ${unknownFlags[0]}`)
    console.log("Run 'everything-kiro help' for usage")
    process.exit(1)
  }

  const installSteering = !options.hooksOnly && !options.mcpOnly
  const installHooks = !options.steeringOnly && !options.mcpOnly
  const installMcp = !options.steeringOnly && !options.hooksOnly

  const sourceDir = getSourceDir()
  const targetDir = process.env.KIRO_TARGET_DIR
    ? path.resolve(process.env.KIRO_TARGET_DIR)
    : process.cwd()
  const kiroDir = path.join(targetDir, '.kiro')

  // Verify source exists
  if (!fs.existsSync(sourceDir)) {
    error(`Cannot find .kiro source directory at ${sourceDir}`)
    console.log("Make sure the repository is intact. Run 'everything-kiro update' to re-download.")
    process.exit(1)
  }

  console.log('')
  console.log(`${c.bold}Everything Kiro${c.reset} v${VERSION}`)
  console.log(`${c.dim}Installing to: ${targetDir}${c.reset}`)
  console.log('')

  // Install steering files
  if (installSteering) {
    info('Installing steering files...')
    const steeringDir = path.join(sourceDir, 'steering')
    const files = listFiles(steeringDir, '.md')
    for (const file of files) {
      const dst = path.join(kiroDir, 'steering', path.basename(file))
      installFile(file, dst, targetDir, options)
    }
    console.log('')
  }

  // Install hooks
  if (installHooks) {
    info('Installing hooks...')
    const hooksDir = path.join(sourceDir, 'hooks')
    const files = listFiles(hooksDir, '.json')
    for (const file of files) {
      const dst = path.join(kiroDir, 'hooks', path.basename(file))
      installFile(file, dst, targetDir, options)
    }
    console.log('')
  }

  // Install MCP config
  if (installMcp) {
    info('Installing MCP configuration...')
    const mcpSrc = path.join(sourceDir, 'settings', 'mcp.json')
    if (fs.existsSync(mcpSrc)) {
      const dst = path.join(kiroDir, 'settings', 'mcp.json')
      installFile(mcpSrc, dst, targetDir, options)
    }
    console.log('')
  }

  // Summary
  if (options.dryRun) {
    console.log(`${c.yellow}Dry run complete — no files were changed.${c.reset}`)
    console.log('Remove --dry-run to install for real.')
  } else {
    console.log(`${c.green}Done!${c.reset} Configuration installed to ${c.dim}${kiroDir}${c.reset}`)
    console.log('')
    console.log('Next steps:')
    console.log('  1. Open your project in Kiro')
    console.log('  2. Steering files activate automatically')
    console.log('  3. Use # in chat to reference manual steering files')
    console.log('  4. Edit .kiro/settings/mcp.json to enable MCP servers you need')
    console.log('')
    if (!options.force) {
      console.log(`${c.dim}Tip: Use --force to overwrite existing files on upgrade.${c.reset}`)
    }
  }
}

function cmdUpdate() {
  info('Updating Everything Kiro...')
  const scriptPath = fs.realpathSync(process.argv[1])
  const scriptDir = path.dirname(scriptPath)
  const gitDir = path.join(scriptDir, '.git')

  if (fs.existsSync(gitDir)) {
    try {
      execSync('git pull --quiet', { cwd: scriptDir, stdio: 'pipe' })
      success('Updated to latest version')
    } catch (e) {
      error('Git pull failed. Check your network connection.')
      process.exit(1)
    }
  } else {
    error('Not a git repository. Re-clone to update:')
    console.log(`  rm -rf ${scriptDir}`)
    console.log(`  git clone https://github.com/aliakbr/everything-claude-code-kiro-migration.git ${scriptDir}`)
    process.exit(1)
  }
}

function cmdHelp() {
  console.log('')
  console.log(`${c.bold}everything-kiro${c.reset} v${VERSION} — Battle-tested Kiro configurations`)
  console.log('')
  console.log(`${c.bold}USAGE${c.reset}`)
  console.log('  everything-kiro <command> [flags]')
  console.log('')
  console.log(`${c.bold}COMMANDS${c.reset}`)
  console.log('  install       Install .kiro config into the current directory')
  console.log('  update        Update everything-kiro CLI to the latest version')
  console.log('  help          Show this help message')
  console.log('')
  console.log(`${c.bold}INSTALL FLAGS${c.reset}`)
  console.log('  --force           Overwrite existing files (for upgrades)')
  console.log('  --dry-run         Preview changes without writing anything')
  console.log('  --steering-only   Install only .kiro/steering/ files')
  console.log('  --hooks-only      Install only .kiro/hooks/ files')
  console.log('  --mcp-only        Install only .kiro/settings/mcp.json')
  console.log('')
  console.log(`${c.bold}EXAMPLES${c.reset}`)
  console.log('  everything-kiro install                  # Install into current project')
  console.log('  everything-kiro install --force          # Re-install / upgrade')
  console.log('  everything-kiro install --dry-run        # Preview what gets installed')
  console.log('  everything-kiro install --steering-only  # Only steering files')
  console.log('  everything-kiro update                   # Pull latest configs')
  console.log('')
  console.log(`${c.bold}ENVIRONMENT${c.reset}`)
  console.log('  KIRO_TARGET_DIR   Override target directory (default: current directory)')
  console.log('')
  console.log(`${c.bold}SETUP${c.reset}`)
  console.log('  git clone https://github.com/aliakbr/everything-claude-code-kiro-migration.git ~/.everything-kiro')
  console.log('  cd ~/.everything-kiro && npm link')
  console.log('')
  console.log(`${c.bold}PLATFORMS${c.reset}`)
  console.log('  Works on Windows, macOS, and Linux (requires Node.js)')
  console.log('')
}

// Main dispatch
const args = process.argv.slice(2)
const command = args[0] || 'help'
const commandArgs = args.slice(1)

switch (command) {
  case 'install':
    cmdInstall(commandArgs)
    break
  case 'update':
    cmdUpdate()
    break
  case 'help':
  case '--help':
  case '-h':
    cmdHelp()
    break
  default:
    error(`Unknown command: ${command}`)
    console.log("Run 'everything-kiro help' for usage")
    process.exit(1)
}
