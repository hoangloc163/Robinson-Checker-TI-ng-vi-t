/**
 * setup.tsx – Cấu hình môi trường test toàn cục
 * Chạy trước MỖI file test (setupFiles trong vitest.config.ts)
 *
 * FIX các lỗi TypeScript:
 *   1. localStorageMock: KHÔNG đánh kiểu tường minh là Storage
 *      vi.fn() trả về Mock<T> - không gán được vào Storage interface
 *   2. ResizeObserver mock dùng window thay vì global
 *   3. vi, beforeEach, afterEach IMPORT tường minh từ 'vitest'
 */

import '@testing-library/jest-dom';
import React from 'react';
import { vi, beforeEach, afterEach } from 'vitest';

// ─── 1. localStorage mock (in-memory) ────────────────────────────────────────
// QUAN TRỌNG: Không khai báo `: Storage` tường minh vì vi.fn() trả về
// kiểu Mock<T>, không tương thích với Storage interface khi strict mode.
// Dùng type assertion `as unknown as Storage` trong Object.defineProperty.
const localStorageMock = (() => {
  let _store: Record<string, string> = {};
  return {
    getItem:    (key: string): string | null => _store[key] ?? null,
    setItem:    (key: string, value: string): void => { _store[key] = String(value); },
    removeItem: (key: string): void => { delete _store[key]; },
    clear:      (): void => { _store = {}; },
    get length(): number { return Object.keys(_store).length; },
    key:        (index: number): string | null => Object.keys(_store)[index] ?? null,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value:    localStorageMock as unknown as Storage,
  writable: true,
});

// ─── 2. CSS imports mock ──────────────────────────────────────────────────────
vi.mock('katex/dist/katex.min.css', () => ({}));

// ─── 3. motion/react – render children trực tiếp, bỏ qua animation ───────────
vi.mock('motion/react', () => ({
  motion: new Proxy({} as Record<string, unknown>, {
    get: (_target, tag: string) =>
      // eslint-disable-next-line react/display-name
      ({ children, ...rest }: React.PropsWithChildren<Record<string, unknown>>) =>
        // FIX: React.ElementType thay vì keyof JSX.IntrinsicElements
        React.createElement(tag as React.ElementType, rest, children),
  }),
  AnimatePresence: ({ children }: React.PropsWithChildren) =>
    React.createElement(React.Fragment, null, children),
}));

// ─── 4. react-katex – render span thay vì KaTeX thật ─────────────────────────
vi.mock('react-katex', () => ({
  InlineMath: ({ math }: { math: string }) =>
    React.createElement('span', { 'data-testid': 'inline-math', 'data-math': math }, math),
  BlockMath: ({ math }: { math: string }) =>
    React.createElement('div', { 'data-testid': 'block-math', 'data-math': math }, math),
}));

// ─── 5. ResizeObserver mock (jsdom không tích hợp sẵn) ───────────────────────
// Dùng window thay vì global để tương thích TypeScript strict + declarations.d.ts
(window as Window & { ResizeObserver: unknown }).ResizeObserver = vi
  .fn()
  .mockImplementation(() => ({
    observe:    vi.fn(),
    unobserve:  vi.fn(),
    disconnect: vi.fn(),
  }));

// ─── 6. Reset state trước mỗi test ───────────────────────────────────────────
beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
