import React, { useState } from 'react';
import { AlertOctagon, AlertTriangle, Info, CheckCircle2, ChevronDown, ShieldAlert, FileSearch } from 'lucide-react';
import type { ScanIndicator } from '../types';

interface ThreatIndicatorsListProps {
  indicators: ScanIndicator[];
}

export const ThreatIndicatorsList: React.FC<ThreatIndicatorsListProps> = ({ indicators }) => {
  // Keep first item expanded by default
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({
    0: true,
  });

  const toggleItem = (idx: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const expandAll = () => {
    const all: Record<number, boolean> = {};
    indicators.forEach((_, i) => (all[i] = true));
    setExpandedIndices(all);
  };

  const collapseAll = () => {
    setExpandedIndices({});
  };

  if (!indicators || indicators.length === 0) {
    return (
      <div className="p-6 rounded-2xl glass-panel text-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        <p className="text-sm text-slate-800 dark:text-slate-200 font-bold font-mono">
          NO ANOMALOUS EVIDENCE DETECTED
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Target matches all legitimate cryptographic, routing, and domain authority criteria.
        </p>
      </div>
    );
  }

  const getSeverityBadge = (severity: ScanIndicator['severity']) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
            <AlertOctagon className="w-3 h-3 text-rose-500" /> CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30">
            <AlertTriangle className="w-3 h-3 text-orange-500" /> HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-500" /> MEDIUM
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
            <Info className="w-3 h-3 text-cyan-500" /> LOW
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Info className="w-3 h-3" /> INFO
          </span>
        );
    }
  };

  const getImpactBadge = (impact: number) => {
    if (impact === 0) {
      return (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          Risk Impact: 0 pts (Clean Parameter)
        </span>
      );
    }
    if (impact <= 15) {
      return (
        <span className="font-semibold text-cyan-600 dark:text-cyan-400">
          Risk Weight Impact: +{impact} pts
        </span>
      );
    }
    if (impact <= 25) {
      return (
        <span className="font-semibold text-amber-600 dark:text-amber-400">
          Risk Weight Impact: +{impact} pts
        </span>
      );
    }
    return (
      <span className="font-semibold text-rose-600 dark:text-rose-400">
        Risk Weight Impact: +{impact} pts
      </span>
    );
  };

  return (
    <div className="p-6 rounded-2xl glass-panel relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4 gap-2">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-0.5">
            EVIDENCE & FORENSIC SIGNALS
          </div>
          <h3 className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Documented Findings ({indicators.length})</span>
          </h3>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">
          <button
            type="button"
            onClick={expandAll}
            className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
          >
            Expand All
          </button>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Accordion Findings */}
      <div className="space-y-3">
        {indicators.map((indicator, idx) => {
          const isExpanded = !!expandedIndices[idx];
          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 overflow-hidden transition-colors"
            >
              {/* Accordion Trigger */}
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => toggleItem(idx)}
                className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 font-mono text-xs font-bold flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100">
                      {indicator.name}
                    </span>
                    {getSeverityBadge(indicator.severity)}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {indicator.type}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-cyan-600 dark:text-cyan-400' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Expandable Body */}
              {isExpanded && (
                <div className="p-4 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-950/40 space-y-3 text-xs">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {indicator.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/40 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <FileSearch className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Vector Category:{' '}
                        <strong className="text-slate-800 dark:text-slate-200 uppercase">
                          {indicator.type}
                        </strong>
                      </span>
                    </div>

                    {indicator.scoreImpact !== undefined && (
                      <div>{getImpactBadge(indicator.scoreImpact)}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThreatIndicatorsList;
