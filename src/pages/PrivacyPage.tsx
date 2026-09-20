import React from 'react';
import { ShieldCheck, Lock, Eye, Database, CheckCircle2 } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-6 px-4 md:px-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero-Trust Privacy Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
          Privacy Policy & Data Security
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          How ThreatLens AI safeguards analyst privacy, user queries, and scanned payloads.
        </p>
      </div>

      <div className="space-y-6">
        {/* Principles */}
        <div className="p-6 rounded-2xl bg-[#0e131d]/90 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyan-400" />
            1. Non-Malware Execution Sandbox
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            When you submit a URL, QR code, or screenshot to ThreatLens AI, our inspection engine evaluates
            syntactic properties, protocol handshakes, DNS records, and AI visual representations in an isolated
            virtual environment. Client browsers will never be forced to load executable binaries, ActiveX controls,
            or third-party tracking cookies from inspected destinations.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0e131d]/90 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-400" />
            2. Password & Credential Redaction
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Passwords provided in user messages or extracted from fake forms are treated as sensitive threat artifacts.
            User passwords on the ThreatLens platform are encrypted with SHA-256 with distinct salts and are never stored in plaintext.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0e131d]/90 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            3. Data Retention & User Erasure
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            ThreatLens AI gives full control to users. You can selectively delete individual threat scan logs or
            permanently purge your entire inspection history at any time from the Settings or Threat History dashboard.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0e131d]/90 border border-slate-800 space-y-3 font-mono text-xs">
          <h3 className="font-bold text-slate-200">Compliance & Ethical Disclaimer</h3>
          <p className="text-slate-400 leading-relaxed font-sans">
            ThreatLens AI provides cybersecurity advisory signals and risk probabilities. While our deterministic
            engine and AI models achieve high accuracy on known and novel threat patterns, users must always exercise
            fundamental operational security when interacting with unknown digital communications.
          </p>
        </div>
      </div>
    </div>
  );
};
