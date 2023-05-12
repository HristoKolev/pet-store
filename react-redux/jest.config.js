module.exports = {
  errorOnDeprecated: true,
  maxWorkers: '100%',
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  resetMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,tsx}',
    '!<rootDir>/src/index.tsx', // Entrypoint
    '!<rootDir>/src/testing/**', // Testing utilities
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      lines: 90,
      statements: 90,
      functions: 90,
    },
  },
};
