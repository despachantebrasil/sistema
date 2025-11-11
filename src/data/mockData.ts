import type { ServiceCategory, DashboardKpiV2, NotificationItem, PermissionsMap, CompanyProfile } from '../types';

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

// Estes KPIs serão calculados no Dashboard, mas a estrutura é mantida
export const dashboardKpisV2: DashboardKpiV2[] = [
    { title: 'Clientes Ativos', value: '0', subtitle: 'Clientes cadastrados', change: 'Carregando...', icon: 'UsersIcon', color: 'blue' },
    { title: 'Processos Ativos', value: '0', subtitle: 'Em andamento', change: 'Carregando...', icon: 'FileTextIcon', color: 'green' },
    { title: 'Receita Mensal', value: 'R$ 0.00', subtitle: 'Mês Atual', change: 'Carregando...', icon: 'DollarSignIcon', color: 'purple' },
    { title: 'Alertas Pendentes', value: '0', subtitle: 'Requerem atenção', change: 'Carregando...', icon: 'WarningIcon', color: 'orange' },
];

// Estas notificações serão geradas dinamicamente
export const mockNotifications: NotificationItem[] = [
    { id: 1, title: 'Carregando dados...', description: 'Aguarde a sincronização com o banco de dados.', color: 'blue' },
];

// Dados de configuração mantidos
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
    'Auxiliar Administrativo': {
        dashboard: true,
        clients: true,
        vehicles: true,
        services: true,
        financial: false,
        reports: false,
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
    name: 'ONEKER Despachantes & Cia Ltda',
    cnpj: '12.345.678/0001-99',
    phone: '(11) 5555-1234',
    address: 'Avenida Principal, 789',
    city: 'São Paulo',
    state: 'SP',
    zip: '01234-567',
};