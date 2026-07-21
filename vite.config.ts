import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import twemoji from '@discordapp/twemoji';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import electron from 'vite-plugin-electron/simple';
import type { Plugin } from 'vite-plus';
import { defineConfig } from 'vite-plus';

import { Constants } from './src/renderer/constants.ts';

/**
 * Vite plugin that copies static assets to disk on startup.
 * Runs in both dev and build modes so the Electron main process can resolve
 * asset file URLs without requiring a prior `pnpm build`.
 */
const copyStaticAssetsPlugin = (): Plugin => {
  const flatten = (obj: object): string[] =>
    Object.values(obj).flatMap((v) => (Array.isArray(v) ? v : flatten(v as object)));

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
    const twemojiDestDir = fileURLToPath(new URL('build/assets/images/twemoji', import.meta.url));

    fs.mkdirSync(twemojiDestDir, { recursive: true });

    const allEmojis = flatten(Constants.EMOJIS);
    for (const emoji of allEmojis) {
      const filename = extractSvgFilename(twemoji.parse(emoji, { folder: 'svg', ext: '.svg' }));
      if (filename) {
        fs.copyFileSync(path.join(twemojiSrcDir, filename), path.join(twemojiDestDir, filename));
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
      .replace('</head>', '  <script src="http://localhost:8097"></script>\n  </head>');
  },
});

const isBuild = process.argv.includes('build');

export default defineConfig({
  plugins: [
    // only run the checker plugin in dev (not during `vite build`)
    ...(isBuild
      ? []
      : [
          checker({
            oxlint: { dev: { logLevel: ['error'] } },
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
        onstart: async ({ startup }) => {
          // vite-plugin-electron v1 starts Electron with `cwd: server.config.root`.
          // Our Vite root is `src/renderer`, so we must override `cwd` back to the
          // repository root or Electron will try to boot from `src/renderer`.
          await startup(undefined, {
            cwd: fileURLToPath(new URL('.', import.meta.url)),
          });
        },
        vite: {
          // The outer Vite config sets root:'src/renderer', so we must
          // explicitly tell the main-process sub-build where to find .env files.
          envDir: fileURLToPath(new URL('.', import.meta.url)),
          build: {
            outDir: fileURLToPath(new URL('build', import.meta.url)),
            rolldownOptions: {
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
        input: fileURLToPath(new URL('src/preload/index.ts', import.meta.url)),
        vite: {
          build: {
            outDir: fileURLToPath(new URL('build', import.meta.url)),
            rolldownOptions: { output: { entryFileNames: 'preload.js' } },
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
  // Define build-time replacements for the main process bundle.
  // During CI builds `process.env.OAUTH_CLIENT_ID` will be injected via the environment.
  define: isBuild
    ? {
        'process.env.OAUTH_CLIENT_ID': JSON.stringify(process.env.OAUTH_CLIENT_ID ?? ''),
      }
    : {
        // Development Keys - See CONTRIBUTING.md
        'process.env.OAUTH_CLIENT_ID': JSON.stringify('Ov23liQIkFs5ehQLNzHF'),
      },
  lint: {
    plugins: ['typescript', 'react', 'unicorn', 'oxc', 'import'],
    categories: {
      correctness: 'error',
    },
    ignorePatterns: ['**/generated/**', 'build/**', 'dist/**', 'coverage/**', 'node_modules/**'],
    rules: {
      'no-console': 'error',
      'no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-param-reassign': 'error',
      'default-param-last': 'error',
      'default-case': 'error',
      curly: 'error',
      'react/exhaustive-deps': 'warn',
      'react/rules-of-hooks': 'error',
      'react/self-closing-comp': 'error',
      'typescript/no-inferrable-types': 'error',
      'typescript/prefer-as-const': 'error',
      'typescript/prefer-enum-initializers': 'error',
      'unicorn/prefer-number-properties': 'error',
    },
    overrides: [
      {
        files: ['**/*.test.ts', '**/*.test.tsx', '**/__mocks__/**', '**/__helpers__/**'],
        rules: {
          'typescript/no-explicit-any': 'off',
          'no-console': 'off',
        },
      },
      {
        files: ['scripts/**', 'codegen.ts', 'vite.config.ts', 'vitest.config.ts'],
        rules: {
          'no-console': 'off',
        },
      },
    ],
  },
  fmt: {
    tabWidth: 2,
    useTabs: false,
    singleQuote: true,
    jsxSingleQuote: false,
    ignorePatterns: [
      '**/generated/**',
      'build/**',
      'dist/**',
      'coverage/**',
      '.context/**',
      'index.html',
    ],
    sortImports: {
      newlinesBetween: true,
      customGroups: [
        { groupName: 'react', elementNamePattern: ['react', 'react-*', '@testing-library/**'] },
        { groupName: 'electron', elementNamePattern: ['*electron*', 'menubar'] },
        { groupName: 'primer', elementNamePattern: ['@primer/**'] },
        { groupName: 'octokit', elementNamePattern: ['@octokit/**'] },
        {
          groupName: 'mocks-helpers',
          elementNamePattern: ['**/__mocks__/**', '**/__helpers__/**'],
        },
        { groupName: 'shared', elementNamePattern: ['**/shared/**'] },
        { groupName: 'constants', elementNamePattern: ['**/constants', '**/constants/**'] },
        {
          groupName: 'state',
          elementNamePattern: [
            '**/context/**',
            '**/hooks/**',
            '**/routes/**',
            '**/stores',
            '**/stores/**',
          ],
        },
        {
          groupName: 'ui',
          elementNamePattern: [
            '**/layout/**',
            '**/components/**',
            '**/fields/**',
            '**/primitives/**',
          ],
        },
        { groupName: 'types', elementNamePattern: ['**/types'] },
      ],
      groups: [
        'builtin',
        'react',
        'electron',
        'primer',
        'octokit',
        'external',
        'mocks-helpers',
        'shared',
        'constants',
        'state',
        'ui',
        'types',
        ['internal', 'parent', 'sibling', 'index', 'subpath'],
        'unknown',
      ],
    },
  },
  staged: {
    '*': 'vp fmt --no-error-on-unmatched-pattern',
    '*.{js,jsx,ts,tsx}': 'vp lint --fix --no-error-on-unmatched-pattern',
    '*.{js,ts,tsx}': ['bash -c "tsc --noEmit"', 'vp test --changed --passWithNoTests --update'],
  },
});
