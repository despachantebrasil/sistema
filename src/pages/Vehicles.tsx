import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import VehicleForm from '../components/VehicleForm';
import VehicleDetailsModal from '../components/VehicleDetailsModal';
import TransferVehicleModal from '../components/TransferVehicleModal';
import { fetchVehicles, saveVehicle, deleteVehicle, fetchClients, subscribeToVehicles, uploadVehicleImage } from '../services/dataService';
import type { Vehicle, AlertStatus, Service, Client } from '../types';
import { ServiceStatus } from '../types';
import { PlusIcon, SwitchHorizontalIcon, LoaderIcon } from '../components/Icons';


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
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [transferringVehicle, setTransferringVehicle] = useState<Vehicle | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        const [vehicleData, clientData] = await Promise.all([fetchVehicles(), fetchClients()]);
        setVehicles(vehicleData);
        setClients(clientData);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();

        // Realtime Subscription
        const subscription = subscribeToVehicles((payload) => {
            console.log('Realtime Vehicle Change:', payload);
            loadData(); // Simple reload for now
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleSaveVehicle = async (vehicleData: Omit<Vehicle, 'id'>, newImageFiles: File[]) => {
        try {
            // 1. Upload new images to Supabase Storage
            const uploadPromises = newImageFiles.map(file => uploadVehicleImage(file, vehicleData.plate));
            const newImageUrls = await Promise.all(uploadPromises);

            // 2. Combine existing URLs (passed from form) with new URLs
            const finalImageUrls = [...(vehicleData.imageUrls || []), ...newImageUrls];

            // 3. Prepare data for DB save
            const { ownerName, ...dataToSave } = vehicleData;
            const dataWithUrls = { ...dataToSave, imageUrls: finalImageUrls };

            const savedVehicle = await saveVehicle(dataWithUrls, selectedVehicle?.id);
            
            setVehicles(prev => [savedVehicle, ...prev.filter(v => v.id !== savedVehicle.id)]);
            setIsFormModalOpen(false);
            setSelectedVehicle(null); // Clear selected vehicle after save/edit
        } catch (error) {
            alert('Erro ao salvar veículo. Verifique o console para detalhes.');
        }
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

    const handleDeleteVehicle = async (vehicleId: number) => {
        if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
            try {
                await deleteVehicle(vehicleId);
                setVehicles(prev => prev.filter(v => v.id !== vehicleId));
            } catch (error) {
                alert('Erro ao excluir veículo.');
            }
        }
    };

    const handleConfirmTransfer = async (vehicleId: number, newOwnerId: number) => {
        const newOwner = clients.find(c => c.id === newOwnerId);
        const vehicle = vehicles.find(v => v.id === vehicleId);

        if (!newOwner || !vehicle) {
            alert('Erro: Comprador ou veículo não encontrado.');
            return;
        }

        try {
            // 1. Update vehicle owner in DB
            const dataToSave: Omit<Vehicle, 'id' | 'ownerName'> = {
                ...vehicle,
                ownerId: newOwner.id,
                imageUrls: vehicle.imageUrls, // Keep existing URLs
            };
            
            const updatedVehicle = await saveVehicle(dataToSave, vehicleId);

            // 2. Update local state
            setVehicles(prevVehicles =>
                prevVehicles.map(v =>
                    v.id === vehicleId
                        ? updatedVehicle
                        : v
                )
            );

            // 3. Create Service and Transaction (using custom events for cross-page communication)
            const newServiceData: Omit<Service, 'id'> = {
                name: 'Transferência de Propriedade',
                clientName: newOwner.name,
                vehiclePlate: vehicle.plate,
                status: ServiceStatus.TODO,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                price: 850.00,
            };
            
            const serviceEvent = new CustomEvent('serviceAdded', { detail: { ...newServiceData, clientId: newOwner.id, vehicleId: vehicle.id } });
            window.dispatchEvent(serviceEvent);

            alert(`Veículo ${vehicle.plate} transferido para ${newOwner.name} com sucesso! Um novo serviço foi criado.`);
            handleCloseTransfer();
        } catch (error) {
            alert('Falha ao realizar a transferência.');
        }
    };

    return (
        <div className="p-4 md:p-8">
            <Card>
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold">Frota de Veículos</h2>
                    <button 
                        onClick={() => {
                            setSelectedVehicle(null); // Ensure we are adding, not editing
                            setIsFormModalOpen(true);
                        }}
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
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-gray-500">
                                        <LoaderIcon className="w-6 h-6 inline mr-2" /> Carregando veículos do Supabase...
                                    </td>
                                </tr>
                            ) : vehicles.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-gray-500">Nenhum veículo cadastrado.</td>
                                </tr>
                            ) : (
                                vehicles.map((vehicle: Vehicle) => (
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
                                            <button onClick={() => handleDeleteVehicle(vehicle.id)} className="text-red-500 hover:underline">Excluir</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <VehicleDetailsModal vehicle={selectedVehicle} onClose={handleCloseDetails} />

            <TransferVehicleModal 
                vehicle={transferringVehicle}
                clients={clients}
                onClose={handleCloseTransfer}
                onConfirm={handleConfirmTransfer}
            />

            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedVehicle ? "Editar Veículo" : "Adicionar Novo Veículo"}>
                <VehicleForm 
                    onSave={handleSaveVehicle}
                    onCancel={() => setIsFormModalOpen(false)}
                    clients={clients}
                    vehicle={selectedVehicle || undefined}
                />
            </Modal>
        </div>
    );
};

export default Vehicles;