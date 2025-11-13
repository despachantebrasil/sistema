import React, { useState } from 'react';
import type { ServiceChecklistItem } from '../types';
import { updateChecklistItem } from '../services/supabase';

interface ServiceChecklistProps {
    items: ServiceChecklistItem[];
    onUpdate: () => void;
}

const ServiceChecklist: React.FC<ServiceChecklistProps> = ({ items, onUpdate }) => {
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const handleToggle = async (item: ServiceChecklistItem) => {
        setUpdatingId(item.id);
        try {
            await updateChecklistItem(item.id, !item.is_completed);
            onUpdate();
        } catch (error) {
            console.error('Erro ao atualizar item do checklist:', error);
            alert('Não foi possível atualizar a tarefa.');
        } finally {
            setUpdatingId(null);
        }
    };

    const completedCount = items.filter(item => item.is_completed).length;
    const totalCount = items.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    if (items.length === 0) {
        return (
            <div className="mt-6">
                <h2 className="text-xl font-semibold text-primary border-b pb-2">Checklist do Serviço</h2>
                <p className="text-gray-500 mt-4 text-center py-4">Nenhum checklist definido para este tipo de serviço.</p>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <h2 className="text-xl font-semibold text-primary border-b pb-2">Checklist do Serviço</h2>
            
            <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Progresso</span>
                    <span className="text-sm font-bold text-primary">{completedCount} de {totalCount} concluídas</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className="mt-4 space-y-2">
                {items.map(item => (
                    <div
                        key={item.id}
                        onClick={() => handleToggle(item)}
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                            item.is_completed ? 'bg-green-50 text-gray-500 line-through' : 'bg-white hover:bg-gray-50'
                        }`}
                    >
                        <input
                            type="checkbox"
                            checked={item.is_completed}
                            readOnly
                            className={`h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary-dark transition-all ${updatingId === item.id ? 'animate-pulse' : ''}`}
                        />
                        <span className="ml-3 text-dark-text">{item.task_description}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServiceChecklist;