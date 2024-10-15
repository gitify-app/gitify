import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  setupFiles: [
    '<rootDir>/src/renderer/__helpers__/setupEnvVars.js',
    '<rootDir>/src/renderer/__helpers__/setupPrimerJest.js',
  ],
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*', '!**/__snapshots__/**'],
  moduleNameMapper: {
    // Force CommonJS build for http adapter to be available.
    // via https://github.com/axios/axios/issues/5101#issuecomment-1276572468
    '^axios$': require.resolve('axios'),
  },
  modulePathIgnorePatterns: ['<rootDir>/build', '<rootDir>/node_modules'],
};

module.exports = config;
