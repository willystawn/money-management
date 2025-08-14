
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, SpendingAnalysis, HealthProfile, Account, Category } from '../types';
import AISuggestion from './AISuggestion';
import ConfirmationModal from './ConfirmationModal';

interface TransactionHistoryProps {
  transactions: Transaction[];
  deleteTransaction: (id: string) => Promise<void>;
  healthProfile: HealthProfile;
  accounts: Account[];
  categories: Category[];
}

const Icons = {
  Trash: ({className=''}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Lightbulb: ({className=''}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.375 3.375 0 0112 18.75v-2.625A5.002 5.002 0 0112 3z" /></svg>,
  Income: ({className=''}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
  Expense: ({className=''}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>,
};

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, deleteTransaction, healthProfile, accounts, categories }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
    const [filterCategoryId, setFilterCategoryId] = useState<'all' | string>('all');
    const [filterAccountId, setFilterAccountId] = useState<'all' | string>('all');
    const [filterYear, setFilterYear] = useState<'all' | number>('all');
    const [filterMonth, setFilterMonth] = useState<'all' | number>('all');
    const [showSuggestionFor, setShowSuggestionFor] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const foodCategoryName = 'Makanan';

    const getAccountName = (accountId: string) => accounts.find(a => a.id === accountId)?.name || 'Akun Dihapus';

    const availableYears = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];
        const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
        return Array.from(years).sort((a, b) => b - a);
    }, [transactions]);

    const monthOptions = [
        { value: 0, label: 'Januari' }, { value: 1, label: 'Februari' }, { value: 2, label: 'Maret' },
        { value: 3, label: 'April' }, { value: 4, label: 'Mei' }, { value: 5, label: 'Juni' },
        { value: 6, label: 'Juli' }, { value: 7, label: 'Agustus' }, { value: 8, label: 'September' },
        { value: 9, label: 'Oktober' }, { value: 10, label: 'November' }, { value: 11, label: 'Desember' },
    ];
    
    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(t => {
                const tDate = new Date(t.date);
                const yearMatch = filterYear === 'all' || tDate.getFullYear() === Number(filterYear);
                const monthMatch = filterMonth === 'all' || tDate.getMonth() === Number(filterMonth);
                return yearMatch && monthMatch;
            })
            .filter(t => filterType === 'all' || t.type === filterType)
            .filter(t => filterAccountId === 'all' || t.accountId === filterAccountId)
            .filter(t => filterCategoryId === 'all' || t.type !== TransactionType.EXPENSE || t.categoryId === filterCategoryId)
            .filter(t => searchQuery.trim() === '' || t.description.toLowerCase().includes(searchQuery.trim().toLowerCase()));
    }, [transactions, filterType, filterCategoryId, filterAccountId, filterYear, filterMonth, searchQuery]);

    const handleDeleteClick = (transaction: Transaction) => {
        setTransactionToDelete(transaction);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (transactionToDelete) {
            setIsDeleting(true);
            await deleteTransaction(transactionToDelete.id);
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setTransactionToDelete(null);
        }
    };
    
    const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
        <div className="relative">
          <select
            {...props}
            style={{ colorScheme: 'dark' }}
            className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500/70 disabled:bg-gray-800/50 disabled:cursor-not-allowed appearance-none"
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-lg ring-1 ring-white/10 p-4 sm:p-6">
                <h2 className="text-xl font-bold text-gray-100 mb-4">Filter Riwayat Transaksi</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     <div>
                        <label htmlFor="search-description" className="block text-sm font-medium text-gray-400 mb-1.5">Cari Deskripsi</label>
                        <input
                            id="search-description"
                            type="text"
                            placeholder="cth: Makan siang"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500/70 placeholder:text-gray-500 transition-all"
                        />
                    </div>
                     <div>
                        <label htmlFor="filter-year" className="block text-sm font-medium text-gray-400 mb-1.5">Tahun</label>
                        <Select id="filter-year" value={filterYear} onChange={e => setFilterYear(e.target.value as any)}>
                            <option value="all">Semua Tahun</option>
                            {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                        </Select>
                    </div>
                    <div>
                        <label htmlFor="filter-month" className="block text-sm font-medium text-gray-400 mb-1.5">Bulan</label>
                        <Select id="filter-month" value={filterMonth} onChange={e => setFilterMonth(e.target.value as any)}>
                            <option value="all">Semua Bulan</option>
                            {monthOptions.map(month => <option key={month.value} value={month.value}>{month.label}</option>)}
                        </Select>
                    </div>
                    <div>
                        <label htmlFor="filter-type" className="block text-sm font-medium text-gray-400 mb-1.5">Tipe</label>
                        <Select id="filter-type" value={filterType} onChange={e => setFilterType(e.target.value as any)}>
                            <option value="all">Semua Tipe</option>
                            <option value={TransactionType.INCOME}>Pemasukan</option>
                            <option value={TransactionType.EXPENSE}>Pengeluaran</option>
                        </Select>
                    </div>
                    <div>
                        <label htmlFor="filter-account" className="block text-sm font-medium text-gray-400 mb-1.5">Akun</label>
                         <Select id="filter-account" value={filterAccountId} onChange={e => setFilterAccountId(e.target.value)}>
                            <option value="all">Semua Akun</option>
                            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                        </Select>
                    </div>
                     <div>
                        <label htmlFor="filter-category" className="block text-sm font-medium text-gray-400 mb-1.5">Kategori</label>
                         <Select id="filter-category" value={filterCategoryId} onChange={e => setFilterCategoryId(e.target.value as any)} disabled={filterType === TransactionType.INCOME}>
                            <option value="all">Semua Kategori</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </Select>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {filteredTransactions.map(t => (
                    <div key={t.id} className="bg-gray-900/50 backdrop-blur-md rounded-xl shadow-lg ring-1 ring-white/10 p-4 animate-fade-in transition-all duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className={`flex-shrink-0 p-2 rounded-full ${t.type === TransactionType.INCOME ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                    {t.type === TransactionType.INCOME ? <Icons.Income className="w-6 h-6 text-green-400" /> : <Icons.Expense className="w-6 h-6 text-red-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-200 truncate">{t.description}</p>
                                    <div className="text-sm text-gray-400 flex items-center flex-wrap gap-x-2 gap-y-1 mt-1">
                                        <span>{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        <span className="text-gray-600 hidden sm:inline">|</span>
                                        <span>{getAccountName(t.accountId)}</span>
                                        {t.category && <>
                                            <span className="text-gray-600 hidden sm:inline">|</span>
                                            <span 
                                                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                                style={{ 
                                                    backgroundColor: `${t.category.color}26`, // ~15% opacity
                                                    color: t.category.color,
                                                }}
                                            >
                                                {t.category.name}
                                            </span>
                                        </>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-3 sm:mt-0">
                                <div className="text-right">
                                    <p className={`font-bold text-lg ${t.type === TransactionType.INCOME ? 'text-green-400' : 'text-red-400'}`}>
                                        {t.type === TransactionType.INCOME ? '+' : '-'} {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(t.amount)}
                                    </p>
                                </div>
                                {t.category?.name === foodCategoryName && t.spendingAnalysis === SpendingAnalysis.EXTRAVAGANT && (
                                    <button onClick={() => setShowSuggestionFor(showSuggestionFor === t.id ? null : t.id)} aria-label="Lihat Saran" className="p-2 text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-full transition-colors">
                                        <Icons.Lightbulb className="w-5 h-5" />
                                    </button>
                                )}
                                <button onClick={() => handleDeleteClick(t)} aria-label="Hapus Transaksi" className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors">
                                    <Icons.Trash className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {showSuggestionFor === t.id && (
                            <div className="mt-3 ml-0 sm:ml-14 animate-fade-in">
                                <AISuggestion transaction={t} healthProfile={healthProfile} />
                            </div>
                        )}
                    </div>
                ))}
                {filteredTransactions.length === 0 && (
                    <div className="text-center py-16 text-gray-500 bg-gray-900/30 rounded-xl">
                        <h3 className="text-lg font-semibold">Tidak Ada Transaksi</h3>
                        <p className="mt-1">Tidak ada transaksi yang cocok dengan filter yang Anda pilih.</p>
                    </div>
                )}
            </div>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Konfirmasi Penghapusan"
                message={
                    <p>
                        Anda yakin ingin menghapus transaksi <strong className="font-semibold text-white">"{transactionToDelete?.description}"</strong>? Tindakan ini tidak dapat dibatalkan.
                    </p>
                }
                isConfirming={isDeleting}
            />
        </div>
    );
};

export default TransactionHistory;
