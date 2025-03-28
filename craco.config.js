const path = require('path');

module.exports = {
  jest: {
    configure: {
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      testEnvironment: 'jsdom',
      transformIgnorePatterns: [
        '/node_modules/(?!(@mui|@babel|@emotion)/)',
      ],
    },
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@test': path.resolve(__dirname, 'src/test'),
    },
  },
}; 