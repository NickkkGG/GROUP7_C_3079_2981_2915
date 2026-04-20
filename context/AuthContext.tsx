'use client';

import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'guest' | 'operator' | 'admin';

interface User {
  id: string;
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
  loginAsOperator: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const logout = () => setUser(null);

  const loginAsGuest = () => {
    setUser({
      id: 'guest-001',
      name: 'Guest User',
      email: 'guest@altus.local',
      role: 'guest',
    });
  };

  const loginAsOperator = () => {
    setUser({
      id: 'op-001',
      name: 'John Operator',
      email: 'operator@altus.local',
      role: 'operator',
    });
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loginAsGuest, loginAsOperator }}>
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
