/**
 * config.ts – Wrapper lấy giá trị cấu hình môi trường.
 * Tách riêng để dễ mock trong test (vi.mock('./utils/config')).
 */
export const getApiKey = (): string => {
  return process.env.GEMINI_API_KEY ?? '';
};
