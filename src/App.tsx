import React, { useState, useEffect, Suspense, lazy } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import type { Page, Role } from './types';
import { supabase } from './integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

// Lazy loading dos componentes de páginas
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Clients = lazy(() => import('./pages/Clients'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const Services = lazy(() => import('./pages/Services'));
const Financial = lazy(() => import('./pages/Financial'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));

// Usuário mockado para o modo de desenvolvimento/falha de conexão
const MOCK_USER: User = {
  id: 'mock-admin-id',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'admin@mock.com',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  app_metadata: {
    provider: 'email',
    providers: ['email'],
  },
  user_metadata: {
    full_name: 'Admin Mock',
    role: 'Administrador',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_SESSION: Session = {
    access_token: 'mock-token',
    token_type: 'Bearer',
    user: MOCK_USER,
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    refresh_token: 'mock-refresh',
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [userRole, setUserRole] = useState<Role>('Usuário');
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchUserProfile = async (userId: string) => {
    // Se estiver no modo mock, não tente buscar o perfil real
    if (userId === MOCK_USER.id) {
        setUserRole(MOCK_USER.user_metadata.role as Role);
        setUserAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(MOCK_USER.user_metadata.full_name as string)}&background=0D47A1&color=fff`);
        return;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, avatar_url')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      setUserRole('Usuário');
      setUserAvatarUrl(null);
    } else if (profile) {
      setUserRole(profile.role as Role);
      setUserAvatarUrl(profile.avatar_url);
    } else {
      setUserRole('Usuário');
      setUserAvatarUrl(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
        setLoading(true);
        try {
            // Tenta obter a sessão Supabase
            const { data: { session: currentSession }, error } = await supabase.auth.getSession();

            if (error || !currentSession) {
                // Se houver erro de rede ou a sessão não for encontrada,
                // tentamos obter a sessão localmente (se houver) ou falhamos.
                // Se o erro for de rede (Failed to fetch), entramos no modo mock.
                if (error && error.message.includes('Failed to fetch')) {
                    console.warn("Supabase connection failed. Entering Mock Mode.");
                    setSession(MOCK_SESSION);
                    await fetchUserProfile(MOCK_USER.id);
                } else if (currentSession) {
                    setSession(currentSession);
                    await fetchUserProfile(currentSession.user.id);
                } else {
                    setSession(null);
                }
            } else {
                setSession(currentSession);
                await fetchUserProfile(currentSession.user.id);
            }
        } catch (e) {
            // Captura erros de inicialização, como 'Failed to fetch'
            console.error("Critical Supabase initialization error. Entering Mock Mode.", e);
            setSession(MOCK_SESSION);
            await fetchUserProfile(MOCK_USER.id);
        } finally {
            setLoading(false);
        }
    };

    initializeAuth();

    // Mantém o listener para mudanças de estado (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setSession(session);
        await fetchUserProfile(session.user.id);
      } else if (!session && _event === 'SIGNED_OUT') {
        setSession(null);
      }
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
      case 'reports':
      case 'settings':
        // Se estiver no modo mock, permitimos o acesso a estas páginas
        return renderPage(currentPage);
      default:
        return <Dashboard />;
    }
  };
  
  const renderPage = (page: Page) => {
      switch (page) {
          case 'dashboard': return <Dashboard />;
          case 'clients': return <Clients />;
          case 'vehicles': return <Vehicles />;
          case 'services': return <Services />;
          case 'financial': return <Financial />;
          case 'reports': return <Reports />;
          case 'settings': return <Settings />;
          default: return <Dashboard />;
      }
  }
  
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