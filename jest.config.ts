import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['<rootDir>/src/renderer/__helpers__/jest.setup.ts'],
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*', '!**/__snapshots__/**'],
  // Use ts-jest for TS and babel-jest for JS so we can transpile ESM from node_modules (@primer/react)
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
    '^.+\\.(js|jsx|mjs)$': 'babel-jest',
  },
  // Allow transforming specific ESM packages in node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(?:@primer/react|@primer/primitives|@primer/octicons-react|@lit-labs/react|lit|@github/relative-time-element|@github/tab-container-element)/)',
  ],
  moduleNameMapper: {
    // Force CommonJS build for http adapter to be available.
    // via https://github.com/axios/axios/issues/5101#issuecomment-1276572468
    '^axios$': require.resolve('axios'),

    // GitHub Primer Design System - CSS in JS
    '\\.css$': 'identity-obj-proxy',
  },
  modulePathIgnorePatterns: ['<rootDir>/build', '<rootDir>/node_modules'],
};

module.exports = config;
