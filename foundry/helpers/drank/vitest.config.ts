import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        branches: 50,
        functions: 55,
        lines: 55,
        statements: 50,
      },
    },
  },
});
