#!/usr/bin/env node
/**
 * Validate required YAML frontmatter across agents, commands, and skills.
 *
 * - agents/*.md          -> requires: name, description, tools, model
 * - commands/*.md        -> requires: description
 * - skills/**\/SKILL.md   -> requires: name, description
 *
 * Usage: node scripts/validate-frontmatter.js
 * Exits with code 1 if any file is missing a required field.
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');

function listMarkdownFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listMarkdownFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

function parseFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const fieldMatch = line.match(/^([A-Za-z_-]+):/);
    if (fieldMatch) fields[fieldMatch[1]] = true;
  }
  return fields;
}

function checkFiles(files, requiredFields, label) {
  const errors = [];
  for (const file of files) {
    const rel = path.relative(repoRoot, file);
    const fields = parseFrontmatter(file);
    if (!fields) {
      errors.push(`${rel}: missing frontmatter block (---\\n...\\n---)`);
      continue;
    }
    for (const field of requiredFields) {
      if (!fields[field]) {
        errors.push(`${rel}: missing required '${field}' in frontmatter`);
      }
    }
  }
  if (errors.length > 0) {
    console.error(`\n${label}:`);
    for (const e of errors) console.error(`  ✗ ${e}`);
  } else {
    console.log(`✓ ${label}: all files OK (${files.length} checked)`);
  }
  return errors.length;
}

let totalErrors = 0;

totalErrors += checkFiles(
  listMarkdownFiles(path.join(repoRoot, 'agents')),
  ['name', 'description', 'tools', 'model'],
  'agents/*.md'
);

totalErrors += checkFiles(
  listMarkdownFiles(path.join(repoRoot, 'commands')),
  ['description'],
  'commands/*.md'
);

totalErrors += checkFiles(
  listMarkdownFiles(path.join(repoRoot, 'skills')).filter(
    (f) => path.basename(f) === 'SKILL.md'
  ),
  ['name', 'description'],
  'skills/**/SKILL.md'
);

if (totalErrors > 0) {
  console.error(`\n${totalErrors} frontmatter error(s) found.`);
  process.exit(1);
}

console.log('\nAll frontmatter checks passed.');
