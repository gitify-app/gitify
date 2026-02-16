import { fileURLToPath } from 'node:url';

import twemoji from '@discordapp/twemoji';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import electron from 'vite-plugin-electron/simple';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import { Constants } from './src/renderer/constants';

import { Errors } from './src/renderer/utils/errors';

const ALL_EMOJIS = [
  ...Constants.ALL_READ_EMOJIS,
  ...Errors.BAD_CREDENTIALS.emojis,
  ...Errors.MISSING_SCOPES.emojis,
  ...Errors.NETWORK.emojis,
  ...Errors.RATE_LIMITED.emojis,
  ...Errors.UNKNOWN.emojis,
];

const extractSvgFilename = (imgHtml: string) =>
  imgHtml
    .match(/src="(.*)"/)?.[1]
    .split('/')
    .pop();

const ALL_EMOJI_SVG_FILENAMES = ALL_EMOJIS.map((emoji) =>
  extractSvgFilename(twemoji.parse(emoji, { folder: 'svg', ext: '.svg' })),
);

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
      electron({
        main: {
          entry: fileURLToPath(new URL('src/main/index.ts', import.meta.url)),
          vite: {
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
      viteStaticCopy({
        targets: [
          ...ALL_EMOJI_SVG_FILENAMES.map((filename) => ({
            src: `../../node_modules/@discordapp/twemoji/dist/svg/${filename}`,
            dest: 'assets/images/twemoji',
          })),
          {
            src: '../../assets',
            dest: '.',
          },
        ],
      }),
    ],
    root: 'src/renderer',
    publicDir: false as const,
    base: './',
    build: {
      outDir: fileURLToPath(new URL('build', import.meta.url)),
      emptyOutDir: true,
    },
    // Define build-time replacements for the main process bundle.
    // During CI builds `process.env.OAUTH_CLIENT_ID` will be injected via the environment.
    define: isBuild
      ? {
          'process.env.OAUTH_CLIENT_ID': JSON.stringify(
            process.env.OAUTH_CLIENT_ID ?? '',
          ),
        }
      : {
          // Development Keys - See CONTRIBUTING.md
          'process.env.OAUTH_CLIENT_ID': JSON.stringify('Ov23liQIkFs5ehQLNzHF'),
        },
  };
});
