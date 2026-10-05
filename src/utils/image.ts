/**
 * Utility xử lý đường dẫn ảnh Facepack cho Players và Staff
 * Tự động gắn tiền tố môi trường (VITE_FACEPACK_BASE_URL) từ Frontend
 */
export function getFacepackUrl(path?: string | null): string {
  if (!path || typeof path !== 'string') return '';
  const trimmed = path.trim();
  if (!trimmed) return '';

  // Nếu đã là link tuyệt đối (http, https, blob, data URI) -> giữ nguyên
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Lấy baseUrl từ biến môi trường
  const baseUrl = (import.meta.env.VITE_FACEPACK_BASE_URL || '').replace(/\/+$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : '/' + trimmed;

  return baseUrl ? `${baseUrl}${cleanPath}` : cleanPath;
}
