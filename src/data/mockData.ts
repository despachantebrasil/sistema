import type { ServiceCategory, FinancialKpis, DashboardKpiV2, NotificationItem, AppUser, PermissionsMap, CompanyProfile } from '../types';

// NOTE: All mock data for Clients, Vehicles, Services, and Transactions has been removed.
// These entities are now managed by the Supabase database via dataService.ts.

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

export const dashboardKpisV2: DashboardKpiV2[] = [
    { title: 'Clientes Ativos', value: '0', subtitle: 'Clientes cadastrados', change: 'Carregando...', icon: 'UsersIcon', color: 'blue' },
    { title: 'Processos Ativos', value: '0', subtitle: 'Em andamento', change: 'Carregando...', icon: 'FileTextIcon', color: 'green' },
    { title: 'Receita Mensal', value: 'R$ 0.00', subtitle: 'Carregando...', change: 'Carregando...', icon: 'DollarSignIcon', color: 'purple' },
    { title: 'Alertas Pendentes', value: '0', subtitle: 'Requerem atenção', change: 'Carregando...', icon: 'WarningIcon', color: 'orange' },
];

export const mockNotifications: NotificationItem[] = [
    { id: 1, title: 'Carregando Dados', description: 'Aguarde a sincronização com o Supabase.', color: 'blue' },
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