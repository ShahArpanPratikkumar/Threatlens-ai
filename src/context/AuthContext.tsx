import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  quickDemoLogin: () => Promise<void>;
  logout: () => void;
  updateUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('threatlens_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem('threatlens_user');
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('threatlens_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function verifySession() {
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
          localStorage.setItem('threatlens_user', JSON.stringify(res.user));
        } catch {
          // Token expired or invalid
          logout();
        }
      }
      setIsLoading(false);
    }
    verifySession();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('threatlens_token', res.token);
    localStorage.setItem('threatlens_user', JSON.stringify(res.user));
    showToast(`Welcome back, ${res.user.name}`, 'success');
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.register(name, email, password);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('threatlens_token', res.token);
    localStorage.setItem('threatlens_user', JSON.stringify(res.user));
    showToast(`Account created successfully!`, 'success');
  };

  const quickDemoLogin = async () => {
    await login('analyst@threatlens.ai', 'password123');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('threatlens_token');
    localStorage.removeItem('threatlens_user');
    showToast('Signed out successfully', 'info');
  };

  const updateUser = (updated: UserProfile) => {
    setUser(updated);
    localStorage.setItem('threatlens_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        quickDemoLogin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
