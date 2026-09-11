import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { api, getAuthToken, setAuthToken, clearAuthToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, confirmPassword?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAuth() {
      const storedToken = getAuthToken();
      if (storedToken) {
        try {
          const res = await api.me();
          setUser(res.user);
        } catch {
          clearAuthToken();
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api.login({ username, password });
    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (username: string, password: string, confirmPassword?: string) => {
    const res = await api.register({ username, password, confirmPassword });
    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.me();
      setUser(res.user);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
