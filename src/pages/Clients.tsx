import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Client } from '../types';
import { ClientDocStatus, ClientType } from '../types';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import ClientForm from '../components/ClientForm';
import { PlusIcon, EditIcon, TrashIcon, MoreVerticalIcon, SearchIcon, LoaderIcon } from '../components/Icons';
import { fetchClients, createClient, updateClient, deleteClient } from '../services/supabase';

const getStatusBadge = (status: ClientDocStatus) => {
    const statusMap: Record<ClientDocStatus, { text: string; className: string }> = {
        [ClientDocStatus.COMPLETED]: { text: 'Completo', className: 'bg-green-100 text-green-800' },
        [ClientDocStatus.IN_PROGRESS]: { text: 'Em Andamento', className: 'bg-blue-100 text-blue-800' },
        [ClientDocStatus.PENDING]: { text: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
    };
    const { text, className } = statusMap[status] || { text: 'Desconhecido', className: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${className}`}>{text}</span>;
};

const Clients: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const loadClients = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchClients();
            setClients(data);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            alert('Não foi possível carregar a lista de clientes.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadClients();
    }, [loadClients]);

    const filteredClients = useMemo(() => {
        return clients.filter(client =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.cpf_cnpj.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [clients, searchTerm]);

    const handleOpenModal = (client: Client | null) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingClient(null);
        setIsModalOpen(false);
    };

    // Corrigido o tipo de clientData para incluir doc_status, conforme retornado pelo ClientForm
    const handleSaveClient = async (clientData: Omit<Client, 'id' | 'user_id' | 'created_at'>, avatarFile: File | null) => {
        try {
            if (editingClient) {
                await updateClient(editingClient.id, clientData, avatarFile);
            } else {
                await createClient(clientData, avatarFile);
            }
            await loadClients(); // Recarrega a lista após salvar
        } catch (error) {
            throw error; // Deixa o erro ser tratado pelo formulário
        }
    };

    const handleDeleteClient = async (clientId: number, clientName: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o cliente "${clientName}"? Esta ação é irreversível e excluirá todos os veículos e serviços associados.`)) {
            try {
                await deleteClient(clientId);
                await loadClients();
            } catch (error) {
                console.error('Erro ao excluir cliente:', error);
                alert('Não foi possível excluir o cliente.');
            }
        }
    };

    return (
        <div className="p-4 md:p-8">
            <Card>
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-dark-text">Clientes</h2>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <button onClick={() => handleOpenModal(null)} className="btn-hover flex items-center justify-center">
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Novo Cliente
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="p-4 font-semibold">Nome / Razão Social</th>
                                <th className="p-4 font-semibold">Tipo</th>
                                <th className="p-4 font-semibold">Contato</th>
                                <th className="p-4 font-semibold">CPF/CNPJ</th>
                                <th className="p-4 font-semibold">Status Doc.</th>
                                <th className="p-4 font-semibold text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center p-8"><LoaderIcon className="w-6 h-6 inline mr-2" /> Carregando clientes...</td></tr>
                            ) : filteredClients.length === 0 ? (
                                <tr><td colSpan={6} className="text-center p-8 text-gray-500">Nenhum cliente encontrado.</td></tr>
                            ) : (
                                filteredClients.map(client => (
                                    <tr key={client.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 font-medium flex items-center">
                                            <img 
                                                src={client.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=0D47A1&color=fff`} 
                                                alt={client.name} 
                                                className="w-10 h-10 rounded-full mr-4 object-cover" 
                                            />
                                            {client.name}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                client.client_type === ClientType.INDIVIDUAL 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : 'bg-purple-100 text-purple-800'
                                            }`}>
                                                {client.client_type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm">{client.email}</div>
                                            <div className="text-xs text-gray-500">{client.phone}</div>
                                        </td>
                                        <td className="p-4 text-sm">{client.cpf_cnpj}</td>
                                        <td className="p-4">{getStatusBadge(client.doc_status)}</td>
                                        <td className="p-4 text-center">
                                            <div className="relative inline-block">
                                                <button className="p-2 hover:bg-gray-200 rounded-full group">
                                                    <MoreVerticalIcon className="w-5 h-5 text-gray-600" />
                                                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-xl z-10 hidden group-focus-within:block">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleOpenModal(client); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                            <EditIcon className="w-4 h-4 mr-2" /> Editar
                                                        </a>
                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleDeleteClient(client.id, client.name); }} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                                                            <TrashIcon className="w-4 h-4 mr-2" /> Excluir
                                                        </a>
                                                    </div>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingClient ? 'Editar Cliente' : 'Adicionar Novo Cliente'}>
                <ClientForm
                    onSave={handleSaveClient}
                    onCancel={handleCloseModal}
                    client={editingClient || undefined}
                />
            </Modal>
        </div>
    );
};

export default Clients;