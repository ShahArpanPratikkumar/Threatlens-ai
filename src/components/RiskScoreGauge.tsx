import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ShieldAlert, AlertTriangle, ShieldX, CheckCircle, Info } from 'lucide-react';

interface RiskScoreGaugeProps {
  score: number;
  level: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  threatType: string;
  confidence: number;
}

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({
  score,
  level,
  threatType,
  confidence,
}) => {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  const colorConfig = {
    SAFE: {
      stroke: '#10B981',
      bgGlow: 'rgba(16, 185, 129, 0.12)',
      text: 'text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      verdictLabel: 'SAFE & AUTHENTIC',
      headline: 'Authentic Web Infrastructure',
      verdictText: 'All inspected protocol, DNS, domain authority, and heuristic indicators match authentic benchmarks. No malicious or deceptive patterns were identified.',
      trustAdvice: 'You can safely proceed to this website.',
    },
    LOW: {
      stroke: '#06B6D4',
      bgGlow: 'rgba(6, 182, 212, 0.12)',
      text: 'text-cyan-600 dark:text-cyan-400',
      badge: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
      icon: <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      verdictLabel: 'LOW RISK',
      headline: 'Minor Anomalies Observed',
      verdictText: 'Minor heuristic anomalies detected (such as extended URL parameters or newer registrar). Core cryptographic and host infrastructure remain valid.',
      trustAdvice: 'Standard browsing vigilance recommended.',
    },
    MEDIUM: {
      stroke: '#F59E0B',
      bgGlow: 'rgba(245, 158, 11, 0.14)',
      text: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      verdictLabel: 'SUSPICIOUS',
      headline: 'Suspicious Traits Detected',
      verdictText: 'Elevated abuse indicators detected. Target displays traits frequently associated with phishing redirects, untrusted registrar zones, or unverified hosts.',
      trustAdvice: 'Do not submit credentials, passwords, or personal information.',
    },
    HIGH: {
      stroke: '#F97316',
      bgGlow: 'rgba(249, 115, 22, 0.15)',
      text: 'text-orange-600 dark:text-orange-400',
      badge: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/30',
      icon: <ShieldAlert className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
      verdictLabel: 'HIGH RISK',
      headline: 'Active Phishing Threat',
      verdictText: 'Strong threat signatures detected matching brand impersonation, spoofed subdomains, or unencrypted credential harvesting endpoints.',
      trustAdvice: 'Do not access this URL. High probability of credential theft.',
    },
    CRITICAL: {
      stroke: '#EF4444',
      bgGlow: 'rgba(239, 68, 68, 0.18)',
      text: 'text-rose-600 dark:text-rose-400',
      badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
      icon: <ShieldX className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      verdictLabel: 'CRITICAL HAZARD',
      headline: 'Severe Security Threat',
      verdictText: 'Imminent threat identified. Confirmed malicious signatures including deceptive homoglyph characters, raw IP hosts, or confirmed threat feed hits.',
      trustAdvice: 'Block immediately. Accessing this site poses direct risk of financial or account compromise.',
    },
  }[level];

  const confidencePct = Math.round(confidence * 100);
  const confidenceQuality =
    confidencePct >= 90 ? 'High Confidence • Verified' : confidencePct >= 75 ? 'Substantial Confidence' : 'Moderate Heuristic Confidence';

  return (
    <div className="flex flex-col p-6 rounded-2xl glass-panel relative overflow-hidden h-full justify-between gap-6">
      {/* Background ambient radial glow */}
      <div
        className="absolute -right-12 -top-12 w-60 h-60 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-70"
        style={{ backgroundColor: colorConfig.bgGlow }}
      />

      {/* Top Section: Header & Main Verdict */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1">
            PRIMARY SECURITY VERDICT
          </span>
          <div className="flex items-center gap-2.5">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider border uppercase ${colorConfig.badge}`}>
              {colorConfig.icon}
              <span>{colorConfig.verdictLabel}</span>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
              | {colorConfig.headline}
            </span>
          </div>
        </div>

        {/* Threat Type Label */}
        <div className="text-left sm:text-right">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-0.5">
            THREAT CLASSIFICATION
          </span>
          <span className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-slate-100">
            {threatType}
          </span>
        </div>
      </div>

      {/* Center Section: Score Dial + Verdict Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* SVG Radial Score Meter (Columns: 5) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="currentColor"
                strokeWidth="9"
                className="text-slate-100 dark:text-slate-800/80 fill-transparent"
              />
              <motion.circle
                cx="64"
                cy="64"
                r={radius}
                stroke={colorConfig.stroke}
                strokeWidth="9"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
                strokeLinecap="round"
                className="fill-transparent"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">SCORE</span>
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-3xl font-black font-mono tracking-tight ${colorConfig.text}`}
              >
                {score}
              </motion.span>
              <span className="text-[9px] font-mono font-medium text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {score <= 20 ? '0–20: Safe Range' : score <= 40 ? '21–40: Low Risk' : score <= 60 ? '41–60: Suspicious' : score <= 80 ? '61–80: High Risk' : '81–100: Critical'}
            </span>
          </div>
        </div>

        {/* Narrative Verdict Explanation (Columns: 7) */}
        <div className="md:col-span-7 flex flex-col justify-center space-y-3">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {colorConfig.verdictText}
          </p>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5">
            <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${colorConfig.text}`} />
            <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              {colorConfig.trustAdvice}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Analysis Confidence Bar */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wider">
            Analysis Confidence:
          </span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {confidencePct}%
          </span>
          <span className="text-slate-400 text-[10px]">({confidenceQuality})</span>
        </div>

        {/* Visual Confidence Bar */}
        <div className="w-full sm:w-44 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden shrink-0">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidencePct}%` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="h-full bg-cyan-600 dark:bg-cyan-400 rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

export default RiskScoreGauge;
