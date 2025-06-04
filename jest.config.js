module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000, // 30 seconds timeout for API tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js' // Exclude main entry point
  ],
  verbose: true,
  silent: false // Enable console output for API visualization
};
