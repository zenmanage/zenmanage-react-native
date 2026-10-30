import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'tests/**',
        'examples/**',
        '**/*.d.ts',
        '**/*.config.ts',
      ],
      thresholds: {
        lines: 94,
        functions: 94,
        branches: 90,
        statements: 94,
      },
    },
  },
});
