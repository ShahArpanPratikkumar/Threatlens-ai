import React, { useState } from 'react';
import { Terminal, Check, AlertTriangle, XCircle, Minus, HelpCircle, Filter } from 'lucide-react';
import type { TechnicalSignal } from '../types';

interface TechnicalSignalsTableProps {
  signals: TechnicalSignal[];
}

export const TechnicalSignalsTable: React.FC<TechnicalSignalsTableProps> = ({ signals }) => {
  const [filter, setFilter] = useState<string>('ALL');

  if (!signals || signals.length === 0) return null;

  const categories = ['ALL', ...Array.from(new Set(signals.map((s) => s.category)))];

  const filteredSignals = filter === 'ALL'
    ? signals
    : signals.filter((s) => s.category === filter);

  const getStatusBadge = (status: TechnicalSignal['status']) => {
    switch (status) {
      case 'clean':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
            <Check className="w-3 h-3 text-emerald-500" /> CLEAN
          </span>
        );
      case 'suspicious':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-500" /> SUSPICIOUS
          </span>
        );
      case 'malicious':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
            <XCircle className="w-3 h-3 text-rose-500" /> MALICIOUS
          </span>
        );
      case 'unavailable':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Minus className="w-3 h-3 text-slate-400" /> UNAVAILABLE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <HelpCircle className="w-3 h-3 text-slate-400" /> NEUTRAL
          </span>
        );
    }
  };

  return (
    <div className="p-6 rounded-2xl glass-panel relative">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <div>
            <h3 className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
              Technical Forensics Telemetry
            </h3>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {filteredSignals.length} recorded indicators
            </span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="w-3 h-3 text-slate-400 mr-1 hidden sm:inline" />
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                filter === cat
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/40 font-bold'
                  : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Desktop Telemetry Table (Screen >= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px]">
              <th className="pb-3 font-semibold">SIGNAL NAME</th>
              <th className="pb-3 font-semibold">CATEGORY</th>
              <th className="pb-3 font-semibold">STATUS</th>
              <th className="pb-3 font-semibold">VALUE / FORENSIC EVIDENCE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredSignals.map((signal, idx) => (
              <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-3.5 font-semibold text-slate-900 dark:text-slate-200">
                  {signal.key}
                </td>
                <td className="py-3.5 text-slate-500 dark:text-slate-400">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-[10px] uppercase font-medium">
                    {signal.category}
                  </span>
                </td>
                <td className="py-3.5">
                  {getStatusBadge(signal.status)}
                </td>
                <td className="py-3.5 text-slate-700 dark:text-slate-300 break-all max-w-md">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 mr-2">
                    {String(signal.value)}
                  </span>
                  {signal.details && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block sm:inline">
                      ({signal.details})
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Telemetry Cards (< md: prevents all horizontal overflow) */}
      <div className="md:hidden space-y-2.5">
        {filteredSignals.map((signal, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 font-mono text-[9px] uppercase font-bold text-slate-700 dark:text-slate-300 shrink-0">
                  {signal.category}
                </span>
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {signal.key}
                </span>
              </div>
              <div className="shrink-0">{getStatusBadge(signal.status)}</div>
            </div>

            <div className="text-xs font-mono break-all text-slate-800 dark:text-slate-200 bg-white/70 dark:bg-slate-950/40 p-2 rounded-lg border border-slate-100 dark:border-slate-850">
              <div className="font-semibold">{String(signal.value)}</div>
              {signal.details && (
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {signal.details}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnicalSignalsTable;
