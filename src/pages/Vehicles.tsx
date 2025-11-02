import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import VehicleForm from '../components/VehicleForm';
import VehicleDetailsModal from '../components/VehicleDetailsModal';
import { mockVehicles, mockClients } from '../data/mockData';
import type { Vehicle, AlertStatus } from '../types';
import { PlusIcon } from '../components/Icons';


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
                                    <td className="p-4 space-x-2">
                                        <button onClick={() => handleOpenDetails(vehicle)} className="text-primary hover:underline">Detalhes</button>
                                        <button className="text-red-500 hover:underline">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <VehicleDetailsModal vehicle={selectedVehicle} onClose={handleCloseDetails} />

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