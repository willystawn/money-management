
export interface Account {
  id: string;
  name: string;
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface Category {
    id: string;
    name: string;
    color: string;
    user_id: string;
}

export enum SpendingAnalysis {
  THRIFTY = 'Hemat',
  REASONABLE = 'Wajar',
  EXTRAVAGANT = 'Cenderung Boros',
}

export interface Transaction {
  id: string;
  accountId: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: { id: string; name: string; color: string } | null;
  categoryId: string | null;
  date: string;
  spendingAnalysis?: SpendingAnalysis;
  created_at: string;
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  HISTORY = 'HISTORY',
  BUDGET = 'BUDGET',
  PROFILE = 'PROFILE',
  ACCOUNTS = 'ACCOUNTS',
  CATEGORIES = 'CATEGORIES',
}

export type Budget = {
    [categoryId: string]: number;
};

export type DietPreference = 'Normal' | 'Vegetarian' | 'RendahGula' | 'Ibu Hamil' | 'Badan Berisi' | 'Pertumbuhan Anak';

export interface HealthProfile {
    dietPreference: DietPreference;
}

export interface FoodItem {
    id: string;
    name: string;
    estimatedPrice: number;
    calories: number;

    isVegetarian: boolean;
    isLowSugar: boolean;

    // New properties for targeted suggestions
    isPregnancyFriendly?: boolean;
    isKidFriendly?: boolean;
    isBulkingFriendly?: boolean;
}

export interface AIAnalysis {
  spendingSummary: string;
  nutritionalAdvice: string;
  actionableTips: string[];
}