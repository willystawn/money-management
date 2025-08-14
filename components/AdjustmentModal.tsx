import React, { useState, useEffect } from 'react';
import { Account } from '../types';

interface AdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (newBalance: number) => Promise<void>;
    account: Account | null;
    currentBalance: number;
    isAdjusting: boolean;
}

const AdjustmentModal: React.FC<AdjustmentModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    account,
    currentBalance,
    isAdjusting,
}) => {
    const [newBalance, setNewBalance] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            setNewBalance(String(currentBalance));
        }
    }, [isOpen, currentBalance]);

    if (!isOpen || !account) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const balanceValue = parseFloat(newBalance);
        if (!isNaN(balanceValue)) {
            await onConfirm(balanceValue);
        } else {
            alert('Harap masukkan jumlah saldo yang valid.');
        }
    };

    const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        setNewBalance(rawValue);
    };

    const formatBalance = (value: string) => {
        if (!value) return '';
        return Number(value).toLocaleString('id-ID');
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <form 
                className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/20 ring-1 ring-white/10 w-full max-w-md m-4 p-6 text-center animate-fade-in"
                onClick={e => e.stopPropagation()}
                onSubmit={handleSubmit}
            >
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                    Sesuaikan Saldo
                </h3>
                <div className="text-gray-300 my-4 text-left space-y-4">
                    <p>
                        Sesuaikan saldo untuk akun <strong className="font-semibold text-white">"{account.name}"</strong>. 
                        Transaksi penyesuaian akan dibuat secara otomatis.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Saldo Saat Ini</label>
                        <p className="text-lg font-semibold text-gray-200 mt-1">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(currentBalance)}</p>
                    </div>
                     <div>
                        <label htmlFor="new-balance" className="block text-sm font-medium text-gray-400 mb-1.5">Saldo Baru (IDR)</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            id="new-balance"
                            value={formatBalance(newBalance)}
                            onChange={handleBalanceChange}
                            placeholder="Masukkan saldo baru"
                            required
                            className="w-full text-lg px-3 py-2.5 bg-gray-800/60 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500/70 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] placeholder:text-gray-500 transition-all"
                        />
                    </div>
                </div>
                <div className="flex justify-center gap-4 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-200 font-semibold transition-all"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isAdjusting}
                        className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-blue-600/30 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        {isAdjusting ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdjustmentModal;