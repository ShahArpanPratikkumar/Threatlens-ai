import React from 'react';
import { Shield, ArrowRight, ExternalLink } from 'lucide-react';

interface LandingFooterProps {
  onNavigate: (route: string) => void;
  onStartNow: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onNavigate,
  onStartNow,
}) => {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#070A0F]/70 backdrop-blur-md pt-14 pb-8 transition-colors text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                onNavigate('/');
              }}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/40 text-cyan-600 dark:text-cyan-400 shadow-xs">
                <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-wider text-slate-900 dark:text-slate-100 font-mono">
                  THREATLENS <span className="text-cyan-600 dark:text-cyan-400">AI</span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider -mt-1">
                  CYBER DEFENSE INTELLIGENCE
                </span>
              </div>
            </div>

            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              Autonomous threat intelligence combining live DNS resolution, heuristic pattern analysis, and explainable AI to detect phishing URLs, scam messages, suspicious QR codes, and fraudulent screenshots.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Autonomous Defense Engine • Active Telemetry</span>
            </div>
          </div>

          {/* Defense Vectors */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Inspection Vectors
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <button
                  onClick={onStartNow}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-left"
                >
                  URL & Domain Engine
                </button>
              </li>
              <li>
                <button
                  onClick={onStartNow}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-left"
                >
                  Message & SMS Smishing
                </button>
              </li>
              <li>
                <button
                  onClick={onStartNow}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-left"
                >
                  Screenshot AI Forensics
                </button>
              </li>
              <li>
                <button
                  onClick={onStartNow}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-left"
                >
                  QR Code & Quishing
                </button>
              </li>
            </ul>
          </div>

          {/* System & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Platform & Ethics
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-left"
                >
                  Architecture & Specifications
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/privacy')}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-left"
                >
                  Privacy & Data Handling
                </button>
              </li>
              <li>
                <button
                  onClick={onStartNow}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-left"
                >
                  Analyst Command Center
                </button>
              </li>
              <li>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Version 2.4.0-Production
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} ThreatLens AI. Transparent, Explainable Digital Threat Intelligence.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/privacy')}
              className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('/about')}
              className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              System Docs
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
