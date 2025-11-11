import React from 'react';
import type { Page, Role } from '../types';
import { initialPermissions } from '../data/mockData';
import { 
    DashboardIcon, DashboardIconFilled, 
    UsersIcon, UsersIconFilled, 
    CarIcon, CarIconFilled, 
    FileTextIcon, FileTextIconFilled, 
    DollarSignIcon, DollarSignIconFilled,
    ChartBarIcon, ChartBarIconFilled,
    SettingsIcon, SettingsIconFilled
} from './Icons';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  userRole: Role;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface IconProps {
  className?: string;
}

const NavItem: React.FC<{
  icon: React.FC<IconProps>;
  iconFilled: React.FC<IconProps>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon: Icon, iconFilled: IconFilled, label, isActive, onClick }) => {
  const IconComponent = isActive ? IconFilled : Icon;
  return (
    <li
      className={`flex items-center p-4 my-1 rounded-lg cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-white text-primary font-bold shadow-md'
          : 'text-blue-200 hover:bg-primary-dark hover:text-white'
      }`}
      onClick={onClick}
    >
      <IconComponent className="w-7 h-7" />
      <span className="ml-4">{label}</span>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, userRole, isOpen, setIsOpen }) => {
  const allNavItems: { 
      id: Page; 
      label: string; 
      icon: React.FC<IconProps>; 
      iconFilled: React.FC<IconProps> 
  }[] = [
    { id: 'dashboard', label: 'Painel Admin', icon: DashboardIcon, iconFilled: DashboardIconFilled },
    { id: 'clients', label: 'Clientes', icon: UsersIcon, iconFilled: UsersIconFilled },
    { id: 'vehicles', label: 'Veículos', icon: CarIcon, iconFilled: CarIconFilled },
    { id: 'services', label: 'Serviços', icon: FileTextIcon, iconFilled: FileTextIconFilled },
    { id: 'financial', label: 'Financeiro', icon: DollarSignIcon, iconFilled: DollarSignIconFilled },
    { id: 'reports', label: 'Relatórios', icon: ChartBarIcon, iconFilled: ChartBarIconFilled },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon, iconFilled: SettingsIconFilled },
  ];

  const userPermissions = initialPermissions[userRole] || {};
  const navItems = allNavItems.filter(item => userPermissions[item.id as keyof typeof userPermissions]);

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    if (window.innerWidth < 1024) { // lg breakpoint in Tailwind
      setIsOpen(false);
    }
  };

  return (
    <aside className={`bg-primary text-white flex flex-col p-4 shadow-lg transition-transform duration-300 ease-in-out z-30 
      lg:w-64 lg:translate-x-0 lg:relative
      fixed h-full w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="text-xl font-bold text-center py-6 border-b border-primary-dark">
        ONEKER<span className="text-secondary"> DESPACHANTES</span>
      </div>
      <nav className="mt-8">
        <ul>
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              iconFilled={item.iconFilled}
              label={item.label}
              isActive={currentPage === item.id}
              onClick={() => handleNavClick(item.id)}
            />
          ))}
        </ul>
      </nav>
      <div className="mt-auto p-4 text-center text-sm text-gray-300">
        <p>&copy; 2025 ONEKER DESPACHANTES</p>
        <p>v1.0.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;