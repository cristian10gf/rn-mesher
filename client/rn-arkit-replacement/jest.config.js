module.exports = {
  preset: 'react-native',
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.test.tsx'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};
