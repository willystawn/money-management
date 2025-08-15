
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Account, Category } from '../types';

interface EditTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transactionId: string, transactionData: Omit<Transaction, 'id' | 'spendingAnalysis' | 'category' | 'created_at'>) => Promise<void>;
    transaction: Transaction | null;
    accounts: Account[];
    categories: Category[];
    isSaving: boolean;
}

// Re-using form components from TransactionForm for consistency
const FormField: React.FC<{label: string, htmlFor: string, children: React.ReactNode}> = ({label, htmlFor, children}) => (
  <div>
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>
    {children}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      {...props}
      className="w-full px-3 py-2.5 bg-gray-800/60 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500/70 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] placeholder:text-gray-500 transition-all"
    />
);

const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
    <div className="relative">
      <select
        {...props}
        style={{ colorScheme: 'dark' }}
        className="w-full px-3 py-2.5 bg-gray-800/60 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500/70 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all appearance-none"
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
);

const TypeButton: React.FC<{ label: string, isActive: boolean, onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`relative z-10 w-full py-2.5 text-sm font-semibold transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}
    >
        {label}
    </button>
);


const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
    isOpen,
    onClose,
    onSave,
    transaction,
    accounts,
    categories,
    isSaving,
}) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [date, setDate] = useState('');
    const [accountId, setAccountId] = useState('');

    useEffect(() => {
        if (transaction) {
            setDescription(transaction.description);
            setAmount(String(transaction.amount));
            setType(transaction.type);
            setCategoryId(transaction.categoryId);
            setDate(transaction.date);
            setAccountId(transaction.accountId);
        }
    }, [transaction]);

    if (!isOpen || !transaction) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !date || !accountId) {
            alert("Harap isi semua kolom yang diperlukan, termasuk memilih Akun.");
            return;
        };
        if (type === TransactionType.EXPENSE && !categoryId) {
            alert("Harap pilih kategori untuk pengeluaran.");
            return;
        }

        const transactionData: Omit<Transaction, 'id' | 'spendingAnalysis' | 'category' | 'created_at'> = {
            description,
            amount: parseFloat(amount),
            type,
            date,
            accountId,
            categoryId: type === TransactionType.EXPENSE ? categoryId : null,
        };
        
        onSave(transaction.id, transactionData);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        setAmount(rawValue);
    };

    const formatAmount = (value: string) => {
        if (!value) return '';
        return Number(value).toLocaleString('id-ID');
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            aria-modal="true"
            role="dialog"
        >
            <form 
                className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/20 ring-1 ring-white/10 w-full max-w-lg m-4 animate-fade-in"
                onClick={e => e.stopPropagation()}
                onSubmit={handleSubmit}
            >
                <div className="p-6 border-b border-white/10">
                    <h3 className="text-xl font-bold text-gray-100">Ubah Transaksi</h3>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="relative flex rounded-md bg-gray-800/60 p-1 ring-1 ring-gray-700">
                        <div className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-md bg-gradient-to-r transition-transform duration-300 ease-in-out ${type === TransactionType.EXPENSE ? 'translate-x-0 from-red-600 to-orange-600' : 'translate-x-full from-green-600 to-emerald-600'}`}></div>
                        <TypeButton label="Pengeluaran" isActive={type === TransactionType.EXPENSE} onClick={() => setType(TransactionType.EXPENSE)} />
                        <TypeButton label="Pemasukan" isActive={type === TransactionType.INCOME} onClick={() => setType(TransactionType.INCOME)} />
                    </div>

                    <FormField label="Akun" htmlFor="edit-account">
                        <Select id="edit-account" value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
                            {accounts.map((acc) => (<option key={acc.id} value={acc.id}>{acc.name}</option>))}
                        </Select>
                    </FormField>

                    <FormField label="Deskripsi" htmlFor="edit-description">
                        <Input type="text" id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} required/>
                    </FormField>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Jumlah (IDR)" htmlFor="edit-amount">
                            <Input type="text" inputMode="numeric" id="edit-amount" value={formatAmount(amount)} onChange={handleAmountChange} required />
                        </FormField>
                        <FormField label="Tanggal" htmlFor="edit-date">
                            <Input type="date" id="edit-date" value={date} onChange={(e) => setDate(e.target.value)} required/>
                        </FormField>
                    </div>

                    {type === TransactionType.EXPENSE && (
                    <div className="animate-fade-in">
                        <FormField label="Kategori" htmlFor="edit-category">
                            <Select id="edit-category" value={categoryId || ''} onChange={(e) => setCategoryId(e.target.value)}>
                                <option value="" disabled>Pilih Kategori</option>
                                {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                            </Select>
                        </FormField>
                    </div>
                    )}
                </div>
                <div className="flex justify-end gap-4 mt-2 p-6 bg-gray-900/50 rounded-b-2xl border-t border-white/10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-200 font-semibold transition-all"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-blue-600/30 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditTransactionModal;
