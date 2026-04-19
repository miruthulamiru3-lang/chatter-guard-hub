import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { loginUser, registerUser, validateSecurityCode } from '@/services/userStore';

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

  const login = async (email: string, password: string) => {
    const user = loginUser(email, password);
    const token = `token_${user._id}_${Date.now()}`;
    setAuthState({ user, token, isAuthenticated: true });
  };

  const register = async (name: string, email: string, password: string, role: string, securityCode?: string) => {
    // Validate security code for admin/moderator
    if (role === 'admin' || role === 'moderator') {
      const validation = validateSecurityCode(role, securityCode || '');
      if (!validation.valid) throw new Error(validation.error);
    }

    const user = registerUser(name, email, password, role);
    const token = `token_${user._id}_${Date.now()}`;
    setAuthState({ user, token, isAuthenticated: true });
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
