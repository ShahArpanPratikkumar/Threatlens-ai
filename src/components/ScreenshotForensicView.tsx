import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Layers,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  Cpu,
  Compass,
  Lock,
  Globe,
  Info,
  Check,
  Minus,
  Maximize2
} from 'lucide-react';
import type { SecurityAnalysisResult, VisualEvidenceRegion, ScreenshotCheckItem } from '../types';

interface ScreenshotForensicViewProps {
  result: SecurityAnalysisResult;
  imageSrc: string | null;
  fileName: string;
}

export const ScreenshotForensicView: React.FC<ScreenshotForensicViewProps> = ({
  result,
  imageSrc,
  fileName
}) => {
  const forensics = result.screenshotForensics;
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [selectedRegion, setSelectedRegion] = useState<VisualEvidenceRegion | null>(null);
  const [maskOcrText, setMaskOcrText] = useState<boolean>(true);
  const [checksFilter, setChecksFilter] = useState<'ALL' | 'CHECKED' | 'NOT_CHECKED'>('ALL');

  if (!forensics) return null;

  const isSafe = result.riskLevel === 'SAFE';
  const checks = forensics.checksPerformed || [];
  const filteredChecks = checksFilter === 'ALL'
    ? checks
    : checks.filter((c) => (checksFilter === 'CHECKED' ? c.status === 'CHECKED' : c.status === 'NOT_CHECKED'));

  const regions: VisualEvidenceRegion[] = forensics.visualRegions || [];

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'malicious':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'suspicious':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'clean':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  const getCheckStatusBadge = (status: ScreenshotCheckItem['status']) => {
    switch (status) {
      case 'CHECKED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            <Check className="w-3 h-3 text-emerald-500" /> CHECKED
          </span>
        );
      case 'NOT_CHECKED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30">
            <Minus className="w-3 h-3 text-slate-400" /> NOT CHECKED
          </span>
        );
      case 'NOT_FOUND':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-500" /> NOT FOUND
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">
            N/A
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. VISUAL INSPECTION STAGE WITH DETECTED BOUNDING BOXES */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <h3 className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                Visual Inspection & Region Forensics
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Computer vision localized {regions.length} distinct UI components on the raster capture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
                showBoundingBoxes
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/50'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              {showBoundingBoxes ? <Eye className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showBoundingBoxes ? 'Overlay Active' : 'Show Regions'}</span>
            </button>
          </div>
        </div>

        {/* Interactive Image Frame with Overlay Regions */}
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center min-h-[280px]">
          {imageSrc ? (
            <div className="relative w-full max-h-[440px] flex items-center justify-center">
              <img
                src={imageSrc}
                alt="Target Forensic Analysis"
                className="max-h-[440px] w-auto object-contain select-none"
              />

              {/* Bounding Box Overlays */}
              {showBoundingBoxes && regions.map((region) => {
                const [ymin, xmin, ymax, xmax] = region.box2d;
                const top = `${ymin}%`;
                const left = `${xmin}%`;
                const width = `${Math.max(4, xmax - xmin)}%`;
                const height = `${Math.max(4, ymax - ymin)}%`;

                const isMalicious = region.severity === 'malicious';
                const isSuspicious = region.severity === 'suspicious';
                const isClean = region.severity === 'clean';

                const borderColor = isMalicious
                  ? 'border-rose-500 bg-rose-500/15'
                  : isSuspicious
                  ? 'border-amber-500 bg-amber-500/15'
                  : isClean
                  ? 'border-emerald-500 bg-emerald-500/15'
                  : 'border-cyan-500 bg-cyan-500/15';

                const badgeColor = isMalicious
                  ? 'bg-rose-600 text-white'
                  : isSuspicious
                  ? 'bg-amber-600 text-white'
                  : isClean
                  ? 'bg-emerald-600 text-white'
                  : 'bg-cyan-600 text-white';

                const isSelected = selectedRegion?.id === region.id;

                return (
                  <div
                    key={region.id}
                    onClick={() => setSelectedRegion(isSelected ? null : region)}
                    style={{ top, left, width, height }}
                    className={`absolute cursor-pointer border-2 transition-all rounded-md flex flex-col justify-start items-start p-1 ${borderColor} ${
                      isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 z-20' : 'z-10'
                    }`}
                  >
                    <span className={`text-[9px] font-mono font-bold px-1 rounded shadow-xs truncate max-w-full ${badgeColor}`}>
                      {region.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              No image source preview available
            </div>
          )}
        </div>

        {/* Selected Region Detail Pill */}
        {selectedRegion && (
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-purple-500/30 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                  {selectedRegion.label}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getSeverityBadge(selectedRegion.severity)}`}>
                  {selectedRegion.severity?.toUpperCase() || 'INFO'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {selectedRegion.description || 'Detected visual component'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedRegion(null)}
              className="text-xs font-mono text-slate-400 hover:text-slate-200"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* 2. HOW WE ANALYZED THIS IMAGE (PIPELINE VISUALIZATION) */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Cpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <div>
            <h3 className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
              How ThreatLens Analyzed This Image
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              End-to-end evidence pipeline: From raster pixels to structured forensic adjudication
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { step: '01', title: 'Image Ingestion', desc: 'File dimensions & raster normalization', status: 'Completed' },
            { step: '02', title: 'OCR Extraction', desc: 'Optical character text parsing', status: 'Completed' },
            { step: '03', title: 'UI Hierarchy', desc: 'Symmetry & component layout scan', status: 'Completed' },
            { step: '04', title: 'Brand Identity', desc: 'Logo & trademark alignment check', status: 'Completed' },
            { step: '05', title: 'Auth Forms', desc: 'Sensitive credential input audit', status: 'Completed' },
            { step: '06', title: 'Social Psych', desc: 'Urgency, panic & scareware audit', status: 'Completed' },
            { step: '07', title: 'Address Target', desc: 'Visible URL string extraction', status: forensics.visibleUrl ? 'Found' : 'Not Visible' },
            { step: '08', title: 'Consistency Engine', desc: 'Evidence-based risk adjudication', status: 'Verified' },
          ].map((s, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  {s.step}
                </span>
                <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <Check className="w-2.5 h-2.5" /> {s.status}
                </span>
              </div>
              <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                {s.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. EVIDENCE FOUND: VISUAL EVIDENCE vs RISK EVIDENCE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visual Evidence (Neutral Elements) */}
        <div className="p-6 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
              Visual Evidence Detected
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Observed structural and navigational UI elements verified from pixel analysis:
          </p>
          <ul className="space-y-2">
            {forensics.visualEvidenceFound.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs font-mono text-slate-700 dark:text-slate-300 p-2 rounded-lg bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60"
              >
                <Check className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risk Evidence (Threat Elements) */}
        <div className="p-6 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            {isSafe ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            )}
            <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
              Risk Evidence Detected
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isSafe
              ? 'Zero malicious signatures or deceptive factors identified in image capture:'
              : 'Confirmed malicious or deceptive indicators present on visual canvas:'}
          </p>

          {forensics.riskEvidenceFound.length > 0 ? (
            <ul className="space-y-2">
              {forensics.riskEvidenceFound.map((risk, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs font-mono text-rose-800 dark:text-rose-300 p-2 rounded-lg bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs font-mono text-emerald-700 dark:text-emerald-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                No Malicious Visual Indicators Detected
              </div>
              <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90">
                Visual inspection found no deceptive overlays, unauthorized login harvesting forms, or scareware warnings.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. WHAT WE CHECK & CHECKS PERFORMED AUDIT (HONEST STATUSES) */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
              Inspection Checklist & Boundary Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Honest distinction between raster visual checks and external network intelligence
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {(['ALL', 'CHECKED', 'NOT_CHECKED'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setChecksFilter(filter)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                  checksFilter === filter
                    ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/40 font-bold'
                    : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {filter.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredChecks.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/50 flex items-start justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                    {item.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 truncate">
                    {item.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {item.details}
                </p>
              </div>
              <div className="shrink-0">{getCheckStatusBadge(item.status)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. OCR EXTRACTED TEXT (WITH PRIVACY MASKING) */}
      {forensics.extractedOcrText && forensics.extractedOcrText.length > 0 && (
        <div className="p-6 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                OCR Semantic String Forensics
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setMaskOcrText(!maskOcrText)}
              className="text-[11px] font-mono text-purple-600 dark:text-purple-400 hover:underline"
            >
              {maskOcrText ? 'Show Raw Text' : 'Mask Sensitive Data'}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 space-y-1.5 max-h-40 overflow-y-auto">
            {forensics.extractedOcrText.map((line, idx) => {
              const displayLine = maskOcrText
                ? line.replace(/(password|pwd|pin|otp|ssn|credit\s*card|cvv|account\s*number)[:=]?\s*\S+/gi, '[REDACTED_CONFIDENTIAL]')
                : line;
              return (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-slate-600 select-none text-[10px] w-6">{idx + 1}.</span>
                  <span className="break-all">{displayLine}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. TRANSPARENT SCREENSHOT-ONLY LIMITATIONS NOTICE */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
            Forensic Boundary & Screenshot Limitations Notice
          </h5>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            {forensics.limitationsNotice}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotForensicView;
