import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { Role } from '../types';

interface AuthContextType {
  session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'];
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthContextType['session']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{ role: Role, avatar_url: string | null } | null>(null);

  useEffect(() => {
    // 1. Inicializa a sessão
    const initializeSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await fetchProfile(session.user.id);
      }
      setIsLoading(false);
    };

    initializeSession();

    // 2. Escuta mudanças de estado
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
  }, []);

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
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    return !error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const userRole: Role = profile?.role || 'Usuário';
  const userAvatarUrl: string | null = profile?.avatar_url || null;

  return (
    <AuthContext.Provider value={{ session, isLoading, userRole, userAvatarUrl, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};