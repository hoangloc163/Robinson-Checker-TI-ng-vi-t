/**
 * App.integration.test.tsx – Integration Tests cho Robinson Auto-Checker
 * TC016 – TC058  |  43 test cases
 *
 * ── QUAN TRỌNG – Thứ tự hoạt động của vi.mock() ──────────────────────────────
 *
 * Vitest hoists (đưa lên đầu) tất cả vi.mock() trong TEST FILE trước khi
 * import bất kỳ module nào. Vì vậy, các mock cho phụ thuộc của App.tsx
 * (katex, motion, react-katex) PHẢI đặt ở ĐÂY, không chỉ trong setup.tsx.
 *
 * Thứ tự thực thi Vitest:
 *   1. vi.mock() trong test file được hoisted (chạy trước cả import)
 *   2. setupFiles (setup.tsx) chạy
 *   3. Imports trong test file được resolve (App.tsx được load)
 *   4. Các describe/it blocks chạy
 *
 * Nếu thiếu các mock này → App.tsx import katex CSS / motion / react-katex
 * thật → jsdom crash → TẤT CẢ 43 test fail tại 0ms.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock 1: CSS – katex CSS không hỗ trợ trong jsdom ────────────────────────
vi.mock('katex/dist/katex.min.css', () => ({}));

// ─── Mock 2: motion/react – bỏ qua animation, render children trực tiếp ──────
vi.mock('motion/react', () => ({
  motion: new Proxy({} as Record<string, unknown>, {
    get: (_target, tag: string) =>
      ({ children, ...rest }: React.PropsWithChildren<Record<string, unknown>>) =>
        // FIX: dùng React.ElementType thay vì keyof JSX.IntrinsicElements
        // (JSX namespace không có trong tsconfig khi không import React types đúng cách)
        React.createElement(tag as React.ElementType, rest, children),
  }),
  AnimatePresence: ({ children }: React.PropsWithChildren) =>
    React.createElement(React.Fragment, null, children),
}));

// ─── Mock 3: react-katex – render span thay vì KaTeX thật ────────────────────
vi.mock('react-katex', () => ({
  InlineMath: ({ math }: { math: string }) =>
    React.createElement('span', { 'data-testid': 'inline-math', 'data-math': math }, math),
  BlockMath: ({ math }: { math: string }) =>
    React.createElement('div', { 'data-testid': 'block-math', 'data-math': math }, math),
}));

// ─── Mock 4: @google/genai – không gọi API thật ──────────────────────────────
const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
}));

// ─── Mock 5: src/utils/config – kiểm soát GEMINI_API_KEY trong test ──────────
vi.mock('../utils/config', () => ({
  getApiKey: vi.fn().mockReturnValue('test-api-key-12345'),
}));

// ─── Imports sau khi mock đã được hoisted ─────────────────────────────────────
import App from '../App';
import { getApiKey } from '../utils/config';
import { GoogleGenAI } from '@google/genai';

// ─── Restore mocks trước mỗi test ─────────────────────────────────────────────
beforeEach(() => {
  vi.mocked(getApiKey).mockReturnValue('test-api-key-12345');
  // FIX: dùng "as any" để bypass type check của Models interface
  // (mock chỉ cần subset {models.generateContent} để test hoạt động)
  vi.mocked(GoogleGenAI).mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  }) as any);
});

// ─── Payload helper ───────────────────────────────────────────────────────────
const makeSuccessPayload = (
  is_proved = true,
  steps = [
    { step_number: 1, formula: 'p => q', derivation: 'Cho trước' },
    { step_number: 2, formula: 'p',       derivation: 'Cho trước' },
    { step_number: 3, formula: '~q',      derivation: 'Phủ định kết luận' },
    { step_number: 4, formula: 'q',       derivation: '1, 2' },
    { step_number: 5, formula: '[]',      derivation: '3, 4' },
  ]
) => ({ text: JSON.stringify({ status: 'success', is_proved, steps }) });

// ─── DOM selector helpers ─────────────────────────────────────────────────────
const getPremisesTextarea = () =>
  screen.getByPlaceholderText(/P & Q -> R/i) as HTMLTextAreaElement;

const getConclusionInput = () =>
  screen.getByPlaceholderText(/~\(P & Q\)/i) as HTMLInputElement;

/**
 * hasText – custom text matcher.
 * Dùng cho text bị tách qua nhiều phần tử DOM
 * (ví dụ: badge chứa SVG icon + text node trong cùng div).
 */
const hasText = (pattern: string | RegExp) =>
  (content: string, _el: Element | null): boolean =>
    !!(content.match(pattern));

/**
 * setReactInputValue – React 19 compatible input setter.
 * Dùng fireEvent.change với target.value thay vì userEvent.type()
 * để tránh lỗi với ký tự đặc biệt (=>, <->, ~, v, |) và
 * tránh lỗi "element cannot be focused" của userEvent.clear().
 */
function setReactInputValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string
) {
  fireEvent.change(element, { target: { value } });
}

// ─── Navigation helpers ───────────────────────────────────────────────────────
async function goToDashboard() {
  await userEvent.click(screen.getAllByRole('button', { name: /^Bắt đầu$/ })[0]);
}

async function goToResources() {
  await userEvent.click(screen.getByRole('button', { name: /^Tài nguyên$/ }));
}

/**
 * fillAndSubmit – điền form và click kiểm tra.
 * setReactInputValue dùng fireEvent (RTL tự wrap trong act)
 * → React state được flush đồng bộ trước khi click submit.
 */
async function fillAndSubmit(premises: string, conclusion: string) {
  setReactInputValue(getPremisesTextarea(), premises);
  setReactInputValue(getConclusionInput(), conclusion);
  await userEvent.click(screen.getByRole('button', { name: /Chuẩn hóa & Kiểm tra/i }));
}

// ─────────────────────────────────────────────────────────────────────────────
// NHÓM 2 – Landing Page [TC016–TC019]
// ─────────────────────────────────────────────────────────────────────────────
describe('Nhóm 2 – Landing Page: Giao diện trang chủ', () => {

  it('TC016 – Hiển thị tiêu đề "Robinson Auto-Checker" khi load lần đầu', () => {
    render(<App />);
    expect(screen.getByText('Robinson Auto-Checker')).toBeInTheDocument();
  });

  it('TC017 – Hiển thị nút "Nhập công thức logic" trên landing', () => {
    render(<App />);
    expect(
      screen.getByRole('button', { name: /Nhập công thức logic/i })
    ).toBeInTheDocument();
  });

  it('TC018 – Hiển thị lộ trình 4 giai đoạn phát triển', () => {
    render(<App />);
    expect(screen.getByText('Core Logic')).toBeInTheDocument();
    expect(screen.getByText('Frontend & Limit')).toBeInTheDocument();
    expect(screen.getByText('OCR & Vị từ')).toBeInTheDocument();
    expect(screen.getByText('LMS & Community')).toBeInTheDocument();
  });

  it('TC019 – Hiển thị "Lượt còn lại: 20/20" khi chưa có dữ liệu localStorage', () => {
    render(<App />);
    expect(screen.getByText(hasText(/Lượt còn lại: 20\/20/))).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NHÓM 3 – Navigation [TC020–TC024]
// ─────────────────────────────────────────────────────────────────────────────
describe('Nhóm 3 – Navigation: Điều hướng giữa các view', () => {

  it('TC020 – Click "Bắt đầu" chuyển sang Dashboard view', async () => {
    render(<App />);
    await goToDashboard();
    expect(screen.getByText('Nhập dữ liệu')).toBeInTheDocument();
  });

  it('TC021 – Click "Dashboard" trên nav chuyển sang dashboard', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /^Dashboard$/ }));
    expect(screen.getByText('Nhập dữ liệu')).toBeInTheDocument();
  });

  it('TC022 – Click "Tài nguyên" chuyển sang resources view', async () => {
    render(<App />);
    await goToResources();
    expect(
      screen.getByRole('heading', { name: /Tài nguyên học tập/i })
    ).toBeInTheDocument();
  });

  it('TC023 – Click logo "Robinson Auto-Checker" trở về landing', async () => {
    render(<App />);
    await goToDashboard();
    await userEvent.click(screen.getByText('Robinson Auto-Checker'));
    expect(screen.getByText(/Tự động hóa/i)).toBeInTheDocument();
  });

  it('TC024 – Click "Nhập công thức logic" từ landing chuyển sang dashboard', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /Nhập công thức logic/i }));
    expect(screen.getByText('Nhập dữ liệu')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NHÓM 4 – Dashboard Form Input [TC025–TC029]
// ─────────────────────────────────────────────────────────────────────────────
describe('Nhóm 4 – Dashboard: Form Input & Tương tác nhập liệu', () => {

  beforeEach(async () => {
    render(<App />);
    await goToDashboard();
  });

  it('TC025 – Hiển thị textarea tiền đề và input kết luận', () => {
    expect(getPremisesTextarea()).toBeInTheDocument();
    expect(getConclusionInput()).toBeInTheDocument();
  });

  it('TC026 – Có thể nhập văn bản vào ô tiền đề', () => {
    const textarea = getPremisesTextarea();
    setReactInputValue(textarea, 'p => q');
    expect(textarea.value).toBe('p => q');
  });

  it('TC027 – Có thể nhập văn bản vào ô kết luận', () => {
    const input = getConclusionInput();
    setReactInputValue(input, 'q');
    expect(input.value).toBe('q');
  });

  it('TC028 – Nút "Làm mới" (RotateCcw) xóa trắng toàn bộ form', async () => {
    setReactInputValue(getPremisesTextarea(), 'p => q');
    setReactInputValue(getConclusionInput(), 'q');

    await userEvent.click(screen.getByTitle('Làm mới'));

    // Submit form trống → validation error → chứng minh form đã bị xóa
    await userEvent.click(screen.getByRole('button', { name: /Chuẩn hóa & Kiểm tra/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/Vui lòng nhập đầy đủ tiền đề và kết luận/i)
      ).toBeInTheDocument();
    });
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('TC029 – Tab "Mệnh đề" và "Vị từ" có thể toggle qua lại', async () => {
    // Trạng thái ban đầu: Mệnh đề active
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Mệnh đề$/ }).className)
        .toContain('text-indigo-600');
      expect(screen.getByRole('button', { name: /^Vị từ$/ }).className)
        .toContain('text-slate-500');
    });

    // Click "Vị từ" → nó active
    await userEvent.click(screen.getByRole('button', { name: /^Vị từ$/ }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Vị từ$/ }).className)
        .toContain('text-indigo-600');
      expect(screen.getByRole('button', { name: /^Mệnh đề$/ }).className)
        .toContain('text-slate-500');
    });

    // Click "Mệnh đề" → nó active lại
    await userEvent.click(screen.getByRole('button', { name: /^Mệnh đề$/ }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Mệnh đề$/ }).className)
        .toContain('text-indigo-600');
      expect(screen.getByRole('button', { name: /^Vị từ$/ }).className)
        .toContain('text-slate-500');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NHÓM 5 – Validation [TC030–TC033]
// ─────────────────────────────────────────────────────────────────────────────
describe('Nhóm 5 – Validation: Kiểm tra dữ liệu đầu vào', () => {

  beforeEach(async () => {
    render(<App />);
    await goToDashboard();
  });

  it('TC030 – Hiển thị lỗi khi submit form trống hoàn toàn', async () => {
    await userEvent.click(screen.getByRole('button', { name: /Chuẩn hóa & Kiểm tra/i }));
    expect(
      screen.getByText(/Vui lòng nhập đầy đủ tiền đề và kết luận/i)
    ).toBeInTheDocument();
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('TC031 – Hiển thị lỗi khi chỉ nhập tiền đề, bỏ trống kết luận', async () => {
    setReactInputValue(getPremisesTextarea(), 'p => q');
    await userEvent.click(screen.getByRole('button', { name: /Chuẩn hóa & Kiểm tra/i }));
    expect(
      screen.getByText(/Vui lòng nhập đầy đủ tiền đề và kết luận/i)
    ).toBeInTheDocument();
  });

  it('TC032 – Hiển thị lỗi khi chỉ nhập kết luận, bỏ trống tiền đề', async () => {
    setReactInputValue(getConclusionInput(), 'q');
    await userEvent.click(screen.getByRole('button', { name: /Chuẩn hóa & Kiểm tra/i }));
    expect(
      screen.getByText(/Vui lòng nhập đầy đủ tiền đề và kết luận/i)
    ).toBeInTheDocument();
  });

  it('TC033 – Thông báo lỗi validation bị xóa khi click "Làm mới"', async () => {
    await userEvent.click(screen.getByRole('button', { name: /Chuẩn hóa & Kiểm tra/i }));
    expect(screen.getByText(/Vui lòng nhập đầy đủ/i)).toBeInTheDocument();
    await userEvent.click(screen.getByTitle('Làm mới'));
    expect(screen.queryByText(/Vui lòng nhập đầy đủ/i)).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NHÓM 6 – Usage Limit [TC034–TC036]
// ─────────────────────────────────────────────────────────────────────────────
describe('Nhóm 6 – Usage Limit: Giới hạn lượt sử dụng', () => {

  it('TC034 – Hiển thị lỗi "hết lượt" khi usageCount = 0', async () => {
    localStorage.setItem('robinson_usage_count', '0');
    render(<App />);
    await goToDashboard();
    await fillAndSubmit('p => q', 'q');
    expect(
      screen.getByText(/Bạn đã hết lượt dùng trong ngày/i)
    ).toBeInTheDocument();
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('TC035 – Đọc và hiển thị usageCount từ localStorage khi khởi động', () => {
    localStorage.setItem('robinson_usage_count', '5');
    render(<App />);
    expect(screen.getByText(hasText(/Lượt còn lại: 5\/20/))).toBeInTheDocument();
  });

  it('TC036 – Giảm usageCount đúng 1 đơn vị sau mỗi lần kiểm tra thành công', async () => {
    mockGenerateContent.mockResolvedValueOnce(makeSuccessPayload());
    render(<App />);
    await goToDashboard();
    await fillAndSubmit('p => q\np', 'q');
    await waitFor(() => {
      expect(screen.getByText(hasText(/Lượt còn lại: 19\/20/))).toBeInTheDocument();
    });
    expect(localStorage.getItem('robinson_usage_count')).toBe('19');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NHÓM 7 – API Key Configuration [TC037]
// ─────────────────────────────────────────────────────────────────────────────
describe('Nhóm 7 – API Key Configuration: Cấu hình GEMINI_API_KEY', () => {

  it('TC037 – Hiển thị lỗi cấu hình khi GEMINI_API_KEY trống', async () => {
    vi.mocked(getApiKey).mockReturnValueOnce('');
    render(<App />);
    await goToDashboard();
    await fillAndSubmit('p => q', 'q');
    await waitFor(() => {
      expect(screen.getByText(/Lỗi cấu hình/i)).toBeInTheDocument();
    });
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NHÓM 8 – handleCheck: Luồng kiểm tra thành công [TC038–TC043]
// ─────────────────────────────────────────────────────────────────────────────
describe('Nhóm 8 – handleCheck: Luồng kiểm tra logic thành công', () => {

  it('TC038 – Hiển thị trạng thái "Đang xử lý..." trong khi gọi API', async () => {
    // Dùng deferred promise để kiểm soát timing, tránh timer leak giữa các test
    let resolveApi!: (v: { text: string }) => void;
    const pendingApi = new Promise<{ text: string }>(
      (resolve) => { resolveApi = resolve; }
    );
    mockGenerateContent.mockReturnValueOnce(pendingApi);

    render(<App />);
    await goToDashboard();
    setReactInputValue(getPremisesTextarea(), 'p => q');
    setReactInputValue(getConclusionInput(), 'q');

    // fireEvent.click để không block (API đang pending)
    fireEvent.click(screen.getByRole('button', { name: /Chuẩn hóa & Kiểm tra/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Đang xử lý\.\.\./i })
      ).toBeDisabled();
    });

    // Giải phóng promise → không leak sang test sau
    resolveApi(makeSuccessPayload());
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Chuẩn hóa & Kiểm tra/i })
      ).not.toBeDisabled();
    });
  });

  it('TC039 – Hiển thị "Lập luận ĐÚNG" khi is_proved = true', async () => {
    mockGenerateContent.mockResolvedValueOnce(makeSuccessPayload(true));
    render(<App />);
    await goToDashboard();
    await fillAndSubmit('p => q\np', 'q');
    await waitFor(() => {
      expect(screen.getByText(hasText(/Lập luận ĐÚNG/))).toBeInTheDocument();
    });
  });

  it('TC040 – Hiển thị "Lập luận SAI" khi is_proved = false', async () => {
    mockGenerateContent.mockResolvedValueOnce(makeSuccessPayload(false, [
      { step_number: 1, formula: 'P v Q', derivation: 'Cho trước' },
      { step_number: 2, formula: '~P',    derivation: 'Cho trước' },
      { step_number: 3, formula: '~P',    derivation: 'Phủ định kết luận' },
    ]));
    render(<App />);
    await goToDashboard();
    await fillAndSubmit('P v Q\n~P', 'P');
    await waitFor(() => {
      expect(screen.getByText(hasText(/Lập luận SAI/))).toBeInTheDocument();
    });
  });

  it('TC041 – Bảng hợp giải hiển thị đúng số hàng: 1 header + 6 data = 7', async () => {
    const sixSteps = Array.from({ length: 6 }, (_, i) => ({
      step_number: i + 1,
      formula: `S${i + 1}`,
      derivation: i === 0 ? 'Cho trước' : `${i}, ${i + 1}`,
    }));
    mockGenerateContent.mockResolvedValueOnce(makeSuccessPayload(true, sixSteps));
    render(<App />);
    await goToDashboard();
    await fillAndSubmit('p => q\np', 'q');
    await waitFor(() => {
      expect(screen.getAllByRole('row')).toHaveLength(7);
    });
  });

  it('TC042 – Hiển thị thông báo mâu thuẫn khi is_proved = true', async () => {
    mockGenerateContent.mockResolvedValueOnce(makeSuccessPayload(true));
    render(<App />);
    await goToDashboard();
    await fillAndSubmit('p => q\np', 'q');
    await waitFor(() => {
      expect(screen.getByText(/Tìm thấy mâu thuẫn/i)).toBeInTheDocument();
    });
  });

  it('TC043 – Click "Làm mới" sau khi có kết quả xóa sạch kết quả cũ', async () => {
    mockGenerateContent.mockResolvedValueOnce(makeSuccessPayload(true));
    render(<App />);
    await goToDashboard();
    await fillAndSubmit('p => q\np', 'q');
    await waitFor(() => {
      expect(screen.getByText(hasText(/Lập luận ĐÚNG/))).toBeInTheDocument();
    });
    await userEvent.click(screen.getByTitle('Làm mới'));
    expect(screen.queryByText(hasText(/Lập luận ĐÚNG/))).not.toBeInTheDocument();
    expect(screen.getByText(/Kết quả sẽ hiển thị tại đây/i)).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NHÓM 9 – handleCheck: Xử lý lỗi API [TC044–TC048]
// ─────────────────────────────────────────────────────────────────────────────
describe('Nhóm 9 – handleCheck: Xử lý lỗi API', () => {

  it('TC044 – Hiển thị thông báo lỗi khi Gemini API ném exception', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Network Error'));
    render(<App />);
    await goToDashboard();
    await fillAndSubmit('p => q\np', 'q');
    await waitFor(() => {
      expect(
        screen.getByText(/Đã xảy ra lỗi trong quá trình xử lý/i)
      ).toBeInTheDocument();
    });
  });

  it('TC045 – Hiển thị lỗi khi API trả về response.text là null/falsy', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: null });
    render(<App />);
    await goToDashboard();
    await fillAndSubmit('p => q\np', 'q');
    await waitFor(() => {
      expect(screen.getByText(/Đã xảy ra lỗi/i)).toBeInTheDocument();
    });
  });

  it('TC046 – Hiển thị lỗi khi API trả về JSON không hợp lệ', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: 'invalid json {{{' });
    render(<App />);
    await goToDashboard();
    await fillAndSubmit('p => q\np', 'q');
    await waitFor(() => {
      expect(screen.getByText(/Đã xảy ra lỗi/i)).toBeInTheDocument();
    });
  });

  it('TC047 – Nút "Chuẩn hóa & Kiểm tra" được enable lại sau khi có lỗi API', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('API failure'));
    render(<App />);
    await goToDashboard();
    await fillAndSubmit('p => q\np', 'q');
    await waitFor(() => {
      expect(screen.getByText(/Đã xảy ra lỗi/i)).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /Chuẩn hóa & Kiểm tra/i })
    ).not.toBeDisabled();
  });

  it('TC048 – usageCount KHÔNG giảm khi API thất bại', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Network Error'));
    render(<App />);
    await goToDashboard();
    await fillAndSubmit('p => q\np', 'q');
    await waitFor(() => {
      expect(screen.getByText(/Đã xảy ra lỗi/i)).toBeInTheDocument();
    });
    expect(screen.getByText(hasText(/Lượt còn lại: 20\/20/))).toBeInTheDocument();
    expect(localStorage.getItem('robinson_usage_count')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NHÓM 10 – Resources Page [TC049–TC053]
// ─────────────────────────────────────────────────────────────────────────────
describe('Nhóm 10 – Resources Page: Tài nguyên học tập', () => {

  it('TC049 – Hiển thị danh sách bài tập mẫu trên trang Resources', async () => {
    render(<App />);
    await goToResources();
    expect(screen.getByText(/Bài tập 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Bài tập 2/i)).toBeInTheDocument();
  });

  it('TC050 – Hiển thị ô tìm kiếm bài tập', async () => {
    render(<App />);
    await goToResources();
    expect(screen.getByPlaceholderText(/Tìm kiếm bài tập/i)).toBeInTheDocument();
  });

  it('TC051 – Click "Thử giải" nạp bài tập vào dashboard và chuyển view', async () => {
    render(<App />);
    await goToResources();
    await userEvent.click(screen.getAllByRole('button', { name: /Thử giải/i })[0]);
    expect(screen.getByText('Nhập dữ liệu')).toBeInTheDocument();
    expect(getPremisesTextarea().value).not.toBe('');
  });

  it('TC052 – Bài tập 1 nạp đúng tiền đề "p -> q" và kết luận "q"', async () => {
    render(<App />);
    await goToResources();
    await userEvent.click(screen.getAllByRole('button', { name: /Thử giải/i })[0]);
    expect(getPremisesTextarea().value).toContain('p -> q');
    expect(getConclusionInput().value).toBe('q');
  });

  it('TC053 – Hiển thị placeholder "Đang cập nhật thêm bài tập..." ở cuối danh sách', async () => {
    render(<App />);
    await goToResources();
    expect(screen.getByText(/Đang cập nhật thêm bài tập/i)).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NHÓM 11 – OCR Modal [TC054–TC057]
// ─────────────────────────────────────────────────────────────────────────────
describe('Nhóm 11 – OCR Modal: Tính năng tải ảnh bài làm', () => {

  it('TC054 – Mở OCR modal khi click "Tải/Chụp ảnh bài làm"', async () => {
    render(<App />);
    await userEvent.click(
      screen.getByRole('button', { name: /Tải\/Chụp ảnh bài làm/i })
    );
    expect(screen.getByText('Tải ảnh bài làm (OCR)')).toBeInTheDocument();
  });

  it('TC055 – Đóng OCR modal khi click nút "Hủy bỏ"', async () => {
    render(<App />);
    await userEvent.click(
      screen.getByRole('button', { name: /Tải\/Chụp ảnh bài làm/i })
    );
    await userEvent.click(screen.getByRole('button', { name: /Hủy bỏ/i }));
    expect(screen.queryByText('Tải ảnh bài làm (OCR)')).not.toBeInTheDocument();
  });

  it('TC056 – Nút "Phân tích & Kiểm tra" trong modal bị disabled (Phase 3)', async () => {
    render(<App />);
    await userEvent.click(
      screen.getByRole('button', { name: /Tải\/Chụp ảnh bài làm/i })
    );
    expect(
      screen.getByRole('button', { name: /Phân tích & Kiểm tra/i })
    ).toBeDisabled();
  });

  it('TC057 – Modal hiển thị thông báo OCR đang trong "Giai đoạn 3"', async () => {
    render(<App />);
    await userEvent.click(
      screen.getByRole('button', { name: /Tải\/Chụp ảnh bài làm/i })
    );
    expect(screen.getByText(/Giai đoạn 3/i)).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NHÓM 12 – Default Results State [TC058]
// ─────────────────────────────────────────────────────────────────────────────
describe('Nhóm 12 – Default Results State: Trạng thái mặc định kết quả', () => {

  it('TC058 – Hiển thị placeholder khi chưa có kết quả kiểm tra', async () => {
    render(<App />);
    await goToDashboard();
    expect(
      screen.getByText(/Kết quả sẽ hiển thị tại đây sau khi bạn nhấn/i)
    ).toBeInTheDocument();
  });
});
