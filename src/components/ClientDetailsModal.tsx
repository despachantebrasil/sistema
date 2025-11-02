import React, { useRef } from 'react';
import type { Client } from '../types';
import { ClientType } from '../types';
import Modal from './ui/Modal';
import { PrinterIcon } from './Icons'; // Corrigido o import

interface ClientDetailsModalProps {
  client: Client | null;
  onClose: () => void;
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

// Componente otimizado para impressão
const PrintableClientDetails: React.FC<{ client: Client }> = ({ client }) => {
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

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ client, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!client) return null;

  const handlePrint = () => {
    const content = printRef.current;
    if (content) {
        // Temporariamente move o conteúdo para o container de impressão global
        const reportContainer = document.getElementById('report-content');
        if (reportContainer) {
            reportContainer.innerHTML = '';
            reportContainer.appendChild(content.cloneNode(true));
            window.print();
            // O conteúdo original do modal permanece no DOM, mas o conteúdo de impressão é limpo após o print
            reportContainer.innerHTML = '';
        }
    }
  };

  return (
    <Modal isOpen={!!client} onClose={onClose} title={`Detalhes do Cliente: ${client.name}`}>
        {/* O conteúdo do modal é renderizado aqui e referenciado para impressão */}
        <div ref={printRef}>
            <PrintableClientDetails client={client} />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t mt-6 no-print">
            <button 
                onClick={handlePrint} 
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