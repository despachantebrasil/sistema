export enum ServiceStatus {
  TODO = 'A Fazer',
  IN_PROGRESS = 'Em Andamento',
  WAITING_DOCS = 'Aguardando Docs',
  COMPLETED = 'Concluído',
  CANCELED = 'Cancelado',
}

export enum ClientDocStatus {
  PENDING = 'Pendente',
  IN_PROGRESS = 'Em Andamento',
  COMPLETED = 'Concluído',
}

export enum ClientType {
  INDIVIDUAL = 'Pessoa Física',
  COMPANY = 'Pessoa Jurídica',
}

export interface Client {
  id: number;
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  address: string;
  avatarUrl: string;
  docStatus: ClientDocStatus;
  clientType: ClientType;
  maritalStatus?: string;
  profession?: string;
  nationality?: string;
  naturalness?: string;
  cnhExpirationDate?: string; // YYYY-MM-DD
  tradeName?: string; // Nome Fantasia for Pessoa Jurídica
  contactName?: string; // Nome do Contato for Pessoa Jurídica
}

export interface Vehicle {
  id: number;
  plate: string;
  chassis: string;
  renavam: string;
  brand: string;
  model: string;
  yearManufacture: number;
  yearModel: number;
  color: string;
  fuelType?: string;
  ownerId: number;
  ownerName: string;
  licensingExpirationDate?: string; // YYYY-MM-DD
  imageUrls?: string[];
}

export interface Service {
  id: number;
  name: string;
  clientName: string;
  vehiclePlate: string;
  status: ServiceStatus;
  dueDate: string; // YYYY-MM-DD
  price: number;
}

export interface ServiceCategory {
  name: string;
  services: string[];
}

export interface RecentActivity {
  id: number;
  description: string;
  timestamp: string;
  user: string;
  type: 'service' | 'client' | 'vehicle';
}

export enum TransactionType {
  REVENUE = 'Receita',
  EXPENSE = 'Despesa',
}

export enum TransactionStatus {
  PAID = 'Pago',
  PENDING = 'Pendente',
}

export interface Transaction {
  id: number;
  description: string;
  category: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  dueDate?: string; // YYYY-MM-DD
  clientId?: number;
  serviceId?: number;
}

export interface FinancialKpis {
  totalRevenue: number;
  accountsReceivable: number;
  accountsPayable: number;
  currentBalance: number;
}


export type AlertStatus = 'expired' | 'expiring_soon' | 'ok';

export interface AlertItem {
    id: string;
    type: 'CNH' | 'Licenciamento';
    message: string;
    date: string;
    status: AlertStatus;
}

export type Page = 'dashboard' | 'clients' | 'vehicles' | 'services' | 'financial' | 'reports' | 'settings';

export interface DashboardKpiV2 {
    title: string;
    value: string;
    subtitle: string;
    change: string;
    icon: 'UsersIcon' | 'FileTextIcon' | 'DollarSignIcon' | 'WarningIcon';
    color: 'blue' | 'green' | 'purple' | 'orange';
}

export interface NotificationItem {
    id: number;
    title: string;
    description: string;
    color: 'orange' | 'blue' | 'green';
}

// Types for Settings Page
export type Role = 'Administrador' | 'Gerente' | 'Usuário';

export interface AppUser {
    id: string; // Will come from Supabase Auth
    fullName: string;
    email: string;
    role: Role;
    avatarUrl?: string;
}

export type Permission = {
    [key in Page]?: boolean;
};

export type PermissionsMap = {
    [key in Role]: Permission;
};

export interface CompanyProfile {
    name: string;
    cnpj: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
}