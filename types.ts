export type TransactionType = 'income' | 'expense';
export type Theme = 'dark' | 'light';
export type UserRole = 'user' | 'admin';

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: string[]; 
  currencyCode: string;
  categories: string[];
}

export interface Transaction {
  id: string;
  workspaceId: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: TransactionType;
  createdBy: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  preferences?: {
    theme: Theme;
  }
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CNY', symbol: '元', name: 'Chinese Yuan' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'BTC', symbol: '₿', name: 'Bitcoin' },
  { code: 'ETH', symbol: 'Ξ', name: 'Ethereum' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' }
];

export const getCurrencySymbol = (code: string) => 
  CURRENCIES.find(c => c.code === code)?.symbol || '$';