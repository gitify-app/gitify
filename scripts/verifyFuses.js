#!/usr/bin/env node
/**
 * Asserts that packaged artifacts carry the hardened Electron fuse state.
 *
 * electron-builder silently leaves the Electron defaults in place when
 * `electronFuses` is absent, so a removed or bypassed configuration would ship
 * an unhardened build on a green pipeline. This reads the fuse wire back out of
 * each built artifact and fails when it does not match the expected posture.
 *
 * The expected posture is a constant here rather than read from
 * `electron-builder.js`. A check that derives its expectations from the
 * configuration it is meant to police passes vacuously once that configuration
 * is removed, which is the exact failure this guards against. Deliberately
 * weakening the posture therefore means editing this file too.
 *
 * The wire format is documented at
 * https://www.electronjs.org/docs/latest/tutorial/fuses: a sentinel string,
 * then the wire version, then the wire length, then one byte per fuse. It is
 * decoded here rather than imported from `@electron/fuses`, which is only a
 * transitive dependency of electron-builder and is not resolvable from the
 * project root under pnpm's isolated node_modules layout.
 *
 * Usage:
 *   node scripts/verifyFuses.js <artifact> [<artifact> ...]
 *
 * Each artifact is a packaged macOS app bundle or a Windows/Linux executable.
 */

const fs = require('node:fs');
const path = require('node:path');

const SENTINEL = Buffer.from('dL7pKGdnNz796PbbjQWNKmHXBZaB9tsX', 'ascii');
const FUSE_ENABLE = 49; // '1'
const FUSE_DISABLE = 48; // '0'

/**
 * The hardened posture every packaged artifact must carry. See the header note
 * for why this is not read from `electron-builder.js`.
 */
const EXPECTED_FUSES = {
  runAsNode: false,
  enableCookieEncryption: true,
  enableNodeOptionsEnvironmentVariable: false,
  enableNodeCliInspectArguments: false,
  enableEmbeddedAsarIntegrityValidation: true,
  onlyLoadAppFromAsar: true,
};

/**
 * Fuse positions within the wire, in the order `@electron/fuses` defines them.
 * See `FuseV1Options` in @electron/fuses.
 */
const FUSE_WIRE_ORDER = [
  'runAsNode',
  'enableCookieEncryption',
  'enableNodeOptionsEnvironmentVariable',
  'enableNodeCliInspectArguments',
  'enableEmbeddedAsarIntegrityValidation',
  'onlyLoadAppFromAsar',
  'loadBrowserProcessSpecificV8Snapshot',
  'grantFileProtocolExtraPrivileges',
];

/**
 * Mirrors `pathToFuseFile` in @electron/fuses: on macOS the fuse wire lives in
 * the Electron Framework binary, not in the app executable.
 *
 * @param {string} artifactPath
 * @returns {string}
 */
const resolveFuseFile = (artifactPath) => {
  if (artifactPath.endsWith('.app')) {
    return path.join(
      artifactPath,
      'Contents',
      'Frameworks',
      'Electron Framework.framework',
      'Electron Framework',
    );
  }

  if (artifactPath.includes('.app')) {
    return path.resolve(
      artifactPath,
      '..',
      '..',
      'Frameworks',
      'Electron Framework.framework',
      'Electron Framework',
    );
  }

  return artifactPath;
};

/**
 * @param {string} artifactPath
 * @returns {string}
 */
const describePlatform = (artifactPath) => {
  if (artifactPath.endsWith('.app')) {
    return 'macOS';
  }

  if (artifactPath.endsWith('.exe')) {
    return 'Windows';
  }

  return 'Linux';
};

/**
 * Reads every fuse wire in a binary. Universal builds carry one wire per slice,
 * and each slice must be flipped.
 *
 * @param {string} fuseFilePath
 * @returns {Array<{ version: number, states: Buffer }>}
 */
const readFuseWires = (fuseFilePath) => {
  const binary = fs.readFileSync(fuseFilePath);
  const positions = [];
  let index = binary.indexOf(SENTINEL);

  while (index !== -1) {
    positions.push(index);
    index = binary.indexOf(SENTINEL, index + 1);
  }

  if (positions.length === 0) {
    throw new Error(
      `no fuse wire sentinel in ${fuseFilePath}: fuses require Electron 12 or higher`,
    );
  }

  return positions.map((position) => {
    const offset = position + SENTINEL.length;

    return {
      version: binary[offset],
      states: binary.subarray(offset + 2, offset + 2 + binary[offset + 1]),
    };
  });
};

/**
 * @param {string} artifactPath
 * @returns {string[]} failure descriptions, empty when the artifact is hardened
 */
const collectFailures = (artifactPath) => {
  const fuseFilePath = resolveFuseFile(artifactPath);

  if (!fs.existsSync(fuseFilePath)) {
    return [`no fuse file at ${fuseFilePath}`];
  }

  const wires = readFuseWires(fuseFilePath);
  const failures = [];

  for (const [wireIndex, wire] of wires.entries()) {
    for (const [name, enabled] of Object.entries(EXPECTED_FUSES)) {
      const position = FUSE_WIRE_ORDER.indexOf(name);

      if (position === -1) {
        failures.push(`${name} is not a fuse this checker knows about`);
        continue;
      }

      if (position >= wire.states.length) {
        failures.push(
          `${name} is beyond the ${wire.states.length}-entry wire in this Electron build`,
        );
        continue;
      }

      const actual = wire.states[position];
      const expected = enabled ? FUSE_ENABLE : FUSE_DISABLE;

      if (actual !== expected) {
        failures.push(
          `${name} is ${actual === FUSE_ENABLE ? 'enabled' : 'disabled'} but should be ${enabled ? 'enabled' : 'disabled'} (slice ${wireIndex + 1} of ${wires.length})`,
        );
      }
    }
  }

  return failures;
};

const artifacts = process.argv.slice(2);

if (artifacts.length === 0) {
  console.error('usage: node scripts/verifyFuses.js <artifact> [<artifact> ...]');
  process.exit(2);
}

let hasFailures = false;

for (const artifactPath of artifacts) {
  const platform = describePlatform(artifactPath);
  const failures = collectFailures(artifactPath);

  if (failures.length === 0) {
    console.log(`  • [verifyFuses] ${platform}: ${artifactPath} matches the hardened fuse posture`);
    continue;
  }

  hasFailures = true;
  console.error(`  • [verifyFuses] ${platform}: ${artifactPath} is not hardened`);

  for (const failure of failures) {
    console.error(`      - ${failure}`);
  }
}

process.exit(hasFailures ? 1 : 0);
