import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defaultExclude, defineConfig } from 'vitest/config';

// Set a stable timezone before any workers start so that Intl (used by
// @primer/react's RelativeTime component) always formats dates in UTC,
// regardless of the local system timezone (e.g. when travelling).
process.env.TZ = 'UTC';

// Mirrors `WindowConfig` in src/main/config.ts, which cannot be imported here
// because it resolves `__dirname` at module scope. src/main/config.test.ts
// asserts these same values.
const MENUBAR_VIEWPORT = { width: 500, height: 400 };

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    pool: 'vmThreads',
    isolate: false,
    clearMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    // Pre-bundle @primer/react rather than re-transforming the raw package on every thread load.
    // See https://vitest.dev/guide/profiling-test-performance.html#use-the-dependency-optimizer
    deps: {
      optimizer: {
        client: {
          include: ['@primer/react'],
        },
      },
    },
    experimental: {
      importDurations: {
        print: true,
      },
    },
    coverage: {
      enabled: false,
      reportOnFailure: true,
      reporter: ['html', 'lcovonly'],
      include: ['src/**/*'],
      exclude: ['**/*.html', '**/*.graphql', '**/graphql/generated/**', '**/.DS_Store'],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'happy-dom [preload, renderer]',
          environment: 'happy-dom',
          css: true,
          include: ['src/preload/**/*.test.{ts,tsx}', 'src/renderer/**/*.test.{ts,tsx}'],
          // Visual tests share the `.test.tsx` suffix but need a real browser.
          // Spread the defaults; assigning `exclude` replaces them outright.
          exclude: [...defaultExclude, '**/*.visual.test.tsx'],
          setupFiles: ['./src/renderer/__helpers__/vitest.setup.ts'],
        },
      },
      {
        // TODO - Opportunity in future to move some of the renderer util tests to node environment
        extends: true,
        test: {
          name: 'node [main, shared]',
          environment: 'node',
          include: ['src/shared/**/*.test.{ts,tsx}', 'src/main/**/*.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        // Tailwind is not in the root plugins because the other two projects never
        // resolve `@import 'tailwindcss'`; pixel comparison does.
        plugins: [tailwindcss()],
        // `src/renderer/constants.ts` reads this, and unlike the other two
        // projects there is no Node `process` in the browser to read it from.
        define: {
          'process.env.OAUTH_CLIENT_ID': JSON.stringify('visual-test-client-id'),
        },
        test: {
          name: 'browser [visual]',
          include: ['src/renderer/**/*.visual.test.tsx'],
          setupFiles: ['./src/renderer/__helpers__/visual.setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              launchOptions: {
                // Chromium's default font rendering varies with GPU availability.
                // Force the software path so a developer's machine and CI agree.
                args: ['--disable-lcd-text', '--font-render-hinting=none'],
              },
              contextOptions: {
                // The renderer formats relative timestamps via Intl; the Node-level
                // `process.env.TZ` above does not reach the browser process.
                timezoneId: 'UTC',
                locale: 'en-US',
                // Only reached by Theme.SYSTEM, which resolves via `prefers-color-scheme`.
                colorScheme: 'light',
              },
            }),
            instances: [
              {
                browser: 'chromium',
                viewport: MENUBAR_VIEWPORT,
              },
            ],
            expect: {
              toMatchScreenshot: {
                comparatorName: 'pixelmatch',
                comparatorOptions: {
                  // Per-pixel colour tolerance, to absorb antialiasing noise.
                  threshold: 0.2,
                  // But zero tolerance for the *number* of differing pixels.
                  // Rendering is deterministic here (fixed container, arch,
                  // fonts and clock), so any drift is a real change. A ratio of
                  // even 0.01 would permit ~2000 pixels on this 500x400
                  // viewport — larger than a whole icon, which is enough to
                  // hide a completely swapped glyph.
                  allowedMismatchedPixels: 0,
                },
              },
            },
          },
        },
      },
    ],
  },
});
