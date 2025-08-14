import React, { useState, useMemo } from 'react';
import { Account, Transaction, TransactionType } from '../types';
import ConfirmationModal from './ConfirmationModal';
import AdjustmentModal from './AdjustmentModal';

interface AccountsScreenProps {
    accounts: Account[];
    transactions: Transaction[];
    addAccount: (name: string) => void;
    deleteAccount: (id: string) => Promise<void>;
    adjustAccountBalance: (accountId: string, newBalance: number) => Promise<void>;
}

const TrashIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const ScaleIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52v16.5m-13.5-16.5v16.5m13.5 0c.371.017.74.034 1.11.05m-1.11-.05a2.25 2.25 0 01-2.22 2.22h-2.22a2.25 2.25 0 01-2.22-2.22m2.22 0a2.25 2.25 0 00-2.22 2.22H6.75a2.25 2.25 0 00-2.22-2.22m13.5 0M5.25 4.97A48.416 48.416 0 0112 4.5c2.291 0 4.545.16 6.75.47m-13.5 0c-1.01.143-2.01.317-3 .52m3-.52" />
    </svg>
);


const AccountsScreen: React.FC<AccountsScreenProps> = ({ accounts, transactions, addAccount, deleteAccount, adjustAccountBalance }) => {
    const [newAccountName, setNewAccountName] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [accountToAdjust, setAccountToAdjust] = useState<Account | null>(null);
    const [isAdjusting, setIsAdjusting] = useState(false);

    const handleAddAccount = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = newAccountName.trim();
        if (trimmedName) {
            if (accounts.some(acc => acc.name.toLowerCase() === trimmedName.toLowerCase())) {
                alert(`Akun dengan nama "${trimmedName}" sudah ada.`);
                return;
            }
            addAccount(trimmedName);
            setNewAccountName('');
        }
    };

    const handleDeleteClick = (account: Account) => {
        setAccountToDelete(account);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (accountToDelete) {
            setIsDeleting(true);
            await deleteAccount(accountToDelete.id);
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setAccountToDelete(null);
        }
    };

    const accountBalances = useMemo(() => {
        const balances = new Map<string, number>();
        accounts.forEach(acc => {
            const balance = transactions
                .filter(t => t.accountId === acc.id)
                .reduce((sum, t) => t.type === TransactionType.INCOME ? sum + t.amount : sum - t.amount, 0);
            balances.set(acc.id, balance);
        });
        return balances;
    }, [accounts, transactions]);

    const handleAdjustClick = (account: Account) => {
        setAccountToAdjust(account);
        setIsAdjustModalOpen(true);
    };

    const handleConfirmAdjust = async (newBalance: number) => {
        if (accountToAdjust) {
            setIsAdjusting(true);
            await adjustAccountBalance(accountToAdjust.id, newBalance);
            setIsAdjusting(false);
            setIsAdjustModalOpen(false);
            setAccountToAdjust(null);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
            
            <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-lg ring-1 ring-white/10 p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-100 mb-2">Tambah Akun Baru</h2>
                <p className="text-gray-400 mb-6">Buat sumber dana baru seperti dompet digital atau rekening bank.</p>
                <form onSubmit={handleAddAccount} className="space-y-4">
                    <div>
                        <label htmlFor="account-name" className="block text-sm font-medium text-gray-400 mb-1.5">Nama Akun</label>
                        <input
                            type="text"
                            id="account-name"
                            value={newAccountName}
                            onChange={(e) => setNewAccountName(e.target.value)}
                            placeholder="cth: GoPay"
                            required
                            className="w-full px-3 py-2.5 bg-gray-800/60 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500/70 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] placeholder:text-gray-500 transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 focus:ring-blue-500 transition-all transform hover:scale-105"
                    >
                        Tambah Akun
                    </button>
                </form>
            </div>

            <div className="lg:col-span-3 bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-lg ring-1 ring-white/10 p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-100 mb-6">Daftar Akun Anda</h2>
                <div className="space-y-3">
                    {accounts.length > 0 ? accounts.map(account => (
                        <div key={account.id} className="flex items-center justify-between p-4 bg-gray-800/60 rounded-lg ring-1 ring-white/10">
                            <div>
                                <span className="font-medium text-gray-200">{account.name}</span>
                                <p className="text-sm text-gray-400">
                                    Saldo: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(accountBalances.get(account.id) || 0)}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleAdjustClick(account)}
                                    className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-colors"
                                    aria-label={`Sesuaikan saldo ${account.name}`}
                                >
                                    <ScaleIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(account)}
                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                                    aria-label={`Hapus akun ${account.name}`}
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10">
                            <p className="text-gray-500">Belum ada akun yang ditambahkan.</p>
                        </div>
                    )}
                </div>
            </div>
            <AdjustmentModal 
                isOpen={isAdjustModalOpen}
                onClose={() => setIsAdjustModalOpen(false)}
                onConfirm={handleConfirmAdjust}
                account={accountToAdjust}
                currentBalance={accountToAdjust ? (accountBalances.get(accountToAdjust.id) || 0) : 0}
                isAdjusting={isAdjusting}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Konfirmasi Penghapusan Akun"
                message={
                    <p>
                        Anda yakin ingin menghapus akun <strong className="font-semibold text-white">"{accountToDelete?.name}"</strong>?
                        <br/>
                        <span className="text-sm text-yellow-400 mt-2 block">Akun yang memiliki transaksi tidak dapat dihapus.</span>
                    </p>
                }
                isConfirming={isDeleting}
            />
        </div>
    );
};

export default AccountsScreen;
