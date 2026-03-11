import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Usuario } from '@/types';
import { MOCK_USUARIOS } from '@/constants/mockData';

interface AuthContextValue {
  user: Usuario | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // TODO: Reemplazar con llamada real a la API cuando el backend esté listo
    // const response = await api.post('/auth/login', { email, password });
    const found = MOCK_USUARIOS.find(u => u.email === email);
    if (found && password === '1234') {
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    // TODO: api.post('/auth/logout')
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
