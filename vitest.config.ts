import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/renderer/__helpers__/vitest.setup.ts'],
    coverage: {
      reporter: ['lcov', 'text'],
    },
    outputFile: 'coverage/sonar-report.xml',
  },
});
