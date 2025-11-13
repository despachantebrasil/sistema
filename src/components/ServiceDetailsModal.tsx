import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import { updateService, fetchChecklistForService } from '../services/supabase';
import type { Service, Client, Vehicle, ServiceChecklistItem } from '../types';
import { ServiceStatus } from '../types';
import { LoaderIcon, EditIcon, PrinterIcon } from './Icons';
import ServiceChecklist from './ServiceChecklist';

interface ServiceDetailsModalProps {
    service: (Service & { clientName: string; vehiclePlate: string }) | null;
    clients: Client[];
    vehicles: Vehicle[];
    onClose: () => void;
    onUpdate: () => void;
}

interface DetailItemProps {
    label: string;
    value: string | number | undefined | React.ReactNode; 
    className?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, className = '' }) => (
    <div className={className}>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold text-dark-text break-words">{value || '-'}</p>
    </div>
);

const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({ service, clients, vehicles, onClose, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<ServiceStatus | undefined>(service?.status);
    const [checklistItems, setChecklistItems] = useState<ServiceChecklistItem[]>([]);
    const [formData, setFormData] = useState({
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

    const loadChecklist = async () => {
        if (service) {
            try {
                const items = await fetchChecklistForService(service.id);
                setChecklistItems(items);
            } catch (error) {
                console.error("Erro ao carregar checklist:", error);
            }
        }
    };

    useEffect(() => {
        if (service) {
            setCurrentStatus(service.status);
            const [detranDatePart, detranTimePart] = (service.detran_schedule_time || ' ').split(' ');
            const [nextDatePart, nextTimePart] = (service.next_schedule_date || ' ').split(' ');
            setFormData({
                agent_name: service.agent_name || '',
                detran_schedule_date: detranDatePart.trim(),
                detran_schedule_time: detranTimePart?.trim() || '',
                contact_phone: service.contact_phone || '',
                payment_status: service.payment_status || 'Pendente',
                situation_notes: service.situation_notes || '',
                next_schedule_date: nextDatePart.trim(),
                next_schedule_time: nextTimePart?.trim() || '',
            });
            setIsEditing(false);
            loadChecklist();
        }
    }, [service]);

    if (!service) return null;

    const client = clients.find(c => c.id === service.client_id);
    const payer = clients.find(c => c.id === service.payer_client_id);
    const vehicleDetails = vehicles.find(v => v.id === service.vehicle_id);

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentStatus(e.target.value as ServiceStatus);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!service.id || !currentStatus) return;

        setIsLoading(true);
        try {
            const combinedDetranSchedule = formData.detran_schedule_date 
                ? `${formData.detran_schedule_date} ${formData.detran_schedule_time || ''}`.trim() 
                : '';
            
            const combinedNextSchedule = formData.next_schedule_date
                ? `${formData.next_schedule_date} ${formData.next_schedule_time || ''}`.trim()
                : '';

            const updatePayload = {
                status: currentStatus,
                agent_name: formData.agent_name.toUpperCase(),
                detran_schedule_time: combinedDetranSchedule,
                contact_phone: formData.contact_phone.toUpperCase(),
                payment_status: formData.payment_status as 'Pago' | 'Pendente',
                situation_notes: formData.situation_notes,
                next_schedule_date: combinedNextSchedule || undefined, 
            };
            
            await updateService(service.id, updatePayload);
            onUpdate();
            setIsEditing(false);
        } catch (error) {
            console.error('Erro ao atualizar serviço:', error);
            alert('Não foi possível salvar as alterações.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const getStatusBadge = (status: ServiceStatus) => {
        let className = 'bg-gray-100 text-gray-800';
        switch (status) {
            case ServiceStatus.COMPLETED: className = 'bg-green-100 text-green-800'; break;
            case ServiceStatus.IN_PROGRESS: className = 'bg-blue-100 text-blue-800'; break;
            case ServiceStatus.WAITING_DOCS: className = 'bg-yellow-100 text-yellow-800'; break;
            case ServiceStatus.CANCELED: className = 'bg-red-100 text-red-800'; break;
            case ServiceStatus.TODO: className = 'bg-gray-200 text-gray-800'; break;
        }
        return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${className}`}>{status}</span>;
    };

    const formatSchedule = (schedule?: string) => {
        if (!schedule || !schedule.trim()) return '-';
        const [datePart, timePart] = schedule.split(' ');
        
        if (!datePart) return '-';
        
        if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
            return schedule;
        }

        const date = new Date(`${datePart}T${timePart || '00:00:00'}`);
        if (isNaN(date.getTime())) return schedule;

        const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const formattedDate = date.toLocaleDateString('pt-BR', dateOptions);

        if (timePart) {
            return `${formattedDate} às ${timePart}`;
        }
        return formattedDate;
    };

    const statusOptions = Object.values(ServiceStatus);
    const paymentStatusOptions = ['Pendente', 'Pago'];

    return (
        <Modal isOpen={!!service} onClose={onClose} title={`Detalhes do Serviço: ${service.name}`} size="4xl">
            <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-6">
                
                <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-bold text-dark-text mb-3">{service.name}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <DetailItem label="Cliente" value={service.clientName} />
                        <DetailItem label="Veículo" value={service.vehiclePlate} />
                        <DetailItem label="Valor" value={service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                        <DetailItem label="Prazo Final" value={new Date(service.due_date + 'T00:00:00').toLocaleDateString('pt-BR')} />
                        <DetailItem label="Pagador" value={payer?.name || service.clientName} />
                        <DetailItem label="Criado em" value={new Date(service.created_at).toLocaleDateString('pt-BR')} />
                    </div>
                </div>

                <div className="border p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-lg text-primary">Status e Rastreamento</h4>
                        <button onClick={() => setIsEditing(prev => !prev)} className="text-primary hover:text-primary-dark flex items-center text-sm font-medium">
                            <EditIcon className="w-4 h-4 mr-1" /> {isEditing ? 'Cancelar Edição' : 'Editar'}
                        </button>
                    </div>

                    {isEditing ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status Atual</label>
                                    <select name="status" value={currentStatus} onChange={handleStatusChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" disabled={isLoading}>
                                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status Pagamento</label>
                                    <select name="payment_status" value={formData.payment_status} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" disabled={isLoading}>
                                        {paymentStatusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Responsável (Despachante)</label>
                                    <input type="text" name="agent_name" value={formData.agent_name} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm uppercase" disabled={isLoading} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Contato do Responsável</label>
                                    <input type="text" name="contact_phone" value={formData.contact_phone} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm uppercase" disabled={isLoading} />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Agendamento DETRAN</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <input type="date" name="detran_schedule_date" value={formData.detran_schedule_date} onChange={handleFormChange} className="w-full mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" disabled={isLoading} />
                                        <input type="time" name="detran_schedule_time" value={formData.detran_schedule_time} onChange={handleFormChange} className="w-full mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" disabled={isLoading} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Próximo Agendamento</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <input type="date" name="next_schedule_date" value={formData.next_schedule_date} onChange={handleFormChange} className="w-full mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" disabled={isLoading} />
                                        <input type="time" name="next_schedule_time" value={formData.next_schedule_time} onChange={handleFormChange} className="w-full mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" disabled={isLoading} />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Notas da Situação / Pendências</label>
                                <textarea name="situation_notes" value={formData.situation_notes} onChange={handleFormChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" disabled={isLoading} />
                            </div>

                            <div className="flex justify-end pt-2">
                                <button onClick={handleSave} className="btn-scale" disabled={isLoading}>
                                    {isLoading ? <LoaderIcon className="w-5 h-5 inline mr-2" /> : 'Salvar Status e Rastreamento'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <DetailItem label="Status Atual" value={getStatusBadge(service.status)} />
                            <DetailItem label="Status Pagamento" value={service.payment_status || 'N/A'} />
                            <DetailItem label="Responsável" value={service.agent_name} />
                            <DetailItem label="Contato" value={service.contact_phone} />
                            <DetailItem label="Agendamento DETRAN" value={formatSchedule(service.detran_schedule_time)} />
                            <DetailItem label="Próximo Agendamento" value={formatSchedule(service.next_schedule_date)} />
                            <DetailItem label="Prazo Final do Serviço" value={new Date(service.due_date + 'T00:00:00').toLocaleDateString('pt-BR')} />
                            <DetailItem label="Notas da Situação" value={service.situation_notes} />
                        </div>
                    )}
                </div>
                
                <ServiceChecklist items={checklistItems} onUpdate={loadChecklist} />
                
                <div className="border p-4 rounded-lg">
                    <h4 className="font-semibold text-lg text-primary mb-3">Referências</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="Cliente CPF/CNPJ" value={client?.cpf_cnpj} />
                        <DetailItem label="Telefone do Cliente" value={client?.phone} />
                        <DetailItem label="Veículo Chassi" value={vehicleDetails?.chassis} />
                        <DetailItem label="Veículo RENAVAM" value={vehicleDetails?.renavam} />
                    </div>
                </div>

            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t mt-6 no-print">
                <button 
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                    <PrinterIcon className="w-5 h-5 mr-2" />
                    Imprimir Detalhes
                </button>
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                    Fechar
                </button>
            </div>
        </Modal>
    );
};

export default ServiceDetailsModal;