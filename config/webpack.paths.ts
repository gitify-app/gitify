import path from 'node:path';

const rootPath = path.join(__dirname, '..');

const nodeModulesPath = path.join(rootPath, 'node_modules');

const assetsImagesPath = path.join(rootPath, 'assets', 'images');
const assetsSoundsPath = path.join(rootPath, 'assets', 'sounds');

const srcPath = path.join(rootPath, 'src');
const srcMainPath = path.join(srcPath, 'main');
const srcRendererPath = path.join(srcPath, 'renderer');

const buildPath = path.join(rootPath, 'build');

const distPath = path.join(rootPath, 'dist');

export default {
  rootPath,
  nodeModulesPath,
  assetsImagesPath,
  assetsSoundsPath,
  srcPath,
  srcMainPath,
  srcRendererPath,
  buildPath,
  distPath,
};
