/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Cấu hình Vitest cho Robinson Auto-Checker
 * Môi trường: jsdom (giả lập trình duyệt)
 */
export default defineConfig({
  plugins: [react() as any],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.tsx'],
    include: ['src/__tests__/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/__tests__/**', 'src/main.tsx'],
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
      },
    },
    // Không gọi API thật – GEMINI_API_KEY để trống ở mức config
    // Tests sẽ mock module src/utils/config.ts để kiểm soát giá trị này
    env: {},
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  // KHÔNG define process.env.GEMINI_API_KEY ở đây → cho phép vi.mock config module
});
