import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Card from '../components/ui/Card';
import { fetchServices, fetchClients } from '../services/supabase';
import type { Service, Client } from '../types';
import { ServiceStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LoaderIcon } from '../components/Icons'; // Corrigido o import

interface ReportFilters {
    startDate: string;
    endDate: string;
    status: 'all' | ServiceStatus;
    clientId: 'all' | number;
}

// Definindo o tipo de serviço com detalhes do cliente/veículo para o relatório
type ServiceReportItem = Service & { clientName: string; vehiclePlate: string };

const ReportKpiCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
        <p className="text-sm text-medium-text">{title}</p>
        <p className="text-2xl font-bold text-dark-text">{value}</p>
    </div>
);

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const Reports: React.FC = () => {
    const [allServices, setAllServices] = useState<Service[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const [filters, setFilters] = useState<ReportFilters>({
        startDate: '',
        endDate: new Date().toISOString().split('T')[0],
        status: 'all',
        clientId: 'all',
    });
    const [reportData, setReportData] = useState<ServiceReportItem[] | null>(null);

    const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c])), [clients]);

    const loadInitialData = useCallback(async () => {
        setLoadingData(true);
        try {
            const [serviceData, clientData] = await Promise.all([
                fetchServices(),
                fetchClients()
            ]);
            setAllServices(serviceData);
            setClients(clientData);
        } catch (error) {
            console.error('Erro ao carregar dados iniciais para relatórios:', error);
            alert('Não foi possível carregar os dados de base.');
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: name === 'clientId' ? (value === 'all' ? 'all' : Number(value)) : value }));
    };
    
    const handleGenerateReport = () => {
        setIsGenerating(true);
        let filteredServices = allServices;

        if (filters.startDate) {
            filteredServices = filteredServices.filter(s => new Date(s.due_date) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            filteredServices = filteredServices.filter(s => new Date(s.due_date) <= new Date(filters.endDate + 'T23:59:59'));
        }
        if (filters.status !== 'all') {
            filteredServices = filteredServices.filter(s => s.status === filters.status);
        }
        if (filters.clientId !== 'all') {
            filteredServices = filteredServices.filter(s => s.client_id === filters.clientId);
        }
        
        // Add client name and vehicle plate for display
        const finalReportData: ServiceReportItem[] = filteredServices.map(s => ({
            ...s,
            clientName: clientMap.get(s.client_id || 0)?.name || 'Desconhecido',
            vehiclePlate: 'N/A' // Vehicle data not fetched here for simplicity
        }));

        setReportData(finalReportData);
        setIsGenerating(false);
    };
    
    const reportSummary = useMemo(() => {
        if (!reportData) return { totalServices: 0, totalRevenue: 0, averageTicket: 0 };
        const completedRevenue = reportData
            .filter(s => s.status === ServiceStatus.COMPLETED)
            .reduce((sum, service) => sum + service.price, 0);
            
        const totalServices = reportData.length;
        const averageTicket = totalServices > 0 ? completedRevenue / totalServices : 0;
        return { totalServices, totalRevenue: completedRevenue, averageTicket };
    }, [reportData]);
    
    const chartData = useMemo(() => {
        if (!reportData) return [];
         const monthlyData = reportData.reduce((acc, s) => {
            const date = new Date(s.due_date);
            const month = date.toLocaleString('pt-BR', { year: '2-digit', month: 'short' });
            if (!acc[month]) acc[month] = { name: month, Serviços: 0 };
            acc[month].Serviços += 1;
            return acc;
        }, {} as Record<string, { name: string; Serviços: number }>);
        
        // Simple sorting by month name (not perfect for year changes, but functional)
        return Object.values(monthlyData).sort((a: { name: string }, b: { name: string }) => {
            const [m1, y1] = a.name.split('/');
            const [m2, y2] = b.name.split('/');
            return new Date(`01/${m1}/${y1}`).getTime() - new Date(`01/${m2}/${y2}`).getTime();
        });
    }, [reportData]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-4 md:p-8 space-y-8">
            <Card className="no-print">
                <h2 className="text-xl font-bold mb-4">Gerador de Relatórios de Serviços</h2>
                {loadingData ? (
                    <div className="text-center p-4"><LoaderIcon className="w-5 h-5 inline mr-2" /> Carregando dados de filtro...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data de Início</label>
                                <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data de Fim</label>
                                <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                                <select name="status" id="status" value={filters.status} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                    <option value="all">Todos</option>
                                    {Object.values(ServiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">Cliente</label>
                                <select name="clientId" id="clientId" value={filters.clientId} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                    <option value="all">Todos</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button onClick={handleGenerateReport} className="btn-hover" disabled={isGenerating}>
                                {isGenerating ? 'Gerando...' : 'Gerar Relatório'}
                            </button>
                            {reportData && <button onClick={handlePrint} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Imprimir</button>}
                        </div>
                    </>
                )}
            </Card>

            {reportData ? (
                <div id="report-content">
                    <Card className="printable-card">
                         <div className="mb-8">
                            <h2 className="text-2xl font-bold">Relatório de Serviços</h2>
                            <p className="text-medium-text">Período: {filters.startDate ? new Date(filters.startDate+'T00:00:00').toLocaleDateString('pt-BR') : 'Início'} até {new Date(filters.endDate+'T23:59:59').toLocaleDateString('pt-BR')}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <ReportKpiCard title="Total de Serviços" value={String(reportSummary.totalServices)} />
                            <ReportKpiCard title="Faturamento (Concluído)" value={formatCurrency(reportSummary.totalRevenue)} />
                            <ReportKpiCard title="Ticket Médio" value={formatCurrency(reportSummary.averageTicket)} />
                        </div>
                        
                        {chartData.length > 0 && (
                            <div className="mb-8">
                               <h3 className="text-xl font-bold mb-4">Serviços por Mês</h3>
                               <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="Serviços" fill="#0D47A1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                               </ResponsiveContainer>
                            </div>
                        )}

                        <div>
                             <h3 className="text-xl font-bold mb-4">Detalhes dos Serviços</h3>
                             <div className="overflow-x-auto">
                                <table className="w-full text-left printable-table min-w-[700px]">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="p-3 font-semibold">Serviço</th>
                                            <th className="p-3 font-semibold">Cliente</th>
                                            <th className="p-3 font-semibold">Veículo</th>
                                            <th className="p-3 font-semibold">Status</th>
                                            <th className="p-3 font-semibold">Prazo</th>
                                            <th className="p-3 font-semibold">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.map((service) => (
                                            <tr key={service.id} className="border-b">
                                                <td className="p-3">{service.name}</td>
                                                <td className="p-3">{service.clientName}</td>
                                                <td className="p-3">{service.vehiclePlate}</td>
                                                <td className="p-3">{service.status}</td>
                                                <td className="p-3">{new Date(service.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                                <td className="p-3">{formatCurrency(service.price)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    </Card>
                </div>
            ) : (
                <Card>
                    <div className="text-center py-16">
                        <h3 className="text-lg font-semibold text-medium-text">Selecione os filtros acima para gerar um relatório.</h3>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Reports;