import React, { useState, useEffect, Suspense, lazy } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import type { Page, Role } from './types';
import { supabase } from './integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

// Lazy loading dos componentes de páginas
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Clients = lazy(() => import('./pages/Clients'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const Services = lazy(() => import('./pages/Services'));
const Financial = lazy(() => import('./pages/Financial'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [userRole, setUserRole] = useState<Role>('Usuário');
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchUserProfile = async (userId: string, currentSession: Session | null) => {
    // Tentativa de buscar o perfil usando a view combinada
    const { data: profile, error } = await supabase
      .from('user_profiles_view')
      .select('role, avatar_url')
      .eq('id', userId)
      .single();

    if (error) {
      console.log('Error fetching user profile from DB, falling back to metadata:', error);
      // Fallback para metadados da sessão em caso de erro de DB/RLS
      const fallbackRole = currentSession?.user?.user_metadata?.role as Role || 'Usuário';
      const fallbackAvatar = currentSession?.user?.user_metadata?.avatar_url as string || null;
      
      setUserRole(fallbackRole);
      setUserAvatarUrl(fallbackAvatar);
    } else if (profile) {
      setUserRole(profile.role as Role);
      setUserAvatarUrl(profile.avatar_url);
    } else {
      // Se não houver perfil, mas houver sessão (o que não deveria acontecer após o trigger)
      setUserRole('Usuário');
      setUserAvatarUrl(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        // Passamos a sessão atualizada para a função de busca de perfil
        await fetchUserProfile(session.user.id, session);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <Clients />;
      case 'vehicles':
        return <Vehicles />;
      case 'services':
        return <Services />;
      case 'financial':
        return <Financial />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };
  
  const pageTitles: Record<Page, string> = {
      dashboard: 'Painel Administrativo',
      clients: 'Gestão de Clientes',
      vehicles: 'Gestão de Veículos',
      services: 'Gestão de Serviços',
      financial: 'Financeiro',
      reports: 'Relatórios',
      settings: 'Configurações'
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  if (!session) {
    return (
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Carregando...</div>}>
        <Login />
      </Suspense>
    );
  }

  return (
    <div className="flex h-screen bg-light-bg text-dark-text">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        userRole={userRole}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden no-print">
        <Header 
          title={pageTitles[currentPage]} 
          session={session}
          onMenuClick={() => setIsSidebarOpen(true)}
          avatarUrl={userAvatarUrl}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light-bg">
          <Suspense fallback={<div className="flex h-screen items-center justify-center">Carregando...</div>}>
            {renderContent()}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default App;