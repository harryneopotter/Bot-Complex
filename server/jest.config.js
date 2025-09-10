/** @type {import('jest').Config} */
const config = {
  // Indicates that the root of your project is the server directory
  rootDir: './',
  // The test environment that will be used for testing
  testEnvironment: 'node',
  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  // A map from regular expressions to paths to transformers
  transform: {},
  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: ['/node_modules/'],
  // Indicates whether each individual test should be reported during the run
  verbose: true,
};

export default config;
