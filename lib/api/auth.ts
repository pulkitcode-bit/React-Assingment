import api from '../axios';
import { AuthResponse, LoginCredentials, User } from '@/types';

/**
 * Calls POST /auth/login with username and password.
 * Returns authentication token and user profile payload.
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  return response.data;
}

/**
 * Fetches current user profile from GET /auth/me
 */
export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>('/auth/me');
  return response.data;
}
