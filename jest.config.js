const config = {
  preset: 'ts-jest/presets/js-with-ts',
  setupFiles: ['<rootDir>/src/__helpers__/setupEnvVars.js'],
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageThreshold: {
    global: {
      lines: 90,
    },
  },
  moduleNameMapper: {
    // Force CommonJS build for http adapter to be available.
    // via https://github.com/axios/axios/issues/5101#issuecomment-1276572468
    '^axios$': require.resolve('axios'),
  },
};

module.exports = config;
