import React, { useState, useMemo } from 'react';
import type { Vehicle, Client } from '../types';
import UppercaseInput from './ui/UppercaseInput';

interface VehicleTransferModalProps {
    vehicle: Vehicle & { ownerName: string };
    clients: Client[];
    onConfirm: (newOwnerId: number, price: number, dueDate: string, payerId: number, agentName: string) => Promise<void>;
    onCancel: () => void;
}

const DetailItem: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value || '-'}</p>
    </div>
);

const VehicleTransferModal: React.FC<VehicleTransferModalProps> = ({ vehicle, clients, onConfirm, onCancel }) => {
    const [newOwnerId, setNewOwnerId] = useState<number | ''>('');
    const [price, setPrice] = useState<string>('');
    const [dueDate, setDueDate] = useState<string>('');
    const [payerId, setPayerId] = useState<number | ''>(vehicle.owner_id);
    const [agentName, setAgentName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const availableClients = useMemo(() => {
        return clients.filter(c => c.id !== vehicle.owner_id);
    }, [clients, vehicle.owner_id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newOwnerId || !price || !dueDate || !payerId || !agentName) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        setIsLoading(true);
        try {
            await onConfirm(Number(newOwnerId), parseFloat(price), dueDate, Number(payerId), agentName);
        } catch (error) {
            console.error("Erro ao confirmar transferência:", error);
            alert('Não foi possível concluir a transferência.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
    const disabledInputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-dark-text">{vehicle.brand} {vehicle.model}</h3>
                    <span className="font-mono bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm font-semibold border">{vehicle.plate}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <DetailItem label="Ano" value={`${vehicle.year_manufacture}/${vehicle.year_model}`} />
                    <DetailItem label="Cor" value={vehicle.color} />
                    <DetailItem label="RENAVAM" value={vehicle.renavam} />
                    <DetailItem label="Chassi" value={vehicle.chassis} />
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-semibold text-lg text-gray-800 border-b pb-2">Partes da Transferência</h4>
                <div>
                    <label htmlFor="seller" className="block text-sm font-medium text-gray-700">Vendedor (Proprietário Atual)</label>
                    <input id="seller" type="text" disabled value={vehicle.ownerName} className={disabledInputClasses} />
                </div>
                <div>
                    <label htmlFor="newOwnerId" className="block text-sm font-medium text-gray-700">Comprador (Novo Proprietário)</label>
                    <select id="newOwnerId" value={newOwnerId} onChange={(e) => setNewOwnerId(Number(e.target.value))} className={inputClasses} required disabled={isLoading}>
                        <option value="" disabled>Selecione um cliente...</option>
                        {availableClients.map(client => (
                            <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="agentName" className="block text-sm font-medium text-gray-700">Responsável pela Transferência (Despachante)</label>
                    <UppercaseInput id="agentName" type="text" value={agentName} onChange={(e) => setAgentName(e.target.value)} required disabled={isLoading} placeholder="Nome do despachante ou empresa" />
                </div>
            </div>

            <div className="space-y-4 border-t pt-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Valor do Serviço (R$)</label>
                        <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClasses} required step="0.01" min="0" disabled={isLoading} />
                    </div>
                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Prazo do Serviço</label>
                        <input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClasses} required disabled={isLoading} />
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
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold" disabled={isLoading}>
                    Cancelar
                </button>
                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold" disabled={isLoading}>
                    {isLoading ? 'Processando...' : 'Confirmar Transferência'}
                </button>
            </div>
        </form>
    );
};

export default VehicleTransferModal;