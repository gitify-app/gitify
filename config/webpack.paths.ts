import path from 'node:path';

const rootPath = path.join(__dirname, '..');

const nodeModulesPath = path.join(rootPath, 'node_modules');

const srcPath = path.join(rootPath, 'src');

const srcMainPath = path.join(srcPath, 'main');

const srcPreloadPath = path.join(srcPath, 'preload');

const srcRendererPath = path.join(srcPath, 'renderer');

const buildPath = path.join(rootPath, 'build');

const distPath = path.join(rootPath, 'dist');

export default {
  rootPath,
  nodeModulesPath,
  srcPath,
  srcMainPath,
  srcPreloadPath,
  srcRendererPath,
  buildPath,
  distPath,
};
