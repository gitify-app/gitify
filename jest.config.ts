import type { Config } from 'jest';

const esmPackages = [
  '@github/relative-time-element',
  '@github/tab-container-element',
  '@lit-labs/react',
  '@octokit/app',
  '@octokit/core',
  '@octokit/endpoint',
  '@octokit/oauth-authorization-url',
  '@octokit/oauth-methods',
  '@octokit/graphql',
  '@octokit/plugin-paginate-graphql',
  '@octokit/plugin-paginate-rest',
  '@octokit/plugin-retry',
  '@octokit/plugin-rest-endpoint-methods',
  '@octokit/plugin-throttling',
  '@octokit/request',
  '@octokit/request-error',
  '@primer/octicons-react',
  '@primer/primitives',
  '@primer/react',
  'lit',
  'universal-user-agent',
];

const escapeForRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const transformIgnorePattern = `node_modules/(?!(?:${esmPackages.map(escapeForRegExp).join('|')})/)`;

const config: Config = {
  preset: 'ts-jest',
  globalSetup: '<rootDir>/src/renderer/__helpers__/jest.setup.env.ts',
  setupFilesAfterEnv: ['<rootDir>/src/renderer/__helpers__/jest.setup.ts'],
  testEnvironment: 'jsdom',
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*', '!**/__snapshots__/**'],
  // Use ts-jest for TS/TSX and babel-jest only for plain JS/ESM (no JSX handled there)
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
    '^.+\\.(js|mjs)$': 'babel-jest',
  },
  // Allow transforming specific ESM packages in node_modules that ship untranspiled ESM.
  // Packages are listed above in `esmPackages` for easier maintenance.
  transformIgnorePatterns: [transformIgnorePattern],
  moduleNameMapper: {
    // GitHub Primer Design System - CSS in JS
    '\\.css$': 'identity-obj-proxy',
  },
  modulePathIgnorePatterns: ['<rootDir>/build', '<rootDir>/node_modules'],
};

module.exports = config;
