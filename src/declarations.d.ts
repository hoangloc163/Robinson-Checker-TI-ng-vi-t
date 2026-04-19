/**
 * declarations.d.ts – Bổ sung kiểu cho các global API
 * mà jsdom chưa có hoặc TypeScript chưa nhận diện trong môi trường test.
 *
 * FIX cho lỗi:
 *   – "Cannot find name 'global'" (setup.tsx dùng global.ResizeObserver)
 *   – ResizeObserver không có trong lib DOM của jsdom
 */

// Đảm bảo ResizeObserver được TypeScript nhận diện trong môi trường jsdom
interface Window {
  ResizeObserver: typeof ResizeObserver;
}

// Cho phép dùng `global.XXX = ...` trong setup.tsx (Node.js global object)
declare const global: typeof globalThis & {
  ResizeObserver: typeof ResizeObserver;
};
