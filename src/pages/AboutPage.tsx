import React from 'react';
import { Shield, Cpu, Target, Layers, CheckCircle2, Code2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-6 px-4 md:px-6 select-none">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1">
          <Shield className="w-4 h-4" />
          <span>Platform Architecture & Philosophy</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
          About ThreatLens AI
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          A production-quality cybersecurity intelligence assistant built with explainable risk mechanics.
        </p>
      </div>

      <div className="space-y-6">
        {/* Core Mission */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0e131d]/90 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-cyan-600 dark:text-cyan-400 font-mono">
            Mission: "See the Threat Before You Trust It"
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Phishing has evolved beyond simple spelling errors. Modern cyber attackers leverage homoglyph punycode
            domains, AI-generated urgency narratives, fake SMS bank notices, and malicious QR code stickers ("quishing").
            ThreatLens AI bridges the gap between advanced Security Operations Centers (SOC) and everyday digital users.
          </p>
        </div>

        {/* Dual-Engine Architecture */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0e131d]/90 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Dual-Layer Detection Engine
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            ThreatLens does not rely solely on an AI model or a static blocklist. It utilizes a synchronized dual-layer pipeline:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="font-bold text-emerald-600 dark:text-emerald-400">Layer 1: Deterministic Heuristics & DNS</div>
              <ul className="text-slate-600 dark:text-slate-400 space-y-1 text-[11px] list-disc list-inside">
                <li>Live DNS IPv4/IPv6 resolution & A-records</li>
                <li>TLD reputation & registrar entropy</li>
                <li>Levenshtein distance brand spoofing</li>
                <li>Punycode / IDN homoglyph verification</li>
                <li>SSL encryption & plaintext credentials</li>
                <li>Social engineering panic token scan</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="font-bold text-cyan-600 dark:text-cyan-400">Layer 2: Google Gemini AI (3.6-flash)</div>
              <ul className="text-slate-600 dark:text-slate-400 space-y-1 text-[11px] list-disc list-inside">
                <li>Deep contextual semantic analysis</li>
                <li>Psychological coercion & fear detection</li>
                <li>Multimodal vision for screenshot form cloning</li>
                <li>Zero-day linguistic scam pattern recognition</li>
                <li>Human-readable explainable threat mechanics</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Explainability Pledge */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0e131d]/90 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" />
            Explainable Risk Scoring
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Other tools show an arbitrary percentage without explanation. ThreatLens publishes the exact points deduction:
            unencrypted HTTP (+25), deceptive TLD (+20), homoglyph brand impersonation (+35), or urgent payment demand (+20).
            Users understand the risk mechanics and gain lasting cybersecurity literacy.
          </p>
        </div>
      </div>
    </div>
  );
};
