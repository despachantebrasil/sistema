import React, { useState, useEffect } from 'react';
import type { Client, AuditLog } from '../types';
import { ClientType } from '../types';
import Modal from './ui/Modal';
import { PrinterIcon, ClockIcon, LoaderIcon } from './Icons';
import { fetchAuditLogsForEntity } from '../services/supabase';

interface ClientDetailsModalProps {
  client: Client | null;
  onClose: () => void;
  onPrint: (client: Client) => void;
}

interface DetailItemProps {
  label: string;
  value: string | number | undefined;
  uppercase?: boolean;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, uppercase = false }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`font-semibold text-dark-text ${uppercase ? 'uppercase' : ''}`}>{value || '-'}</p>
  </div>
);

export const PrintableClientDetails: React.FC<{ client: Client }> = ({ client }) => {
    const isIndividual = client.client_type === ClientType.INDIVIDUAL;
    const avatarUrl = client.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=0D47A1&color=fff`;
    
    return (
        <div id="printable-client-content" className="p-6 space-y-6 printable-card">
            <div className="flex justify-between items-start border-b pb-4 mb-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-dark-text uppercase">{client.name}</h1>
                    <p className="text-lg text-primary font-medium">{client.client_type}</p>
                </div>
                <img 
                    src={avatarUrl} 
                    alt="Avatar" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-300" 
                />
            </div>

            <h2 className="text-xl font-semibold text-primary border-b pb-2">Informações de Contato e Documento</h2>
            <div className="grid grid-cols-2 gap-4">
                <DetailItem label={isIndividual ? "CPF" : "CNPJ"} value={client.cpf_cnpj} />
                <DetailItem label="E-mail" value={client.email} />
                <DetailItem label="Telefone" value={client.phone} />
                <DetailItem label="Status Documental" value={client.doc_status} />
            </div>

            <h2 className="text-xl font-semibold text-primary border-b pb-2">Endereço</h2>
            <DetailItem label="Endereço Completo" value={client.address} uppercase />

            {isIndividual ? (
                <>
                    <h2 className="text-xl font-semibold text-primary border-b pb-2">Dados Pessoais</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <DetailItem label="Estado Civil" value={client.marital_status} uppercase />
                        <DetailItem label="Profissão" value={client.profession} uppercase />
                        <DetailItem label="Nacionalidade" value={client.nationality} uppercase />
                        <DetailItem label="Naturalidade" value={client.naturalness} uppercase />
                        <DetailItem label="Nº Registro CNH" value={client.cnh_number} />
                        <DetailItem label="Vencimento CNH" value={client.cnh_expiration_date ? new Date(client.cnh_expiration_date + 'T00:00:00').toLocaleDateString('pt-BR') : '-'} />
                    </div>
                </>
            ) : (
                <>
                    <h2 className="text-xl font-semibold text-primary border-b pb-2">Dados Corporativos</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="Nome Fantasia" value={client.trade_name} uppercase />
                        <DetailItem label="Nome do Contato" value={client.contact_name} uppercase />
                    </div>
                </>
            )}
            
            <p className="text-xs text-gray-500 pt-4 border-t">Cadastro criado em: {new Date(client.created_at).toLocaleDateString('pt-BR')}</p>
        </div>
    );
};

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ client, onClose, onPrint }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    if (client) {
        const loadLogs = async () => {
            setLoadingLogs(true);
            try {
                const logData = await fetchAuditLogsForEntity('client', client.id);
                setLogs(logData);
            } catch (error) {
                console.error("Falha ao carregar logs de auditoria", error);
            } finally {
                setLoadingLogs(false);
            }
        };
        loadLogs();
    }
  }, [client]);

  if (!client) return null;

  return (
    <Modal isOpen={!!client} onClose={onClose} title={`Detalhes do Cliente: ${client.name}`}>
        <div className="max-h-[70vh] overflow-y-auto pr-4">
            <PrintableClientDetails client={client} />

            <div className="mt-6">
                <h2 className="text-xl font-semibold text-primary border-b pb-2">Histórico de Rastreabilidade</h2>
                {loadingLogs ? (
                    <div className="text-center p-4"><LoaderIcon className="w-5 h-5 inline mr-2" /> Carregando histórico...</div>
                ) : logs.length > 0 ? (
                    <div className="space-y-4 mt-4">
                        {logs.map(log => (
                            <div key={log.id} className="flex items-start">
                                <div className="bg-gray-200 p-2 rounded-full mr-4 mt-1 flex-shrink-0">
                                    <ClockIcon className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-dark-text">{log.action.replace(/_/g, ' ')}</p>
                                    <p className="text-sm text-gray-600">
                                        Código: <span className="font-mono bg-gray-100 px-1 rounded text-xs">{log.trace_code}</span>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(log.created_at).toLocaleString('pt-BR')} por {log.user_full_name || log.user_email}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 mt-4">Nenhum histórico encontrado para este cliente.</p>
                )}
            </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t mt-6 no-print">
            <button 
                onClick={() => onPrint(client)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
                <PrinterIcon className="w-5 h-5 mr-2" />
                Imprimir Cadastro
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                Fechar
            </button>
        </div>
    </Modal>
  );
};

export default ClientDetailsModal;