module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js'],
  coverageDirectory: 'coverage'
};
// Only match tests in the `tests/` folder and avoid picking up misc scripts.
module.exports.testMatch = ['**/tests/**/*.test.js'];
