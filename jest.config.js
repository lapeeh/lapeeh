/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@lapeeh/core/database$': '<rootDir>/tests/mocks/database.ts',
    '.*core/database$': '<rootDir>/tests/mocks/database.ts',
    '^@lapeeh/(.*)$': '<rootDir>/lib/$1',
    '^uuid$': '<rootDir>/tests/mocks/uuid.ts',
  },
  transformIgnorePatterns: ['node_modules/(?!(uuid)/)'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
