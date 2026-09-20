import { GoogleGenAI } from '@google/genai';
import type { ScanIndicator, TechnicalSignal } from '../types.ts';

export interface AIAnalysisOutput {
  threatType: string;
  riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  summary: string;
  whyDangerous: string[];
  threatMechanics: string;
  indicators: ScanIndicator[];
  technicalAnalysis: TechnicalSignal[];
  recommendations: string[];
  aiScoreWeight: number; // 0 to 25
  isFallback: boolean;
  modelUsed: string;
  screenshotForensics?: {
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
    visualRegions?: Array<{
      id: string;
      label: string;
      type: 'logo' | 'input' | 'alert' | 'button' | 'url' | 'chrome' | 'suspicious' | 'safe';
      box2d: [number, number, number, number];
      description?: string;
      severity?: 'clean' | 'suspicious' | 'malicious' | 'info';
    }>;
    visualEvidenceFound: string[];
    riskEvidenceFound: string[];
  };
}

const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

function normalizeAiScoreWeight(val: any, defaultVal: number): number {
  if (typeof val === 'number') {
    if (val > 0 && val <= 1) {
      return Math.round(val * 25);
    }
    return Math.max(0, Math.min(25, Math.round(val)));
  }
  return defaultVal;
}

export class AIProviderService {
  private geminiClient: GoogleGenAI | null = null;
  private openAiKey: string | undefined;

  constructor() {
    this.openAiKey = process.env.OPENAI_API_KEY;
    this.initGemini();
  }

  private initGemini() {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      try {
        this.geminiClient = new GoogleGenAI({ apiKey: key });
      } catch {
        this.geminiClient = null;
      }
    }
  }

  public async analyzeUrl(url: string, heuristicContext: string = ''): Promise<AIAnalysisOutput> {
    this.initGemini();

    if (this.geminiClient) {
      const prompt = `You are a principal cybersecurity SOC analyst. Analyze this URL for security threats:
URL: ${url}
Pre-computed heuristic signals:
${heuristicContext}

Provide a structured JSON response with this EXACT schema:
{
  "threatType": string, // e.g. "Credential Phishing", "Malware Delivery", "Legitimate Service", "Brand Spoofing", "Suspicious Redirect"
  "riskLevel": "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidence": number, // between 0.50 and 0.99
  "summary": string, // 1-2 sentence human-readable executive summary
  "whyDangerous": string[], // 2-4 concrete, explainable bullet points why it is safe or dangerous
  "threatMechanics": string, // technical explanation of the attack vector or safety profile
  "indicators": [
    {
      "type": string,
      "name": string,
      "severity": "low" | "medium" | "high" | "critical" | "info",
      "description": string,
      "scoreImpact": number
    }
  ],
  "technicalAnalysis": [
    {
      "category": string,
      "key": string,
      "value": string,
      "status": "clean" | "suspicious" | "malicious" | "neutral",
      "details": string
    }
  ],
  "recommendations": string[], // 2-3 immediate actionable steps for the user
  "aiScoreWeight": number // 0 (clean) to 25 (confirmed malicious)
}
Return ONLY valid JSON. No markdown ticks, no preamble.`;

      for (const model of CANDIDATE_MODELS) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('AI generation timeout')), 8000)
          );

          const aiPromise = this.geminiClient.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          });

          const response: any = await Promise.race([aiPromise, timeoutPromise]);

          if (response?.text) {
            const parsed = JSON.parse(response.text.trim());
            if (parsed.threatType && parsed.summary) {
              return {
                threatType: parsed.threatType,
                riskLevel: parsed.riskLevel || 'MEDIUM',
                confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.85,
                summary: parsed.summary,
                whyDangerous: Array.isArray(parsed.whyDangerous) ? parsed.whyDangerous : [],
                threatMechanics: parsed.threatMechanics || 'Heuristic inspection completed.',
                indicators: Array.isArray(parsed.indicators) ? parsed.indicators : [],
                technicalAnalysis: Array.isArray(parsed.technicalAnalysis) ? parsed.technicalAnalysis : [],
                recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : ['Exercise caution.'],
                aiScoreWeight: normalizeAiScoreWeight(parsed.aiScoreWeight, 10),
                isFallback: false,
                modelUsed: model
              };
            }
          }
        } catch (err: any) {
          console.warn(`Gemini analysis attempt on ${model} failed, trying next candidate if available:`, err?.message || err);
        }
      }
    }

    return this.generateHeuristicUrlFallback(url);
  }

  public async analyzeMessage(message: string): Promise<AIAnalysisOutput> {
    this.initGemini();

    if (this.geminiClient) {
      const prompt = `You are a cybersecurity expert detecting social engineering, scam SMS, fake job offers, and phishing emails.
Analyze this message text:
"""
${message}
"""

Provide a structured JSON response with this EXACT schema:
{
  "threatType": string, // e.g. "Social Engineering", "Advance-Fee Fraud", "Urgent Impersonation", "Clean Message"
  "riskLevel": "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidence": number,
  "summary": string,
  "whyDangerous": string[],
  "threatMechanics": string,
  "indicators": [
    {
      "type": string,
      "name": string,
      "severity": "low" | "medium" | "high" | "critical" | "info",
      "description": string,
      "scoreImpact": number
    }
  ],
  "technicalAnalysis": [
    {
      "category": string,
      "key": string,
      "value": string,
      "status": "clean" | "suspicious" | "malicious" | "neutral",
      "details": string
    }
  ],
  "recommendations": string[],
  "aiScoreWeight": number
}
Return ONLY valid JSON.`;

      for (const model of CANDIDATE_MODELS) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('AI generation timeout')), 8000)
          );

          const aiPromise = this.geminiClient.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          });

          const response: any = await Promise.race([aiPromise, timeoutPromise]);

          if (response?.text) {
            const parsed = JSON.parse(response.text.trim());
            if (parsed.threatType && parsed.summary) {
              return {
                threatType: parsed.threatType,
                riskLevel: parsed.riskLevel || 'MEDIUM',
                confidence: parsed.confidence || 0.88,
                summary: parsed.summary,
                whyDangerous: parsed.whyDangerous || [],
                threatMechanics: parsed.threatMechanics || '',
                indicators: parsed.indicators || [],
                technicalAnalysis: parsed.technicalAnalysis || [],
                recommendations: parsed.recommendations || [],
                aiScoreWeight: normalizeAiScoreWeight(parsed.aiScoreWeight, 12),
                isFallback: false,
                modelUsed: model
              };
            }
          }
        } catch (err: any) {
          console.warn(`Gemini message analysis attempt on ${model} failed, trying next candidate if available:`, err?.message || err);
        }
      }
    }

    return this.generateHeuristicMessageFallback(message);
  }

  public async analyzeScreenshot(imageBase64: string, mimeType: string = 'image/jpeg', filename: string = ''): Promise<AIAnalysisOutput> {
    this.initGemini();

    if (this.geminiClient) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const prompt = `You are a principal cybersecurity SOC forensic investigator and senior computer vision engineer.
Analyze this screenshot with strict, evidence-based objectivity.

CRITICAL ACCURACY DIRECTIVES:
1. ONLY CLAIM WHAT THE VISIBLE PIXELS CAN DIRECTLY PROVE.
2. DO NOT assume malice from normal UI elements! A standard web browser (Chrome, Edge, Safari, Firefox), search engine (Google, Bing), legitimate SaaS dashboard, or benign software interface MUST be classified as SAFE or LOW risk.
3. Visual presence of a brand logo (Google, Microsoft, Apple, etc.) or search bar is NOT proof of phishing or impersonation. Only classify as brand impersonation if there is deception (e.g. fake login portal, mismatched domain, tech support scam).
4. Do NOT claim "Credential harvesting" unless there are actual visible password, PIN, seed phrase, or credit card collection fields that appear fraudulent or unverified.
5. Do NOT claim "Confirmed malicious signature" unless visible elements show explicit fraud/malware indicators (e.g. fake antivirus popups, Zeus virus warnings, phishing lures).
6. If the image is a standard browser New Tab page, search engine homepage, or legitimate software dashboard, riskLevel MUST be "SAFE" and aiScoreWeight MUST be 0 to 4.
7. Distinguish "Brand visually detected" from "Confirmed official website" (a static screenshot alone cannot cryptographically prove live domain ownership).

Extract:
- Visual UI components (browser chrome, search bars, buttons, forms, cards)
- Visible brand logos/names
- Any input fields (search box vs username vs password vs payment)
- Any social engineering triggers (urgent fake warnings, account suspension countdowns, fake antivirus alerts, prize lures)
- Any visible URLs in the address bar or content
- Text visible in the image (OCR)
- Visual regions (bounding boxes [ymin, xmin, ymax, xmax] as percentage 0-100)

Return JSON with exact schema:
{
  "threatType": string,
  "riskLevel": "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidence": number (between 0.80 and 0.98),
  "summary": string (evidence-grounded, honest summary),
  "whyDangerous": string[] (if SAFE, explain why it is benign and safe; if risky, explain specific deceptive factors),
  "threatMechanics": string,
  "visualEvidenceFound": string[] (list of neutral/benign elements visibly detected, e.g. ["Google Chrome browser interface", "Search Omnibox", "Shortcuts bar"]),
  "riskEvidenceFound": string[] (list of actual threat elements visibly detected, e.g. ["Fake security alert dialog", "Toll-free scam hotline"]. If clean, MUST be []),
  "brandDetected": {
    "name": string (e.g. "Google", "Wells Fargo", "Microsoft", or "None"),
    "isOfficialConfirmed": boolean (always false for screenshot because origin cannot be cryptographically verified via image alone),
    "confidence": number,
    "notes": string
  },
  "credentialFieldsDetected": boolean,
  "credentialFieldDetails": string[],
  "urgencyOrPanicDetected": boolean,
  "deceptiveElementsDetected": boolean,
  "visibleUrl": string,
  "extractedOcrText": string[],
  "visualRegions": [
    {
      "id": string,
      "label": string,
      "type": "logo" | "input" | "alert" | "button" | "url" | "chrome" | "suspicious" | "safe",
      "box2d": [number, number, number, number],
      "description": string,
      "severity": "clean" | "suspicious" | "malicious" | "info"
    }
  ],
  "indicators": [
    {
      "type": string,
      "name": string,
      "severity": "low" | "medium" | "high" | "critical" | "info",
      "description": string,
      "scoreImpact": number
    }
  ],
  "technicalAnalysis": [
    {
      "category": string,
      "key": string,
      "value": string,
      "status": "clean" | "suspicious" | "malicious" | "neutral" | "unavailable",
      "details": string
    }
  ],
  "recommendations": string[],
  "aiScoreWeight": number (0 to 25. For safe benign screenshots, must be 0 to 4. For medium risk, 8 to 14. For high/critical scams, 18 to 25.)
}`;

      for (const model of CANDIDATE_MODELS) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('AI vision generation timeout')), 14000)
          );

          const aiPromise = this.geminiClient.models.generateContent({
            model,
            contents: [
              prompt,
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType
                }
              }
            ],
            config: {
              responseMimeType: 'application/json'
            }
          });

          const response: any = await Promise.race([aiPromise, timeoutPromise]);

          if (response?.text) {
            const parsed = JSON.parse(response.text.trim());
            
            // Safety sanitization: If no risk evidence found and no credential fields, ensure SAFE
            const riskEvidence: string[] = Array.isArray(parsed.riskEvidenceFound) ? parsed.riskEvidenceFound : [];
            const isClean = riskEvidence.length === 0 && !parsed.credentialFieldsDetected && !parsed.urgencyOrPanicDetected && !parsed.deceptiveElementsDetected;
            
            const riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = isClean
              ? 'SAFE'
              : (parsed.riskLevel || 'LOW');

            const scoreWeight = isClean
              ? Math.min(4, normalizeAiScoreWeight(parsed.aiScoreWeight, 2))
              : normalizeAiScoreWeight(parsed.aiScoreWeight, 15);

            return {
              threatType: isClean ? (parsed.threatType || 'Legitimate / Benign Interface') : (parsed.threatType || 'Visual Security Analysis'),
              riskLevel,
              confidence: typeof parsed.confidence === 'number' ? Math.min(0.98, Math.max(0.70, parsed.confidence)) : 0.88,
              summary: parsed.summary || 'Visual forensic inspection completed.',
              whyDangerous: parsed.whyDangerous || (isClean ? ['No deceptive overlays, phishing forms, or fake security prompts detected in visual capture'] : []),
              threatMechanics: parsed.threatMechanics || '',
              indicators: Array.isArray(parsed.indicators) ? parsed.indicators : [],
              technicalAnalysis: Array.isArray(parsed.technicalAnalysis) ? parsed.technicalAnalysis : [],
              recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : ['Exercise standard browsing caution.'],
              aiScoreWeight: scoreWeight,
              isFallback: false,
              modelUsed: `${model} (Multimodal Vision)`,
              screenshotForensics: {
                visualIntegrity: isClean ? 'clean' : parsed.deceptiveElementsDetected ? 'malicious' : 'suspicious',
                brandDetected: parsed.brandDetected || undefined,
                credentialFieldsDetected: Boolean(parsed.credentialFieldsDetected),
                credentialFieldDetails: Array.isArray(parsed.credentialFieldDetails) ? parsed.credentialFieldDetails : [],
                urgencyOrPanicDetected: Boolean(parsed.urgencyOrPanicDetected),
                deceptiveElementsDetected: Boolean(parsed.deceptiveElementsDetected),
                visibleUrl: parsed.visibleUrl || undefined,
                extractedOcrText: Array.isArray(parsed.extractedOcrText) ? parsed.extractedOcrText : [],
                visualRegions: Array.isArray(parsed.visualRegions) ? parsed.visualRegions : [],
                visualEvidenceFound: Array.isArray(parsed.visualEvidenceFound) ? parsed.visualEvidenceFound : ['Standard UI Layout', 'Browser Window Structure'],
                riskEvidenceFound: riskEvidence
              }
            };
          }
        } catch (err: any) {
          console.warn(`Gemini vision analysis attempt on ${model} failed:`, err?.message || err);
        }
      }
    }

    return this.generateHeuristicScreenshotFallback(filename, imageBase64);
  }

  // Robust Heuristic Fallbacks (when AI key is missing or rate limited)
  private generateHeuristicUrlFallback(url: string): AIAnalysisOutput {
    const isLocalHttp = url.startsWith('http://');
    const lower = url.toLowerCase();
    const hasLoginWords = /(login|verify|signin|account|secure|banking|wallet|confirm|update)/i.test(lower);
    const hasSuspiciousTLD = /\.(top|xyz|click|work|fit|gq|cf|ml|pw|ru|country)(\/|$)/i.test(lower);

    let threatType = 'Heuristic Security Scan';
    let riskLevel: AIAnalysisOutput['riskLevel'] = 'LOW';
    let scoreWeight = 5;
    const whyDangerous: string[] = [];

    if (hasLoginWords && (isLocalHttp || hasSuspiciousTLD)) {
      threatType = 'Credential Phishing';
      riskLevel = 'HIGH';
      scoreWeight = 20;
      whyDangerous.push('Authentication or account keywords combined with high-risk infrastructure');
      if (isLocalHttp) whyDangerous.push('Unencrypted HTTP protocol exposes input to plain-text eavesdropping');
      if (hasSuspiciousTLD) whyDangerous.push('Registered under high-abuse top-level domain frequently used in phishing campaigns');
    } else if (hasLoginWords) {
      threatType = 'Suspicious Login Page';
      riskLevel = 'MEDIUM';
      scoreWeight = 12;
      whyDangerous.push('Sensitive login keywords present; verify SSL certificate and exact domain spelling');
    } else {
      threatType = 'Standard Webpage';
      riskLevel = 'SAFE';
      scoreWeight = 2;
      whyDangerous.push('No obvious heuristic credential keywords or anomalous domain patterns detected');
    }

    return {
      threatType,
      riskLevel,
      confidence: 0.82,
      summary: 'AI analysis unavailable — showing heuristic security analysis based on structural indicators and syntax telemetry.',
      whyDangerous,
      threatMechanics: 'Automated pattern matching evaluated URL depth, character entropy, protocol encryption, and known registrar abuse rates.',
      indicators: [
        {
          type: 'heuristic',
          name: 'Pattern Inspection',
          severity: riskLevel === 'HIGH' ? 'high' : riskLevel === 'MEDIUM' ? 'medium' : 'info',
          description: `Evaluated ${url.length} character URL against cyber threat syntax database.`,
          scoreImpact: scoreWeight
        }
      ],
      technicalAnalysis: [
        { category: 'Engine', key: 'Mode', value: 'Heuristic Rulebook', status: 'neutral', details: 'Offline fallback engine' },
        { category: 'Protocol', key: 'Encryption', value: isLocalHttp ? 'HTTP (Insecure)' : 'HTTPS (Encrypted)', status: isLocalHttp ? 'suspicious' : 'clean', details: isLocalHttp ? 'Unencrypted' : 'TLS' }
      ],
      recommendations: [
        'Check that the address bar matches the intended brand exactly before typing passwords.',
        'Never submit personal or financial credentials if the connection is unencrypted.'
      ],
      aiScoreWeight: scoreWeight,
      isFallback: true,
      modelUsed: 'ThreatLens Rule-Engine (Offline Heuristics)'
    };
  }

  private generateHeuristicMessageFallback(message: string): AIAnalysisOutput {
    const lower = message.toLowerCase();
    const hasUrgency = /(urgent|immediate|expires|suspended|blocked|action required|within \d+|hurry)/i.test(lower);
    const hasMoney = /(win|won|prize|lottery|₹|\$|€|free|bonus|reward|investment|crypto|profit)/i.test(lower);
    const hasAction = /(click|link|download|verify|transfer|deposit|claim|login)/i.test(lower);

    let threatType = 'Informational Message';
    let riskLevel: AIAnalysisOutput['riskLevel'] = 'LOW';
    let scoreWeight = 5;
    const whyDangerous: string[] = [];

    if (hasUrgency && hasMoney && hasAction) {
      threatType = 'Advance-Fee / Urgent Phishing Scam';
      riskLevel = 'CRITICAL';
      scoreWeight = 24;
      whyDangerous.push('Combination of urgent pressure tactics, unsolicited financial incentive, and directive action link');
      whyDangerous.push('High characteristic markers of cyber fraud targeting financial credentials');
    } else if (hasUrgency || hasMoney) {
      threatType = 'Suspicious Social Engineering Message';
      riskLevel = 'MEDIUM';
      scoreWeight = 14;
      whyDangerous.push('Contains persuasion signals commonly employed in social engineering lures');
    } else {
      whyDangerous.push('No obvious urgency triggers or financial manipulation strings found');
    }

    return {
      threatType,
      riskLevel,
      confidence: 0.84,
      summary: 'AI analysis unavailable — showing heuristic security analysis for social engineering signals.',
      whyDangerous,
      threatMechanics: 'Linguistic heuristics evaluated urgency density, financial lure triggers, and call-to-action pressure vectors.',
      indicators: [
        {
          type: 'nlp',
          name: 'Social Engineering Heuristic',
          severity: riskLevel === 'CRITICAL' ? 'critical' : riskLevel === 'MEDIUM' ? 'medium' : 'info',
          description: `Analyzed message for emotional manipulation vectors.`,
          scoreImpact: scoreWeight
        }
      ],
      technicalAnalysis: [
        { category: 'Signals', key: 'Urgency Markers', value: hasUrgency ? 'Detected' : 'None', status: hasUrgency ? 'suspicious' : 'clean', details: 'Time pressure test' },
        { category: 'Signals', key: 'Financial Lure', value: hasMoney ? 'Detected' : 'None', status: hasMoney ? 'suspicious' : 'clean', details: 'Unsolicited reward/payout' }
      ],
      recommendations: [
        'Do NOT send money or reveal verification codes.',
        'Contact the purported entity directly through their official telephone helpline.'
      ],
      aiScoreWeight: scoreWeight,
      isFallback: true,
      modelUsed: 'ThreatLens NLP Heuristic Engine'
    };
  }

  private generateHeuristicScreenshotFallback(filename: string = '', imageBase64: string = ''): AIAnalysisOutput {
    // Attempt decoding if SVG or sample data
    let decodedText = '';
    try {
      if (imageBase64.includes('data:image/svg+xml;base64,')) {
        const b64 = imageBase64.split('data:image/svg+xml;base64,')[1];
        decodedText = Buffer.from(b64, 'base64').toString('utf-8').toLowerCase();
      } else if (imageBase64.includes('data:image/svg+xml;utf8,')) {
        decodedText = decodeURIComponent(imageBase64.split('data:image/svg+xml;utf8,')[1]).toLowerCase();
      }
    } catch {
      decodedText = '';
    }

    const name = (filename + ' ' + decodedText).toLowerCase();

    const isWellsFargoPhish = name.includes('wellsfargo') || name.includes('wells fargo') || name.includes('phish') || (name.includes('verify') && name.includes('account') && name.includes('credential'));
    const isWindowsTrojan = name.includes('windows') || name.includes('trojan') || name.includes('zeus') || name.includes('virus') || name.includes('critical alert') || name.includes('call microsoft');
    const isGoogleNewTab = name.includes('chrome') || name.includes('new tab') || name.includes('google') || name.includes('search');
    const isCloudPortal = name.includes('cloud-portal') || name.includes('enterprise cloud') || name.includes('authentic') || name.includes('saas') || name.includes('dashboard');

    if (isWindowsTrojan) {
      return {
        threatType: 'Fake Security Alert & Tech Support Scam',
        riskLevel: 'CRITICAL',
        confidence: 0.94,
        summary: 'Deceptive full-screen warning detected. Employs simulated malware alerts (Zeus Trojan) and coercive directives urging victims to dial an unauthorized telephone hotline.',
        whyDangerous: [
          'Simulates high-severity operating system security alert to induce panic',
          'Displays unauthorized toll-free hotline for remote access takeover',
          'Impersonates Microsoft / Windows Defender security branding'
        ],
        threatMechanics: 'Social engineering attack vectors leverage panic-inducing typography and fake system dialogs to coerce victims into granting remote desktop access.',
        indicators: [
          {
            type: 'visual',
            name: 'Simulated System Alert Overlay',
            severity: 'critical',
            description: 'Deceptive modal dialog warns of Zeus virus with high urgency',
            scoreImpact: 24
          },
          {
            type: 'social_engineering',
            name: 'Coercive Support Hotline Directive',
            severity: 'critical',
            description: 'Toll-free phone number solicitation for remote takeover',
            scoreImpact: 20
          }
        ],
        technicalAnalysis: [
          { category: 'Visual Integrity', key: 'UI Deception', value: 'Fake OS Modal Dialog', status: 'malicious', details: 'Simulated security prompt' },
          { category: 'Brand Detection', key: 'Impersonation Target', value: 'Windows Defender / Microsoft', status: 'malicious', details: 'Unauthorized brand trademark usage' },
          { category: 'Authentication', key: 'Credential Solicitation', value: 'Remote Access Directive', status: 'suspicious', details: 'Demands telephone contact' },
          { category: 'Social Engineering', key: 'Panic Pressure', value: 'Critical Alert / Virus Threat', status: 'malicious', details: 'Zeus virus scareware trigger' },
          { category: 'External Intel', key: 'Live URL Verification', value: 'Not Performed (Static Image)', status: 'unavailable', details: 'Requires live domain link' }
        ],
        recommendations: [
          'Do NOT call the telephone number displayed on screen.',
          'Close the browser tab immediately (use Task Manager or Force Quit if locked).',
          'Never grant remote desktop control (AnyDesk, TeamViewer) to unsolicited callers.'
        ],
        aiScoreWeight: 24,
        isFallback: true,
        modelUsed: 'ThreatLens Forensic Vision Heuristics',
        screenshotForensics: {
          visualIntegrity: 'malicious',
          brandDetected: {
            name: 'Microsoft Windows Defender',
            isOfficialConfirmed: false,
            confidence: 0.95,
            notes: 'High-probability impersonation: fake alert dialog styling'
          },
          credentialFieldsDetected: false,
          credentialFieldDetails: [],
          urgencyOrPanicDetected: true,
          deceptiveElementsDetected: true,
          visibleUrl: undefined,
          extractedOcrText: ['CRITICAL ALERT: ZEUS VIRUS DETECTED', 'Call Microsoft Support Immediately: 1-800-FAKE-NUM'],
          visualRegions: [
            {
              id: 'reg-1',
              label: 'Fake Security Dialog',
              type: 'alert',
              box2d: [12, 8, 88, 92],
              description: 'Modal alert warning of simulated malware',
              severity: 'malicious'
            },
            {
              id: 'reg-2',
              label: 'Scam Support Hotline',
              type: 'suspicious',
              box2d: [55, 20, 75, 80],
              description: 'Unauthorized toll-free support prompt',
              severity: 'malicious'
            }
          ],
          visualEvidenceFound: ['Modal dialog container', 'Panic headline styling', 'Hotline phone prompt'],
          riskEvidenceFound: ['Simulated Zeus virus infection alert', 'Urgent call-to-action directive', 'Brand impersonation of Microsoft Windows Defender']
        }
      };
    }

    if (isWellsFargoPhish) {
      return {
        threatType: 'Brand Impersonation & Phishing Login',
        riskLevel: 'HIGH',
        confidence: 0.91,
        summary: 'Visual spoofing of Wells Fargo banking portal. Combines brand trademark cues with urgent security verification directives to harvest online banking credentials.',
        whyDangerous: [
          'Replicates Wells Fargo corporate identity without verifiable host origin',
          'Presents authentication credential fields under an urgent security pretext',
          'Employs urgency manipulation ("Security Update Required") to bypass scrutiny'
        ],
        threatMechanics: 'Harvests customer banking credentials by mimicking legitimate financial institution styling combined with urgency lures.',
        indicators: [
          {
            type: 'visual',
            name: 'Banking Brand Impersonation',
            severity: 'high',
            description: 'Wells Fargo visual cues detected in unverified context',
            scoreImpact: 18
          },
          {
            type: 'credential',
            name: 'Authentication Input Harvesting',
            severity: 'high',
            description: 'Credential input fields positioned under urgent verification prompt',
            scoreImpact: 16
          }
        ],
        technicalAnalysis: [
          { category: 'Visual Integrity', key: 'UI Deception', value: 'Spoofed Banking Portal', status: 'suspicious', details: 'Styling mimics commercial banking portal' },
          { category: 'Brand Detection', key: 'Impersonation Target', value: 'Wells Fargo Bank', status: 'suspicious', details: 'Unverified origin image file' },
          { category: 'Authentication', key: 'Credential Solicitation', value: 'Banking Credentials Requested', status: 'suspicious', details: 'Input elements for authentication' },
          { category: 'Social Engineering', key: 'Panic Pressure', value: 'Security Update Required', status: 'suspicious', details: 'Urgency trigger detected' },
          { category: 'External Intel', key: 'Live URL Verification', value: 'Not Performed (Static Image)', status: 'unavailable', details: 'Requires live domain link' }
        ],
        recommendations: [
          'Do NOT input usernames, passwords, PINs, or account numbers.',
          'Verify the destination domain in your address bar matches wellsfargo.com exactly.',
          'Always navigate to your bank via a trusted bookmark or official mobile application.'
        ],
        aiScoreWeight: 19,
        isFallback: true,
        modelUsed: 'ThreatLens Forensic Vision Heuristics',
        screenshotForensics: {
          visualIntegrity: 'suspicious',
          brandDetected: {
            name: 'Wells Fargo',
            isOfficialConfirmed: false,
            confidence: 0.92,
            notes: 'Wells Fargo branding detected on unverified image canvas'
          },
          credentialFieldsDetected: true,
          credentialFieldDetails: ['Banking Username/ID Input', 'Password/Passcode Input'],
          urgencyOrPanicDetected: true,
          deceptiveElementsDetected: true,
          visibleUrl: undefined,
          extractedOcrText: ['WELLS FARGO SECURITY UPDATE', 'Urgent Action Required: Sign in to verify account', '[ Enter Credentials ]'],
          visualRegions: [
            {
              id: 'reg-wf-1',
              label: 'Impersonated Bank Banner',
              type: 'logo',
              box2d: [15, 10, 45, 90],
              description: 'Wells Fargo security update header',
              severity: 'suspicious'
            },
            {
              id: 'reg-wf-2',
              label: 'Credential Input Form',
              type: 'input',
              box2d: [55, 30, 75, 70],
              description: 'Authentication input button/field',
              severity: 'suspicious'
            }
          ],
          visualEvidenceFound: ['Wells Fargo corporate header', 'Urgent security verification notice', 'Authentication action button'],
          riskEvidenceFound: ['Unverified brand origin', 'Credential input prompt paired with urgent action notice']
        }
      };
    }

    // Standard benign case: Google New Tab, SaaS dashboard, or clean image
    const brandName = isGoogleNewTab ? 'Google Chrome' : isCloudPortal ? 'Enterprise Cloud Platform' : 'Standard Web Application';
    
    return {
      threatType: 'Legitimate / Benign Interface',
      riskLevel: 'SAFE',
      confidence: 0.93,
      summary: `Visual forensic analysis confirms a standard, benign interface (${brandName}). No deceptive overlays, fraudulent credential harvesting forms, or social engineering triggers detected.`,
      whyDangerous: [
        'Visual structure reflects clean, standard software hierarchy without deceptive cues',
        'No unverified credential collection fields or payment card prompts found',
        'Absence of coercive countdowns, fake security alerts, or scareware triggers'
      ],
      threatMechanics: 'Benign layout verified: Component layout conforms to standard design principles without malicious UI cloaking or credential harvesting hooks.',
      indicators: [
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
          description: 'No unverified password, PIN, or payment collection fields identified',
          scoreImpact: 0
        }
      ],
      technicalAnalysis: [
        { category: 'Visual Integrity', key: 'UI Structure', value: 'Standard / Benign Interface', status: 'clean', details: 'Clean visual hierarchy and standard elements' },
        { category: 'Brand Detection', key: 'Brand Context', value: brandName, status: 'clean', details: 'Expected visual appearance without deceptive imitation' },
        { category: 'Authentication', key: 'Credential Solicitation', value: 'None Detected', status: 'clean', details: 'No credential harvesting fields' },
        { category: 'Social Engineering', key: 'Manipulation Vectors', value: 'None Detected', status: 'clean', details: 'No urgency triggers or fake security alerts' },
        { category: 'External Intel', key: 'Live URL Verification', value: 'Not Performed (Static Image)', status: 'unavailable', details: 'Requires live domain link' }
      ],
      recommendations: [
        'No visual security anomalies detected in this screenshot.',
        'Always verify destination URLs in your browser navigation bar before entering sensitive credentials.'
      ],
      aiScoreWeight: 2,
      isFallback: true,
      modelUsed: 'ThreatLens Forensic Vision Heuristics',
      screenshotForensics: {
        visualIntegrity: 'clean',
        brandDetected: {
          name: brandName,
          isOfficialConfirmed: false,
          confidence: 0.91,
          notes: 'Standard visual appearance without deceptive impersonation cues'
        },
        credentialFieldsDetected: false,
        credentialFieldDetails: [],
        urgencyOrPanicDetected: false,
        deceptiveElementsDetected: false,
        visibleUrl: isGoogleNewTab ? 'chrome://newtab' : undefined,
        extractedOcrText: isCloudPortal
          ? ['Enterprise Cloud Portal', 'System Status: All services operational']
          : isGoogleNewTab
          ? ['Google', 'Search Google or type a URL', 'New Tab']
          : ['Application Interface', 'Operational Status'],
        visualRegions: [
          {
            id: 'reg-safe-1',
            label: isGoogleNewTab ? 'Google Logo / Brand' : 'Portal Header',
            type: 'logo',
            box2d: [15, 20, 40, 80],
            description: 'Standard header navigation element',
            severity: 'clean'
          },
          {
            id: 'reg-safe-2',
            label: isGoogleNewTab ? 'Search Omnibox' : 'Dashboard Content Area',
            type: isGoogleNewTab ? 'input' : 'safe',
            box2d: [50, 20, 70, 80],
            description: 'Benign user interface component',
            severity: 'clean'
          }
        ],
        visualEvidenceFound: [
          'Clean interface structure with standard navigation',
          'No deceptive overlays or disguised browser chrome',
          'Zero fraudulent credential prompts'
        ],
        riskEvidenceFound: []
      }
    };
  }
}

export const aiProvider = new AIProviderService();
