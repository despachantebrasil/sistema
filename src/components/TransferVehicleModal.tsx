import React from 'react';
import type { Vehicle, Client } from '../types';
import Modal from './ui/Modal';

interface TransferVehicleModalProps {
  vehicle: Vehicle | null;
  clients: Client[];
  onClose: () => void;
  onConfirm: (vehicleId: number, newOwnerId: number) => void;
}

const TransferVehicleModal: React.FC<TransferVehicleModalProps> = ({ vehicle, clients, onClose, onConfirm }) => {
  const [newOwnerId, setNewOwnerId] = React.useState<number | ''>('');

  if (!vehicle) return null;

  const potentialBuyers = clients.filter(c => c.id !== vehicle.ownerId);

  const handleConfirm = () => {
    if (!newOwnerId) {
      alert('Por favor, selecione um comprador.');
      return;
    }
    onConfirm(vehicle.id, Number(newOwnerId));
  };

  return (
    <Modal isOpen={!!vehicle} onClose={onClose} title={`Transferir Veículo ${vehicle.plate}`}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-dark-text mb-2">Detalhes do Veículo</h3>
          <div className="grid grid-cols-2 gap-4 p-4 bg-light-bg rounded-lg border">
            <div>
              <p className="text-sm text-gray-500">Veículo</p>
              <p className="font-semibold">{vehicle.brand} {vehicle.model}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Placa</p>
              <p className="font-semibold">{vehicle.plate}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-dark-text mb-2">Partes da Transferência</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Vendedor (Proprietário Atual)</label>
              <input
                type="text"
                disabled
                value={vehicle.ownerName}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="newOwner" className="block text-sm font-medium text-gray-700">Comprador (Novo Proprietário)</label>
              <select
                id="newOwner"
                value={newOwnerId}
                onChange={(e) => setNewOwnerId(Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required
              >
                <option value="" disabled>Selecione um cliente...</option>
                {potentialBuyers.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Cancelar
          </button>
          <button onClick={handleConfirm} className="btn-scale">
            Confirmar Transferência
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TransferVehicleModal;