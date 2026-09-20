import React, { useState } from 'react';
import { Camera, Upload, ArrowRight, RefreshCw, FileText, Image as ImageIcon, ShieldCheck, Copy, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import type { SecurityAnalysisResult } from '../types';
import { RiskScoreGauge } from '../components/RiskScoreGauge';
import { ScannerAnimation } from '../components/ScannerAnimation';
import { ExplainableAiCard } from '../components/ExplainableAiCard';
import { ThreatIndicatorsList } from '../components/ThreatIndicatorsList';
import { TechnicalSignalsTable } from '../components/TechnicalSignalsTable';
import { ThreatRadar } from '../components/ThreatRadar';
import { ScreenshotForensicView } from '../components/ScreenshotForensicView';
import { useToast } from '../context/ToastContext';

// Safe SVG Data URI generator handling UTF-8 and Unicode characters without btoa exceptions
function toSvgDataUri(svg: string): string {
  try {
    const bytes = new TextEncoder().encode(svg);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return `data:image/svg+xml;base64,${btoa(binary)}`;
  } catch {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}

// High-fidelity SVG generators for realistic test scenarios
function createGoogleNewTabSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="440" viewBox="0 0 700 440">
    <rect width="700" height="440" fill="#1F2937"/>
    <!-- Browser Top Bar -->
    <rect width="700" height="42" fill="#111827"/>
    <circle cx="24" cy="21" r="5" fill="#EF4444"/>
    <circle cx="40" cy="21" r="5" fill="#F59E0B"/>
    <circle cx="56" cy="21" r="5" fill="#10B981"/>
    <!-- Tab -->
    <path d="M 80,42 L 95,12 L 230,12 L 245,42 Z" fill="#1F2937"/>
    <text x="120" y="30" fill="#9CA3AF" font-family="system-ui, sans-serif" font-size="12">New Tab</text>
    <!-- URL Bar -->
    <rect x="80" y="52" width="540" height="30" rx="15" fill="#374151"/>
    <text x="105" y="72" fill="#9CA3AF" font-family="monospace" font-size="12">chrome://newtab</text>
    <!-- Google Center Logo -->
    <text x="350" y="195" fill="#F3F4F6" font-family="system-ui, sans-serif" font-size="52" font-weight="700" text-anchor="middle" letter-spacing="-1">Google</text>
    <!-- Search Box -->
    <rect x="150" y="225" width="400" height="46" rx="23" fill="#374151" stroke="#4B5563" stroke-width="1"/>
    <text x="180" y="253" fill="#9CA3AF" font-family="system-ui, sans-serif" font-size="14">Search Google or type a URL</text>
    <!-- Shortcuts -->
    <circle cx="260" cy="330" r="22" fill="#374151"/>
    <text x="260" y="365" fill="#D1D5DB" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">YouTube</text>
    <circle cx="350" cy="330" r="22" fill="#374151"/>
    <text x="350" y="365" fill="#D1D5DB" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">Gmail</text>
    <circle cx="440" cy="330" r="22" fill="#374151"/>
    <text x="440" y="365" fill="#D1D5DB" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">Drive</text>
  </svg>`;
  return toSvgDataUri(svg);
}

function createWellsFargoPhishSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="440" viewBox="0 0 700 440">
    <rect width="700" height="440" fill="#0F172A"/>
    <!-- Banner Header -->
    <rect width="700" height="65" fill="#DC2626"/>
    <text x="40" y="42" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="24" font-weight="800" letter-spacing="1">WELLS FARGO</text>
    <text x="660" y="40" fill="#FEE2E2" font-family="system-ui, sans-serif" font-size="12" text-anchor="end">Security Notification</text>
    <!-- Phishing Warning & Form Container -->
    <rect x="100" y="95" width="500" height="310" rx="10" fill="#1E293B" stroke="#EF4444" stroke-width="1.5"/>
    <text x="350" y="135" fill="#EF4444" font-family="system-ui, sans-serif" font-size="18" font-weight="700" text-anchor="middle">URGENT: Online Banking Access Suspended</text>
    <text x="350" y="165" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">Verify your credentials immediately to avoid permanent account deactivation.</text>
    <!-- Inputs -->
    <text x="140" y="205" fill="#E2E8F0" font-family="system-ui, sans-serif" font-size="12" font-weight="600">Username / Online ID</text>
    <rect x="140" y="215" width="420" height="36" rx="6" fill="#0F172A" stroke="#475569" stroke-width="1"/>
    <text x="140" y="275" fill="#E2E8F0" font-family="system-ui, sans-serif" font-size="12" font-weight="600">Password / PIN</text>
    <rect x="140" y="285" width="420" height="36" rx="6" fill="#0F172A" stroke="#475569" stroke-width="1"/>
    <!-- Submit Button -->
    <rect x="140" y="340" width="420" height="42" rx="6" fill="#DC2626"/>
    <text x="350" y="366" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="14" font-weight="700" text-anchor="middle">Verify &amp; Restore Access</text>
  </svg>`;
  return toSvgDataUri(svg);
}

function createWindowsDefenderScamSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="440" viewBox="0 0 700 440">
    <rect width="700" height="440" fill="#004792"/>
    <!-- Centered Scam Modal -->
    <rect x="80" y="60" width="540" height="320" rx="10" fill="#0F172A" stroke="#F59E0B" stroke-width="2"/>
    <rect x="80" y="60" width="540" height="48" rx="10" fill="#B91C1C"/>
    <text x="350" y="92" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="16" font-weight="800" text-anchor="middle">[!] WINDOWS DEFENDER: CRITICAL ALERT</text>
    <text x="350" y="150" fill="#EF4444" font-family="monospace" font-size="20" font-weight="700" text-anchor="middle">THREAT: ZEUS TROJAN DETECTED</text>
    <text x="350" y="185" fill="#E2E8F0" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle">Your personal data, credit cards, and browser passwords are at risk.</text>
    <text x="350" y="210" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">Do NOT shut down or restart your computer. System integrity compromised.</text>
    <rect x="140" y="240" width="420" height="54" rx="8" fill="#1E293B" stroke="#F59E0B" stroke-width="1.5"/>
    <text x="350" y="265" fill="#F59E0B" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">Call Microsoft Certified Security Helpdesk Immediately:</text>
    <text x="350" y="285" fill="#FFFFFF" font-family="monospace" font-size="16" font-weight="800" text-anchor="middle">TEL: 1-800-456-7890 (Toll-Free)</text>
    <rect x="250" y="315" width="200" height="38" rx="6" fill="#DC2626"/>
    <text x="350" y="339" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="13" font-weight="700" text-anchor="middle">Connect With Technician</text>
  </svg>`;
  return toSvgDataUri(svg);
}

function createCloudPortalSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="440" viewBox="0 0 700 440">
    <rect width="700" height="440" fill="#0B0F19"/>
    <!-- Header -->
    <rect width="700" height="54" fill="#131B2E"/>
    <text x="35" y="34" fill="#38BDF8" font-family="system-ui, sans-serif" font-size="18" font-weight="700">CloudSphere Portal</text>
    <text x="660" y="34" fill="#10B981" font-family="monospace" font-size="12" text-anchor="end">[OK] All Systems Operational</text>
    <!-- Content Cards -->
    <rect x="35" y="80" width="200" height="100" rx="8" fill="#1E293B"/>
    <text x="50" y="110" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="12">API Latency</text>
    <text x="50" y="145" fill="#FFFFFF" font-family="monospace" font-size="24" font-weight="700">24 ms</text>
    <rect x="250" y="80" width="200" height="100" rx="8" fill="#1E293B"/>
    <text x="265" y="110" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="12">Service Uptime</text>
    <text x="265" y="145" fill="#10B981" font-family="monospace" font-size="24" font-weight="700">99.99%</text>
    <rect x="465" y="80" width="200" height="100" rx="8" fill="#1E293B"/>
    <text x="480" y="110" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="12">Security Incidents</text>
    <text x="480" y="145" fill="#38BDF8" font-family="monospace" font-size="24" font-weight="700">0 Active</text>
    <!-- Main Activity Section -->
    <rect x="35" y="200" width="630" height="200" rx="10" fill="#131B2E"/>
    <text x="55" y="235" fill="#E2E8F0" font-family="system-ui, sans-serif" font-size="14" font-weight="600">Enterprise Workload Clusters</text>
    <rect x="55" y="255" width="590" height="35" rx="6" fill="#1E293B"/>
    <text x="75" y="277" fill="#94A3B8" font-family="monospace" font-size="12">cluster-us-east-prod-1</text>
    <text x="620" y="277" fill="#10B981" font-family="monospace" font-size="12" text-anchor="end">Healthy</text>
    <rect x="55" y="300" width="590" height="35" rx="6" fill="#1E293B"/>
    <text x="75" y="322" fill="#94A3B8" font-family="monospace" font-size="12">cluster-eu-west-prod-2</text>
    <text x="620" y="322" fill="#10B981" font-family="monospace" font-size="12" text-anchor="end">Healthy</text>
  </svg>`;
  return toSvgDataUri(svg);
}

interface ScreenshotScannerPageProps {
  onNavigate: (route: string) => void;
}

export const ScreenshotScannerPage: React.FC<ScreenshotScannerPageProps> = ({ onNavigate }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('google-chrome-newtab.png');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [result, setResult] = useState<SecurityAnalysisResult | null>(null);
  const { showToast } = useToast();

  const sampleScreenshots = [
    {
      label: 'Google Chrome New Tab (Safe)',
      name: 'google-chrome-newtab.png',
      badge: 'SAFE',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      data: createGoogleNewTabSvg(),
    },
    {
      label: 'Enterprise SaaS Portal (Safe)',
      name: 'authentic-cloud-portal.png',
      badge: 'SAFE',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      data: createCloudPortalSvg(),
    },
    {
      label: 'Wells Fargo Fake Login (Phish)',
      name: 'wellsfargo-phish-portal.png',
      badge: 'PHISHING',
      badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
      data: createWellsFargoPhishSvg(),
    },
    {
      label: 'Windows Defender Fake Alert (Scam)',
      name: 'windows-trojan-alert.png',
      badge: 'SCAREWARE',
      badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
      data: createWindowsDefenderScamSvg(),
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please upload a valid image file (PNG, JPG, WebP)', 'error');
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async (imgData = imagePreview, name = fileName) => {
    if (!imgData) {
      showToast('Please select or upload a screenshot first', 'warning');
      return;
    }

    setIsScanning(true);
    setResult(null);

    try {
      const data = await api.scanScreenshot(imgData, name);
      setResult(data);
      showToast(
        `Forensic vision scan complete: ${data.riskLevel} Risk (${data.threatType})`,
        data.riskLevel === 'SAFE' ? 'success' : 'warning'
      );
    } catch (err: any) {
      showToast(err.message || 'Analysis failed', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const copyResultUrl = () => {
    if (result) {
      navigator.clipboard.writeText(`${window.location.origin}/report/${result.id}`);
      showToast('Threat report link copied', 'success');
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto py-6 px-4 md:px-6 select-none">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
          <Camera className="w-4 h-4" />
          <span>Multimodal Forensic Vision Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
          Screenshot Analyzer &amp; Visual Forensics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
          Evidence-based visual inspection. Analyzes UI hierarchy, brand spoofing, credential harvesting fields, and coercive scareware popups — with strict false-positive prevention and transparent limitations disclosure.
        </p>
      </div>

      {/* Upload & Pre-Loaded Forensic Test Scenarios */}
      <div className="p-6 rounded-2xl glass-panel space-y-6">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          {/* Drag & Drop Area */}
          <label className="flex-1 min-h-[190px] border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer glass-card hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all text-center">
            <Upload className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Click to upload webpage or application screenshot
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                PNG, JPG, WebP up to 10MB supported
              </span>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {/* Quick Real Test Cases */}
          <div className="w-full lg:w-96 space-y-2 flex flex-col justify-between">
            <div className="text-xs font-mono text-slate-600 dark:text-slate-400 uppercase font-semibold flex items-center justify-between">
              <span>Pre-Loaded Test Scenarios:</span>
              <span className="text-[10px] text-slate-400 font-normal">Safe vs Malicious</span>
            </div>

            <div className="space-y-2">
              {sampleScreenshots.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setImagePreview(sample.data);
                    setFileName(sample.name);
                    setResult(null);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-purple-500 text-left text-xs font-mono text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-between gap-2"
                >
                  <span className="truncate">{sample.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border shrink-0 ${sample.badgeClass}`}>
                    {sample.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Image Preview & Scan Action */}
        {imagePreview && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate font-semibold">
                  Artifact: {fileName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleScan()}
                disabled={isScanning}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-60"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Vision Forensics...</span>
                  </>
                ) : (
                  <>
                    <span>Inspect Screenshot</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            <div className="max-h-72 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center p-2">
              <img
                src={imagePreview}
                alt="Target screenshot upload preview"
                className="max-h-64 w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* Loading state animation */}
      {isScanning && <ScannerAnimation scanType="screenshot" target={fileName} />}

      {/* Results View */}
      {result && !isScanning && (
        <div className="flex flex-col gap-6">
          {/* Top Verdict Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl glass-card">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300">
              {result.riskLevel === 'SAFE' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              )}
              <span>
                Analysis complete. Status: <strong className="font-mono text-purple-700 dark:text-purple-300">{result.riskLevel}</strong> ({result.threatType})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyResultUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span className="hidden sm:inline">Copy Link</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate(`/report/${result.id}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold transition-all shadow-xs"
              >
                <FileText className="w-3 h-3" />
                <span>Executive Report ↗</span>
              </button>
            </div>
          </div>

          {/* Primary Gauge & Radar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8">
              <RiskScoreGauge
                score={result.riskScore}
                level={result.riskLevel}
                threatType={result.threatType}
                confidence={result.confidence}
              />
            </div>
            <div className="md:col-span-4 p-6 rounded-2xl glass-panel flex flex-col items-center justify-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">
                Vision Threat Radar
              </span>
              <ThreatRadar
                score={result.riskScore}
                threatType={result.threatType}
                scanResult={result}
                scanType="screenshot"
                size="md"
              />
            </div>
          </div>

          {/* Deep Screenshot Forensics View */}
          <ScreenshotForensicView
            result={result}
            imageSrc={imagePreview}
            fileName={fileName}
          />

          {/* Explainable AI Reasoning Card */}
          <ExplainableAiCard
            summary={result.summary}
            whyDangerous={result.explanation.whyDangerous}
            threatMechanics={result.explanation.threatMechanics}
            recommendations={result.recommendations}
            riskBreakdown={result.riskBreakdown}
            aiModelUsed={result.metadata.aiModelUsed}
            isAiFallback={result.metadata.isAiFallback}
          />

          {/* Technical Signals & Indicators */}
          <ThreatIndicatorsList indicators={result.indicators} />
          <TechnicalSignalsTable signals={result.technicalSignals} />
        </div>
      )}
    </div>
  );
};

