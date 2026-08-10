import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './test/setup.ts',
    include: ['tests/**/*.test.*', 'tests/**/*.spec.*'],
    exclude: ['node_modules/**', 'e2e/**']
  }
})
