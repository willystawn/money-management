
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { Transaction, View, Budget, HealthProfile, ExpenseCategory, TransactionType, SpendingAnalysis, Account } from './types';
import { DEFAULT_BUDGET, DEFAULT_HEALTH_PROFILE } from './constants';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionHistory from './components/TransactionHistory';
import LoginScreen from './components/LoginScreen';
import BudgetScreen from './components/BudgetScreen';
import ProfileScreen from './components/ProfileScreen';
import AccountsScreen from './components/AccountsScreen';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget>(DEFAULT_BUDGET);
  const [healthProfile, setHealthProfile] = useState<HealthProfile>(DEFAULT_HEALTH_PROFILE);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setTransactions([]);
        setAccounts([]);
        setBudgets(DEFAULT_BUDGET);
        setHealthProfile(DEFAULT_HEALTH_PROFILE);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async (userId: string) => {
    setLoading(true);
    try {
        const [accountsRes, transactionsRes, budgetRes, profileRes] = await Promise.all([
            supabase.from('accounts').select('*').eq('user_id', userId),
            supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
            supabase.from('budgets').select('budget_data').eq('user_id', userId).single(),
            supabase.from('health_profiles').select('diet_preference').eq('user_id', userId).single()
        ]);

        if (accountsRes.error) throw accountsRes.error;
        setAccounts(accountsRes.data || []);

        if (transactionsRes.error) throw transactionsRes.error;
        const formattedTransactions = transactionsRes.data?.map(t => ({
          ...t,
          accountId: t.account_id,
          spendingAnalysis: t.spending_analysis
        })) || [];
        setTransactions(formattedTransactions as Transaction[]);

        if (budgetRes.data?.budget_data) {
            setBudgets(budgetRes.data.budget_data as Budget);
        } else {
            await supabase.from('budgets').upsert({ user_id: userId, budget_data: DEFAULT_BUDGET });
            setBudgets(DEFAULT_BUDGET);
        }

        if (profileRes.data?.diet_preference) {
            setHealthProfile({ dietPreference: profileRes.data.diet_preference });
        } else {
            await supabase.from('health_profiles').upsert({ user_id: userId, diet_preference: DEFAULT_HEALTH_PROFILE.dietPreference });
            setHealthProfile(DEFAULT_HEALTH_PROFILE);
        }
    } catch (error: any) {
        if (error.code !== 'PGRST116') { // Ignore error for no rows found on .single()
            console.error('Error fetching data:', error.message);
        }
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchData(session.user.id);
    } else {
      setLoading(false);
    }
  }, [session, fetchData]);

  const analyzeSpending = useCallback(async (transaction: Omit<Transaction, 'id' | 'spendingAnalysis'>): Promise<SpendingAnalysis> => {
    if (transaction.type !== TransactionType.EXPENSE || transaction.category !== ExpenseCategory.FOOD) {
      return SpendingAnalysis.REASONABLE;
    }
    if (transaction.amount > 100000) return SpendingAnalysis.EXTRAVAGANT;
    if (transaction.amount < 20000) return SpendingAnalysis.THRIFTY;
    return SpendingAnalysis.REASONABLE;
  }, []);

  const addTransaction = useCallback(async (transactionData: Omit<Transaction, 'id' | 'spendingAnalysis'>) => {
    if (!session?.user) return;
    
    const spendingAnalysis = await analyzeSpending(transactionData);
    const { accountId, ...rest } = transactionData;
    const dbTransaction = {
      ...rest,
      user_id: session.user.id,
      account_id: accountId,
      spending_analysis: spendingAnalysis,
    };

    const { data, error } = await supabase.from('transactions').insert(dbTransaction).select().single();

    if (error) {
        console.error('Error adding transaction:', error);
        alert(`Gagal menambahkan transaksi: ${error.message}`);
    } else if (data) {
        const formattedTransaction = {
            ...data,
            accountId: data.account_id,
            spendingAnalysis: data.spending_analysis
        } as Transaction;
        setTransactions(prev => [formattedTransaction, ...prev]);
    }
  }, [session, analyzeSpending]);

  const deleteTransaction = useCallback(async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) {
        console.error('Error deleting transaction:', error);
        alert(`Gagal menghapus transaksi: ${error.message}`);
    } else {
        setTransactions(prev => prev.filter(t => t.id !== id));
    }
  }, []);

  const addAccount = useCallback(async (name: string) => {
      if (!session?.user) return;
      const { data, error } = await supabase.from('accounts').insert({ name, user_id: session.user.id }).select().single();
      if (error) {
          console.error("Error adding account:", error.message);
          if (error.code === '23505') {
              alert(`Gagal menambahkan akun: Akun dengan nama "${name}" sudah ada.`);
          } else {
              alert(`Gagal menambahkan akun: ${error.message}`);
          }
      } else if (data) {
          setAccounts(prev => [...prev, data]);
      }
  }, [session]);
  
  const deleteAccount = useCallback(async (id: string) => {
      const { data: transactionData, error: transactionError } = await supabase.from('transactions').select('id').eq('account_id', id).limit(1);
      
      if(transactionError) {
          alert(`Gagal memeriksa transaksi: ${transactionError.message}`);
          return;
      }
      if (transactionData && transactionData.length > 0) {
          alert('Gagal menghapus akun. Hapus atau pindahkan transaksi terkait terlebih dahulu.');
          return;
      }
      
      const { error } = await supabase.from('accounts').delete().eq('id', id);
      if(error) {
          alert(`Gagal menghapus akun: ${error.message}`);
      } else {
          setAccounts(prev => prev.filter(a => a.id !== id));
      }
  }, []);

  const updateBudgets = useCallback(async (newBudgets: Budget) => {
    if (!session?.user) return;
    setBudgets(newBudgets);
    const { error } = await supabase.from('budgets').upsert({ user_id: session.user.id, budget_data: newBudgets });
    if(error) {
        console.error('Error updating budget:', error);
        alert('Gagal menyimpan budget. Perubahan Anda mungkin tidak tersimpan.');
    }
  }, [session]);

  const updateProfile = useCallback(async (newProfile: HealthProfile) => {
    if (!session?.user) return;
    setHealthProfile(newProfile);
    const { error } = await supabase.from('health_profiles').upsert({ user_id: session.user.id, diet_preference: newProfile.dietPreference });
    if(error) {
        console.error('Error updating profile:', error);
        alert('Gagal menyimpan profil. Perubahan Anda mungkin tidak tersimpan.');
    }
  }, [session]);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const CurrentViewComponent = useMemo(() => {
    if (!session?.user) return null;
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard transactions={transactions} addTransaction={addTransaction} budgets={budgets} healthProfile={healthProfile} accounts={accounts} />;
      case View.HISTORY:
        return <TransactionHistory transactions={transactions} deleteTransaction={deleteTransaction} healthProfile={healthProfile} accounts={accounts} />;
      case View.ACCOUNTS:
        return <AccountsScreen accounts={accounts} addAccount={addAccount} deleteAccount={deleteAccount} />;
      case View.BUDGET:
        return <BudgetScreen budgets={budgets} updateBudgets={updateBudgets} />;
      case View.PROFILE:
        return <ProfileScreen profile={healthProfile} updateProfile={updateProfile} />;
      default:
        return <Dashboard transactions={transactions} addTransaction={addTransaction} budgets={budgets} healthProfile={healthProfile} accounts={accounts} />;
    }
  }, [currentView, transactions, accounts, budgets, healthProfile, addTransaction, deleteTransaction, addAccount, deleteAccount, updateBudgets, updateProfile, session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
          <svg className="animate-spin h-10 w-10 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <div className="bg-gray-950 text-gray-200 min-h-screen">
      <Header currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {CurrentViewComponent}
      </main>
    </div>
  );
};

export default App;