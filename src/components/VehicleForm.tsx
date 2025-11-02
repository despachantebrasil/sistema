import React, { useState, useEffect } from 'react';
import type { Vehicle, Client, ExtractedVehicleData } from '../types';
import { CameraIcon, CloseIcon } from './Icons';
import UppercaseInput from './ui/UppercaseInput';

interface VehicleFormProps {
    onSave: (vehicleData: Omit<Vehicle, 'id' | 'user_id' | 'created_at'>, imageFiles: File[]) => Promise<void>;
    onCancel: () => void;
    clients: Client[];
    vehicle?: Vehicle; // For editing
    prefilledData?: ExtractedVehicleData; // For AI pre-filling
}

const VehicleForm: React.FC<VehicleFormProps> = ({ onSave, onCancel, clients, vehicle, prefilledData }) => {
    const [formData, setFormData] = useState({
        plate: vehicle?.plate || prefilledData?.plate || '',
        chassis: vehicle?.chassis || prefilledData?.chassis || '',
        renavam: vehicle?.renavam || prefilledData?.renavam || '',
        brand: vehicle?.brand || prefilledData?.brand || '',
        model: vehicle?.model || prefilledData?.model || '',
        year_manufacture: vehicle?.year_manufacture || prefilledData?.year_manufacture || new Date().getFullYear(),
        year_model: vehicle?.year_model || prefilledData?.year_model || new Date().getFullYear(),
        color: vehicle?.color || prefilledData?.color || '',
        fuel_type: vehicle?.fuel_type || prefilledData?.fuel_type || '',
        owner_id: vehicle?.owner_id || '',
        licensing_expiration_date: vehicle?.licensing_expiration_date || prefilledData?.licensing_expiration_date || '',
        category: vehicle?.category || '', // Novo campo
        capacity_power_cc: vehicle?.capacity_power_cc || '', // Novo campo
    });
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>(vehicle?.image_urls || []);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (vehicle) {
            setImagePreviews(vehicle.image_urls || []);
        }
    }, [vehicle]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newFiles = files.slice(0, 4 - imagePreviews.length);

            if (newFiles.length > 0) {
                setImageFiles(prev => [...prev, ...newFiles]);

                const newPreviews = newFiles.map((file: File) => URL.createObjectURL(file));
                setImagePreviews(prev => [...prev, ...newPreviews]);
            }
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImagePreviews = [...imagePreviews];
        const removedPreview = newImagePreviews[index];
        newImagePreviews.splice(index, 1);
        setImagePreviews(newImagePreviews);

        if (removedPreview.startsWith('blob:')) {
            const fileIndex = imageFiles.findIndex(file => URL.createObjectURL(file) === removedPreview);
            if (fileIndex !== -1) {
                const newImageFiles = [...imageFiles];
                newImageFiles.splice(fileIndex, 1);
                setImageFiles(newImageFiles);
            }
            URL.revokeObjectURL(removedPreview);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.owner_id) {
            alert('Por favor, selecione um proprietário válido.');
            return;
        }
        
        setIsLoading(true);

        try {
            const vehicleDataToSave = {
                ...formData,
                year_manufacture: Number(formData.year_manufacture),
                year_model: Number(formData.year_model),
                owner_id: Number(formData.owner_id),
                image_urls: imagePreviews.filter(p => !p.startsWith('blob:')),
            };

            await onSave(vehicleDataToSave as Omit<Vehicle, 'id' | 'user_id' | 'created_at'>, imageFiles);
            
            imagePreviews.forEach((url: string) => {
                if(url.startsWith('blob:')) URL.revokeObjectURL(url)
            });
            
            onCancel();
        } catch (error) {
            console.error("Erro ao salvar veículo:", error);
            alert('Erro ao salvar veículo. Verifique o console para mais detalhes.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const fuelTypeOptions = [
        'GASOLINA', 'ÁLCOOL', 'FLEX (ÁLCOOL/GASOLINA)', 'DIESEL', 'GNV', 'ELÉTRICO', 'HÍBRIDO'
    ];
    
    const categoryOptions = [
        'PARTICULAR', 'ALUGUEL', 'OFICIAL', 'APRENDIZAGEM', 'COLEÇÃO', 'EXPERIÊNCIA/FABRICANTE'
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
            {/* Seção 1: Identificação Principal (3 colunas) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="plate" className="block text-sm font-medium text-gray-700">Placa</label>
                    <UppercaseInput type="text" name="plate" id="plate" value={formData.plate} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="renavam" className="block text-sm font-medium text-gray-700">RENAVAM</label>
                    <UppercaseInput type="text" name="renavam" id="renavam" value={formData.renavam} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="owner_id" className="block text-sm font-medium text-gray-700">Proprietário</label>
                    <select id="owner_id" name="owner_id" value={formData.owner_id} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                        <option value="" disabled>Selecione um cliente</option>
                        {clients.map((client: Client) => (
                            <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            {/* Chassi (1 coluna) */}
            <div>
                <label htmlFor="chassis" className="block text-sm font-medium text-gray-700">Chassi</label>
                <UppercaseInput type="text" name="chassis" id="chassis" value={formData.chassis} onChange={handleChange} required />
            </div>

            {/* Seção 2: Características do Veículo (3 colunas) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Marca</label>
                    <UppercaseInput type="text" name="brand" id="brand" value={formData.brand} onChange={handleChange} required />
                </div>
                 <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700">Modelo</label>
                    <UppercaseInput type="text" name="model" id="model" value={formData.model} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700">Cor Predominante</label>
                    <UppercaseInput type="text" name="color" id="color" value={formData.color} onChange={handleChange} required />
                </div>
            </div>

            {/* Seção 3: Detalhes Técnicos (3 colunas) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="year_manufacture" className="block text-sm font-medium text-gray-700">Ano Fab.</label>
                    <input type="number" name="year_manufacture" id="year_manufacture" value={formData.year_manufacture} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="year_model" className="block text-sm font-medium text-gray-700">Ano Mod.</label>
                    <input type="number" name="year_model" id="year_model" value={formData.year_model} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="fuel_type" className="block text-sm font-medium text-gray-700">Combustível</label>
                    <select id="fuel_type" name="fuel_type" value={formData.fuel_type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                        <option value="">Selecione...</option>
                        {fuelTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
            </div>
            
            {/* Seção 4: Categoria e Capacidade (3 colunas, usando a terceira para Vencimento Licenciamento) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                        <option value="">Selecione...</option>
                        {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="capacity_power_cc" className="block text-sm font-medium text-gray-700">Capacidade/Potência/Cilindrada</label>
                    <UppercaseInput type="text" name="capacity_power_cc" id="capacity_power_cc" value={formData.capacity_power_cc} onChange={handleChange} placeholder="EX: 5 PES / 100 CV / 1000 CC" />
                </div>
                <div>
                    <label htmlFor="licensing_expiration_date" className="block text-sm font-medium text-gray-700">Vencimento Licenciamento</label>
                    <input type="date" name="licensing_expiration_date" id="licensing_expiration_date" value={formData.licensing_expiration_date} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
            </div>

            {/* Seção 5: Mídia */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Fotos do Veículo (até 4)</label>
                {imagePreviews.length < 4 && (
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                                    <span>Carregar arquivos</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageChange} disabled={imagePreviews.length >= 4} />
                                 </label>
                            </div>
                            <p className="text-xs text-gray-500">{4 - imagePreviews.length} foto(s) restante(s)</p>
                        </div>
                    </div>
                )}
                {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-4">
                        {imagePreviews.map((preview: string, index: number) => (
                            <div key={index} className="relative group">
                                <img src={preview} alt={`Preview ${index + 1}`} className="h-24 w-full object-cover rounded-md" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-opacity">
                                    <button type="button" onClick={() => handleRemoveImage(index)} className="opacity-0 group-hover:opacity-100 bg-red-600 text-white rounded-full p-1 leading-none transition-opacity">
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300" disabled={isLoading}>
                    Cancelar
                </button>
                <button type="submit" className="btn-scale" disabled={isLoading}>
                    {isLoading ? 'Salvando...' : 'Salvar Veículo'}
                </button>
            </div>
        </form>
    );
};

export default VehicleForm;