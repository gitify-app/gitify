#!/usr/bin/env node
/**
 * Verifies that a packaged Gitify app ships its runtime dependency closure and
 * nothing else.
 *
 * The expected surface is derived rather than listed, so it cannot drift from
 * the project:
 *
 *   - `dependencies` in package.json are the runtime closure roots
 *   - `devDependencies` that are not part of the production graph must never
 *     ship (renderer-only packages Vite bundles, build tooling, type packages)
 *   - every external `require` in the built main bundle must be a runtime
 *     dependency, and must be present in `app.asar`
 *
 * Run after electron-builder has produced an unpacked app:
 *
 *   node scripts/verifyPackagedDependencies.js dist/mac-universal/Gitify.app
 *   node scripts/verifyPackagedDependencies.js dist/win-unpacked
 *   node scripts/verifyPackagedDependencies.js dist/linux-unpacked
 *   node scripts/verifyPackagedDependencies.js path/to/app.asar
 *
 * With no argument it auto-detects the first app.asar under dist/.
 */

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { builtinModules, createRequire } = require('node:module');

const projectRoot = path.resolve(__dirname, '..');
const packageJson = require(path.join(projectRoot, 'package.json'));

/** Runtime closure roots. electron-builder packages these and their transitive deps. */
const REQUIRED_PACKAGES = Object.keys(packageJson.dependencies ?? {});

/**
 * Every package reachable from `dependencies`, including transitives.
 *
 * A direct devDependency can also be a production transitive: `semver`, for
 * example, is declared for build scripts but is also pulled in by
 * electron-updater. Subtracting this set keeps the check focused on packages
 * that exist only for development.
 *
 * @returns {Set<string>}
 */
function productionClosure() {
  let output;

  try {
    output = execSync('pnpm list --prod --depth Infinity --json', {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch (error) {
    throw new Error(`Could not read the production dependency closure: ${error.message}`);
  }

  const [project] = JSON.parse(output);
  const names = new Set();

  const walk = (dependencies) => {
    for (const [name, dependency] of Object.entries(dependencies ?? {})) {
      names.add(name);
      walk(dependency?.dependencies);
    }
  };

  walk(project?.dependencies);
  return names;
}

const PRODUCTION_PACKAGES = productionClosure();

/**
 * Declared dev-only packages must never ship. Packages that are also production
 * transitives are permitted, because electron-builder packages them for real
 * runtime code.
 */
const FORBIDDEN_PACKAGES = new Set(
  Object.keys(packageJson.devDependencies ?? {}).filter((name) => !PRODUCTION_PACKAGES.has(name)),
);

/** Provided by the Electron runtime, not installed into node_modules. */
const RUNTIME_PROVIDED = new Set(['electron']);

const BUILTINS = new Set(builtinModules.flatMap((name) => [name, `node:${name}`]));

// The runtime closure is a couple of megabytes. Anything close to this budget
// means the pnpm store or a devDependency tree was packaged.
const MAX_NODE_MODULES_BYTES = 10 * 1024 * 1024;

function usage() {
  console.log(`Usage: node scripts/verifyPackagedDependencies.js [app-dir-or-asar ...]

Checks each packaged app's app.asar for the runtime dependency surface.

Accepted paths (one or more):
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

/**
 * Every non-relative module the main process requires at runtime. Derived from
 * the built bundle, so it reflects what the process actually needs rather than
 * what package.json happens to declare.
 *
 * @returns {Set<string>}
 */
function mainProcessExternals() {
  const bundlePath = path.join(projectRoot, 'build', 'main.js');

  if (!fs.existsSync(bundlePath)) {
    throw new Error(`No main bundle at ${bundlePath}; build before packaging`);
  }

  const bundle = fs.readFileSync(bundlePath, 'utf8');
  const externals = new Set();

  for (const match of bundle.matchAll(/require\("([^"]+)"\)/g)) {
    const name = match[1];

    if (name.startsWith('.') || BUILTINS.has(name) || RUNTIME_PROVIDED.has(name)) {
      continue;
    }

    externals.add(name);
  }

  return externals;
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

  for (const name of packages) {
    if (FORBIDDEN_PACKAGES.has(name)) {
      violations.push(`Dev-only package must not ship: ${name}`);
    }
  }

  for (const name of mainProcessExternals()) {
    if (!REQUIRED_PACKAGES.includes(name)) {
      violations.push(`Main process requires ${name} but it is not a runtime dependency`);
      continue;
    }

    if (!packages.has(name)) {
      violations.push(`Main process requires ${name} but the package is missing`);
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

  // One entry per packaged app, so every arch of a multi-arch build is checked.
  const inputs = args.length > 0 ? args : [undefined];
  let hasFailures = false;

  for (const input of inputs) {
    try {
      const asarPath = resolveAsarPath(input);
      const { packages, nodeModulesBytes, violations } = checkPackagedDependencies(asarPath);

      console.log('Packaged dependency check');
      console.log(`  asar: ${asarPath}`);
      console.log(`  node_modules packages: ${packages.size}`);
      console.log(`  node_modules size: ${formatBytes(nodeModulesBytes)}`);
      console.log(`  runtime packages: ${REQUIRED_PACKAGES.join(', ')}`);
      console.log(`  main process externals: ${[...mainProcessExternals()].join(', ')}`);

      if (violations.length > 0) {
        console.error('\n[FAIL] Packaged dependency surface is invalid:');
        for (const violation of violations) {
          console.error(`  - ${violation}`);
        }
        hasFailures = true;
        continue;
      }

      console.log('\n[PASS] Packaged dependency surface is valid.');
    } catch (error) {
      console.error(`[ERROR] ${error.message}`);
      process.exitCode = 2;
      return;
    }
  }

  if (hasFailures) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkPackagedDependencies, resolveAsarPath };
