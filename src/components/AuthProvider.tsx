import React, { useState, useEffect, createContext, useContext } from 'react';
import type { Role } from '../types';
import { supabase } from '../integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  userRole: Role;
  userAvatarUrl: string | null;
  userFullName: string;
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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{ role: Role, avatar_url: string | null, first_name: string | null, last_name: string | null } | null>(null);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, avatar_url, first_name, last_name')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } else if (data) {
      setProfile({ 
        role: data.role as Role, 
        avatar_url: data.avatar_url,
        first_name: data.first_name,
        last_name: data.last_name,
      });
    }
  };

  useEffect(() => {
    const loadSessionAndProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session) {
            await fetchProfile(session.user.id);
        }
        
        // Only set isLoading to false after checking session and profile
        setIsLoading(false);
    };

    loadSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      // Note: We don't set isLoading here, as it's handled by the initial load or subsequent navigation.
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    return !error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  const userRole: Role = profile?.role || 'Usuário';
  const userAvatarUrl: string | null = profile?.avatar_url || null;
  
  const firstName = profile?.first_name || '';
  const lastName = profile?.last_name || '';
  const userFullName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : 'Usuário';

  return (
    <AuthContext.Provider value={{ session, isLoading, userRole, userAvatarUrl, userFullName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};