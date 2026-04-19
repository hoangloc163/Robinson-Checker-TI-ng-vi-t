/**
 * vitest.d.ts – Khai báo Vitest globals cho TypeScript / VSCode IntelliSense
 *
 * CÁCH HOẠT ĐỘNG:
 * - File này dùng triple-slash reference để import vitest/globals
 * - Vì file nằm trong src/ và được include trong tsconfig,
 *   TypeScript sẽ áp dụng vitest globals cho TẤT CẢ file trong project
 * - KHÔNG cần thêm "types": ["vitest/globals"] vào tsconfig.json
 *   (cách đó sẽ override auto-include và làm mất vite/client types)
 *
 * Fixes lỗi: "Cannot find name 'describe'" / "Cannot find name 'vi'"
 * trong các file test khi không import tường minh từ 'vitest'.
 */
/// <reference types="vitest/globals" />
