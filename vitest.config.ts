import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Confine discovery to the project's own tests. The default glob picks up
    // test files inside .kilo/worktrees/ and .worktrees/, inflating the
    // reported count (81 instead of the 27 fixtures in src/lib).
    include: ['src/**/*.test.ts'],
  },
});