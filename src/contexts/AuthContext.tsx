import { useState, createContext, useContext, ReactNode } from 'react';

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo credentials - In production, this would be handled by a backend
const VALID_CREDENTIALS = {
  username: 'adminlex',
  password: 'ahsYte$@612#231Hyad',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('soclex_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (username: string, password: string): boolean => {
    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
      const userData = { username, role: 'admin' };
      setUser(userData);
      localStorage.setItem('soclex_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('soclex_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
