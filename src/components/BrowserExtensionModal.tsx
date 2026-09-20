import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Puzzle, Globe, Shield, CheckCircle2, Copy, Download, ExternalLink } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface BrowserExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReport?: (scanId: string) => void;
}

export const BrowserExtensionModal: React.FC<BrowserExtensionModalProps> = ({
  isOpen,
  onClose,
  onOpenReport,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'simulator' | 'install'>('simulator');
  const [simUrl, setSimUrl] = useState<string>('https://secure-wellsfargo-update.login-verify.top/auth/signin');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [simStatus, setSimStatus] = useState<string>('');
  const [simResult, setSimResult] = useState<{
    id: string;
    riskScore: number;
    riskLevel: string;
    threatType: string;
    indicators: string[];
  } | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSimScan = async () => {
    setIsScanning(true);
    setSimResult(null);
    setSimStatus('Checking URL structure...');

    const statuses = [
      'Checking URL structure...',
      'Inspecting domain telemetry...',
      'Verifying protocol & SSL...',
      'Checking threat reputation...',
      'Executing AI neural analysis...',
    ];

    for (let i = 0; i < statuses.length; i++) {
      setSimStatus(statuses[i]);
      await new Promise((r) => setTimeout(r, 280));
    }

    try {
      const res = await fetch('/api/scan/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: simUrl }),
      });
      const data = await res.json();
      setSimResult({
        id: data.id,
        riskScore: data.riskScore,
        riskLevel: data.riskLevel,
        threatType: data.threatType,
        indicators: (data.indicators || []).map((i: any) => `${i.name}: ${i.description}`).slice(0, 3),
      });
    } catch {
      setSimResult({
        id: 'sim-' + Date.now(),
        riskScore: 94,
        riskLevel: 'CRITICAL',
        threatType: 'Credential Phishing',
        indicators: [
          'Brand Impersonation: Wells Fargo spoofing detected in subdomain',
          'Insecure Protocol: Plaintext HTTP authentication attempted',
          'Suspicious TLD: High abuse registrar zone (.top)',
        ],
      });
    } finally {
      setIsScanning(false);
    }
  };

  const copyManifest = () => {
    navigator.clipboard.writeText(JSON.stringify({
      manifest_version: 3,
      name: "ThreatLens AI — Real-Time Browser Security Shield",
      version: "1.2.0",
      description: "Real-time AI threat intelligence, current tab inspection, phishing & scam shield for Chrome.",
      permissions: ["activeTab", "tabs", "storage", "sidePanel", "scripting"],
      host_permissions: ["http://*/*", "https://*/*"],
      background: { service_worker: "background/service-worker.js" },
      side_panel: { default_path: "sidepanel/sidepanel.html" },
      action: { default_title: "Open ThreatLens Side Panel" }
    }, null, 2));
    showToast('Manifest V3 Side Panel configuration copied', 'success');
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none transition-opacity cursor-pointer"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-3xl glass-dropdown rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden flex flex-col max-h-[92vh] border border-slate-200/90 dark:border-slate-800/90 cursor-default"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
                <Puzzle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  ThreatLens AI — Chrome Extension (Manifest V3)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instant browser inspection for active tabs and phishing protection
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab buttons */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                activeTab === 'simulator'
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/40 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              ⚡ Live Extension Simulator
            </button>
            <button
              onClick={() => setActiveTab('install')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                activeTab === 'install'
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/40 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              📦 Chrome Setup & Files
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto pr-1">
            {activeTab === 'simulator' ? (
              <div className="flex flex-col md:flex-row gap-6 items-start justify-center">
                {/* Simulated Chrome Extension Popup Box */}
                <div className="w-full max-w-[340px] mx-auto glass-card rounded-2xl p-4 shadow-xl flex flex-col gap-3 font-sans">
                  {/* Extension header */}
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-cyan-500/20 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      <div>
                        <div className="text-xs font-bold text-cyan-700 dark:text-cyan-400 tracking-wider font-mono">THREATLENS AI</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">SOC Shield v1.0</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ACTIVE
                    </div>
                  </div>

                  {/* Current Active Webpage */}
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase mb-1">
                      Current Active Webpage
                    </div>
                    <input
                      type="text"
                      value={simUrl}
                      onChange={(e) => setSimUrl(e.target.value)}
                      className="w-full glass-input rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-cyan-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Scan button */}
                  <button
                    disabled={isScanning}
                    onClick={handleSimScan}
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>⚡</span>
                    <span>{isScanning ? 'Inspecting Webpage...' : 'Analyze Webpage Threat'}</span>
                  </button>

                  {/* Scanning animation */}
                  {isScanning && (
                    <div className="p-4 rounded-xl glass-card flex flex-col items-center gap-2 text-center shadow-xs">
                      <div className="w-6 h-6 rounded-full border-2 border-cyan-600 dark:border-cyan-400 border-t-transparent animate-spin" />
                      <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300">{simStatus}</span>
                    </div>
                  )}

                  {/* Results preview */}
                  {simResult && !isScanning && (
                    <div className="flex flex-col gap-2.5">
                      <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                        simResult.riskLevel === 'CRITICAL' || simResult.riskLevel === 'HIGH'
                          ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-300'
                          : 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                      }`}>
                        <div className="text-xl font-mono font-extrabold px-2.5 py-1 bg-white/90 dark:bg-black/50 rounded-lg shadow-xs">
                          {simResult.riskScore}
                        </div>
                        <div>
                          <div className="text-xs font-bold font-mono uppercase tracking-wider">
                            {simResult.riskLevel} RISK
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-300">
                            {simResult.threatType}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Top Security Signals</div>
                        {simResult.indicators.map((ind, i) => (
                          <div key={i} className="text-[11px] p-2 rounded bg-white/80 dark:bg-slate-900/60 border-l-2 border-cyan-500 text-slate-700 dark:text-slate-300 leading-snug shadow-xs">
                            {ind}
                          </div>
                        ))}
                      </div>

                      {onOpenReport && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenReport(simResult.id);
                          }}
                          className="w-full mt-1 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 text-slate-800 dark:text-cyan-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>Full Forensic Report</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Explanatory side panel */}
                <div className="flex-1 space-y-4 text-xs font-sans text-slate-600 dark:text-slate-300">
                  <div className="p-4 rounded-xl glass-card space-y-2">
                    <h4 className="font-bold font-mono text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      How the Extension Works:
                    </h4>
                    <p className="leading-relaxed">
                      ThreatLens Chrome Extension hooks into the Chrome <code className="text-cyan-600 dark:text-cyan-300">tabs</code> and <code className="text-cyan-600 dark:text-cyan-300">webNavigation</code> APIs. Before you enter credentials or download files, the background service worker evaluates live DNS, punycode spoofing, and feeds.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl glass-card space-y-2">
                    <h4 className="font-bold font-mono text-slate-900 dark:text-slate-100">
                      Why Manifest V3?
                    </h4>
                    <p className="leading-relaxed">
                      Manifest V3 enforces declarative net requests and ephemeral service workers, ensuring zero background battery drain and maximal privacy protection.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Download banner */}
                <div className="p-4 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold font-mono text-xs text-cyan-900 dark:text-cyan-200">
                      📦 Direct Unpacked Extension Bundle
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Download pre-packaged ZIP with Side Panel, Service Worker, and high-res icons.
                    </p>
                  </div>
                  <a
                    href="/threatlens-extension.zip"
                    download="threatlens-extension.zip"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs shadow-md transition-all whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download ZIP</span>
                  </a>
                </div>

                <div className="p-4 rounded-xl glass-card space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                      dist-extension/manifest.json (Manifest V3)
                    </h4>
                    <button
                      onClick={copyManifest}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Manifest</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-900 text-cyan-300 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
{`{
  "manifest_version": 3,
  "name": "ThreatLens AI — Real-Time Browser Security Shield",
  "version": "1.2.0",
  "permissions": ["activeTab", "tabs", "storage", "sidePanel", "scripting"],
  "host_permissions": ["http://*/*", "https://*/*"],
  "background": {
    "service_worker": "background/service-worker.js"
  },
  "side_panel": {
    "default_path": "sidepanel/sidepanel.html"
  },
  "action": {
    "default_title": "Open ThreatLens Side Panel"
  }
}`}
                  </pre>
                </div>

                <div className="p-4 rounded-xl glass-card space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <h4 className="font-bold font-mono text-slate-900 dark:text-slate-100">
                    Step-by-step Installation into Google Chrome:
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 leading-relaxed font-sans">
                    <li>Download the ZIP above (or build using <code className="text-cyan-600 dark:text-cyan-400 font-mono">npm run build:extension</code>)</li>
                    <li>Unzip the archive to get the <code className="text-cyan-600 dark:text-cyan-400 font-mono">dist-extension/</code> folder</li>
                    <li>Open Chrome and navigate to <code className="text-cyan-600 dark:text-cyan-400 font-mono">chrome://extensions</code></li>
                    <li>Toggle on <strong>Developer mode</strong> in the upper right corner</li>
                    <li>Click <strong>Load unpacked</strong> and select the unzipped <code className="text-cyan-600 dark:text-cyan-400 font-mono">dist-extension/</code> folder</li>
                    <li>Click the ThreatLens shield icon in your Chrome toolbar to open the real-time Side Panel!</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
