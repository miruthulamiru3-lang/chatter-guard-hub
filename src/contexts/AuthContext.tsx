import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  setDemoUser: (role: 'user' | 'admin' | 'moderator') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const demoUsers: Record<string, User> = {
  admin: {
    _id: 'admin-001', name: 'Admin User', email: 'admin@example.com', role: 'admin',
    avatar: '', status: 'online', lastSeen: new Date().toISOString(), lastActive: new Date().toISOString(),
    riskScore: 0, isBlocked: false, createdAt: new Date().toISOString(),
  },
  moderator: {
    _id: 'mod-001', name: 'Mod User', email: 'mod@example.com', role: 'moderator',
    avatar: '', status: 'online', lastSeen: new Date().toISOString(), lastActive: new Date().toISOString(),
    riskScore: 0, isBlocked: false, createdAt: new Date().toISOString(),
  },
  user: {
    _id: 'user-001', name: 'John Doe', email: 'john@example.com', role: 'user',
    avatar: '', status: 'online', lastSeen: new Date().toISOString(), lastActive: new Date().toISOString(),
    riskScore: 0, isBlocked: false, createdAt: new Date().toISOString(),
  },
};

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

  const login = async (email: string, _password: string) => {
    const role = email.includes('admin') ? 'admin' : email.includes('mod') ? 'moderator' : 'user';
    setAuthState({ user: demoUsers[role], token: 'demo-token', isAuthenticated: true });
  };

  const register = async (name: string, email: string, _password: string, role: string) => {
    const user: User = {
      _id: `user-${Date.now()}`, name, email, role: role as User['role'],
      avatar: '', status: 'online', lastSeen: new Date().toISOString(), lastActive: new Date().toISOString(),
      riskScore: 0, isBlocked: false, createdAt: new Date().toISOString(),
    };
    setAuthState({ user, token: 'demo-token', isAuthenticated: true });
  };

  const logout = () => setAuthState({ user: null, token: null, isAuthenticated: false });

  const setDemoUser = (role: 'user' | 'admin' | 'moderator') => {
    setAuthState({ user: demoUsers[role], token: 'demo-token', isAuthenticated: true });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout, setDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
