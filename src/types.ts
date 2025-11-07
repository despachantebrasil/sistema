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
  cpf_cnpj: string; // Alterado para snake_case para corresponder ao DB
  email: string;
  phone: string;
  address: string;
  avatar_url: string; // Alterado para snake_case
  doc_status: ClientDocStatus; // Alterado para snake_case
  client_type: ClientType; // Alterado para snake_case
  marital_status?: string; // Alterado para snake_case
  profession?: string;
  nationality?: string;
  naturalness?: string;
  cnh_number?: string;
  cnh_expiration_date?: string; // YYYY-MM-DD, Alterado para snake_case
  trade_name?: string; // Nome Fantasia for Pessoa Jurídica, Alterado para snake_case
  contact_name?: string; // Nome do Contato for Pessoa Jurídica, Alterado para snake_case
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
  year_manufacture: number; // Alterado para snake_case
  year_model: number; // Alterado para snake_case
  color: string;
  fuel_type?: string; // Alterado para snake_case
  licensing_expiration_date?: string; // YYYY-MM-DD, Alterado para snake_case
  image_urls?: string[]; // Alterado para snake_case
  category?: string; // Novo campo: Categoria (Ex: Particular, Aluguel)
  capacity_power_cc?: string; // Novo campo: Capacidade/Potência/Cilindrada
  created_at: string;
}

// Novo tipo para os dados extraídos do documento do veículo
// REMOVIDO: export type ExtractedVehicleData = Partial<Omit<Vehicle, 'id' | 'user_id' | 'owner_id' | 'created_at' | 'image_urls'>>;


export interface Service {
  id: number;
  user_id: string; // Chave estrangeira para auth.users
  client_id?: number; // ID do cliente
  vehicle_id?: number; // ID do veículo
  name: string;
  status: ServiceStatus;
  due_date: string; // YYYY-MM-DD, Alterado para snake_case
  price: number;
  payer_client_id?: number; // Novo campo
  payer_client_name?: string; // Novo campo
  agent_name?: string; // Novo campo: Responsável pelo processo
  detran_schedule_time?: string; // Novo campo: Horário agendado no Detran
  contact_phone?: string; // Novo campo: Contato do responsável
  payment_status?: 'Pago' | 'Pendente'; // Novo campo: Status de pagamento
  situation_notes?: string; // Novo campo: Notas sobre a situação
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
  transaction_date: string; // YYYY-MM-DD, Alterado para snake_case
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  due_date?: string; // YYYY-MM-DD, Alterado para snake_case
  client_id?: number; // Alterado para snake_case
  service_id?: number; // Alterado para snake_case
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

export interface AuditLog {
  id: number;
  created_at: string;
  trace_code: string;
  action: string;
  user_id: string;
  details: any;
  user_full_name: string;
  user_email: string;
}