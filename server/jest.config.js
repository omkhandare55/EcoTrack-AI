module.exports = {
  testTimeout: 300000,
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/config/database.ts',
    '!src/seeds/**',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 90,
      lines: 93,
      statements: 93,
    },
  },
  setupFilesAfterEnv: [],
  clearMocks: true,
  coverageDirectory: 'coverage',
};
