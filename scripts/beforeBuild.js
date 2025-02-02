import fs from 'node:fs';
import path from 'node:path';
import { rimrafSync } from 'rimraf';
const { BeforeBuildContext } = require('electron-builder');

import webpackPaths from '../config/webpack.paths';

/**
 * @param {BeforeBuildContext} context
 */
export default async function beforeBuild(_context) {
  // biome-ignore lint/suspicious/noConsoleLog: disabled
  console.log('[beforeBuild]: Starting...');

  deleteSourceMaps();

  // biome-ignore lint/suspicious/noConsoleLog: disabled
  console.log('[beforeBuild]: Completed');
}

function deleteSourceMaps() {
  if (fs.existsSync(webpackPaths.buildPath)) {
    rimrafSync(path.join(webpackPaths.buildPath, '*.map'), {
      glob: true,
    });
    // biome-ignore lint/suspicious/noConsoleLog: disabled
    console.log('[beforeBuild]: Deleted source maps');
  }
}
