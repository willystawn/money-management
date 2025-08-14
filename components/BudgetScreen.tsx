
import React, { useState, useEffect } from 'react';
import { Budget, Category } from '../types';

interface BudgetScreenProps {
    budgets: Budget;
    updateBudgets: (newBudgets: Budget) => void;
    categories: Category[];
}

const BudgetScreen: React.FC<BudgetScreenProps> = ({ budgets, updateBudgets, categories }) => {
    const [localBudgets, setLocalBudgets] = useState<Budget>(budgets);

    useEffect(() => {
        setLocalBudgets(budgets);
    }, [budgets]);

    useEffect(() => {
        const handler = setTimeout(() => {
             if (JSON.stringify(localBudgets) !== JSON.stringify(budgets)) {
                updateBudgets(localBudgets);
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [localBudgets, budgets, updateBudgets]);
    
    const handleBudgetChange = (categoryId: string, value: string) => {
        const newAmount = parseInt(value, 10);
        setLocalBudgets(prev => ({
            ...prev,
            [categoryId]: isNaN(newAmount) ? 0 : newAmount,
        }));
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-lg ring-1 ring-white/10 p-6 sm:p-8 max-w-3xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-100 mb-2">Pengaturan Budget Bulanan</h2>
                <p className="text-gray-400">Atur alokasi dana bulanan untuk setiap kategori agar pengeluaran lebih terkontrol.</p>
            </div>
            
            <div className="space-y-4">
                {categories.map(category => (
                    <div key={category.id} className="flex items-center justify-between p-4 bg-gray-800/60 rounded-lg ring-1 ring-white/10">
                        <label htmlFor={`budget-${category.id}`} className="font-medium text-gray-300 flex items-center">
                           <span className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: category.color }}></span>
                           {category.name}
                        </label>
                        <div className="flex items-center">
                            <span className="text-gray-400 mr-2">Rp</span>
                            <input
                                type="number"
                                id={`budget-${category.id}`}
                                value={localBudgets[category.id] || ''}
                                onChange={(e) => handleBudgetChange(category.id, e.target.value)}
                                placeholder="0"
                                className="w-40 px-3 py-2 text-right bg-gray-700/80 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500/70 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                            />
                        </div>
                    </div>
                ))}
            </div>
             <div className="mt-8 text-center text-sm text-gray-500">
                <p>💡 Perubahan disimpan secara otomatis.</p>
            </div>
        </div>
    );
};

export default BudgetScreen;
