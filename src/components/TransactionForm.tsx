import React, { useState, useEffect } from 'react';
import type { Transaction } from '../types';
import { TransactionType, TransactionStatus } from '../types';

interface TransactionFormProps {
    onSave: (transaction: Omit<Transaction, 'id'>) => void;
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
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
    });

    useEffect(() => {
        if (transaction) {
            setFormData({
                description: transaction.description,
                amount: String(transaction.amount),
                type: transaction.type,
                status: transaction.status,
                category: transaction.category,
                date: transaction.date,
                dueDate: transaction.dueDate || '',
            });
        }
    }, [transaction]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description || !formData.amount || !formData.date) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        onSave({
            ...formData,
            amount: parseFloat(formData.amount as string),
            dueDate: formData.dueDate || undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                    <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} required step="0.01" min="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
                    <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} placeholder="Ex: Taxas, Serviço CNH" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Data da Transação</label>
                    <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Data de Vencimento</label>
                    <input type="date" name="dueDate" id="dueDate" value={formData.dueDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                        <option value={TransactionType.REVENUE}>Receita</option>
                        <option value={TransactionType.EXPENSE}>Despesa</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                    <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                        <option value={TransactionStatus.PAID}>Pago</option>
                        <option value={TransactionStatus.PENDING}>Pendente</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                    Cancelar
                </button>
                <button type="submit" className="btn-scale">
                    {transaction ? 'Salvar Alterações' : 'Salvar Transação'}
                </button>
            </div>
        </form>
    );
};

export default TransactionForm;