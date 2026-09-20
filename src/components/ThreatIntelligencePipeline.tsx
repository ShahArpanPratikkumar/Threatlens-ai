import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Cpu,
  BrainCircuit,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Server,
  Activity,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface StepData {
  id: string;
  stage: 'DETECT' | 'ANALYZE' | 'UNDERSTAND' | 'PROTECT';
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  telemetry: { label: string; value: string }[];
  signalText: string;
  verdict: string;
}

const PIPELINE_STEPS: StepData[] = [
  {
    id: 'detect',
    stage: 'DETECT',
    title: 'Multi-Vector Ingestion',
    subtitle: 'Zero-trust intake catches inbound URLs, SMS payloads, QR matrices, and visual screenshots before interaction.',
    icon: Search,
    color: 'cyan',
    telemetry: [
      { label: 'Surface', value: 'HTTP / SMS / Barcode' },
      { label: 'Latency', value: '4ms Ingestion' },
      { label: 'Encoding', value: 'IDN / Punycode Deobfuscation' },
    ],
    signalText: 'PAYLOAD RECEIVED: secure-wellsfargo-update.login-verify.top',
    verdict: 'Vector isolated in ephemeral sandbox for telemetry profiling.',
  },
  {
    id: 'analyze',
    stage: 'ANALYZE',
    title: 'Infrastructure & DNS Telemetry',
    subtitle: 'Parallel network probing queries authoritative A-records, registrar lifespan, and SSL chain validity.',
    icon: Server,
    color: 'sky',
    telemetry: [
      { label: 'DNS Status', value: 'Cloudflare A-Record (AS13335)' },
      { label: 'Domain Age', value: '14 Days (High-Risk Velocity)' },
      { label: 'Transport', value: 'Insecure Plaintext HTTP' },
    ],
    signalText: 'TELEMETRY MATCH: Known bulletproof registrar cluster',
    verdict: 'Anomalous host reputation confirmed across global threat feeds.',
  },
  {
    id: 'understand',
    stage: 'UNDERSTAND',
    title: 'Gemini Neural Reasoning',
    subtitle: 'Multimodal AI examines language urgency, deceptive brand mimicry, and malicious credential inputs.',
    icon: BrainCircuit,
    color: 'purple',
    telemetry: [
      { label: 'Model', value: 'Gemini 2.5 Flash Heuristics' },
      { label: 'Intent Risk', value: 'Credential Harvesting Form' },
      { label: 'Psychology', value: 'Artificial Emergency Alert' },
    ],
    signalText: 'COGNITIVE VERDICT: Wells Fargo brand impersonation detected',
    verdict: 'High-confidence fraudulent credential trap targeting banking customers.',
  },
  {
    id: 'protect',
    stage: 'PROTECT',
    title: 'Autonomous Mitigation',
    subtitle: 'Deterministic 0-100 risk score generated with granular factor breakdown and defensive playbooks.',
    icon: ShieldCheck,
    color: 'emerald',
    telemetry: [
      { label: 'Risk Score', value: '94 / 100 (CRITICAL)' },
      { label: 'Action', value: 'Immediate Block & Blacklist' },
      { label: 'SOC Report', value: 'Forensic PDF Export Ready' },
    ],
    signalText: 'SYSTEM SECURE: Malicious vector neutralized & logged',
    verdict: 'Domain added to active threat blocklist; user account safeguarded.',
  },
];

export const ThreatIntelligencePipeline: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % PIPELINE_STEPS.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const activeStep = PIPELINE_STEPS[activeStepIndex];

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl glass-panel p-5 sm:p-8 lg:p-10 border border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative overflow-hidden">
      {/* Background Cyber Ambient Lines */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-[11px] font-mono font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            <span>THREATLENS SIGNATURE INTELLIGENCE ENGINE</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
            Autonomous Cyber Defense Sequence
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono mt-1">
            Real-time pipeline transitioning incoming telemetry from zero-trust intake to active mitigation.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs transition-all cursor-pointer ${
              isPlaying
                ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {isPlaying ? (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span>Live Sequence</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span>Resume Live</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setActiveStepIndex(0);
              setIsPlaying(true);
            }}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Restart pipeline from Step 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4-Step Interactive Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-8">
        {PIPELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === activeStepIndex;
          const isPassed = idx < activeStepIndex;

          return (
            <button
              key={step.id}
              onClick={() => {
                setActiveStepIndex(idx);
                setIsPlaying(false);
              }}
              className={`p-3.5 rounded-2xl border text-left font-mono transition-all cursor-pointer relative overflow-hidden ${
                isActive
                  ? 'bg-white dark:bg-slate-900/90 border-cyan-500/80 shadow-md ring-2 ring-cyan-500/20'
                  : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Progress indicator line */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 transition-all ${
                  isActive
                    ? 'bg-cyan-500'
                    : isPassed
                    ? 'bg-emerald-500/80'
                    : 'bg-transparent'
                }`}
              />

              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                  PHASE 0{idx + 1}
                </span>
                <div
                  className={`p-1.5 rounded-lg ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                      : isPassed
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-200/60 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                {step.stage}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {step.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Main Stage Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          {/* Left: Step Description & Telemetry Cards */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-mono text-[10px] font-bold tracking-wider">
                  ACTIVE PHASE: {activeStep.stage}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Step {activeStepIndex + 1} of 4
                </span>
              </div>
              <h4 className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mb-2">
                {activeStep.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                {activeStep.subtitle}
              </p>
            </div>

            {/* Signal Stream Bar */}
            <div className="p-3.5 rounded-xl bg-slate-900 dark:bg-black/80 border border-slate-800 text-slate-200 font-mono text-xs flex items-center gap-3">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span className="truncate text-cyan-400 font-semibold">{activeStep.signalText}</span>
            </div>

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activeStep.telemetry.map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 font-mono"
                >
                  <div className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-semibold mb-1">
                    {item.label}
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Interactive Architectural Node Canvas */}
          <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-2xl bg-slate-900 dark:bg-[#090D14] border border-slate-800 text-white relative overflow-hidden shadow-inner">
            {/* Top Node Status */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold">
                  TELEMETRY SANDBOX
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">
                ACTIVE PIPELINE
              </span>
            </div>

            {/* Visual Node Diagram */}
            <div className="py-6 flex flex-col items-center justify-center space-y-4 relative">
              {/* Animated Connecting Lines */}
              <div className="w-full flex items-center justify-around relative">
                {PIPELINE_STEPS.map((s, idx) => {
                  const SIcon = s.icon;
                  const isNodeActive = idx === activeStepIndex;
                  const isNodePassed = idx < activeStepIndex;

                  return (
                    <div key={s.id} className="flex flex-col items-center gap-1.5 z-10">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isNodeActive
                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40 scale-110 ring-2 ring-cyan-300/40'
                            : isNodePassed
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        <SIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono uppercase text-slate-400">
                        {s.stage}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Status Outcome Message */}
              <div className="w-full mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center font-mono text-[11px] text-slate-300 leading-snug">
                {activeStep.verdict}
              </div>
            </div>

            {/* Bottom Next Step Indicator */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>ZERO-TRUST ENFORCEMENT</span>
              <div className="flex items-center gap-1 text-cyan-400 font-semibold">
                <span>{activeStepIndex === 3 ? 'SEQUENCE COMPLETE' : 'AUTO-ADVANCING'}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ThreatIntelligencePipeline;
