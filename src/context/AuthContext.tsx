import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Usuario } from '@/types';
import { MOCK_USUARIOS } from '@/constants/mockData';

interface UsuarioConPassword extends Usuario {
  password: string;
}

interface AuthContextValue {
  user: Usuario | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (nombre: string, email: string, password: string, rol: 'estudiante' | 'particular') => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<UsuarioConPassword[]>([]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // TODO: Reemplazar con llamada real a la API cuando el backend esté listo
    const mockFound = MOCK_USUARIOS.find(u => u.email === email);
    if (mockFound && password === '1234') {
      setUser(mockFound);
      return true;
    }
    const regFound = registeredUsers.find(u => u.email === email && u.password === password);
    if (regFound) {
      const { password: _, ...userData } = regFound;
      setUser(userData);
      return true;
    }
    return false;
  };

  const register = async (
    nombre: string,
    email: string,
    password: string,
    rol: 'estudiante' | 'particular',
  ): Promise<{ ok: boolean; error?: string }> => {
    // TODO: Reemplazar con llamada real a la API cuando el backend esté listo
    const allEmails = [
      ...MOCK_USUARIOS.map(u => u.email),
      ...registeredUsers.map(u => u.email),
    ];
    if (allEmails.includes(email)) {
      return { ok: false, error: 'Este correo ya está registrado.' };
    }
    const newUser: UsuarioConPassword = {
      id: Date.now(),
      nombre,
      email,
      rol,
      password,
    };
    setRegisteredUsers(prev => [...prev, newUser]);
    const { password: _, ...userData } = newUser;
    setUser(userData);
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    // TODO: api.post('/auth/logout')
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
