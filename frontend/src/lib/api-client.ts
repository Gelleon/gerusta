import axios, { isAxiosError, type AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth-store';

const API_URL = '/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

function resolveDirectApiBaseUrl(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, '');
  }
  const isLocalHost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
  if (isLocalHost) {
    return 'http://127.0.0.1:3001';
  }
  return null;
}

export async function postWithDirectApiFallback<TResponse>(
  path: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<TResponse> {
  const requestTimeout =
    typeof config?.timeout === 'number' && config.timeout > 0
      ? config.timeout
      : 180000;
  try {
    const response = await apiClient.post<TResponse>(path, data, {
      ...config,
      timeout: requestTimeout,
    });
    return response.data;
  } catch (error: unknown) {
    if (!isAxiosError(error)) {
      throw error;
    }
    const shouldRetryDirect =
      error.response?.status === 500 ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT';
    if (!shouldRetryDirect) {
      throw error;
    }
    const directApiBaseUrl = resolveDirectApiBaseUrl();
    if (!directApiBaseUrl) {
      throw error;
    }
    const token = useAuthStore.getState().token;
    const headers = {
      'Content-Type': 'application/json',
      ...(config?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const response = await axios.post<TResponse>(
      `${directApiBaseUrl}${path}`,
      data,
      {
        ...config,
        headers,
        timeout: requestTimeout,
      },
    );
    return response.data;
  }
}
