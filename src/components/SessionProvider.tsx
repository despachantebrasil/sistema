import React, { useState, useEffect, createContext, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import type { Role } from '../types';

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  userRole: Role;
  userAvatarUrl: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const defaultRole: Role = 'Usuário';

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<Role>(defaultRole);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        const role = session.user.user_metadata.role as Role || defaultRole;
        setUserRole(role);
        setUserAvatarUrl(session.user.user_metadata.avatar_url as string || null);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        const role = session.user.user_metadata.role as Role || defaultRole;
        setUserRole(role);
        setUserAvatarUrl(session.user.user_metadata.avatar_url as string || null);
      } else {
        setUserRole(defaultRole);
        setUserAvatarUrl(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading, userRole, userAvatarUrl }}>
      {children}
    </AuthContext.Provider>
  );
};