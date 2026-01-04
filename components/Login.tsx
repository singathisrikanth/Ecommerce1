
import React, { useState } from 'react';
import { ICONS } from '../constants';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('srikanth@unified.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1200);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden font-sans bg-slate-900">
      {/* Dynamic E-commerce Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-pulse duration-[10000ms]"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')`,
          filter: 'brightness(0.3) saturate(1.2)'
        }}
      />
      
      {/* Decorative Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-slate-900/90 to-purple-900/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#0f172a_70%)]" />
      
      {/* Floating Network Grid Pattern */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Abstract Floating Icons (Commerce related) */}
      <div className="absolute top-20 left-20 text-blue-500/20 animate-bounce delay-700">
        <ICONS.Packing className="w-24 h-24" />
      </div>
      <div className="absolute bottom-20 right-20 text-purple-500/20 animate-pulse">
        <ICONS.Marketplace className="w-32 h-32" />
      </div>
      <div className="absolute top-1/4 right-1/4 text-blue-400/10 rotate-12">
        <ICONS.Orders className="w-16 h-16" />
      </div>

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-400 rounded-[28px] shadow-2xl shadow-blue-500/40 mb-6 ring-4 ring-white/10">
            <ICONS.Marketplace className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            UnifiedCommerce<span className="text-blue-500">Hub</span>
          </h1>
          <p className="text-slate-400 font-medium tracking-wide">Enterprise Multi-Channel Administration</p>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          {/* Subtle light sweep animation */}
          <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-25deg] group-hover:animate-[sweep_2s_ease-in-out_infinite]" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-widest ml-1">Account ID</label>
              <div className="relative">
                <ICONS.Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@unified.com"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">Secret Key</label>
                <button type="button" className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors">Recover</button>
              </div>
              <div className="relative">
                <ICONS.Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 ml-1">
              <div className="relative flex items-center">
                <input type="checkbox" id="remember" className="peer appearance-none w-5 h-5 rounded-lg border-2 border-white/20 bg-slate-800 checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer" />
                <ICONS.Check className="absolute left-0.5 top-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <label htmlFor="remember" className="text-xs font-semibold text-slate-300 cursor-pointer select-none">Maintain secure session</label>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-slate-700 disabled:to-slate-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-3 group overflow-hidden relative"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="tracking-widest uppercase text-sm">Initialize Hub Access</span>
                  <ICONS.ArrowRightLeft className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-10 text-center space-y-4">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-slate-800" />
            Unified Global Logistics Network
            <span className="h-px w-8 bg-slate-800" />
          </p>
          <div className="flex items-center justify-center gap-8">
            <button className="text-[10px] font-black text-slate-500 hover:text-blue-400 uppercase tracking-[0.2em] transition-colors">Privacy Shield</button>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            <button className="text-[10px] font-black text-slate-500 hover:text-blue-400 uppercase tracking-[0.2em] transition-colors">System Health</button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes sweep {
          0% { left: -100%; }
          100% { left: 200%; }
        }
      `}</style>
    </div>
  );
};

export default Login;
