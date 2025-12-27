import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['__tests__/**/*.test.js'],
    exclude: [
      'node_modules/**',
      '.netlify/**',
      'coverage/**',
      'dist/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'assets/js/google-reviews-widget.js',
        'netlify/functions/google-reviews.js',
      ],
      exclude: [
        'node_modules/**',
        '.netlify/**',
        'coverage/**',
        '__tests__/**',
        'assets/js/functions.js',
        '**/*.test.js',
        '**/*.spec.js',
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    globals: true,
  },
});
