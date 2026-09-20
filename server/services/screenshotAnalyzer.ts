import crypto from 'crypto';
import type { SecurityAnalysisResult, ScanIndicator, TechnicalSignal, ScreenshotCheckItem } from '../types.ts';
import { aiProvider } from './aiProvider.ts';
import { RiskEngine } from './riskEngine.ts';

export class ScreenshotAnalyzerService {
  public async analyze(imageBase64: string, filename?: string): Promise<SecurityAnalysisResult> {
    const startTime = Date.now();
    if (!imageBase64) {
      throw new Error('Please upload a screenshot or image file to inspect.');
    }

    let mimeType = 'image/jpeg';
    if (imageBase64.includes('image/png')) mimeType = 'image/png';
    else if (imageBase64.includes('image/webp')) mimeType = 'image/webp';
    else if (imageBase64.includes('image/svg+xml')) mimeType = 'image/svg+xml';

    const aiOutput = await aiProvider.analyzeScreenshot(imageBase64, mimeType, filename || '');
    const forensics = aiOutput.screenshotForensics;

    // Detect if this is a verified clean / benign image
    const hasRiskEvidence = Boolean(forensics?.riskEvidenceFound && forensics.riskEvidenceFound.length > 0);
    const hasCredentialFields = Boolean(forensics?.credentialFieldsDetected);
    const hasUrgency = Boolean(forensics?.urgencyOrPanicDetected);
    const hasDeceptiveElements = Boolean(forensics?.deceptiveElementsDetected);

    const isExplicitlyClean = aiOutput.riskLevel === 'SAFE' || (!hasRiskEvidence && !hasCredentialFields && !hasUrgency && !hasDeceptiveElements);

    let finalThreatType = aiOutput.threatType;
    let finalRiskLevel = isExplicitlyClean ? 'SAFE' : aiOutput.riskLevel;
    let contentRisk = 0;
    let aiRisk = 0;

    const contributingSignals: Array<{
      category: string;
      factor: string;
      points: number;
      reason: string;
    }> = [];

    if (isExplicitlyClean) {
      finalRiskLevel = 'SAFE';
      finalThreatType = 'Legitimate / Benign Interface';
      contentRisk = 0;
      aiRisk = Math.min(4, Math.max(0, aiOutput.aiScoreWeight));
      contributingSignals.push({
        category: 'Visual Forensics',
        factor: 'Benign UI Verification',
        points: aiRisk,
        reason: 'Conforms to benign interface architecture without deceptive overlays or credential harvesting forms'
      });
    } else if (finalRiskLevel === 'LOW') {
      contentRisk = 5;
      aiRisk = Math.min(10, Math.max(5, aiOutput.aiScoreWeight));
      contributingSignals.push({
        category: 'Visual Forensics',
        factor: 'Minor Visual Anomaly',
        points: contentRisk + aiRisk,
        reason: 'Interface requires general awareness but shows no confirmed credential theft vectors'
      });
    } else if (finalRiskLevel === 'MEDIUM') {
      contentRisk = 18;
      aiRisk = 22;
      contributingSignals.push({
        category: 'Authentication Forensics',
        factor: 'Unverified Login Fields',
        points: 40,
        reason: 'Authentication form detected on unverified image canvas without host domain verification'
      });
    } else if (finalRiskLevel === 'HIGH') {
      contentRisk = 35;
      aiRisk = 35;
      contributingSignals.push({
        category: 'Brand & Credential Spoofing',
        factor: 'Phishing Authentication Indicators',
        points: 70,
        reason: 'Brand trademarks paired with urgent credential solicitation or deceptive layout vectors'
      });
    } else {
      // CRITICAL
      contentRisk = 45;
      aiRisk = 45;
      contributingSignals.push({
        category: 'Scareware & Social Engineering',
        factor: 'Coercive Fake Security Dialog',
        points: 90,
        reason: 'Simulated malware warnings or fake system alerts prompting urgent call-to-action'
      });
    }

    const calculatedRisk = RiskEngine.calculate({
      domainRisk: 0,
      urlStructureRisk: 0,
      sslRisk: 0,
      reputationRisk: 0,
      contentRisk,
      aiRisk,
      contributingSignals
    });

    // Enforce strict score consistency
    let finalScore = calculatedRisk.score;
    if (isExplicitlyClean) {
      finalScore = Math.min(10, finalScore);
      finalRiskLevel = 'SAFE';
    }

    // Build evidence-based indicators
    let indicators: ScanIndicator[] = [];
    if (isExplicitlyClean) {
      indicators = [
        {
          type: 'visual',
          name: 'Benign Visual Structure',
          severity: 'info',
          description: 'Standard UI components and clean visual hierarchy detected without malicious overlays',
          scoreImpact: 0
        },
        {
          type: 'credential',
          name: 'No Credential Harvesting Forms',
          severity: 'info',
          description: 'No unverified password, PIN, or payment collection fields identified in image',
          scoreImpact: 0
        },
        {
          type: 'social_engineering',
          name: 'No Coercive Urgency Triggers',
          severity: 'info',
          description: 'Zero countdown threats, fake virus alerts, or coercive scareware banners found',
          scoreImpact: 0
        }
      ];
    } else {
      indicators = aiOutput.indicators.length > 0 ? aiOutput.indicators : [
        {
          type: 'visual',
          name: finalRiskLevel === 'CRITICAL' ? 'Coercive Security Alert Dialog' : 'Unverified Authentication Layout',
          severity: finalRiskLevel === 'CRITICAL' ? 'critical' : finalRiskLevel === 'HIGH' ? 'high' : 'medium',
          description: aiOutput.summary,
          scoreImpact: finalScore
        }
      ];
    }

    // Build comprehensive checks performed checklist
    const checksPerformed: ScreenshotCheckItem[] = [
      {
        name: 'Visual Layout & Hierarchy',
        category: 'Visual Structure',
        status: 'CHECKED',
        details: isExplicitlyClean
          ? 'Conforms to standard UI layout without disguised elements'
          : 'Detected abnormal visual structure or deceptive overlay'
      },
      {
        name: 'Visible Text & Semantic OCR',
        category: 'Content Analysis',
        status: 'CHECKED',
        details: forensics?.extractedOcrText && forensics.extractedOcrText.length > 0
          ? `Extracted ${forensics.extractedOcrText.length} text blocks for coercive language inspection`
          : 'Scanned semantic strings for urgency triggers and fraud keywords'
      },
      {
        name: 'Brand & Identity Recognition',
        category: 'Identity Forensics',
        status: 'CHECKED',
        details: forensics?.brandDetected?.name
          ? `Detected ${forensics.brandDetected.name} brand markers (origin unverified via pixels alone)`
          : 'No recognized corporate brand emblems detected'
      },
      {
        name: 'Credential Form Inspection',
        category: 'Authentication',
        status: 'CHECKED',
        details: hasCredentialFields
          ? `Identified credential fields: ${forensics?.credentialFieldDetails?.join(', ') || 'Password/Username'}`
          : 'Zero unverified credential, PIN, or password collection fields detected'
      },
      {
        name: 'Social Engineering & Urgency Prompts',
        category: 'Psychological Vectors',
        status: 'CHECKED',
        details: hasUrgency
          ? 'Detected panic or countdown pressure tactics'
          : 'Zero coercive panic vectors or scareware prompts found'
      },
      {
        name: 'Deceptive Overlays & Fake Chrome',
        category: 'Interface Deception',
        status: 'CHECKED',
        details: hasDeceptiveElements
          ? 'Detected simulated OS or browser dialog overlay'
          : 'No deceptive modal dialogs or fake browser bars detected'
      },
      {
        name: 'Visible URL / Address Bar Extraction',
        category: 'Network Target',
        status: forensics?.visibleUrl ? 'CHECKED' : 'NOT_FOUND',
        details: forensics?.visibleUrl
          ? `Extracted visible address: ${forensics.visibleUrl}`
          : 'No visible HTTP/HTTPS address bar or domain URL located in image'
      },
      {
        name: 'Live Domain Reputation Check',
        category: 'External Threat Intel',
        status: 'NOT_CHECKED',
        details: 'Screenshot analysis inspects pixels only; live threat intel feeds not queried for image file'
      },
      {
        name: 'Authoritative DNS Resolution',
        category: 'Infrastructure',
        status: 'NOT_CHECKED',
        details: 'Static raster image cannot query remote nameservers or resolve A-records'
      },
      {
        name: 'SSL/TLS Cryptographic Validation',
        category: 'Encryption',
        status: 'NOT_CHECKED',
        details: 'No TLS handshake or certificate chain verification performed on rasterized image data'
      },
      {
        name: 'Live Backend Exfiltration Verification',
        category: 'Runtime Dynamics',
        status: 'NOT_CHECKED',
        details: 'Form submission endpoints cannot be captured without active browser sandbox execution'
      }
    ];

    // Build technical signals table with truthful statuses
    const technicalSignals: TechnicalSignal[] = [
      {
        category: 'Image Forensics',
        key: 'File Format',
        value: mimeType.split('/')[1]?.toUpperCase() || 'PNG',
        status: 'clean',
        details: filename || 'Uploaded image artifact'
      },
      {
        category: 'Image Forensics',
        key: 'Vision OCR Engine',
        value: aiOutput.modelUsed,
        status: 'clean',
        details: aiOutput.isFallback ? 'Heuristic vision rulebook' : 'Multimodal neural inspection'
      },
      {
        category: 'Visual Integrity',
        key: 'UI Structure',
        value: isExplicitlyClean ? 'Benign Interface' : hasDeceptiveElements ? 'Simulated Dialog / Overlay' : 'Unverified Layout',
        status: isExplicitlyClean ? 'clean' : hasDeceptiveElements ? 'malicious' : 'suspicious',
        details: isExplicitlyClean ? 'No disguised elements' : 'Visual hierarchy flagged for review'
      },
      {
        category: 'Brand Recognition',
        key: 'Detected Brand Entity',
        value: forensics?.brandDetected?.name ? `${forensics.brandDetected.name} (Visual only)` : 'None / Generic',
        status: isExplicitlyClean ? 'clean' : hasRiskEvidence ? 'suspicious' : 'neutral',
        details: forensics?.brandDetected?.notes || 'Image capture alone cannot verify authentic host ownership'
      },
      {
        category: 'Authentication',
        key: 'Credential Fields',
        value: hasCredentialFields ? (forensics?.credentialFieldDetails?.join(', ') || 'Present') : 'None Detected',
        status: hasCredentialFields ? 'suspicious' : 'clean',
        details: hasCredentialFields ? 'Sensitive input collection' : 'Zero password/PIN inputs'
      },
      {
        category: 'Social Engineering',
        key: 'Panic / Urgency Triggers',
        value: hasUrgency ? 'Detected' : 'None Detected',
        status: hasUrgency ? 'malicious' : 'clean',
        details: hasUrgency ? 'Coercive psychological pressure' : 'Standard communication timeline'
      },
      {
        category: 'Network Destination',
        key: 'Visible Address Bar URL',
        value: forensics?.visibleUrl || 'Not Visible in Image',
        status: forensics?.visibleUrl ? 'clean' : 'unavailable',
        details: forensics?.visibleUrl ? 'Extracted from image pixels' : 'Address bar not visible in screenshot'
      },
      {
        category: 'External Intelligence',
        key: 'Domain Reputation Feed',
        value: 'Not Checked (Image Only)',
        status: 'unavailable',
        details: 'External blocklists not queried for static screenshot file'
      },
      {
        category: 'Infrastructure',
        key: 'DNS & TLS Handshake',
        value: 'Not Checked (Image Only)',
        status: 'unavailable',
        details: 'No network handshake or cryptographic certificate verification'
      }
    ];

    const duration = Date.now() - startTime;

    return {
      id: `scan-ss-${crypto.randomUUID().slice(0, 8)}`,
      scanType: 'screenshot',
      target: filename ? `Screenshot: ${filename}` : 'Uploaded Webpage Screenshot',
      riskScore: finalScore,
      riskLevel: finalRiskLevel,
      threatType: finalThreatType,
      confidence: aiOutput.confidence,
      summary: aiOutput.summary,
      explanation: {
        whyDangerous: isExplicitlyClean
          ? [
              'Visual structure conforms to standard benign software interface design principles',
              'Zero fraudulent credential harvesting fields, fake virus warnings, or deceptive overlays detected',
              'No coercive urgency prompts, countdown clocks, or scareware triggers present in capture'
            ]
          : (aiOutput.whyDangerous.length > 0 ? aiOutput.whyDangerous : ['Visual indicators match deceptive interface patterns']),
        threatMechanics: aiOutput.threatMechanics
      },
      indicators,
      technicalSignals,
      riskBreakdown: calculatedRisk.breakdown,
      recommendations: aiOutput.recommendations,
      screenshotForensics: {
        visualIntegrity: isExplicitlyClean ? 'clean' : hasDeceptiveElements ? 'malicious' : 'suspicious',
        brandDetected: forensics?.brandDetected,
        credentialFieldsDetected: hasCredentialFields,
        credentialFieldDetails: forensics?.credentialFieldDetails,
        urgencyOrPanicDetected: hasUrgency,
        deceptiveElementsDetected: hasDeceptiveElements,
        visibleUrl: forensics?.visibleUrl,
        extractedOcrText: forensics?.extractedOcrText,
        visualRegions: forensics?.visualRegions,
        checksPerformed,
        visualEvidenceFound: forensics?.visualEvidenceFound || (isExplicitlyClean ? ['Standard UI Layout', 'Browser Window Structure', 'Clean Content Hierarchy'] : []),
        riskEvidenceFound: isExplicitlyClean ? [] : (forensics?.riskEvidenceFound || []),
        limitationsNotice: 'Screenshot analysis inspects visible pixels and UI structure. It cannot independently verify live domain reputation, authoritative DNS, TLS certificates, or backend data exfiltration unless external threat intelligence is connected.'
      },
      threatIntelligence: {
        heuristicEngine: {
          status: 'Visual OCR & Brand Geometry Forensics Active',
          rulesTriggered: indicators.map(i => i.name)
        }
      },
      externalReputation: {
        threatIntelFeed: 'Visual artifact analysis only',
        dnsVerification: 'N/A (Image capture)',
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

export const screenshotAnalyzer = new ScreenshotAnalyzerService();

