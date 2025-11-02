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
  user_id: string; // Chave estrangeira para auth.users
  name: string;
  cpf_cnpj: string; 
  email: string;
  phone: string;
  address: string;
  avatar_url: string; 
  doc_status: ClientDocStatus; 
  client_type: ClientType; 
  marital_status?: string; 
  profession?: string;
  nationality?: string;
  naturalness?: string;
  cnh_expiration_date?: string; // YYYY-MM-DD
  trade_name?: string; // Nome Fantasia for Pessoa Jurídica
  contact_name?: string; // Nome do Contato for Pessoa Jurídica
  created_at: string;
}

export interface Vehicle {
  id: number;
  user_id: string; // Chave estrangeira para auth.users
  owner_id: number; // ID do cliente (Client.id)
  plate: string;
  chassis: string;
  renavam: string;
  brand: string;
  model: string;
  year_manufacture: number; 
  year_model: number; 
  color: string;
  fuel_type?: string; 
  licensing_expiration_date?: string; // YYYY-MM-DD
  image_urls?: string[]; 
  created_at: string;
}

// Tipo para uso em componentes (camelCase para melhor legibilidade em JS/TS)
export interface VehicleComponentProps extends Omit<Vehicle, 'user_id' | 'owner_id' | 'year_manufacture' | 'year_model' | 'fuel_type' | 'licensing_expiration_date' | 'image_urls' | 'created_at' | 'cpf_cnpj' | 'doc_status' | 'client_type' | 'marital_status' | 'cnh_expiration_date' | 'trade_name' | 'contact_name'> {
    ownerId: number;
    ownerName: string; // Adicionado para facilitar a exibição
    yearManufacture: number;
    yearModel: number;
    fuelType?: string;
    licensingExpirationDate?: string;
    imageUrls?: string[];
}

// Novo tipo para os dados extraídos do documento do veículo
export type ExtractedVehicleData = Partial<Omit<Vehicle, 'id' | 'user_id' | 'owner_id' | 'created_at' | 'image_urls'>>;


export interface Service {
  id: number;
  user_id: string; // Chave estrangeira para auth.users
  client_id?: number; // ID do cliente (proprietário do veículo)
  vehicle_id?: number; // ID do veículo
  name: string;
  status: ServiceStatus;
  due_date: string; // YYYY-MM-DD
  price: number;
  payer_client_id?: number; // Novo campo
  payer_client_name?: string; // Novo campo
  created_at: string;
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
  user_id: string; // Chave estrangeira para auth.users
  description: string;
  category: string;
  transaction_date: string; // YYYY-MM-DD
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  due_date?: string; // YYYY-MM-DD
  client_id?: number; // ID do cliente pagador/relacionado
  service_id?: number; // ID do serviço
  created_at: string;
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