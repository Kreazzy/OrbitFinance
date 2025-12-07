export type TransactionType = 'income' | 'expense';

export type Theme = 'dark' | 'light';

export type UserRole = 'user' | 'admin';

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: string[]; // array of emails
  currency: string;
  categories: string[]; // Custom categories
}

export interface Transaction {
  id: string;
  workspaceId: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: TransactionType;
  createdBy: string; // user email
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