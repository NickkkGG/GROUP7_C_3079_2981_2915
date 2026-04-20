'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'guest' | 'user' | 'operator';

interface User {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string | null;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  loginAsGuest: () => void;
  loadUserFromStorage: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = () => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      const userRole = localStorage.getItem('userRole');

      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          const role = userRole || userData.role || 'user';

          setUser({
            id: userData.id,
            name: userData.fullname || userData.name || 'User',
            email: userData.email,
            role: role as UserRole,
          });
        } catch (error) {
          console.error('Error loading user from storage:', error);
        }
      }
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
    }
  };

  const loginAsGuest = () => {
    setUser({
      id: 'guest-001',
      name: 'Guest User',
      email: 'guest@altus.local',
      role: 'guest',
    });
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loginAsGuest, loadUserFromStorage, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
