import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { initialPermissions, mockCompanyProfile, mockUsers } from '../data/mockData';
import type { AppUser, Role, PermissionsMap, CompanyProfile, Page } from '../types';
import { PlusIcon, EditIcon, TrashIcon, CameraIcon } from '../components/Icons';

type SettingsTab = 'users' | 'permissions' | 'company';

const pageLabels: Record<Page, string> = {
    dashboard: 'Painel Admin',
    clients: 'Clientes',
    vehicles: 'Veículos',
    services: 'Serviços',
    financial: 'Financeiro',
    reports: 'Relatórios',
    settings: 'Configurações',
};

// --- User Management Components ---
const UserForm: React.FC<{ 
    onSave: (user: AppUser, isEditing: boolean) => void, 
    onCancel: () => void,
    editingUser?: AppUser | null 
}> = ({ onSave, onCancel, editingUser }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>('Usuário');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";

    useEffect(() => {
        if (editingUser) {
            setFullName(editingUser.fullName);
            setEmail(editingUser.email);
            setRole(editingUser.role);
            setAvatarPreview(editingUser.avatarUrl || null);
        }
    }, [editingUser]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });

        let finalAvatarUrl = editingUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&color=fff`;
        if (avatarFile) {
            finalAvatarUrl = await toBase64(avatarFile);
        }

        const savedUser: AppUser = {
            id: editingUser?.id || `mock-user-${Date.now()}`,
            fullName,
            email,
            role,
            avatarUrl: finalAvatarUrl,
        };
        
        // Simulação de salvamento
        setTimeout(() => {
            onSave(savedUser, !!editingUser);
            setIsLoading(false);
        }, 500);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className={inputClasses} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClasses} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Senha</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={editingUser ? "Deixe em branco para não alterar" : "Mínimo 6 caracteres"} className={inputClasses} minLength={editingUser ? undefined : 6} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Perfil de Acesso</label>
                <select value={role} onChange={e => setRole(e.target.value as Role)} className={`${inputClasses} bg-white`}>
                    <option>Usuário</option>
                    <option>Gerente</option>
                    <option>Administrador</option>
                </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="btn-scale" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar'}</button>
            </div>
        </form>
    );
};

const UsersTab: React.FC = () => {
    const [users, setUsers] = useState<AppUser[]>(mockUsers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AppUser | null>(null);

    const handleOpenModal = (user: AppUser | null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingUser(null);
        setIsModalOpen(false);
    };

    const handleSaveUser = (savedUser: AppUser, isEditing: boolean) => {
        if (isEditing) {
            setUsers(prev => prev.map(u => u.id === savedUser.id ? savedUser : u));
        } else {
            setUsers(prev => [savedUser, ...prev]);
        }
        handleCloseModal();
    };

    const handleDeleteUser = (userId: string, userName: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
            return;
        }
        // Simulação de exclusão
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        alert('Usuário excluído com sucesso (Mock).');
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h3 className="text-xl font-bold">Gestão de Usuários (Mock)</h3>
                <button onClick={() => handleOpenModal(null)} className="btn-hover flex items-center justify-center">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Adicionar Usuário
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="p-4 font-semibold">Nome</th>
                            <th className="p-4 font-semibold">E-mail</th>
                            <th className="p-4 font-semibold">Perfil</th>
                            <th className="p-4 font-semibold">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium flex items-center">
                                    <img 
                                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}`} 
                                        alt={user.fullName} 
                                        className="w-10 h-10 rounded-full mr-4 object-cover" 
                                    />
                                    {user.fullName}
                                </td>
                                <td className="p-4">{user.email}</td>
                                <td className="p-4">{user.role}</td>
                                <td className="p-4 space-x-2 flex items-center">
                                    <button onClick={() => handleOpenModal(user)} className="text-primary p-1 hover:bg-gray-200 rounded-full">
                                        <EditIcon className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteUser(user.id, user.fullName)} 
                                        className={`p-1 rounded-full text-red-500 hover:bg-gray-200`}
                                        title={'Excluir usuário (Mock)'}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? "Editar Usuário (Mock)" : "Adicionar Novo Usuário (Mock)"}>
                <UserForm 
                    onSave={handleSaveUser} 
                    onCancel={handleCloseModal} 
                    editingUser={editingUser}
                />
            </Modal>
        </div>
    );
};

// --- Permissions Components ---
const PermissionsTab: React.FC = () => {
    const [permissions, setPermissions] = useState<PermissionsMap>(initialPermissions);

    const handlePermissionChange = (role: Role, page: Page, isChecked: boolean) => {
        setPermissions(prev => ({
            ...prev,
            [role]: { ...prev[role], [page]: isChecked }
        }));
    };

    const handleSavePermissions = () => {
        console.log('Saving permissions:', permissions);
        alert('Permissões salvas com sucesso!');
    };
    
    const roles = Object.keys(permissions) as Role[];
    const pages = Object.keys(pageLabels) as Page[];


    return (
        <div>
            <h3 className="text-xl font-bold mb-6">Controle de Permissões</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-center border min-w-[500px]">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 font-semibold text-left border-r">Módulo</th>
                            {roles.map(role => <th key={role} className="p-3 font-semibold">{role}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {pages.map(page => (
                            <tr key={page} className="border-b">
                                <td className="p-3 font-medium text-left border-r">{pageLabels[page]}</td>
                                {roles.map(role => (
                                    <td key={`${role}-${page}`} className="p-3">
                                        <input
                                            type="checkbox"
                                            className="h-5 w-5 rounded text-primary focus:ring-primary-dark"
                                            checked={!!permissions[role]?.[page]}
                                            onChange={(e) => handlePermissionChange(role, page, e.target.checked)}
                                            disabled={role === 'Administrador'}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <div className="flex justify-end mt-6">
                <button onClick={handleSavePermissions} className="btn-scale">Salvar Permissões</button>
            </div>
        </div>
    );
};

// --- Company Profile Components ---
const CompanyTab: React.FC = () => {
    const [companyData, setCompanyData] = useState<CompanyProfile>(mockCompanyProfile);
    const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCompanyData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Saving company data:', companyData);
        alert('Dados da empresa salvos com sucesso!');
    };

    return (
        <div>
             <h3 className="text-xl font-bold mb-6">Dados da Empresa</h3>
             <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
                        <input type="text" name="name" value={companyData.name} onChange={handleChange} className={inputClasses} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">CNPJ</label>
                        <input type="text" name="cnpj" value={companyData.cnpj} onChange={handleChange} className={inputClasses} />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Endereço</label>
                    <input type="text" name="address" value={companyData.address} onChange={handleChange} className={inputClasses} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Cidade</label>
                        <input type="text" name="city" value={companyData.city} onChange={handleChange} className={inputClasses} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Estado</label>
                        <input type="text" name="state" value={companyData.state} onChange={handleChange} className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">CEP</label>
                        <input type="text" name="zip" value={companyData.zip} onChange={handleChange} className={inputClasses} />
                    </div>
                 </div>
                 <div className="flex justify-end mt-6 pt-4 border-t">
                    <button type="submit" className="btn-scale">Salvar Dados</button>
                </div>
             </form>
        </div>
    )
}


// --- Main Settings Page Component ---
const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('users');

    const TabButton: React.FC<{ tab: SettingsTab, label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="p-4 md:p-8">
            <Card>
                <div className="border-b mb-6">
                    <div className="flex flex-wrap -mb-px">
                        <TabButton tab="users" label="Usuários" />
                        <TabButton tab="permissions" label="Permissões" />
                        <TabButton tab="company" label="Empresa" />
                    </div>
                </div>
                <div>
                    {activeTab === 'users' && <UsersTab />}
                    {activeTab === 'permissions' && <PermissionsTab />}
                    {activeTab === 'company' && <CompanyTab />}
                </div>
            </Card>
        </div>
    );
};

export default Settings;