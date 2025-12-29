import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  css: {
    // Disable CSS processing for tests
    modules: {
      localsConvention: 'camelCase',
    },
  },
  resolve: {
    alias: {
      '@tauri-apps/api/core': path.resolve(
        __dirname,
        './src/__mocks__/@tauri-apps/api.ts',
      ),
      '@tauri-apps/api': path.resolve(
        __dirname,
        './src/__mocks__/@tauri-apps/api.ts',
      ),
      '@tauri-apps/plugin-log': path.resolve(
        __dirname,
        './src/__mocks__/@tauri-apps/plugin-log.ts',
      ),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__helpers__/vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'src-tauri'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules',
        'src-tauri',
        'src/__helpers__',
        '**/*.test.{ts,tsx}',
        '**/*.d.ts',
      ],
    },
    // Mock CSS imports
    css: false,
    // Server configuration to handle external dependencies
    server: {
      deps: {
        inline: ['@primer/react', '@primer/css'],
      },
    },
  },
});
