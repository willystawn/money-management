
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Account, Category } from '../types';

interface TransactionFormProps {
  addTransaction: (transaction: Omit<Transaction, 'id' | 'spendingAnalysis' | 'category'>) => void;
  accounts: Account[];
  categories: Category[];
}

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


const TransactionForm: React.FC<TransactionFormProps> = ({ addTransaction, accounts, categories }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState<string>('');

  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);
  
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      const foodCategory = categories.find(c => c.name === 'Makanan');
      setCategoryId(foodCategory ? foodCategory.id : categories[0].id);
    }
  }, [categories, categoryId]);


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

    const transactionData: Omit<Transaction, 'id' | 'spendingAnalysis' | 'category'> = {
      description,
      amount: parseFloat(amount),
      type,
      date,
      accountId,
      categoryId: type === TransactionType.EXPENSE ? categoryId : null,
    };

    addTransaction(transactionData);

    setDescription('');
    setAmount('');
  };
  
  const TypeButton: React.FC<{
      label: string, 
      isActive: boolean, 
      onClick: () => void, 
  }> = ({ label, isActive, onClick }) => (
      <button
          type="button"
          onClick={onClick}
          className={`relative z-10 w-full py-2.5 text-sm font-semibold transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}
      >
          {label}
      </button>
  );

  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-lg h-full ring-1 ring-white/10 p-6">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">Input Transaksi Baru</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="relative flex rounded-md bg-gray-800/60 p-1 ring-1 ring-gray-700">
            <div className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-md bg-gradient-to-r transition-transform duration-300 ease-in-out ${type === TransactionType.EXPENSE ? 'translate-x-0 from-red-600 to-orange-600' : 'translate-x-full from-green-600 to-emerald-600'}`}></div>
            <TypeButton label="Pengeluaran" isActive={type === TransactionType.EXPENSE} onClick={() => setType(TransactionType.EXPENSE)} />
            <TypeButton label="Pemasukan" isActive={type === TransactionType.INCOME} onClick={() => setType(TransactionType.INCOME)} />
        </div>
        
         <FormField label="Akun" htmlFor="account">
            <Select id="account" value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
              <option value="" disabled>Pilih Akun</option>
              {accounts.map((acc) => (<option key={acc.id} value={acc.id}>{acc.name}</option>))}
            </Select>
        </FormField>

        <FormField label="Deskripsi" htmlFor="description">
          <Input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="cth: Makan siang" required/>
        </FormField>
        
        <div className="grid grid-cols-2 gap-4">
            <FormField label="Jumlah (IDR)" htmlFor="amount">
              <Input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50000" required min="0"/>
            </FormField>
             <FormField label="Tanggal" htmlFor="date">
                <Input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required/>
            </FormField>
        </div>

        {type === TransactionType.EXPENSE && (
          <div className="animate-fade-in">
            <FormField label="Kategori" htmlFor="category">
                <Select id="category" value={categoryId || ''} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="" disabled>Pilih Kategori</option>
                  {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </Select>
            </FormField>
          </div>
        )}
        
        <button
          type="submit"
          className="w-full py-3 mt-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-md shadow-lg hover:shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 focus:ring-blue-500 transition-all transform hover:scale-105"
        >
          Tambah Transaksi
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
