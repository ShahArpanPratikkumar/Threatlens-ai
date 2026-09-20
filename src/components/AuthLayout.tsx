import React from 'react';
import { Shield, ArrowLeft, Moon, Sun, Lock, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AuthLayoutProps {
  children: React.ReactNode;
  onNavigate: (route: string) => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, onNavigate }) => {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <div
      id="auth-layout"
      className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-[#06090E] text-slate-900 dark:text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-500 relative overflow-x-hidden font-sans transition-colors duration-200"
    >
      {/* Ambient background illumination */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-cyan-500/5 dark:bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#080B11]/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Identity */}
          <div
            onClick={() => onNavigate('/')}
            className="flex items-center gap-3 cursor-pointer group select-none"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('/')}
            aria-label="ThreatLens AI Home"
          >
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-500/40 text-cyan-600 dark:text-cyan-400 group-hover:border-cyan-500 group-hover:shadow-xs transition-all">
              <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-wider text-slate-900 dark:text-slate-100 font-mono flex items-center gap-1.5">
                THREATLENS <span className="text-cyan-600 dark:text-cyan-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-widest -mt-0.5">
                SECURITY INTELLIGENCE PLATFORM
              </span>
            </div>
          </div>

          {/* Right Header Controls: Status Badge + Theme Toggle + Back to Home */}
          <div className="flex items-center gap-3">
            {/* Live Gateway Status Badge */}
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>GATEWAY: OPERATIONAL</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              type="button"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Back to Platform */}
            <button
              onClick={() => onNavigate('/')}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-mono transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Overview</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Authentication Area */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex items-center justify-center grow">
        {children}
      </main>

      {/* Zero-Trust Compliance Footer */}
      <footer className="relative z-10 w-full border-t border-slate-200/80 dark:border-slate-800/80 py-4 px-4 sm:px-6 text-center text-[11px] font-mono text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            <span>Protected by ThreatLens Zero-Trust Gateway • 256-Bit Hardware Keystore</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>TLS 1.3 Strict Transport</span>
            </span>
            <span>Zero-Log Session Protocol</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;

