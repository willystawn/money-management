import { ExpenseCategory, Budget, HealthProfile, Account } from './types';

export const expenseCategories: ExpenseCategory[] = [
  ExpenseCategory.FOOD,
  ExpenseCategory.TRANSPORTATION,
  ExpenseCategory.BILLS,
  ExpenseCategory.ENTERTAINMENT,
  ExpenseCategory.SHOPPING,
  ExpenseCategory.HEALTH,
  ExpenseCategory.OTHER,
];

export const categoryColors: { [key in ExpenseCategory]: string } = {
  [ExpenseCategory.FOOD]: '#ef4444', // red-500
  [ExpenseCategory.TRANSPORTATION]: '#f97316', // orange-500
  [ExpenseCategory.BILLS]: '#eab308', // yellow-500
  [ExpenseCategory.ENTERTAINMENT]: '#84cc16', // lime-500
  [ExpenseCategory.SHOPPING]: '#22c55e', // green-500
  [ExpenseCategory.HEALTH]: '#14b8a6', // teal-500
  [ExpenseCategory.OTHER]: '#64748b', // slate-500
};

export const DEFAULT_BUDGET: Budget = {
    [ExpenseCategory.FOOD]: 1500000,
    [ExpenseCategory.TRANSPORTATION]: 500000,
    [ExpenseCategory.ENTERTAINMENT]: 400000,
};

export const DEFAULT_HEALTH_PROFILE: HealthProfile = {
    dietPreference: 'Normal',
};