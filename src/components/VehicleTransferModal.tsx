import React, { useState } from 'react';
import type { Vehicle, Client } from '../types';
import UppercaseInput from './ui/UppercaseInput';

interface VehicleTransferModalProps {
    vehicle: Vehicle & { ownerName: string };
    clients: Client[];
    onConfirm: (
        sellerId: number, // Novo: ID do Vendedor (Cliente que contrata o serviço)
        newOwnerId: number, 
        price: number, 
        dueDate: string, 
        payerId: number, 
        agentName: string,
        detranScheduleTime: string,
        contactPhone: string,
        paymentStatus: 'Pago' | 'Pendente',
        situationNotes: string,
        nextScheduleDate: string // NOVO CAMPO
    ) => Promise<void>;
    onCancel: () => void;
}

const DetailItem: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
    <div className="break-words"> {/* Adicionando break-words para lidar com strings longas como Chassi/RENAVAM */}
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value || '-'}</p>
    </div>
);

const VehicleTransferModal: React.FC<VehicleTransferModalProps> = ({ vehicle, clients, onConfirm, onCancel }) => {
    const [sellerId, setSellerId] = useState<number | ''>(vehicle.owner_id); // Inicializa com o proprietário atual
    const [newOwnerId, setNewOwnerId] = useState<number | ''>('');
    const [price, setPrice] = useState<string>('');
    const [dueDate, setDueDate] = useState<string>('');
    const [payerId, setPayerId] = useState<number | ''>(vehicle.owner_id);
    const [agentName, setAgentName] = useState<string>('');
    
    // Novos campos de rastreamento
    const [detranScheduleDate, setDetranScheduleDate] = useState<string>('');
    const [detranScheduleTime, setDetranScheduleTime] = useState<string>('');
    const [contactPhone, setContactPhone] = useState<string>('');
    const [paymentStatus, setPaymentStatus] = useState<'Pago' | 'Pendente'>('Pendente');
    const [situationNotes, setSituationNotes] = useState<string>('');
    const [nextScheduleDate, setNextScheduleDate] = useState<string>('');
    const [nextScheduleTime, setNextScheduleTime] = useState<string>('');
    
    const [isLoading, setIsLoading] = useState(false);

    const allClients = clients;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sellerId || !newOwnerId || !price || !dueDate || !payerId || !agentName) {
            alert('Por favor, preencha todos os campos obrigatórios (Vendedor, Comprador, Valor, Prazo, Responsável).');
            return;
        }
        if (sellerId === newOwnerId) {
            alert('O Vendedor e o Comprador não podem ser o mesmo cliente.');
            return;
        }
        
        setIsLoading(true);
        try {
            const combinedDetranSchedule = detranScheduleDate ? `${detranScheduleDate} ${detranScheduleTime || ''}`.trim() : '';
            const combinedNextSchedule = nextScheduleDate ? `${nextScheduleDate} ${nextScheduleTime || ''}`.trim() : '';
            
            await onConfirm(
                Number(sellerId),
                Number(newOwnerId), 
                parseFloat(price), 
                dueDate, 
                Number(payerId), 
                agentName,
                combinedDetranSchedule,
                contactPhone,
                paymentStatus,
                situationNotes,
                combinedNextSchedule
            );
        } catch (error) {
            console.error("Erro ao confirmar transferência:", error);
            alert('Não foi possível concluir a transferência.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
    
    const currentOwner = clients.find(c => c.id === vehicle.owner_id)?.name || 'Desconhecido';
    const selectedSellerName = clients.find(c => c.id === sellerId)?.name || 'Selecione um cliente...';
    const selectedNewOwnerName = clients.find(c => c.id === newOwnerId)?.name || 'Selecione um cliente...';

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
            <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-dark-text">{vehicle.brand} {vehicle.model}</h3>
                    <span className="font-mono bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm font-semibold border">{vehicle.plate}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <DetailItem label="Proprietário Atual (Ref.)" value={currentOwner} />
                    <DetailItem label="Ano/Cor" value={`${vehicle.year_manufacture}/${vehicle.year_model} - ${vehicle.color}`} />
                    <DetailItem label="Chassi" value={vehicle.chassis} />
                    <DetailItem label="RENAVAM" value={vehicle.renavam} />
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-semibold text-lg text-gray-800 border-b pb-2">Partes da Transferência</h4>
                
                <div>
                    <label htmlFor="sellerId" className="block text-sm font-medium text-gray-700">Vendedor (Cliente que Contrata o Serviço)</label>
                    <select id="sellerId" value={sellerId} onChange={(e) => setSellerId(Number(e.target.value))} className={inputClasses} required disabled={isLoading}>
                        <option value="" disabled>Selecione um cliente...</option>
                        {allClients.map(client => (
                            <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label htmlFor="newOwnerId" className="block text-sm font-medium text-gray-700">Comprador (Novo Proprietário)</label>
                    <select id="newOwnerId" value={newOwnerId} onChange={(e) => setNewOwnerId(Number(e.target.value))} className={inputClasses} required disabled={isLoading}>
                        <option value="" disabled>Selecione um cliente...</option>
                        {allClients.filter(c => c.id !== sellerId).map(client => (
                            <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label htmlFor="agentName" className="block text-sm font-medium text-gray-700">Responsável pelo Processo (Despachante)</label>
                    <UppercaseInput id="agentName" type="text" value={agentName} onChange={(e) => setAgentName(e.target.value)} required disabled={isLoading} placeholder="Nome do despachante ou empresa" />
                </div>
            </div>

            <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold text-lg text-gray-800 border-b pb-2">Detalhes do Serviço e Agendamento</h4>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Valor do Serviço (R$)</label>
                        <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClasses} required step="0.01" min="0" disabled={isLoading} />
                    </div>
                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Prazo Final do Serviço</label>
                        <input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClasses} required disabled={isLoading} />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Agendamento no DETRAN</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input type="date" value={detranScheduleDate} onChange={(e) => setDetranScheduleDate(e.target.value)} className={inputClasses + ' w-full p-2'} disabled={isLoading} />
                            <input type="time" value={detranScheduleTime} onChange={(e) => setDetranScheduleTime(e.target.value)} className={inputClasses + ' w-full p-2'} disabled={isLoading} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">Contato do Responsável (Telefone ou *)</label>
                        <UppercaseInput type="text" id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Ex: (11) 99999-9999 ou *" disabled={isLoading} />
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Próximo Agendamento</label>
                    <div className="flex items-center gap-2 mt-1">
                        <input type="date" id="nextScheduleDate" value={nextScheduleDate} onChange={(e) => setNextScheduleDate(e.target.value)} className={inputClasses + ' w-full p-2'} disabled={isLoading} />
                        <input type="time" id="nextScheduleTime" value={nextScheduleTime} onChange={(e) => setNextScheduleTime(e.target.value)} className={inputClasses + ' w-full p-2'} disabled={isLoading} />
                    </div>
                </div>
                
                <div>
                    <label htmlFor="situationNotes" className="block text-sm font-medium text-gray-700">Situação Inicial / Pendências</label>
                    <textarea id="situationNotes" value={situationNotes} onChange={(e) => setSituationNotes(e.target.value)} rows={2} className={inputClasses} placeholder="Ex: OK, aguardando vistoria" disabled={isLoading} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quem pagará pelo serviço?</label>
                        <div className="mt-2 flex items-center space-x-4">
                            <label className="flex items-center">
                                <input type="radio" name="payer" value={sellerId} checked={payerId === sellerId} onChange={() => setPayerId(Number(sellerId))} className="h-4 w-4 text-primary focus:ring-primary-dark" disabled={!sellerId} />
                                <span className="ml-2 text-sm">Vendedor ({selectedSellerName})</span>
                            </label>
                            {newOwnerId && (
                                <label className="flex items-center">
                                    <input type="radio" name="payer" value={newOwnerId} checked={payerId === newOwnerId} onChange={() => setPayerId(Number(newOwnerId))} className="h-4 w-4 text-primary focus:ring-primary-dark" />
                                    <span className="ml-2 text-sm">Comprador ({selectedNewOwnerName})</span>
                                </label>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status de Pagamento Inicial</label>
                        <select name="paymentStatus" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as 'Pago' | 'Pendente')} className={inputClasses} disabled={isLoading}>
                            <option value="Pendente">Pendente</option>
                            <option value="Pago">Pago</option>
                        </select>
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