import React from 'react';
import type { Vehicle } from '../types';
import Modal from './ui/Modal';

// Estendendo o tipo Vehicle para incluir ownerName, que é adicionado em Vehicles.tsx
interface VehicleWithDetails extends Vehicle {
    ownerName?: string;
}

interface VehicleDetailsModalProps {
  vehicle: VehicleWithDetails | null;
  onClose: () => void;
}

interface DetailItemProps {
  label: string;
  value: string | number | undefined;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-semibold text-dark-text">{value || '-'}</p>
  </div>
);

const VehicleDetailsModal: React.FC<VehicleDetailsModalProps> = ({ vehicle, onClose }) => {
  if (!vehicle) return null;

  return (
    <Modal isOpen={!!vehicle} onClose={onClose} title="Detalhes do Veículo">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-light-bg rounded-lg border">
          <DetailItem label="Placa" value={vehicle.plate} />
          <DetailItem label="Marca" value={vehicle.brand} />
          <DetailItem label="Modelo" value={vehicle.model} />
          <DetailItem label="Ano Fabricação" value={vehicle.year_manufacture} />
          <DetailItem label="Ano Modelo" value={vehicle.year_model} />
          <DetailItem label="Cor" value={vehicle.color} />
          <DetailItem label="Combustível" value={vehicle.fuel_type} />
          <DetailItem label="Proprietário" value={vehicle.ownerName} />
          <DetailItem label="Chassi" value={vehicle.chassis} />
          <DetailItem label="RENAVAM" value={vehicle.renavam} />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-dark-text mb-3">Fotos</h3>
          {vehicle.image_urls && vehicle.image_urls.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {vehicle.image_urls.map((url: string, index: number) => (
                <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="block group">
                    <img 
                        src={url} 
                        alt={`Veículo ${vehicle.plate} - Foto ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-lg shadow-md group-hover:opacity-80 transition-opacity border" 
                    />
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-light-bg rounded-lg">
                <p className="text-gray-500">Nenhuma foto cadastrada para este veículo.</p>
            </div>
          )}
        </div>

         <div className="flex justify-end pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                Fechar
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default VehicleDetailsModal;