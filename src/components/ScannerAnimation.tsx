import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Loader2, Shield } from 'lucide-react';
import { ThreatRadar } from './ThreatRadar';

interface ScannerAnimationProps {
  scanType: 'url' | 'message' | 'screenshot' | 'qr';
  target: string;
}

export const ScannerAnimation: React.FC<ScannerAnimationProps> = ({ scanType, target }) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const stepsMap: Record<string, string[]> = {
    url: [
      'Deconstructing URL structure & protocol headers',
      'Inspecting apex domain & internationalized homoglyphs',
      'Auditing SSL/TLS encryption & certificate status',
      'Querying live DNS A-records & IP routing paths',
      'Cross-referencing global threat intelligence feeds',
      'Synthesizing AI behavioral risk classification',
    ],
    message: [
      'Extracting message token vectors & psychological sentiment',
      'Auditing urgency & fear coercion patterns',
      'Scanning for advance-fee & unsolicited reward triggers',
      'Parsing embedded hyperlinks & destination redirects',
      'Evaluating financial solicitation & credential keywords',
      'Synthesizing social engineering threat classification',
    ],
    screenshot: [
      'Analyzing image visual layout & input form geometry',
      'Inspecting brand logos, color themes & visual spoofing',
      'Extracting visible text, URLs & credentials fields',
      'Auditing fake security seals & modal dialog deception',
      'Cross-referencing known phishing portal templates',
      'Synthesizing multimodal forensic risk report',
    ],
    qr: [
      'Decoding 2D matrix barcode payload bytes',
      'Unpacking embedded URL destination or binary string',
      'Inspecting destination protocol & redirect hops',
      'Auditing quishing physical tampering indicators',
      'Cross-referencing antiphishing telemetry datasets',
      'Synthesizing explainable quishing risk score',
    ],
  };

  const currentSteps = stepsMap[scanType] || stepsMap.url;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    currentSteps.forEach((_, idx) => {
      const timer = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, idx]);
      }, 350 * (idx + 1));
      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [currentSteps]);

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-10 rounded-2xl bg-white dark:bg-[#0b0f17] border border-slate-200 dark:border-cyan-500/20 shadow-2xl relative overflow-hidden max-w-2xl mx-auto transition-colors">
      {/* Background cyber grid */}
      <div className="absolute inset-0 opacity-15 dark:opacity-10 bg-[linear-gradient(to_right,rgba(6,182,212,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.15)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Top telemetry indicator */}
      <div className="z-10 mb-5 flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-mono text-[11px] font-semibold">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
        </span>
        <span>
          {completedSteps.length >= 4
            ? 'SYNTHESIZING THREAT MATRIX'
            : completedSteps.length >= 2
            ? 'FORENSIC HEURISTIC INSPECTION'
            : 'SWEEPING ACTIVE RADAR VECTORS'}
        </span>
      </div>

      {/* Cyber radar animation */}
      <div className="relative mb-6 z-10">
        <ThreatRadar
          isScanning={true}
          scanState={completedSteps.length >= 4 ? 'analyzing' : 'scanning'}
          size="md"
          showTargetVector={false}
          showLabels={true}
          interactive={true}
        />
      </div>

      <div className="text-center mb-6 z-10">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-wider uppercase font-mono">
          ThreatLens Security Engine Active
        </h3>
        <p className="text-xs font-mono text-cyan-600 dark:text-cyan-400 mt-1 max-w-md truncate px-4">
          Target: {target}
        </p>
      </div>

      {/* Progress steps checklist */}
      <div className="w-full space-y-2 max-w-md z-10 font-mono text-xs">
        {currentSteps.map((step, idx) => {
          const isDone = completedSteps.includes(idx);
          const isCurrent = completedSteps.length === idx;

          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-300 ${
                isDone
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : isCurrent
                  ? 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-200 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
              )}
              <span className="truncate">{step}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
