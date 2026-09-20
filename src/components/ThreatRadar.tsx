import React, { useState, useId, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Activity,
  Lock,
  Globe,
  Server,
  Zap,
  CheckCircle2,
  XCircle,
  Cpu,
} from 'lucide-react';
import type { SecurityAnalysisResult, TechnicalSignal } from '../types';

export type RadarRiskLevel = 'SAFE' | 'LOW' | 'SUSPICIOUS' | 'HIGH' | 'CRITICAL';
export type RadarScanState = 'idle' | 'scanning' | 'analyzing' | 'detected' | 'safe' | 'error';

export interface ThreatRadarNode {
  id: string;
  label: string;
  category: string;
  angle: number; // in degrees (0 to 360)
  distance: number; // 0.15 to 0.85 (relative to radar radius)
  riskLevel: RadarRiskLevel;
  value?: string;
  points?: number;
  details?: string;
  isPrimary?: boolean;
}

export interface ThreatRadarProps {
  score?: number;
  threatType?: string;
  scanType?: 'url' | 'message' | 'screenshot' | 'qr';
  isScanning?: boolean;
  scanState?: RadarScanState;
  scanResult?: SecurityAnalysisResult | null;
  technicalSignals?: TechnicalSignal[];
  size?: 'sm' | 'md' | 'lg' | 'hero' | 'responsive';
  showTargetVector?: boolean;
  showLabels?: boolean;
  interactive?: boolean;
  customNodes?: ThreatRadarNode[];
  onNodeClick?: (node: ThreatRadarNode) => void;
  className?: string;
}

export const ThreatRadar: React.FC<ThreatRadarProps> = ({
  score = 0,
  threatType,
  scanType,
  isScanning = false,
  scanState,
  scanResult,
  technicalSignals,
  size = 'md',
  showTargetVector = true,
  showLabels = true,
  interactive = true,
  customNodes,
  onNodeClick,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const idPrefix = useId();
  const [hoveredNode, setHoveredNode] = useState<ThreatRadarNode | null>(null);

  // Compute actual effective score and risk level from props or scanResult
  const effectiveScore = scanResult ? scanResult.riskScore : score;
  const effectiveThreatType = scanResult ? scanResult.threatType : threatType || 'Threat Telemetry';
  const effectiveScanType = scanResult?.scanType || scanType || 'url';

  // Derive active scan state
  const currentScanState: RadarScanState = useMemo(() => {
    if (scanState) return scanState;
    if (isScanning) return 'scanning';
    if (effectiveScore >= 41) return 'detected';
    if (effectiveScore > 0) return 'safe';
    return 'idle';
  }, [scanState, isScanning, effectiveScore]);

  // Cybersecurity color token configuration based on real risk thresholds
  const riskConfig = useMemo(() => {
    if (currentScanState === 'scanning' || currentScanState === 'analyzing') {
      return {
        level: 'SCANNING',
        label: 'TELEMETRY SCAN ACTIVE',
        color: '#06B6D4', // cyan-500
        beamLead: '#22D3EE',
        trailColor: 'rgba(6, 182, 212, 0.18)',
        glow: 'rgba(6, 182, 212, 0.25)',
        coreBorder: 'border-cyan-500/40 dark:border-cyan-500/50',
        textClass: 'text-cyan-600 dark:text-cyan-400',
        badgeClass: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
        icon: Activity,
        sweepDuration: 2.5,
      };
    }

    if (effectiveScore >= 81) {
      return {
        level: 'CRITICAL',
        label: 'CRITICAL HAZARD',
        color: '#EF4444', // red-500
        beamLead: '#F87171',
        trailColor: 'rgba(239, 68, 68, 0.16)',
        glow: 'rgba(239, 68, 68, 0.35)',
        coreBorder: 'border-rose-500/50 dark:border-rose-500/60',
        textClass: 'text-rose-600 dark:text-rose-400',
        badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
        icon: ShieldAlert,
        sweepDuration: 3.2,
      };
    }

    if (effectiveScore >= 61) {
      return {
        level: 'HIGH',
        label: 'HIGH RISK DETECTED',
        color: '#F97316', // orange-500
        beamLead: '#FB923C',
        trailColor: 'rgba(249, 115, 22, 0.15)',
        glow: 'rgba(249, 115, 22, 0.30)',
        coreBorder: 'border-orange-500/50 dark:border-orange-500/60',
        textClass: 'text-orange-600 dark:text-orange-400',
        badgeClass: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/30',
        icon: AlertTriangle,
        sweepDuration: 3.8,
      };
    }

    if (effectiveScore >= 41) {
      return {
        level: 'SUSPICIOUS',
        label: 'SUSPICIOUS INDICATORS',
        color: '#F59E0B', // amber-500
        beamLead: '#FBBF24',
        trailColor: 'rgba(245, 158, 11, 0.14)',
        glow: 'rgba(245, 158, 11, 0.25)',
        coreBorder: 'border-amber-500/50 dark:border-amber-500/60',
        textClass: 'text-amber-600 dark:text-amber-400',
        badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
        icon: AlertTriangle,
        sweepDuration: 4.2,
      };
    }

    if (effectiveScore >= 21) {
      return {
        level: 'LOW RISK',
        label: 'LOW RISK ANOMALIES',
        color: '#06B6D4', // cyan-500
        beamLead: '#38BDF8',
        trailColor: 'rgba(6, 182, 212, 0.12)',
        glow: 'rgba(6, 182, 212, 0.20)',
        coreBorder: 'border-cyan-500/40 dark:border-cyan-500/50',
        textClass: 'text-cyan-600 dark:text-cyan-400',
        badgeClass: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
        icon: ShieldCheck,
        sweepDuration: 5.0,
      };
    }

    // Default SAFE
    return {
      level: 'SAFE',
      label: 'SAFE & VERIFIED',
      color: '#10B981', // emerald-500
      beamLead: '#34D399',
      trailColor: 'rgba(16, 185, 129, 0.12)',
      glow: 'rgba(16, 185, 129, 0.20)',
      coreBorder: 'border-emerald-500/40 dark:border-emerald-500/50',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
      icon: ShieldCheck,
      sweepDuration: 5.8,
    };
  }, [effectiveScore, currentScanState]);

  const StatusIcon = riskConfig.icon;

  // Geometry dimensions
  const dims = useMemo(() => {
    switch (size) {
      case 'sm':
        return { width: 220, height: 220, radius: 96, coreRadius: 32, fontSize: 8 };
      case 'lg':
        return { width: 360, height: 360, radius: 160, coreRadius: 48, fontSize: 10 };
      case 'hero':
        return { width: 420, height: 420, radius: 190, coreRadius: 56, fontSize: 11 };
      case 'responsive':
      case 'md':
      default:
        return { width: 300, height: 300, radius: 132, coreRadius: 42, fontSize: 9 };
    }
  }, [size]);

  const cx = dims.width / 2;
  const cy = dims.height / 2;
  const maxR = dims.radius;

  // Derive real data-driven detection nodes
  const nodes: ThreatRadarNode[] = useMemo(() => {
    if (customNodes && customNodes.length > 0) {
      return customNodes;
    }

    // When scanning or analyzing without data yet
    if (currentScanState === 'scanning' || currentScanState === 'analyzing') {
      if (effectiveScanType === 'message') {
        return [
          {
            id: 'probe-nlp',
            label: 'Linguistic Syntax',
            category: 'NLP',
            angle: 38,
            distance: 0.65,
            riskLevel: 'SAFE',
            value: 'Parsing semantic tokens...',
            details: 'Auditing tone, pressure vectors, and manipulation syntax',
          },
          {
            id: 'probe-urgency',
            label: 'Urgency Detection',
            category: 'URGENCY',
            angle: 110,
            distance: 0.50,
            riskLevel: 'LOW',
            value: 'Scanning time pressure...',
            details: 'Checking artificial countdowns and panic triggers',
          },
          {
            id: 'probe-brand',
            label: 'Authority Claims',
            category: 'IDENTITY',
            angle: 195,
            distance: 0.70,
            riskLevel: 'SAFE',
            value: 'Verifying institution claims...',
            details: 'Cross-referencing bank, delivery, or tech brand mentions',
          },
          {
            id: 'probe-financial',
            label: 'Payment Demands',
            category: 'FINANCIAL',
            angle: 265,
            distance: 0.58,
            riskLevel: 'LOW',
            value: 'Checking financial triggers...',
            details: 'Auditing wire, crypto, UPI, or OTP requests',
          },
          {
            id: 'probe-links',
            label: 'Payload Links',
            category: 'PAYLOAD',
            angle: 330,
            distance: 0.72,
            riskLevel: 'SAFE',
            value: 'Extracting URL vectors...',
            details: 'Checking external links, shorteners, and redirection traps',
          },
        ];
      }

      if (effectiveScanType === 'screenshot') {
        return [
          {
            id: 'probe-layout',
            label: 'Visual Structure',
            category: 'LAYOUT',
            angle: 38,
            distance: 0.65,
            riskLevel: 'SAFE',
            value: 'Parsing UI hierarchy...',
            details: 'Evaluating layout symmetry and component placements',
          },
          {
            id: 'probe-brand',
            label: 'Brand Identity',
            category: 'BRAND',
            angle: 110,
            distance: 0.50,
            riskLevel: 'LOW',
            value: 'Scanning logos & emblems...',
            details: 'Matching brand visual styling against impersonation models',
          },
          {
            id: 'probe-forms',
            label: 'Credential Forms',
            category: 'AUTH',
            angle: 195,
            distance: 0.70,
            riskLevel: 'SAFE',
            value: 'Detecting input prompts...',
            details: 'Scanning for password, PIN, or payment collection fields',
          },
          {
            id: 'probe-social',
            label: 'Urgency & Scareware',
            category: 'COERCION',
            angle: 265,
            distance: 0.58,
            riskLevel: 'LOW',
            value: 'Checking panic triggers...',
            details: 'Inspecting fake security warnings and countdown alerts',
          },
          {
            id: 'probe-deception',
            label: 'UI Overlays',
            category: 'DECEPTION',
            angle: 330,
            distance: 0.72,
            riskLevel: 'SAFE',
            value: 'Scanning modal layers...',
            details: 'Checking for fake browser chrome and deceptive overlays',
          },
        ];
      }

      if (effectiveScanType === 'qr') {
        return [
          {
            id: 'probe-qr-matrix',
            label: 'QR Matrix Integrity',
            category: 'MATRIX',
            angle: 38,
            distance: 0.65,
            riskLevel: 'SAFE',
            value: 'Validating pixel matrix...',
            details: 'Inspecting alignment patterns and timing cells',
          },
          {
            id: 'probe-qr-content',
            label: 'Content Parsing',
            category: 'PAYLOAD',
            angle: 110,
            distance: 0.50,
            riskLevel: 'LOW',
            value: 'Extracting payload syntax...',
            details: 'Detecting URL, Wi-Fi, vCard, or payment format',
          },
          {
            id: 'probe-qr-domain',
            label: 'Destination Audit',
            category: 'HOST',
            angle: 195,
            distance: 0.70,
            riskLevel: 'SAFE',
            value: 'Resolving endpoint host...',
            details: 'Checking DNS authority, homoglyphs, and redirects',
          },
          {
            id: 'probe-qr-intel',
            label: 'Threat Feeds',
            category: 'INTEL',
            angle: 265,
            distance: 0.58,
            riskLevel: 'LOW',
            value: 'Cross-referencing SOC feeds...',
            details: 'Scanning phishing blocklists and reputation databases',
          },
          {
            id: 'probe-qr-quishing',
            label: 'Quishing Defense',
            category: 'HEURISTICS',
            angle: 330,
            distance: 0.72,
            riskLevel: 'SAFE',
            value: 'Evaluating quishing vectors...',
            details: 'Auditing credential harvesting and visual deception cues',
          },
        ];
      }

      return [
        {
          id: 'probe-dns',
          label: 'DNS Resolution',
          category: 'DNS',
          angle: 38,
          distance: 0.65,
          riskLevel: 'SAFE',
          value: 'Querying authoritative servers...',
          details: 'Verifying root nameservers and A-records',
        },
        {
          id: 'probe-tls',
          label: 'TLS Handshake',
          category: 'SSL/TLS',
          angle: 110,
          distance: 0.50,
          riskLevel: 'LOW',
          value: 'Negotiating cipher suite...',
          details: 'Inspecting certificate SAN and issuer trust chain',
        },
        {
          id: 'probe-domain',
          label: 'Domain Authority',
          category: 'DOMAIN',
          angle: 195,
          distance: 0.70,
          riskLevel: 'SAFE',
          value: 'Scanning WHOIS & registration...',
          details: 'Checking homoglyphs and typosquatting vectors',
        },
        {
          id: 'probe-intel',
          label: 'Threat Feeds',
          category: 'INTEL',
          angle: 265,
          distance: 0.58,
          riskLevel: 'LOW',
          value: 'Checking SOC blocklists...',
          details: 'Correlating with live phishing and malware feeds',
        },
        {
          id: 'probe-content',
          label: 'Payload Heuristics',
          category: 'HEURISTICS',
          angle: 330,
          distance: 0.72,
          riskLevel: 'SAFE',
          value: 'Analyzing structure...',
          details: 'Detecting credential theft parameters and redirect traps',
        },
      ];
    }

    // MAP REAL SCAN RESULT SIGNALS IF AVAILABLE
    if (scanResult) {
      const resultNodes: ThreatRadarNode[] = [];
      const signals = scanResult.technicalSignals || [];
      const breakdown = scanResult.riskBreakdown;

      // SPECIALIZED VECTOR NODES FOR MESSAGE & SCAM SCANS
      if (scanResult.scanType === 'message') {
        // 1. URGENCY & PANIC PRESSURE (Sector: 20° - 65°)
        const urgSig = signals.find((s) => s.category.toLowerCase().includes('psychological') || s.key.toLowerCase().includes('urgency') || s.key.toLowerCase().includes('time pressure'));
        const urgPoints = breakdown?.contributingSignals?.find((s) =>
          s.factor.toLowerCase().includes('urgency') || s.reason.toLowerCase().includes('urgency')
        )?.points || 0;
        const urgClean = urgSig ? urgSig.status === 'clean' : urgPoints === 0;
        resultNodes.push({
          id: 'node-urgency',
          label: 'Urgency & Coercion',
          category: 'URGENCY',
          angle: 42,
          distance: urgClean ? 0.36 : 0.76,
          riskLevel: urgPoints >= 25 ? 'HIGH' : urgPoints > 0 ? 'SUSPICIOUS' : 'SAFE',
          value: urgSig ? String(urgSig.value) : 'No Panic Triggers',
          points: urgPoints,
          details: urgSig?.details || 'Standard communication timeline without artificial pressure',
        });

        // 2. BRAND & AUTHORITY SPOOFING (Sector: 95° - 145°)
        const brandSig = signals.find((s) => s.category.toLowerCase().includes('brand') || s.key.toLowerCase().includes('impersonation') || s.key.toLowerCase().includes('entity'));
        const brandPoints = breakdown?.contributingSignals?.find((s) =>
          s.factor.toLowerCase().includes('brand') || s.reason.toLowerCase().includes('brand')
        )?.points || 0;
        const brandMalicious = brandSig ? brandSig.status === 'malicious' : brandPoints > 0;
        resultNodes.push({
          id: 'node-brand',
          label: 'Brand Impersonation',
          category: 'IDENTITY',
          angle: 115,
          distance: brandMalicious ? 0.80 : 0.35,
          riskLevel: brandPoints >= 20 ? 'HIGH' : brandMalicious ? 'SUSPICIOUS' : 'SAFE',
          value: brandSig ? String(brandSig.value) : 'No Brand Spoofing',
          points: brandPoints,
          details: brandSig?.details || 'No deceptive claims of representing financial or service entities',
        });

        // 3. FINANCIAL & CREDENTIAL SOLICITATION (Sector: 175° - 225°)
        const finSig = signals.find((s) => s.category.toLowerCase().includes('financial') || s.category.toLowerCase().includes('credential') || s.key.toLowerCase().includes('payment') || s.key.toLowerCase().includes('auth'));
        const finPoints = breakdown?.contributingSignals?.filter((s) =>
          s.factor.toLowerCase().includes('payment') || s.factor.toLowerCase().includes('secret') || s.factor.toLowerCase().includes('credential')
        ).reduce((acc, curr) => acc + curr.points, 0) || 0;
        const finMalicious = finSig ? (finSig.status === 'malicious' || finSig.status === 'suspicious') : finPoints > 0;
        resultNodes.push({
          id: 'node-financial',
          label: 'Payment / Secrets Demanded',
          category: 'FINANCIAL',
          angle: 195,
          distance: finMalicious ? 0.82 : 0.34,
          riskLevel: finPoints >= 30 ? 'CRITICAL' : finPoints > 0 ? 'HIGH' : 'SAFE',
          value: finSig ? String(finSig.value) : 'No Payment Solicitations',
          points: finPoints,
          details: finSig?.details || 'Zero demands for wire transfer, crypto, UPI, or credentials',
        });

        // 4. EMBEDDED ACTION LINKS & PAYLOADS (Sector: 245° - 295°)
        const linkSig = signals.find((s) => s.category.toLowerCase().includes('payload') || s.key.toLowerCase().includes('link'));
        const linkPoints = breakdown?.urlStructureRisk || 0;
        const hasSuspiciousLink = linkSig ? linkSig.status !== 'clean' : linkPoints > 0;
        resultNodes.push({
          id: 'node-links',
          label: 'Action Link Vector',
          category: 'PAYLOAD',
          angle: 270,
          distance: hasSuspiciousLink ? 0.78 : 0.35,
          riskLevel: linkPoints >= 25 ? 'HIGH' : hasSuspiciousLink ? 'SUSPICIOUS' : 'SAFE',
          value: linkSig ? String(linkSig.value) : 'No Embedded Links',
          points: linkPoints,
          details: linkSig?.details || 'No unverified external hyperlinks present in message',
        });

        // 5. LINGUISTIC BAIT & SOCIAL ENGINEERING (Sector: 315° - 355°)
        const baitSig = signals.find((s) => s.category.toLowerCase().includes('incentive') || s.category.toLowerCase().includes('linguistic') || s.key.toLowerCase().includes('bait'));
        const baitPoints = breakdown?.contributingSignals?.find((s) =>
          s.factor.toLowerCase().includes('bait') || s.factor.toLowerCase().includes('reward') || s.category.toLowerCase().includes('ai')
        )?.points || 0;
        const hasBait = baitSig ? baitSig.status === 'malicious' : baitPoints > 0;
        resultNodes.push({
          id: 'node-bait',
          label: 'Bait & Social Engineering',
          category: 'BAIT / LURE',
          angle: 335,
          distance: hasBait ? 0.79 : 0.36,
          riskLevel: baitPoints >= 25 ? 'CRITICAL' : baitPoints > 0 ? 'HIGH' : 'SAFE',
          value: baitSig ? String(baitSig.value) : (scanResult.threatType || 'Standard Narrative'),
          points: baitPoints,
          details: baitSig?.details || 'No advance-fee lottery lures or deceptive reward vectors',
        });

        return resultNodes;
      }

      // SPECIALIZED VECTOR NODES FOR SCREENSHOT & VISION FORENSIC SCANS
      if (scanResult.scanType === 'screenshot') {
        const forensics = scanResult.screenshotForensics;
        const isSafe = scanResult.riskLevel === 'SAFE';

        // 1. VISUAL STRUCTURE & INTEGRITY (Sector: 20° - 65°)
        const isStructureClean = isSafe || forensics?.visualIntegrity === 'clean';
        resultNodes.push({
          id: 'node-vision-layout',
          label: 'Visual UI Structure',
          category: 'LAYOUT',
          angle: 42,
          distance: isStructureClean ? 0.35 : 0.78,
          riskLevel: isStructureClean ? 'SAFE' : 'HIGH',
          value: isStructureClean ? 'Benign UI Hierarchy' : 'Deceptive Overlay / Spoofed Frame',
          details: isStructureClean
            ? 'Conforms to standard UI design without disguised components'
            : 'Detected deceptive overlay or abnormal interface structure',
        });

        // 2. BRAND IDENTITY & IMPERSONATION (Sector: 95° - 145°)
        const brand = forensics?.brandDetected;
        const hasBrandSpoof = !isSafe && (forensics?.riskEvidenceFound?.some(r => r.toLowerCase().includes('brand') || r.toLowerCase().includes('impersonat')) || false);
        resultNodes.push({
          id: 'node-vision-brand',
          label: 'Brand Identity',
          category: 'IDENTITY',
          angle: 115,
          distance: hasBrandSpoof ? 0.80 : 0.34,
          riskLevel: hasBrandSpoof ? 'HIGH' : 'SAFE',
          value: brand?.name ? (hasBrandSpoof ? `${brand.name} (Spoofed)` : `${brand.name} (Benign)`) : 'No Spoofing Cues',
          details: brand?.notes || 'No deceptive brand impersonation detected',
        });

        // 3. CREDENTIAL HARVESTING FORMS (Sector: 175° - 225°)
        const hasCreds = !isSafe && Boolean(forensics?.credentialFieldsDetected);
        resultNodes.push({
          id: 'node-vision-credentials',
          label: 'Credential Harvesting',
          category: 'AUTH FORMS',
          angle: 195,
          distance: hasCreds ? 0.82 : 0.32,
          riskLevel: hasCreds ? 'CRITICAL' : 'SAFE',
          value: hasCreds ? (forensics?.credentialFieldDetails?.join(', ') || 'Password Input Present') : 'Zero Credential Fields',
          details: hasCreds
            ? 'Authentication credential fields detected on unverified image canvas'
            : 'No unverified password, PIN, or payment collection forms identified',
        });

        // 4. SOCIAL ENGINEERING & SCAREWARE (Sector: 245° - 295°)
        const hasPanic = !isSafe && Boolean(forensics?.urgencyOrPanicDetected);
        resultNodes.push({
          id: 'node-vision-urgency',
          label: 'Urgency & Scareware',
          category: 'PSYCHOLOGICAL',
          angle: 270,
          distance: hasPanic ? 0.84 : 0.33,
          riskLevel: hasPanic ? 'CRITICAL' : 'SAFE',
          value: hasPanic ? 'Urgent Warning / Scareware' : 'No Panic Triggers',
          details: hasPanic
            ? 'Coercive urgency, countdown threat, or fake security alert detected'
            : 'Zero artificial countdown threats or scareware banners present',
        });

        // 5. DESTINATION ALIGNMENT & DECEPTION (Sector: 315° - 355°)
        const hasDeception = !isSafe && Boolean(forensics?.deceptiveElementsDetected);
        resultNodes.push({
          id: 'node-vision-deception',
          label: 'Interface Deception',
          category: 'DECEPTION',
          angle: 335,
          distance: hasDeception ? 0.81 : 0.36,
          riskLevel: hasDeception ? 'HIGH' : 'SAFE',
          value: hasDeception ? 'Simulated Dialog / Deceptive UI' : 'No Deceptive Elements',
          details: hasDeception
            ? 'Simulated system popup or fake browser address chrome detected'
            : 'Clean interface canvas without disguised modal overlays',
        });

        return resultNodes;
      }

      // SPECIALIZED VECTOR NODES FOR QR & QUISHING SCANS
      if (scanResult.scanType === 'qr') {
        const qrForensics = scanResult.qrForensics;
        const isSafe = scanResult.riskLevel === 'SAFE';
        const isMalicious = scanResult.riskLevel === 'CRITICAL' || scanResult.riskLevel === 'HIGH';
        const urlDetails = qrForensics?.urlDetails;
        const wifiDetails = qrForensics?.wifiDetails;

        // 1. QR MATRIX & FORMAT INTEGRITY (Sector: 20° - 65°)
        resultNodes.push({
          id: 'node-qr-matrix',
          label: 'QR Matrix Integrity',
          category: 'INTEGRITY',
          angle: 42,
          distance: 0.34,
          riskLevel: 'SAFE',
          value: qrForensics?.format || 'ISO/IEC 18004 Valid',
          details: 'Direct standard 2D matrix structure decoded cleanly without corrupted blocks',
        });

        // 2. PAYLOAD DESTINATION / URL (Sector: 95° - 145°)
        const destTitle = urlDetails ? 'Destination URL' : wifiDetails ? 'Wi-Fi Network' : 'Decoded Content';
        const destValue = urlDetails ? urlDetails.domain : (wifiDetails ? wifiDetails.ssid : (scanResult.target.slice(0, 24)));
        const destMalicious = isMalicious || (urlDetails?.isIpHost || false);
        resultNodes.push({
          id: 'node-qr-dest',
          label: destTitle,
          category: 'DESTINATION',
          angle: 115,
          distance: isSafe ? 0.35 : destMalicious ? 0.82 : 0.65,
          riskLevel: isSafe ? 'SAFE' : destMalicious ? 'CRITICAL' : 'SUSPICIOUS',
          value: destValue,
          details: urlDetails
            ? (urlDetails.isIpHost ? 'Host uses raw unverified IP address' : `Resolved web host: ${urlDetails.domain}`)
            : (wifiDetails ? `SSID broadcast: ${wifiDetails.ssid}` : 'Standard decoded payload text'),
        });

        // 3. SSL/TLS ENCRYPTION / TRANSPORT (Sector: 175° - 225°)
        if (urlDetails) {
          const isHttps = urlDetails.isHttps;
          resultNodes.push({
            id: 'node-qr-ssl',
            label: 'SSL/TLS Cryptography',
            category: 'SSL/TLS',
            angle: 195,
            distance: isHttps ? 0.35 : 0.82,
            riskLevel: isHttps ? 'SAFE' : 'CRITICAL',
            value: isHttps ? 'HTTPS (TLS Secured)' : 'Insecure HTTP (Cleartext)',
            details: isHttps ? 'Encrypted web channel' : 'Unencrypted transport exposes user credentials to interception',
          });
        } else if (wifiDetails) {
          const isWifiSafe = wifiDetails.security !== 'NONE' && wifiDetails.hasPassword;
          resultNodes.push({
            id: 'node-qr-cipher',
            label: 'Wi-Fi Encryption',
            category: 'CIPHER',
            angle: 195,
            distance: isWifiSafe ? 0.34 : 0.78,
            riskLevel: isWifiSafe ? 'SAFE' : 'SUSPICIOUS',
            value: wifiDetails.security,
            details: isWifiSafe ? `${wifiDetails.security} pre-shared key security active` : 'Open unencrypted wireless network',
          });
        } else {
          resultNodes.push({
            id: 'node-qr-syntax',
            label: 'Payload Syntax',
            category: 'SYNTAX',
            angle: 195,
            distance: isSafe ? 0.34 : 0.70,
            riskLevel: isSafe ? 'SAFE' : 'SUSPICIOUS',
            value: `${qrForensics?.contentType.toUpperCase() || 'TEXT'} Payload`,
            details: 'Payload conforms to standard formatting standards',
          });
        }

        // 4. THREAT INTELLIGENCE & FEEDS (Sector: 245° - 295°)
        const intelSig = signals.find((s) => s.category.toLowerCase().includes('threat') || s.category.toLowerCase().includes('intel'));
        resultNodes.push({
          id: 'node-qr-intel',
          label: 'Threat Intelligence',
          category: 'INTEL',
          angle: 270,
          distance: isSafe ? 0.33 : isMalicious ? 0.84 : 0.65,
          riskLevel: isSafe ? 'SAFE' : isMalicious ? 'CRITICAL' : 'SUSPICIOUS',
          value: isSafe ? 'Zero Malicious Signatures' : isMalicious ? 'Phishing Threat Match' : 'Unverified Reputation',
          details: intelSig?.details || (isSafe ? 'Zero positive flags across authoritative threat feeds' : 'Threat signals matched known phishing vectors'),
        });

        // 5. QUISHING & HEURISTIC DEFENSE (Sector: 315° - 355°)
        resultNodes.push({
          id: 'node-qr-quishing',
          label: 'Quishing Heuristics',
          category: 'HEURISTICS',
          angle: 335,
          distance: isSafe ? 0.36 : isMalicious ? 0.83 : 0.68,
          riskLevel: isSafe ? 'SAFE' : isMalicious ? 'CRITICAL' : 'SUSPICIOUS',
          value: isSafe ? 'Clean Destination Vector' : isMalicious ? 'Active Quishing Attack' : 'Anomalous Heuristic Signals',
          details: isSafe
            ? 'No deceptive homoglyphs, brand spoofing, or credential harvest vectors detected'
            : (scanResult.explanation.threatMechanics || 'Concealed hostile destination detected'),
        });

        return resultNodes;
      }

      // STANDARD INFRASTRUCTURE NODES FOR URL SCANS

      // 1. DNS NODE (Sector: 20° - 65°)
      const dnsSig = signals.find((s) => s.category.toLowerCase().includes('dns'));
      const dnsIsClean = dnsSig ? dnsSig.status === 'clean' : true;
      const dnsPoints = breakdown?.contributingSignals?.find((s) =>
        s.category.toLowerCase().includes('dns') || s.factor.toLowerCase().includes('dns')
      )?.points || 0;
      resultNodes.push({
        id: 'node-dns',
        label: 'DNS Infrastructure',
        category: 'DNS',
        angle: 42,
        distance: dnsIsClean ? 0.38 : 0.74,
        riskLevel: dnsIsClean ? 'SAFE' : dnsPoints > 20 ? 'HIGH' : 'SUSPICIOUS',
        value: dnsSig ? String(dnsSig.value) : 'Active Authoritative DNS',
        points: dnsPoints,
        details: dnsSig?.details || 'Authoritative DNS resolution confirmed',
      });

      // 2. SSL/TLS ENCRYPTION NODE (Sector: 95° - 145°)
      const sslSig = signals.find((s) => s.category.toLowerCase().includes('protocol') || s.key.toLowerCase().includes('encryption'));
      const isHttps = sslSig ? sslSig.status === 'clean' : true;
      const sslPoints = breakdown?.sslRisk || 0;
      resultNodes.push({
        id: 'node-ssl',
        label: 'SSL/TLS Encryption',
        category: 'SSL/TLS',
        angle: 115,
        distance: isHttps ? 0.35 : 0.82,
        riskLevel: isHttps ? 'SAFE' : 'CRITICAL',
        value: sslSig ? String(sslSig.value) : 'HTTPS (TLS Active)',
        points: sslPoints,
        details: sslSig?.details || 'Traffic cryptographically secured via TLS',
      });

      // 3. DOMAIN & TLD REPUTATION NODE (Sector: 175° - 225°)
      const hostSig = signals.find((s) => s.category.toLowerCase().includes('host') || s.category.toLowerCase().includes('tld'));
      const isHostClean = hostSig ? hostSig.status === 'clean' : true;
      const domainPoints = breakdown?.domainRisk || 0;
      resultNodes.push({
        id: 'node-domain',
        label: 'Domain Authority',
        category: 'DOMAIN',
        angle: 195,
        distance: isHostClean && domainPoints === 0 ? 0.36 : 0.78,
        riskLevel: domainPoints >= 30 ? 'CRITICAL' : domainPoints >= 15 ? 'HIGH' : domainPoints > 0 ? 'SUSPICIOUS' : 'SAFE',
        value: hostSig ? String(hostSig.value) : 'Authentic Domain Apex',
        points: domainPoints,
        details: hostSig?.details || 'Standard registration zone without homoglyph markers',
      });

      // 4. THREAT INTELLIGENCE & HEURISTICS (Sector: 245° - 295°)
      const intelSig = signals.find((s) => s.category.toLowerCase().includes('threat') || s.category.toLowerCase().includes('intel'));
      const intelClean = intelSig ? intelSig.status === 'clean' : true;
      const intelPoints = breakdown?.reputationRisk || (scanResult.threatIntelligence?.heuristicEngine?.rulesTriggered?.length ? 30 : 0);
      resultNodes.push({
        id: 'node-intel',
        label: 'Threat Intelligence',
        category: 'INTEL',
        angle: 270,
        distance: intelClean && intelPoints === 0 ? 0.34 : 0.80,
        riskLevel: intelPoints >= 30 ? 'CRITICAL' : intelPoints > 0 ? 'HIGH' : 'SAFE',
        value: intelSig ? String(intelSig.value) : (scanResult.threatIntelligence?.heuristicEngine?.status || 'Clean Reputation'),
        points: intelPoints,
        details: intelSig?.details || 'Zero anomalous triggers in global threat feeds',
      });

      // 5. CREDENTIAL & CONTENT VECTOR (Sector: 315° - 355°)
      const kwSig = signals.find((s) => s.category.toLowerCase().includes('keyword') || s.category.toLowerCase().includes('structure') || s.category.toLowerCase().includes('routing'));
      const kwClean = kwSig ? kwSig.status === 'clean' : true;
      const contentPoints = (breakdown?.contentRisk || 0) + (breakdown?.urlStructureRisk || 0);
      resultNodes.push({
        id: 'node-payload',
        label: 'Payload & Credentials',
        category: 'PAYLOAD',
        angle: 335,
        distance: kwClean && contentPoints === 0 ? 0.38 : 0.76,
        riskLevel: contentPoints >= 25 ? 'HIGH' : contentPoints > 0 ? 'SUSPICIOUS' : 'SAFE',
        value: kwSig ? String(kwSig.value) : 'Standard Web Path',
        points: contentPoints,
        details: kwSig?.details || 'No deceptive credential harvest vectors detected',
      });

      return resultNodes;
    }

    // Fallback baseline nodes driven purely by score
    const isSafe = effectiveScore <= 20;
    return [
      {
        id: 'base-dns',
        label: 'DNS Infrastructure',
        category: 'DNS',
        angle: 42,
        distance: isSafe ? 0.36 : 0.72,
        riskLevel: isSafe ? 'SAFE' : effectiveScore > 60 ? 'HIGH' : 'SUSPICIOUS',
        value: isSafe ? 'Authoritative A-Records' : 'Anomalous Resolution',
      },
      {
        id: 'base-ssl',
        label: 'SSL/TLS Cryptography',
        category: 'SSL/TLS',
        angle: 115,
        distance: isSafe ? 0.34 : 0.80,
        riskLevel: isSafe ? 'SAFE' : 'CRITICAL',
        value: isSafe ? 'TLS 1.3 Active' : 'Unencrypted Transport',
      },
      {
        id: 'base-domain',
        label: 'Domain Reputation',
        category: 'DOMAIN',
        angle: 195,
        distance: isSafe ? 0.36 : 0.76,
        riskLevel: isSafe ? 'SAFE' : effectiveScore > 50 ? 'HIGH' : 'SUSPICIOUS',
        value: isSafe ? 'Standard Apex Host' : 'Elevated Abuse TLD',
      },
      {
        id: 'base-intel',
        label: 'Threat Feeds',
        category: 'INTEL',
        angle: 270,
        distance: isSafe ? 0.32 : 0.82,
        riskLevel: isSafe ? 'SAFE' : effectiveScore > 75 ? 'CRITICAL' : 'HIGH',
        value: isSafe ? 'Zero Malicious Signatures' : 'Signature Match',
      },
      {
        id: 'base-content',
        label: 'Payload Analysis',
        category: 'PAYLOAD',
        angle: 335,
        distance: isSafe ? 0.38 : 0.74,
        riskLevel: isSafe ? 'SAFE' : 'SUSPICIOUS',
        value: isSafe ? 'Authentic Parameters' : 'Auth Keyword Probes',
      },
    ];
  }, [customNodes, currentScanState, scanResult, effectiveScore]);

  // Coordinate math: Polar to Cartesian (0 deg = North / Top)
  const getCoordinates = (angleDeg: number, distanceRatio: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    const dist = distanceRatio * maxR;
    return {
      x: cx + dist * Math.cos(rad),
      y: cy + dist * Math.sin(rad),
    };
  };

  // Node color helper
  const getNodeColor = (level: RadarRiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return {
          stroke: '#EF4444',
          fill: '#EF4444',
          glow: 'rgba(239, 68, 68, 0.45)',
          badge: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
        };
      case 'HIGH':
        return {
          stroke: '#F97316',
          fill: '#F97316',
          glow: 'rgba(249, 115, 22, 0.40)',
          badge: 'bg-orange-500/15 text-orange-300 border-orange-500/40',
        };
      case 'SUSPICIOUS':
        return {
          stroke: '#F59E0B',
          fill: '#F59E0B',
          glow: 'rgba(245, 158, 11, 0.35)',
          badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
        };
      case 'LOW':
        return {
          stroke: '#06B6D4',
          fill: '#06B6D4',
          glow: 'rgba(6, 182, 212, 0.30)',
          badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
        };
      case 'SAFE':
      default:
        return {
          stroke: '#10B981',
          fill: '#10B981',
          glow: 'rgba(16, 185, 129, 0.25)',
          badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
        };
    }
  };

  return (
    <div
      id="threatlens-radar-system"
      className={`relative flex flex-col items-center justify-center select-none w-full max-w-full ${className}`}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: dims.width, height: dims.height, maxWidth: '100%' }}
      >
        {/* Ambient atmospheric depth glow */}
        <div
          className="absolute inset-2 rounded-full blur-2xl pointer-events-none transition-colors duration-1000 opacity-15 dark:opacity-20"
          style={{ backgroundColor: riskConfig.color }}
        />

        {/* ======================================================== */}
        {/* SVG CALIBRATION LAYERS (GRID, RINGS, TICKS, CORRELATIONS) */}
        {/* ======================================================== */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${dims.width} ${dims.height}`}
        >
          <defs>
            {/* Subtle radar cavity gradient */}
            <radialGradient id={`${idPrefix}-radar-cavity`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={riskConfig.color} stopOpacity="0.04" />
              <stop offset="70%" stopColor={riskConfig.color} stopOpacity="0.01" />
              <stop offset="100%" stopColor="rgba(15, 23, 42, 0.05)" stopOpacity="0.06" />
            </radialGradient>

            {/* Sweep Mask to constrain phosphor beam precisely within max radius */}
            <clipPath id={`${idPrefix}-radar-clip`}>
              <circle cx={cx} cy={cy} r={maxR} />
            </clipPath>
          </defs>

          {/* Radar background disk */}
          <circle
            cx={cx}
            cy={cy}
            r={maxR}
            fill={`url(#${idPrefix}-radar-cavity)`}
            className="fill-slate-50/80 dark:fill-slate-950/40"
          />

          {/* ======================================================== */}
          {/* LAYER 1: Concentric Calibration Range Orbit Rings        */}
          {/* ======================================================== */}
          {/* Outer Boundary Bezel (100% Boundary) */}
          <circle
            cx={cx}
            cy={cy}
            r={maxR}
            fill="none"
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700/80"
            strokeWidth="1.2"
          />

          {/* 75% Risk Threshold Ring (Elevated Risk Orbit) */}
          <circle
            cx={cx}
            cy={cy}
            r={maxR * 0.75}
            fill="none"
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeWidth="0.8"
            strokeDasharray="4 4"
          />

          {/* 50% Intermediate Ring (Neutral Orbit) */}
          <circle
            cx={cx}
            cy={cy}
            r={maxR * 0.5}
            fill="none"
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-800"
            strokeWidth="0.8"
          />

          {/* 25% Safe Core Orbit Ring */}
          <circle
            cx={cx}
            cy={cy}
            r={maxR * 0.25}
            fill="none"
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800/70"
            strokeWidth="0.75"
            strokeDasharray="2 3"
          />

          {/* Range Distance Calibration Ring Ticks */}
          {Array.from({ length: 48 }).map((_, i) => {
            const angle = (i * (360 / 48) * Math.PI) / 180;
            const isCardinal = i % 12 === 0;
            const isQuarter = i % 4 === 0;
            const tickLen = isCardinal ? 6 : isQuarter ? 4 : 2;
            const x1 = cx + (maxR - tickLen) * Math.cos(angle);
            const y1 = cy + (maxR - tickLen) * Math.sin(angle);
            const x2 = cx + maxR * Math.cos(angle);
            const y2 = cy + maxR * Math.sin(angle);

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                className={
                  isCardinal
                    ? 'text-cyan-600 dark:text-cyan-400'
                    : isQuarter
                    ? 'text-slate-400 dark:text-slate-600'
                    : 'text-slate-300 dark:text-slate-800'
                }
                strokeWidth={isCardinal ? '1.2' : '0.75'}
              />
            );
          })}

          {/* ======================================================== */}
          {/* LAYER 2: Cardinal Crosshairs & Polar Telemetry Lines     */}
          {/* ======================================================== */}
          {/* Vertical Axis (000° - 180°) with core gap */}
          <line
            x1={cx}
            y1={cy - maxR}
            x2={cx}
            y2={cy - dims.coreRadius}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-800"
            strokeWidth="0.8"
          />
          <line
            x1={cx}
            y1={cy + dims.coreRadius}
            x2={cx}
            y2={cy + maxR}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-800"
            strokeWidth="0.8"
          />

          {/* Horizontal Axis (270° - 090°) with core gap */}
          <line
            x1={cx - maxR}
            y1={cy}
            x2={cx - dims.coreRadius}
            y2={cy}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-800"
            strokeWidth="0.8"
          />
          <line
            x1={cx + dims.coreRadius}
            y1={cy}
            x2={cx + maxR}
            y2={cy}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-800"
            strokeWidth="0.8"
          />

          {/* Restrained Sector Telemetry Labels (Clean Whitespace) */}
          <g className="text-[7.5px] font-mono fill-slate-400 dark:fill-slate-500 font-semibold tracking-wider">
            <text x={cx + maxR * 0.58} y={cy - maxR * 0.58} textAnchor="middle">
              DNS
            </text>
            <text x={cx + maxR * 0.65} y={cy + maxR * 0.45} textAnchor="middle">
              SSL/TLS
            </text>
            <text x={cx - maxR * 0.45} y={cy + maxR * 0.65} textAnchor="middle">
              DOMAIN
            </text>
            <text x={cx - maxR * 0.65} y={cy - maxR * 0.35} textAnchor="middle">
              INTEL
            </text>
          </g>

          {/* ======================================================== */}
          {/* LAYER 3: Inter-Node Correlation Vector Lines             */}
          {/* ======================================================== */}
          {nodes.map((node, i) => {
            const coords = getCoordinates(node.angle, node.distance);
            const nextNode = nodes[(i + 1) % nodes.length];
            const nextCoords = nextNode ? getCoordinates(nextNode.angle, nextNode.distance) : null;
            const nodeColor = getNodeColor(node.riskLevel);

            return (
              <g key={`vector-${node.id}`}>
                {/* Ray from Center to Node */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={coords.x}
                  y2={coords.y}
                  stroke={nodeColor.stroke}
                  strokeWidth="0.6"
                  strokeDasharray="2 3"
                  opacity={node.riskLevel === 'SAFE' ? 0.2 : 0.5}
                />

                {/* Subtle Constellation Bridge between adjacent nodes */}
                {nextCoords && (
                  <line
                    x1={coords.x}
                    y1={coords.y}
                    x2={nextCoords.x}
                    y2={nextCoords.y}
                    stroke="currentColor"
                    className="text-slate-300 dark:text-slate-800/80"
                    strokeWidth="0.5"
                    strokeDasharray="2 4"
                    opacity={0.35}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* ======================================================== */}
        {/* LAYER 4: Scanning Sweep with Continuous Phosphor Decay   */}
        {/* Soft, realistic, narrow leading edge (NOT opaque triangle) */}
        {/* ======================================================== */}
        {!prefersReducedMotion && (
          <div
            className="absolute inset-0 pointer-events-none rounded-full overflow-hidden"
            style={{
              clipPath: `circle(${maxR}px at ${cx}px ${cy}px)`,
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: riskConfig.sweepDuration,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 flex items-center justify-center will-change-transform"
              style={{ transformOrigin: 'center center' }}
            >
              {/* Soft Exponential Phosphor Afterglow Trail (Only ~35° arc) */}
              <div
                className="w-1/2 h-1/2 absolute top-0 right-0 origin-bottom-left pointer-events-none"
                style={{
                  background: `conic-gradient(from 180deg at 0% 100%, transparent 0deg, transparent 55deg, ${riskConfig.trailColor} 90deg)`,
                  filter: 'blur(1px)',
                }}
              />

              {/* Narrow leading vector ray with soft tip */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-1/2 origin-bottom pointer-events-none"
                style={{
                  background: `linear-gradient(to top, transparent 20%, ${riskConfig.beamLead} 85%, #ffffff 100%)`,
                  boxShadow: `0 0 6px 1px ${riskConfig.color}`,
                  opacity: 0.85,
                }}
              >
                {/* Peripheral beam tip dot */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: '#ffffff',
                    boxShadow: `0 0 6px 1px ${riskConfig.color}`,
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}

        {/* ======================================================== */}
        {/* LAYER 5: Real Data Detection Nodes & Interactive Targets */}
        {/* ======================================================== */}
        {nodes.map((node) => {
          const coords = getCoordinates(node.angle, node.distance);
          const colors = getNodeColor(node.riskLevel);
          const isHovered = hoveredNode?.id === node.id;
          const isElevated = node.riskLevel === 'HIGH' || node.riskLevel === 'CRITICAL';

          return (
            <div
              key={node.id}
              className="absolute z-20 cursor-pointer group"
              style={{
                top: coords.y,
                left: coords.x,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => onNodeClick?.(node)}
              onMouseEnter={() => {
                if (interactive) setHoveredNode(node);
              }}
              onMouseLeave={() => {
                if (interactive) setHoveredNode(null);
              }}
              role="button"
              tabIndex={interactive ? 0 : -1}
              aria-label={`${node.label}: ${node.riskLevel} (${node.value || ''})`}
            >
              {/* Subtle expanding sonar pulse for anomalous nodes */}
              {!prefersReducedMotion && isElevated && (
                <motion.div
                  animate={{
                    scale: [1, 2.2],
                    opacity: [0.65, 0],
                  }}
                  transition={{
                    duration: 2.0,
                    repeat: Infinity,
                    ease: 'easeOut',
                    delay: (node.angle / 360) * riskConfig.sweepDuration,
                  }}
                  className="absolute -inset-1 rounded-full pointer-events-none"
                  style={{
                    border: `1.5px solid ${colors.stroke}`,
                    boxShadow: `0 0 6px ${colors.glow}`,
                  }}
                />
              )}

              {/* Physical Node Dot */}
              <div
                className={`relative rounded-full border border-white dark:border-slate-900 transition-all duration-200 flex items-center justify-center ${
                  isElevated ? 'w-3.5 h-3.5 ring-2 ring-white/30' : 'w-2.5 h-2.5'
                } ${isHovered ? 'scale-130' : ''}`}
                style={{
                  backgroundColor: colors.fill,
                  boxShadow: `0 0 8px 1px ${colors.glow}`,
                }}
              >
                <div className="w-0.5 h-0.5 rounded-full bg-white" />
              </div>

              {/* Reticle brackets for high/critical risks */}
              {isElevated && (
                <div
                  className="absolute -top-2 -left-2 w-7 h-7 border border-dashed rounded-xs pointer-events-none opacity-60"
                  style={{ borderColor: colors.stroke }}
                />
              )}

              {/* Premium Glass Tooltip on Hover */}
              {interactive && isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 pointer-events-none z-40 min-w-[190px]"
                >
                  <div className="p-2.5 rounded-xl bg-slate-950/92 text-white font-mono text-[10px] border border-slate-700/80 shadow-2xl backdrop-blur-md space-y-1">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
                      <span className="font-bold text-slate-200">{node.label}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${colors.badge}`}>
                        {node.riskLevel}
                      </span>
                    </div>
                    {node.value && (
                      <div className="text-slate-300 font-sans text-[10px] truncate max-w-[200px]">
                        {node.value}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                      <span>Vector: {node.category}</span>
                      {node.points !== undefined && (
                        <span className={node.points > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                          {node.points > 0 ? `+${node.points} pts` : '0 pts'}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}

        {/* ======================================================== */}
        {/* LAYER 6: Central Security Core (ThreatLens AI SoC)       */}
        {/* ======================================================== */}
        <div
          className={`relative z-20 flex flex-col items-center justify-center rounded-full bg-white/95 dark:bg-[#0A0E17]/95 border shadow-xl backdrop-blur-md transition-all duration-300 ${riskConfig.coreBorder}`}
          style={{
            width: dims.coreRadius * 2,
            height: dims.coreRadius * 2,
            boxShadow: `0 0 22px -3px ${riskConfig.glow}`,
          }}
        >
          {/* Subtle Breathing Core Aura */}
          {!prefersReducedMotion && (
            <motion.div
              animate={{
                scale: [1, 1.06, 1],
                opacity: [0.3, 0.65, 0.3],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: `1.2px solid ${riskConfig.color}`,
              }}
            />
          )}

          {currentScanState === 'scanning' || currentScanState === 'analyzing' ? (
            /* Active Scanner Center Spinner */
            <div className="flex flex-col items-center justify-center text-center p-1">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 rounded-full border-2 border-cyan-500 border-t-transparent mb-1"
              />
              <span className="text-[8px] font-mono uppercase text-cyan-600 dark:text-cyan-400 font-bold tracking-widest">
                SCAN
              </span>
            </div>
          ) : (
            /* Evaluated Security Verdict */
            <div className="flex flex-col items-center justify-center text-center leading-none">
              <StatusIcon
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5"
                style={{ color: riskConfig.color }}
              />
              <span className="text-base sm:text-lg font-extrabold font-mono text-slate-900 dark:text-slate-100 tracking-tight">
                {effectiveScore}
              </span>
              <span
                className="text-[7px] sm:text-[7.5px] font-mono font-bold uppercase tracking-wider mt-0.5"
                style={{ color: riskConfig.color }}
              >
                {riskConfig.level}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Target Vector Metadata Pill */}
      {showTargetVector && (
        <div
          className={`mt-2.5 px-3 py-1 rounded-full border text-[11px] font-mono font-medium flex items-center gap-1.5 shadow-xs transition-all ${riskConfig.badgeClass}`}
        >
          <StatusIcon className="w-3 h-3 shrink-0" />
          <span className="truncate max-w-[200px] sm:max-w-[240px] font-semibold">{effectiveThreatType}</span>
          <span className="text-[9px] font-mono opacity-60">RADAR</span>
        </div>
      )}
    </div>
  );
};

export default ThreatRadar;
