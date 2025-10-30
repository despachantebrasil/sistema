import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { Role } from '../types';

interface AuthContextType {
  session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'] | { user: { id: string, email: string } } | null;
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

// Verifica se as chaves do Supabase estão configuradas
const SUPABASE_CONFIGURED = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY && 
                            import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

const defaultMockUser = {
    id: 'mock-admin-id',
    email: 'admin@urtech.com',
    fullName: 'Admin Mock',
    role: 'Administrador' as Role,
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin+Mock&background=0D47A1&color=fff'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthContextType['session']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{ role: Role, avatar_url: string | null } | null>(null);
  
  // Corrigido: isMocked é calculado uma vez
  const isMocked = !SUPABASE_CONFIGURED;

  useEffect(() => {
    if (isMocked) {
        // Modo Mock: Simula carregamento rápido e inicia sem sessão
        setIsLoading(false);
        return;
    }

    // Modo Supabase Real
    const initializeSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await fetchProfile(session.user.id);
      }
      setIsLoading(false);
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isMocked]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, avatar_url')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } else {
      setProfile(data as { role: Role, avatar_url: string | null });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (isMocked) {
        // Login Mockado
        if (email && password) {
            await new Promise(resolve => setTimeout(resolve, 500));
            setSession(defaultMockUser as any);
            setProfile({ role: defaultMockUser.role, avatar_url: defaultMockUser.avatarUrl });
            return true;
        }
        return false;
    }
    
    // Login Supabase Real
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    return !error;
  };

  const logout = async () => {
    if (isMocked) {
        setSession(null);
        setProfile(null);
    } else {
        await supabase.auth.signOut();
    }
  };

  const userRole: Role = profile?.role || 'Usuário';
  const userAvatarUrl: string | null = profile?.avatar_url || null;

  return (
    <AuthContext.Provider value={{ session, isLoading, userRole, userAvatarUrl, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};