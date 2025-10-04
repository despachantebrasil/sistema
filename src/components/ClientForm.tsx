import React, { useState } from 'react';
import type { Client } from '../types';
import { ClientType } from '../types';
import { CameraIcon } from './Icons';

interface ClientFormProps {
    onSave: (client: Omit<Client, 'id' | 'docStatus'>) => void;
    onCancel: () => void;
    client?: Client; // For editing
}

const ClientForm: React.FC<ClientFormProps> = ({ onSave, onCancel, client }) => {
    const [clientType, setClientType] = useState(client?.clientType || ClientType.INDIVIDUAL);
    const [formData, setFormData] = useState({
        name: client?.name || '',
        phone: client?.phone || '',
        maritalStatus: client?.maritalStatus || '',
        profession: client?.profession || '',
        nationality: client?.nationality || '',
        naturalness: client?.naturalness || '',
        email: client?.email || '',
        address: client?.address || '',
        cpfCnpj: client?.cpfCnpj || '',
        tradeName: client?.tradeName || '',
        contactName: client?.contactName || '',
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(client?.avatarUrl || null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.phone) {
            alert('Nome, e-mail e telefone são obrigatórios.');
            return;
        }

        const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });

        let avatarUrl = client?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random&color=fff`;
        if (avatarFile) {
            avatarUrl = await toBase64(avatarFile);
        }

        onSave({ ...formData, avatarUrl, clientType });
    };

    const maritalStatusOptions = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'Outro'];

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="flex items-center justify-center space-x-4 mb-4">
                <button type="button" onClick={() => setClientType(ClientType.INDIVIDUAL)} className={`px-6 py-2 rounded-lg font-semibold transition-colors ${clientType === ClientType.INDIVIDUAL ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                    Pessoa Física
                </button>
                <button type="button" onClick={() => setClientType(ClientType.COMPANY)} className={`px-6 py-2 rounded-lg font-semibold transition-colors ${clientType === ClientType.COMPANY ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                    Pessoa Jurídica
                </button>
            </div>

            <div className="flex flex-col items-center space-y-2">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center relative group overflow-hidden border-2 border-gray-300">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center">
                                <CameraIcon className="w-8 h-8 text-gray-500 mx-auto" />
                                <span className="text-xs text-gray-500 mt-1">Foto</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all">
                            <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-semibold">Alterar</span>
                        </div>
                    </div>
                </label>
                <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </div>

             <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">{clientType === ClientType.INDIVIDUAL ? 'Nome Completo' : 'Razão Social'}</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>

            {clientType === ClientType.COMPANY && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="tradeName" className="block text-sm font-medium text-gray-700">Nome Fantasia</label>
                        <input type="text" name="tradeName" id="tradeName" value={formData.tradeName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">Nome do Contato</label>
                        <input type="text" name="contactName" id="contactName" value={formData.contactName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                    <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
            </div>

            {clientType === ClientType.INDIVIDUAL && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700">Estado Civil</label>
                            <select id="maritalStatus" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                <option value="">Selecione...</option>
                                {maritalStatusOptions.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="profession" className="block text-sm font-medium text-gray-700">Profissão</label>
                            <input type="text" name="profession" id="profession" value={formData.profession} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">Nacionalidade</label>
                            <input type="text" name="nationality" id="nationality" value={formData.nationality} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                        </div>
                         <div>
                            <label htmlFor="naturalness" className="block text-sm font-medium text-gray-700">Naturalidade</label>
                            <input type="text" name="naturalness" id="naturalness" value={formData.naturalness} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                        </div>
                    </div>
                </>
            )}
            
             <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Endereço</label>
                <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>

            <div>
                <label htmlFor="cpfCnpj" className="block text-sm font-medium text-gray-700">{clientType === ClientType.INDIVIDUAL ? 'CPF' : 'CNPJ'}</label>
                <input type="text" name="cpfCnpj" id="cpfCnpj" value={formData.cpfCnpj} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                    Cancelar
                </button>
                <button type="submit" className="btn-scale">
                    Salvar Cliente
                </button>
            </div>
        </form>
    );
};

export default ClientForm;