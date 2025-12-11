import React, { useEffect, useState } from 'react';
import { useStore } from './store';
import ThreeBackground from './components/ThreeBackground';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Loader2, ShieldCheck, LayoutDashboard } from 'lucide-react';

const AuthScreen = () => {
  const { login, register, resetPassword, isLoading } = useStore();
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    try {
      if (view === 'login') {
        await login(email, password);
      } else if (view === 'register') {
        if(!name) return setError("Name is required");
        await register(email, name);
      } else if (view === 'forgot') {
        await resetPassword(email);
        setSuccessMsg("Check your email for reset instructions.");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div 
        key={view}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white border border-gray-100 p-8 sm:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white font-black text-3xl mx-auto mb-6 shadow-xl shadow-indigo-100">O</div>
          <h1 className="text-3xl font-black tracking-tighter text-gray-900 mb-2">OrbitFinance</h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
            {view === 'login' && "Access Vault"}
            {view === 'register' && "Create Account"}
            {view === 'forgot' && "Access Recovery"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           {error && <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase p-4 rounded-2xl">{error}</div>}
           {successMsg && <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold p-4 rounded-2xl flex items-center gap-2"><Check size={14}/> {successMsg}</div>}

           {view === 'register' && (
             <div className="space-y-1">
               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
               <input 
                 type="text" required
                 className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 ring-indigo-50 transition-all"
                 value={name} onChange={e => setName(e.target.value)}
               />
             </div>
           )}

           <div className="space-y-1">
             <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
             <input 
               type="email" required
               className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 ring-indigo-50 transition-all"
               value={email} onChange={e => setEmail(e.target.value)}
             />
           </div>

           {view !== 'forgot' && (
             <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Password</label>
                <input 
                  type="password" required
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 ring-indigo-50 transition-all"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
             </div>
           )}

           <button 
             type="submit" 
             disabled={isLoading}
             className="w-full bg-gray-900 text-white font-black text-xs uppercase tracking-widest py-5 rounded-3xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 mt-8"
           >
             {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
               <>
                 {view === 'login' && "Sign In"}
                 {view === 'register' && "Get Started"}
                 {view === 'forgot' && "Send Code"}
                 <ArrowRight size={18} />
               </>
             )}
           </button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-4 text-[10px] font-black uppercase tracking-widest">
           {view === 'login' && (
             <>
                <button onClick={() => setView('forgot')} className="text-gray-400 hover:text-indigo-600 transition-colors">Recovery</button>
                <div className="text-gray-400">New? <button onClick={() => setView('register')} className="text-indigo-600">Register</button></div>
             </>
           )}
           {(view === 'register' || view === 'forgot') && (
             <button onClick={() => setView('login')} className="text-indigo-600">Back to Login</button>
           )}
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const { isAuthenticated, isLoading, initApp, user } = useStore();
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    initApp();
  }, [initApp]);

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-background flex flex-col items-center justify-center gap-4">
         <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-2xl animate-pulse">O</div>
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Syncing Orbit...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-[#1D1D1F] bg-[#FBFBFD] selection:bg-indigo-600 selection:text-white">
      <ThreeBackground />
      {isAuthenticated ? (
        <div className="relative z-10 flex h-screen overflow-hidden">
           {/* Global Admin Toggle if user is admin */}
           {user?.role === 'admin' && (
             <button 
               onClick={() => setIsAdminView(!isAdminView)}
               className="fixed bottom-8 right-8 z-[110] bg-white border border-gray-100 p-4 rounded-full shadow-2xl text-indigo-600 flex items-center gap-2 font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
             >
               {isAdminView ? <><LayoutDashboard size={18} /> Dashboard</> : <><ShieldCheck size={18} /> Admin</>}
             </button>
           )}
           {isAdminView ? <AdminPanel /> : <Dashboard />}
        </div>
      ) : (
        <AuthScreen />
      )}
    </div>
  );
}