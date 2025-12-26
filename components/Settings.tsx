
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { UserRole, AdminUser, AutomationTask } from '../types';

const INITIAL_USERS: AdminUser[] = [
  { id: 'u1', name: 'Srikanth Varma', email: 'srikanth@unified.com', role: UserRole.ADMIN, status: 'ACTIVE', lastActive: new Date().toISOString() },
  { id: 'u2', name: 'Jane Smith', email: 'jane@unified.com', role: UserRole.MANAGER, status: 'ACTIVE', lastActive: new Date(Date.now() - 3600000).toISOString() },
  { id: 'u3', name: 'Mike Ross', email: 'mike@unified.com', role: UserRole.STAFF, status: 'INVITED' },
];

const INITIAL_AUTOMATIONS: AutomationTask[] = [
  { id: 'a1', name: 'n8n Order Sync', type: 'n8n', endpoint: 'https://n8n.my-store.com/webhook/sync-orders', schedule: 'HOURLY', status: 'SUCCESS', lastRun: new Date().toISOString() },
  { id: 'a2', name: 'Inventory Reconciler', type: 'n8n', endpoint: 'https://n8n.my-store.com/webhook/reconcile', schedule: 'DAILY', status: 'IDLE' },
];

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'TEAM' | 'SECURITY' | 'AUTOMATION'>('TEAM');
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [automations, setAutomations] = useState<AutomationTask[]>(INITIAL_AUTOMATIONS);
  
  // Forgot Password States
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Automation states
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);

  const handleResetPassword = async () => {
    setIsSendingReset(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setResetEmailSent(true);
    setIsSendingReset(false);
  };

  const runAutomation = async (id: string) => {
    setRunningTaskId(id);
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, status: 'RUNNING' } : a));
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, status: 'SUCCESS', lastRun: new Date().toISOString() } : a));
    setRunningTaskId(null);
  };

  const tabs = [
    { id: 'TEAM', label: 'Team & Access', icon: ICONS.User },
    { id: 'AUTOMATION', label: 'n8n Automations', icon: ICONS.Plus },
    { id: 'SECURITY', label: 'Security & Profile', icon: ICONS.Key },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden min-h-[500px]">
        {/* TEAM TAB */}
        {activeTab === 'TEAM' && (
          <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Co-users & Access</h3>
                <p className="text-sm text-gray-500">Manage team members and their restricted permissions.</p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20">
                <ICONS.Plus className="w-4 h-4" />
                Invite Member
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3 text-center">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last Active</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(user => (
                    <tr key={user.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center font-bold text-slate-600 border-2 border-white shadow-sm">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                          user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                          user.role === UserRole.MANAGER ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`} />
                          <span className="text-xs font-semibold text-gray-600 capitalize">{user.status.toLowerCase()}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-500 font-mono">
                        {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <ICONS.Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Permission Matrix</h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2"><ICONS.Check className="w-4 h-4 text-green-500" /> Admin</p>
                    <p className="text-[10px] text-slate-500">Full access to billing, users, and API keys.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2"><ICONS.Check className="w-4 h-4 text-green-500" /> Manager</p>
                    <p className="text-[10px] text-slate-500">Manage orders and products. No store deletion.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2"><ICONS.X className="w-4 h-4 text-red-500" /> Staff</p>
                    <p className="text-[10px] text-slate-500">View only. Can process labels but cannot edit prices.</p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* AUTOMATION TAB */}
        {activeTab === 'AUTOMATION' && (
          <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">n8n.io Automations</h3>
                <p className="text-sm text-gray-500">Manage your connected workflows and data sync schedules.</p>
              </div>
              <div className="flex gap-3">
                <a href="https://n8n.io" target="_blank" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                  Go to n8n <ICONS.Marketplace className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {automations.map(task => (
                <div key={task.id} className="p-6 border border-gray-100 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.status === 'SUCCESS' ? 'bg-green-500' : 'bg-gray-200'}`} />
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{task.name}</h4>
                      <p className="text-[10px] font-mono text-gray-400 mt-1 truncate max-w-[250px]">{task.endpoint}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      task.schedule === 'REALTIME' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {task.schedule}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Last Successful Run:</span>
                      <span className="text-gray-900 font-semibold">{task.lastRun ? new Date(task.lastRun).toLocaleTimeString() : 'Never'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Status:</span>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${
                          task.status === 'SUCCESS' ? 'bg-green-500' : 
                          task.status === 'RUNNING' ? 'bg-blue-500 animate-spin' : 'bg-gray-300'
                        }`} />
                        <span className="font-bold text-gray-700">{task.status}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => runAutomation(task.id)}
                      disabled={runningTaskId === task.id}
                      className="w-full mt-2 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {runningTaskId === task.id ? 'Running Workflow...' : 'Trigger Manually'}
                      <ICONS.History className={`w-3.5 h-3.5 ${runningTaskId === task.id ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              ))}

              <button className="border-2 border-dashed border-gray-100 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all group min-h-[220px]">
                <div className="p-4 bg-gray-50 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                  <ICONS.Plus className="w-8 h-8" />
                </div>
                <span className="font-bold">Connect n8n Webhook</span>
              </button>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'SECURITY' && (
          <div className="p-8 space-y-12 animate-in slide-in-from-bottom-4">
            <div className="max-w-xl space-y-8">
              <section className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Security Settings</h3>
                <div className="space-y-4">
                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-slate-800">Password Management</p>
                        <p className="text-sm text-slate-500">Reset or update your account password.</p>
                      </div>
                      <ICONS.Key className="w-5 h-5 text-slate-400" />
                    </div>

                    {resetEmailSent ? (
                      <div className="bg-green-100 border border-green-200 text-green-700 p-4 rounded-xl text-sm font-semibold flex items-center gap-3 animate-in fade-in zoom-in-95">
                        <ICONS.Check className="w-5 h-5 shrink-0" />
                        A password reset link has been sent to srikanth@unified.com
                      </div>
                    ) : (
                      <button 
                        onClick={handleResetPassword}
                        disabled={isSendingReset}
                        className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all w-full md:w-auto"
                      >
                        {isSendingReset ? (
                          <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
                        ) : (
                          'Send Reset Link (Forgot Password)'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-4 pt-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Sessions</h4>
                <div className="space-y-3">
                  <div className="p-4 border border-gray-100 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ICONS.Dashboard className="w-4 h-4" /></div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Chrome on MacOS (Current)</p>
                        <p className="text-[10px] text-gray-400 font-mono">IP: 192.168.1.1 — SF, USA</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase">Active Now</span>
                  </div>
                </div>
              </section>

              <div className="pt-6">
                <button className="text-red-600 font-bold text-sm hover:underline flex items-center gap-2">
                   Sign out from all other devices
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
