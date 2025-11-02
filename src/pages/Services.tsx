import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import ServiceForm from '../components/ServiceForm';
import { serviceCatalog } from '../data/mockData';
import type { Service, Client, Vehicle, Transaction } from '../types';
import { ServiceStatus, TransactionType, TransactionStatus } from '../types';
import { PlusIcon, LoaderIcon } from '../components/Icons';
import { fetchServices, createService, fetchClients, fetchVehicles, createTransaction } from '../services/supabase';

const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
        case ServiceStatus.COMPLETED:
            return 'bg-green-100 text-green-800';
        case ServiceStatus.IN_PROGRESS:
            return 'bg-blue-100 text-blue-800';
        case ServiceStatus.WAITING_DOCS:
            return 'bg-yellow-100 text-yellow-800';
        case ServiceStatus.TODO:
            return 'bg-gray-200 text-gray-800';
        case ServiceStatus.CANCELED:
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

// Definindo o tipo de serviço com detalhes do cliente/veículo para a tabela
type ServiceWithDetails = Service & { clientName: string; vehiclePlate: string };

const Services: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c])), [clients]);
    const vehicleMap = useMemo(() => new Map(vehicles.map(v => [v.id, v])), [vehicles]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [serviceData, clientData, vehicleData] = await Promise.all([
                fetchServices(),
                fetchClients(),
                fetchVehicles()
            ]);
            setClients(clientData);
            setVehicles(vehicleData);
            setServices(serviceData);
        } catch (error) {
            console.error('Erro ao carregar dados de serviços:', error);
            alert('Não foi possível carregar a lista de serviços.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const servicesWithDetails: ServiceWithDetails[] = useMemo(() => {
        return services.map(service => {
            const client = clientMap.get(service.client_id || 0);
            const vehicle = vehicleMap.get(service.vehicle_id || 0);
            
            // Mapeamento de snake_case para camelCase para o componente
            return {
                ...service, // Inclui todas as propriedades snake_case do Supabase
                clientName: client?.name || 'Cliente Desconhecido',
                vehiclePlate: vehicle?.plate || 'Veículo Desconhecido',
            } as ServiceWithDetails;
        });
    }, [services, clientMap, vehicleMap]);

    // O tipo de dado recebido do formulário é ServiceFormPayload (snake_case)
    const handleAddService = async (newServiceData: Omit<Service, 'id' | 'user_id' | 'created_at'>) => {
        try {
            // 1. Cria o Serviço no DB
            // O payload já está no formato snake_case esperado pelo createService
            const servicePayload: Omit<Service, 'id' | 'user_id' | 'created_at'> = {
                name: newServiceData.name,
                client_id: newServiceData.client_id,
                vehicle_id: newServiceData.vehicle_id,
                price: newServiceData.price,
                due_date: newServiceData.due_date,
                payer_client_id: newServiceData.payer_client_id,
                payer_client_name: newServiceData.payer_client_name,
                status: ServiceStatus.TODO, // Adicionado status, que é obrigatório
            };
            const savedService = await createService(servicePayload);

            // 2. Cria a Transação Financeira
            const transactionClientId = savedService.payer_client_id || savedService.client_id;
            
            const newTransactionData: Omit<Transaction, 'id' | 'user_id' | 'created_at'> = {
                description: `Serviço: ${savedService.name} - ${vehicleMap.get(savedService.vehicle_id || 0)?.plate || 'N/A'}`,
                category: 'Receita de Serviço',
                transaction_date: new Date().toISOString().split('T')[0],
                amount: savedService.price,
                type: TransactionType.REVENUE,
                status: TransactionStatus.PENDING,
                due_date: savedService.due_date,
                service_id: savedService.id,
                client_id: transactionClientId,
            };
            await createTransaction(newTransactionData);
            
            await loadData(); // Recarrega a lista após salvar
            setIsModalOpen(false);
        } catch (error) {
            throw error;
        }
    };

    return (
        <div className="p-4 md:p-8">
            <Card>
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold">Lista de Serviços</h2>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center btn-hover"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Novo Serviço
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="p-4 font-semibold">Serviço</th>
                                <th className="p-4 font-semibold">Cliente / Pagador</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Prazo</th>
                                <th className="p-4 font-semibold">Valor</th>
                                <th className="p-4 font-semibold">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center p-8"><LoaderIcon className="w-6 h-6 inline mr-2" /> Carregando serviços...</td></tr>
                            ) : servicesWithDetails.length === 0 ? (
                                <tr><td colSpan={6} className="text-center p-8 text-gray-500">Nenhum serviço cadastrado.</td></tr>
                            ) : (
                                servicesWithDetails.map((service) => (
                                    <tr key={service.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 font-medium">{service.name}</td>
                                        <td className="p-4">
                                            <div>{service.clientName}</div>
                                            <div className="text-sm text-gray-500">{service.vehiclePlate}</div>
                                            {service.payer_client_name && service.payer_client_name !== service.clientName && (
                                                <div className="text-xs text-blue-600 font-semibold mt-1">
                                                    Pagador: {service.payer_client_name}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(service.status)}`}>
                                                {service.status}
                                            </span>
                                        </td>
                                        <td className="p-4">{new Date(service.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                        <td className="p-4 font-medium">{service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                        <td className="p-4 space-x-2">
                                            <button className="text-primary hover:underline">Ver</button>
                                            <button className="text-red-500 hover:underline">Cancelar</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Novo Serviço">
                <ServiceForm 
                    onSave={handleAddService as (service: any) => Promise<void>} 
                    onCancel={() => setIsModalOpen(false)}
                    clients={clients}
                    vehicles={vehicles}
                    serviceCatalog={serviceCatalog}
                />
            </Modal>
        </div>
    );
};

export default Services;