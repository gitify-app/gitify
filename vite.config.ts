import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import twemoji from '@discordapp/twemoji';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import electron from 'vite-plugin-electron/simple';

import { Constants } from './src/renderer/constants';

/**
 * Vite plugin that copies static assets to disk on startup.
 * Runs in both dev and build modes so the Electron main process can resolve
 * asset file URLs without requiring a prior `pnpm build`.
 */
const copyStaticAssetsPlugin = (): Plugin => {
  const flatten = (obj: object): string[] =>
    Object.values(obj).flatMap((v) =>
      Array.isArray(v) ? v : flatten(v as object),
    );

  const extractSvgFilename = (imgHtml: string) =>
    imgHtml
      .match(/src="(.*)"/)?.[1]
      .split('/')
      .pop();

  let isBuild = false;

  const copyAssets = () => {
    // Copy the root assets/ directory (images, sounds, etc.) into build/
    fs.cpSync(
      fileURLToPath(new URL('assets', import.meta.url)),
      fileURLToPath(new URL('build/assets', import.meta.url)),
      { recursive: true },
    );

    // Copy individual Twemoji SVGs needed by the app into build/assets/images/twemoji/
    const twemojiSrcDir = fileURLToPath(
      new URL('node_modules/@discordapp/twemoji/dist/svg', import.meta.url),
    );
    const twemojiDestDir = fileURLToPath(
      new URL('build/assets/images/twemoji', import.meta.url),
    );

    fs.mkdirSync(twemojiDestDir, { recursive: true });

    const allEmojis = flatten(Constants.EMOJIS);
    for (const emoji of allEmojis) {
      const filename = extractSvgFilename(
        twemoji.parse(emoji, { folder: 'svg', ext: '.svg' }),
      );
      if (filename) {
        fs.copyFileSync(
          path.join(twemojiSrcDir, filename),
          path.join(twemojiDestDir, filename),
        );
      }
    }
  };

  return {
    name: 'copy-static-assets',
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    // In serve/dev mode, copy before the build starts (emptyOutDir doesn't run).
    // In build mode, copy after all output is written — buildStart runs before
    // Vite's emptyOutDir wipe, so assets copied there would be deleted.
    buildStart() {
      if (!isBuild) {
        copyAssets();
      }
    },
    closeBundle() {
      if (isBuild) {
        copyAssets();
      }
    },
  };
};

/**
 * Vite plugin that injects React DevTools connection script in dev mode only.
 * This script connects the renderer process to the standalone react-devtools instance.
 */
const reactDevToolsPlugin = (): Plugin => ({
  name: 'react-devtools',
  apply: 'serve', // Only apply in dev mode (vite dev)
  transformIndexHtml(html) {
    // Inject devtools connection script and update CSP to allow localhost:8097
    return html
      .replace(
        '<meta http-equiv="Content-Security-Policy" content="script-src \'self\';',
        '<meta http-equiv="Content-Security-Policy" content="script-src \'self\' http://localhost:8097;',
      )
      .replace(
        '</head>',
        '  <script src="http://localhost:8097"></script>\n  </head>',
      );
  },
});

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';

  return {
    plugins: [
      // only run the checker plugin in dev (not during `vite build`)
      ...(isBuild
        ? []
        : [
            checker({
              typescript: true,
              biome: { dev: { logLevel: ['error'] } },
            }),
          ]),
      reactDevToolsPlugin(),
      react({
        plugins: [
          [
            '@swc-contrib/plugin-graphql-codegen-client-preset',
            {
              artifactDirectory: './src/renderer/utils/api/graphql/generated',
              gqlTagName: 'graphql',
            },
          ],
        ],
      }),
      tailwindcss(),
      electron({
        main: {
          entry: fileURLToPath(new URL('src/main/index.ts', import.meta.url)),
          vite: {
            // The outer Vite config sets root:'src/renderer', so we must
            // explicitly tell the main-process sub-build where to find .env files.
            envDir: fileURLToPath(new URL('.', import.meta.url)),
            build: {
              outDir: fileURLToPath(new URL('build', import.meta.url)),
              rollupOptions: {
                output: { entryFileNames: 'main.js' },
                external: [
                  'electron',
                  // TODO - how many of these are truly needed?
                  'electron-log',
                  'electron-updater',
                  'menubar',
                ],
              },
            },
          },
        },
        preload: {
          input: fileURLToPath(
            new URL('src/preload/index.ts', import.meta.url),
          ),
          vite: {
            build: {
              outDir: fileURLToPath(new URL('build', import.meta.url)),
              rollupOptions: { output: { entryFileNames: 'preload.js' } },
            },
            resolve: { conditions: ['node'] },
          },
        },
      }),
      copyStaticAssetsPlugin(),
    ],
    root: 'src/renderer',
    publicDir: false as const,
    base: './',
    build: {
      outDir: fileURLToPath(new URL('build', import.meta.url)),
      emptyOutDir: true,
    },
  };
});
