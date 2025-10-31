import React, { useState, useEffect, useMemo } from 'react';
import { dashboardKpisV2, mockNotifications } from '../data/mockData';
import { fetchServices, fetchClients } from '../services/dataService';
import { UsersIcon, FileTextIcon, DollarSignIcon, WarningIcon, LoaderIcon } from '../components/Icons';
import type { DashboardKpiV2, NotificationItem, Service, Client } from '../types';
import { ServiceStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, PieLabelRenderProps } from 'recharts';

const kpiColors: Record<DashboardKpiV2['color'], { bg: string; text: string; iconBg: string }> = {
  blue: { bg: 'bg-blue-500', text: 'text-blue-100', iconBg: 'bg-blue-600/[.5]' },
  green: { bg: 'bg-green-500', text: 'text-green-100', iconBg: 'bg-green-600/[.5]' },
  purple: { bg: 'bg-purple-600', text: 'text-purple-100', iconBg: 'bg-purple-700/[.5]' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-100', iconBg: 'bg-orange-600/[.5]' },
};

const icons: Record<DashboardKpiV2['icon'], React.ReactNode> = {
  UsersIcon: <UsersIcon className="w-6 h-6 text-white" />,
  FileTextIcon: <FileTextIcon className="w-6 h-6 text-white" />,
  DollarSignIcon: <DollarSignIcon className="w-6 h-6 text-white" />,
  WarningIcon: <WarningIcon className="w-6 h-6 text-white" />,
};

const KpiCard: React.FC<{ kpi: DashboardKpiV2 }> = ({ kpi }) => {
  const colorClasses = kpiColors[kpi.color];

  return (
    <div className={`p-5 rounded-xl shadow-lg text-white ${colorClasses.bg}`}>
      <div className="flex justify-between items-start">
        <p className="font-semibold">{kpi.title}</p>
        <div className={`p-2 rounded-lg ${colorClasses.iconBg}`}>
          {icons[kpi.icon]}
        </div>
      </div>
      <p className="text-4xl font-bold mt-2">{kpi.value}</p>
      <p className={`mt-2 text-sm ${colorClasses.text}`}>{kpi.subtitle}</p>
      <p className={`mt-1 text-sm ${colorClasses.text}`}>{kpi.change}</p>
    </div>
  );
};

const getStatusDisplay = (status: ServiceStatus) => {
    const statusMap: Record<ServiceStatus, { text: string; className: string }> = {
        [ServiceStatus.IN_PROGRESS]: { text: 'Em Andamento', className: 'bg-blue-500 text-white' },
        [ServiceStatus.COMPLETED]: { text: 'Concluído', className: 'bg-green-500 text-white' },
        [ServiceStatus.WAITING_DOCS]: { text: 'Aguardando', className: 'bg-gray-700 text-white' },
        [ServiceStatus.TODO]: { text: 'A Fazer', className: 'bg-gray-400 text-white' },
        [ServiceStatus.CANCELED]: { text: 'Cancelado', className: 'bg-red-500 text-white' },
    };
    return statusMap[status] || { text: status, className: 'bg-gray-200 text-gray-800' };
};

const RecentProcesses: React.FC<{services: Service[], isLoading: boolean}> = ({services, isLoading}) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg h-full">
            <h3 className="text-xl font-bold text-dark-text">Processos Recentes</h3>
            <div className="mt-4 overflow-x-auto">
                {isLoading ? (
                    <div className="text-center p-8 text-gray-500">
                        <LoaderIcon className="w-6 h-6 inline mr-2" /> Carregando processos...
                    </div>
                ) : services.length === 0 ? (
                    <div className="text-center p-8 text-gray-500">Nenhum processo ativo.</div>
                ) : (
                    <table className="w-full text-left min-w-[600px]">
                        <thead>
                            <tr className="border-b">
                                <th className="py-3 pr-3 font-semibold text-medium-text">Cliente</th>
                                <th className="py-3 px-3 font-semibold text-medium-text">Tipo</th>
                                <th className="py-3 px-3 font-semibold text-medium-text">Veículo</th>
                                <th className="py-3 px-3 font-semibold text-medium-text">Status</th>
                                <th className="py-3 pl-3 font-semibold text-medium-text text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.slice(0,5).map((service: Service) => {
                                const statusDisplay = getStatusDisplay(service.status);
                                return (
                                    <tr key={service.id} className="border-b last:border-none">
                                        <td className="py-4 pr-3 font-medium text-dark-text">{service.clientName}</td>
                                        <td className="py-4 px-3 text-medium-text">{service.name}</td>
                                        <td className="py-4 px-3 text-medium-text">{service.vehiclePlate}</td>
                                        <td className="py-4 px-3">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusDisplay.className}`}>
                                                {statusDisplay.text}
                                            </span>
                                        </td>
                                        <td className="py-4 pl-3 font-semibold text-dark-text text-right">{service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const notificationColors: Record<NotificationItem['color'], string> = {
  orange: 'border-orange-400',
  blue: 'border-blue-400',
  green: 'border-green-400',
};

const AlertsAndNotifications: React.FC<{ notifications: NotificationItem[] }> = ({ notifications }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg h-full">
            <h3 className="text-xl font-bold text-dark-text">Alertas e Notificações</h3>
            <div className="mt-4 space-y-4">
                {notifications.map((item: NotificationItem) => (
                    <div key={item.id} className={`p-4 rounded-lg bg-light-bg border-l-4 ${notificationColors[item.color]}`}>
                        <p className="font-semibold text-dark-text">{item.title}</p>
                        <p className="text-sm text-medium-text">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ServicesByClientChart: React.FC<{ services: Service[], isLoading: boolean }> = ({ services, isLoading }) => {
    const servicesByClient = useMemo(() => {
        return services.reduce((acc: Record<string, number>, service: Service) => {
            acc[service.clientName] = (acc[service.clientName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [services]);

    const chartData = useMemo(() => {
        return Object.entries(servicesByClient)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6); // Limit to top 6 clients
    }, [servicesByClient]);

    const COLORS = ['#0D47A1', '#7B76B3', '#FFC107', '#00A8E8', '#2EC4B6', '#1A4355'];
    
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, name }: PieLabelRenderProps) => {
        const sin = Math.sin(-(midAngle as number) * RADIAN);
        const cos = Math.cos(-(midAngle as number) * RADIAN);
        const sx = (cx as number) + ((outerRadius as number) + 5) * cos;
        const sy = (cy as number) + ((outerRadius as number) + 5) * sin;
        const mx = (cx as number) + ((outerRadius as number) + 15) * cos;
        const my = (cy as number) + ((outerRadius as number) + 15) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 12;
        const ey = my;
        const textAnchor = cos >= 0 ? 'start' : 'end';

        return (
            <g>
                <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={"#999"} fill="none" />
                <text x={ex + (cos >= 0 ? 1 : -1) * 4} y={ey} dy={3} textAnchor={textAnchor} fill="#666" fontSize={12}>
                    {name}
                </text>
            </g>
        );
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg h-[350px]">
            <h3 className="text-xl font-bold text-dark-text mb-4">Serviços por Cliente</h3>
            {isLoading ? (
                <div className="text-center p-8 text-gray-500 h-full flex items-center justify-center">
                    <LoaderIcon className="w-6 h-6 inline mr-2" /> Carregando gráfico...
                </div>
            ) : chartData.length === 0 ? (
                <div className="text-center p-8 text-gray-500 h-full flex items-center justify-center">Nenhum serviço para exibir.</div>
            ) : (
                <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={80}
                            dataKey="value"
                            nameKey="name"
                        >
                            {chartData.map((_, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};


const Dashboard: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const [serviceData, clientData] = await Promise.all([fetchServices(), fetchClients()]);
            setServices(serviceData);
            setClients(clientData);
            setIsLoading(false);
        };
        loadData();
    }, []);

    // Recalculate KPIs based on real data
    const activeServices = services.filter(s => s.status === ServiceStatus.IN_PROGRESS || s.status === ServiceStatus.TODO || s.status === ServiceStatus.WAITING_DOCS).length;
    const activeClients = clients.length;
    
    const updatedKpis: DashboardKpiV2[] = useMemo(() => [
        { ...dashboardKpisV2[0], value: String(activeClients) },
        { ...dashboardKpisV2[1], value: String(activeServices) },
        // Revenue and Alerts KPIs remain static for now as they require more complex transaction/vehicle data processing
        dashboardKpisV2[2],
        dashboardKpisV2[3],
    ], [activeClients, activeServices]);


    return (
        <div className="p-6 lg:p-8 bg-light-bg min-h-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {updatedKpis.map((kpi: DashboardKpiV2) => (
                    <KpiCard key={kpi.title} kpi={kpi} />
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <RecentProcesses services={services} isLoading={isLoading} />
                </div>
                
                <div className="space-y-8">
                    <ServicesByClientChart services={services} isLoading={isLoading} />
                    <AlertsAndNotifications notifications={mockNotifications} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;