import React, { useState, useRef } from 'react';
import {
  Globe,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  FileText,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Fingerprint,
  RotateCcw,
  Lock,
  Unlock,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api';
import type { SecurityAnalysisResult } from '../types';
import { RiskScoreGauge } from '../components/RiskScoreGauge';
import { ScannerAnimation } from '../components/ScannerAnimation';
import { ExplainableAiCard } from '../components/ExplainableAiCard';
import { ThreatIndicatorsList } from '../components/ThreatIndicatorsList';
import { TechnicalSignalsTable } from '../components/TechnicalSignalsTable';
import { ThreatRadar } from '../components/ThreatRadar';
import { useToast } from '../context/ToastContext';

interface UrlScannerPageProps {
  initialUrl?: string;
  onNavigate: (route: string) => void;
}

export const UrlScannerPage: React.FC<UrlScannerPageProps> = ({ initialUrl, onNavigate }) => {
  const [url, setUrl] = useState<string>(
    initialUrl || 'http://secure-wellsfargo-update.login-verify.top/auth/signin'
  );
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [result, setResult] = useState<SecurityAnalysisResult | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedTarget, setCopiedTarget] = useState<boolean>(false);
  const [isUrlExpanded, setIsUrlExpanded] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const sampleTargets = [
    { label: 'Wells Fargo Phish (.top)', url: 'http://secure-wellsfargo-update.login-verify.top/auth/signin' },
    { label: 'Safe: google.com', url: 'https://google.com' },
    { label: 'Safe: github.com', url: 'https://github.com' },
    { label: 'Suspicious IP Host', url: 'http://192.168.1.105:8080/secure-update/login.php' },
  ];

  React.useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
      handleScan(initialUrl);
    }
  }, [initialUrl]);

  const handleScan = async (targetUrl = url) => {
    if (!targetUrl.trim()) {
      showToast('Please enter a target URL to analyze', 'warning');
      return;
    }

    setIsScanning(true);
    setResult(null);
    setIsUrlExpanded(false);

    try {
      const data = await api.scanUrl(targetUrl);
      setResult(data);
      const isSafe = data.riskLevel === 'SAFE';
      showToast(
        `Scan complete: ${data.riskLevel} Risk detected (${data.riskScore}/100)`,
        isSafe ? 'success' : 'warning'
      );
    } catch (err: any) {
      showToast(err.message || 'Scan failed', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const copyResultReportUrl = () => {
    if (result) {
      navigator.clipboard.writeText(`${window.location.origin}/report/${result.id}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
      showToast('Threat report URL copied to clipboard', 'success');
    }
  };

  const copyTargetUrl = () => {
    if (result) {
      navigator.clipboard.writeText(result.target);
      setCopiedTarget(true);
      setTimeout(() => setCopiedTarget(false), 2200);
      showToast('Target URL copied to clipboard', 'info');
    }
  };

  const handleScanAgain = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 250);
  };

  // Helper to extract clean domain from target
  const getDomainFromTarget = (targetStr: string) => {
    try {
      const u = new URL(targetStr);
      return u.hostname;
    } catch {
      return targetStr;
    }
  };

  // Helper to check protocol
  const isHttpsTarget = (targetStr: string) => {
    return targetStr.toLowerCase().startsWith('https://');
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto py-6 px-4 md:px-6 select-none">
      {/* 1. Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1">
          <Globe className="w-4 h-4" />
          <span>Automated Threat Intelligence & Domain Investigation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
          URL & Website Scanner
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Deep structural analysis inspecting malicious hosts, credential harvest traps, DNS telemetry, homoglyphs, and threat feeds.
        </p>
      </div>

      {/* 2. Scanner Input Form Card */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan();
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="url-scan-input"
              ref={inputRef}
              type="text"
              placeholder="e.g. http://login-secure-verify.top/signin or https://amazon.in"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-10 pr-4 py-3 glass-input focus:border-cyan-500 rounded-xl text-xs sm:text-sm font-mono placeholder:text-slate-400 focus:outline-none transition-colors"
            />
          </div>

          <button
            id="url-scan-submit-btn"
            type="submit"
            disabled={isScanning}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-mono text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-60 cursor-pointer"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Inspecting Telemetry...</span>
              </>
            ) : (
              <>
                <span>Analyze Target</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mr-1">
            Test Vectors:
          </span>
          {sampleTargets.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUrl(item.url);
                handleScan(item.url);
              }}
              className="px-2.5 py-1 rounded-lg glass-pill text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state animation */}
      {isScanning && <ScannerAnimation scanType="url" target={url} />}

      {/* Results View */}
      {result && !isScanning && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* 3. Comprehensive Target Header & Investigation Actions */}
          <div className="p-5 rounded-2xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800">
            {/* Top row: Target URL, Domain badge, Protocol, & Expand trigger */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3.5">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    TARGET ASSET
                  </span>
                  {/* Protocol Badge */}
                  {isHttpsTarget(result.target) ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                      <Lock className="w-2.5 h-2.5" /> HTTPS
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
                      <Unlock className="w-2.5 h-2.5" /> HTTP (Plaintext)
                    </span>
                  )}
                  {/* Domain Apex Badge */}
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    Domain: {getDomainFromTarget(result.target)}
                  </span>
                </div>

                {/* Target URL string with copy and expand toggle */}
                <div className="flex items-center gap-2">
                  <div
                    className={`font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 ${
                      isUrlExpanded ? 'break-all whitespace-normal' : 'truncate max-w-xl md:max-w-2xl'
                    }`}
                  >
                    {result.target}
                  </div>

                  <button
                    type="button"
                    onClick={copyTargetUrl}
                    title="Copy exact target URL"
                    className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors shrink-0"
                  >
                    {copiedTarget ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {result.target.length > 55 && (
                    <button
                      type="button"
                      onClick={() => setIsUrlExpanded(!isUrlExpanded)}
                      className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5 shrink-0"
                    >
                      {isUrlExpanded ? (
                        <>
                          <span>Collapse</span>
                          <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          <span>Expand</span>
                          <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Status & Reference ID */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono shrink-0">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300">
                  <Fingerprint className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-[11px] text-slate-500">ID:</span>
                  <span className="font-bold">{result.id}</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(result.metadata.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom row: Primary Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Forensic scan completed in <strong className="text-slate-900 dark:text-slate-100">{result.metadata.analysisDurationMs}ms</strong></span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Analyze Another Target */}
                <button
                  type="button"
                  onClick={handleScanAgain}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 transition-colors font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Scan Again</span>
                </button>

                {/* Copy Link */}
                <button
                  type="button"
                  onClick={copyResultReportUrl}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 transition-colors font-medium cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied ✓</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                {/* Full Executive Report */}
                <button
                  type="button"
                  onClick={() => onNavigate(`/report/${result.id}`)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Full Executive Report ↗</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. Primary Security Verdict & ThreatLens Intelligence Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Verdict & Score (Columns: 7 on desktop) */}
            <div className="lg:col-span-7">
              <RiskScoreGauge
                score={result.riskScore}
                level={result.riskLevel}
                threatType={result.threatType}
                confidence={result.confidence}
              />
            </div>

            {/* ThreatLens Intelligence Radar (Columns: 5 on desktop) */}
            <div className="lg:col-span-5 p-6 rounded-2xl glass-panel flex flex-col items-center justify-between min-h-[340px]">
              <div className="w-full flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
                  THREATLENS INTELLIGENCE RADAR
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  REAL TELEMETRY
                </span>
              </div>

              <ThreatRadar
                score={result.riskScore}
                threatType={result.threatType}
                scanResult={result}
                size="md"
              />

              <div className="w-full text-center text-[10px] font-mono text-slate-400 mt-2">
                Hover over nodes to inspect DNS, TLS, Domain, & Threat Intel telemetry
              </div>
            </div>
          </div>

          {/* 5. Explainable AI Analysis & Dynamic Findings */}
          <ExplainableAiCard
            summary={result.summary}
            whyDangerous={result.explanation.whyDangerous}
            threatMechanics={result.explanation.threatMechanics}
            recommendations={result.recommendations}
            riskBreakdown={result.riskBreakdown}
            aiModelUsed={result.metadata.aiModelUsed}
            isAiFallback={result.metadata.isAiFallback}
            riskLevel={result.riskLevel}
          />

          {/* 6. Documented Evidence Findings (Accordion) */}
          <ThreatIndicatorsList indicators={result.indicators} />

          {/* 7. Technical Forensics Telemetry (Desktop Table + Mobile Cards) */}
          <TechnicalSignalsTable signals={result.technicalSignals} />
        </div>
      )}
    </div>
  );
};

export default UrlScannerPage;
