import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import VehicleForm from '../components/VehicleForm';
import VehicleDetailsModal, { PrintableVehicleDetails } from '../components/VehicleDetailsModal'; 
import VehicleDocumentUpload from '../components/VehicleDocumentUpload'; 
import VehicleTransferModal from '../components/VehicleTransferModal'; // Importando o novo modal
import type { Vehicle, AlertStatus, Client, ExtractedVehicleData } from '../types';
import { PlusIcon, LoaderIcon } from '../components/Icons'; // Adicionar ícone de transferência se necessário
import { fetchVehicles, createVehicle, fetchClients, deleteVehicle, transferVehicle } from '../services/supabase'; // Importando a nova função
import { printComponent } from '../utils/printUtils';

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

type VehicleWithOwnerName = Vehicle & { ownerName: string };

const Vehicles: React.FC = () => {
    const [vehicles, setVehicles] = useState<VehicleWithOwnerName[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [vehicleToTransfer, setVehicleToTransfer] = useState<VehicleWithOwnerName | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithOwnerName | null>(null);
    const [loading, setLoading] = useState(true);
    const [prefilledData, setPrefilledData] = useState<ExtractedVehicleData | undefined>(undefined);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [vehicleData, clientData] = await Promise.all([
                fetchVehicles(),
                fetchClients()
            ]);
            setClients(clientData);
            
            const vehiclesWithNames: VehicleWithOwnerName[] = vehicleData.map(v => {
                const owner = clientData.find(c => c.id === v.owner_id);
                return {
                    ...v,
                    ownerName: owner ? owner.name : 'Desconhecido',
                };
            });
            setVehicles(vehiclesWithNames);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            alert('Não foi possível carregar a lista de veículos.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSaveVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'user_id' | 'created_at'>, imageFiles: File[]) => {
        try {
            await createVehicle(vehicleData, imageFiles);
            await loadData();
        } catch (error) {
            throw error;
        }
    };

    const handleDeleteVehicle = async (vehicleId: number, plate: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o veículo de placa "${plate}"?`)) {
            try {
                await deleteVehicle(vehicleId); 
                await loadData();
            } catch (error) {
                console.error('Erro ao excluir veículo:', error);
                alert('Não foi possível excluir o veículo.');
            }
        }
    };

    const handleOpenTransferModal = (vehicle: VehicleWithOwnerName) => {
        setVehicleToTransfer(vehicle);
        setIsTransferModalOpen(true);
    };

    const handleConfirmTransfer = async (newOwnerId: number, price: number, dueDate: string, payerId: number, agentName: string) => {
        if (!vehicleToTransfer) return;
        try {
            await transferVehicle(vehicleToTransfer, newOwnerId, price, dueDate, payerId, agentName);
            setIsTransferModalOpen(false);
            setVehicleToTransfer(null);
            await loadData();
            alert('Veículo transferido com sucesso!');
        } catch (error) {
            throw error;
        }
    };

    const handleOpenDetails = (vehicle: VehicleWithOwnerName) => {
        setSelectedVehicle(vehicle);
    };

    const handleCloseDetails = () => {
        setSelectedVehicle(null);
    };

    const handleDataExtracted = (data: ExtractedVehicleData) => {
        setPrefilledData(data);
        setIsFormModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsFormModalOpen(false);
        setPrefilledData(undefined);
    };

    const handlePrintVehicle = (vehicle: VehicleWithOwnerName) => {
        printComponent(PrintableVehicleDetails, { vehicle });
    };

    return (
        <div className="p-4 md:p-8">
            <Card>
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold">Frota de Veículos</h2>
                    <div className="flex items-center gap-4">
                        <VehicleDocumentUpload 
                            onDataExtracted={handleDataExtracted}
                            onError={(message) => alert(`Erro: ${message}`)}
                        />
                        <button 
                            onClick={() => setIsFormModalOpen(true)}
                            className="flex items-center justify-center btn-hover"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Adicionar Manualmente
                        </button>
                    </div>
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
                                <th className="p-4 font-semibold text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center p-8"><LoaderIcon className="w-6 h-6 inline mr-2" /> Carregando veículos...</td></tr>
                            ) : vehicles.length === 0 ? (
                                <tr><td colSpan={6} className="text-center p-8 text-gray-500">Nenhum veículo cadastrado.</td></tr>
                            ) : (
                                vehicles.map((vehicle) => (
                                    <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4">
                                            <span className="px-3 py-1 bg-gray-200 text-gray-800 font-bold rounded-md border-2 border-gray-300">
                                                {vehicle.plate}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                                            <div className="text-sm text-gray-500">{vehicle.color} ({vehicle.year_manufacture}/{vehicle.year_model})</div>
                                        </td>
                                        <td className="p-4">{vehicle.ownerName}</td>
                                        <td className="p-4 font-mono">{vehicle.renavam}</td>
                                        <td className="p-4">
                                            <ExpirationDate date={vehicle.licensing_expiration_date} />
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center space-x-4">
                                                <button onClick={() => handleOpenDetails(vehicle)} className="text-primary hover:underline font-semibold text-sm">Detalhes</button>
                                                <button onClick={() => handleOpenTransferModal(vehicle)} className="text-green-600 hover:underline font-semibold text-sm">→ Transferir</button>
                                                <button onClick={() => handleDeleteVehicle(vehicle.id, vehicle.plate)} className="text-red-600 hover:underline font-semibold text-sm">Excluir</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <VehicleDetailsModal 
                vehicle={selectedVehicle} 
                onClose={handleCloseDetails}
                onPrint={handlePrintVehicle}
            />

            <Modal isOpen={isFormModalOpen} onClose={handleCloseModal} title="Adicionar Novo Veículo">
                <VehicleForm 
                    onSave={handleSaveVehicle}
                    onCancel={handleCloseModal}
                    clients={clients}
                    prefilledData={prefilledData}
                />
            </Modal>

            {vehicleToTransfer && (
                <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title={`Transferir Veículo ${vehicleToTransfer.plate}`}>
                    <VehicleTransferModal
                        vehicle={vehicleToTransfer}
                        clients={clients}
                        onConfirm={handleConfirmTransfer}
                        onCancel={() => setIsTransferModalOpen(false)}
                    />
                </Modal>
            )}
        </div>
    );
};

export default Vehicles;