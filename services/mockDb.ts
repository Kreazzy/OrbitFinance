
import { Transaction, UserProfile, Workspace } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const STORAGE_KEY = 'orbit_finance_v5_data';

interface DbSchema {
  users: UserProfile[];
  workspaces: Workspace[];
  transactions: Transaction[];
}

const defaultData: DbSchema = {
  users: [
    { id: 'u1', email: 'demo@orbit.com', name: 'Demo User', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', role: 'user', preferences: { theme: 'light' } },
    { id: 'admin1', email: 'admin@orbit.com', name: 'System Admin', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', role: 'admin', preferences: { theme: 'light' } }
  ],
  workspaces: [
    { id: 'w1', name: 'Main Wallet', ownerId: 'u1', members: ['demo@orbit.com'], currencyCode: 'USD', categories: ['General', 'Food', 'Rent', 'Freelance', 'Subscription', 'Health'] }
  ],
  transactions: [
    { id: 't1', workspaceId: 'w1', amount: 5000, category: 'Freelance', description: 'Web Project', date: new Date().toISOString(), type: 'income', createdBy: 'demo@orbit.com' },
    { id: 't2', workspaceId: 'w1', amount: 1200, category: 'Rent', description: 'Monthly Apartment', date: new Date().toISOString(), type: 'expense', createdBy: 'demo@orbit.com' },
    { id: 't3', workspaceId: 'w1', amount: 45, category: 'Food', description: 'Sushi Dinner', date: new Date().toISOString(), type: 'expense', createdBy: 'demo@orbit.com' }
  ]
};

const getDb = (): DbSchema => {
  const str = localStorage.getItem(STORAGE_KEY);
  if (str) {
    try {
      return JSON.parse(str);
    } catch {
      return defaultData;
    }
  }
  return defaultData;
};

const saveDb = (data: DbSchema) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

export const mockDb = {
  async login(email: string): Promise<UserProfile> {
    await delay(300);
    const db = getDb();
    const user = db.users.find(u => u.email === email);
    if (!user) throw new Error("User not found");
    return user;
  },

  async register(email: string, name: string): Promise<UserProfile> {
    await delay(500);
    const db = getDb();
    if (db.users.find(u => u.email === email)) throw new Error("Email exists");
    const newUser: UserProfile = { 
      id: Math.random().toString(36).substr(2, 9), 
      email, 
      name, 
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`, 
      role: 'user' 
    };
    db.users.push(newUser);
    db.workspaces.push({ 
      id: Math.random().toString(36).substr(2, 9), 
      name: 'My Expenses', 
      ownerId: newUser.id, 
      members: [email], 
      currencyCode: 'USD', 
      categories: ['Food', 'Transport', 'General'] 
    });
    saveDb(db);
    return newUser;
  },

  async updateUserProfile(userId: string, updates: any): Promise<UserProfile> {
    const db = getDb();
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    Object.assign(user, updates);
    saveDb(db);
    return user;
  },

  async deleteAccount(userId: string): Promise<void> {
    const db = getDb();
    db.users = db.users.filter(u => u.id !== userId);
    db.workspaces = db.workspaces.filter(w => w.ownerId !== userId);
    db.transactions = db.transactions.filter(t => !db.workspaces.find(w => w.id === t.workspaceId));
    saveDb(db);
  },

  async inviteUserToWorkspace(workspaceId: string, email: string): Promise<void> {
    const db = getDb();
    const ws = db.workspaces.find(w => w.id === workspaceId);
    if (ws && !ws.members.includes(email)) {
      ws.members.push(email);
      saveDb(db);
    }
  },

  async removeMember(workspaceId: string, email: string): Promise<void> {
    const db = getDb();
    const ws = db.workspaces.find(w => w.id === workspaceId);
    if (ws) {
      ws.members = ws.members.filter(m => m !== email);
      saveDb(db);
    }
  },

  async getWorkspaces(email: string): Promise<Workspace[]> {
    return getDb().workspaces.filter(w => w.members.includes(email));
  },

  async getTransactions(wsId: string): Promise<Transaction[]> {
    return getDb().transactions.filter(t => t.workspaceId === wsId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async addTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
    const db = getDb();
    const newTx = { ...tx, id: Math.random().toString(36).substr(2, 9) };
    db.transactions.unshift(newTx);
    saveDb(db);
    return newTx;
  },

  async deleteTransaction(id: string): Promise<void> {
    const db = getDb();
    db.transactions = db.transactions.filter(t => t.id !== id);
    saveDb(db);
  },

  async updateWorkspace(id: string, updates: any): Promise<Workspace> {
    const db = getDb();
    const ws = db.workspaces.find(w => w.id === id);
    if (!ws) throw new Error("WS not found");
    Object.assign(ws, updates);
    saveDb(db);
    return ws;
  },

  // Added getUsers for AdminPanel support
  async getUsers(): Promise<UserProfile[]> {
    return getDb().users;
  }
};
