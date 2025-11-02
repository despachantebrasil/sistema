import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import { mockServices, mockClients } from '../data/mockData';
import type { Service } from '../types';
import { ServiceStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReportFilters {
    startDate: string;
    endDate: string;
    status: 'all' | ServiceStatus;
    clientId: 'all' | number;
}

const ReportKpiCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
        <p className="text-sm text-medium-text">{title}</p>
        <p className="text-2xl font-bold text-dark-text">{value}</p>
    </div>
);

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const Reports: React.FC = () => {
    const [filters, setFilters] = useState<ReportFilters>({
        startDate: '',
        endDate: new Date().toISOString().split('T')[0],
        status: 'all',
        clientId: 'all',
    });
    const [reportData, setReportData] = useState<Service[] | null>(null);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const handleGenerateReport = () => {
        let filteredServices = mockServices;

        if (filters.startDate) {
            filteredServices = filteredServices.filter(s => new Date(s.dueDate) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            filteredServices = filteredServices.filter(s => new Date(s.dueDate) <= new Date(filters.endDate + 'T23:59:59'));
        }
        if (filters.status !== 'all') {
            filteredServices = filteredServices.filter(s => s.status === filters.status);
        }
        if (filters.clientId !== 'all') {
            const client = mockClients.find(c => c.id === Number(filters.clientId));
            if (client) {
                filteredServices = filteredServices.filter(s => s.clientName === client.name);
            }
        }
        setReportData(filteredServices);
    };
    
    const reportSummary = useMemo(() => {
        if (!reportData) return { totalServices: 0, totalRevenue: 0, averageTicket: 0 };
        const totalRevenue = reportData.reduce((sum, service) => sum + service.price, 0);
        const totalServices = reportData.length;
        const averageTicket = totalServices > 0 ? totalRevenue / totalServices : 0;
        return { totalServices, totalRevenue, averageTicket };
    }, [reportData]);
    
    const chartData = useMemo(() => {
        if (!reportData) return [];
         const monthlyData = reportData.reduce((acc, s) => {
            const month = new Date(s.dueDate).toLocaleString('pt-BR', { year: '2-digit', month: 'short' });
            if (!acc[month]) acc[month] = { name: month, Serviços: 0 };
            acc[month].Serviços += 1;
            return acc;
        }, {} as Record<string, { name: string; Serviços: number }>);
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
                            {mockClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={handleGenerateReport} className="btn-hover">Gerar Relatório</button>
                    {reportData && <button onClick={handlePrint} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Imprimir</button>}
                </div>
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
                            <ReportKpiCard title="Faturamento Total" value={formatCurrency(reportSummary.totalRevenue)} />
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
                                                <td className="p-3">{new Date(service.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
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