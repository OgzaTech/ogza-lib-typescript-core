/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.spec.ts'], // Sadece __tests__ altındaki spec dosyalarını bul
  moduleFileExtensions: ['ts', 'js'],
  collectCoverage: true, // Coverage raporunu otomatik üret
  collectCoverageFrom: [
  'src/**/*.ts', 
  '!src/index.ts', 
  '!src/**/*.d.ts',
  '!src/**/__tests__/**' // Test dosyalarının kendisini coverage'a katma
],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov']
};