// Test setup file
// This file runs before each test suite

// Increase timeout for all tests
jest.setTimeout(30000);

// Global test configuration
global.console = {
  ...console,
  // Suppress console.log during tests unless needed
  log: process.env.NODE_ENV === 'test' ? jest.fn() : console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Clean up after tests
afterAll(async () => {
  // Add any global cleanup here if needed
  await new Promise(resolve => setTimeout(resolve, 1000));
});
