
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import ExpenseChart3D from './ExpenseChart3D';
import { 
  Plus, Trash2, TrendingUp, TrendingDown, LayoutGrid, 
  Settings, LogOut, Wallet, CheckCircle, X,
  Menu, MoreVertical, UserCog, ExternalLink, Sparkles, BrainCircuit, ShieldAlert,
  ChevronRight, ArrowRight, ArrowUpRight, History, Loader2
} from 'lucide-react';
import { CURRENCIES, Transaction, getCurrencySymbol, TransactionType } from '../types';
import clsx from 'clsx';

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 50 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        className="bg-white border border-gray-100 rounded-t-[3rem] sm:rounded-[3rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="font-black text-xl text-gray-900 tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
        </div>
        <div className="p-10 overflow-y-auto custom-scrollbar bg-white">{children}</div>
      </motion.div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { 
    currentWorkspace, transactions, addTransaction, deleteTransaction, 
    user, logout, updateUser, deleteAccount, updateWorkspace, removeMember, inviteMember,
    getAiFinancialAdvice, aiAnalysis, isAiLoading
  } = useStore();

  const [txForm, setTxForm] = useState({ desc: '', amount: '', cat: 'Food', type: 'expense' as TransactionType });
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'general' | 'members' | 'about'>('general');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  
  const currencySymbol = useMemo(() => getCurrencySymbol(currentWorkspace?.currencyCode || 'USD'), [currentWorkspace]);
  const balance = transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  
  const chartData = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => cats[t.category] = (cats[t.category] || 0) + t.amount);
    return Object.entries(cats).map(([name, value]) => ({ name, value, color: '' }));
  }, [transactions]);

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(txForm.amount);
    if (isNaN(amt) || amt <= 0 || !txForm.desc) return;
    addTransaction({ description: txForm.desc, amount: amt, category: txForm.cat, type: txForm.type });
    setTxForm({ ...txForm, desc: '', amount: '' });
  };

  return (
    <div className="flex h-screen w-full bg-[#FBFBFD] text-[#1D1D1F] font-sans overflow-hidden">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-80 bg-white border-r border-gray-100 flex-col p-8">
        <div className="flex items-center gap-3 mb-16">
          <div className="w-12 h-12 rounded-[1.2rem] bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-100">O</div>
          <h1 className="text-2xl font-black tracking-tighter">OrbitFinance</h1>
        </div>
        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-indigo-50 text-indigo-600 font-black text-sm uppercase tracking-widest"><LayoutGrid size={18}/> Dashboard</button>
          <button onClick={() => getAiFinancialAdvice()} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-gray-400 font-black text-sm uppercase tracking-widest hover:bg-gray-50 hover:text-gray-900 transition-all">
            <BrainCircuit size={18}/> AI Advisor
            {/* Added Loader2 from lucide-react */}
            {isAiLoading && <Loader2 className="ml-auto animate-spin" size={16} />}
          </button>
          <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-gray-400 font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all">
            <Settings size={18}/> Settings
          </button>
        </nav>
        <div className="mt-auto pt-10 border-t border-gray-100">
           <button onClick={() => setShowUserModal(true)} className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-all text-left">
              <img src={user?.avatarUrl} className="w-12 h-12 rounded-2xl border-4 border-white shadow-sm" alt="U" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black truncate">{user?.name}</p>
                <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-widest">{user?.role}</p>
              </div>
           </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col h-full bg-[#FBFBFD] relative overflow-hidden">
        <header className="h-24 flex justify-between items-center px-8 sm:px-12 border-b border-gray-100 bg-white/50 backdrop-blur-md z-40">
           <div className="flex items-center gap-4">
              <button onClick={() => setShowMobileNav(true)} className="md:hidden p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-all"><Menu size={28} /></button>
              <h2 className="text-xl font-black tracking-tighter">{currentWorkspace?.name}</h2>
           </div>
           <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full font-black text-[10px] uppercase tracking-widest border border-emerald-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Status
              </div>
              <button onClick={logout} className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"><LogOut size={22}/></button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 sm:p-12 space-y-12 custom-scrollbar pb-32">
          
          {/* 1. Wallet / Balance (Top Priority) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-12 rounded-[3.5rem] bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden h-full flex flex-col justify-between">
                <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none rotate-12"><Wallet size={240} /></div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Global Liquidity</p>
                     <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">Portfolio v4</div>
                  </div>
                  <h3 className="text-5xl sm:text-6xl font-black mb-4 tracking-tighter leading-none">{currencySymbol}{balance.toLocaleString()}</h3>
                </div>
                <div className="flex gap-4 mt-12">
                   <div className="flex-1 p-5 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/5">
                      <p className="text-[9px] font-black opacity-50 uppercase mb-2 tracking-widest">Growth Index</p>
                      <p className="text-lg font-black flex items-center gap-2 text-emerald-400"><ArrowUpRight size={18}/> 14.2%</p>
                   </div>
                   <div className="flex-1 p-5 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/5">
                      <p className="text-[9px] font-black opacity-50 uppercase mb-2 tracking-widest">System Health</p>
                      <p className="text-lg font-black flex items-center gap-2 text-indigo-300">Optimum</p>
                   </div>
                </div>
              </motion.div>
            </div>

            {/* 2. Quick Add Transaction (Requested Top Move) */}
            <div className="lg:col-span-7">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white p-10 sm:p-12 rounded-[3.5rem] border border-gray-100 shadow-sm h-full flex flex-col">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm"><Plus size={20} /></div>
                  <h3 className="font-black text-gray-900 text-2xl tracking-tight">Rapid Entry</h3>
                </div>
                <form onSubmit={handleAddTx} className="space-y-6 flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Label</label>
                      <input 
                        className="w-full bg-gray-50 border-none rounded-[1.5rem] px-6 py-5 text-sm font-bold focus:ring-4 ring-indigo-50 transition-all placeholder:text-gray-300" 
                        placeholder="e.g. Monthly Rent" value={txForm.desc} onChange={e => setTxForm({...txForm, desc: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Value</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black">{currencySymbol}</span>
                        <input 
                          type="number" step="0.01" className="w-full bg-gray-50 border-none rounded-[1.5rem] pl-12 pr-6 py-5 text-sm font-black focus:ring-4 ring-indigo-50 transition-all" 
                          placeholder="0.00" value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentWorkspace?.categories.slice(0, 6).map(c => (
                      <button key={c} type="button" onClick={() => setTxForm({...txForm, cat: c})} className={clsx("px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all", txForm.cat === c ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "bg-gray-50 text-gray-400 hover:bg-gray-100")}>{c}</button>
                    ))}
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setTxForm({...txForm, type: 'expense'})} className={clsx("flex-1 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all border-2", txForm.type === 'expense' ? "bg-rose-500 text-white border-rose-500 shadow-2xl shadow-rose-100" : "bg-white text-gray-400 border-gray-100")}>Withdraw</button>
                    <button type="button" onClick={() => setTxForm({...txForm, type: 'income'})} className={clsx("flex-1 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all border-2", txForm.type === 'income' ? "bg-emerald-500 text-white border-emerald-500 shadow-2xl shadow-emerald-100" : "bg-white text-gray-400 border-gray-100")}>Deposit</button>
                    <button type="submit" className="w-24 bg-gray-900 text-white rounded-[2rem] shadow-2xl hover:bg-black transition-all flex items-center justify-center"><ArrowRight size={28} /></button>
                  </div>
                </form>
              </motion.div>
            </div>
          </section>

          {/* AI Block */}
          <AnimatePresence>
            {aiAnalysis && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="p-10 rounded-[3.5rem] bg-white border border-indigo-100 relative overflow-hidden shadow-2xl shadow-indigo-50">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><BrainCircuit size={180} className="text-indigo-600" /></div>
                <div className="flex flex-col sm:flex-row gap-8 items-start relative z-10">
                   <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shrink-0 shadow-2xl shadow-indigo-200"><Sparkles size={36} /></div>
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-6">
                        <h4 className="font-black text-gray-900 text-2xl tracking-tighter">Fiscal Intelligence Analysis</h4>
                        <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Gemini Engine</div>
                      </div>
                      <div className="text-base text-gray-600 leading-relaxed font-medium whitespace-pre-wrap prose prose-indigo max-w-none prose-sm">{aiAnalysis}</div>
                      <button onClick={() => getAiFinancialAdvice()} className="mt-8 text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 flex items-center gap-2">Re-Analyze Records <ChevronRight size={14}/></button>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3. Activity Feed (Middle-Bottom) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
             <div className="lg:col-span-6 space-y-6">
                <div className="flex justify-between items-center px-6">
                  <div className="flex items-center gap-3">
                    <History size={20} className="text-gray-400" />
                    <h3 className="font-black text-gray-900 tracking-tight text-2xl">Ledger Activity</h3>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 border-b-2 border-indigo-600/20 pb-1">Archive</button>
                </div>
                <div className="space-y-4">
                  {transactions.slice(0, 6).map((t, idx) => (
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.05 }} layout key={t.id} className="p-6 bg-white rounded-[2.5rem] border border-gray-100 flex items-center justify-between group hover:shadow-2xl hover:shadow-indigo-50 transition-all border-l-8" style={{ borderLeftColor: t.type === 'income' ? '#10B981' : '#F43F5E' }}>
                      <div className="flex items-center gap-5">
                        <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm", t.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                          {t.type === 'income' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-black text-gray-900 truncate">{t.description}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={clsx("text-lg font-black tracking-tighter", t.type === 'income' ? "text-emerald-500" : "text-gray-900")}>
                          {t.type === 'income' ? '+' : '-'}{currencySymbol}{t.amount.toLocaleString()}
                        </span>
                        <button onClick={() => deleteTransaction(t.id)} className="p-2 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-500 transition-all bg-gray-50 rounded-xl"><Trash2 size={18} /></button>
                      </div>
                    </motion.div>
                  ))}
                  {transactions.length === 0 && <div className="text-center py-16 text-gray-300 font-bold italic border-2 border-dashed border-gray-100 rounded-[3rem]">No synchronized records found.</div>}
                </div>
             </div>

             {/* 4. Visual Analysis (Bottom) */}
             <div className="lg:col-span-6">
                <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white p-12 rounded-[3.5rem] border border-gray-100 h-full shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="font-black text-gray-900 tracking-tight text-2xl">Segment Distribution</h3>
                    <div className="bg-gray-50 p-4 rounded-[1.5rem] text-gray-400"><LayoutGrid size={24} /></div>
                  </div>
                  <div className="flex-1 min-h-[400px]">
                    {chartData.length > 0 ? (
                      <ExpenseChart3D data={chartData} currencySymbol={currencySymbol} />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-200 gap-6 opacity-40">
                        <History size={100} strokeWidth={1} />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronization Required</p>
                      </div>
                    )}
                  </div>
                </motion.div>
             </div>
          </section>
        </div>
      </main>

      {/* Settings Modal */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Workspace Engine">
         <div className="flex gap-2 mb-10 bg-gray-100 p-1.5 rounded-[1.5rem]">
           {(['general', 'members', 'about'] as const).map(tab => (
             <button 
               key={tab}
               onClick={() => setSettingsTab(tab)}
               className={clsx("flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all", 
               settingsTab === tab ? "bg-white text-indigo-600 shadow-xl shadow-indigo-50" : "text-gray-400 hover:text-gray-600")}
             >
               {tab}
             </button>
           ))}
         </div>

         {settingsTab === 'general' && (
           <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 block">Workspace Name</label>
                <input className="w-full bg-gray-50 rounded-[1.5rem] p-6 text-sm font-bold border-none ring-2 ring-gray-100 focus:ring-4 ring-indigo-50 transition-all" value={currentWorkspace?.name} onChange={e => updateWorkspace({ name: e.target.value })} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 block">Preferred Currency</label>
                <select className="w-full bg-gray-50 rounded-[1.5rem] p-6 text-sm font-bold border-none ring-2 ring-gray-100 appearance-none focus:ring-4 ring-indigo-50 transition-all" value={currentWorkspace?.currencyCode} onChange={e => updateWorkspace({ currencyCode: e.target.value })}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>)}
                </select>
              </div>
           </div>
         )}

         {settingsTab === 'members' && (
           <div className="space-y-8">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 block">Synchronized Members</label>
              <div className="space-y-4 max-h-72 overflow-y-auto pr-3 custom-scrollbar">
                  {currentWorkspace?.members.map(m => (
                    <div key={m} className="flex items-center justify-between p-5 bg-gray-50 rounded-[2rem] border border-gray-100 group transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-black uppercase shadow-lg shadow-indigo-100">{m[0]}</div>
                        <span className="text-xs font-black truncate max-w-[180px]">{m}</span>
                      </div>
                      {m !== user?.email && currentWorkspace?.ownerId === user?.id && (
                        <button onClick={() => removeMember(m)} className="p-3 text-rose-500 hover:bg-rose-100 rounded-2xl transition-all" title="Terminate Access"><Trash2 size={20} /></button>
                      )}
                      {m === user?.email && <div className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[9px] font-black uppercase">Owner</div>}
                    </div>
                  ))}
              </div>
              <div className="pt-6 border-t border-gray-100 flex gap-3">
                 <input className="flex-1 bg-gray-50 rounded-[1.5rem] p-5 text-xs font-bold border-none ring-2 ring-gray-100 focus:ring-4 ring-indigo-50 transition-all" placeholder="Invite via email..." value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                 <button onClick={() => { inviteMember(inviteEmail); setInviteEmail(''); }} className="px-8 bg-gray-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl">Invite</button>
              </div>
           </div>
         )}

         {settingsTab === 'about' && (
           <div className="text-center py-10">
              <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white font-black text-5xl mx-auto mb-8 shadow-2xl shadow-indigo-100">O</div>
              <h4 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">OrbitFinance</h4>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10">v2.5.0 Stable Alpha</p>
              <div className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
                 <p className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">Global Distribution By</p>
                 <a href="https://cordulatech.com" target="_blank" rel="noopener" className="text-gray-900 font-black text-2xl hover:text-indigo-600 transition-all flex items-center justify-center gap-3">
                    Cordulatech <ExternalLink size={24} />
                 </a>
              </div>
           </div>
         )}
      </Modal>

      {/* User Modal */}
      <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)} title="Identity Profile">
         <div className="space-y-12">
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <img src={user?.avatarUrl} className="w-40 h-40 rounded-[4rem] bg-gray-100 border-[12px] border-white shadow-2xl" alt="avatar" />
                <div className="absolute bottom-2 right-2 bg-indigo-600 p-3 rounded-[1.5rem] text-white shadow-2xl"><UserCog size={24} /></div>
              </div>
              <h4 className="text-3xl font-black tracking-tighter text-gray-900">{user?.name}</h4>
              <p className="text-sm font-bold text-gray-400 tracking-wide">{user?.email}</p>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 block">System Nickname</label>
                <input className="w-full bg-gray-50 rounded-[1.5rem] p-6 text-sm font-bold border-none ring-2 ring-gray-100 focus:ring-4 ring-indigo-50 transition-all" defaultValue={user?.name} onBlur={e => updateUser({ name: e.target.value })} />
              </div>
              
              <div className="p-10 bg-rose-50 rounded-[3rem] border border-rose-100 mt-16 shadow-inner shadow-rose-100/50">
                <div className="flex items-center gap-3 mb-6 text-rose-600">
                  <ShieldAlert size={24} />
                  <p className="text-[11px] font-black uppercase tracking-[0.2em]">Danger Zone</p>
                </div>
                <p className="text-xs text-rose-700/80 mb-10 font-semibold leading-relaxed">Closing your account is irreversible. All associated financial syncs, workspace histories, and metadata will be permanently purged.</p>
                <button onClick={() => confirm("ARE YOU SURE? All data will be purged.") && deleteAccount()} className="w-full py-6 bg-rose-500 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-rose-100 hover:bg-rose-600 transition-all">Destroy Account</button>
              </div>
            </div>
         </div>
      </Modal>

      {/* Mobile Nav */}
      <AnimatePresence>
        {showMobileNav && (
          <div className="fixed inset-0 z-[100] md:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileNav(false)} />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25 }} className="absolute left-0 top-0 bottom-0 w-4/5 max-w-sm bg-white p-10 shadow-2xl flex flex-col rounded-r-[3rem]">
              <div className="flex items-center gap-4 mb-16">
                <div className="w-12 h-12 rounded-[1.2rem] bg-indigo-600 flex items-center justify-center text-white font-black text-2xl">O</div>
                <h1 className="text-2xl font-black tracking-tighter">OrbitFinance</h1>
              </div>
              <nav className="space-y-4">
                <button onClick={() => setShowMobileNav(false)} className="w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] bg-indigo-50 text-indigo-600 font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100/20"><LayoutGrid size={20}/> Dashboard</button>
                <button onClick={() => { getAiFinancialAdvice(); setShowMobileNav(false); }} className="w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] text-gray-400 font-black text-sm uppercase tracking-widest hover:bg-gray-50"><BrainCircuit size={20}/> AI Advisor</button>
                <button onClick={() => { setShowSettings(true); setShowMobileNav(false); }} className="w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] text-gray-400 font-black text-sm uppercase tracking-widest hover:bg-gray-50"><Settings size={20}/> Settings</button>
              </nav>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
