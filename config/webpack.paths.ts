import path from 'node:path';

const rootPath = path.join(__dirname, '..');

const nodeModulesPath = path.join(rootPath, 'node_modules');

const assetsPath = path.join(rootPath, 'assets');
const assetsImagesPath = path.join(assetsPath, 'images');
const assetsSoundsPath = path.join(assetsPath, 'sounds');

const srcPath = path.join(rootPath, 'src');
const srcMainPath = path.join(srcPath, 'main');
const srcRendererPath = path.join(srcPath, 'renderer');

const buildPath = path.join(rootPath, 'build');

const distPath = path.join(rootPath, 'dist');

export default {
  rootPath,
  nodeModulesPath,
  assetsPath,
  assetsImagesPath,
  assetsSoundsPath,
  srcPath,
  srcMainPath,
  srcRendererPath,
  buildPath,
  distPath,
};
