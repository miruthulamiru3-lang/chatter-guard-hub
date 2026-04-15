import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { authApi } from '@/services/api';
import { connectSocket, disconnectSocket } from '@/services/socket';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  setDemoUser: (role: 'user' | 'admin' | 'moderator') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users kept as fallback when backend is unreachable
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

  // Persist auth state & manage socket connection
  useEffect(() => {
    if (authState.isAuthenticated && authState.token && authState.user) {
      localStorage.setItem('auth', JSON.stringify(authState));
      connectSocket(authState.token, authState.user._id);
    } else {
      localStorage.removeItem('auth');
      disconnectSocket();
    }
  }, [authState]);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await authApi.login(email, password);
      setAuthState({ user: data.user, token: data.token, isAuthenticated: true });
    } catch (err: any) {
      // Fallback to demo mode if backend unavailable
      if (!err.response) {
        console.warn('[auth] Backend unreachable — using demo mode');
        const role = email.includes('admin') ? 'admin' : email.includes('mod') ? 'moderator' : 'user';
        setAuthState({ user: demoUsers[role], token: 'demo-token', isAuthenticated: true });
        return;
      }
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    try {
      const { data } = await authApi.register(name, email, password, role);
      setAuthState({ user: data.user, token: data.token, isAuthenticated: true });
    } catch (err: any) {
      if (!err.response) {
        console.warn('[auth] Backend unreachable — using demo mode');
        const user: User = {
          _id: `user-${Date.now()}`, name, email, role: role as User['role'],
          avatar: '', status: 'online', lastSeen: new Date().toISOString(), lastActive: new Date().toISOString(),
          riskScore: 0, isBlocked: false, createdAt: new Date().toISOString(),
        };
        setAuthState({ user, token: 'demo-token', isAuthenticated: true });
        return;
      }
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
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
