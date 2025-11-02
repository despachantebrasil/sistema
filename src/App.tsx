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
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [userRole, setUserRole] = useState<Role>('Usuário');
  const [userName, setUserName] = useState<string>('Usuário');
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        // Clear user-specific state on logout
        setUserRole('Usuário');
        setUserName('Usuário');
        setUserAvatarUrl(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, avatar_url, first_name, last_name')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
        } else if (data) {
          setUserRole(data.role as Role);
          setUserAvatarUrl(data.avatar_url);
          const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
          setUserName(fullName || 'Usuário');
        }
      }
    };

    fetchUserProfile();
  }, [session]);

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'clients': return <Clients />;
      case 'vehicles': return <Vehicles />;
      case 'services': return <Services />;
      case 'financial': return <Financial />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
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
  };

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
          userName={userName}
          userRole={userRole}
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