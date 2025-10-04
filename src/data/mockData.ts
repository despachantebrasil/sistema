import type { Client, Vehicle, Service, ServiceCategory, Transaction, FinancialKpis, DashboardKpiV2, NotificationItem, AppUser, PermissionsMap, CompanyProfile } from '../types';
import { ClientDocStatus, ServiceStatus, TransactionType, TransactionStatus, ClientType } from '../types';

const today = new Date();
const expiringSoonDate = new Date();
expiringSoonDate.setDate(today.getDate() + 15);
const expiredDate = new Date();
expiredDate.setDate(today.getDate() - 10);
const okDate = new Date();
okDate.setFullYear(today.getFullYear() + 1);

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const mockClients: Client[] = [
  { id: 1, name: 'João da Silva', cpfCnpj: '123.456.789-00', email: 'joao.silva@example.com', phone: '(11) 98765-4321', address: 'Rua das Flores, 123', avatarUrl: 'https://picsum.photos/seed/joao/100/100', docStatus: ClientDocStatus.COMPLETED, clientType: ClientType.INDIVIDUAL, maritalStatus: 'Casado', profession: 'Engenheiro', nationality: 'Brasileira', naturalness: 'São Paulo/SP', cnhExpirationDate: formatDate(expiringSoonDate) },
  { id: 2, name: 'Maria Oliveira', cpfCnpj: '987.654.321-00', email: 'maria.oliveira@example.com', phone: '(21) 91234-5678', address: 'Avenida Brasil, 456', avatarUrl: 'https://picsum.photos/seed/maria/100/100', docStatus: ClientDocStatus.IN_PROGRESS, clientType: ClientType.INDIVIDUAL, maritalStatus: 'Solteira', profession: 'Advogada', nationality: 'Brasileira', naturalness: 'Rio de Janeiro/RJ', cnhExpirationDate: formatDate(expiredDate) },
  { id: 3, name: 'Empresa ABC Ltda', cpfCnpj: '12.345.678/0001-99', email: 'contato@abc.com', phone: '(31) 3333-4444', address: 'Rua dos Inconfidentes, 789', avatarUrl: 'https://picsum.photos/seed/abc/100/100', docStatus: ClientDocStatus.PENDING, clientType: ClientType.COMPANY, tradeName: 'ABC Veículos', contactName: 'Roberto Mendes' },
  { id: 4, name: 'Carlos Pereira', cpfCnpj: '111.222.333-44', email: 'carlos.p@example.com', phone: '(41) 99999-8888', address: 'Alameda dos Anjos, 101', avatarUrl: 'https://picsum.photos/seed/carlos/100/100', docStatus: ClientDocStatus.COMPLETED, clientType: ClientType.INDIVIDUAL, maritalStatus: 'Divorciado', profession: 'Médico', nationality: 'Brasileira', naturalness: 'Curitiba/PR', cnhExpirationDate: formatDate(okDate) },
  { id: 5, name: 'Ana Souza', cpfCnpj: '555.666.777-88', email: 'ana.souza@example.com', phone: '(51) 98888-7777', address: 'Travessa da Paz, 202', avatarUrl: 'https://picsum.photos/seed/ana/100/100', docStatus: ClientDocStatus.IN_PROGRESS, clientType: ClientType.INDIVIDUAL, maritalStatus: 'Viúva', profession: 'Arquiteta', nationality: 'Brasileira', naturalness: 'Porto Alegre/RS', cnhExpirationDate: formatDate(okDate) },
];

export const mockVehicles: Vehicle[] = [
  { id: 1, plate: 'BRA2E19', chassis: '9BD2783395G372133', renavam: '12345678901', brand: 'Toyota', model: 'Corolla', yearManufacture: 2022, yearModel: 2022, color: 'Prata', fuelType: 'Flex', ownerId: 1, ownerName: 'João da Silva', licensingExpirationDate: formatDate(okDate), imageUrls: ['https://picsum.photos/seed/BRA2E19_1/400/300', 'https://picsum.photos/seed/BRA2E19_2/400/300', 'https://picsum.photos/seed/BRA2E19_3/400/300'] },
  { id: 2, plate: 'RIO2A18', chassis: '9BWCA05UX8P453788', renavam: '23456789012', brand: 'Volkswagen', model: 'Gol', yearManufacture: 2020, yearModel: 2021, color: 'Branco', fuelType: 'Flex', ownerId: 2, ownerName: 'Maria Oliveira', licensingExpirationDate: formatDate(expiringSoonDate), imageUrls: ['https://picsum.photos/seed/RIO2A18_1/400/300']},
  { id: 3, plate: 'SAO2D20', chassis: '9BFZF58A38G937562', renavam: '34567890123', brand: 'Ford', model: 'Ranger', yearManufacture: 2023, yearModel: 2023, color: 'Azul', fuelType: 'Diesel', ownerId: 3, ownerName: 'Empresa ABC Ltda', licensingExpirationDate: formatDate(expiringSoonDate) },
  { id: 4, plate: 'CUR1B17', chassis: '93HSC28518S123456', renavam: '45678901234', brand: 'Honda', model: 'Civic', yearManufacture: 2019, yearModel: 2020, color: 'Preto', fuelType: 'Gasolina', ownerId: 4, ownerName: 'Carlos Pereira', licensingExpirationDate: formatDate(expiredDate), imageUrls: ['https://picsum.photos/seed/CUR1B17_1/400/300', 'https://picsum.photos/seed/CUR1B17_2/400/300'] },
  { id: 5, plate: 'POA3C16', chassis: '9C6KGRF839T654321', renavam: '56789012345', brand: 'Chevrolet', model: 'Onix', yearManufacture: 2022, yearModel: 2022, color: 'Vermelho', fuelType: 'Flex', ownerId: 5, ownerName: 'Ana Souza', licensingExpirationDate: formatDate(okDate) },
];

export const mockServices: Service[] = [
  { id: 1, name: 'Licenciamento', clientName: 'João da Silva', vehiclePlate: 'BRA2E19', status: ServiceStatus.COMPLETED, dueDate: '2024-06-15', price: 380.00 },
  { id: 2, name: 'Transferência', clientName: 'Maria Oliveira', vehiclePlate: 'RIO2A18', status: ServiceStatus.IN_PROGRESS, dueDate: '2024-08-20', price: 850.00 },
  { id: 3, name: 'Emplacamento', clientName: 'Carlos Lima', vehiclePlate: 'DEF-5678', status: ServiceStatus.WAITING_DOCS, dueDate: '2024-08-25', price: 1200.00 },
  { id: 4, name: 'Transferência', clientName: 'Ana Costa', vehiclePlate: 'GHI-9012', status: ServiceStatus.IN_PROGRESS, dueDate: '2024-09-10', price: 920.00 },
  { id: 5, name: 'Licenciamento', clientName: 'Pedro Rocha', vehiclePlate: 'JKL-3456', status: ServiceStatus.COMPLETED, dueDate: '2024-09-01', price: 450.00 },
  { id: 6, name: 'Licenciamento anual de veículos', clientName: 'Carlos Pereira', vehiclePlate: 'CUR1B17', status: ServiceStatus.CANCELED, dueDate: '2024-07-30', price: 150.00 },
  { id: 7, name: 'Renovação de CNH', clientName: 'João da Silva', vehiclePlate: 'BRA2E19', status: ServiceStatus.TODO, dueDate: '2024-08-28', price: 220.00 },
];

export const serviceCatalog: ServiceCategory[] = [
    {
        name: 'Serviços de Veículos',
        services: [
            'Licenciamento anual de veículos',
            'Transferência de propriedade',
            'Segunda via de documentos (CRLV, CRV)',
            'Mudança de endereço no documento do veículo',
            'Inclusão/exclusão de alienação fiduciária',
            'Baixa de veículos (sucata, furto/roubo)',
            'Alteração de características do veículo',
            'Emplacamento de veículos novos e usados',
        ],
    },
    {
        name: 'Serviços de CNH (Carteira Nacional de Habilitação)',
        services: [
            'Primeira habilitação',
            'Renovação de CNH',
            'Mudança de categoria (adição/ampliação)',
            'Segunda via de CNH',
            'Alteração de dados na CNH',
            'Transferência de CNH para outro estado',
            'Recurso de multas e penalidades',
            'Curso de reciclagem para condutores',
        ],
    },
    {
        name: 'Serviços de Multas e Infrações',
        services: [
            'Consulta de multas e pontuação',
            'Recursos de multas de trânsito',
            'Defesa prévia e JARI',
            'Parcelamento de multas',
            'Indicação de condutor infrator',
            'Conversão de multa em advertência',
        ],
    },
    {
        name: 'Serviços Especiais',
        services: [
            'Vistoria veicular',
            'Laudo de avaliação para seguro',
            'Autorização para conduzir ciclomotor (ACC)',
            'Credenciamento de auto escola',
            'Registro de instrutor de trânsito',
            'Permissão para dirigir (PPD)',
        ],
    },
    {
        name: 'Serviços Complementares',
        services: [
            'Agendamento de serviços no DETRAN',
            'Orientação sobre documentação necessária',
            'Acompanhamento de processos',
            'Consultoria em legislação de trânsito',
            'Entrega de documentos em domicílio',
            'Atendimento personalizado para empresas com frotas',
        ],
    },
];

export const financialKpis: FinancialKpis = {
  totalRevenue: 45230.75,
  accountsReceivable: 7890.00,
  accountsPayable: 2345.50,
  currentBalance: 35000.25,
};

export const mockTransactions: Transaction[] = [
  { id: 1, description: 'Licenciamento BRA2E19', category: 'Serviço Veicular', date: '2024-07-28', dueDate: '2024-08-15', amount: 150.00, type: TransactionType.REVENUE, status: TransactionStatus.PAID, serviceId: 1, clientId: 1 },
  { id: 2, description: 'Pagamento de Taxa DETRAN', category: 'Taxas', date: '2024-07-27', dueDate: '2024-07-30', amount: 88.90, type: TransactionType.EXPENSE, status: TransactionStatus.PAID },
  { id: 3, description: 'Transferência RIO2A18', category: 'Serviço Veicular', date: '2024-07-26', dueDate: '2024-08-20', amount: 850.00, type: TransactionType.REVENUE, status: TransactionStatus.PENDING, serviceId: 2, clientId: 2 },
  { id: 4, description: 'Material de Escritório', category: 'Despesas Gerais', date: '2024-07-25', dueDate: '2024-07-25', amount: 120.50, type: TransactionType.EXPENSE, status: TransactionStatus.PAID },
  { id: 5, description: 'Renovação CNH Ana Souza', category: 'Serviço CNH', date: '2024-07-22', dueDate: '2024-08-10', amount: 280.00, type: TransactionType.REVENUE, status: TransactionStatus.PENDING, clientId: 5 },
];

export const dashboardKpisV2: DashboardKpiV2[] = [
    { title: 'Clientes Ativos', value: '127', subtitle: 'Clientes cadastrados', change: '+12% este mês', icon: 'UsersIcon', color: 'blue' },
    { title: 'Processos Ativos', value: '34', subtitle: 'Em andamento', change: '8 novos hoje', icon: 'FileTextIcon', color: 'green' },
    { title: 'Receita Mensal', value: 'R$ 45.8k', subtitle: 'Janeiro 2024', change: '+23% vs mês anterior', icon: 'DollarSignIcon', color: 'purple' },
    { title: 'Alertas Pendentes', value: '12', subtitle: 'Requerem atenção', change: '5 vencimentos próximos', icon: 'WarningIcon', color: 'orange' },
];

export const mockNotifications: NotificationItem[] = [
    { id: 1, title: 'Licenciamentos Vencendo', description: '5 veículos com vencimento em 10 dias', color: 'orange' },
    { id: 2, title: 'Documentos Pendentes', description: '8 processos aguardando documentação', color: 'blue' },
    { id: 3, title: 'Pagamentos Recebidos', description: 'R$ 4.850,00 recebidos hoje', color: 'green' },
];


// Data for Settings Page
export const mockUsers: AppUser[] = [
    { id: 'uuid-1', fullName: 'Admin Geral', email: 'admin@urtech.com', role: 'Administrador' },
    { id: 'uuid-2', fullName: 'Gerente Ana', email: 'gerente.ana@urtech.com', role: 'Gerente' },
    { id: 'uuid-3', fullName: 'Usuário Bruno', email: 'user.bruno@urtech.com', role: 'Usuário' },
];

export const initialPermissions: PermissionsMap = {
    'Administrador': {
        dashboard: true,
        clients: true,
        vehicles: true,
        services: true,
        financial: true,
        reports: true,
        settings: true,
    },
    'Gerente': {
        dashboard: true,
        clients: true,
        vehicles: true,
        services: true,
        financial: true,
        reports: true,
        settings: false,
    },
    'Usuário': {
        dashboard: true,
        clients: true,
        vehicles: true,
        services: true,
        financial: false,
        reports: false,
        settings: false,
    },
};

export const mockCompanyProfile: CompanyProfile = {
    name: 'URTECH Despachantes & Cia Ltda',
    cnpj: '12.345.678/0001-99',
    phone: '(11) 5555-1234',
    address: 'Avenida Principal, 789',
    city: 'São Paulo',
    state: 'SP',
    zip: '01234-567',
};