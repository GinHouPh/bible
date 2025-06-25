module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/apps', '<rootDir>/packages'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  collectCoverageFrom: [
    'apps/**/*.{ts,tsx}',
    'packages/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**'
  ],
  moduleNameMapping: {
    '^@bible/shared/(.*)$': '<rootDir>/packages/shared/src/$1',
    '^@bible/parser/(.*)$': '<rootDir>/packages/bible-parser/src/$1',
    '^@bible/database/(.*)$': '<rootDir>/packages/database/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
