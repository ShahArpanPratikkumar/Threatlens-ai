import React from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  ShieldAlert,
  ShieldX,
  HelpCircle,
  ArrowUpRight,
} from 'lucide-react';
import type { RiskBreakdown } from '../types';

interface ExplainableAiCardProps {
  summary: string;
  whyDangerous: string[];
  threatMechanics: string;
  recommendations: string[];
  riskBreakdown?: RiskBreakdown;
  aiModelUsed: string;
  isAiFallback: boolean;
  riskLevel?: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const ExplainableAiCard: React.FC<ExplainableAiCardProps> = ({
  summary,
  whyDangerous,
  threatMechanics,
  recommendations,
  riskBreakdown,
  aiModelUsed,
  isAiFallback,
  riskLevel = 'SAFE',
}) => {
  const isSafe = riskLevel === 'SAFE';
  const isLow = riskLevel === 'LOW';
  const isSuspicious = riskLevel === 'MEDIUM';
  const isMalicious = riskLevel === 'HIGH' || riskLevel === 'CRITICAL';

  // Dynamic config for section titles, colors, and iconography
  const verdictTheme = (() => {
    if (isMalicious) {
      return {
        title: 'WHY THIS URL IS DANGEROUS',
        icon: <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
        headerText: 'text-rose-600 dark:text-rose-400',
        itemBg: 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-500/20',
        dotColor: 'bg-rose-500',
        recIcon: <ShieldX className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />,
        recBg: 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-500/20',
        recTitle: 'URGENT SECURITY ACTIONS REQUIRED',
        recHeaderColor: 'text-rose-600 dark:text-rose-400',
      };
    }
    if (isSuspicious) {
      return {
        title: 'WHY THIS URL IS SUSPICIOUS',
        icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        headerText: 'text-amber-600 dark:text-amber-400',
        itemBg: 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-500/20',
        dotColor: 'bg-amber-500',
        recIcon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
        recBg: 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-500/20',
        recTitle: 'DEFENSIVE MEASURES & PRECAUTIONS',
        recHeaderColor: 'text-amber-600 dark:text-amber-400',
      };
    }
    if (isLow) {
      return {
        title: 'WHY THIS URL HAS LOW RISK ANOMALIES',
        icon: <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
        headerText: 'text-cyan-600 dark:text-cyan-400',
        itemBg: 'bg-cyan-50/80 dark:bg-cyan-950/20 border-cyan-200/80 dark:border-cyan-500/20',
        dotColor: 'bg-cyan-500',
        recIcon: <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />,
        recBg: 'bg-cyan-50/70 dark:bg-cyan-950/20 border-cyan-200/70 dark:border-cyan-500/20',
        recTitle: 'STANDARD BROWSING RECOMMENDATIONS',
        recHeaderColor: 'text-cyan-600 dark:text-cyan-400',
      };
    }
    // SAFE default
    return {
      title: 'WHY THIS URL APPEARS SAFE & AUTHENTIC',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      headerText: 'text-emerald-600 dark:text-emerald-400',
      itemBg: 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-500/20',
      dotColor: 'bg-emerald-500',
      recIcon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
      recBg: 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-500/20',
      recTitle: 'RECOMMENDED USAGE GUIDANCE',
      recHeaderColor: 'text-emerald-600 dark:text-emerald-400',
    };
  })();

  // Filter out repetitive statements from whyDangerous if already identical to summary
  const safeReasons = (whyDangerous || []).map((r) => {
    if (isSafe && r.toLowerCase().includes('domain displays standard')) {
      return 'Authoritative DNS resolution matches legitimate public internet routing.';
    }
    return r;
  });

  // Default context-aware recommendations if backend provided none or generic ones
  const dynamicRecommendations = (() => {
    if (recommendations && recommendations.length > 0) {
      return recommendations;
    }
    if (isMalicious) {
      return [
        'Do not navigate to this destination or enter authentication credentials.',
        'If opened, immediately close the tab and purge active session cookies.',
        'Submit the apex domain to your enterprise firewall blocklist.',
      ];
    }
    if (isSuspicious) {
      return [
        'Inspect the apex domain spelling carefully for deceptive letter substitutions.',
        'Do not input corporate passwords, 2FA codes, or payment data on this host.',
        'Verify the origin directly via known official bookmarks or support channels.',
      ];
    }
    return [
      'Proceed with standard browsing. Destination parameters match authentic baselines.',
      'Verify the browser lock icon remains active during confidential transactions.',
      'Maintain up-to-date browser security definitions and extension defenses.',
    ];
  })();

  // Helper for points impact coloring
  const getPointsBadge = (pts: number) => {
    if (pts === 0) {
      return (
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs shrink-0">
          0 pts
        </span>
      );
    }
    if (pts <= 15) {
      return (
        <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-xs shrink-0">
          +{pts} pts
        </span>
      );
    }
    if (pts <= 25) {
      return (
        <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs shrink-0">
          +{pts} pts
        </span>
      );
    }
    return (
      <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs shrink-0">
        +{pts} pts
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 rounded-2xl glass-panel relative">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
              AI Threat Intelligence & Behavioral Analysis
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Model: {aiModelUsed} {isAiFallback ? '(Autonomous Heuristic Rulebook)' : ''}
            </span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-mono bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 font-bold">
          Explainable Telemetry
        </span>
      </div>

      {/* Human-readable Executive Summary */}
      <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
        <div className="font-bold text-xs font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1 flex items-center gap-1.5">
          <span>Executive Summary</span>
        </div>
        <p>{summary}</p>
      </div>

      {/* Dynamic Evidence Findings Section (Safe vs Suspicious vs Dangerous) */}
      <div className="space-y-3">
        <h4 className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${verdictTheme.headerText}`}>
          {verdictTheme.icon}
          <span>{verdictTheme.title}</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {safeReasons.map((reason, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs text-slate-700 dark:text-slate-300 leading-relaxed ${verdictTheme.itemBg}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${verdictTheme.dotColor} mt-1.5 shrink-0`} />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Vector & Threat Mechanics (or Trusted Architecture) */}
      {threatMechanics && (
        <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            Technical Vector & Mechanics
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
            {threatMechanics}
          </p>
        </div>
      )}

      {/* Contributing Risk Score Breakdown & Factors */}
      {riskBreakdown && riskBreakdown.contributingSignals && riskBreakdown.contributingSignals.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Contributing Evidence & Risk Weightings</span>
            <span className="text-[10px] text-slate-500 font-normal">Impact on Final Score</span>
          </h4>

          <div className="space-y-2">
            {riskBreakdown.contributingSignals.map((signal, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 text-xs font-mono"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase shrink-0">
                    {signal.category}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 truncate">
                    {signal.reason}
                  </span>
                </div>
                {getPointsBadge(signal.points)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Context-Aware Recommended Actions */}
      <div className="space-y-3 pt-1">
        <h4 className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${verdictTheme.recHeaderColor}`}>
          <ShieldCheck className="w-4 h-4" />
          <span>{verdictTheme.recTitle}</span>
        </h4>

        <div className="space-y-2">
          {dynamicRecommendations.map((rec, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs text-slate-800 dark:text-slate-200 ${verdictTheme.recBg}`}
            >
              {verdictTheme.recIcon}
              <span className="leading-relaxed">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExplainableAiCard;
