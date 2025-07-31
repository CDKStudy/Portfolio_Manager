module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: false,
  verbose: true,
  testTimeout: 30000,
  setupFilesAfterEnv: [],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['js', 'json'],
  transform: {},
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
}; 