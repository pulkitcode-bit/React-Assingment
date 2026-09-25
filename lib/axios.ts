import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getStoredAuthToken, clearAuthSession } from './auth-cookies';

/**
 * Shared Axios Instance for DummyJSON API.
 * Centralized request/response interceptors attach auth header & handle 401 redirects.
 */
const api = axios.create({
  baseURL: 'https://dummyjson.com',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Request Interceptor:
 * Attaches the auth token retrieved from cookies/localStorage to every outgoing request.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * Handles centralized errors. On 401 Unauthorized responses (token expired/invalid),
 * it clears session storage and forces client navigation to /login.
 * Formats all other errors into normalized error messages.
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    // If request was canceled by AbortController, preserve CanceledError
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED' || error.name === 'CanceledError' || error.message === 'canceled') {
      const cancelError = new Error('Canceled');
      cancelError.name = 'CanceledError';
      (cancelError as unknown as { isCancel: boolean }).isCancel = true;
      return Promise.reject(cancelError);
    }

    if (error.response?.status === 401) {
      // Clear invalid session
      clearAuthSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=1';
      }
    }

    // Normalize error object message for easy UI reporting
    const normalizedErrorMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network or server error occurred. Please try again.';

    const normalizedError = new Error(normalizedErrorMessage);
    (normalizedError as unknown as { status?: number }).status = error.response?.status;
    (normalizedError as unknown as { originalError?: AxiosError }).originalError = error;

    return Promise.reject(normalizedError);
  }
);

export default api;
