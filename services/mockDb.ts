import { Transaction, UserProfile, Workspace } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEY = 'orbit_finance_v4_data';

interface DbSchema {
  users: UserProfile[];
  workspaces: Workspace[];
  transactions: Transaction[];
}

// Initial Data
const defaultUser: UserProfile = {
  id: 'u1',
  email: 'demo@orbit.com',
  name: 'Demo User',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  role: 'user',
  preferences: { theme: 'dark' }
};

const adminUser: UserProfile = {
  id: 'admin1',
  email: 'admin@orbit.com',
  name: 'System Admin',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
  role: 'admin',
  preferences: { theme: 'dark' }
};

const defaultWorkspace: Workspace = {
  id: 'w1',
  name: 'Personal Budget',
  ownerId: 'u1',
  members: ['demo@orbit.com'],
  currency: '$',
  categories: ['General', 'Food', 'Travel', 'Housing', 'Tech', 'Salary', 'Medical', 'Education']
};

const defaultData: DbSchema = {
  users: [defaultUser, adminUser],
  workspaces: [defaultWorkspace],
  transactions: [
    { id: 't1', workspaceId: 'w1', amount: 3200, category: 'Salary', description: 'Monthly Income', date: new Date().toISOString(), type: 'income', createdBy: 'demo@orbit.com' },
    { id: 't2', workspaceId: 'w1', amount: 1200, category: 'Housing', description: 'Rent Payment', date: new Date().toISOString(), type: 'expense', createdBy: 'demo@orbit.com' },
    { id: 't3', workspaceId: 'w1', amount: 150, category: 'Utilities', description: 'Internet & Power', date: new Date().toISOString(), type: 'expense', createdBy: 'demo@orbit.com' },
  ]
};

const getDb = (): DbSchema => {
  const str = localStorage.getItem(STORAGE_KEY);
  if (!str) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return defaultData;
  }
  return JSON.parse(str);
};

const saveDb = (data: DbSchema) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const mockDb = {
  // --- AUTH ---
  async login(email: string): Promise<UserProfile> {
    await delay(600);
    const db = getDb();
    let user = db.users.find(u => u.email === email);
    if (!user) throw new Error("User not found");
    return user;
  },

  async register(email: string, name: string): Promise<UserProfile> {
    await delay(800);
    const db = getDb();
    if (db.users.find(u => u.email === email)) throw new Error("Email already exists");
    
    const newUser: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      role: 'user',
      preferences: { theme: 'dark' }
    };
    
    const newWorkspace: Workspace = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'My Personal Tracker',
      ownerId: newUser.id,
      members: [email],
      currency: '$',
      categories: ['General', 'Food', 'Transport', 'Utilities']
    };

    db.users.push(newUser);
    db.workspaces.push(newWorkspace);
    saveDb(db);
    return newUser;
  },

  async updateUserTheme(email: string, theme: 'light' | 'dark'): Promise<void> {
    await delay(200);
    const db = getDb();
    const user = db.users.find(u => u.email === email);
    if (user) {
      user.preferences = { theme };
      saveDb(db);
    }
  },

  async resetPassword(email: string): Promise<boolean> {
    await delay(1000);
    return true; 
  },

  // --- ADMIN ---
  async getAllUsers(): Promise<UserProfile[]> {
    await delay(400);
    return getDb().users;
  },

  async adminCreateUser(email: string, name: string, role: 'user' | 'admin', password?: string): Promise<UserProfile> {
    await delay(800);
    const db = getDb();
    if (db.users.find(u => u.email === email)) throw new Error("Email already exists");

    const newUser: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      role: role,
      preferences: { theme: 'dark' }
    };
    
    // Create default workspace for the new user
    const newWorkspace: Workspace = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Personal Budget',
      ownerId: newUser.id,
      members: [email],
      currency: '$',
      categories: ['General', 'Food', 'Transport', 'Utilities']
    };

    db.users.push(newUser);
    db.workspaces.push(newWorkspace);
    saveDb(db);
    return newUser;
  },

  async adminResetPassword(userId: string, newPassword: string): Promise<void> {
    await delay(500);
    const db = getDb();
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    // In a real app, we would hash and save newPassword here.
  },

  async deleteUser(userId: string): Promise<void> {
    await delay(500);
    const db = getDb();
    // Cannot delete admin
    const user = db.users.find(u => u.id === userId);
    if (user && user.role === 'admin') throw new Error("Cannot delete admin");

    db.users = db.users.filter(u => u.id !== userId);
    // Cleanup workspaces where user is owner
    db.workspaces = db.workspaces.filter(w => w.ownerId !== userId);
    saveDb(db);
  },

  async getSystemStats(): Promise<{users: number, workspaces: number, transactions: number}> {
    const db = getDb();
    return {
      users: db.users.length,
      workspaces: db.workspaces.length,
      transactions: db.transactions.length
    };
  },

  // --- WORKSPACES ---
  async getWorkspaces(userEmail: string): Promise<Workspace[]> {
    await delay(300);
    const db = getDb();
    return db.workspaces.filter(w => w.members.includes(userEmail));
  },

  async createWorkspace(name: string, ownerId: string, ownerEmail: string): Promise<Workspace> {
    await delay(400);
    const db = getDb();
    const newW: Workspace = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      ownerId,
      members: [ownerEmail],
      currency: '$',
      categories: ['General', 'Food']
    };
    db.workspaces.push(newW);
    saveDb(db);
    return newW;
  },

  async updateWorkspaceSettings(id: string, updates: Partial<Workspace>): Promise<Workspace> {
    await delay(400);
    const db = getDb();
    const idx = db.workspaces.findIndex(w => w.id === id);
    if (idx === -1) throw new Error("Workspace not found");
    
    db.workspaces[idx] = { ...db.workspaces[idx], ...updates };
    saveDb(db);
    return db.workspaces[idx];
  },

  async inviteUserToWorkspace(workspaceId: string, emailToInvite: string): Promise<void> {
    await delay(500);
    const db = getDb();
    const workspace = db.workspaces.find(w => w.id === workspaceId);
    if (workspace && !workspace.members.includes(emailToInvite)) {
      workspace.members.push(emailToInvite);
      saveDb(db);
    }
  },

  // --- TRANSACTIONS ---
  async getTransactions(workspaceId: string): Promise<Transaction[]> {
    await delay(300);
    const db = getDb();
    return db.transactions.filter(t => t.workspaceId === workspaceId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async addTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
    await delay(300);
    const db = getDb();
    const newTx: Transaction = {
      ...tx,
      id: Math.random().toString(36).substr(2, 9)
    };
    db.transactions.unshift(newTx);
    saveDb(db);
    return newTx;
  },

  async editTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    await delay(300);
    const db = getDb();
    const idx = db.transactions.findIndex(t => t.id === id);
    if (idx === -1) throw new Error("Transaction not found");
    
    db.transactions[idx] = { ...db.transactions[idx], ...updates };
    saveDb(db);
    return db.transactions[idx];
  },

  async deleteTransaction(id: string): Promise<void> {
    await delay(300);
    const db = getDb();
    db.transactions = db.transactions.filter(t => t.id !== id);
    saveDb(db);
  }
};