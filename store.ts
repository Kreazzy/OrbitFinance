import { create } from 'zustand';
import { Transaction, UserProfile, AuthState, Workspace, Theme, getCurrencySymbol, UserRole } from './types';
import { mockDb } from './services/mockDb';
import { GoogleGenAI } from "@google/genai";

interface AppState extends AuthState {
  theme: Theme;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  transactions: Transaction[];
  aiAnalysis: string | null;
  isAiLoading: boolean;

  adminUsersList: UserProfile[];
  adminStats: { users: number };
  loadAdminData: () => Promise<void>;
  deleteSystemUser: (id: string) => Promise<void>;
  adminCreateUser: (email: string, name: string, role: UserRole, password?: string) => Promise<void>;
  adminResetUserPassword: (id: string, pass: string) => Promise<void>;

  initApp: () => Promise<void>;
  login: (email: string, pass?: string) => Promise<void>;
  register: (email: string, name: string, pass?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (data: any) => Promise<void>;
  deleteAccount: () => Promise<void>;
  logout: () => void;
  setTheme: (theme: Theme) => void;
  
  loadWorkspaces: () => Promise<void>;
  selectWorkspace: (id: string) => void;
  updateWorkspace: (data: any) => Promise<void>;
  removeMember: (email: string) => Promise<void>;
  inviteMember: (email: string) => Promise<void>;

  loadTransactions: () => Promise<void>;
  addTransaction: (tx: any) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getAiFinancialAdvice: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  theme: 'light',
  workspaces: [],
  currentWorkspace: null,
  transactions: [],
  aiAnalysis: null,
  isAiLoading: false,
  adminUsersList: [],
  adminStats: { users: 0 },

  initApp: async () => {
    try {
      const email = localStorage.getItem('orbit_session_email');
      if (email) {
        await get().login(email);
      }
    } catch (e) {
      console.error("Init failed", e);
      localStorage.removeItem('orbit_session_email');
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email) => {
    const user = await mockDb.login(email);
    localStorage.setItem('orbit_session_email', email);
    set({ user, isAuthenticated: true, isLoading: false });
    await get().loadWorkspaces();
  },

  register: async (email, name) => {
    const user = await mockDb.register(email, name);
    localStorage.setItem('orbit_session_email', email);
    set({ user, isAuthenticated: true, isLoading: false });
    await get().loadWorkspaces();
  },

  resetPassword: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 800));
  },

  updateUser: async (data) => {
    const { user } = get();
    if (!user) return;
    const updated = await mockDb.updateUserProfile(user.id, data);
    set({ user: updated });
  },

  deleteAccount: async () => {
    const { user } = get();
    if (user) {
      await mockDb.deleteAccount(user.id);
      get().logout();
    }
  },

  logout: () => {
    localStorage.removeItem('orbit_session_email');
    set({ user: null, isAuthenticated: false, currentWorkspace: null, workspaces: [], transactions: [], aiAnalysis: null });
  },

  setTheme: (theme) => {
    set({ theme });
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  },

  loadWorkspaces: async () => {
    const { user } = get();
    if (!user) return;
    const workspaces = await mockDb.getWorkspaces(user.email);
    set({ workspaces });
    if (workspaces.length > 0 && !get().currentWorkspace) {
      const activeWs = workspaces[0];
      set({ currentWorkspace: activeWs });
      const txs = await mockDb.getTransactions(activeWs.id);
      set({ transactions: txs });
    }
  },

  selectWorkspace: (id) => {
    const ws = get().workspaces.find(w => w.id === id);
    if (ws) {
      set({ currentWorkspace: ws, aiAnalysis: null });
      get().loadTransactions();
    }
  },

  updateWorkspace: async (data) => {
    const { currentWorkspace } = get();
    if (!currentWorkspace) return;
    const updated = await mockDb.updateWorkspace(currentWorkspace.id, data);
    set(s => ({
      currentWorkspace: updated,
      workspaces: s.workspaces.map(w => w.id === updated.id ? updated : w)
    }));
  },

  removeMember: async (email) => {
    const { currentWorkspace } = get();
    if (currentWorkspace) {
      await mockDb.removeMember(currentWorkspace.id, email);
      await get().loadWorkspaces();
    }
  },

  inviteMember: async (email) => {
    const { currentWorkspace } = get();
    if (currentWorkspace) {
      await mockDb.inviteUserToWorkspace(currentWorkspace.id, email);
      await get().loadWorkspaces();
    }
  },

  loadTransactions: async () => {
    const { currentWorkspace } = get();
    if (currentWorkspace) {
      const txs = await mockDb.getTransactions(currentWorkspace.id);
      set({ transactions: txs });
    }
  },

  addTransaction: async (tx) => {
    const { currentWorkspace, user } = get();
    if (currentWorkspace && user) {
      await mockDb.addTransaction({ ...tx, workspaceId: currentWorkspace.id, createdBy: user.email, date: new Date().toISOString() });
      await get().loadTransactions();
    }
  },

  deleteTransaction: async (id) => {
    await mockDb.deleteTransaction(id);
    await get().loadTransactions();
  },

  loadAdminData: async () => {
    const users = await mockDb.getUsers();
    set({ adminUsersList: users, adminStats: { users: users.length } });
  },

  deleteSystemUser: async (id) => {
    await mockDb.deleteAccount(id);
    await get().loadAdminData();
  },

  adminCreateUser: async (email, name, role, password) => {
    const user = await mockDb.register(email, name);
    await mockDb.updateUserProfile(user.id, { role });
    await get().loadAdminData();
  },

  adminResetUserPassword: async (id, pass) => {
    await new Promise(r => setTimeout(r, 500));
  },

  getAiFinancialAdvice: async () => {
    const { transactions, currentWorkspace } = get();
    if (!transactions.length) return;
    set({ isAiLoading: true, aiAnalysis: null });
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const symbol = getCurrencySymbol(currentWorkspace?.currencyCode || 'USD');
      
      const prompt = `Act as a senior wealth manager. Analyze these ${transactions.length} recent transactions for the wallet "${currentWorkspace?.name}" in currency ${symbol}.
      Latest Transactions Data: ${JSON.stringify(transactions.slice(0,12))}.
      Provide 3 professional, concise, actionable financial saving tips. 
      Detect patterns like high food spending, rent ratios, or consistent subscription costs.
      Format with clear bullet points. End with a 1-sentence executive summary of the wallet's health.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      set({ aiAnalysis: response.text });
    } catch (e) {
      set({ aiAnalysis: "AI Intelligence is momentarily out of sync. Your ledger remains stable and well-balanced. Keep maintaining your categories for future insights!" });
    } finally {
      set({ isAiLoading: false });
    }
  }
}));