#!/usr/bin/env node
/**
 * Guard English defaults and translated keys, interpolation and markup.
 * Empty or key-path English values indicate a missing t() default or a
 * --trust-derived extraction that replaced the text with its key.
 *
 * Runs in pnpm i18n:check for both translation and native namespaces. An optional
 * English locale path checks that file and its corresponding zh-Hans resource.
 */
import { readFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
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

const tokens = (value) =>
  [...value.matchAll(/{{\s*([^}]+?)\s*}}|<\/?([\w]+)\s*\/?\s*>/g)]
    .map((match) => match[0])
    .sort((a, b) => a.localeCompare(b));

for (const localePath of localePaths) {
  const translatedPath =
    basename(localePath) === 'en.json'
      ? join(dirname(localePath), 'zh-Hans.json')
      : join(dirname(dirname(localePath)), 'zh-Hans', basename(localePath));
  const [source, translated] = await Promise.all(
    [localePath, translatedPath].map(async (path) =>
      flatten(JSON.parse(await readFile(path, 'utf8'))),
    ),
  );
  const issues = [];
  for (const [key, value] of Object.entries(source)) {
    if (!value.trim() || value === key) {
      issues.push(`${key}: missing English default`);
    }
  }
  for (const key of new Set([...Object.keys(source), ...Object.keys(translated)])) {
    if (!(key in source) || !(key in translated)) {
      issues.push(`${key}: locale key mismatch`);
    } else if (!translated[key].trim()) {
      issues.push(`${key}: empty translation`);
    } else if (JSON.stringify(tokens(source[key])) !== JSON.stringify(tokens(translated[key]))) {
      issues.push(`${key}: interpolation or component tags differ`);
    }
  }
  if (issues.length) {
    for (const issue of issues) {
      console.error(`  - ${basename(localePath)}: ${issue}`);
    }
    process.exit(1);
  }
  console.log(
    `✅ ${basename(localePath)}: ${Object.keys(source).length} matching keys, English defaults, parameters and component tags`,
  );
}
