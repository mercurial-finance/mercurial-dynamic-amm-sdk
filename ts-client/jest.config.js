const TIMEOUT_SEC = 1000;

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  testPathIgnorePatterns: ['<rootDir/>src/amm/tests/anchor'],
  setupFiles: ['<rootDir>/jest/setup.js'],
  testTimeout: TIMEOUT_SEC * 90,
};
