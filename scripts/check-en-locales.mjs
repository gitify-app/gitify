#!/usr/bin/env node
/**
 * Guard English defaults in renderer and native resources.
 * Empty or key-path English values indicate a missing t() default or a
 * --trust-derived extraction that replaced the text with its key.
 *
 * Runs in pnpm i18n:check for both translation and native namespaces. An optional
 * English locale path checks that file alone.
 */
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const localePaths = process.argv[2]
  ? [process.argv[2]]
  : ['../src/renderer/i18n/locales/en.json', '../src/shared/i18n/locales/en/native.json'].map(
      (path) => fileURLToPath(new URL(path, import.meta.url)),
    );

function flatten(value, prefix = '', entries = {}) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof child === 'string') {
      entries[path] = child;
    } else {
      flatten(child, path, entries);
    }
  }
  return entries;
}

for (const localePath of localePaths) {
  const source = flatten(JSON.parse(await readFile(localePath, 'utf8')));
  const issues = [];
  for (const [key, value] of Object.entries(source)) {
    if (!value.trim() || value === key) {
      issues.push(`${key}: missing English default`);
    }
  }
  if (issues.length) {
    for (const issue of issues) {
      console.error(`  - ${basename(localePath)}: ${issue}`);
    }
    process.exit(1);
  }
  console.log(
    `✅ ${basename(localePath)}: ${Object.keys(source).length} keys with English defaults`,
  );
}
