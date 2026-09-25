// Cookie utilities for client-side authentication token management

export const AUTH_TOKEN_KEY = 'auth_token';
export const USER_DATA_KEY = 'user_data';

/**
 * Sets a cookie with a given name, value, and expiration days.
 */
export function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof window === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Gets a cookie value by name.
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const val = parts.pop()?.split(';').shift();
    return val ? decodeURIComponent(val) : null;
  }
  return null;
}

/**
 * Erases a cookie by name.
 */
export function eraseCookie(name: string): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; Max-Age=-99999999; path=/;`;
}

/**
 * Stores authentication session token & user info in cookies & localStorage.
 */
export function saveAuthSession(token: string, user: Record<string, unknown> | object): void {
  setCookie(AUTH_TOKEN_KEY, token, 7);
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  }
}

/**
 * Clears authentication session token & user info.
 */
export function clearAuthSession(): void {
  eraseCookie(AUTH_TOKEN_KEY);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  }
}

/**
 * Retrieves saved auth token from cookie or localStorage fallback.
 */
export function getStoredAuthToken(): string | null {
  return getCookie(AUTH_TOKEN_KEY) || (typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null);
}
