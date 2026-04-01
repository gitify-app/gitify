import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    pool: 'vmThreads',
    clearMocks: true,
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
      exclude: ['**/*.html', '**/*.graphql', '**/graphql/generated/**'],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'happy-dom [preload, renderer]',
          environment: 'happy-dom',
          css: true,
          include: [
            'src/preload/**/*.test.{ts,tsx}',
            'src/renderer/**/*.test.{ts,tsx}',
          ],
          setupFiles: ['./src/renderer/__helpers__/vitest.setup.ts'],
        },
      },
      {
        // TODO - Opportunity in future to move some of the renderer util tests to node environment
        extends: true,
        test: {
          name: 'node [main, shared]',
          environment: 'node',
          include: [
            'src/shared/**/*.test.{ts,tsx}',
            'src/main/**/*.test.{ts,tsx}',
          ],
        },
      },
    ],
  },
});
