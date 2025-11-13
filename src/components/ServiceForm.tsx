import React, { useState, useMemo } from 'react';
import type { Service, Client, Vehicle, ServiceCategory } from '../types';
import UppercaseInput from './ui/UppercaseInput';

interface ServiceFormProps {
    onSave: (service: Omit<Service, 'id' | 'user_id' | 'status' | 'created_at'>) => Promise<void>;
    onCancel: () => void;
    clients: Client[];
    vehicles: Vehicle[];
    serviceCatalog: ServiceCategory[];
}

const ServiceForm: React.FC<ServiceFormProps> = ({ onSave, onCancel, clients, vehicles, serviceCatalog }) => {
    const [formData, setFormData] = useState({
        name: '',
        client_id: '',
        vehicle_id: '',
        price: '',
        payer_client_id: '',
        agent_name: '',
        detran_schedule_date: '',
        detran_schedule_time: '',
        contact_phone: '',
        payment_status: 'Pendente',
        situation_notes: '',
        next_schedule_date: '',
        next_schedule_time: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clientId = e.target.value;
        setFormData(prev => ({
            ...prev,
            client_id: clientId,
            vehicle_id: '', // Reseta o veículo
            payer_client_id: clientId, // Define o cliente como pagador padrão
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.client_id || !formData.vehicle_id || !formData.price || !formData.payer_client_id) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        setIsLoading(true);

        try {
            const combinedDetranSchedule = formData.detran_schedule_date ? `${formData.detran_schedule_date} ${formData.detran_schedule_time || ''}`.trim() : undefined;
            const combinedNextSchedule = formData.next_schedule_date ? `${formData.next_schedule_date} ${formData.next_schedule_time || ''}`.trim() : undefined;

            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30);
            const dueDateString = dueDate.toISOString().split('T')[0];

            await onSave({
                name: formData.name,
                client_id: Number(formData.client_id),
                vehicle_id: Number(formData.vehicle_id),
                price: parseFloat(formData.price),
                due_date: dueDateString,
                payer_client_id: Number(formData.payer_client_id),
                agent_name: formData.agent_name,
                detran_schedule_time: combinedDetranSchedule,
                contact_phone: formData.contact_phone,
                payment_status: formData.payment_status as 'Pago' | 'Pendente',
                situation_notes: formData.situation_notes,
                next_schedule_date: combinedNextSchedule,
            });
            onCancel();
        } catch (error) {
            console.error("Erro ao salvar serviço:", error);
            alert('Erro ao salvar serviço. Verifique o console para mais detalhes.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const availableVehicles = useMemo(() => {
        return formData.client_id ? vehicles.filter(v => v.owner_id === Number(formData.client_id)) : [];
    }, [formData.client_id, vehicles]);

    const selectedClientName = useMemo(() => {
        return clients.find(c => c.id === Number(formData.client_id))?.name || '';
    }, [formData.client_id, clients]);

    const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
            {/* Seção 1: Dados Básicos */}
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tipo de Serviço <span className="text-red-500">*</span></label>
                    <select id="name" name="name" value={formData.name} onChange={handleChange} className={inputClasses} required disabled={isLoading}>
                        <option value="" disabled>Selecione um tipo de serviço</option>
                        {serviceCatalog.map(category => (
                            <optgroup key={category.name} label={category.name}>
                                {category.services.map(service => <option key={service} value={service}>{service}</option>)}
                            </optgroup>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">Cliente <span className="text-red-500">*</span></label>
                        <select id="client_id" name="client_id" value={formData.client_id} onChange={handleClientChange} className={inputClasses} required disabled={isLoading}>
                            <option value="" disabled>Selecione um cliente</option>
                            {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="vehicle_id" className="block text-sm font-medium text-gray-700">Veículo <span className="text-red-500">*</span></label>
                        <select id="vehicle_id" name="vehicle_id" value={formData.vehicle_id} onChange={handleChange} className={inputClasses} required disabled={!formData.client_id || isLoading}>
                            <option value="" disabled>Selecione um veículo</option>
                            {availableVehicles.map(vehicle => <option key={vehicle.id} value={vehicle.id}>{vehicle.brand} {vehicle.model} ({vehicle.plate})</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Seção 2: Detalhes do Serviço */}
            <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold text-lg text-gray-800 border-b pb-2">Detalhes do Serviço e Agendamento</h4>
                <div>
                    <label htmlFor="agent_name" className="block text-sm font-medium text-gray-700">Responsável pelo Processo (Despachante)</label>
                    <UppercaseInput id="agent_name" name="agent_name" type="text" value={formData.agent_name} onChange={handleChange} disabled={isLoading} placeholder="NOME DO DESPACHANTE OU EMPRESA" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Valor do Serviço (R$) <span className="text-red-500">*</span></label>
                        <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} className={inputClasses} required step="0.01" min="0" disabled={isLoading} />
                    </div>
                    <div>
                        <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">Contato do Responsável</label>
                        <UppercaseInput type="text" id="contact_phone" name="contact_phone" value={formData.contact_phone} onChange={handleChange} placeholder="EX: (11) 99999-9999" disabled={isLoading} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Agendamento no DETRAN</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input type="date" name="detran_schedule_date" value={formData.detran_schedule_date} onChange={handleChange} className={inputClasses + ' w-full p-2'} disabled={isLoading} />
                            <input type="time" name="detran_schedule_time" value={formData.detran_schedule_time} onChange={handleChange} className={inputClasses + ' w-full p-2'} disabled={isLoading} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Próximo Agendamento</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input type="date" name="next_schedule_date" value={formData.next_schedule_date} onChange={handleChange} className={inputClasses + ' w-full p-2'} disabled={isLoading} />
                            <input type="time" name="next_schedule_time" value={formData.next_schedule_time} onChange={handleChange} className={inputClasses + ' w-full p-2'} disabled={isLoading} />
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="situation_notes" className="block text-sm font-medium text-gray-700">Situação Inicial / Pendências</label>
                    <textarea id="situation_notes" name="situation_notes" value={formData.situation_notes} onChange={handleChange} rows={2} className={inputClasses} placeholder="Ex: OK, aguardando vistoria" disabled={isLoading} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quem pagará pelo serviço? <span className="text-red-500">*</span></label>
                        <select id="payer_client_id" name="payer_client_id" value={formData.payer_client_id} onChange={handleChange} className={inputClasses} required disabled={isLoading}>
                            <option value="" disabled>Selecione o pagador</option>
                            {formData.client_id && <option value={formData.client_id}>{selectedClientName}</option>}
                            <optgroup label="Outros Clientes">
                                {clients.filter(c => c.id !== Number(formData.client_id)).map(client => (
                                    <option key={client.id} value={client.id}>{client.name}</option>
                                ))}
                            </optgroup>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status de Pagamento Inicial</label>
                        <select name="payment_status" value={formData.payment_status} onChange={handleChange} className={inputClasses} disabled={isLoading}>
                            <option value="Pendente">Pendente</option>
                            <option value="Pago">Pago</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300" disabled={isLoading}>
                    Cancelar
                </button>
                <button type="submit" className="btn-scale" disabled={isLoading}>
                    {isLoading ? 'Salvando...' : 'Salvar Serviço'}
                </button>
            </div>
        </form>
    );
};

export default ServiceForm;