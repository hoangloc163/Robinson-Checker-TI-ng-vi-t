/**
 * toLatex.test.ts – Unit Tests cho hàm toLatex()
 * Module: src/utils/toLatex.ts
 * TC001 – TC015 (15 test cases)
 *
 * Chạy: npm test -- toLatex
 */

import { describe, it, expect } from 'vitest';
import { toLatex } from '../utils/toLatex';

// ─────────────────────────────────────────────────────────────────────────────
// Nhóm 1: toLatex() – Chuyển đổi ký hiệu logic sang LaTeX
// ─────────────────────────────────────────────────────────────────────────────
describe('Nhóm 1 – toLatex(): Chuyển đổi ký hiệu logic sang LaTeX', () => {

  // TC001: Đầu vào rỗng trả về chuỗi rỗng
  it('TC001 – Đầu vào rỗng ("") trả về chuỗi rỗng', () => {
    expect(toLatex('')).toBe('');
  });

  // TC002: <-> → \leftrightarrow
  it('TC002 – Chuyển đổi "<->" thành "\\leftrightarrow" (tương đương)', () => {
    const result = toLatex('P <-> Q');
    expect(result).toContain('\\leftrightarrow');
  });

  // TC003: => → \rightarrow
  it('TC003 – Chuyển đổi "=>" thành "\\rightarrow" (kéo theo)', () => {
    const result = toLatex('P => Q');
    expect(result).toContain('\\rightarrow');
  });

  // TC004: -> → \rightarrow (mũi tên đơn)
  it('TC004 – Chuyển đổi "->" thành "\\rightarrow" (mũi tên đơn)', () => {
    const result = toLatex('P -> Q');
    expect(result).toContain('\\rightarrow');
  });

  // TC005: ~ → \neg (phủ định)
  it('TC005 – Chuyển đổi "~" thành "\\neg" (phủ định)', () => {
    const result = toLatex('~P');
    expect(result).toContain('\\neg');
  });

  // TC006: ^ → \wedge (caret)
  it('TC006 – Chuyển đổi "^" thành "\\wedge" (phép hội – caret)', () => {
    const result = toLatex('P ^ Q');
    expect(result).toContain('\\wedge');
  });

  // TC007: & → \wedge (ampersand)
  it('TC007 – Chuyển đổi "&" thành "\\wedge" (phép hội – ampersand)', () => {
    const result = toLatex('P & Q');
    expect(result).toContain('\\wedge');
  });

  // TC008: v → \vee (phép tuyển)
  it('TC008 – Chuyển đổi "v" thành "\\vee" (phép tuyển)', () => {
    const result = toLatex('P v Q');
    expect(result).toContain('\\vee');
  });

  // TC009: | → \vee (pipe)
  it('TC009 – Chuyển đổi "|" thành "\\vee" (phép tuyển – pipe)', () => {
    const result = toLatex('P | Q');
    expect(result).toContain('\\vee');
  });

  // TC010: [] → \square (mâu thuẫn)
  it('TC010 – Chuyển đổi "[]" thành "\\square" (mâu thuẫn)', () => {
    const result = toLatex('[]');
    expect(result).toContain('\\square');
  });

  // TC011: ký tự □ → \square
  it('TC011 – Chuyển đổi ký tự "□" thành "\\square"', () => {
    const result = toLatex('□');
    expect(result).toContain('\\square');
  });

  // TC012: nội dung trong () → \text{}
  it('TC012 – Bọc văn bản trong ngoặc đơn bằng \\text{}', () => {
    const result = toLatex('(Cho trước)');
    expect(result).toContain('\\text{');
  });

  // TC013: Công thức phức hợp P ^ Q => R → chứa cả \wedge lẫn \rightarrow
  it('TC013 – Xử lý công thức phức hợp "P ^ Q => R"', () => {
    const result = toLatex('P ^ Q => R');
    expect(result).toContain('\\wedge');
    expect(result).toContain('\\rightarrow');
  });

  // TC014: Phủ định kép ~~P → chứa \neg ít nhất 1 lần
  it('TC014 – Xử lý phủ định kép "~~P" (chứa \\neg ít nhất 1 lần)', () => {
    const result = toLatex('~~P');
    expect(result).toContain('\\neg');
  });

  // TC015: <-> không tạo xung đột với ->
  // "P <-> Q" phải chứa \leftrightarrow và KHÔNG chứa \rightarrow riêng lẻ
  it('TC015 – Ưu tiên "<->" trước "->" – không tạo xung đột', () => {
    const result = toLatex('P <-> Q');
    expect(result).toContain('\\leftrightarrow');
    // Sau khi thay <-> → \leftrightarrow, không còn -> nào để replace thành \rightarrow
    expect(result).not.toContain('\\rightarrow');
  });
});
