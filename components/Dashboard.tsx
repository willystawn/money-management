
import React, { useMemo, useState, useCallback } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { GoogleGenAI, Type } from '@google/genai';
import { Transaction, TransactionType, Budget, HealthProfile, AIAnalysis, Account, Category, DietPreference } from '../types';
import TransactionForm from './TransactionForm';

interface DashboardProps {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'spendingAnalysis' | 'category' | 'created_at'>) => void;
  budgets: Budget;
  healthProfile: HealthProfile;
  accounts: Account[];
  categories: Category[];
}

// Glassmorphism Card Wrapper
const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
    <div className={`bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-lg ring-1 ring-white/10 ${className}`}>
        {children}
    </div>
);

const SummaryCard: React.FC<{ title: string; amount: number; color: string; icon: React.ReactNode }> = ({ title, amount, color, icon }) => (
    <Card className="p-5 flex items-center space-x-4">
        <div className={`p-3 rounded-full bg-gradient-to-br ${color} shadow-lg shadow-black/20`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-100">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)}
            </p>
        </div>
    </Card>
);

const AccountBalancesCard: React.FC<{ accounts: Account[], transactions: Transaction[] }> = ({ accounts, transactions }) => {
    const balances = useMemo(() => {
        return accounts.map(account => {
            const balance = transactions
                .filter(t => t.accountId === account.id)
                .reduce((acc, t) => t.type === TransactionType.INCOME ? acc + t.amount : acc - t.amount, 0);
            return { name: account.name, balance };
        });
    }, [accounts, transactions]);

    return (
        <Card className="p-5 flex flex-col">
            <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-blue-600/30 to-indigo-600/30 shadow-lg shadow-black/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-100">Saldo per Akun</h3>
                    <p className="text-xs text-gray-500 -mt-1">Total saldo sepanjang waktu</p>
                </div>
            </div>
            <div className="space-y-2 max-h-28 overflow-y-auto pr-2">
                {balances.length > 0 ? balances.map(acc => (
                    <div key={acc.name} className="flex justify-between items-baseline text-sm gap-2">
                        <p className="text-gray-400 truncate" title={acc.name}>{acc.name}</p>
                        <p className="font-semibold text-gray-200 flex-shrink-0">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(acc.balance)}</p>
                    </div>
                )) : (
                    <p className="text-sm text-center text-gray-500 pt-4">Belum ada akun.</p>
                )}
            </div>
        </Card>
    );
};


const FoodBudgetCard: React.FC<{spent: number, budget: number}> = ({ spent, budget }) => {
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    const isOverBudget = percentage > 100;
    const progressBarColor = isOverBudget ? 'from-red-500 to-orange-500' : 'from-green-500 to-emerald-500';

    return (
        <Card className="p-5 flex flex-col justify-between">
            <div>
                <p className="text-sm text-gray-400">Budget Makanan Bulan Ini</p>
                <p className="text-2xl font-bold text-gray-100 mt-1">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(spent)}
                    <span className="text-base font-normal text-gray-500"> / {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(budget)}</span>
                </p>
                 {isOverBudget && <p className="text-sm text-red-400 font-semibold mt-1">Anda melebihi budget!</p>}
            </div>
            <div className="mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className={`bg-gradient-to-r ${progressBarColor} h-2 rounded-full transition-all duration-500`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                </div>
                <p className="text-right text-sm text-gray-400 mt-1">{percentage.toFixed(0)}% Terpakai</p>
            </div>
        </Card>
    )
}

const AIAssistantCard: React.FC<{
    transactions: Transaction[], 
    budgets: Budget, 
    healthProfile: HealthProfile,
    categories: Category[]
}> = ({ transactions, budgets, healthProfile, categories }) => {
    const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const foodCategory = useMemo(() => categories.find(c => c.name === 'Makanan'), [categories]);
    
    const getDietProfileDescription = (preference: DietPreference) => {
        switch (preference) {
            case 'Ibu Hamil':
                return "Pengguna adalah ibu hamil yang membutuhkan nutrisi penting untuk kesehatan ibu dan perkembangan janin, seperti asam folat, zat besi, dan kalsium.";
            case 'Badan Berisi':
                return "Pengguna ingin menaikkan berat badan secara sehat (menambah massa otot, bukan hanya lemak) dengan diet surplus kalori yang bergizi.";
            case 'Pertumbuhan Anak':
                return "Pengguna fokus menyediakan makanan bergizi untuk mendukung pertumbuhan dan perkembangan optimal anak-anak.";
            case 'Vegetarian':
                 return "Pengguna adalah seorang vegetarian yang ingin memastikan asupan gizi seimbang dari sumber nabati.";
            case 'RendahGula':
                 return "Pengguna fokus pada diet rendah gula untuk menjaga kadar gula darah dan kesehatan secara umum.";
            case 'Normal':
            default:
                return "Pengguna ingin makan lebih sehat untuk jangka panjang, menghindari makanan tidak sehat (gorengan, terlalu manis, olahan), dan menjaga berat badan ideal.";
        }
    }

    const handleAnalysis = useCallback(async () => {
        setIsAnalyzing(true);
        setError(null);
        setAnalysis(null);

        if (!foodCategory) {
            setError("Kategori 'Makanan' tidak ditemukan. Analisis tidak dapat dilanjutkan.");
            setIsAnalyzing(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const recentFoodTransactions = transactions
                .filter(t => t.categoryId === foodCategory.id && new Date(t.date) > thirtyDaysAgo)
                .map(t => `- ${t.date}: ${t.description} (Rp ${t.amount.toLocaleString('id-ID')})`)
                .join('\n');

            if (recentFoodTransactions.length === 0) {
                setError("Tidak ada data transaksi makanan dalam 30 hari terakhir untuk dianalisis.");
                setIsAnalyzing(false);
                return;
            }
            
            const foodBudget = budgets[foodCategory.id] || 0;
            const dietProfileDescription = getDietProfileDescription(healthProfile.dietPreference);

            const prompt = `
Anda adalah asisten keuangan dan gizi pribadi yang cerdas, ramah, dan praktis untuk aplikasi 'Manajer Keuangan Cerdas'. Tugas Anda adalah menganalisis data pengguna dan memberikan wawasan yang bermanfaat dalam Bahasa Indonesia.

Berikut adalah data pengguna:
- Profil Kesehatan: ${dietProfileDescription}
- Budget Makanan Bulanan: Rp ${foodBudget.toLocaleString('id-ID')}.
- Transaksi Makanan 30 Hari Terakhir:
${recentFoodTransactions}

Tugas Anda, berdasarkan data di atas, berikan analisis dalam format JSON.
`;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    spendingSummary: {
                        type: Type.STRING,
                        description: 'Ringkasan singkat (1-2 kalimat) tentang kebiasaan belanja makanan pengguna. Sebutkan apakah mereka cenderung hemat atau boros dibandingkan budget.',
                    },
                    nutritionalAdvice: {
                        type: Type.STRING,
                        description: 'Analisis singkat dari sisi kesehatan (2-3 kalimat). Fokus pada kualitas makanan (misal: apakah gizinya seimbang, terlalu banyak gorengan/gula, dll) dan berikan saran perbaikan untuk kesehatan jangka panjang, bukan tentang kalori.',
                    },
                    actionableTips: {
                        type: Type.ARRAY,
                        description: '3 tips praktis dan spesifik untuk membantu pengguna makan lebih sehat dan hemat. Setiap tip harus dalam satu kalimat.',
                        items: { type: Type.STRING }
                    },
                },
                required: ['spendingSummary', 'nutritionalAdvice', 'actionableTips']
            };

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                }
            });

            const jsonText = response.text.trim();
            const parsedAnalysis: AIAnalysis = JSON.parse(jsonText);
            setAnalysis(parsedAnalysis);

        } catch (err) {
            console.error("AI Analysis Error:", err);
            setError("Gagal mendapatkan analisis AI. Silakan coba lagi nanti.");
        } finally {
            setIsAnalyzing(false);
        }
    }, [transactions, budgets, healthProfile, foodCategory]);
    
    const AnalysisResultItem = ({icon, title, children}: {icon: React.ReactNode, title: string, children: React.ReactNode}) => (
        <div className="bg-gray-800/60 p-4 rounded-lg ring-1 ring-white/10">
            <h4 className="font-semibold text-gray-300 flex items-center gap-2">{icon}{title}</h4>
            <div className="text-sm text-gray-400 mt-2 pl-7">{children}</div>
        </div>
    );
    
    return (
        <Card className="p-6 bg-gradient-to-br from-blue-900/30 to-indigo-900/30">
            <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl animate-pulse">✨</span>
                <div>
                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">Asisten AI Cerdas</h3>
                    <p className="text-sm text-gray-400">Dapatkan analisis gizi dan pengeluaran pribadi Anda.</p>
                </div>
            </div>

            {isAnalyzing && (
                 <div className="flex items-center justify-center h-48">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                        <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="mt-2">Menganalisis data Anda...</span>
                    </div>
                 </div>
            )}

            {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-md ring-1 ring-red-500/30">{error}</p>}

            {!isAnalyzing && !analysis && (
                <div className="text-center mt-6">
                    <button
                        onClick={handleAnalysis}
                        disabled={isAnalyzing || !foodCategory}
                        title={!foodCategory ? "Kategori 'Makanan' dibutuhkan untuk analisis" : "Dapatkan Analisis"}
                        className="py-3 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 focus:ring-blue-500 transition-all transform hover:scale-105 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        Dapatkan Analisis
                    </button>
                </div>
            )}
            
            {analysis && (
                 <div className="space-y-4 mt-4 animate-fade-in">
                    <AnalysisResultItem icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" /></svg>} title="Ringkasan Pengeluaran">
                       <p>{analysis.spendingSummary}</p>
                    </AnalysisResultItem>
                    <AnalysisResultItem icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>} title="Analisis Gizi">
                       <p>{analysis.nutritionalAdvice}</p>
                    </AnalysisResultItem>
                    <AnalysisResultItem icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>} title="Tips Cerdas">
                         <ul className="list-disc list-inside space-y-1">
                           {analysis.actionableTips.map((tip, index) => <li key={index}>{tip}</li>)}
                        </ul>
                    </AnalysisResultItem>
                    <div className="text-center pt-2">
                        <button onClick={handleAnalysis} className="text-sm text-blue-400 hover:text-blue-300 font-semibold transition-colors">Analisis Lagi</button>
                    </div>
                </div>
            )}

        </Card>
    )
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, addTransaction, budgets, healthProfile, accounts, categories }) => {
  const foodCategory = useMemo(() => categories.find(c => c.name === 'Makanan'), [categories]);

  const { totalIncome, totalExpense, foodExpenseThisMonth } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });

    const income = monthlyTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthlyTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const foodExpense = monthlyTransactions
      .filter(t => foodCategory && t.categoryId === foodCategory.id)
      .reduce((sum, t) => sum + t.amount, 0);

    return { totalIncome: income, totalExpense: expense, foodExpenseThisMonth: foodExpense };
  }, [transactions, foodCategory]);

  const foodBudget = useMemo(() => (foodCategory ? budgets[foodCategory.id] : 0) || 0, [budgets, foodCategory]);

  const pieChartData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const expenseByCategory = transactions
        .filter(t => t.type === TransactionType.EXPENSE && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
        .reduce((acc, t) => {
            if (t.category) {
                 acc[t.category.id] = {
                    name: t.category.name,
                    color: t.category.color,
                    value: (acc[t.category.id]?.value || 0) + t.amount,
                };
            }
            return acc;
        }, {} as { [key: string]: { name: string, color: string, value: number } });

    return Object.values(expenseByCategory).sort((a, b) => b.value - a.value);
  }, [transactions]);
  
  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard title="Pemasukan (Bulan Ini)" amount={totalIncome} color="from-green-500/30 to-emerald-500/30" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" /></svg>} />
            <SummaryCard title="Pengeluaran (Bulan Ini)" amount={totalExpense} color="from-red-500/30 to-orange-500/30" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" /></svg>} />
            <FoodBudgetCard spent={foodExpenseThisMonth} budget={foodBudget} />
            <AccountBalancesCard accounts={accounts} transactions={transactions} />
        </div>
        
        <AIAssistantCard transactions={transactions} budgets={budgets} healthProfile={healthProfile} categories={categories} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <TransactionForm addTransaction={addTransaction} accounts={accounts} categories={categories} />
            </div>
            <div className="lg:col-span-2">
              <Card className="p-6 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-100 mb-4 flex-shrink-0">Porsi Pengeluaran (Bulan Ini)</h3>
                {pieChartData.length > 0 ? (
                    <div className="flex-grow flex items-center justify-center min-h-0">
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={pieChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={110}
                                    innerRadius={60}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    paddingAngle={2}
                                    label={({ name, percent, ...rest }: { name?: string, percent?: number, [key: string]: any }) => (
                                        <text
                                            {...rest}
                                            fill="#e5e7eb"
                                            fontSize="0.8rem"
                                            dominantBaseline="central"
                                        >
                                            {percent ? `${(percent * 100).toFixed(0)}%` : null}
                                        </text>
                                    )}
                                >
                                    {pieChartData.map((entry) => (
                                        <Cell key={`cell-${entry.name}`} fill={entry.color} stroke={'none'} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)}
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(3, 7, 18, 0.95)', 
                                        backdropFilter: 'blur(10px)', 
                                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                                        borderRadius: '0.75rem',
                                        boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                                    }}
                                    labelStyle={{ color: '#f9fafb', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#f9fafb' }}
                                 />
                                <Legend iconType="circle" wrapperStyle={{ color: '#e5e7eb', paddingTop: '20px' }}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-gray-500">
                        <p>Belum ada data pengeluaran bulan ini.</p>
                    </div>
                )}
              </Card>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;