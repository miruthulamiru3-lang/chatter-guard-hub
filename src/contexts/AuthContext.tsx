import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { authApi } from '@/services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string, securityCode?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try { return JSON.parse(stored); } catch { return { user: null, token: null, isAuthenticated: false }; }
    }
    return { user: null, token: null, isAuthenticated: false };
  });

  useEffect(() => {
    if (authState.isAuthenticated) localStorage.setItem('auth', JSON.stringify(authState));
    else localStorage.removeItem('auth');
  }, [authState]);

  const extractError = (err: any) =>
    err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Request failed';

  const login = async (email: string, password: string) => {
    try {
      const { data } = await authApi.login(email, password);
      setAuthState({ user: data.user, token: data.token, isAuthenticated: true });
    } catch (err: any) {
      throw new Error(extractError(err));
    }
  };

  const register = async (name: string, email: string, password: string, role: string, securityCode?: string) => {
    try {
      // Backend validates the security code for admin/moderator
      const { data } = await authApi.register(name, email, password, role, securityCode);
      setAuthState({ user: data.user, token: data.token, isAuthenticated: true });
    } catch (err: any) {
      throw new Error(extractError(err));
    }
  };

  const logout = () => setAuthState({ user: null, token: null, isAuthenticated: false });

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
