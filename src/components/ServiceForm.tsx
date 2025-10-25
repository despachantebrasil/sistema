import React, { useState } from 'react';
import type { Service, Client, Vehicle, ServiceCategory } from '../types';
import { ServiceStatus } from '../types';

interface ServiceFormProps {
    onSave: (service: Omit<Service, 'id'>) => void;
    onCancel: () => void;
    clients: Client[];
    vehicles: Vehicle[];
    serviceCatalog: ServiceCategory[];
}

const ServiceForm: React.FC<ServiceFormProps> = ({ onSave, onCancel, clients, vehicles, serviceCatalog }) => {
    const [serviceName, setServiceName] = useState<string>('');
    const [clientId, setClientId] = useState<number | ''>('');
    const [vehicleId, setVehicleId] = useState<number | ''>('');
    const [price, setPrice] = useState<string>('');
    const [dueDate, setDueDate] = useState<string>('');
    const [isPayerSameAsClient, setIsPayerSameAsClient] = useState(true);
    const [payerClientId, setPayerClientId] = useState<number | ''>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!serviceName || !clientId || !vehicleId || !price || !dueDate) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        const client = clients.find((c: Client) => c.id === Number(clientId));
        const vehicle = vehicles.find((v: Vehicle) => v.id === Number(vehicleId));

        if (!client || !vehicle) {
             alert('Cliente ou veículo inválido.');
            return;
        }

        let finalPayerClientId: number | undefined = client.id;
        let finalPayerClientName: string | undefined = client.name;

        if (!isPayerSameAsClient) {
            const payerClient = clients.find(c => c.id === Number(payerClientId));
            if (!payerClient) {
                alert('Pagador inválido selecionado.');
                return;
            }
            finalPayerClientId = payerClient.id;
            finalPayerClientName = payerClient.name;
        }

        onSave({
            name: serviceName,
            clientName: client.name,
            vehiclePlate: vehicle.plate,
            status: ServiceStatus.TODO,
            price: parseFloat(price),
            dueDate,
            payerClientId: finalPayerClientId,
            payerClientName: finalPayerClientName,
        });
    };
    
    const availableVehicles = clientId ? vehicles.filter((v: Vehicle) => v.ownerId === Number(clientId)) : [];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700">Tipo de Serviço</label>
                <select
                    id="serviceName"
                    value={serviceName}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setServiceName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    required
                >
                    <option value="" disabled>Selecione um tipo de serviço</option>
                    {serviceCatalog.map((category: ServiceCategory) => (
                        <optgroup key={category.name} label={category.name}>
                            {category.services.map((service: string) => (
                                <option key={service} value={service}>{service}</option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="client" className="block text-sm font-medium text-gray-700">Cliente (Proprietário do Veículo)</label>
                <select
                    id="client"
                    value={clientId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        setClientId(Number(e.target.value));
                        setVehicleId(''); // Reset vehicle when client changes
                    }}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    required
                >
                    <option value="" disabled>Selecione um cliente</option>
                    {clients.map((client: Client) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700">Veículo</label>
                <select
                    id="vehicle"
                    value={vehicleId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVehicleId(Number(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    required
                    disabled={!clientId}
                >
                    <option value="" disabled>Selecione um veículo</option>
                    {availableVehicles.map((vehicle: Vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>{vehicle.brand} {vehicle.model} ({vehicle.plate})</option>
                    ))}
                </select>
            </div>

            <div className="pt-2">
                <div className="flex items-center">
                    <input
                        id="payer-checkbox"
                        type="checkbox"
                        checked={isPayerSameAsClient}
                        onChange={(e) => setIsPayerSameAsClient(e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="payer-checkbox" className="ml-2 block text-sm text-gray-900">
                        O pagador é o mesmo que o cliente
                    </label>
                </div>
            </div>

            {!isPayerSameAsClient && (
                <div>
                    <label htmlFor="payer" className="block text-sm font-medium text-gray-700">Pagador do Serviço</label>
                    <select
                        id="payer"
                        value={payerClientId}
                        onChange={(e) => setPayerClientId(Number(e.target.value))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        required
                    >
                        <option value="" disabled>Selecione um pagador</option>
                        {clients.map((c: Client) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            )}

             <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Preço (R$)</label>
                    <input
                        type="number"
                        id="price"
                        value={price}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        required
                        step="0.01"
                        min="0"
                    />
                </div>
                <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Prazo Final</label>
                    <input
                        type="date"
                        id="dueDate"
                        value={dueDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        required
                    />
                </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                    Cancelar
                </button>
                <button type="submit" className="btn-scale">
                    Salvar Serviço
                </button>
            </div>
        </form>
    );
};

export default ServiceForm;