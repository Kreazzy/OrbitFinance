import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Trash2, Users, ShieldAlert, Key, Plus, X, Check } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

// Simple Modal Component (re-defined here to avoid modifying Shared/Dashboard files unnecessarily)
const AdminModal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 flex flex-col"
      >
        <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
          <h3 className="font-semibold text-lg text-textMain">{title}</h3>
          <button onClick={onClose}><X size={20} className="text-textMuted hover:text-textMain" /></button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export const AdminPanel: React.FC = () => {
  const { adminUsersList, adminStats, loadAdminData, deleteSystemUser, adminCreateUser, adminResetUserPassword, user } = useStore();
  
  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string} | null>(null);

  // Form States
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'user' as 'user' | 'admin', password: '' });
  const [resetPassword, setResetPassword] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) {
      await deleteSystemUser(id);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminCreateUser(newUserForm.email, newUserForm.name, newUserForm.role, newUserForm.password);
      setNewUserForm({ name: '', email: '', role: 'user', password: '' });
      setIsCreateOpen(false);
    } catch (error: any) {
      alert(error.message || "Failed to create user");
    }
  };

  const openResetModal = (u: {id: string, name: string}) => {
    setSelectedUser(u);
    setResetPassword('');
    setIsResetOpen(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await adminResetUserPassword(selectedUser.id, resetPassword);
      setIsResetOpen(false);
      alert(`Password for ${selectedUser.name} has been updated.`);
    } catch (error: any) {
      alert(error.message || "Failed to reset password");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h2 className="text-2xl font-bold text-textMain">User Management</h2>
           <p className="text-textMuted">Create, manage, and monitor system access.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium border border-primary/20 flex items-center gap-2">
            <ShieldAlert size={16} /> Admin Access
          </div>
          <button 
             onClick={() => setIsCreateOpen(true)}
             className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-primary/20"
          >
             <Plus size={18} /> Create User
          </button>
        </div>
      </div>

      {/* Stats - Focused Only on Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface/50 backdrop-blur-md border border-border rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-textMuted text-sm font-medium uppercase tracking-wider">Total Users</div>
            <div className="text-3xl font-bold mt-1 text-textMain">{adminStats?.users || 0}</div>
          </div>
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Users size={24} />
          </div>
        </div>
        {/* We can keep one more relevant stat or just remove others as requested */}
        <div className="bg-surface/50 backdrop-blur-md border border-border rounded-xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-textMuted text-sm font-medium uppercase tracking-wider">Admins</div>
              <div className="text-3xl font-bold mt-1 text-textMain">{adminUsersList.filter(u => u.role === 'admin').length}</div>
            </div>
            <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
              <ShieldAlert size={24} />
            </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface/50 backdrop-blur-md border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border">
           <h3 className="font-semibold text-lg text-textMain">System Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-textMain">
            <thead className="bg-background/50 border-b border-border text-textMuted uppercase font-semibold">
               <tr>
                 <th className="px-6 py-4">User</th>
                 <th className="px-6 py-4">Role</th>
                 <th className="px-6 py-4">ID</th>
                 <th className="px-6 py-4 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {adminUsersList.map((u) => (
                <motion.tr 
                  key={u.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="hover:bg-background/40 transition-colors"
                >
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={u.avatarUrl} className="w-8 h-8 rounded-full bg-border" />
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-textMuted text-xs">{u.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={clsx("px-2 py-1 rounded text-xs font-semibold border", 
                        u.role === 'admin' ? "bg-purple-500/10 text-purple-500 border-purple-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                     )}>
                        {u.role.toUpperCase()}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-textMuted font-mono text-xs">
                     {u.id}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => openResetModal(u)}
                      className="p-2 text-textMuted hover:text-primary hover:bg-background rounded transition-colors"
                      title="Reset Password"
                    >
                      <Key size={16} />
                    </button>
                    {u.role !== 'admin' && u.id !== user?.id && (
                       <button 
                         onClick={() => handleDelete(u.id, u.name)}
                         className="p-2 text-textMuted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                         title="Delete User"
                       >
                         <Trash2 size={16} />
                       </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <AdminModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New User">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-textMuted uppercase mb-1 block">Full Name</label>
            <input 
              required type="text"
              value={newUserForm.name} onChange={e => setNewUserForm({...newUserForm, name: e.target.value})}
              className="w-full bg-background border border-border rounded-lg p-3 text-textMain outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-textMuted uppercase mb-1 block">Email Address</label>
            <input 
              required type="email"
              value={newUserForm.email} onChange={e => setNewUserForm({...newUserForm, email: e.target.value})}
              className="w-full bg-background border border-border rounded-lg p-3 text-textMain outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-textMuted uppercase mb-1 block">Temporary Password</label>
            <input 
              required type="password"
              value={newUserForm.password} onChange={e => setNewUserForm({...newUserForm, password: e.target.value})}
              className="w-full bg-background border border-border rounded-lg p-3 text-textMain outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-textMuted uppercase mb-1 block">Role</label>
            <div className="flex gap-2">
              <button 
                 type="button" 
                 onClick={() => setNewUserForm({...newUserForm, role: 'user'})}
                 className={clsx("flex-1 py-2 rounded border transition-colors text-sm", newUserForm.role === 'user' ? "bg-primary/10 border-primary text-primary" : "border-border text-textMuted")}
              >User</button>
              <button 
                 type="button" 
                 onClick={() => setNewUserForm({...newUserForm, role: 'admin'})}
                 className={clsx("flex-1 py-2 rounded border transition-colors text-sm", newUserForm.role === 'admin' ? "bg-primary/10 border-primary text-primary" : "border-border text-textMuted")}
              >Admin</button>
            </div>
          </div>
          <button 
             type="submit" 
             className="w-full bg-primary hover:bg-primaryHover text-white py-3 rounded-lg font-medium transition-colors"
          >
             Create Account
          </button>
        </form>
      </AdminModal>

      {/* Reset Password Modal */}
      <AdminModal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} title="Change Password">
        <p className="text-textMuted text-sm mb-4">
          Updating password for <b>{selectedUser?.name}</b>.
        </p>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-textMuted uppercase mb-1 block">New Password</label>
            <input 
              required type="password"
              value={resetPassword} onChange={e => setResetPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-3 text-textMain outline-none focus:border-primary"
            />
          </div>
          <button 
             type="submit" 
             className="w-full bg-primary hover:bg-primaryHover text-white py-3 rounded-lg font-medium transition-colors"
          >
             Update Password
          </button>
        </form>
      </AdminModal>

    </div>
  );
};