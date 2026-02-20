import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    pool: 'threads',
    // Server configuration to handle external dependencies
    server: {
      deps: {
        inline: ['@primer/react', '@primer/css'],
      },
    },
    coverage: {
      enabled: false,
      provider: 'v8',
      reportsDirectory: './coverage',
      cleanOnRerun: true,
      reporter: ['html', 'lcovonly'],
      include: ['src/**/*'],
      exclude: [
        '**/__snapshots__/**',
        '**/graphql/generated/**',
        '**/*.graphql',
        '**/*.html',
        '.DS_Store',
      ],
    },
    exclude: [
      '**/node_modules/**',
      '**/build/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
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
