#!/usr/bin/env node
/**
 * Source-level guard: every t() / i18n.t() call must pass its English text as
 * the second argument, e.g. `t('common.save', 'Save')`, and every <Trans> must
 * set `defaults`. The extractor generates en.json from these defaults, so a
 * missing one would ship an empty string or a raw key to English users.
 *
 * Runs as part of `pnpm i18n:check`. Scans src/renderer, skipping tests, the
 * i18n bootstrap files and the locales directory.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SCAN_DIR = join(ROOT, 'src', 'renderer');
const SKIP_DIRS = new Set(['node_modules', 'locales', '__mocks__', '__helpers__']);
const I18N_DIR = join(SCAN_DIR, 'i18n');

async function collectFiles(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        await collectFiles(p, out);
      }
    } else if (
      /\.(ts|tsx)$/.test(entry.name) &&
      !/\.test\./.test(entry.name) &&
      !p.startsWith(I18N_DIR)
    ) {
      out.push(p);
    }
  }
  return out;
}

function lineOf(code, index) {
  return code.slice(0, index).split('\n').length;
}

function skipSpace(code, start) {
  let i = start;
  while (i < code.length && /\s/.test(code[i])) {
    i++;
  }
  return i;
}

/** Return the index just past a string literal starting at `start`, or -1. */
function endOfString(code, start) {
  const q = code[start];
  for (let i = start + 1; i < code.length; i++) {
    if (code[i] === '\\') {
      i++;
    } else if (code[i] === q) {
      return i + 1;
    }
  }
  return -1;
}

const T_CALL = /(?<![\w$.])(?:i18n\.)?t\(/g;

function findTCallIssues(code) {
  const issues = [];
  for (const match of code.matchAll(T_CALL)) {
    let i = skipSpace(code, match.index + match[0].length);
    const q = code[i];
    if (q !== "'" && q !== '"') {
      // Dynamic keys are not extractable; i18next-cli reports those itself.
      continue;
    }
    const keyEnd = endOfString(code, i);
    if (keyEnd === -1) {
      continue;
    }
    const key = code.slice(i + 1, keyEnd - 1);
    const at = `${key} (line ${lineOf(code, match.index)})`;

    i = skipSpace(code, keyEnd);
    if (code[i] !== ',') {
      issues.push(`${at}: t() call without an English default`);
      continue;
    }

    i = skipSpace(code, i + 1);
    const d = code[i];
    if (d !== "'" && d !== '"' && d !== '`') {
      issues.push(`${at}: second argument must be the English default string`);
      continue;
    }
    const defaultEnd = endOfString(code, i);
    if (defaultEnd === i + 2) {
      issues.push(`${at}: empty English default`);
    }
  }
  return issues;
}

/** Return the props source of a JSX opening tag, from `start` up to its closing `>`. */
function openingTagProps(code, start) {
  let depth = 0;
  for (let i = start; i < code.length; i++) {
    const c = code[i];
    if (c === "'" || c === '"' || c === '`') {
      const end = endOfString(code, i);
      if (end === -1) {
        return null;
      }
      i = end - 1;
    } else if (c === '{') {
      depth++;
    } else if (c === '}') {
      depth--;
    } else if (c === '>' && depth === 0) {
      return code.slice(start, i);
    }
  }
  return null;
}

function findTransIssues(code) {
  const issues = [];
  for (const match of code.matchAll(/<Trans\b/g)) {
    const props = openingTagProps(code, match.index + match[0].length);
    if (props === null || !/\bdefaults\s*=/.test(props)) {
      const key = /i18nKey="([^"]+)"/.exec(props ?? '')?.[1] ?? '<unknown key>';
      issues.push(`${key} (line ${lineOf(code, match.index)}): <Trans> without defaults`);
    }
  }
  return issues;
}

const files = await collectFiles(SCAN_DIR);
const problemsByFile = new Map();

for (const file of files) {
  const code = await readFile(file, 'utf8');
  const issues = [...findTCallIssues(code), ...findTransIssues(code)];
  if (issues.length > 0) {
    problemsByFile.set(relative(ROOT, file), issues);
  }
}

if (problemsByFile.size > 0) {
  console.error(
    "Missing English defaults. Write t('key', 'English text') and give every <Trans> a `defaults` prop so extraction can generate en.json.",
  );
  for (const [file, issues] of problemsByFile) {
    for (const issue of issues) {
      console.error(`  - ${file}: ${issue}`);
    }
  }
  process.exit(1);
}

console.log('✅ src/renderer: every t() call and <Trans> carries an English default');
