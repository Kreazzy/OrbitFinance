import React, { useMemo, useState, useEffect } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import ExpenseChart3D from './ExpenseChart3D';
import { AdminPanel } from './AdminPanel';
import { 
  Plus, Trash2, TrendingUp, TrendingDown, LayoutGrid, 
  Settings, LogOut, Wallet, Share2, Users, ChevronDown, CheckCircle, X,
  Menu, Moon, Sun, Edit2, Pencil, Shield, ExternalLink
} from 'lucide-react';
import clsx from 'clsx';
import { CategoryData, Transaction } from '../types';

// --- Shared Components ---

const Card = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <div className={clsx(
    "bg-surface/50 backdrop-blur-md border border-border rounded-xl p-5 shadow-sm transition-all hover:bg-surface/70",
    className
  )}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', onClick, className }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-primary hover:bg-primaryHover text-white shadow-lg shadow-primary/20",
    secondary: "bg-surface border border-border text-textMain hover:bg-border",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
    ghost: "text-textMuted hover:text-textMain"
  };
  return (
    <button onClick={onClick} className={clsx(baseStyle, variants[variant as keyof typeof variants], className)}>
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-surface border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10 max-h-[90vh] flex flex-col"
      >
        <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
          <h3 className="font-semibold text-lg text-textMain">{title}</h3>
          <button onClick={onClose}><X size={20} className="text-textMuted hover:text-textMain" /></button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

// --- Settings Modal Component ---
const SettingsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { currentWorkspace, updateWorkspaceSettings, addCategory, deleteCategory, theme, setTheme } = useStore();
  const [activeTab, setActiveTab] = useState<'general' | 'categories' | 'appearance'>('general');
  const [newCat, setNewCat] = useState('');

  if (!isOpen || !currentWorkspace) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="flex gap-2 mb-6 border-b border-border pb-2 overflow-x-auto">
        {['General', 'Categories', 'Appearance'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase() as any)}
            className={clsx(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
              activeTab === tab.toLowerCase() 
                ? "bg-primary/10 text-primary" 
                : "text-textMuted hover:text-textMain"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-textMuted uppercase mb-1 block">Workspace Name</label>
            <input 
              value={currentWorkspace.name}
              onChange={(e) => updateWorkspaceSettings({ name: e.target.value })}
              className="w-full bg-background border border-border rounded-lg p-3 text-textMain outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-textMuted uppercase mb-1 block">Default Currency</label>
            <select
              value={currentWorkspace.currency}
              onChange={(e) => updateWorkspaceSettings({ currency: e.target.value })}
              className="w-full bg-background border border-border rounded-lg p-3 text-textMain outline-none focus:border-primary"
            >
              <option value="$">USD ($)</option>
              <option value="€">EUR (€)</option>
              <option value="£">GBP (£)</option>
              <option value="¥">JPY (¥)</option>
              <option value="₹">INR (₹)</option>
              <option value="₿">BTC (₿)</option>
            </select>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input 
              placeholder="New Category (e.g. Hospital)" 
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              className="flex-1 bg-background border border-border rounded-lg p-2 text-textMain outline-none focus:border-primary text-sm"
            />
            <Button onClick={() => { if(newCat) { addCategory(newCat); setNewCat(''); } }}>Add</Button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {currentWorkspace.categories.map(cat => (
              <div key={cat} className="flex justify-between items-center bg-background/50 p-2 rounded border border-border/50">
                <span className="text-sm text-textMain">{cat}</span>
                <button onClick={() => deleteCategory(cat)} className="text-textMuted hover:text-red-500 p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
             <div className="flex items-center gap-3">
               {theme === 'dark' ? <Moon size={20} className="text-primary" /> : <Sun size={20} className="text-primary" />}
               <div>
                 <div className="font-medium text-textMain">App Theme</div>
                 <div className="text-xs text-textMuted">Toggle between light and dark mode</div>
               </div>
             </div>
             <button 
               onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
               className={clsx(
                 "w-12 h-6 rounded-full p-1 transition-colors relative",
                 theme === 'dark' ? "bg-primary" : "bg-border"
               )}
             >
               <div className={clsx("w-4 h-4 rounded-full bg-white shadow-sm transition-transform", theme === 'dark' ? "translate-x-6" : "translate-x-0")} />
             </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

// --- Sidebar ---

const SidebarContent = ({ onCloseMobile }: { onCloseMobile?: () => void }) => {
  const { workspaces, currentWorkspace, selectWorkspace, createWorkspace, logout, user, adminView, setAdminView } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      await createWorkspace(newName);
      setNewName('');
      setIsCreating(false);
    }
  };

  const handleSelect = (id: string) => {
    selectWorkspace(id);
    if(adminView) setAdminView(false); // Switch back to user view on click
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <div className="flex flex-col h-full bg-surface/95 backdrop-blur-xl border-r border-border">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
            O
          </div>
          <span className="font-bold text-xl tracking-tight text-textMain">OrbitFinance</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {user?.role === 'admin' && (
          <button 
             onClick={() => { setAdminView(!adminView); if(onCloseMobile) onCloseMobile(); }}
             className={clsx(
               "w-full text-left px-4 py-3 rounded-xl flex items-center justify-between group transition-all mb-4",
               adminView ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-primary/5 text-primary border border-primary/20 hover:bg-primary/10"
             )}
          >
             <span className="font-medium flex items-center gap-2"><Shield size={16}/> Admin Panel</span>
          </button>
        )}

        <div className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 px-2">Workspaces</div>
        
        {workspaces.map(w => (
          <button
            key={w.id}
            onClick={() => handleSelect(w.id)}
            className={clsx(
              "w-full text-left px-4 py-3 rounded-xl flex items-center justify-between group transition-all duration-200",
              currentWorkspace?.id === w.id && !adminView
                ? "bg-primary text-white shadow-md shadow-primary/20" 
                : "text-textMuted hover:bg-background/80 hover:text-textMain"
            )}
          >
            <span className="font-medium truncate">{w.name}</span>
            {w.members.length > 1 && <Users size={14} className="opacity-70" />}
          </button>
        ))}

        {isCreating ? (
          <form onSubmit={handleCreate} className="mt-2 p-2 bg-background/50 rounded-lg border border-border animate-fade-in">
            <input
              autoFocus
              className="w-full bg-transparent outline-none text-sm text-textMain placeholder-textMuted mb-2"
              placeholder="Tracker Name..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            <div className="flex gap-2">
              <button type="submit" className="text-xs bg-primary px-2 py-1 rounded text-white hover:bg-primaryHover">Add</button>
              <button onClick={() => setIsCreating(false)} className="text-xs text-textMuted px-2 py-1 hover:text-textMain">Cancel</button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setIsCreating(true)}
            className="w-full mt-2 flex items-center gap-2 px-4 py-2 text-sm text-primary hover:text-primaryHover font-medium hover:bg-primary/5 rounded-lg transition-colors"
          >
            <Plus size={16} /> New Tracker
          </button>
        )}
      </div>

      <div className="p-4 border-t border-border/50 bg-background/30">
        <div className="flex items-center gap-3 mb-4 px-2">
          <img src={user?.avatarUrl} alt="profile" className="w-9 h-9 rounded-full bg-gray-700 border border-border" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate text-textMain">{user?.name}</div>
            <div className="text-xs text-textMuted truncate">{user?.email}</div>
          </div>
        </div>
        <Button variant="secondary" className="w-full" onClick={logout}>
          <LogOut size={16} /> Sign Out
        </Button>
        
        <div className="mt-4 text-center">
           <a 
            href="https://cordulatech.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-textMuted hover:text-primary transition-colors font-semibold"
           >
             Product of Cordulatech
             <ExternalLink size={8} />
           </a>
        </div>
      </div>
    </div>
  );
};

// --- Main Dashboard ---

export const Dashboard: React.FC = () => {
  const { currentWorkspace, transactions, addTransaction, editTransaction, deleteTransaction, inviteMember, user, adminView } = useStore();
  
  // State
  const [txForm, setTxForm] = useState({ desc: '', amount: '', cat: '', type: 'expense' as const });
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  
  const [showShare, setShowShare] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Set default category
  useEffect(() => {
    if (currentWorkspace?.categories.length && !txForm.cat) {
      setTxForm(prev => ({ ...prev, cat: currentWorkspace.categories[0] }));
    }
  }, [currentWorkspace]);

  // Stats
  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;

  const chartData: CategoryData[] = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categories: Record<string, number> = {};
    expenses.forEach(t => categories[t.category] = (categories[t.category] || 0) + t.amount);
    return Object.entries(categories).map(([name, value]) => ({ name, value, color: '' }));
  }, [transactions]);

  const handleSubmitTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.desc || !txForm.amount) return;
    
    const amountVal = parseFloat(txForm.amount);

    if (editingTxId) {
      await editTransaction(editingTxId, {
        description: txForm.desc,
        amount: amountVal,
        category: txForm.cat,
        type: txForm.type
      });
      setEditingTxId(null);
    } else {
      await addTransaction({
        description: txForm.desc,
        amount: amountVal,
        category: txForm.cat,
        type: txForm.type,
        date: new Date().toISOString()
      });
    }
    setTxForm({ desc: '', amount: '', cat: currentWorkspace?.categories[0] || '', type: 'expense' });
  };

  const handleEditClick = (tx: Transaction) => {
    setTxForm({
      desc: tx.description,
      amount: tx.amount.toString(),
      cat: tx.category,
      type: tx.type
    });
    setEditingTxId(tx.id);
    // Scroll to form on mobile
    document.getElementById('tx-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if(inviteEmail) {
      await inviteMember(inviteEmail);
      setInviteEmail('');
      setShowShare(false);
    }
  }

  // --- Render ---

  return (
    <div className="flex h-screen w-full relative z-10 text-textMain">
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full w-64">
        <SidebarContent />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {showMobileMenu && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25 }}
              className="absolute left-0 top-0 bottom-0 w-3/4 max-w-xs h-full"
            >
              <SidebarContent onCloseMobile={() => setShowMobileMenu(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-md flex justify-between items-center px-4 md:px-6 z-20">
          <div className="flex items-center gap-3">
             <button onClick={() => setShowMobileMenu(true)} className="md:hidden p-2 text-textMain hover:bg-background/50 rounded-lg">
                <Menu size={24} />
             </button>
             <div>
                <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                  {adminView ? 'Admin Dashboard' : currentWorkspace?.name}
                  {!adminView && (
                    <span className="text-[10px] uppercase bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 tracking-wider">
                      {currentWorkspace?.members.length === 1 ? 'Personal' : 'Team'}
                    </span>
                  )}
                </h2>
             </div>
          </div>
          {!adminView && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowSettings(true)} className="px-3">
                <Settings size={18} /> <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button variant="secondary" onClick={() => setShowShare(true)} className="px-3">
                <Share2 size={18} /> <span className="hidden sm:inline">Share</span>
              </Button>
            </div>
          )}
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          
          {adminView ? (
             <AdminPanel />
          ) : (
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="flex flex-col justify-between h-32 relative overflow-hidden">
                  <div className="relative z-10">
                     <div className="text-textMuted text-sm font-medium uppercase tracking-wider">Total Balance</div>
                     <div className="text-3xl font-bold mt-1 text-textMain">{currentWorkspace?.currency}{balance.toLocaleString()}</div>
                  </div>
                  <div className="relative z-10 text-xs text-textMuted flex items-center gap-1">
                     <Wallet size={12} /> Available Funds
                  </div>
                  {/* Background Decor */}
                  <div className="absolute right-[-20px] bottom-[-20px] opacity-5 text-textMain">
                    <Wallet size={100} />
                  </div>
                </Card>

                <Card className="flex flex-col justify-between h-32">
                  <div>
                     <div className="text-textMuted text-sm font-medium uppercase tracking-wider">Income</div>
                     <div className="text-3xl font-bold mt-1 text-secondary">+{currentWorkspace?.currency}{income.toLocaleString()}</div>
                  </div>
                  <div className="w-full bg-secondary/10 h-1.5 mt-2 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </Card>

                <Card className="flex flex-col justify-between h-32">
                  <div>
                    <div className="text-textMuted text-sm font-medium uppercase tracking-wider">Expenses</div>
                    <div className="text-3xl font-bold mt-1 text-accent">-{currentWorkspace?.currency}{expense.toLocaleString()}</div>
                  </div>
                  <div className="w-full bg-accent/10 h-1.5 mt-2 rounded-full overflow-hidden">
                    <div className="bg-accent h-full rounded-full" style={{ width: `${income > 0 ? Math.min((expense/income)*100, 100) : 0}%` }}></div>
                  </div>
                </Card>
              </div>

              {/* Split View: Chart & Transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Chart & Add Form */}
                <div className="lg:col-span-7 space-y-6">
                  <Card className="min-h-[400px]">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg text-textMain">Spending Breakdown</h3>
                     </div>
                     {chartData.length > 0 ? (
                        <ExpenseChart3D data={chartData} currencySymbol={currentWorkspace?.currency || '$'} />
                     ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-textMuted gap-2">
                          <div className="p-4 bg-background/50 rounded-full">
                             <LayoutGrid size={32} />
                          </div>
                          <p>No expenses recorded yet.</p>
                        </div>
                     )}
                  </Card>

                  <Card>
                    <div className="flex justify-between items-center mb-4" id="tx-form">
                       <h3 className="font-semibold text-textMain">{editingTxId ? 'Edit Transaction' : 'Add Transaction'}</h3>
                       {editingTxId && (
                          <button onClick={() => { setEditingTxId(null); setTxForm({ desc: '', amount: '', cat: currentWorkspace?.categories[0] || '', type: 'expense' }) }} className="text-xs text-textMuted hover:text-textMain">
                            Cancel Edit
                          </button>
                       )}
                    </div>
                    <form onSubmit={handleSubmitTx} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 p-1 bg-background rounded-lg border border-border">
                         <button 
                           type="button"
                           onClick={() => setTxForm({...txForm, type: 'expense'})}
                           className={clsx("py-2 rounded-md text-sm font-medium transition-all", txForm.type === 'expense' ? "bg-accent/10 text-accent shadow-sm" : "text-textMuted hover:text-textMain")}
                         >
                           Expense
                         </button>
                         <button 
                           type="button"
                           onClick={() => setTxForm({...txForm, type: 'income'})}
                           className={clsx("py-2 rounded-md text-sm font-medium transition-all", txForm.type === 'income' ? "bg-secondary/10 text-secondary shadow-sm" : "text-textMuted hover:text-textMain")}
                         >
                           Income
                         </button>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input 
                          type="text" placeholder="Description (e.g. Taxi, Lunch)" required
                          value={txForm.desc} onChange={e => setTxForm({...txForm, desc: e.target.value})}
                          className="flex-1 bg-background border border-border rounded-lg px-4 py-3 text-textMain outline-none focus:border-primary transition-colors"
                        />
                        <input 
                          type="number" placeholder="0.00" required step="0.01"
                          value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})}
                          className="w-full sm:w-32 bg-background border border-border rounded-lg px-4 py-3 text-textMain outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <div>
                        <select 
                          value={txForm.cat} onChange={e => setTxForm({...txForm, cat: e.target.value})}
                          className="w-full bg-background border border-border rounded-lg px-4 py-3 text-textMain outline-none focus:border-primary transition-colors"
                        >
                           {currentWorkspace?.categories.map(cat => (
                             <option key={cat} value={cat}>{cat}</option>
                           ))}
                        </select>
                        <div className="text-right mt-1">
                          <button type="button" onClick={() => setShowSettings(true)} className="text-[10px] text-primary hover:underline">Manage Categories</button>
                        </div>
                      </div>
                      <Button className="w-full py-3" type="submit">
                        {editingTxId ? <><CheckCircle size={18} /> Update Entry</> : <><Plus size={18} /> Add Entry</>}
                      </Button>
                    </form>
                  </Card>
                </div>

                {/* Right Column: Transaction History */}
                <div className="lg:col-span-5">
                  <Card className="h-full max-h-[800px] flex flex-col">
                    <h3 className="font-semibold mb-4 text-textMain">Recent Activity</h3>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      <AnimatePresence>
                        {transactions.length === 0 && <div className="text-textMuted text-center py-8">No activity.</div>}
                        {transactions.map(t => (
                          <motion.div
                             key={t.id}
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             exit={{ opacity: 0 }}
                             className={clsx(
                               "border rounded-lg p-3 flex justify-between items-center group transition-colors",
                               editingTxId === t.id 
                                 ? "bg-primary/5 border-primary" 
                                 : "bg-background/40 border-border/50 hover:border-border hover:bg-background/60"
                             )}
                          >
                             <div className="flex items-center gap-3">
                                <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center shrink-0", t.type === 'income' ? "bg-secondary/10 text-secondary" : "bg-accent/10 text-accent")}>
                                   {t.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                </div>
                                <div className="min-w-0">
                                   <div className="font-medium text-sm text-textMain truncate">{t.description}</div>
                                   <div className="text-xs text-textMuted flex items-center gap-1 truncate">
                                      {t.category} • {new Date(t.date).toLocaleDateString()}
                                   </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-3 shrink-0">
                                <span className={clsx("font-semibold text-sm", t.type === 'income' ? "text-secondary" : "text-textMain")}>
                                   {t.type === 'income' ? '+' : '-'}{currentWorkspace?.currency}{t.amount}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleEditClick(t)} className="p-1.5 text-textMuted hover:text-primary hover:bg-background rounded">
                                     <Edit2 size={14} />
                                  </button>
                                  <button onClick={() => deleteTransaction(t.id)} className="p-1.5 text-textMuted hover:text-red-500 hover:bg-background rounded">
                                     <Trash2 size={14} />
                                  </button>
                                </div>
                             </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Share Modal */}
      <Modal isOpen={showShare} onClose={() => setShowShare(false)} title="Share Workspace">
        <p className="text-textMuted text-sm mb-4">Invite friends or family to <b>{currentWorkspace?.name}</b> to track expenses together.</p>
        <form onSubmit={handleInvite} className="space-y-4">
           <div>
              <label className="text-xs font-semibold text-textMain mb-1 block">Email Address</label>
              <input 
                type="email" required placeholder="friend@example.com"
                value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-3 text-textMain outline-none focus:border-primary"
              />
           </div>
           <Button type="submit" className="w-full">Send Invite</Button>
           
           <div className="mt-4">
              <label className="text-xs font-semibold text-textMuted mb-2 block">Current Members</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                 {currentWorkspace?.members.map(email => (
                    <div key={email} className="flex items-center gap-2 text-sm text-textMain bg-background/50 p-2 rounded">
                       <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center text-[10px] text-white">
                          {email[0].toUpperCase()}
                       </div>
                       {email}
                       {email === currentWorkspace.ownerId && <span className="text-[10px] bg-border px-1 rounded text-textMuted">Owner</span>}
                    </div>
                 ))}
              </div>
           </div>
        </form>
      </Modal>
    </div>
  );
};