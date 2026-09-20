export interface ScanIndicator {
  type: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'info';
  description: string;
  scoreImpact: number;
}

export interface TechnicalSignal {
  category: string;
  key: string;
  value: string | number | boolean;
  status: 'clean' | 'suspicious' | 'malicious' | 'neutral' | 'unavailable';
  details?: string;
}

export interface RiskBreakdown {
  domainRisk: number;
  urlStructureRisk: number;
  sslRisk: number;
  reputationRisk: number;
  contentRisk: number;
  aiRisk: number;
  contributingSignals: Array<{
    category: string;
    factor: string;
    points: number;
    reason: string;
  }>;
}

export interface VisualEvidenceRegion {
  id: string;
  label: string;
  type: 'logo' | 'input' | 'alert' | 'button' | 'url' | 'chrome' | 'suspicious' | 'safe';
  box2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] percentage (0 - 100)
  description?: string;
  severity?: 'clean' | 'suspicious' | 'malicious' | 'info';
}

export interface ScreenshotCheckItem {
  name: string;
  category: string;
  status: 'CHECKED' | 'NOT_CHECKED' | 'NOT_APPLICABLE' | 'NOT_FOUND';
  details: string;
}

export type QrContentType = 'url' | 'wifi' | 'contact' | 'payment' | 'text';

export interface QrCheckItem {
  id: string;
  name: string;
  category: string;
  status: 'CHECKED' | 'NOT_CHECKED' | 'NOT_APPLICABLE';
  finding: 'clean' | 'suspicious' | 'malicious' | 'neutral';
  evidence: string;
}

export interface QrForensicDetails {
  contentType: QrContentType;
  format: string;
  decodedPayload: string;
  quishingRiskAssessed: boolean;
  urlDetails?: {
    url: string;
    protocol: string;
    domain: string;
    tld: string;
    path: string;
    ipAddress?: string;
    isIpHost: boolean;
    redirectChain?: string[];
    finalDestination?: string;
    isHttps: boolean;
  };
  wifiDetails?: {
    ssid: string;
    security: string;
    hidden: boolean;
    hasPassword: boolean;
  };
  contactDetails?: {
    name?: string;
    phone?: string;
    email?: string;
    organization?: string;
    embeddedUrl?: string;
  };
  paymentDetails?: {
    network: string;
    recipient: string;
    amount?: string;
  };
  checksPerformed: QrCheckItem[];
  confidenceMetrics: {
    aiConfidence: 'High' | 'Substantial' | 'Moderate';
    aiConfidenceScore: number;
    externalVerification: string;
    sourcesCheckedCount: number;
    limitationsNotice: string;
  };
}

export interface ScreenshotForensicDetails {
  visualIntegrity: 'clean' | 'suspicious' | 'malicious';
  brandDetected?: {
    name: string;
    isOfficialConfirmed: boolean;
    confidence: number;
    notes: string;
  };
  credentialFieldsDetected: boolean;
  credentialFieldDetails?: string[];
  urgencyOrPanicDetected: boolean;
  deceptiveElementsDetected: boolean;
  visibleUrl?: string;
  extractedOcrText?: string[];
  visualRegions?: VisualEvidenceRegion[];
  checksPerformed: ScreenshotCheckItem[];
  visualEvidenceFound: string[];
  riskEvidenceFound: string[];
  limitationsNotice: string;
}

export interface SecurityAnalysisResult {
  id: string;
  userId?: string;
  anonymousSessionId?: string;
  scanType: 'url' | 'message' | 'screenshot' | 'qr';
  target: string;
  riskScore: number; // 0 - 100
  riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  threatType: string;
  confidence: number; // 0.0 - 1.0
  summary: string;
  explanation: {
    whyDangerous: string[];
    threatMechanics: string;
  };
  indicators: ScanIndicator[];
  technicalSignals: TechnicalSignal[];
  riskBreakdown: RiskBreakdown;
  recommendations: string[];
  screenshotForensics?: ScreenshotForensicDetails;
  qrForensics?: QrForensicDetails;
  threatIntelligence?: {
    heuristicEngine?: { status: string; rulesTriggered?: string[] };
    dnsStatus?: { status: string; isResolved?: boolean; ipAddresses?: string[] };
  };
  externalReputation?: {
    threatIntelFeed?: string;
    dnsVerification?: string;
    isHeuristicOnly?: boolean;
  };
  metadata: {
    timestamp: string;
    analysisDurationMs: number;
    aiModelUsed: string;
    isAiFallback: boolean;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  normalizedEmail?: string;
  createdAt: string;
  lastLoginAt?: string;
  accountStatus?: 'active' | 'suspended' | 'pending';
  role?: string;
}

export interface AnonymousSessionInfo {
  sessionId: string;
  scanCount: number;
  remaining: number;
  hasScanned: boolean;
  scanId?: string;
}

export interface DashboardStats {
  totalScans: number;
  threatsDetected: number;
  highRiskThreats: number;
  safeScans: number;
  securityAwarenessScore: number;
  riskDistribution: {
    safe: number;
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  scansOverTime: Array<{
    date: string;
    scans: number;
    threats: number;
  }>;
  scansByType: Array<{
    type: string;
    count: number;
  }>;
  topThreatCategories: Array<{
    category: string;
    count: number;
  }>;
}
