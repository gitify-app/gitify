#!/usr/bin/env node
/**
 * Start the development server with a branded macOS Electron bundle.
 *
 * The notification-enabled dev process must not run from the generic
 * Electron.app, or macOS activates the default Electron app on a notification
 * click. The prepared bundle is selected through ELECTRON_OVERRIDE_DIST_PATH.
 */
import { spawn } from 'node:child_process';

import { prepareDevElectronBundle } from './prepare-dev-electron.mjs';

const env = { ...process.env };
const overrideDirectory = prepareDevElectronBundle();

if (overrideDirectory) {
  env.ELECTRON_OVERRIDE_DIST_PATH = overrideDirectory;
}

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const child = spawn(
  command,
  [
    'exec',
    'concurrently',
    '--names',
    'vite,codegen',
    '--prefix-colors',
    'blue,magenta',
    'vp dev',
    'pnpm codegen:watch',
  ],
  { env, stdio: 'inherit' },
);

child.on('exit', (code) => process.exit(code ?? 0));
child.on('error', (error) => {
  console.error('[dev] failed to start the development server', error);
  process.exit(1);
});
