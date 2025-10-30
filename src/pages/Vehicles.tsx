import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import VehicleForm from '../components/VehicleForm';
import VehicleDetailsModal from '../components/VehicleDetailsModal';
import TransferVehicleModal from '../components/TransferVehicleModal';
import { mockVehicles, mockClients } from '../data/mockData';
import type { Vehicle, AlertStatus, Service } from '../types';
import { ServiceStatus, TransactionType, TransactionStatus } from '../types';
import { PlusIcon, SwitchHorizontalIcon } from '../components/Icons';


const getAlertStatus = (dateString: string | undefined): AlertStatus => {
  if (!dateString) return 'ok';
  const today = new Date();
  const expirationDate = new Date(dateString + 'T00:00:00');
  today.setHours(0, 0, 0, 0);

  if (expirationDate < today) {
    return 'expired';
  }

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  if (expirationDate <= thirtyDaysFromNow) {
    return 'expiring_soon';
  }

  return 'ok';
};

const ExpirationDate: React.FC<{ date?: string }> = ({ date }) => {
    if (!date) {
        return <span className="text-gray-400">-</span>;
    }

    const status = getAlertStatus(date);
    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');

    let textColor = 'text-gray-600';
    if (status === 'expired') {
        textColor = 'text-red-600 font-bold';
    } else if (status === 'expiring_soon') {
        textColor = 'text-orange-500 font-semibold';
    }

    return <span className={textColor}>{formattedDate}</span>;
}

const Vehicles: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [transferringVehicle, setTransferringVehicle] = useState<Vehicle | null>(null);

    const handleSaveVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
        const newVehicle: Vehicle = {
            id: vehicles.length > 0 ? Math.max(...vehicles.map((v: Vehicle) => v.id)) + 1 : 1,
            ...vehicleData,
        };
        setVehicles([newVehicle, ...vehicles]);
        setIsFormModalOpen(false);
    };

    const handleOpenDetails = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
    };

    const handleCloseDetails = () => {
        setSelectedVehicle(null);
    };

    const handleOpenTransfer = (vehicle: Vehicle) => {
        setTransferringVehicle(vehicle);
    };

    const handleCloseTransfer = () => {
        setTransferringVehicle(null);
    };

    const handleConfirmTransfer = (vehicleId: number, newOwnerId: number) => {
        const newOwner = mockClients.find(c => c.id === newOwnerId);
        if (!newOwner) {
            alert('Erro: Comprador não encontrado.');
            return;
        }

        setVehicles(prevVehicles =>
            prevVehicles.map(v =>
                v.id === vehicleId
                    ? { ...v, ownerId: newOwner.id, ownerName: newOwner.name }
                    : v
            )
        );

        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
            const newServiceData: Omit<Service, 'id'> = {
                name: 'Transferência de Propriedade',
                clientName: newOwner.name,
                vehiclePlate: vehicle.plate,
                status: ServiceStatus.TODO,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                price: 850.00,
            };
            
            const serviceEvent = new CustomEvent('serviceAdded', { detail: newServiceData });
            window.dispatchEvent(serviceEvent);

            const transactionEvent = new CustomEvent('transactionAdded', { detail: {
                description: `Serviço: Transferência - ${vehicle.plate}`,
                category: 'Receita de Serviço',
                date: new Date().toISOString().split('T')[0],
                amount: newServiceData.price,
                type: TransactionType.REVENUE,
                status: TransactionStatus.PENDING,
                dueDate: newServiceData.dueDate,
                serviceId: Math.random(),
                clientId: newOwner.id,
            }});
            window.dispatchEvent(transactionEvent);
        }

        alert(`Veículo ${vehicle?.plate} transferido para ${newOwner.name} com sucesso! Um novo serviço foi criado.`);
        handleCloseTransfer();
    };

    return (
        <div className="p-4 md:p-8">
            <Card>
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold">Frota de Veículos</h2>
                    <button 
                        onClick={() => setIsFormModalOpen(true)}
                        className="flex items-center justify-center btn-hover"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Adicionar Veículo
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="p-4 font-semibold">Placa</th>
                                <th className="p-4 font-semibold">Veículo</th>
                                <th className="p-4 font-semibold">Proprietário</th>
                                <th className="p-4 font-semibold">RENAVAM</th>
                                <th className="p-4 font-semibold">Venc. Licenc.</th>
                                <th className="p-4 font-semibold">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((vehicle: Vehicle) => (
                                <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">
                                        <span className="px-3 py-1 bg-gray-200 text-gray-800 font-bold rounded-md border-2 border-gray-300">
                                            {vehicle.plate}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                                        <div className="text-sm text-gray-500">{vehicle.color} ({vehicle.yearManufacture}/{vehicle.yearModel})</div>
                                    </td>
                                    <td className="p-4">{vehicle.ownerName}</td>
                                    <td className="p-4 font-mono">{vehicle.renavam}</td>
                                    <td className="p-4">
                                        <ExpirationDate date={vehicle.licensingExpirationDate} />
                                    </td>
                                    <td className="p-4 space-x-2 flex items-center">
                                        <button onClick={() => handleOpenDetails(vehicle)} className="text-primary hover:underline">Detalhes</button>
                                        <button onClick={() => handleOpenTransfer(vehicle)} className="text-green-600 hover:underline flex items-center">
                                            <SwitchHorizontalIcon className="w-4 h-4 mr-1" />
                                            Transferir
                                        </button>
                                        <button className="text-red-500 hover:underline">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <VehicleDetailsModal vehicle={selectedVehicle} onClose={handleCloseDetails} />

            <TransferVehicleModal 
                vehicle={transferringVehicle}
                clients={mockClients}
                onClose={handleCloseTransfer}
                onConfirm={handleConfirmTransfer}
            />

            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title="Adicionar Novo Veículo">
                <VehicleForm 
                    onSave={handleSaveVehicle}
                    onCancel={() => setIsFormModalOpen(false)}
                    clients={mockClients}
                />
            </Modal>
        </div>
    );
};

export default Vehicles;