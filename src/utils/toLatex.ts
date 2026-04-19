/**
 * toLatex – Chuyển đổi ký hiệu ASCII logic sang chuỗi LaTeX cho KaTeX
 *
 * Thứ tự thay thế QUAN TRỌNG:
 *  1. <-> trước -> để tránh <-> bị tách thành <-  +  >
 *  2. => trước -> để tránh => bị tách thành =  +  ->
 */
export const toLatex = (text: string): string => {
  if (!text) return '';

  let latex = text
    .replace(/<->/g, '\\leftrightarrow ')   // tương đương
    .replace(/=>/g, '\\rightarrow ')         // kéo theo (=>)
    .replace(/->/g, '\\rightarrow ')         // kéo theo (->)
    .replace(/~/g, '\\neg ')                 // phủ định
    .replace(/\^/g, '\\wedge ')              // hội (caret)
    .replace(/&/g, '\\wedge ')               // hội (ampersand)
    .replace(/\bv\b/g, '\\vee ')             // tuyển (standalone 'v')
    .replace(/\|/g, '\\vee ')                // tuyển (pipe)
    .replace(/\[\]/g, '\\square ')           // mâu thuẫn ([])
    .replace(/□/g, '\\square ')              // mâu thuẫn (ký tự Unicode)
    .replace(/\{/g, '\\{ ')
    .replace(/\}/g, '\\} ');

  // Bọc nội dung tiếng Việt bên trong ngoặc đơn vào \text{}
  latex = latex.replace(/\(([^)]+)\)/g, '\\text{($1)}');

  return latex;
};
