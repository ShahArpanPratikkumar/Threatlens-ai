import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, MessageSquareWarning, Camera, QrCode, Zap, ArrowRight } from 'lucide-react';

export interface DemoScenario {
  id: string;
  title: string;
  category: 'url' | 'message' | 'screenshot' | 'qr';
  shortDesc: string;
  expectedRisk: string;
  expectedScore: number;
  payload: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'demo-1',
    title: 'Fake Bank Login Portal',
    category: 'url',
    shortDesc: 'Deceptive Wells Fargo credential harvesting URL using deceptive .top TLD and auth endpoint.',
    expectedRisk: 'CRITICAL',
    expectedScore: 94,
    payload: 'http://secure-wellsfargo-update.login-verify.top/auth/signin',
  },
  {
    id: 'demo-2',
    title: 'Urgent Bank Suspension SMS',
    category: 'message',
    shortDesc: 'Urgent text alert threatening immediate account termination with unencrypted phishing link.',
    expectedRisk: 'HIGH',
    expectedScore: 88,
    payload: 'URGENT: Your Wells Fargo checking account is suspended due to unusual activity. Click immediately within 15 mins to restore access: http://wellsfargo-restore.top/verify',
  },
  {
    id: 'demo-3',
    title: 'Scam Remote Job Offer',
    category: 'message',
    shortDesc: 'Advance-fee job offer promising ₹50,000/day with upfront registration fee demand.',
    expectedRisk: 'HIGH',
    expectedScore: 91,
    payload: 'Congratulations! You won selection for a Global Remote Reviewer job paying ₹50,000 per day. Deposit initial ₹1,500 security fee on UPI: payment-verify@fastpay to activate your portal.',
  },
  {
    id: 'demo-4',
    title: 'Crypto 400% "Guaranteed" Lure',
    category: 'message',
    shortDesc: 'High-yield investment fraud promising impossible return in 24 hours.',
    expectedRisk: 'CRITICAL',
    expectedScore: 95,
    payload: 'Exclusive VIP Trading Signal: Guaranteed 400% profit within 24 hours. Send minimum 0.5 ETH to official smart contract: 0x71C... and receive double payout instantly! Offer ends today.',
  },
  {
    id: 'demo-5',
    title: 'Malicious Parking QR Code',
    category: 'qr',
    shortDesc: 'Quishing sticker attack redirecting drivers to fraudulent parking meter payment gateway.',
    expectedRisk: 'HIGH',
    expectedScore: 85,
    payload: 'http://metro-city-parking-pay.click/portal/checkout?bay=4092&amt=25',
  },
];

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: DemoScenario) => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose, onSelectScenario }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getCategoryIcon = (category: DemoScenario['category']) => {
    switch (category) {
      case 'url':
        return <Globe className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />;
      case 'message':
        return <MessageSquareWarning className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'screenshot':
        return <Camera className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'qr':
        return <QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none transition-opacity"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl glass-dropdown rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden flex flex-col max-h-[90vh] border border-slate-200/90 dark:border-slate-800/90"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  ThreatLens AI — Interactive Demo Sandbox
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Select a pre-calibrated scenario to test live AI and heuristic detection
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scenarios List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {DEMO_SCENARIOS.map((scenario) => (
              <div
                key={scenario.id}
                onClick={() => {
                  onSelectScenario(scenario);
                  onClose();
                }}
                className="group p-4 rounded-2xl glass-card hover:border-cyan-500/80 hover:bg-cyan-50/40 dark:hover:bg-cyan-950/20 cursor-pointer transition-all flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shrink-0 mt-0.5 group-hover:scale-105 transition-transform shadow-xs">
                    {getCategoryIcon(scenario.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                        {scenario.title}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
                        {scenario.expectedRisk} ({scenario.expectedScore}/100)
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                      {scenario.shortDesc}
                    </p>
                    <div className="mt-2 text-[11px] font-mono text-cyan-700 dark:text-cyan-300 glass-input px-2.5 py-1 rounded-lg max-w-lg truncate shadow-xs">
                      {scenario.payload}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-mono text-cyan-600 dark:text-cyan-400 shrink-0 mt-2 font-bold opacity-60 group-hover:opacity-100 transition-opacity">
                  <span>Run</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>Safe sandbox environment • Zero malware execution</span>
            <span>Real-time DNS & Gemini 2.5 Flash</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DemoModal;
