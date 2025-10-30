import React, { useState, useEffect, createContext, useContext } from 'react';
import type { Role } from '../types';

// Definindo um tipo de sessão simples para o modo mock
interface MockSession {
    user: { id: string, email: string };
}

interface AuthContextType {
  session: MockSession | null;
  isLoading: boolean;
  userRole: Role;
  userAvatarUrl: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const defaultMockUser = {
    id: 'mock-admin-id',
    email: 'admin@urtech.com',
    fullName: 'Admin Mock',
    role: 'Administrador' as Role,
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin+Mock&background=0D47A1&color=fff'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<MockSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{ role: Role, avatar_url: string | null } | null>(null);

  useEffect(() => {
    // Simula a verificação de sessão (pode ser baseado em localStorage se necessário)
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulação de login bem-sucedido com qualquer credencial
    if (email && password) {
        setSession({ user: { id: defaultMockUser.id, email: defaultMockUser.email } });
        setProfile({ role: defaultMockUser.role, avatar_url: defaultMockUser.avatarUrl });
        setIsLoading(false);
        return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setSession(null);
    setProfile(null);
  };

  const userRole: Role = profile?.role || 'Usuário';
  const userAvatarUrl: string | null = profile?.avatar_url || null;

  return (
    <AuthContext.Provider value={{ session, isLoading, userRole, userAvatarUrl, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};