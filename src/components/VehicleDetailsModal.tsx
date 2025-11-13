import React, { useState, useEffect } from 'react';
import type { Vehicle, AuditLog } from '../types';
import Modal from './ui/Modal';
import { PrinterIcon, ClockIcon, LoaderIcon } from './Icons';
import { fetchAuditLogsForEntity } from '../services/supabase';

interface VehicleWithDetails extends Vehicle {
    ownerName: string;
}

interface VehicleDetailsModalProps {
  vehicle: VehicleWithDetails | null;
  onClose: () => void;
  onPrint: (vehicle: VehicleWithDetails) => void;
}

interface DetailItemProps {
  label: string;
  value: string | number | undefined;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-semibold text-dark-text">{value || '-'}</p>
  </div>
);

export const PrintableVehicleDetails: React.FC<{ vehicle: VehicleWithDetails }> = ({ vehicle }) => (
    <div className="p-6 space-y-6 printable-card">
        <div className="flex justify-between items-start border-b pb-4 mb-4">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-dark-text uppercase">{vehicle.brand} {vehicle.model}</h1>
                <p className="text-lg text-primary font-medium">Placa: {vehicle.plate}</p>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-500">Proprietário</p>
                <p className="font-semibold text-dark-text">{vehicle.ownerName || 'Desconhecido'}</p>
            </div>
        </div>

        <h2 className="text-xl font-semibold text-primary border-b pb-2">Dados de Identificação</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <DetailItem label="RENAVAM" value={vehicle.renavam} />
            <DetailItem label="Chassi" value={vehicle.chassis} />
            <DetailItem label="Cor" value={vehicle.color} />
            <DetailItem label="Ano Fabricação" value={vehicle.year_manufacture} />
            <DetailItem label="Ano Modelo" value={vehicle.year_model} />
            <DetailItem label="Combustível" value={vehicle.fuel_type} />
            <DetailItem label="Categoria" value={vehicle.category} />
            <DetailItem label="Potência/Cilindrada" value={vehicle.capacity_power_cc} />
            <DetailItem label="Venc. Licenc." value={vehicle.licensing_expiration_date ? new Date(vehicle.licensing_expiration_date + 'T00:00:00').toLocaleDateString('pt-BR') : '-'} />
        </div>

        {vehicle.image_urls && vehicle.image_urls.length > 0 && (
            <>
                <h2 className="text-xl font-semibold text-primary border-b pb-2 mt-6">Fotos do Veículo</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {vehicle.image_urls.map((url: string, index: number) => (
                        <div key={index} className="break-inside-avoid">
                            <img 
                                src={url} 
                                alt={`Veículo ${vehicle.plate} - Foto ${index + 1}`} 
                                className="w-full h-32 object-cover rounded-lg shadow-md border" 
                            />
                            <p className="text-xs text-center text-gray-500 mt-1">Foto {index + 1}</p>
                        </div>
                    ))}
                </div>
            </>
        )}
        
        <p className="text-xs text-gray-500 pt-4 border-t">Cadastro criado em: {new Date(vehicle.created_at).toLocaleDateString('pt-BR')}</p>
    </div>
);

const VehicleDetailsModal: React.FC<VehicleDetailsModalProps> = ({ vehicle, onClose, onPrint }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    if (vehicle) {
        const loadLogs = async () => {
            setLoadingLogs(true);
            try {
                const logData = await fetchAuditLogsForEntity('vehicle', vehicle.id);
                setLogs(logData);
            } catch (error) {
                console.error("Falha ao carregar logs de auditoria", error);
            } finally {
                setLoadingLogs(false);
            }
        };
        loadLogs();
    }
  }, [vehicle]);

  if (!vehicle) return null;

  return (
    <Modal isOpen={!!vehicle} onClose={onClose} title="Detalhes do Veículo" size="3xl">
      <div className="max-h-[70vh] overflow-y-auto pr-4">
        <PrintableVehicleDetails vehicle={vehicle} />

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
                <p className="text-gray-500 mt-4">Nenhum histórico encontrado para este veículo.</p>
            )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t mt-6 no-print">
        <button 
            onClick={() => onPrint(vehicle)} 
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

export default VehicleDetailsModal;