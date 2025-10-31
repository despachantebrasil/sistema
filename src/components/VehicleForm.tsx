import React, { useState } from 'react';
import type { Vehicle, Client } from '../types';
import { CameraIcon, CloseIcon } from './Icons';

interface VehicleFormProps {
    onSave: (vehicle: Omit<Vehicle, 'id'>) => void;
    onCancel: () => void;
    clients: Client[];
    vehicle?: Vehicle; // For editing
}

const VehicleForm: React.FC<VehicleFormProps> = ({ onSave, onCancel, clients, vehicle }) => {
    const [formData, setFormData] = useState({
        plate: vehicle?.plate || '',
        chassis: vehicle?.chassis || '',
        renavam: vehicle?.renavam || '',
        brand: vehicle?.brand || '',
        model: vehicle?.model || '',
        yearManufacture: vehicle?.yearManufacture || new Date().getFullYear(),
        yearModel: vehicle?.yearModel || new Date().getFullYear(),
        color: vehicle?.color || '',
        fuelType: vehicle?.fuelType || '',
        ownerId: vehicle?.ownerId || '',
        licensingExpirationDate: vehicle?.licensingExpirationDate || '',
    });
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>(vehicle?.imageUrls || []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newFiles = files.slice(0, 4 - imageFiles.length);

            if (newFiles.length > 0) {
                const newImageFiles = [...imageFiles, ...newFiles];
                setImageFiles(newImageFiles);

                const newPreviews = newFiles.map((file: File) => URL.createObjectURL(file));
                setImagePreviews(prev => [...prev, ...newPreviews]);
            }
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImageFiles = [...imageFiles];
        const newImagePreviews = [...imagePreviews];

        // If the removed image was a new file, revoke its object URL
        const removedPreview = newImagePreviews[index];
        const fileIndex = imagePreviews.findIndex((p: string) => p === removedPreview);
        if (fileIndex >= (imagePreviews.length - newImageFiles.length)) {
           URL.revokeObjectURL(removedPreview);
           newImageFiles.splice(fileIndex - (imagePreviews.length - newImageFiles.length), 1);
        }
        
        newImagePreviews.splice(index, 1);
        
        setImageFiles(newImageFiles);
        setImagePreviews(newImagePreviews);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const owner = clients.find((c: Client) => c.id === Number(formData.ownerId));
        if (!owner) {
            alert('Por favor, selecione um proprietário válido.');
            return;
        }

        const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });

        // Note: In a real app, images should be uploaded to Supabase Storage, not stored as base64 in the DB.
        // We keep the base64 logic for now to maintain existing functionality.
        const newImageUrls = await Promise.all(imageFiles.map((file: File) => toBase64(file)));
        const existingImageUrls = imagePreviews.filter((p: string) => p.startsWith('http'));

        onSave({
            ...formData,
            yearManufacture: Number(formData.yearManufacture),
            yearModel: Number(formData.yearModel),
            ownerId: Number(formData.ownerId),
            ownerName: owner.name,
            imageUrls: [...existingImageUrls, ...newImageUrls],
            licensingExpirationDate: formData.licensingExpirationDate || undefined,
        });

        imagePreviews.forEach((url: string) => {
            if(url.startsWith('blob:')) URL.revokeObjectURL(url)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="plate" className="block text-sm font-medium text-gray-700">Placa</label>
                    <input type="text" name="plate" id="plate" value={formData.plate} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="ownerId" className="block text-sm font-medium text-gray-700">Proprietário</label>
                    <select id="ownerId" name="ownerId" value={formData.ownerId} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                        <option value="" disabled>Selecione um cliente</option>
                        {clients.map((client: Client) => (
                            <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                    </select>
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Marca</label>
                    <input type="text" name="brand" id="brand" value={formData.brand} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700">Modelo</label>
                    <input type="text" name="model" id="model" value={formData.model} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label htmlFor="yearManufacture" className="block text-sm font-medium text-gray-700">Ano Fabricação</label>
                    <input type="number" name="yearManufacture" id="yearManufacture" value={formData.yearManufacture} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="yearModel" className="block text-sm font-medium text-gray-700">Ano Modelo</label>
                    <input type="number" name="yearModel" id="yearModel" value={formData.yearModel} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700">Cor</label>
                    <input type="text" name="color" id="color" value={formData.color} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700">Combustível</label>
                    <select id="fuelType" name="fuelType" value={formData.fuelType} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                        <option value="">Selecione...</option>
                        <option value="Gasolina">Gasolina</option>
                        <option value="Álcool">Álcool</option>
                        <option value="Flex">Flex (Álcool/Gasolina)</option>
                        <option value="Diesel">Diesel</option>
                        <option value="GNV">GNV</option>
                        <option value="Elétrico">Elétrico</option>
                        <option value="Híbrido">Híbrido</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="chassis" className="block text-sm font-medium text-gray-700">Chassi</label>
                    <input type="text" name="chassis" id="chassis" value={formData.chassis} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="renavam" className="block text-sm font-medium text-gray-700">RENAVAM</label>
                    <input type="text" name="renavam" id="renavam" value={formData.renavam} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
            </div>
            
            <div>
                <label htmlFor="licensingExpirationDate" className="block text-sm font-medium text-gray-700">Vencimento Licenciamento</label>
                <input type="date" name="licensingExpirationDate" id="licensingExpirationDate" value={formData.licensingExpirationDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>

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
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                    Cancelar
                </button>
                <button type="submit" className="btn-scale">
                    Salvar Veículo
                </button>
            </div>
        </form>
    );
};

export default VehicleForm;