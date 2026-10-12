import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/build/**/*.test.ts'],
    globalSetup: ['tests/build/global-setup.ts'],
    testTimeout: 30_000,
    hookTimeout: 240_000,
  },
});
