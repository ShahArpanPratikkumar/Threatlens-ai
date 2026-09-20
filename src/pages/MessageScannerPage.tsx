import React, { useState, useRef, useMemo } from 'react';
import {
  MessageSquareWarning,
  ArrowRight,
  RefreshCw,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Fingerprint,
  RotateCcw,
  Link2,
  Trash2,
  ClipboardPaste,
  ChevronDown,
  ChevronUp,
  Shield,
  ExternalLink,
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

interface MessageScannerPageProps {
  initialMessage?: string;
  onNavigate: (route: string) => void;
}

export const MessageScannerPage: React.FC<MessageScannerPageProps> = ({ initialMessage, onNavigate }) => {
  const [message, setMessage] = useState<string>(
    initialMessage ||
      'URGENT: Your Wells Fargo checking account is suspended due to unusual activity. Click immediately within 15 mins to restore access: http://wellsfargo-restore.top/verify'
  );
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [result, setResult] = useState<SecurityAnalysisResult | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedTarget, setCopiedTarget] = useState<boolean>(false);
  const [isMessageExpanded, setIsMessageExpanded] = useState<boolean>(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { showToast } = useToast();

  const sampleMessages = [
    {
      label: 'Bank Account Alert (.top)',
      text: 'URGENT: Your Wells Fargo checking account is suspended due to unusual activity. Click immediately within 15 mins to restore access: http://wellsfargo-restore.top/verify',
      type: 'Phishing',
    },
    {
      label: 'Remote Job Advance-Fee',
      text: 'Congratulations! You won selection for a Global Remote Reviewer job paying ₹50,000 per day. Deposit initial ₹1,500 security fee on UPI: payment-verify@fastpay to activate your portal.',
      type: 'Advance-Fee',
    },
    {
      label: 'Crypto 400% Scheme',
      text: 'Exclusive VIP Trading Signal: Guaranteed 400% profit within 24 hours. Send minimum 0.5 ETH to official smart contract: 0x71C... and receive double payout instantly! Offer ends today.',
      type: 'Crypto Scam',
    },
    {
      label: 'Package Redelivery Fee',
      text: 'USPS Delivery Alert: Package #US94001 cannot be delivered due to missing house number and unpaid $2.85 re-delivery fee. Update your address within 12 hours: http://usps-redelivery-fee.click/tracking',
      type: 'Impersonation',
    },
    {
      label: '2FA / OTP Theft Alert',
      text: 'ALERT: Unauthorized login attempt on your PayPal account from Moscow, Russia. If this was NOT you, reply with your 6-digit OTP verification code immediately to freeze account access.',
      type: 'Credential Harvest',
    },
    {
      label: 'Safe: Dental Appointment',
      text: 'Your dental appointment with Dr. Smith is confirmed for Thursday, Oct 12 at 2:30 PM. Reply 1 to confirm or 2 to reschedule.',
      type: 'Legitimate',
    },
  ];

  React.useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
      handleScan(initialMessage);
    }
  }, [initialMessage]);

  const handleScan = async (textToScan = message) => {
    if (!textToScan.trim()) {
      showToast('Please paste a message or email text to analyze', 'warning');
      return;
    }

    setIsScanning(true);
    setResult(null);
    setIsMessageExpanded(false);

    try {
      const data = await api.scanMessage(textToScan);
      setResult(data);
      const isSafe = data.riskLevel === 'SAFE';
      showToast(
        `Analysis complete: ${data.riskLevel} Risk detected (${data.riskScore}/100)`,
        isSafe ? 'success' : 'warning'
      );
    } catch (err: any) {
      showToast(err.message || 'Analysis failed', 'error');
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

  const copyTargetText = () => {
    if (result) {
      navigator.clipboard.writeText(result.target);
      setCopiedTarget(true);
      setTimeout(() => setCopiedTarget(false), 2200);
      showToast('Message text copied to clipboard', 'info');
    }
  };

  const handleScanAgain = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 250);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setMessage(text);
        showToast('Pasted from clipboard', 'info');
      }
    } catch {
      showToast('Clipboard access unavailable — paste directly into text box', 'warning');
    }
  };

  const handleClear = () => {
    setMessage('');
    inputRef.current?.focus();
  };

  // Extract embedded URLs in the active result target
  const extractedUrls = useMemo(() => {
    if (!result?.target) return [];
    const regex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:top|xyz|click|work|fit|com|info|org|net|me|in|co|cc)\/[^\s]*)/gi;
    return Array.from(new Set(result.target.match(regex) || []));
  }, [result?.target]);

  const activeCharCount = message.length;
  const activeWordCount = message.trim() ? message.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto py-6 px-4 md:px-6 select-none">
      {/* 1. Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
          <MessageSquareWarning className="w-4 h-4" />
          <span>NLP Cognitive Heuristics & Social Engineering Intelligence</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
            Message & Scam Scanner
          </h1>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span>Zero Data Retention • Ephemeral Audit</span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Deep structural NLP inspection detecting urgency coercion, authority impersonation, financial advance-fee lures, OTP theft, and suspicious embedded payloads.
        </p>
      </div>

      {/* 2. Scanner Input Form Card */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="message-scan-input"
              className="text-xs font-mono text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-2"
            >
              <span>Message Payload</span>
              <span className="text-[10px] text-slate-400 normal-case font-normal">
                (SMS, WhatsApp forward, email body, Telegram, or Discord text)
              </span>
            </label>

            {/* Quick Actions & Live Stats */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-[11px]">
                {activeWordCount} words · {activeCharCount} chars
              </span>
              <button
                type="button"
                onClick={handlePaste}
                className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Paste from clipboard"
              >
                <ClipboardPaste className="w-3 h-3" />
                <span>Paste</span>
              </button>
              {message && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Clear text"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <textarea
              id="message-scan-input"
              ref={inputRef}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste raw message or email body to evaluate social engineering markers..."
              className="w-full p-4 glass-input focus:border-amber-500 rounded-xl text-xs sm:text-sm font-mono placeholder:text-slate-400 focus:outline-none transition-colors resize-y leading-relaxed"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          {/* Quick sample chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mr-1">
              Vectors:
            </span>
            {sampleMessages.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setMessage(item.text);
                  handleScan(item.text);
                }}
                className="px-2.5 py-1 rounded-lg glass-pill text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300 transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            id="message-scan-submit-btn"
            type="button"
            onClick={() => handleScan()}
            disabled={isScanning}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold font-mono text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-60 cursor-pointer"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Auditing Tokens...</span>
              </>
            ) : (
              <>
                <span>Analyze Message</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading state animation */}
      {isScanning && <ScannerAnimation scanType="message" target="NLP Semantic Payload Vector" />}

      {/* Results View */}
      {result && !isScanning && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* 3. Comprehensive Target Header & Message Telemetry Card */}
          <div className="p-5 rounded-2xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800">
            {/* Top row: Target Message snippet, Payload length, Link status, & ID */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3.5">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    TARGET PAYLOAD
                  </span>

                  {/* Embedded Links Badge */}
                  {extractedUrls.length > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                      <Link2 className="w-2.5 h-2.5" /> {extractedUrls.length} Embedded Link{extractedUrls.length > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                      <ShieldCheck className="w-2.5 h-2.5" /> Plaintext (Zero Links)
                    </span>
                  )}

                  {/* Payload stats */}
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    {result.target.length} Chars · {result.target.split(/\s+/).filter(Boolean).length} Words
                  </span>
                </div>

                {/* Target Message text container with copy & expand toggle */}
                <div className="flex items-start gap-2 pt-1">
                  <div
                    className={`font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 bg-slate-50/80 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 flex-1 leading-relaxed ${
                      isMessageExpanded ? 'whitespace-pre-wrap break-words' : 'line-clamp-2'
                    }`}
                  >
                    {result.target}
                  </div>

                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={copyTargetText}
                      title="Copy full message text"
                      className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      {copiedTarget ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {result.target.length > 120 && (
                      <button
                        type="button"
                        onClick={() => setIsMessageExpanded(!isMessageExpanded)}
                        title={isMessageExpanded ? 'Collapse' : 'Expand full text'}
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400 transition-colors"
                      >
                        {isMessageExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Extracted URL chips if present */}
                {extractedUrls.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Extracted Targets:</span>
                    {extractedUrls.map((u, i) => (
                      <div
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span className="max-w-[200px] truncate">{u}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status & Reference ID */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono shrink-0 self-start lg:self-center">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300">
                  <Fingerprint className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
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
                <span>
                  Linguistic forensics completed in{' '}
                  <strong className="text-slate-900 dark:text-slate-100">
                    {result.metadata.analysisDurationMs}ms
                  </strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Analyze Another Message */}
                <button
                  type="button"
                  onClick={handleScanAgain}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 transition-colors font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Scan Another</span>
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
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition-all shadow-xs cursor-pointer"
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
                  THREATLENS COGNITIVE RADAR
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  NLP VECTORS
                </span>
              </div>

              <ThreatRadar
                score={result.riskScore}
                threatType={result.threatType}
                scanResult={result}
                scanType="message"
                size="md"
              />

              <div className="w-full text-center text-[10px] font-mono text-slate-400 mt-2">
                Hover over nodes to inspect Urgency, Identity, Financial, and Action Link telemetry
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

export default MessageScannerPage;

