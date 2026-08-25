'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export interface User {
  id: number;
  nome: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedToken = Cookies.get('token');
    const savedUser = Cookies.get('user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error);
        Cookies.remove('token');
        Cookies.remove('user');
      }
    }
  }, []);

  const login = (jwtToken: string, userData: User) => {
    Cookies.set('token', jwtToken, { expires: 1 });
    Cookies.set('user', JSON.stringify(userData), { expires: 1 });

    setToken(jwtToken);
    setUser(userData);

    router.push('/dashboard');
  };

  const logout = () => {

    Cookies.remove('token');
    Cookies.remove('user');

    setToken(null);
    setUser(null);

    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);