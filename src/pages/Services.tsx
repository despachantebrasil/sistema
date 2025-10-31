import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import ServiceForm from '../components/ServiceForm';
import { serviceCatalog } from '../data/mockData';
import { fetchServices, saveService, fetchClients, fetchVehicles, subscribeToServices } from '../services/dataService';
import type { Service, Transaction, Client, Vehicle } from '../types';
import { ServiceStatus, TransactionType, TransactionStatus } from '../types';
import { PlusIcon, LoaderIcon } from '../components/Icons';

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

const Services: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        const [serviceData, clientData, vehicleData] = await Promise.all([
            fetchServices(),
            fetchClients(),
            fetchVehicles()
        ]);
        setServices(serviceData);
        setClients(clientData);
        setVehicles(vehicleData);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();

        // Realtime Subscription
        const subscription = subscribeToServices((payload) => {
            console.log('Realtime Service Change:', payload);
            loadData(); // Simple reload for now
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleAddService = async (newServiceData: Omit<Service, 'id' | 'clientName' | 'vehiclePlate'> & { clientId: number, vehicleId: number }) => {
        try {
            const client = clients.find(c => c.id === newServiceData.clientId);
            const vehicle = vehicles.find(v => v.id === newServiceData.vehicleId);

            if (!client || !vehicle) {
                alert('Erro: Cliente ou veículo não encontrado.');
                return;
            }

            const savedService = await saveService(newServiceData);
            
            // Update local state
            setServices(prev => [savedService, ...prev]);
            setIsModalOpen(false);

            // --- Financial Integration (Dispatching event for Financial page) ---
            const newTransactionData: Omit<Transaction, 'id'> = {
                description: `Serviço: ${savedService.name} - ${savedService.vehiclePlate}`,
                category: 'Receita de Serviço',
                date: new Date().toISOString().split('T')[0],
                amount: savedService.price,
                type: TransactionType.REVENUE,
                status: TransactionStatus.PENDING,
                dueDate: savedService.dueDate,
                serviceId: savedService.id,
                clientId: newServiceData.clientId, // Use clientId from input data
            };
            const event = new CustomEvent('transactionAdded', { detail: newTransactionData });
            window.dispatchEvent(event);

        } catch (error) {
            alert('Erro ao salvar serviço. Verifique o console para detalhes.');
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
                                <th className="p-4 font-semibold">Cliente / Veículo</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Prazo</th>
                                <th className="p-4 font-semibold">Valor</th>
                                <th className="p-4 font-semibold">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-gray-500">
                                        <LoaderIcon className="w-6 h-6 inline mr-2" /> Carregando serviços do Supabase...
                                    </td>
                                </tr>
                            ) : services.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-gray-500">Nenhum serviço cadastrado.</td>
                                </tr>
                            ) : (
                                services.map((service: Service) => (
                                    <tr key={service.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 font-medium">{service.name}</td>
                                        <td className="p-4">
                                            <div>{service.clientName}</div>
                                            <div className="text-sm text-gray-500">{service.vehiclePlate}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(service.status)}`}>
                                                {service.status}
                                            </span>
                                        </td>
                                        <td className="p-4">{new Date(service.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
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
                    onSave={handleAddService} 
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