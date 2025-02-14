import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/renderer/__helpers__/vitest.setup.ts'],
    coverage: {
      reporter: ['lcov', 'text', 'html'],
    },
    outputFile: 'coverage/sonar-report.xml',
  },
});
