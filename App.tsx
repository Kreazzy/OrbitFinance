import React, { useEffect, useState } from 'react';
import { useStore } from './store';
import ThreeBackground from './components/ThreeBackground';
import { Dashboard } from './components/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Loader2 } from 'lucide-react';

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
        await register(email, name, password);
      } else if (view === 'forgot') {
        await resetPassword(email);
        setSuccessMsg("Check your email for reset instructions.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div 
        key={view}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-surface/80 backdrop-blur-xl border border-border p-8 rounded-2xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">OrbitFinance</h1>
          <p className="text-textMuted text-sm">
            {view === 'login' && "Welcome back, pilot."}
            {view === 'register' && "Start your financial journey."}
            {view === 'forgot' && "Recover your access."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded">{error}</div>}
           {successMsg && <div className="bg-green-500/10 border border-green-500/20 text-green-500 text-sm p-3 rounded flex items-center gap-2"><Check size={14}/> {successMsg}</div>}

           {view === 'register' && (
             <div>
               <label className="block text-xs font-semibold text-textMuted uppercase mb-1">Full Name</label>
               <input 
                 type="text" required
                 className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors"
                 value={name} onChange={e => setName(e.target.value)}
               />
             </div>
           )}

           <div>
             <label className="block text-xs font-semibold text-textMuted uppercase mb-1">Email Address</label>
             <input 
               type="email" required
               className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors"
               value={email} onChange={e => setEmail(e.target.value)}
             />
           </div>

           {view !== 'forgot' && (
             <div>
                <label className="block text-xs font-semibold text-textMuted uppercase mb-1">Password</label>
                <input 
                  type="password" required
                  className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
             </div>
           )}

           <button 
             type="submit" 
             disabled={isLoading}
             className="w-full bg-primary hover:bg-primaryHover text-white font-semibold py-3 rounded-lg shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 mt-6"
           >
             {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
               <>
                 {view === 'login' && "Sign In"}
                 {view === 'register' && "Create Account"}
                 {view === 'forgot' && "Send Reset Link"}
                 {!isLoading && <ArrowRight size={18} />}
               </>
             )}
           </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3 text-sm">
           {view === 'login' && (
             <>
                <button onClick={() => setView('forgot')} className="text-textMuted hover:text-white transition-colors">Forgot Password?</button>
                <div className="text-textMuted">Don't have an account? <button onClick={() => setView('register')} className="text-primary hover:underline font-semibold">Sign Up</button></div>
             </>
           )}
           {view === 'register' && (
             <div className="text-textMuted">Already have an account? <button onClick={() => setView('login')} className="text-primary hover:underline font-semibold">Log In</button></div>
           )}
           {view === 'forgot' && (
             <button onClick={() => setView('login')} className="text-primary hover:underline font-semibold">Back to Login</button>
           )}
        </div>

        <div className="mt-6 pt-6 border-t border-border/50 text-center">
          <a href="https://cordulatech.com" target="_blank" rel="noreferrer" className="text-xs text-textMuted hover:text-primary transition-colors font-medium">
            Made by Cordulatech
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const { isAuthenticated, isLoading, initApp } = useStore();

  useEffect(() => {
    initApp();
  }, [initApp]);

  if (isLoading && !isAuthenticated) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center">
         <Loader2 className="text-primary animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-textMain bg-background selection:bg-primary selection:text-white">
      <ThreeBackground />
      {isAuthenticated ? <Dashboard /> : <AuthScreen />}
    </div>
  );
}