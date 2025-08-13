
export interface Account {
  id: string;
  name: string;
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum ExpenseCategory {
  FOOD = 'Makanan',
  TRANSPORTATION = 'Transportasi',
  BILLS = 'Tagihan',
  ENTERTAINMENT = 'Hiburan',
  SHOPPING = 'Belanja',
  HEALTH = 'Kesehatan',
  OTHER = 'Lainnya',
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
  category?: ExpenseCategory;
  date: string;
  spendingAnalysis?: SpendingAnalysis;
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  HISTORY = 'HISTORY',
  BUDGET = 'BUDGET',
  PROFILE = 'PROFILE',
  ACCOUNTS = 'ACCOUNTS',
}

export type Budget = {
    [key in ExpenseCategory]?: number;
};

export type DietPreference = 'Normal' | 'Vegetarian' | 'RendahGula';

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
}

export interface AIAnalysis {
  spendingSummary: string;
  nutritionalAdvice: string;
  actionableTips: string[];
}