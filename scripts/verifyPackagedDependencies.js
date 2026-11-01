#!/usr/bin/env node

/**
 * Verifies that a packaged Gitify app ships only its runtime dependency closure.
 *
 * The packaged app must contain the main-process runtime packages and must not
 * contain the renderer-only packages that Vite bundles, the pnpm virtual store,
 * or build tooling. Run this after electron-builder has produced an unpacked app:
 *
 *   node scripts/verifyPackagedDependencies.js dist/mac-universal/Gitify.app
 *   node scripts/verifyPackagedDependencies.js dist/win-unpacked
 *   node scripts/verifyPackagedDependencies.js dist/linux-unpacked
 *   node scripts/verifyPackagedDependencies.js path/to/app.asar
 *
 * With no argument it auto-detects the first app.asar under dist/.
 */

const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

const REQUIRED_PACKAGES = ['electron-log', 'electron-menubar', 'electron-updater'];
const FORBIDDEN_PACKAGES = [
  'cn',
  'i18next',
  'i18next-browser-languagedetector',
  'react',
  'react-dom',
  'react-i18next',
  'react-router-dom',
];
const BUILD_ONLY_PACKAGES = [
  'electron',
  'electron-builder',
  'tailwindcss',
  'typescript',
  'vite',
  'vitest',
];
const BUILD_ONLY_SCOPES = ['@electron/', '@graphql-codegen/', '@primer/', '@tailwindcss/'];
const MAX_NODE_MODULES_BYTES = 10 * 1024 * 1024;

function usage() {
  console.log(`Usage: node scripts/verifyPackagedDependencies.js [app-dir-or-asar]

Checks a packaged app's app.asar for the runtime dependency surface.

Accepted paths:
  - a packaged app directory (macOS .app, win-unpacked, linux-unpacked)
  - an app.asar file
  - omit to auto-detect the first app.asar under dist/

Exit codes: 0 pass, 1 dependency check failed, 2 usage or read error.`);
}

function resolveAsarPath(input) {
  const candidates = [];

  if (input) {
    const resolved = path.resolve(input);

    if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
      if (!resolved.endsWith('.asar')) {
        throw new Error(`Not an asar archive: ${resolved}`);
      }
      return resolved;
    }

    candidates.push(
      path.join(resolved, 'Contents', 'Resources', 'app.asar'),
      path.join(resolved, 'resources', 'app.asar'),
      path.join(resolved, 'Resources', 'app.asar'),
    );
  } else {
    const dist = path.resolve('dist');
    if (fs.existsSync(dist)) {
      for (const name of fs.readdirSync(dist)) {
        const dir = path.join(dist, name);
        if (!fs.statSync(dir).isDirectory()) {
          continue;
        }
        candidates.push(
          path.join(dir, 'Gitify.app', 'Contents', 'Resources', 'app.asar'),
          path.join(dir, 'resources', 'app.asar'),
        );
      }
    }
  }

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error(
      input
        ? `No app.asar found under ${path.resolve(input)}`
        : 'No app.asar found under dist/. Package the app first or pass an app path.',
    );
  }
  return found;
}

function loadAsar() {
  try {
    const fromElectronBuilder = createRequire(require.resolve('electron-builder/package.json'));
    return fromElectronBuilder('@electron/asar');
  } catch (error) {
    throw new Error(`Could not load @electron/asar through electron-builder: ${error.message}`);
  }
}

function normalizeEntry(entry) {
  return `/${entry.replaceAll('\\', '/').replace(/^\/+/, '')}`;
}

function topLevelPackageName(entry) {
  const parts = entry.split('/').filter(Boolean);
  if (parts[0] !== 'node_modules' || parts.length < 2) {
    return null;
  }
  if (parts[1].startsWith('@')) {
    return parts.length > 2 ? `${parts[1]}/${parts[2]}` : null;
  }
  return parts[1];
}

function formatBytes(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function entryBytes(entry) {
  if (!entry) {
    return 0;
  }
  if (typeof entry.size === 'number') {
    return entry.size;
  }
  if (entry.files) {
    return Object.values(entry.files).reduce((total, child) => total + entryBytes(child), 0);
  }
  return 0;
}

function checkPackagedDependencies(asarPath) {
  const asar = loadAsar();
  const entries = asar.listPackage(asarPath).map(normalizeEntry);
  const nodeModuleEntries = entries.filter((entry) => entry.startsWith('/node_modules/'));
  const packages = new Set(
    nodeModuleEntries.map(topLevelPackageName).filter((name) => name != null),
  );

  const violations = [];

  if (packages.size === 0) {
    violations.push('No node_modules packages were found in the archive.');
  }

  if (nodeModuleEntries.some((entry) => entry.startsWith('/node_modules/.pnpm/'))) {
    violations.push('The pnpm virtual store (/node_modules/.pnpm) must not ship.');
  }

  for (const name of REQUIRED_PACKAGES) {
    if (!packages.has(name)) {
      violations.push(`Missing runtime package: ${name}`);
    }
  }

  for (const name of FORBIDDEN_PACKAGES) {
    if (packages.has(name)) {
      violations.push(`Renderer-only package must not ship: ${name}`);
    }
  }

  for (const name of BUILD_ONLY_PACKAGES) {
    if (packages.has(name)) {
      violations.push(`Build-only package must not ship: ${name}`);
    }
  }

  for (const name of packages) {
    if (BUILD_ONLY_SCOPES.some((scope) => name.startsWith(scope))) {
      violations.push(`Build-only scoped package must not ship: ${name}`);
    }
  }

  const header = asar.getRawHeader(asarPath).header;
  const nodeModulesBytes = entryBytes(header.files?.node_modules);

  if (nodeModulesBytes > MAX_NODE_MODULES_BYTES) {
    violations.push(
      `node_modules is ${formatBytes(nodeModulesBytes)}, over the ${formatBytes(MAX_NODE_MODULES_BYTES)} budget.`,
    );
  }

  return { packages, nodeModulesBytes, violations };
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    usage();
    return;
  }

  try {
    const asarPath = resolveAsarPath(args[0]);
    const { packages, nodeModulesBytes, violations } = checkPackagedDependencies(asarPath);

    console.log('Packaged dependency check');
    console.log(`  asar: ${asarPath}`);
    console.log(`  node_modules packages: ${packages.size}`);
    console.log(`  node_modules size: ${formatBytes(nodeModulesBytes)}`);
    console.log(`  runtime packages: ${REQUIRED_PACKAGES.join(', ')}`);

    if (violations.length > 0) {
      console.error('\n[FAIL] Packaged dependency surface is invalid:');
      for (const violation of violations) {
        console.error(`  - ${violation}`);
      }
      process.exitCode = 1;
      return;
    }

    console.log('\n[PASS] Packaged dependency surface is valid.');
  } catch (error) {
    console.error(`[ERROR] ${error.message}`);
    process.exitCode = 2;
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkPackagedDependencies, resolveAsarPath };
