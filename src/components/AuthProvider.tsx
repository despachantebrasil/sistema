import React, { useState, createContext, useContext } from 'react';
import type { Role } from '../types';

interface AuthContextType {
  session: { user: { id: string, email: string } } | null;
  isLoading: boolean;
  userRole: Role;
  userAvatarUrl: string | null;
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
  const [session, setSession] = useState<AuthContextType['session']>(defaultUser as any);
  const isLoading = false; // Mantido como constante, pois não há carregamento real
  
  // No modo mockado, o usuário está sempre logado como Admin
  const userRole: Role = defaultUser.role;
  const userAvatarUrl: string | null = defaultUser.avatarUrl;

  const logout = () => {
    // Simula o logout limpando a sessão (embora o App.tsx precise ser ajustado para não depender disso)
    setSession(null);
    alert('Logout simulado. Recarregue a página para reentrar no modo de demonstração.');
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, userRole, userAvatarUrl, logout }}>
      {children}
    </AuthContext.Provider>
  );
};