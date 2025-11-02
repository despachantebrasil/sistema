import React, { useState, useMemo } from 'react';
import type { Vehicle, Client } from '../types';

interface VehicleTransferModalProps {
    vehicle: Vehicle & { ownerName: string };
    clients: Client[];
    onConfirm: (newOwnerId: number, price: number, dueDate: string, payerId: number) => Promise<void>;
    onCancel: () => void;
}

const VehicleTransferModal: React.FC<VehicleTransferModalProps> = ({ vehicle, clients, onConfirm, onCancel }) => {
    const [newOwnerId, setNewOwnerId] = useState<number | ''>('');
    const [price, setPrice] = useState<string>('');
    const [dueDate, setDueDate] = useState<string>('');
    const [payerId, setPayerId] = useState<number | ''>(vehicle.owner_id);
    const [isLoading, setIsLoading] = useState(false);

    const availableClients = useMemo(() => {
        return clients.filter(c => c.id !== vehicle.owner_id);
    }, [clients, vehicle.owner_id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newOwnerId || !price || !dueDate || !payerId) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        setIsLoading(true);
        try {
            await onConfirm(Number(newOwnerId), parseFloat(price), dueDate, Number(payerId));
        } catch (error) {
            console.error("Erro ao confirmar transferência:", error);
            alert('Não foi possível concluir a transferência.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <h3 className="font-semibold text-lg">{vehicle.brand} {vehicle.model} - {vehicle.plate}</h3>
                <p className="text-sm text-gray-600">Proprietário atual: <span className="font-medium">{vehicle.ownerName}</span></p>
            </div>

            <div className="border-t pt-4">
                <label htmlFor="newOwnerId" className="block text-sm font-medium text-gray-700">Novo Proprietário (Comprador)</label>
                <select
                    id="newOwnerId"
                    value={newOwnerId}
                    onChange={(e) => setNewOwnerId(Number(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    required
                    disabled={isLoading}
                >
                    <option value="" disabled>Selecione o novo proprietário</option>
                    {availableClients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Valor do Serviço (R$)</label>
                    <input
                        type="number"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        required
                        step="0.01"
                        min="0"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Prazo do Serviço</label>
                    <input
                        type="date"
                        id="dueDate"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        required
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Quem pagará pelo serviço?</label>
                <div className="mt-2 flex items-center space-x-4">
                    <label className="flex items-center">
                        <input type="radio" name="payer" value={vehicle.owner_id} checked={payerId === vehicle.owner_id} onChange={() => setPayerId(vehicle.owner_id)} className="h-4 w-4 text-primary focus:ring-primary-dark" />
                        <span className="ml-2 text-sm">Vendedor ({vehicle.ownerName})</span>
                    </label>
                    {newOwnerId && (
                         <label className="flex items-center">
                            <input type="radio" name="payer" value={newOwnerId} checked={payerId === newOwnerId} onChange={() => setPayerId(newOwnerId)} className="h-4 w-4 text-primary focus:ring-primary-dark" />
                            <span className="ml-2 text-sm">Comprador ({clients.find(c => c.id === newOwnerId)?.name})</span>
                        </label>
                    )}
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300" disabled={isLoading}>
                    Cancelar
                </button>
                <button type="submit" className="btn-scale" disabled={isLoading}>
                    {isLoading ? 'Processando...' : 'Confirmar Transferência'}
                </button>
            </div>
        </form>
    );
};

export default VehicleTransferModal;