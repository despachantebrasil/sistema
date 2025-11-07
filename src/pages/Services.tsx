import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import ServiceForm from '../components/ServiceForm';
import ServiceDetailsModal from '../components/ServiceDetailsModal'; // Novo import
import { serviceCatalog } from '../data/mockData';
import type { Service, Client, Vehicle, Transaction } from '../types';
import { ServiceStatus, TransactionType, TransactionStatus } from '../types';
import { PlusIcon, LoaderIcon, MoreVerticalIcon, EditIcon, TrashIcon } from '../components/Icons';
import { fetchServices, createService, fetchClients, fetchVehicles, createTransaction, deleteService } from '../services/supabase';

const getStatusBadge = (status: ServiceStatus) => {
    let className = 'bg-gray-100 text-gray-800';
    switch (status) {
        case ServiceStatus.COMPLETED: className = 'bg-green-100 text-green-800'; break;
        case ServiceStatus.IN_PROGRESS: className = 'bg-blue-100 text-blue-800'; break;
        case ServiceStatus.WAITING_DOCS: className = 'bg-yellow-100 text-yellow-800'; break;
        case ServiceStatus.CANCELED: className = 'bg-red-100 text-red-800'; break;
        case ServiceStatus.TODO: className = 'bg-gray-200 text-gray-800'; break;
    }
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${className}`}>{status}</span>;
};

// Definindo o tipo de serviço com detalhes do cliente/veículo para a tabela
type ServiceWithDetails = Service & { clientName: string; vehiclePlate: string };

const Services: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<ServiceWithDetails | null>(null); // Estado para detalhes/edição
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
            
            return {
                ...service, 
                clientName: client?.name || 'Cliente Desconhecido',
                vehiclePlate: vehicle?.plate || 'Veículo Desconhecido',
            } as ServiceWithDetails;
        });
    }, [services, clientMap, vehicleMap]);

    const handleOpenDetailsModal = (service: ServiceWithDetails) => {
        setSelectedService(service);
    };

    const handleCloseDetailsModal = () => {
        setSelectedService(null);
    };

    const handleAddService = async (newServiceData: Omit<Service, 'id' | 'user_id' | 'created_at' | 'status'>) => {
        try {
            // 1. Cria o Serviço no DB
            const servicePayload: Omit<Service, 'id' | 'user_id' | 'created_at'> = {
                ...newServiceData,
                status: ServiceStatus.TODO, 
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
            setIsFormModalOpen(false);
        } catch (error) {
            throw error;
        }
    };
    
    const handleDeleteService = async (serviceId: number, serviceName: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o serviço "${serviceName}"? Esta ação é irreversível.`)) {
            try {
                await deleteService(serviceId);
                await loadData();
            } catch (error) {
                console.error('Erro ao excluir serviço:', error);
                alert('Não foi possível excluir o serviço.');
            }
        }
    };

    return (
        <div className="p-4 md:p-8">
            <Card>
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold">Lista de Serviços</h2>
                    <button 
                        onClick={() => setIsFormModalOpen(true)}
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
                                <th className="p-4 font-semibold text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center p-8"><LoaderIcon className="w-6 h-6 inline mr-2" /> Carregando serviços...</td></tr>
                            ) : servicesWithDetails.length === 0 ? (
                                <tr><td colSpan={6} className="text-center p-8 text-gray-500">Nenhum serviço cadastrado.</td></tr>
                            ) : (
                                servicesWithDetails.map((service) => (
                                    <tr key={service.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleOpenDetailsModal(service)}>
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
                                            {getStatusBadge(service.status)}
                                        </td>
                                        <td className="p-4">{new Date(service.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                        <td className="p-4 font-medium">{service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                        <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                            <div className="relative inline-block">
                                                <button className="p-2 hover:bg-gray-200 rounded-full group">
                                                    <MoreVerticalIcon className="w-5 h-5 text-gray-600" />
                                                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-xl z-10 hidden group-focus-within:block">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleOpenDetailsModal(service); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                            <EditIcon className="w-4 h-4 mr-2" /> Detalhes/Editar
                                                        </a>
                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleDeleteService(service.id, service.name); }} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                                                            <TrashIcon className="w-4 h-4 mr-2" /> Excluir
                                                        </a>
                                                    </div>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title="Adicionar Novo Serviço">
                <ServiceForm 
                    onSave={handleAddService as (service: any) => Promise<void>} 
                    onCancel={() => setIsFormModalOpen(false)}
                    clients={clients}
                    vehicles={vehicles}
                    serviceCatalog={serviceCatalog}
                />
            </Modal>
            
            <ServiceDetailsModal
                service={selectedService}
                clients={clients}
                vehicles={vehicles}
                onClose={handleCloseDetailsModal}
                onUpdate={loadData}
            />
        </div>
    );
};

export default Services;