import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import VehicleForm from '../components/VehicleForm';
import VehicleDetailsModal from '../components/VehicleDetailsModal';
import VehicleDocumentUpload from '../components/VehicleDocumentUpload'; // Importando o novo componente
import type { Vehicle, AlertStatus, Client, ExtractedVehicleData } from '../types';
import { PlusIcon, LoaderIcon, EditIcon } from '../components/Icons';
import { fetchVehicles, createVehicle, fetchClients, deleteVehicle } from '../services/supabase';

// Helper function to determine alert status (kept local as it's UI logic)
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

// Definindo o tipo Vehicle com o nome do proprietário para uso na tabela
type VehicleWithOwnerName = Vehicle & { ownerName: string };

const Vehicles: React.FC = () => {
    const [vehicles, setVehicles] = useState<VehicleWithOwnerName[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
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
            
            // Map vehicles to include ownerName for display purposes
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

    const handleOpenDetails = (vehicle: VehicleWithOwnerName) => {
        setSelectedVehicle(vehicle);
    };

    const handleCloseDetails = () => {
        setSelectedVehicle(null);
    };

    const handleDataExtracted = (data: ExtractedVehicleData) => {
        console.log("Dados recebidos na página:", data);
        setPrefilledData(data);
        setIsFormModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsFormModalOpen(false);
        setPrefilledData(undefined); // Limpa os dados pré-preenchidos ao fechar
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
                                <th className="p-4 font-semibold">Ações</th>
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
                                        <td className="p-4 space-x-2">
                                            <button onClick={() => handleOpenDetails(vehicle)} className="text-primary hover:underline">Detalhes</button>
                                            <button onClick={() => handleDeleteVehicle(vehicle.id, vehicle.plate)} className="text-red-500 hover:underline">Excluir</button>
                                            <button className="text-gray-500 hover:text-primary p-1"><EditIcon className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <VehicleDetailsModal vehicle={selectedVehicle} onClose={handleCloseDetails} />

            <Modal isOpen={isFormModalOpen} onClose={handleCloseModal} title="Adicionar Novo Veículo">
                <VehicleForm 
                    onSave={handleSaveVehicle}
                    onCancel={handleCloseModal}
                    clients={clients}
                    prefilledData={prefilledData} // Passando os dados para o formulário
                />
            </Modal>
        </div>
    );
};

export default Vehicles;