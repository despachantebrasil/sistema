import React, { useState, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import { useAuth } from './components/AuthProvider';
import type { Page } from './types';

// Importações de Páginas
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Vehicles from './pages/Vehicles';
import Services from './pages/Services';
import Financial from './pages/Financial';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const App: React.FC = () => {
  const { session, isLoading, userRole, userAvatarUrl } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-light-bg">
        <p className="text-xl text-primary">Carregando...</p>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

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
          onMenuClick={() => setIsSidebarOpen(true)}
          avatarUrl={userAvatarUrl}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light-bg">
          <Suspense fallback={<div className="flex h-screen items-center justify-center">Carregando...</div>}>
            {renderPage(currentPage)}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default App;