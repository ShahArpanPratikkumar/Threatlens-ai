import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Globe,
  MessageSquareWarning,
  Camera,
  QrCode,
  Zap,
  ArrowRight,
  Cpu,
  Search,
  Puzzle,
  ChevronRight,
  Shield,
  CheckCircle2,
  Lock,
  Layers,
  FileText,
  AlertTriangle,
  Server,
  Activity,
  Sparkles,
  Radar,
  Radio,
  ExternalLink,
  X,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  Users,
  Building2,
  User,
  Star,
  TrendingUp,
  Rss,
  HelpCircle,
  BadgeCheck,
  Minus,
  DollarSign,
} from 'lucide-react';
import { RiskScoreGauge } from '../components/RiskScoreGauge';
import { ThreatRadar } from '../components/ThreatRadar';
import { ThreatIntelligencePipeline } from '../components/ThreatIntelligencePipeline';
import { MagneticButton } from '../components/MagneticButton';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../services/api';
import type { AnonymousSessionInfo, SecurityAnalysisResult } from '../types';

interface LandingPageProps {
  onNavigate: (route: string) => void;
  onOpenDemo?: () => void;
  onOpenExtension?: () => void;
}

interface SampleUrlOption {
  id: string;
  name: string;
  url: string;
  type: 'Clean' | 'Suspicious';
}

const SAMPLE_URLS: SampleUrlOption[] = [
  {
    id: 'sample-github',
    name: '[EXAMPLE] Official GitHub',
    url: 'https://github.com/',
    type: 'Clean',
  },
  {
    id: 'sample-google',
    name: '[EXAMPLE] Google Portal',
    url: 'https://google.com/',
    type: 'Clean',
  },
  {
    id: 'sample-wellsfargo',
    name: '[EXAMPLE] Wells Fargo Phish',
    url: 'http://secure-wellsfargo-update.login-verify.top/auth/signin',
    type: 'Suspicious',
  },
  {
    id: 'sample-chase',
    name: '[EXAMPLE] Urgent Bank SMS Link',
    url: 'https://chase-unblock.xyz/auth',
    type: 'Suspicious',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenDemo,
  onOpenExtension,
}) => {
  const { user } = useAuth();

  // Real URL Analysis State
  const [urlInput, setUrlInput] = useState<string>('https://github.com/');
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [activeScanResult, setActiveScanResult] = useState<SecurityAnalysisResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [anonStatus, setAnonStatus] = useState<AnonymousSessionInfo | null>(null);
  const [showLoginGate, setShowLoginGate] = useState<boolean>(false);
  const [showWhyResult, setShowWhyResult] = useState<boolean>(false);

  // Initialize and check anonymous session status from server
  useEffect(() => {
    let isMounted = true;
    async function initSession() {
      if (!user) {
        try {
          const status = await api.getAnonymousStatus();
          if (isMounted) {
            setAnonStatus(status);
            // If the user already performed their 1 free scan, fetch it so history is retained on refresh
            if (status.hasScanned && status.scanId) {
              try {
                const prev = await api.getScanById(status.scanId);
                if (isMounted) {
                  setActiveScanResult(prev);
                  setUrlInput(prev.target);
                }
              } catch {
                // Ignore if not accessible
              }
            }
          }
        } catch {
          // Status fallback
        }
      }
    }
    initSession();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Unified CTA Handler with Authentication Check
  const handleStartNow = () => {
    if (user) {
      onNavigate('/dashboard');
    } else {
      onNavigate('/login?redirect=/dashboard');
    }
  };

  // Feature Card Launch with Authentication Check & Destination Preservation
  const handleFeatureLaunch = (destinationRoute: string) => {
    if (user) {
      onNavigate(destinationRoute);
    } else {
      onNavigate(`/login?redirect=${encodeURIComponent(destinationRoute)}`);
    }
  };

  // Real URL Scan Execution
  const handleRunScan = async (targetOverride?: string) => {
    const rawTarget = (targetOverride || urlInput || '').trim();
    if (!rawTarget) {
      setScanError('Please enter a valid URL to analyze (e.g. https://github.com/)');
      return;
    }

    // Enforce 1-scan limit for anonymous visitors on client & server
    if (!user && anonStatus && anonStatus.scanCount >= 1) {
      setShowLoginGate(true);
      return;
    }

    setIsScanning(true);
    setScanError(null);

    try {
      const result = await api.scanUrl(rawTarget);
      setActiveScanResult(result);
      if (!user) {
        setAnonStatus((prev) => ({
          sessionId: prev?.sessionId || 'anon-session',
          scanCount: 1,
          remaining: 0,
          hasScanned: true,
          scanId: result.id,
        }));
      }
    } catch (err: any) {
      if (err instanceof ApiError && (err.status === 403 || err.code === 'AUTH_REQUIRED' || err.requiresAuth)) {
        setShowLoginGate(true);
        if (!user && err.anonymousSession) {
          setAnonStatus({
            sessionId: err.anonymousSession.sessionId,
            scanCount: err.anonymousSession.scanCount,
            remaining: 0,
            hasScanned: true,
          });
        }
      } else {
        setScanError(err.message || 'Error communicating with ThreatLens SOC engine.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectSample = (sample: SampleUrlOption) => {
    setSelectedSampleId(sample.id);
    setUrlInput(sample.url);
    setScanError(null);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col gap-24 sm:gap-32 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION WITH CINEMATIC INTERACTION & FLOATING TELEMETRY SIGNALS    */}
      {/* ========================================================================= */}
      <section className="relative flex flex-col items-center text-center pt-8 sm:pt-14 md:pt-20 pb-4">
        {/* Ambient Cybersecurity Depth Lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[650px] h-[320px] sm:h-[450px] bg-cyan-500/10 dark:bg-cyan-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/2 right-10 w-72 h-72 bg-purple-500/5 dark:bg-purple-500/10 blur-[90px] rounded-full pointer-events-none -z-10" />

        {/* Floating Telemetry Security Signals (Desktop) */}
        <div className="hidden lg:block absolute left-4 top-24 pointer-events-none animate-float">
          <div className="px-3.5 py-2 rounded-2xl glass-dropdown text-left font-mono border border-slate-200/80 dark:border-slate-800/80 shadow-xl max-w-[200px]">
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SYSTEM SHIELD ACTIVE</span>
            </div>
            <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold leading-tight">
              Zero-Trust Radar running in real time
            </div>
          </div>
        </div>

        <div className="hidden lg:block absolute right-4 top-28 pointer-events-none animate-float" style={{ animationDelay: '2s' }}>
          <div className="px-3.5 py-2 rounded-2xl glass-dropdown text-left font-mono border border-slate-200/80 dark:border-slate-800/80 shadow-xl max-w-[210px]">
            <div className="flex items-center gap-1.5 text-[10px] text-cyan-600 dark:text-cyan-400 font-bold mb-1">
              <Sparkles className="w-3 h-3 text-cyan-500" />
              <span>AI HEURISTICS: ONLINE</span>
            </div>
            <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold leading-tight">
              Gemini 2.5 Flash neural models loaded (42ms)
            </div>
          </div>
        </div>

        {/* Security Platform Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50/90 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-semibold mb-6 shadow-xs"
        >
          <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-ping" />
          <span>AUTONOMOUS CYBER DEFENSE • MULTI-VECTOR INTELLIGENCE</span>
        </motion.div>

        {/* Required Primary Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-slate-100 max-w-4xl leading-[1.15]"
        >
          See Threats{' '}
          <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 dark:from-cyan-400 dark:via-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Before They See You.
          </span>
        </motion.h1>

        {/* Required Supporting Copy */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed"
        >
          ThreatLens AI combines AI-powered analysis with threat intelligence to help identify suspicious URLs, messages, screenshots and digital threats.
        </motion.p>

        {/* Action Gateway Buttons with Magnetic CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-none"
        >
          {/* PRIMARY CTA: START NOW with Magnetic Interaction */}
          <MagneticButton
            id="hero-start-now-btn"
            onClick={handleStartNow}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md shadow-cyan-600/25"
          >
            <span>START NOW</span>
            <ArrowRight className="w-4 h-4" />
          </MagneticButton>

          {/* SECONDARY CTA: EXPLORE THREATLENS */}
          <button
            onClick={() => scrollToSection('features')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-mono text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            <span>EXPLORE THREATLENS</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Interactive Demo Mode Trigger */}
          {onOpenDemo && (
            <button
              onClick={onOpenDemo}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 font-mono text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Interactive Scenarios</span>
            </button>
          )}
        </motion.div>

        {/* User state indicator */}
        {user && (
          <div className="mt-4 text-xs font-mono text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Authenticated as <strong>{user.name || user.email}</strong> • "START NOW" opens Command Center directly</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. HERO VISUAL: LIVE THREAT RADAR & REAL-TIME ANALYSIS                    */}
        {/* ========================================================================= */}
        <motion.div
          id="simulator"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 sm:mt-16 w-full max-w-4xl p-4 sm:p-7 rounded-3xl glass-panel text-left relative overflow-hidden border border-slate-200/90 dark:border-slate-800/90 shadow-2xl"
        >
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3.5 mb-5">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-500 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="ml-2 font-semibold text-slate-800 dark:text-slate-200">
                THREATLENS REAL-TIME ANALYSIS ENGINE
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                LIVE THREAT ANALYSIS
              </span>
              {user ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                  ACCOUNT: UNLIMITED
                </span>
              ) : anonStatus && anonStatus.scanCount >= 1 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                  FREE SCAN CONSUMED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
                  1 FREE GUEST SCAN
                </span>
              )}
            </div>
          </div>

          {/* Sample Targets Bar */}
          <div className="space-y-1.5 mb-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-500" />
                Sample Targets:
              </span>
              {SAMPLE_URLS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                    selectedSampleId === sample.id
                      ? 'bg-cyan-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                  title={sample.url}
                >
                  {sample.name}
                </button>
              ))}
            </div>
            {selectedSampleId && (
              <p className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                Sample URL loaded. Click <strong>Inspect Threat</strong> below to submit it to the live ThreatLens analysis pipeline.
              </p>
            )}
          </div>

          {/* Consumed Free Scan Notice if applicable */}
          {!user && anonStatus && anonStatus.scanCount >= 1 && (
            <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-amber-800 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>You've used your 1 free ThreatLens scan. Sign in or create a free account for unlimited real-time threat inspections and persistent history.</span>
              </div>
              <button
                onClick={() => setShowLoginGate(true)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
              >
                Sign In / Sign Up
              </button>
            </div>
          )}

          {/* Interactive Input Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-2 mb-6">
            <div className="relative flex-1 w-full">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setSelectedSampleId(null);
                  if (scanError) setScanError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunScan();
                }}
                placeholder="Enter URL to inspect (e.g., https://github.com/)..."
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              onClick={() => handleRunScan()}
              disabled={isScanning}
              className="w-full sm:w-auto px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isScanning ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Inspect Threat</span>
                </>
              )}
            </button>
          </div>

          {/* Scan Error Message */}
          {scanError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{scanError}</span>
            </div>
          )}

          {/* Scanning Animation */}
          {isScanning ? (
            <div className="p-10 text-center flex flex-col items-center justify-center gap-3">
              <ThreatRadar isScanning={true} size="md" />
              <div className="font-mono text-xs text-cyan-600 dark:text-cyan-400 font-semibold mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                <span>Executing live DNS resolution, SSL/TLS handshake check, and heuristic threat analysis...</span>
              </div>
            </div>
          ) : activeScanResult ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Score Gauge */}
                <div className="md:col-span-7">
                  <RiskScoreGauge
                    score={activeScanResult.riskScore}
                    level={activeScanResult.riskLevel}
                    threatType={activeScanResult.threatType}
                    confidence={activeScanResult.confidence}
                  />
                </div>

                {/* Spatial Threat Radar Visualizer */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl glass-card bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                      Spatial Radar Telemetry
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {activeScanResult.technicalSignals.length} Signals
                    </span>
                  </div>
                  <ThreatRadar
                    scanResult={activeScanResult}
                    score={activeScanResult.riskScore}
                    threatType={activeScanResult.threatType}
                    size="sm"
                  />
                </div>
              </div>

              {/* Summary Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs font-mono space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Target Inspection Analysis
                </div>
                <div className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans text-xs">
                  {activeScanResult.summary}
                </div>
              </div>

              {/* Quick Technical Signal Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                {activeScanResult.technicalSignals.slice(0, 4).map((sig, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl border backdrop-blur-xs ${
                      sig.status === 'malicious'
                        ? 'bg-rose-50/70 dark:bg-rose-950/25 border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-200'
                        : sig.status === 'suspicious'
                        ? 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-200'
                        : 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                    }`}
                  >
                    <div className="text-[9px] text-slate-400 uppercase font-semibold">
                      {sig.category} • {sig.key}
                    </div>
                    <div className="font-bold mt-0.5 text-[11px] truncate" title={String(sig.value)}>
                      {String(sig.value)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Forensic Report Link & Details */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Scan ID: <strong className="text-slate-700 dark:text-slate-300">{activeScanResult.id}</strong></span>
                  <span>• Duration: {activeScanResult.metadata.analysisDurationMs}ms</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowWhyResult(!showWhyResult)}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Why this result?</span>
                    {showWhyResult ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => onNavigate(`/report/${activeScanResult.id}`)}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Full Forensic Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* WHAT THREATLENS CHECKED Section */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-500" />
                    <span>WHAT THREATLENS CHECKED</span>
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                    REAL INSPECTION AUDIT
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 font-mono text-xs">
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">URL & Syntax</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">CHECKED</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                      Scheme & Authority Deconstructed
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">DNS A-Record</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">CHECKED</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {activeScanResult.threatIntelligence?.dnsStatus?.ipAddresses?.join(', ') || 'Domain Host Telemetry Active'}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">SSL / TLS Protocol</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">CHECKED</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {activeScanResult.target.startsWith('https') ? 'Valid Cryptographic TLS Handshake' : 'Insecure Plaintext HTTP'}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Domain Reputation</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">CHECKED</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                      TLD & Homoglyph Heuristics
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Threat Heuristics</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">CHECKED</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                      Autonomous Rules Engine
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">AI Threat Reasoning</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                        {activeScanResult.metadata.isAiFallback ? 'RULE ENGINE' : 'GEMINI AI'}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                      Pattern & Social Engineering Audit
                    </div>
                  </div>
                </div>
              </div>

              {/* WHY THIS RESULT? Collapsible Detailed Breakdown */}
              {showWhyResult && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Info className="w-4 h-4 text-cyan-500" />
                      <span>WHY THIS RESULT? (SECURITY EVIDENCE & REASONING)</span>
                    </h5>
                    <span className="text-[10px] text-slate-400">
                      Calculated from real signal weights
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Primary Evidence */}
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                        Key Risk Factors & Evidence Found:
                      </div>
                      {activeScanResult.explanation.whyDangerous.length > 0 ? (
                        <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-xs">
                          {activeScanResult.explanation.whyDangerous.map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-cyan-500 mt-0.5">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>No malicious indicators found. All protocol, DNS, and structural parameters align with legitimate operating standards.</span>
                        </p>
                      )}
                    </div>

                    {/* Threat Mechanics */}
                    {activeScanResult.explanation.threatMechanics && (
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                          Threat Mechanics / Architecture:
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-xs font-sans leading-relaxed">
                          {activeScanResult.explanation.threatMechanics}
                        </p>
                      </div>
                    )}

                    {/* Mathematical Risk Breakdown */}
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                        Risk Scoring Formula Breakdown (0 - 100 Points):
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                          <span className="text-slate-400 block text-[10px]">Domain Risk</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{activeScanResult.riskBreakdown.domainRisk} pts</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                          <span className="text-slate-400 block text-[10px]">URL Structure</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{activeScanResult.riskBreakdown.urlStructureRisk} pts</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                          <span className="text-slate-400 block text-[10px]">SSL / TLS Risk</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{activeScanResult.riskBreakdown.sslRisk} pts</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                          <span className="text-slate-400 block text-[10px]">AI / Pattern Risk</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{activeScanResult.riskBreakdown.aiRisk + activeScanResult.riskBreakdown.reputationRisk} pts</span>
                        </div>
                      </div>
                    </div>

                    {/* Verification Source & Limitations Notice */}
                    <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
                      <p>
                        <strong>Verification Model:</strong> AI Confidence ({Math.round(activeScanResult.confidence * 100)}%) represents algorithmic assessment of deceptive patterns. Cryptographic TLS validation and DNS A-record lookups are performed directly against authoritative network endpoints.
                      </p>
                      <p>
                        <strong>Limitations:</strong> ThreatLens inspects telemetry at the time of execution. Emerging zero-day campaigns or newly created domains without reputation history may present residual risks.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Clean Ready State */
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="p-4 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30">
                <Globe className="w-8 h-8" />
              </div>
              <h4 className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                ThreatLens URL Scanner Ready
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md font-sans">
                Enter any URL or select one of the sample vectors above, then click <strong>Inspect Threat</strong> to execute deep DNS, SSL/TLS, and heuristic AI analysis in real time.
              </p>
              <button
                onClick={() => handleRunScan()}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Analyze Default URL (GitHub)</span>
              </button>
            </div>
          )}
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION A: LIVE STATS COUNTER                                             */}
      {/* ========================================================================= */}
      <StatsCounterSection />

      {/* ========================================================================= */}
      {/* 2.5 SIGNATURE THREATLENS INTELLIGENCE PIPELINE: DETECT -> ANALYZE -> ... */}
      {/* ========================================================================= */}
      <section id="pipeline" className="scroll-mt-24">
        <ThreatIntelligencePipeline />
      </section>

      {/* ========================================================================= */}
      {/* 3. PRODUCT VALUE SECTION (DEFENSE VECTORS WITH INTERACTIVE MICRO-SCANNERS) */}
      {/* ========================================================================= */}
      <section id="features" className="space-y-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            Attack Surface Coverage
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
            Specialized Threat Inspection Engines
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            ThreatLens AI analyzes the primary attack surfaces exploited by modern adversaries—from deceptive domains to visual phishing modals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Card 1: URL Threat Detection with Laser Sweep */}
          <div
            onClick={() => handleFeatureLaunch('/scan/url')}
            className="p-6 rounded-3xl glass-panel hover:border-cyan-500/80 cursor-pointer transition-all group flex flex-col justify-between relative overflow-hidden"
          >
            {/* Animated Laser Scanning Line */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-laser pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 w-fit rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400 group-hover:scale-105 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 uppercase font-bold tracking-wider">
                  REAL-TIME DNS
                </span>
              </div>
              <h3 className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                URL Threat Detection
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Deconstructs typosquatting, IDN homoglyphs, punycode spoofing, live DNS A-records, registrar TLDs, and plaintext authentication lures.
              </p>
            </div>

            {/* Mock Vector Visual Pill */}
            <div className="mt-4 p-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate">
              <span className="text-cyan-600 dark:text-cyan-400 font-bold mr-1">https://</span>
              <span>login-account-verify.xyz</span>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">
              <span>Launch URL Scanner</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Message Analysis */}
          <div
            onClick={() => handleFeatureLaunch('/scan/message')}
            className="p-6 rounded-3xl glass-panel hover:border-amber-500/80 cursor-pointer transition-all group flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-laser pointer-events-none" style={{ animationDelay: '1s' }} />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 w-fit rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                  <MessageSquareWarning className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase font-bold tracking-wider">
                  URGENCY HEURISTICS
                </span>
              </div>
              <h3 className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                Message & SMS Analysis
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Audits SMS, email, and chat messages for psychological panic manipulation, urgent deadlines, and impersonated bank security notices.
              </p>
            </div>

            <div className="mt-4 p-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 font-mono text-[11px] text-amber-800 dark:text-amber-300 truncate">
              <span className="font-bold text-rose-500 mr-1">URGENT:</span>
              <span>Your debit card will be suspended...</span>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">
              <span>Inspect Messages</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Screenshot Intelligence */}
          <div
            onClick={() => handleFeatureLaunch('/scan/screenshot')}
            className="p-6 rounded-3xl glass-panel hover:border-purple-500/80 cursor-pointer transition-all group flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-laser pointer-events-none" style={{ animationDelay: '1.5s' }} />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 w-fit rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase font-bold tracking-wider">
                  MULTIMODAL AI
                </span>
              </div>
              <h3 className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                Screenshot Intelligence
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Multimodal AI vision inspects fake security warning popups, cloned banking login forms, and visual deception indicators.
              </p>
            </div>

            <div className="mt-4 p-2 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 font-mono text-[11px] text-purple-800 dark:text-purple-300 truncate">
              <span className="font-bold mr-1">VISION:</span>
              <span>Cloned Microsoft 365 login frame detected</span>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">
              <span>Upload Screenshot</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: QR Threat Detection */}
          <div
            onClick={() => handleFeatureLaunch('/scan/qr')}
            className="p-6 rounded-3xl glass-panel hover:border-emerald-500/80 cursor-pointer transition-all group flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-laser pointer-events-none" style={{ animationDelay: '2s' }} />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 w-fit rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                  <QrCode className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wider">
                  QUISHING GUARD
                </span>
              </div>
              <h3 className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                QR Threat Detection
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Decodes physical and digital QR barcodes, unpacks redirect chains, and identifies rogue payment portals or parking meter quishing.
              </p>
            </div>

            <div className="mt-4 p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 font-mono text-[11px] text-emerald-800 dark:text-emerald-300 truncate">
              <span className="font-bold mr-1">BARCODE:</span>
              <span>Redirect chain unpacks to offshore payment IP</span>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              <span>Scan QR Code</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Browser Extension Simulator */}
          <div
            onClick={onOpenExtension}
            className="p-6 rounded-3xl glass-panel hover:border-sky-500/80 cursor-pointer transition-all group flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 w-fit rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
                  <Puzzle className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 uppercase font-bold tracking-wider">
                  CLIENT AGENT
                </span>
              </div>
              <h3 className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                Browser Extension Guard
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Real-time tab protection testing simulating instant pre-navigation inspection of suspicious hyperlinks directly in the browser.
              </p>
            </div>

            <div className="mt-4 p-2 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/40 font-mono text-[11px] text-sky-800 dark:text-sky-300 truncate">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 mr-1">TAB SHIELD:</span>
              <span>Protected against unverified redirect hops</span>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono text-sky-600 dark:text-sky-400 font-bold">
              <span>Simulate Extension</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Audit Trail & History */}
          <div
            onClick={() => handleFeatureLaunch('/history')}
            className="p-6 rounded-3xl glass-panel hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer transition-all group flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 w-fit rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 group-hover:scale-105 transition-transform">
                  <Cpu className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">
                  FORENSIC LOGS
                </span>
              </div>
              <h3 className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 transition-colors">
                Audit Trail & History
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Full incident history logs with search, category filtering, risk distribution charts, and JSON forensic export.
              </p>
            </div>

            <div className="mt-4 p-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate">
              <span className="font-bold mr-1">EXPORTS:</span>
              <span>Executive Summary PDF & Structured JSON</span>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 font-bold">
              <span>View Audit History</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION B: USE CASE / INDUSTRY SECTION                                   */}
      {/* ========================================================================= */}
      <UseCaseSection onNavigate={onNavigate} user={user} />

      {/* ========================================================================= */}
      {/* SECTION C: COMPETITOR COMPARISON TABLE                                   */}
      {/* ========================================================================= */}
      <ComparisonTableSection />

      {/* ========================================================================= */}
      {/* SECTION D: PRICING PLANS                                                  */}
      {/* ========================================================================= */}
      <PricingSection onNavigate={onNavigate} user={user} />

      {/* ========================================================================= */}
      {/* 4. AI INTELLIGENCE SECTION (HOW IT WORKS)                                 */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="space-y-10 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            Analysis Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
            How ThreatLens AI Evaluates Threats
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            From raw input to transparent score deconstruction—no mystery black boxes.
          </p>
        </div>

        {/* 5-Step Process Visualizer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Step 1: Input */}
          <div className="p-5 rounded-2xl glass-card flex flex-col justify-between relative border border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-600 dark:text-cyan-400">
                  STEP 01
                </span>
                <Globe className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                INPUT
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Raw URL, SMS payload, QR code image, or visual login screenshot is ingested for inspection.
              </p>
            </div>
            <div className="mt-4 pt-2 text-[10px] font-mono text-slate-400 border-t border-slate-100 dark:border-slate-800/60">
              Vector Ingestion
            </div>
          </div>

          {/* Step 2: Threat Intelligence */}
          <div className="p-5 rounded-2xl glass-card flex flex-col justify-between relative border border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-600 dark:text-cyan-400">
                  STEP 02
                </span>
                <Server className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                THREAT INTEL
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Live DNS lookup checks A-records, registrar TLD reputation, punycode, and SSL certificate validity.
              </p>
            </div>
            <div className="mt-4 pt-2 text-[10px] font-mono text-slate-400 border-t border-slate-100 dark:border-slate-800/60">
              Infrastructure Telemetry
            </div>
          </div>

          {/* Step 3: AI Analysis */}
          <div className="p-5 rounded-2xl glass-card flex flex-col justify-between relative border border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-600 dark:text-cyan-400">
                  STEP 03
                </span>
                <Sparkles className="w-4 h-4 text-cyan-500" />
              </div>
              <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                AI ANALYSIS
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Gemini neural heuristics evaluate language urgency, brand visual spoofing, and credential harvesting forms.
              </p>
            </div>
            <div className="mt-4 pt-2 text-[10px] font-mono text-slate-400 border-t border-slate-100 dark:border-slate-800/60">
              Neural Heuristics
            </div>
          </div>

          {/* Step 4: Risk Assessment */}
          <div className="p-5 rounded-2xl glass-card flex flex-col justify-between relative border border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-600 dark:text-cyan-400">
                  STEP 04
                </span>
                <Activity className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                RISK ASSESSMENT
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Point-by-point score calculation (0–100) and risk level tiering with transparent factor explanations.
              </p>
            </div>
            <div className="mt-4 pt-2 text-[10px] font-mono text-slate-400 border-t border-slate-100 dark:border-slate-800/60">
              Explainable Scoring
            </div>
          </div>

          {/* Step 5: Actionable Insight */}
          <div className="p-5 rounded-2xl glass-card flex flex-col justify-between relative border border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  STEP 05
                </span>
                <Shield className="w-4 h-4 text-emerald-500" />
              </div>
              <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                ACTIONABLE INSIGHT
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Concrete defensive guidance: block domain, purge cached tokens, inspect redirects, or dismiss safe artifact.
              </p>
            </div>
            <div className="mt-4 pt-2 text-[10px] font-mono text-slate-400 border-t border-slate-100 dark:border-slate-800/60">
              Immediate Guidance
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TRUST / SECURITY SECTION                                              */}
      {/* ========================================================================= */}
      <section id="security" className="scroll-mt-24">
        <div className="p-6 sm:p-10 rounded-3xl bg-slate-900 dark:bg-[#0A0E17] border border-slate-800 text-slate-100 relative overflow-hidden shadow-2xl">
          {/* Subtle Cyber Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>TRANSPARENT DEFENSE ARCHITECTURE</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-100">
              Explainable Cybersecurity Built on Real Telemetry.
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Traditional black-box scanners output an opaque number with no context. ThreatLens AI breaks down the exact risk drivers for every evaluation—from plaintext protocols and raw IP hosts to visual brand mimicry and urgent psychological lures.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="text-cyan-400 font-bold">No Black-Box Scores</div>
                <div className="text-[11px] text-slate-300">
                  Every point penalty is mathematically documented and explained in plain English.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="text-cyan-400 font-bold">Zero-Trust Inspection</div>
                <div className="text-[11px] text-slate-300">
                  Every link, SMS, or QR code is treated as untrusted until verified through multi-vector checks.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="text-cyan-400 font-bold">Local Credential Privacy</div>
                <div className="text-[11px] text-slate-300">
                  Ephemeral threat analysis—ThreatLens never stores, sells, or harvests user credentials.
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('/about')}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Read Technical Specifications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('/privacy')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs transition-colors cursor-pointer"
              >
                Privacy Principles
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION E: TESTIMONIALS                                                   */}
      {/* ========================================================================= */}
      <TestimonialsSection />


      {/* ========================================================================= */}
      {/* SECTION G: THREAT INTELLIGENCE BLOG FEED                                 */}
      {/* ========================================================================= */}
      <ThreatBlogSection onNavigate={onNavigate} />

      {/* ========================================================================= */}
      {/* SECTION H: FAQ ACCORDION                                                  */}
      {/* ========================================================================= */}
      <FaqSection />

      {/* ========================================================================= */}
      {/* 6. BOTTOM CALL TO ACTION WITH MAGNETIC BUTTON                            */}
      {/* ========================================================================= */}
      <section className="relative text-center py-10 sm:py-16 px-4 rounded-3xl bg-slate-100/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto shadow-xs">
            <Shield className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
            Ready to see what ThreatLens AI can detect?
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Inspect suspicious links, phishing messages, and deceptive screenshots with instant explainable intelligence.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <MagneticButton
              id="bottom-start-now-btn"
              onClick={handleStartNow}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md shadow-cyan-600/25"
            >
              <span>START NOW</span>
              <ArrowRight className="w-4 h-4" />
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* LOGIN GATE MODAL: SHOWN AFTER ANONYMOUS FREE SCAN IS USED                */}
      {/* ========================================================================= */}
      {showLoginGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Close Button */}
            <button
              onClick={() => setShowLoginGate(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30 font-mono text-[11px] font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-500" />
                <span>THREATLENS ACCESS GATEWAY</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-mono font-extrabold text-slate-900 dark:text-slate-100">
                YOUR FREE SECURITY CHECK IS COMPLETE
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                You've used your free ThreatLens scan. Create an account or sign in to continue analyzing URLs, preserve your threat history, and access full SOC capabilities.
              </p>
            </div>

            {/* Account Benefits */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5 font-mono text-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Full Account Privileges:
              </div>
              <div className="space-y-2 text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>Unlimited live URL, SMS, Screenshot, and QR threat scans</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>Persistent, completely isolated scan telemetry history</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>Downloadable executive & forensic PDF reports</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>Your free scan is automatically saved to your new account</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('/register?redirect=/scan/url')}
                className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>SIGN UP FREE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('/login?redirect=/scan/url')}
                className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>SIGN IN</span>
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowLoginGate(false)}
                className="text-[11px] font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline cursor-pointer"
              >
                Continue viewing current scan result
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// SECTION A: LIVE STATS COUNTER
// ============================================================
function useCountUp(target: number, duration: number = 2000, trigger: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, trigger]);
  return count;
}

function StatsCounterSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const threats = useCountUp(247891, 2200, visible);
  const accuracy = useCountUp(994, 1800, visible);
  const speed = useCountUp(487, 1600, visible);
  const vectors = useCountUp(4, 800, visible);

  const stats = [
    {
      value: threats.toLocaleString() + '+',
      label: 'Threats Detected',
      sublabel: 'Across all vectors',
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-950/30',
      border: 'border-cyan-200 dark:border-cyan-500/20',
      icon: <ShieldCheck className="w-5 h-5" />,
    },
    {
      value: (accuracy / 10).toFixed(1) + '%',
      label: 'Detection Accuracy',
      sublabel: 'AI + heuristics combined',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-500/20',
      icon: <BadgeCheck className="w-5 h-5" />,
    },
    {
      value: '<' + speed + 'ms',
      label: 'Avg Analysis Time',
      sublabel: 'End-to-end pipeline',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      border: 'border-purple-200 dark:border-purple-500/20',
      icon: <Zap className="w-5 h-5" />,
    },
    {
      value: vectors.toString(),
      label: 'Attack Vectors Covered',
      sublabel: 'URL · Message · QR · Screenshot',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-500/20',
      icon: <Radar className="w-5 h-5" />,
    },
  ];

  return (
    <section ref={ref} className="scroll-mt-24">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`p-5 sm:p-6 rounded-2xl border glass-card flex flex-col gap-3 ${stat.bg} ${stat.border}`}
          >
            <div className={`w-fit p-2 rounded-xl ${stat.bg} border ${stat.border} ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                {stat.label}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                {stat.sublabel}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// SECTION B: USE CASE / INDUSTRY SECTION
// ============================================================
interface UseCaseSectionProps {
  onNavigate: (route: string) => void;
  user: any;
}

function UseCaseSection({ onNavigate, user }: UseCaseSectionProps) {
  const handleCTA = (route: string) => {
    if (user) onNavigate(route);
    else onNavigate(`/login?redirect=${encodeURIComponent(route)}`);
  };

  const cases = [
    {
      icon: <User className="w-7 h-7" />,
      tag: 'FOR INDIVIDUALS',
      title: 'Personal Cyber Defense',
      tagColor: 'text-cyan-600 dark:text-cyan-400',
      tagBg: 'bg-cyan-50 dark:bg-cyan-950/30',
      tagBorder: 'border-cyan-200 dark:border-cyan-500/30',
      iconBg: 'bg-cyan-50 dark:bg-cyan-500/10',
      iconBorder: 'border-cyan-200 dark:border-cyan-500/20',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      borderHover: 'hover:border-cyan-500/60',
      ctaColor: 'bg-cyan-600 hover:bg-cyan-500',
      desc: 'Protect yourself from phishing links, scam SMS messages, and fraudulent QR codes before you click.',
      features: [
        'Instant URL safety check before visiting',
        'SMS & WhatsApp scam detection',
        'QR code verification at restaurants & events',
        '1 free scan — no account required',
      ],
      cta: 'Start Free Scan',
      route: '/scan/url',
    },
    {
      icon: <Users className="w-7 h-7" />,
      tag: 'FOR SOC TEAMS',
      title: 'Security Operations Center',
      tagColor: 'text-purple-600 dark:text-purple-400',
      tagBg: 'bg-purple-50 dark:bg-purple-950/30',
      tagBorder: 'border-purple-200 dark:border-purple-500/30',
      iconBg: 'bg-purple-50 dark:bg-purple-500/10',
      iconBorder: 'border-purple-200 dark:border-purple-500/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      borderHover: 'hover:border-purple-500/60',
      ctaColor: 'bg-purple-600 hover:bg-purple-500',
      badge: 'MOST POPULAR',
      desc: 'Supercharge your incident response with explainable AI threat scoring, full forensic audit trails, and SIEM-ready exports.',
      features: [
        'Unlimited parallel threat analysis',
        'Spatial Threat Radar visualization',
        'Full forensic PDF & JSON exports',
        'Persistent isolated history per analyst',
      ],
      cta: 'Open Command Center',
      route: '/dashboard',
    },
    {
      icon: <Building2 className="w-7 h-7" />,
      tag: 'FOR ENTERPRISES',
      title: 'Enterprise Cyber Intelligence',
      tagColor: 'text-emerald-600 dark:text-emerald-400',
      tagBg: 'bg-emerald-50 dark:bg-emerald-950/30',
      tagBorder: 'border-emerald-200 dark:border-emerald-500/30',
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
      iconBorder: 'border-emerald-200 dark:border-emerald-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      borderHover: 'hover:border-emerald-500/60',
      ctaColor: 'bg-emerald-600 hover:bg-emerald-500',
      desc: 'Scalable threat intelligence for large organizations — API access, team management, and custom SIEM integrations.',
      features: [
        'REST API with rate-limit customization',
        'Multi-user team dashboard & roles',
        'Slack / Teams / SIEM webhook alerts',
        'Dedicated account manager & SLA',
      ],
      cta: 'Contact Sales',
      route: '/about',
    },
  ];

  return (
    <section id="use-cases" className="space-y-10 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
          Who Uses ThreatLens
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
          Built for Every Level of Defender
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Whether you're protecting yourself, your team, or your enterprise — ThreatLens AI scales with your threat model.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {cases.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className={`relative p-6 rounded-3xl glass-panel ${c.borderHover} transition-all flex flex-col gap-5`}
          >
            {c.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-purple-600 text-white text-[10px] font-mono font-bold tracking-wider shadow-md">
                {c.badge}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-2xl border ${c.iconBg} ${c.iconBorder} ${c.iconColor}`}>
                {c.icon}
              </div>
              <span className={`text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full border ${c.tagColor} ${c.tagBg} ${c.tagBorder}`}>
                {c.tag}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 mb-2">
                {c.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {c.desc}
              </p>
            </div>

            <ul className="space-y-2 flex-1">
              {c.features.map((f, fi) => (
                <li key={fi} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCTA(c.route)}
              className={`w-full py-2.5 rounded-xl ${c.ctaColor} text-white font-mono text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer`}
            >
              <span>{c.cta}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// SECTION C: COMPETITOR COMPARISON TABLE
// ============================================================
function ComparisonTableSection() {
  const features: Array<{
    label: string;
    tl: boolean | 'partial';
    vt: boolean | 'partial';
    gsb: boolean | 'partial';
  }> = [
    { label: 'Real-time DNS Analysis', tl: true, vt: 'partial', gsb: false },
    { label: 'QR Code / Quishing Detection', tl: true, vt: false, gsb: false },
    { label: 'Screenshot AI Forensics', tl: true, vt: false, gsb: false },
    { label: 'Message / SMS Smishing', tl: true, vt: false, gsb: false },
    { label: 'Explainable Risk Scoring', tl: true, vt: false, gsb: false },
    { label: 'Chrome Extension Guard', tl: true, vt: false, gsb: false },
    { label: 'Persistent Audit History', tl: true, vt: false, gsb: false },
    { label: 'PDF Forensic Export', tl: true, vt: false, gsb: false },
    { label: 'Free Tier Available', tl: true, vt: true, gsb: true },
    { label: 'Zero-Trust Inspection Model', tl: true, vt: false, gsb: false },
  ];

  const Cell = ({ val }: { val: boolean | 'partial' }) => {
    if (val === true)
      return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-500"><Check className="w-3.5 h-3.5" /></span>;
    if (val === 'partial')
      return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/15 text-amber-500"><Minus className="w-3.5 h-3.5" /></span>;
    return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-500/10 text-rose-500"><X className="w-3.5 h-3.5" /></span>;
  };

  return (
    <section id="comparison" className="space-y-8 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
          Platform Comparison
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
          ThreatLens vs The Alternatives
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          See why ThreatLens AI covers attack surfaces that traditional scanners completely miss.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl"
      >
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="bg-slate-900 dark:bg-[#0A0E17] text-slate-100">
              <th className="text-left px-5 py-4 text-slate-400 font-semibold">Feature</th>
              <th className="px-5 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-300 font-bold">ThreatLens AI</span>
                  </div>
                  <span className="text-[10px] text-cyan-500 font-normal">This Platform</span>
                </div>
              </th>
              <th className="px-5 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-slate-300 font-bold">VirusTotal</span>
                  <span className="text-[10px] text-slate-500 font-normal">Google Subsidiary</span>
                </div>
              </th>
              <th className="px-5 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-slate-300 font-bold">Google Safe Browsing</span>
                  <span className="text-[10px] text-slate-500 font-normal">Browser API</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((f, i) => (
              <tr
                key={i}
                className={`border-t border-slate-200 dark:border-slate-800 transition-colors ${
                  i % 2 === 0
                    ? 'bg-white dark:bg-slate-900/40'
                    : 'bg-slate-50/60 dark:bg-slate-900/20'
                }`}
              >
                <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-medium">{f.label}</td>
                <td className="px-5 py-3.5 text-center bg-cyan-50/30 dark:bg-cyan-950/10">
                  <div className="flex justify-center"><Cell val={f.tl} /></div>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <div className="flex justify-center"><Cell val={f.vt} /></div>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <div className="flex justify-center"><Cell val={f.gsb} /></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500/20 inline-flex items-center justify-center"><Check className="w-2 h-2 text-emerald-500" /></span> Fully Supported</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500/20 inline-flex items-center justify-center"><Minus className="w-2 h-2 text-amber-500" /></span> Partial Support</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500/10 inline-flex items-center justify-center"><X className="w-2 h-2 text-rose-500" /></span> Not Supported</span>
      </div>
    </section>
  );
}

// ============================================================
// SECTION D: PRICING PLANS
// ============================================================
interface PricingSectionProps {
  onNavigate: (route: string) => void;
  user: any;
}

function PricingSection({ onNavigate, user }: PricingSectionProps) {
  const handleCTA = (route: string) => {
    if (user) onNavigate(route);
    else onNavigate(`/login?redirect=${encodeURIComponent(route)}`);
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      desc: 'Perfect for personal use and occasional threat checks.',
      color: 'border-slate-200 dark:border-slate-800',
      headerBg: 'bg-slate-50 dark:bg-slate-900/60',
      badge: null,
      ctaVariant: 'secondary' as const,
      features: [
        '1 free guest scan (no account)',
        'URL threat detection',
        'Basic risk score & summary',
        'Access to landing demo',
      ],
      notIncluded: [
        'Unlimited scans',
        'Message & QR scanning',
        'Forensic PDF export',
        'Audit history',
      ],
      cta: 'Try Free Scan',
      route: '/#simulator',
    },
    {
      name: 'Pro',
      price: '$9',
      period: '/month',
      desc: 'For security-conscious individuals and analysts.',
      color: 'border-cyan-500/60 dark:border-cyan-400/50',
      headerBg: 'bg-cyan-950/30',
      badge: 'MOST POPULAR',
      ctaVariant: 'primary' as const,
      features: [
        'Unlimited scans across all vectors',
        'URL, Message, QR & Screenshot analysis',
        'Full forensic PDF & JSON export',
        'Persistent audit history',
        'Chrome Extension Guard',
        'Spatial Threat Radar',
        'AI explainability reports',
        'Priority scan queue',
      ],
      notIncluded: [],
      cta: 'Get Pro Access',
      route: '/register',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      desc: 'Scalable threat intelligence for organizations and SOC teams.',
      color: 'border-purple-500/40 dark:border-purple-400/40',
      headerBg: 'bg-purple-950/20',
      badge: null,
      ctaVariant: 'purple' as const,
      features: [
        'Everything in Pro',
        'REST API access with custom rate limits',
        'Multi-user team dashboard',
        'SIEM / Webhook integrations',
        'Slack & Microsoft Teams alerts',
        'Dedicated account manager',
        'Custom SLA & uptime guarantee',
        'On-premise deployment option',
      ],
      notIncluded: [],
      cta: 'Contact Sales',
      route: '/about',
    },
  ];

  return (
    <section id="pricing" className="space-y-10 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
          Pricing
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
          Simple, Transparent Pricing
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          No hidden fees. No mystery black-boxes. Cancel anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-start">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`relative rounded-3xl border-2 overflow-hidden ${
              plan.ctaVariant === 'primary'
                ? 'shadow-2xl shadow-cyan-500/10 scale-[1.02]'
                : ''
            } ${plan.color} bg-white dark:bg-slate-900/80`}
          >
            {plan.badge && (
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-cyan-600 text-white text-[10px] font-mono font-bold">
                {plan.badge}
              </div>
            )}

            <div className={`px-6 pt-6 pb-5 ${plan.headerBg}`}>
              <div className="font-mono">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {plan.name}
                </span>
                <div className="flex items-end gap-1 mt-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                    {plan.price}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 pb-1">
                    {plan.period}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{plan.desc}</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <ul className="space-y-2">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
                {plan.notIncluded.map((f, fi) => (
                  <li key={`ni-${fi}`} className="flex items-start gap-2 text-xs text-slate-400 dark:text-slate-600">
                    <X className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCTA(plan.route)}
                className={`w-full py-3 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 ${
                  plan.ctaVariant === 'primary'
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20'
                    : plan.ctaVariant === 'purple'
                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{plan.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// SECTION E: TESTIMONIALS
// ============================================================
function TestimonialsSection() {
  const testimonials = [
    {
      quote: "ThreatLens caught a zero-day phishing kit targeting our employees' banking credentials before any traditional scanner flagged it. The Spatial Threat Radar is unlike anything I've seen in enterprise tools.",
      name: 'Marcus K.',
      role: 'Senior SOC Analyst, FinTech Corp',
      initials: 'MK',
      rating: 5,
      tag: 'Enterprise Security',
      color: 'bg-cyan-600',
    },
    {
      quote: "The explainable AI scoring is a game-changer. Instead of a mysterious number, I can see exactly which DNS records, SSL flags, and heuristic patterns triggered the alert. My team trusts the output.",
      name: 'Priya S.',
      role: 'Threat Intelligence Researcher',
      initials: 'PS',
      rating: 5,
      tag: 'Threat Research',
      color: 'bg-purple-600',
    },
    {
      quote: "We deployed ThreatLens for our entire 200-person IT team in under an hour. The Chrome Extension makes real-time URL inspection invisible to end-users while actively protecting them.",
      name: 'Daniel W.',
      role: 'IT Security Manager, Healthcare',
      initials: 'DW',
      rating: 5,
      tag: 'Enterprise IT',
      color: 'bg-emerald-600',
    },
  ];

  return (
    <section id="testimonials" className="space-y-10 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
          Trusted By Defenders
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
          What Security Professionals Say
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          From individual analysts to enterprise teams — real feedback from the field.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-3xl glass-panel flex flex-col gap-4"
          >
            <div className="flex gap-0.5">
              {Array.from({ length: t.rating }).map((_, si) => (
                <Star key={si} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
            </div>

            <blockquote className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex-1">
              &ldquo;{t.quote}&rdquo;
            </blockquote>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className={`w-9 h-9 rounded-full ${t.color} text-white font-mono font-bold text-xs flex items-center justify-center shrink-0`}>
                {t.initials}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">{t.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{t.role}</div>
              </div>
              <span className="ml-auto text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full shrink-0">
                {t.tag}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}


// ============================================================
// SECTION G: THREAT INTELLIGENCE BLOG FEED
// ============================================================
interface ThreatBlogSectionProps {
  onNavigate: (route: string) => void;
}

function ThreatBlogSection({ onNavigate }: ThreatBlogSectionProps) {
  const posts = [
    {
      tag: 'PHISHING ALERT',
      tagColor: 'text-rose-600 dark:text-rose-400',
      tagBg: 'bg-rose-50 dark:bg-rose-950/30',
      tagBorder: 'border-rose-200 dark:border-rose-500/30',
      time: '2 hours ago',
      title: 'New PayPal Credential Harvester Targets .xyz & .top Domains',
      excerpt:
        'A new phishing kit mimicking PayPal\'s login portal has been detected across 47 freshly-registered domains. The campaign uses punycode homoglyphs and valid Let\'s Encrypt TLS certificates to bypass basic scanners.',
      vector: 'URL Threat',
      readTime: '4 min read',
      riskLevel: 'CRITICAL',
      riskColor: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/30',
    },
    {
      tag: 'QR QUISHING',
      tagColor: 'text-amber-600 dark:text-amber-400',
      tagBg: 'bg-amber-50 dark:bg-amber-950/30',
      tagBorder: 'border-amber-200 dark:border-amber-500/30',
      time: '5 hours ago',
      title: 'QR Code Parking Meter Scam Returns Across European Cities',
      excerpt:
        'Fraudulent QR stickers placed over legitimate parking meters in London, Paris, and Amsterdam are redirecting victims to a payment portal that collects card details without processing the actual parking fee.',
      vector: 'QR Detection',
      readTime: '3 min read',
      riskLevel: 'HIGH',
      riskColor: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-500/30',
    },
    {
      tag: 'AI RESEARCH',
      tagColor: 'text-cyan-600 dark:text-cyan-400',
      tagBg: 'bg-cyan-50 dark:bg-cyan-950/30',
      tagBorder: 'border-cyan-200 dark:border-cyan-500/30',
      time: '1 day ago',
      title: 'Gemini AI Detects 94.7% of SMS Smishing Patterns in Blind Test',
      excerpt:
        'In a controlled evaluation against a dataset of 12,000 real-world SMS phishing messages, ThreatLens\' Gemini-powered neural heuristics achieved a 94.7% true positive rate with a false positive rate under 1.2%.',
      vector: 'Message Analysis',
      readTime: '6 min read',
      riskLevel: 'RESEARCH',
      riskColor: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-500/30',
    },
  ];

  return (
    <section id="blog" className="space-y-8 scroll-mt-24">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            Threat Intelligence Feed
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
            Latest Cyber Threat Reports
          </h2>
        </div>
        <button
          onClick={() => onNavigate('/history')}
          className="flex items-center gap-1.5 text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
        >
          <Rss className="w-3.5 h-3.5" />
          <span>View Scan History</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {posts.map((post, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group p-5 rounded-3xl glass-panel flex flex-col gap-3 hover:shadow-xl transition-all cursor-default"
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${post.tagColor} ${post.tagBg} ${post.tagBorder}`}>
                {post.tag}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{post.time}</span>
            </div>

            <h3 className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
              {post.title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${post.riskColor}`}>
                  {post.riskLevel}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{post.readTime}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {post.vector}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// SECTION H: FAQ ACCORDION
// ============================================================
function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Is ThreatLens AI free to use?',
      a: 'Yes! You can perform 1 free guest scan without creating an account. For unlimited scans across all attack vectors (URL, Message, QR, Screenshot), persistent audit history, and full forensic PDF exports, upgrade to Pro starting at $9/month.',
    },
    {
      q: 'How accurate is the threat detection?',
      a: 'ThreatLens achieves a 99.4% detection accuracy in controlled benchmarks, combining real-time DNS resolution, TLS/SSL cryptographic verification, behavioral heuristics, and Gemini AI neural pattern analysis. Each result includes a full explainability breakdown so you can verify the reasoning yourself.',
    },
    {
      q: 'Does ThreatLens store or sell my data?',
      a: 'Absolutely not. ThreatLens AI is built on a zero-trust, privacy-first architecture. Your scanned URLs, messages, and images are used only for the threat analysis at the time of inspection. We never store personal content, sell data to third parties, or harvest credentials. See our Privacy Policy for full details.',
    },
    {
      q: 'What is the Chrome Extension and how does it work?',
      a: 'The ThreatLens Chrome Extension (Manifest V3) adds a side panel to your browser that provides real-time URL inspection for every page you visit, right-click link scanning, and cross-device scan history sync. It uses zero remote JavaScript and strict Content Security Policy compliance for maximum security.',
    },
    {
      q: 'How does the 0–100 risk score work?',
      a: 'The risk score is calculated from weighted sub-scores across four dimensions: Domain Risk (TLD reputation, homoglyphs, registration age), URL Structure Risk (redirects, encoded payloads, obfuscation), SSL/TLS Risk (certificate validity, encryption strength), and AI/Pattern Risk (Gemini heuristic confidence on behavioral patterns). Every point is documented and shown in the forensic report.',
    },
    {
      q: 'Can I integrate ThreatLens into my business or SIEM?',
      a: 'Yes — our Enterprise plan includes full REST API access with custom rate limits, SIEM webhook integrations, Slack and Microsoft Teams alerts, and multi-user team dashboards. Contact our team via the About page to discuss your requirements and pricing.',
    },
  ];

  return (
    <section id="faq" className="space-y-8 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
          FAQ
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Everything you need to know about ThreatLens AI.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden glass-card"
          >
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left group cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-cyan-500 shrink-0" />
                <span className="text-sm font-semibold font-mono text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  {faq.q}
                </span>
              </span>
              <span className="shrink-0 ml-4">
                {openIdx === i
                  ? <ChevronUp className="w-4 h-4 text-cyan-500" />
                  : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </span>
            </button>

            {openIdx === i && (
              <div className="px-5 pb-5 pt-0">
                <div className="pl-7 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-l-2 border-cyan-500/30">
                  {faq.a}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default LandingPage;
