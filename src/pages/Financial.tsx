import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import TransactionForm from '../components/TransactionForm';
import type { Transaction } from '../types';
import { TransactionType, TransactionStatus } from '../types';
import { PlusIcon, DollarSignIcon, ArrowUpCircleIcon, ArrowDownCircleIcon, EditIcon, TrashIcon, LoaderIcon } from '../components/Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchTransactions, createTransaction, updateTransaction, deleteTransaction } from '../services/supabase';

const KpiCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <Card className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-sm text-light-text">{title}</p>
            <p className="text-xl lg:text-2xl font-bold text-dark-text">{value}</p>
        </div>
    </Card>
);

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

type FinancialTab = 'overview' | 'receivables' | 'payables' | 'all';

const Financial: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [activeTab, setActiveTab] = useState<FinancialTab>('overview');
    const [loading, setLoading] = useState(true);

    const loadTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchTransactions();
            setTransactions(data);
        } catch (error) {
            console.error('Erro ao carregar transações:', error);
            alert('Não foi possível carregar a lista de transações.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    const handleOpenModal = (transaction: Transaction | null = null) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const handleSaveTransaction = async (data: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
        try {
            if (editingTransaction) {
                await updateTransaction(editingTransaction.id, data);
            } else {
                await createTransaction(data);
            }
            await loadTransactions();
        } catch (error) {
            throw error;
        }
    };

    const handleDeleteTransaction = async (id: number) => {
        if (window.confirm('Tem certeza de que deseja excluir esta transação?')) {
            try {
                await deleteTransaction(id);
                await loadTransactions();
            } catch (error) {
                console.error('Erro ao excluir transação:', error);
                alert('Não foi possível excluir a transação.');
            }
        }
    };
    
    const financialSummary = useMemo(() => {
        const totalRevenue = transactions
            .filter(t => t.type === TransactionType.REVENUE && t.status === TransactionStatus.PAID)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const accountsReceivable = transactions
            .filter(t => t.type === TransactionType.REVENUE && t.status === TransactionStatus.PENDING)
            .reduce((sum, t) => sum + t.amount, 0);

        const accountsPayable = transactions
            .filter(t => t.type === TransactionType.EXPENSE && t.status === TransactionStatus.PENDING)
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpense = transactions
            .filter(t => t.type === TransactionType.EXPENSE && t.status === TransactionStatus.PAID)
            .reduce((sum, t) => sum + t.amount, 0);

        const currentBalance = totalRevenue - totalExpense;

        return { totalRevenue, accountsReceivable, accountsPayable, currentBalance };
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        switch (activeTab) {
            case 'receivables':
                return transactions.filter(t => t.type === TransactionType.REVENUE && t.status === TransactionStatus.PENDING);
            case 'payables':
                return transactions.filter(t => t.type === TransactionType.EXPENSE && t.status === TransactionStatus.PENDING);
            case 'all':
                return transactions;
            default:
                return [];
        }
    }, [transactions, activeTab]);

    const renderCashFlowChart = () => {
        const monthlyData = transactions.reduce((acc, t) => {
            const date = new Date(t.transaction_date);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            const monthName = date.toLocaleString('pt-BR', { month: 'short' });
            
            if (!acc[monthKey]) acc[monthKey] = { name: monthName, Receitas: 0, Despesas: 0 };
            
            if (t.status === TransactionStatus.PAID) {
                if (t.type === TransactionType.REVENUE) acc[monthKey].Receitas += t.amount;
                else acc[monthKey].Despesas += t.amount;
            }
            return acc;
        }, {} as Record<string, { name: string; Receitas: number; Despesas: number }>);
        
        // Sort by month key and take the last 6 months
        const sortedData = Object.entries(monthlyData)
            .sort(([keyA], [keyB]) => {
                const [yA, mA] = keyA.split('-').map(Number);
                const [yB, mB] = keyB.split('-').map(Number);
                if (yA !== yB) return yA - yB;
                return mA - mB;
            })
            .slice(-6)
            .map(([, value]) => value);

        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sortedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value: number) => `R$${(value/1000).toFixed(1)}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        );
    }
    
    const TabButton: React.FC<{tab: FinancialTab, label: string}> = ({tab, label}) => (
        <button 
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tab ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-200'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="p-4 md:p-8 space-y-8">
            <Card>
                <div className="flex flex-wrap border-b mb-6">
                    <TabButton tab="overview" label="Visão Geral" />
                    <TabButton tab="receivables" label="Contas a Receber" />
                    <TabButton tab="payables" label="Contas a Pagar" />
                    <TabButton tab="all" label="Todas as Transações" />
                </div>
                
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <KpiCard title="Faturamento Total" value={formatCurrency(financialSummary.totalRevenue)} icon={<DollarSignIcon className="w-6 h-6 text-green-500" />} color="bg-green-100" />
                            <KpiCard title="Contas a Receber" value={formatCurrency(financialSummary.accountsReceivable)} icon={<ArrowUpCircleIcon className="w-6 h-6 text-blue-500" />} color="bg-blue-100" />
                            <KpiCard title="Contas a Pagar" value={formatCurrency(financialSummary.accountsPayable)} icon={<ArrowDownCircleIcon className="w-6 h-6 text-red-500" />} color="bg-red-100" />
                            <KpiCard title="Saldo Atual" value={formatCurrency(financialSummary.currentBalance)} icon={<DollarSignIcon className="w-6 h-6 text-yellow-500" />} color="bg-yellow-100" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-dark-text mb-4">Fluxo de Caixa Mensal (Pagos)</h2>
                            {loading ? (
                                <div className="text-center p-8"><LoaderIcon className="w-6 h-6 inline mr-2" /> Carregando gráfico...</div>
                            ) : (
                                renderCashFlowChart()
                            )}
                        </div>
                    </div>
                )}

                {activeTab !== 'overview' && (
                     <div>
                        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                            <h2 className="text-xl font-bold">
                                {activeTab === 'receivables' && 'Contas a Receber Pendentes'}
                                {activeTab === 'payables' && 'Contas a Pagar Pendentes'}
                                {activeTab === 'all' && 'Todas as Transações'}
                            </h2>
                             <button onClick={() => handleOpenModal()} className="flex items-center justify-center btn-hover">
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Adicionar Transação
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[700px]">
                                <thead className="border-b bg-gray-50">
                                    <tr>
                                        <th className="p-4 font-semibold">Descrição</th>
                                        <th className="p-4 font-semibold">Data</th>
                                        <th className="p-4 font-semibold">Vencimento</th>
                                        <th className="p-4 font-semibold">Valor</th>
                                        <th className="p-4 font-semibold">Status</th>
                                        <th className="p-4 font-semibold">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={6} className="text-center p-8"><LoaderIcon className="w-6 h-6 inline mr-2" /> Carregando transações...</td></tr>
                                    ) : filteredTransactions.length === 0 ? (
                                        <tr><td colSpan={6} className="text-center p-8 text-gray-500">Nenhuma transação encontrada.</td></tr>
                                    ) : (
                                        filteredTransactions.map(t => (
                                            <tr key={t.id} className="border-b hover:bg-gray-50">
                                                <td className="p-4">
                                                    <div className="flex items-center">
                                                        {t.type === TransactionType.REVENUE ? <ArrowUpCircleIcon className="w-5 h-5 mr-3 text-green-500"/> : <ArrowDownCircleIcon className="w-5 h-5 mr-3 text-red-500"/>}
                                                        <div>
                                                            <p className="font-medium">{t.description}</p>
                                                            <p className="text-sm text-gray-500">{t.category}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">{new Date(t.transaction_date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                                <td className="p-4">{t.due_date ? new Date(t.due_date + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</td>
                                                <td className={`p-4 font-medium ${t.type === TransactionType.REVENUE ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(t.amount)}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${t.status === TransactionStatus.PAID ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {t.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 space-x-2 flex items-center">
                                                    <button onClick={() => handleOpenModal(t)} className="text-primary p-1 hover:bg-gray-200 rounded-full"><EditIcon className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDeleteTransaction(t.id)} className="text-red-500 p-1 hover:bg-gray-200 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Card>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTransaction ? "Editar Transação" : "Adicionar Nova Transação"}>
                <TransactionForm onSave={handleSaveTransaction} onCancel={handleCloseModal} transaction={editingTransaction} />
            </Modal>
        </div>
    );
};

export default Financial;