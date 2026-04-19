/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * vitest.config.ts – Cấu hình Vitest cho Robinson Auto-Checker
 *
 * FIX Plugin type error:
 * Dùng "@ts-expect-error" để bỏ qua lỗi type mismatch giữa
 * vitest/vite và project vite (hai phiên bản Plugin<any> khác nhau).
 * Đây là known issue của @vitejs/plugin-react với vitest.
 */
export default defineConfig({
  // @ts-expect-error - known type mismatch between vitest's vite and project's vite
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.tsx'],
    include: ['src/__tests__/**/*.{test,spec}.{ts,tsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/__tests__/**',
        'src/main.tsx',
        'src/vitest.d.ts',
        'src/declarations.d.ts',
      ],
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
