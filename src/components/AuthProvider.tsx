import React, { useState, createContext, useContext } from 'react';
import type { Role } from '../types';

interface AuthContextType {
  session: { user: { id: string, email: string } } | null;
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

const defaultUser = {
    id: 'mock-admin-id',
    email: 'admin@urtech.com',
    fullName: 'Admin Mock',
    role: 'Administrador' as Role,
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin+Mock&background=0D47A1&color=fff'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicializa a sessão como null para forçar a tela de login
  const [session, setSession] = useState<AuthContextType['session']>(null);
  const isLoading = false;
  
  // Estado derivado (será atualizado após o login)
  const userRole: Role = session ? defaultUser.role : 'Usuário';
  const userAvatarUrl: string | null = session ? defaultUser.avatarUrl : null;

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulação de autenticação: aceita qualquer credencial para fins de demonstração
    if (email && password) {
        // Simula um pequeno atraso de rede
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Define a sessão mockada
        setSession(defaultUser as any);
        return true;
    }
    return false;
  };

  const logout = () => {
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, userRole, userAvatarUrl, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};