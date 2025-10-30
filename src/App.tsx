import React, { useState, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import type { Page, Role } from './types';

// Importações de Páginas
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Vehicles from './pages/Vehicles';
import Services from './pages/Services';
import Financial from './pages/Financial';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Definindo tipos mínimos para simular Session e User
interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
    role: Role;
  };
}

interface MockSession {
    access_token: string;
    user: MockUser;
}

// Usuário mockado padrão
const MOCK_USER: MockUser = {
  id: 'mock-admin-id',
  email: 'admin@mock.com',
  user_metadata: {
    full_name: 'Admin Mock',
    role: 'Administrador',
  },
};

const MOCK_SESSION: MockSession = {
    access_token: 'mock-token',
    user: MOCK_USER,
};

const App: React.FC = () => {
  // Agora, a sessão é sempre o mock
  const session: MockSession = MOCK_SESSION;
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const userRole: Role = MOCK_USER.user_metadata.role;
  const userAvatarUrl: string = `https://ui-avatars.com/api/?name=${encodeURIComponent(MOCK_USER.user_metadata.full_name as string)}&background=0D47A1&color=fff`;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
          session={session as any} // Cast para evitar erros de tipo, já que removemos o tipo Session real
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