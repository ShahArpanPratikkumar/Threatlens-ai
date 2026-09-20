import React, { useState, useEffect } from 'react';
import {
  Shield,
  Cpu,
  Lock,
  Zap,
  Activity,
  Server,
} from 'lucide-react';
import { ThreatRadar } from './ThreatRadar';

interface AuthSecurityExperienceProps {
  mode: 'login' | 'register';
}

export const AuthSecurityExperience: React.FC<AuthSecurityExperienceProps> = ({ mode }) => {
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const defenseSignals = [
    {
      id: 'neural',
      label: 'Gemini 3.1 Neural Heuristics',
      status: 'ONLINE',
      metric: '0.04ms latency',
      icon: Cpu,
      color: 'text-cyan-500 dark:text-cyan-400',
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-500/10',
    },
    {
      id: 'dns',
      label: 'Authoritative DNS Telemetry',
      status: 'VERIFIED',
      metric: 'Recursive checks active',
      icon: Server,
      color: 'text-emerald-500 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
    },
    {
      id: 'zerotrust',
      label: 'Zero-Trust Gateway Isolation',
      status: 'ENFORCED',
      metric: 'Hardware token bound',
      icon: Lock,
      color: 'text-sky-500 dark:text-sky-400',
      border: 'border-sky-500/30',
      bg: 'bg-sky-500/10',
    },
    {
      id: 'phish',
      label: 'Linguistic Scam Detection',
      status: 'INTERCEPTING',
      metric: '99.4% precision',
      icon: Zap,
      color: 'text-purple-500 dark:text-purple-400',
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div
      id="auth-security-experience"
      className="relative w-full h-full flex flex-col justify-between p-6 sm:p-8 lg:p-10 overflow-hidden select-none"
    >
      {/* Dynamic Background Grid with cyber scanning glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.06)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-sky-500/10 dark:bg-sky-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header Section */}
      <div className="relative z-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 dark:bg-cyan-950/60 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-[11px] font-mono font-semibold tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span>SOC COMMAND NODE • US-EAST-01</span>
        </div>

        <div>
          <h2 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
            THREATLENS <span className="text-cyan-600 dark:text-cyan-400">SOC</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed max-w-md">
            {mode === 'login'
              ? 'Autonomous AI defense engine providing real-time URL telemetry, forensic inspection, and zero-day social engineering protection.'
              : 'Deploy next-generation threat intelligence across your organization. Multi-vector analysis for web, QR, screenshots, and communications.'}
          </p>
        </div>
      </div>

      {/* Centerpiece: Unified ThreatRadar Telemetry Core */}
      <div className="relative z-10 my-4 flex flex-col items-center justify-center">
        <ThreatRadar
          size="md"
          isScanning={true}
          scanState="analyzing"
          showTargetVector={false}
          showLabels={true}
          interactive={true}
        />
      </div>

      {/* Bottom Live Defense Telemetry Feed */}
      <div className="relative z-10 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pb-1 border-b border-slate-200 dark:border-slate-800/80">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-500" />
            <span className="font-semibold uppercase tracking-wider">Subsystem Telemetry</span>
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">ALL SYSTEMS NOMINAL</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
          {defenseSignals.map((signal, idx) => {
            const Icon = signal.icon;
            const isHighlighted = pulseIndex === idx;
            return (
              <div
                key={signal.id}
                className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                  isHighlighted
                    ? `${signal.bg} ${signal.border} shadow-xs`
                    : 'bg-white/40 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-1.5 rounded-lg ${signal.bg} ${signal.color} shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="font-medium text-slate-800 dark:text-slate-200 truncate text-[11px]">
                      {signal.label}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {signal.metric}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold ${signal.color} ml-1 shrink-0`}>
                  {signal.status}
                </span>
              </div>
            );
          })}
        </div>

        {/* Security Trust Footnote */}
        <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center justify-between">
          <span>Enterprise SOC Architecture</span>
          <span className="text-slate-400 dark:text-slate-500">ISO 27001 • SOC-2 Type II</span>
        </div>
      </div>
    </div>
  );
};

export default AuthSecurityExperience;

