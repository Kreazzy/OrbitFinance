import { create } from 'zustand';
import { Transaction, UserProfile, AuthState, Workspace, Theme } from './types';
import { mockDb } from './services/mockDb';

interface AppState extends AuthState {
  theme: Theme;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  transactions: Transaction[];
  
  // Admin State
  adminView: boolean;
  adminUsersList: UserProfile[];
  adminStats: { users: number, workspaces: number, transactions: number } | null;

  // Auth & Theme
  initApp: () => Promise<void>;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, name: string, password?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => void;
  setTheme: (theme: Theme) => void;
  setAdminView: (view: boolean) => void;

  // Admin Actions
  loadAdminData: () => Promise<void>;
  deleteSystemUser: (userId: string) => Promise<void>;
  adminCreateUser: (email: string, name: string, role: 'user' | 'admin', password?: string) => Promise<void>;
  adminResetUserPassword: (userId: string, newPassword: string) => Promise<void>;

  // Workspace
  loadWorkspaces: () => Promise<void>;
  selectWorkspace: (id: string) => void;
  createWorkspace: (name: string) => Promise<void>;
  inviteMember: (email: string) => Promise<void>;
  updateWorkspaceSettings: (settings: Partial<Workspace>) => Promise<void>;

  // Categories
  addCategory: (category: string) => Promise<void>;
  deleteCategory: (category: string) => Promise<void>;

  // Transactions
  loadTransactions: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'workspaceId' | 'createdBy'>) => Promise<void>;
  editTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  theme: 'dark',
  workspaces: [],
  currentWorkspace: null,
  transactions: [],
  adminView: false,
  adminUsersList: [],
  adminStats: null,

  initApp: async () => {
    set({ isLoading: true });
    
    // Restore Theme
    const savedTheme = localStorage.getItem('orbit_theme') as Theme;
    if (savedTheme) {
      set({ theme: savedTheme });
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    } else {
      document.documentElement.classList.add('dark');
    }

    // Restore Session
    const email = localStorage.getItem('orbit_session_email');
    if (email) {
      try {
        await get().login(email);
      } catch (e) {
        console.error("Session restore failed", e);
        localStorage.removeItem('orbit_session_email');
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  setTheme: async (theme) => {
    set({ theme });
    localStorage.setItem('orbit_theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    
    const { user } = get();
    if (user) {
       await mockDb.updateUserTheme(user.email, theme);
    }
  },

  setAdminView: (view) => set({ adminView: view }),

  loadAdminData: async () => {
    const users = await mockDb.getAllUsers();
    const stats = await mockDb.getSystemStats();
    set({ adminUsersList: users, adminStats: stats });
  },

  deleteSystemUser: async (userId) => {
    await mockDb.deleteUser(userId);
    await get().loadAdminData();
  },

  adminCreateUser: async (email, name, role, password) => {
    await mockDb.adminCreateUser(email, name, role, password);
    await get().loadAdminData();
  },

  adminResetUserPassword: async (userId, newPassword) => {
    await mockDb.adminResetPassword(userId, newPassword);
  },

  login: async (email) => {
    set({ isLoading: true });
    try {
      const user = await mockDb.login(email);
      localStorage.setItem('orbit_session_email', email);
      
      // Sync theme from user profile
      if (user.preferences?.theme) {
         get().setTheme(user.preferences.theme);
      }

      set({ user, isAuthenticated: true });
      await get().loadWorkspaces();
    } catch (e) {
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email, name) => {
    set({ isLoading: true });
    try {
      const user = await mockDb.register(email, name);
      localStorage.setItem('orbit_session_email', email);
      set({ user, isAuthenticated: true });
      await get().loadWorkspaces();
    } catch (e) {
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (email) => {
    await mockDb.resetPassword(email);
  },

  logout: () => {
    localStorage.removeItem('orbit_session_email');
    set({ user: null, isAuthenticated: false, currentWorkspace: null, workspaces: [], adminView: false });
  },

  loadWorkspaces: async () => {
    const { user } = get();
    if (!user) return;
    const workspaces = await mockDb.getWorkspaces(user.email);
    set({ workspaces });
    if (workspaces.length > 0 && !get().currentWorkspace) {
      set({ currentWorkspace: workspaces[0] });
      await get().loadTransactions();
    }
  },

  selectWorkspace: async (id) => {
    const ws = get().workspaces.find(w => w.id === id) || null;
    set({ currentWorkspace: ws });
    if (ws) await get().loadTransactions();
  },

  createWorkspace: async (name) => {
    const { user } = get();
    if (!user) return;
    const newWs = await mockDb.createWorkspace(name, user.id, user.email);
    set(state => ({ workspaces: [...state.workspaces, newWs], currentWorkspace: newWs }));
    await get().loadTransactions();
  },

  updateWorkspaceSettings: async (settings) => {
    const { currentWorkspace } = get();
    if (!currentWorkspace) return;
    const updatedWs = await mockDb.updateWorkspaceSettings(currentWorkspace.id, settings);
    set(state => ({
      currentWorkspace: updatedWs,
      workspaces: state.workspaces.map(w => w.id === updatedWs.id ? updatedWs : w)
    }));
  },

  inviteMember: async (email) => {
    const { currentWorkspace } = get();
    if (!currentWorkspace) return;
    await mockDb.inviteUserToWorkspace(currentWorkspace.id, email);
    const updatedWs = { ...currentWorkspace, members: [...currentWorkspace.members, email] };
    set(state => ({
      currentWorkspace: updatedWs,
      workspaces: state.workspaces.map(w => w.id === updatedWs.id ? updatedWs : w)
    }));
  },

  addCategory: async (category) => {
     const { currentWorkspace } = get();
     if(!currentWorkspace || currentWorkspace.categories.includes(category)) return;
     const newCategories = [...currentWorkspace.categories, category];
     await get().updateWorkspaceSettings({ categories: newCategories });
  },

  deleteCategory: async (category) => {
    const { currentWorkspace } = get();
     if(!currentWorkspace) return;
     const newCategories = currentWorkspace.categories.filter(c => c !== category);
     await get().updateWorkspaceSettings({ categories: newCategories });
  },

  loadTransactions: async () => {
    const { currentWorkspace } = get();
    if (!currentWorkspace) {
      set({ transactions: [] });
      return;
    }
    const transactions = await mockDb.getTransactions(currentWorkspace.id);
    set({ transactions });
  },

  addTransaction: async (txData) => {
    const { currentWorkspace, user } = get();
    if (!currentWorkspace || !user) return;
    
    const fullTx = {
      ...txData,
      workspaceId: currentWorkspace.id,
      createdBy: user.email
    };

    const newTx = await mockDb.addTransaction(fullTx);
    set(state => ({ transactions: [newTx, ...state.transactions] }));
  },

  editTransaction: async (id, updates) => {
    const updatedTx = await mockDb.editTransaction(id, updates);
    set(state => ({ 
      transactions: state.transactions.map(t => t.id === id ? updatedTx : t) 
    }));
  },

  deleteTransaction: async (id) => {
    await mockDb.deleteTransaction(id);
    set(state => ({ transactions: state.transactions.filter(t => t.id !== id) }));
  }
}));