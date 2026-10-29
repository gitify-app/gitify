#!/usr/bin/env node
/**
 * Guard for the primary locale (en.json).
 *
 * Fails when any leaf value is empty or equals its own dotted key path. Both
 * mean the English text is missing from code: an empty value shows the raw
 * dotted key to English users, and a key-path value means `--trust-derived`
 * (or a missing default) baked the key in as the translation.
 *
 * Runs as part of `pnpm i18n:check`. Optionally accepts a locale path
 * (defaults to src/renderer/i18n/locales/en.json).
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const defaultPath = fileURLToPath(new URL('../src/renderer/i18n/locales/en.json', import.meta.url));
const localePath = process.argv[2] ?? defaultPath;

const en = JSON.parse(await readFile(localePath, 'utf8'));

const issues = [];

function walk(obj, prefix) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') {
      if (v === '') {
        issues.push(`${key}: empty value`);
      } else if (v === key) {
        issues.push(`${key}: value equals key path`);
      }
    } else {
      walk(v, key);
    }
  }
}

walk(en, '');

if (issues.length > 0) {
  console.error(
    'en.json contains values that cannot seed the primary locale. Add an English default to the t() call so extraction writes the English text.',
  );
  for (const issue of issues) {
    console.error(`  - ${issue}`);
  }
  process.exit(1);
}

console.log('✅ en.json: no empty or key-path values');
