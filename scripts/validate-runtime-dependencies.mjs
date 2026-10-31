#!/usr/bin/env node
/**
 * Guard for runtime dependency classification.
 *
 * The packaged app ships the production dependency closure, while Vite bundles
 * the renderer and preload. A package imported only by the renderer therefore
 * belongs in `devDependencies`; leaving it in `dependencies` ships it to users
 * for no reason.
 *
 * Every runtime dependency must be imported by `src/main`, `src/preload`, or
 * `src/shared`. Test files and type declarations do not count.
 *
 * Runs from the main-process Vite build (`pnpm build`, `pnpm dev`).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot = fileURLToPath(new URL('..', import.meta.url));
const SOURCE_DIRS = ['src/main', 'src/preload', 'src/shared'];
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs']);
const IMPORT_PATTERN =
  /(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|\bimport\s*)['"]([^'"]+)['"]/g;

const issues = validateRuntimeDependencies();

if (issues.length > 0) {
  console.error('Runtime dependency classification failed:\n');
  for (const issue of issues) {
    console.error(`  - ${issue}`);
  }
  console.error('\nSee the Dependencies and packaging section in CONTRIBUTING.md.');
  process.exit(1);
}

console.log('Runtime dependency classification is valid.');

/**
 * Validate runtime dependencies for the repository that contains this script.
 *
 * @param {{ root?: string }} options
 * @returns {string[]} Human-readable problems; empty when valid.
 */
export function validateRuntimeDependencies({ root = defaultRoot } = {}) {
  const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
  const runtimeDependencies = Object.keys(packageJson.dependencies ?? {}).sort();
  const issues = [];

  const importedPackages = collectImportedPackages(root);

  for (const id of runtimeDependencies) {
    if (!importedPackages.has(id)) {
      issues.push(
        `"${id}" is in dependencies but never imported by src/main, src/preload, or src/shared. Renderer-only packages belong in devDependencies.`,
      );
    }
  }

  return issues;
}

function collectImportedPackages(root) {
  const imported = new Set();

  for (const dir of SOURCE_DIRS) {
    for (const file of walk(path.join(root, dir))) {
      const contents = readFileSync(file, 'utf8');

      for (const match of contents.matchAll(IMPORT_PATTERN)) {
        const packageName = toPackageName(match[1]);

        if (packageName) {
          imported.add(packageName);
        }
      }
    }
  }

  return imported;
}

function walk(dir) {
  let entries;

  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }

  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return entry === '__mocks__' ? [] : walk(fullPath);
    }

    if (!SOURCE_EXTENSIONS.has(path.extname(entry)) || entry.includes('.test.')) {
      return [];
    }

    return [fullPath];
  });
}

function toPackageName(specifier) {
  if (specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('node:')) {
    return null;
  }

  const segments = specifier.split('/');

  return specifier.startsWith('@') ? segments.slice(0, 2).join('/') : segments[0];
}
