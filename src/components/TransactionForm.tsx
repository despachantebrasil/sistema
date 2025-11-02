import React, { useState, useEffect } from 'react';
import type { Transaction } from '../types';
import { TransactionType, TransactionStatus } from '../types';
import UppercaseInput from './ui/UppercaseInput'; // Importando o novo componente

interface TransactionFormProps {
    onSave: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
    onCancel: () => void;
    transaction?: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSave, onCancel, transaction }) => {
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: TransactionType.REVENUE,
        status: TransactionStatus.PAID,
        category: '',
        transaction_date: new Date().toISOString().split('T')[0],
        due_date: '',
        client_id: '',
        service_id: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (transaction) {
            setFormData({
                description: transaction.description,
                amount: String(transaction.amount),
                type: transaction.type,
                status: transaction.status,
                category: transaction.category,
                transaction_date: transaction.transaction_date,
                due_date: transaction.due_date || '',
                client_id: String(transaction.client_id || ''),
                service_id: String(transaction.service_id || ''),
            });
        }
    }, [transaction]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description || !formData.amount || !formData.transaction_date) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        setIsLoading(true);

        try {
            const dataToSave: Omit<Transaction, 'id' | 'user_id' | 'created_at'> = {
                description: formData.description,
                amount: parseFloat(formData.amount),
                type: formData.type,
                status: formData.status,
                category: formData.category,
                transaction_date: formData.transaction_date,
                due_date: formData.due_date || undefined,
                client_id: formData.client_id ? Number(formData.client_id) : undefined,
                service_id: formData.service_id ? Number(formData.service_id) : undefined,
            };
            
            await onSave(dataToSave);
            onCancel();
        } catch (error) {
            console.error("Erro ao salvar transação:", error);
            alert('Erro ao salvar transação. Verifique o console para mais detalhes.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                <UppercaseInput type="text" name="description" id="description" value={formData.description} onChange={handleChange} required disabled={isLoading} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                    <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} required step="0.01" min="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" disabled={isLoading} />
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
                    <UppercaseInput type="text" name="category" id="category" value={formData.category} onChange={handleChange} placeholder="Ex: TAXAS, SERVIÇO CNH" disabled={isLoading} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="transaction_date" className="block text-sm font-medium text-gray-700">Data da Transação</label>
                    <input type="date" name="transaction_date" id="transaction_date" value={formData.transaction_date} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" disabled={isLoading} />
                </div>
                <div>
                    <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">Data de Vencimento</label>
                    <input type="date" name="due_date" id="due_date" value={formData.due_date} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" disabled={isLoading} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" disabled={isLoading}>
                        <option value={TransactionType.REVENUE}>Receita</option>
                        <option value={TransactionType.EXPENSE}>Despesa</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                    <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" disabled={isLoading}>
                        <option value={TransactionStatus.PAID}>Pago</option>
                        <option value={TransactionStatus.PENDING}>Pendente</option>
                    </select>
                </div>
            </div>
            {/* Campos client_id e service_id removidos para simplificar o formulário manual, mas mantidos no tipo */}

            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300" disabled={isLoading}>
                    Cancelar
                </button>
                <button type="submit" className="btn-scale" disabled={isLoading}>
                    {isLoading ? 'Salvando...' : (transaction ? 'Salvar Alterações' : 'Salvar Transação')}
                </button>
            </div>
        </form>
    );
};

export default TransactionForm;