import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MenuIcon, SearchIcon, BellIcon, ChevronDownIcon, UsersIcon, CarIcon, LogOutIcon } from './Icons';
import { mockClients } from '../data/mockData';
import { mockVehicles } from '../data/mockData';
import type { AlertItem, AlertStatus, Role } from '../types';

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

const getAlertStatus = (dateString: string | undefined): AlertStatus => {
  if (!dateString) return 'ok';
  const today = new Date();
  const expirationDate = new Date(dateString + 'T00:00:00');
  today.setHours(0, 0, 0, 0);

  if (expirationDate < today) {
    return 'expired';
  }

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  if (expirationDate <= thirtyDaysFromNow) {
    return 'expiring_soon';
  }

  return 'ok';
};

interface HeaderProps {
  title: string;
  session: MockSession;
  onMenuClick: () => void;
  avatarUrl: string | null;
}

const Header: React.FC<HeaderProps> = ({ title, session, onMenuClick, avatarUrl: userAvatarUrl }) => {
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const alertsRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const alerts: AlertItem[] = useMemo(() => {
    const allAlerts: AlertItem[] = [];

    mockClients.forEach(client => {
      const status = getAlertStatus(client.cnhExpirationDate);
      if (status !== 'ok') {
        allAlerts.push({
          id: `client-${client.id}`,
          type: 'CNH',
          message: `CNH de ${client.name}`,
          date: client.cnhExpirationDate!,
          status,
        });
      }
    });

    mockVehicles.forEach(vehicle => {
      const status = getAlertStatus(vehicle.licensingExpirationDate);
      if (status !== 'ok') {
        allAlerts.push({
          id: `vehicle-${vehicle.id}`,
          type: 'Licenciamento',
          message: `Licenciamento de ${vehicle.plate}`,
          date: vehicle.licensingExpirationDate!,
          status,
        });
      }
    });
    
    return allAlerts.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setIsAlertsOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const getAlertIcon = (type: AlertItem['type']) => {
    const baseClass = "w-5 h-5 mr-3 flex-shrink-0";
    if (type === 'CNH') return <UsersIcon className={`${baseClass} text-blue-500`} />;
    if (type === 'Licenciamento') return <CarIcon className={`${baseClass} text-green-500`} />;
    return null;
  }

  const handleLogout = () => {
    // No modo mock, apenas recarregamos a página para simular o logout
    window.location.reload();
  };

  const user = session.user;
  const fullName = user?.user_metadata?.full_name || 'Usuário';
  const role = user?.user_metadata?.role || 'Despachante';
  const avatarUrl = userAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName as string)}&background=0D47A1&color=fff`;

  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between z-10">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="text-gray-600 mr-4 lg:hidden">
          <MenuIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-dark-text">{title}</h1>
      </div>
      <div className="flex items-center space-x-4 md:space-x-6">
        <div className="relative hidden md:block">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="pl-10 pr-4 py-2 w-48 lg:w-64 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="relative" ref={alertsRef}>
          <button onClick={() => setIsAlertsOpen((prev: boolean) => !prev)} className="relative text-gray-500 hover:text-primary">
            <BellIcon className="w-6 h-6" />
            {alerts.length > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center h-5 w-5 bg-red-500 text-white text-xs rounded-full">
                    {alerts.length}
                </span>
            )}
          </button>
          {isAlertsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-20">
              <div className="p-3 border-b">
                <h3 className="font-semibold text-dark-text">Notificações de Vencimento</h3>
              </div>
              <ul className="py-2 max-h-96 overflow-y-auto">
                {alerts.length > 0 ? alerts.map((alert: AlertItem) => (
                  <li key={alert.id} className="px-4 py-2 hover:bg-gray-50 flex items-start">
                      {getAlertIcon(alert.type)}
                      <div>
                        <p className="text-sm font-medium text-dark-text">{alert.message}</p>
                        <p className={`text-xs font-bold ${alert.status === 'expired' ? 'text-red-600' : 'text-orange-500'}`}>
                           {alert.status === 'expired' ? 'Venceu em ' : 'Vence em '} 
                           {new Date(alert.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                  </li>
                )) : (
                    <li className="px-4 py-3 text-sm text-center text-gray-500">Nenhum alerta.</li>
                )}
              </ul>
            </div>
          )}
        </div>
        <div className="relative" ref={dropdownRef}>
          <div onClick={() => setIsDropdownOpen((prev: boolean) => !prev)} className="flex items-center space-x-3 cursor-pointer">
            <img
              src={avatarUrl}
              alt="User Avatar"
              className="w-10 h-10 rounded-full border-2 border-primary object-cover"
            />
            <div className="hidden md:block">
              <div className="font-semibold text-dark-text">{fullName}</div>
              <div className="text-sm text-light-text">{role}</div>
            </div>
            <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform hidden md:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-20 py-1">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOutIcon className="w-4 h-4 mr-2" />
                Sair (Mock)
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;