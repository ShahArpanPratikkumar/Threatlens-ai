import { URL } from 'url';
import crypto from 'crypto';
import dns from 'dns/promises';
import type { SecurityAnalysisResult, ScanIndicator, TechnicalSignal } from '../types.ts';
import { threatIntel } from './threatIntelligence.ts';
import { aiProvider } from './aiProvider.ts';
import { RiskEngine } from './riskEngine.ts';

const HIGH_RISK_TLDS = new Set([
  'top', 'xyz', 'click', 'work', 'fit', 'gq', 'cf', 'ml', 'pw', 'ru', 'cn', 'country', 'rest', 'surf', 'loan', 'tokyo'
]);

const BRAND_KEYWORDS = [
  'paypal', 'apple', 'google', 'microsoft', 'netflix', 'amazon', 'wellsfargo', 'chase',
  'bankofamerica', 'citibank', 'facebook', 'instagram', 'whatsapp', 'binance', 'coinbase',
  'metamask', 'dhl', 'fedex', 'usps'
];

const SUSPICIOUS_AUTH_KEYWORDS = [
  'login', 'signin', 'sign-in', 'log-in', 'verify', 'verification', 'update', 'account',
  'security', 'banking', 'secure', 'wallet', 'recovery', 'confirm', 'credential', 'auth',
  'authorize', 'password', 'token', 'billing', 'invoice', 'unlock', 'support', 'helpdesk'
];

export class UrlAnalyzerService {
  public async analyze(rawUrl: string): Promise<SecurityAnalysisResult> {
    const startTime = Date.now();
    let normalized = rawUrl.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = 'https://' + normalized;
    }

    let parsed: URL;
    try {
      parsed = new URL(normalized);
    } catch {
      throw new Error('Invalid URL format. Please provide a valid web address.');
    }

    const indicators: ScanIndicator[] = [];
    const technicalSignals: TechnicalSignal[] = [];
    const contributingSignals: Array<{ category: string; factor: string; points: number; reason: string }> = [];

    let domainRisk = 0;
    let urlStructureRisk = 0;
    let sslRisk = 0;
    let contentRisk = 0;

    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();
    const fullUrl = parsed.toString().toLowerCase();

    // 1. PROTOCOL & SSL ANALYSIS
    const isHttps = parsed.protocol === 'https:';
    if (!isHttps) {
      sslRisk += 25;
      indicators.push({
        type: 'ssl',
        name: 'Insecure Protocol (HTTP)',
        severity: 'high',
        description: 'Connection is unencrypted. Traffic and credentials can be intercepted via MitM attacks.',
        scoreImpact: 25
      });
      technicalSignals.push({
        category: 'Protocol',
        key: 'Encryption',
        value: 'HTTP (Plain Text)',
        status: 'malicious',
        details: 'No Transport Layer Security (TLS) detected'
      });
      contributingSignals.push({
        category: 'SSL Risk',
        factor: 'Plaintext Protocol',
        points: 25,
        reason: 'HTTP leaves all entered credentials visible to intermediate proxies'
      });
    } else {
      technicalSignals.push({
        category: 'Protocol',
        key: 'Encryption',
        value: 'HTTPS (TLS Active)',
        status: 'clean',
        details: 'Traffic is cryptographically encrypted'
      });
    }

    // 2. IP ADDRESS HOSTNAME CHECK
    const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.startsWith('[');
    if (isIpHost) {
      domainRisk += 30;
      indicators.push({
        type: 'domain',
        name: 'IP Address as Hostname',
        severity: 'critical',
        description: 'URL accesses a raw IP address directly, bypassing standard DNS reputation registries.',
        scoreImpact: 30
      });
      technicalSignals.push({
        category: 'Host',
        key: 'Host Type',
        value: 'Raw IP Address',
        status: 'malicious',
        details: 'Direct server IP instead of domain name'
      });
      contributingSignals.push({
        category: 'Domain Risk',
        factor: 'Raw IP Host',
        points: 30,
        reason: 'Legitimate consumer services virtually never authenticate users over raw IP addresses'
      });
    } else {
      technicalSignals.push({
        category: 'Host',
        key: 'Host Type',
        value: 'Standard Domain Name',
        status: 'clean',
        details: hostname
      });
    }

    // 3. PUNYCODE / IDN HOMOGRAPH ATTACK CHECK
    const isPunycode = hostname.includes('xn--');
    if (isPunycode) {
      domainRisk += 35;
      indicators.push({
        type: 'domain',
        name: 'Punycode / Homograph Detected',
        severity: 'critical',
        description: 'Contains internationalized Cyrillic/Greek characters mimicking standard Latin characters (homoglyph attack).',
        scoreImpact: 35
      });
      technicalSignals.push({
        category: 'Domain',
        key: 'Encoding',
        value: 'Punycode (xn--)',
        status: 'malicious',
        details: 'Potential visual spoofing of character sets'
      });
      contributingSignals.push({
        category: 'Domain Risk',
        factor: 'Homoglyph Deception',
        points: 35,
        reason: 'Punycode encoding is heavily exploited in targeted spoofing of trusted domains'
      });
    }

    // 4. TLD RISK ASSESSMENT
    const domainParts = hostname.split('.');
    const tld = domainParts.length > 1 ? domainParts[domainParts.length - 1] : '';
    if (HIGH_RISK_TLDS.has(tld)) {
      domainRisk += 20;
      indicators.push({
        type: 'domain',
        name: `High-Abuse TLD (.${tld})`,
        severity: 'medium',
        description: `.${tld} is historically associated with cheap registrars and disposable phishing domains.`,
        scoreImpact: 20
      });
      technicalSignals.push({
        category: 'TLD',
        key: 'Top-Level Domain',
        value: `.${tld}`,
        status: 'suspicious',
        details: 'Elevated abuse statistics'
      });
      contributingSignals.push({
        category: 'Domain Risk',
        factor: 'Suspicious TLD',
        points: 20,
        reason: `Statistically high rate of malicious activity reported on .${tld}`
      });
    } else {
      technicalSignals.push({
        category: 'TLD',
        key: 'Top-Level Domain',
        value: `.${tld || 'unknown'}`,
        status: 'clean',
        details: 'Standard registry zone'
      });
    }

    // 5. SUBDOMAIN DEPTH & BRAND SPOOFING
    const subdomains = domainParts.slice(0, Math.max(0, domainParts.length - 2));
    if (subdomains.length >= 3) {
      urlStructureRisk += 20;
      indicators.push({
        type: 'structure',
        name: 'Excessive Subdomain Nesting',
        severity: 'high',
        description: `Detected ${subdomains.length} subdomain tiers (${subdomains.join('.')}) designed to obscure the true root domain.`,
        scoreImpact: 20
      });
      technicalSignals.push({
        category: 'Subdomains',
        key: 'Subdomain Depth',
        value: subdomains.length,
        status: 'suspicious',
        details: subdomains.join('.')
      });
      contributingSignals.push({
        category: 'URL Structure',
        factor: 'Subdomain Obfuscation',
        points: 20,
        reason: 'Multiple subdomain tiers frequently used to hide malicious apex server'
      });
    }

    // Check brand keywords in subdomains or path vs root domain
    const rootDomain = domainParts.slice(-2).join('.');
    for (const brand of BRAND_KEYWORDS) {
      if (hostname.includes(brand) && !rootDomain.includes(brand)) {
        domainRisk += 35;
        indicators.push({
          type: 'brand',
          name: `Brand Impersonation (${brand.toUpperCase()})`,
          severity: 'critical',
          description: `The brand "${brand}" appears in the subdomain or path, but the actual hosting domain is "${rootDomain}".`,
          scoreImpact: 35
        });
        technicalSignals.push({
          category: 'Brand',
          key: 'Impersonation Target',
          value: brand.toUpperCase(),
          status: 'malicious',
          details: `Target placed outside authoritative domain ${rootDomain}`
        });
        contributingSignals.push({
          category: 'Domain Risk',
          factor: 'Brand Spoofing',
          points: 35,
          reason: `Misleading brand label intended to deceive users into trusting fraudulent origin`
        });
        break;
      }
    }

    // 6. SUSPICIOUS AUTHENTICATION KEYWORDS
    const foundAuthKeywords = SUSPICIOUS_AUTH_KEYWORDS.filter(kw => fullUrl.includes(kw));
    if (foundAuthKeywords.length >= 2) {
      contentRisk += 20;
      indicators.push({
        type: 'keywords',
        name: 'High-Density Credential Keywords',
        severity: 'high',
        description: `Found sensitive authentication endpoints: [${foundAuthKeywords.slice(0, 4).join(', ')}].`,
        scoreImpact: 20
      });
      technicalSignals.push({
        category: 'Keywords',
        key: 'Auth Signals',
        value: foundAuthKeywords.slice(0, 3).join(', '),
        status: 'suspicious',
        details: 'Authentication-related query or path strings'
      });
      contributingSignals.push({
        category: 'Content Risk',
        factor: 'Credential Keywords',
        points: 20,
        reason: 'High density of login and verification parameters on non-official host'
      });
    }

    // 7. SUSPICIOUS REDIRECTS & CHARACTERS
    if (fullUrl.includes('@')) {
      urlStructureRisk += 25;
      indicators.push({
        type: 'structure',
        name: 'URL Userinfo Deception (@)',
        severity: 'critical',
        description: 'Uses "@" in the URL authority section to deceive the browser into displaying a fake prefix.',
        scoreImpact: 25
      });
      contributingSignals.push({
        category: 'URL Structure',
        factor: 'Authority Spoofing (@)',
        points: 25,
        reason: 'Browser will ignore text prior to "@" and route to malicious suffix'
      });
    }

    const hasRedirectParam = /[?&](redirect|url|next|goto|r|dest)=/i.test(parsed.search);
    if (hasRedirectParam) {
      urlStructureRisk += 15;
      indicators.push({
        type: 'redirect',
        name: 'Open Redirect Parameter',
        severity: 'medium',
        description: 'Contains redirect query parameters that may forward the user to an unvetted secondary location.',
        scoreImpact: 15
      });
      technicalSignals.push({
        category: 'Routing',
        key: 'Redirect Vector',
        value: 'Detected in query string',
        status: 'suspicious',
        details: 'Possible open redirect payload'
      });
    }

    // URL Length check
    if (normalized.length > 120) {
      urlStructureRisk += 10;
      technicalSignals.push({
        category: 'Structure',
        key: 'URL Length',
        value: `${normalized.length} characters`,
        status: 'suspicious',
        details: 'Long URL with potential obfuscation payloads'
      });
    }

    // 7b. REAL DNS RESOLUTION CHECK
    let resolvedIps: string[] = [];
    try {
      if (!isIpHost) {
        const lookupResult = await Promise.race([
          dns.resolve4(hostname),
          new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
        ]);
        resolvedIps = lookupResult;
        technicalSignals.push({
          category: 'DNS',
          key: 'A Records',
          value: resolvedIps.slice(0, 3).join(', '),
          status: 'clean',
          details: `Resolved to ${resolvedIps.length} active IP address(es)`
        });
      }
    } catch {
      // Either non-existent domain, NXDOMAIN, or offline
      technicalSignals.push({
        category: 'DNS',
        key: 'Domain Resolution',
        value: 'NXDOMAIN / Unresolved',
        status: 'suspicious',
        details: 'Domain did not resolve to public IP addresses or timed out'
      });
      domainRisk += 15;
      indicators.push({
        type: 'domain',
        name: 'Unresolvable Host / NXDOMAIN',
        severity: 'medium',
        description: 'The domain name currently has no active DNS A-records or failed resolution.',
        scoreImpact: 15
      });
    }

    // 8. AUTONOMOUS THREAT INTELLIGENCE (Heuristic Engine & Host Resolution)
    const intel = await threatIntel.checkUrl(normalized);
    for (const signal of intel.signals) {
      contributingSignals.push(signal);
    }
    const reputationRisk = intel.scoreBonus;

    technicalSignals.push({
      category: 'Threat Intel',
      key: 'Autonomous Heuristics',
      value: intel.heuristicEngine.status,
      status: intel.heuristicEngine.rulesTriggered.length > 0 ? 'malicious' : 'clean',
      details: intel.heuristicEngine.rulesTriggered.length > 0
        ? `Triggered: ${intel.heuristicEngine.rulesTriggered.join(' • ')}`
        : 'Zero anomalous behavioral patterns detected'
    });

    technicalSignals.push({
      category: 'Threat Intel',
      key: 'Host Telemetry & DNS',
      value: intel.dnsStatus.status,
      status: intel.dnsStatus.isResolved ? 'clean' : 'suspicious',
      details: intel.dnsStatus.isResolved ? 'Active authoritative internet infrastructure' : 'DNS lookup timed out or returned NXDOMAIN'
    });

    // 9. AI ANALYSIS (Gemini with Heuristic Fallback)
    const heuristicContext = `
- Domain: ${hostname}
- Protocol: ${parsed.protocol}
- TLD: .${tld}
- Flagged indicators: ${indicators.map(i => i.name).join(', ') || 'None'}
- Suspicious Keywords: ${foundAuthKeywords.join(', ') || 'None'}
- IP Host: ${isIpHost}
- Punycode: ${isPunycode}
    `;

    const aiOutput = await aiProvider.analyzeUrl(normalized, heuristicContext);

    // Merge AI indicators
    for (const aiInd of aiOutput.indicators) {
      if (!indicators.some(i => i.name.toLowerCase() === aiInd.name.toLowerCase())) {
        indicators.push(aiInd);
      }
    }

    // Merge AI technical signals
    for (const tech of aiOutput.technicalAnalysis) {
      technicalSignals.push(tech);
    }

    if (aiOutput.aiScoreWeight > 0) {
      contributingSignals.push({
        category: 'AI Classification',
        factor: 'Machine Learning Confidence',
        points: aiOutput.aiScoreWeight,
        reason: `${aiOutput.modelUsed} identified behavioral signatures of ${aiOutput.threatType}`
      });
    }

    // 10. FINAL RISK SCORE COMPUTATION
    const finalScore = RiskEngine.calculate({
      domainRisk,
      urlStructureRisk,
      sslRisk,
      reputationRisk,
      contentRisk,
      aiRisk: aiOutput.aiScoreWeight,
      contributingSignals
    });

    const duration = Date.now() - startTime;

    return {
      id: `scan-${crypto.randomUUID().slice(0, 8)}`,
      scanType: 'url',
      target: normalized,
      riskScore: finalScore.score,
      riskLevel: finalScore.level,
      threatType: aiOutput.threatType || (finalScore.score > 60 ? 'Credential Phishing' : 'Legitimate Webpage'),
      confidence: aiOutput.confidence,
      summary: aiOutput.summary,
      explanation: {
        whyDangerous: aiOutput.whyDangerous.length > 0 ? aiOutput.whyDangerous : [
          finalScore.level === 'SAFE' ? 'Domain displays standard authentic indicators' : 'Anomalous domain or protocol traits detected'
        ],
        threatMechanics: aiOutput.threatMechanics
      },
      indicators,
      technicalSignals,
      riskBreakdown: finalScore.breakdown,
      recommendations: aiOutput.recommendations,
      threatIntelligence: {
        heuristicEngine: intel.heuristicEngine,
        dnsStatus: intel.dnsStatus
      },
      externalReputation: {
        threatIntelFeed: intel.heuristicEngine.status,
        dnsVerification: intel.dnsStatus.status,
        isHeuristicOnly: false
      },
      metadata: {
        timestamp: new Date().toISOString(),
        analysisDurationMs: duration,
        aiModelUsed: aiOutput.modelUsed,
        isAiFallback: aiOutput.isFallback
      }
    };
  }
}

export const urlAnalyzer = new UrlAnalyzerService();
