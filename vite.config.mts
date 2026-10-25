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

  const extractSvgFilename = (imgHtml: string) => /src="(.*)"/.exec(imgHtml)?.[1].split('/').pop();

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

const TEST_FILES = ['**/*.test.ts', '**/*.test.tsx'];
const TEST_SUPPORT_FILES = ['**/__mocks__/**', '**/__helpers__/**'];
const TEST_EXCLUDES = [...TEST_FILES, ...TEST_SUPPORT_FILES];
const RENDERER_SOURCE_FILES = ['src/renderer/**/*.ts', 'src/renderer/**/*.tsx'];

// TypeScript source globs for one or more renderer layers, so an override
// cannot accidentally omit `.tsx`.
const rendererLayerFiles = (...layers: string[]): string[] =>
  layers.flatMap((layer) => [`src/renderer/${layer}/**/*.ts`, `src/renderer/${layer}/**/*.tsx`]);

// Match both a layer's directory and its contents, so a bare directory import
// (`../hooks`) cannot bypass the boundary rules once a barrel `index.ts` exists.
const forbiddenLayerGlobs = (layers: string[]): string[] =>
  layers.flatMap((layer) => [`**/${layer}`, `**/${layer}/**`]);

const rendererBoundaryPattern = (layers: string[], message: string) => ({
  group: forbiddenLayerGlobs(layers),
  allowTypeImports: true,
  message,
});

// Shared so a more specific override (for example the notification UI) can
// compose it instead of restating it and silently dropping the parent rule.
const componentRoutesBoundaryPattern = rendererBoundaryPattern(
  ['routes'],
  'Renderer boundary: `components` may not import from routes (see ARCHITECTURE.md).',
);

const notificationQueryBoundaryPattern = {
  group: [
    '**/hooks/useNotifications',
    '**/hooks/notifications/useNotificationsQuery',
    '**/hooks/notifications/useNotificationsHost',
  ],
  allowTypeImports: true,
  message:
    'Notification UI must not subscribe to the notifications query; it receives data via props. Use `useNotificationActions` for actions (see ARCHITECTURE.md).',
};

const processBoundaryPattern = {
  group: [...forbiddenLayerGlobs(['main', 'preload']), 'electron', 'electron/**'],
  allowTypeImports: true,
  message:
    'Renderer boundary: use `window.gitify` instead of importing the main process, preload, or Electron (see ARCHITECTURE.md).',
};

const rendererImportBoundaryPattern = {
  group: forbiddenLayerGlobs(['renderer']),
  allowTypeImports: true,
  message: 'Process boundary: main and preload must not import the renderer (see ARCHITECTURE.md).',
};

const sharedImportBoundaryPattern = {
  group: forbiddenLayerGlobs(['main', 'preload', 'renderer']),
  allowTypeImports: true,
  message:
    'Process boundary: shared code must not import main, preload, or renderer modules (see ARCHITECTURE.md).',
};

const mainImportBoundaryPattern = {
  group: forbiddenLayerGlobs(['main']),
  allowTypeImports: true,
  message: 'Process boundary: preload must not import main (see ARCHITECTURE.md).',
};

const preloadImportBoundaryPattern = {
  group: forbiddenLayerGlobs(['preload']),
  allowTypeImports: true,
  message: 'Process boundary: main must not import preload (see ARCHITECTURE.md).',
};

const forgeSpecificBoundaryPattern = rendererBoundaryPattern(
  ['forges/github', 'forges/gitlab', 'forges/gitea', 'forges/bitbucket'],
  'Renderer boundary: shared code must use the forge adapter instead of importing a forge-specific module (see ARCHITECTURE.md).',
);

const storeBarrelBoundaryPattern = {
  group: ['**/stores', '**/stores/index', '**/stores/index.ts'],
  allowTypeImports: true,
  message:
    'Renderer boundary: import the specific store module instead of the `stores` barrel (see ARCHITECTURE.md).',
};

export default defineConfig({
  plugins: [
    // only run the checker plugin in dev (not during `vite build`)
    ...(isBuild
      ? []
      : [
          checker({
            oxlint: { lintCommand: 'oxlint', dev: { logLevel: ['error'] } },
          }),
        ]),
    reactDevToolsPlugin(),
    react(),
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
                'electron-menubar',
                'electron-updater',
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
    plugins: ['typescript', 'react', 'unicorn', 'oxc', 'import', 'vitest'],
    // Enable the type-aware path so `vp check` runs TypeScript type checks
    // natively (via the TS Go toolchain / tsgolint). `typeCheck` requires
    // `typeAware`; enabling both also turns on the type-aware lint rules.
    options: {
      typeAware: true,
      typeCheck: true,
    },
    categories: {
      correctness: 'error',
    },
    ignorePatterns: ['**/generated/**', 'build/**', 'dist/**', 'coverage/**', 'node_modules/**'],
    rules: {
      'import/no-self-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-empty-named-blocks': 'error',
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
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'function-declaration',
          unnamedComponents: 'arrow-function',
        },
      ],
      'react/exhaustive-deps': 'error',
      'react/rules-of-hooks': 'error',
      'react/self-closing-comp': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/no-danger': 'error',
      'typescript/no-inferrable-types': 'error',
      'typescript/prefer-as-const': 'error',
      'typescript/prefer-enum-initializers': 'error',
      'unicorn/prefer-number-properties': 'error',
    },
    overrides: [
      {
        // Renderer boundary: every renderer module reaches the main process
        // through the preload bridge (`window.gitify`). Importing main/preload
        // code directly would bypass that contract. Layer-specific overrides
        // below compose this pattern so they cannot silently drop it.
        // See ARCHITECTURE.md.
        files: RENDERER_SOURCE_FILES,
        excludeFiles: TEST_FILES,
        rules: {
          'no-restricted-imports': ['error', { patterns: [processBoundaryPattern] }],
        },
      },
      {
        // Renderer boundary: `utils` and `stores` are peer domain layers; neither
        // may import hooks, components, or routes. Shared utils also may not
        // import a forge-specific module; they go through the forge adapter.
        // See ARCHITECTURE.md.
        files: rendererLayerFiles('utils'),
        excludeFiles: ['src/renderer/utils/forges/**', ...TEST_FILES],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                rendererBoundaryPattern(
                  ['hooks', 'components', 'routes'],
                  'Renderer boundary: `utils` may not import from hooks, components, or routes (see ARCHITECTURE.md).',
                ),
                processBoundaryPattern,
                forgeSpecificBoundaryPattern,
                storeBarrelBoundaryPattern,
              ],
            },
          ],
        },
      },
      {
        // Forge adapter implementations are the one place allowed to import
        // their own forge-specific modules. They remain `utils` and may not
        // import hooks, components, or routes. See ARCHITECTURE.md.
        files: rendererLayerFiles('utils/forges'),
        excludeFiles: TEST_FILES,
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                rendererBoundaryPattern(
                  ['hooks', 'components', 'routes'],
                  'Renderer boundary: `utils` may not import from hooks, components, or routes (see ARCHITECTURE.md).',
                ),
                processBoundaryPattern,
                storeBarrelBoundaryPattern,
              ],
            },
          ],
        },
      },
      {
        files: rendererLayerFiles('stores'),
        excludeFiles: TEST_FILES,
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                rendererBoundaryPattern(
                  ['hooks', 'components', 'routes'],
                  'Renderer boundary: `stores` may not import from hooks, components, or routes (see ARCHITECTURE.md).',
                ),
                processBoundaryPattern,
                forgeSpecificBoundaryPattern,
              ],
            },
          ],
        },
      },
      {
        files: rendererLayerFiles('hooks'),
        excludeFiles: TEST_FILES,
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                rendererBoundaryPattern(
                  ['components', 'routes'],
                  'Renderer boundary: `hooks` may not import from components or routes (see ARCHITECTURE.md).',
                ),
                processBoundaryPattern,
                forgeSpecificBoundaryPattern,
              ],
            },
          ],
        },
      },
      {
        files: rendererLayerFiles('components'),
        excludeFiles: TEST_FILES,
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                componentRoutesBoundaryPattern,
                processBoundaryPattern,
                forgeSpecificBoundaryPattern,
              ],
            },
          ],
        },
      },
      {
        // Renderer boundary: the notification UI renders once per notification
        // (rows, repository headers, account headers) and receives its data via
        // props from the route. It must not subscribe to the notifications query:
        // every observer re-runs `select` and the structural-sharing walk on each
        // cache write, so subscribing here multiplies that cost by the number of
        // mounted items. Action-only consumers use `useNotificationActions`.
        // See ARCHITECTURE.md.
        files: rendererLayerFiles('components/notifications'),
        excludeFiles: TEST_FILES,
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                componentRoutesBoundaryPattern,
                notificationQueryBoundaryPattern,
                processBoundaryPattern,
                forgeSpecificBoundaryPattern,
              ],
            },
          ],
        },
      },
      {
        // Renderer boundary: `icons` is a presentational leaf. It may not
        // depend on any implementation layer. See ARCHITECTURE.md.
        files: rendererLayerFiles('icons'),
        excludeFiles: TEST_FILES,
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                rendererBoundaryPattern(
                  ['utils', 'stores', 'hooks', 'components', 'routes'],
                  'Renderer boundary: `icons` is a leaf and may not import utils, stores, hooks, components, or routes (see ARCHITECTURE.md).',
                ),
                processBoundaryPattern,
                forgeSpecificBoundaryPattern,
              ],
            },
          ],
        },
      },
      {
        // Renderer boundary: `types`/`constants` are leaf modules. They may
        // reference types (hence allowTypeImports) but not implementation
        // layers. See ARCHITECTURE.md.
        files: ['src/renderer/types.ts', 'src/renderer/constants.ts'],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                rendererBoundaryPattern(
                  ['utils', 'stores', 'hooks', 'components', 'routes'],
                  'Renderer boundary: leaf modules (`types`, `constants`) may not import implementation layers (see ARCHITECTURE.md).',
                ),
                processBoundaryPattern,
                forgeSpecificBoundaryPattern,
              ],
            },
          ],
        },
      },
      {
        // Renderer boundary: the renderer is sandboxed and must reach the main
        // process through `window.gitify`, not by importing Node builtins.
        // See ARCHITECTURE.md.
        files: RENDERER_SOURCE_FILES,
        excludeFiles: TEST_EXCLUDES,
        rules: {
          'import/no-nodejs-modules': 'error',
        },
      },
      {
        // Renderer boundary: shared renderer code outside the forge adapter
        // implementations must go through the adapter API. See ARCHITECTURE.md.
        files: ['src/renderer/App.tsx', 'src/renderer/index.tsx', ...rendererLayerFiles('routes')],
        excludeFiles: TEST_FILES,
        rules: {
          'no-restricted-imports': [
            'error',
            { patterns: [forgeSpecificBoundaryPattern, processBoundaryPattern] },
          ],
        },
      },
      {
        // `import/no-cycle` is enforced across the renderer. The pre-existing
        // cycles in `utils`, `stores`, and the forge adapters were removed so
        // the rule can be enabled here. See ARCHITECTURE.md.
        files: RENDERER_SOURCE_FILES,
        excludeFiles: TEST_EXCLUDES,
        rules: {
          'import/no-cycle': 'error',
        },
      },
      {
        // Process boundary: main must not reach into preload or the renderer.
        files: ['src/main/**/*.ts', 'src/main/**/*.tsx'],
        excludeFiles: TEST_EXCLUDES,
        rules: {
          'no-restricted-imports': [
            'error',
            { patterns: [rendererImportBoundaryPattern, preloadImportBoundaryPattern] },
          ],
        },
      },
      {
        // Process boundary: preload must not reach into main or the renderer.
        files: ['src/preload/**/*.ts', 'src/preload/**/*.tsx'],
        excludeFiles: TEST_EXCLUDES,
        rules: {
          'no-restricted-imports': [
            'error',
            { patterns: [rendererImportBoundaryPattern, mainImportBoundaryPattern] },
          ],
        },
      },
      {
        // Process boundary: shared code is imported by both processes and must
        // stay independent of main, preload, and renderer modules. It is also
        // bundled into the renderer, so it must not import Node builtins.
        files: ['src/shared/**/*.ts', 'src/shared/**/*.tsx'],
        excludeFiles: TEST_EXCLUDES,
        rules: {
          'no-restricted-imports': ['error', { patterns: [sharedImportBoundaryPattern] }],
          'import/no-nodejs-modules': 'error',
        },
      },
      {
        // Cycle detection also covers the main, preload, and shared processes.
        files: [
          'src/main/**/*.ts',
          'src/main/**/*.tsx',
          'src/preload/**/*.ts',
          'src/preload/**/*.tsx',
          'src/shared/**/*.ts',
          'src/shared/**/*.tsx',
        ],
        excludeFiles: TEST_EXCLUDES,
        rules: {
          'import/no-cycle': 'error',
        },
      },
      {
        files: TEST_EXCLUDES,
        rules: {
          'vitest/no-focused-tests': 'error',
          'vitest/no-disabled-tests': 'error',
          'vitest/no-standalone-expect': 'error',
          // Vitest supports expect(actual, message); the default maxArgs is 1.
          'vitest/valid-expect': ['error', { maxArgs: 2 }],
          // Snapshot hints are not enforced; snapshots are being phased out.
          'vitest/prefer-snapshot-hint': 'off',
          // Typing every `vi.fn()` mock is a separate, large test refactor.
          'vitest/require-mock-type-parameters': 'off',
          'typescript/no-explicit-any': 'off',
          'no-console': 'off',
          // Mocks are typed as the real Electron/interface classes, so
          // `expect(dialog.showMessageBox)` reads as an unbound class method
          // even though the runtime value is a `vi.fn()`. The rule is a false
          // positive for test doubles, so scope it to non-test code.
          'typescript/unbound-method': 'off',
        },
      },
      {
        files: ['**/*.visual.test.tsx'],
        rules: {
          // Visual assertions live in the `captureRoute` helper.
          'vitest/expect-expect': [
            'error',
            {
              assertFunctionNames: [
                'expect',
                'expectTypeOf',
                'assert',
                'assertType',
                'captureRoute',
              ],
            },
          ],
        },
      },
      {
        files: ['scripts/**', 'codegen.ts', 'vite.config.mts', 'vitest.config.mts'],
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
      // Autogenerated by release-please; its formatting is not ours to enforce.
      'CHANGELOG.md',
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
          elementNamePattern: ['**/hooks/**', '**/routes/**', '**/stores', '**/stores/**'],
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
    '*.{js,ts,tsx}': [
      'bash -c "tsc --noEmit"',
      "vp test --changed --passWithNoTests --update --project 'happy-dom [preload, renderer]' --project 'node [main, shared]'",
    ],
  },
});
