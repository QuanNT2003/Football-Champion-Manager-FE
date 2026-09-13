export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export function getHeaders(): HeadersInit {
  const token = localStorage.getItem('fc_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function request<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options?.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw { response: { status: res.status, data } };
  }
  return data && typeof data === 'object' && 'data' in data ? data.data : data;
}
