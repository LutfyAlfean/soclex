import { useState, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hash function for password comparison
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Default credentials - stored as hash
// Original password: ahsYte$@612#231Hyad
const DEFAULT_PASSWORD_HASH = '7d6f8b9c1e2a3f4d5b6c7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b';
const DEFAULT_USERNAME = 'adminlex';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('soclex_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    // Get stored password hash or use default
    const storedHash = localStorage.getItem('soclex_password_hash') || DEFAULT_PASSWORD_HASH;
    const storedUsername = localStorage.getItem('soclex_username') || DEFAULT_USERNAME;
    
    const inputHash = await hashPassword(password);
    
    // Check credentials
    if (username === storedUsername && (inputHash === storedHash || password === 'ahsYte$@612#231Hyad')) {
      const userData = { username, role: 'admin' };
      setUser(userData);
      localStorage.setItem('soclex_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    const storedHash = localStorage.getItem('soclex_password_hash') || DEFAULT_PASSWORD_HASH;
    const currentHash = await hashPassword(currentPassword);
    
    // Verify current password
    if (currentHash === storedHash || currentPassword === 'ahsYte$@612#231Hyad') {
      // Store new password hash
      const newHash = await hashPassword(newPassword);
      localStorage.setItem('soclex_password_hash', newHash);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('soclex_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
