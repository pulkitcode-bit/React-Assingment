'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginCredentials } from '@/types';
import { loginUser as loginApi } from '@/lib/api/auth';
import { saveAuthSession, clearAuthSession, getStoredAuthToken, USER_DATA_KEY } from '@/lib/auth-cookies';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Hydrate auth state from cookies / localStorage on client mount
  useEffect(() => {
    try {
      const storedToken = getStoredAuthToken();
      const storedUserData = localStorage.getItem(USER_DATA_KEY);

      if (storedToken && storedUserData) {
        setToken(storedToken);
        setUser(JSON.parse(storedUserData));
      }
    } catch {
      clearAuthSession();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await loginApi(credentials);
      // DummyJSON returns 'accessToken' or 'token'
      const authToken = response.accessToken || response.token;
      
      const userData: User = {
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        gender: response.gender,
        image: response.image,
      };

      saveAuthSession(authToken, userData);
      setToken(authToken);
      setUser(userData);
      router.push('/products');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
