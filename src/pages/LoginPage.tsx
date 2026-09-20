import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState<string>('analyst@threatlens.ai');
  const [password, setPassword] = useState<string>('password123');
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'warning');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      onNavigate('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('analyst@threatlens.ai');
    setPassword('password123');
    showToast('Analyst credentials populated', 'info');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#0c1018]/90 border border-cyan-500/30 shadow-2xl backdrop-blur-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 font-mono tracking-tight">
            Analyst Sign In
          </h1>
          <p className="text-xs text-slate-400">
            Access your ThreatLens SOC telemetry & threat audit logs
          </p>
        </div>

        {/* Demo fast button */}
        <button
          type="button"
          onClick={handleFillDemo}
          className="w-full py-2 px-3 rounded-xl bg-cyan-950/30 hover:bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center justify-center gap-2 transition-colors"
        >
          <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Fill Demo Credentials (analyst@threatlens.ai)</span>
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400 font-medium">Analyst Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@threatlens.ai"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-cyan-500/60 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400 font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-cyan-500/60 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none"
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-bold font-mono text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? 'Authenticating...' : 'Sign In to ThreatLens'}
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </form>

        <div className="text-center text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
          <span>Need a new account? </span>
          <button
            onClick={() => onNavigate('/register')}
            className="text-cyan-400 hover:text-cyan-300 font-bold ml-1"
          >
            Create Analyst Profile
          </button>
        </div>
      </div>
    </div>
  );
};
