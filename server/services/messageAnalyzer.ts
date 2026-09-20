import crypto from 'crypto';
import type { SecurityAnalysisResult, ScanIndicator, TechnicalSignal } from '../types.ts';
import { aiProvider } from './aiProvider.ts';
import { RiskEngine } from './riskEngine.ts';

const URGENCY_TRIGGERS = [
  'urgent', 'immediately', 'expires', 'suspended', 'within 24 hours', 'within 15 mins', 'within 2 hours',
  'act now', 'action required', 'final notice', 'terminated', 'blocked', 'last chance', 'deactivated',
  'account locked', 'unauthorized transaction', 'security breach', 'immediate attention', 'freeze'
];

const REWARD_TRIGGERS = [
  'congratulations', 'won', 'winner', 'lottery', 'prize', 'cash bonus', 'gift card',
  'free iphone', 'unclaimed funds', 'exclusive reward', 'guaranteed return', 'jackpot',
  '₹50,000', '$10,000', '1,000,000', 'free reward', 'lucky draw', 'payout', 'giveaway'
];

const FINANCIAL_MANIPULATION_TRIGGERS = [
  'send money', 'wire transfer', 'crypto', 'bitcoin', 'usdt', 'eth', 'processing fee',
  'advance payment', 'deposit required', 'gift cards', 'bank details', 'upi pin', 'tax refund',
  'pay now', 'wallet address', 'security deposit', 'recharge'
];

const IMPERSONATION_TRIGGERS = [
  'wells fargo', 'chase', 'bank of america', 'citi', 'paypal', 'venmo', 'cash app',
  'amazon', 'apple', 'netflix', 'microsoft', 'google security', 'dhl', 'fedex', 'usps', 'ups',
  'irs', 'tax department', 'internal revenue', 'geek squad', 'meta support', 'hr department',
  'whatsapp support', 'binance', 'coinbase', 'dr. smith'
];

const CREDENTIAL_THEFT_TRIGGERS = [
  'otp', 'pin', 'password', 'passcode', 'cvv', 'card number', 'security code',
  'verify identity', 'confirm password', 'ssn', 'social security', 'login credentials',
  'enter your credentials', 'restore access'
];

const JOB_SCAM_TRIGGERS = [
  'remote reviewer', 'per day', 'earn per like', 'simple tasks', 'registration fee',
  'daily income', 'part-time job', 'task completion', 'telegram channel'
];

const EXTRACT_URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(top|xyz|click|work|fit|com|info|org|net|me|in|co|cc)\/[^\s]*)/gi;

export class MessageAnalyzerService {
  public async analyze(messageText: string): Promise<SecurityAnalysisResult> {
    const startTime = Date.now();
    const text = messageText.trim();
    if (!text) {
      throw new Error('Please provide text or message content to analyze.');
    }

    const lower = text.toLowerCase();
    const indicators: ScanIndicator[] = [];
    const technicalSignals: TechnicalSignal[] = [];
    const contributingSignals: Array<{ category: string; factor: string; points: number; reason: string }> = [];

    let contentRisk = 0;
    let urlStructureRisk = 0;

    // 1. Urgency & Coercion Detection
    const detectedUrgency = URGENCY_TRIGGERS.filter(u => lower.includes(u));
    if (detectedUrgency.length > 0) {
      const pts = Math.min(30, detectedUrgency.length * 15);
      contentRisk += pts;
      indicators.push({
        type: 'urgency',
        name: 'Urgency & Fear Tactics',
        severity: 'high',
        description: `Message relies on artificial panic triggers: [${detectedUrgency.join(', ')}].`,
        scoreImpact: pts
      });
      technicalSignals.push({
        category: 'Psychological Signals',
        key: 'Time Pressure Vector',
        value: detectedUrgency.slice(0, 3).join(', '),
        status: 'malicious',
        details: 'Artificial deadline used to bypass rational critical thinking'
      });
      contributingSignals.push({
        category: 'Content Risk',
        factor: 'Urgency Pressure',
        points: pts,
        reason: 'Exploits fear or haste to compel immediate interaction'
      });
    }

    // 2. Unsolicited Reward / Lottery Lure
    const detectedRewards = REWARD_TRIGGERS.filter(r => lower.includes(r));
    if (detectedRewards.length > 0) {
      const pts = Math.min(35, detectedRewards.length * 18);
      contentRisk += pts;
      indicators.push({
        type: 'reward',
        name: 'Unsolicited Reward / Lottery Claim',
        severity: 'critical',
        description: `Baiting recipient with unearned prizes or wealth promises: [${detectedRewards.join(', ')}].`,
        scoreImpact: pts
      });
      technicalSignals.push({
        category: 'Incentive Vectors',
        key: 'Bait Signal',
        value: detectedRewards.slice(0, 3).join(', '),
        status: 'malicious',
        details: 'Advance-fee fraud or lottery lure detected'
      });
      contributingSignals.push({
        category: 'Content Risk',
        factor: 'Greed / Reward Lure',
        points: pts,
        reason: 'Classic bait tactic for fraudulent fee extraction'
      });
    }

    // 3. Brand & Authority Impersonation
    const detectedImpersonation = IMPERSONATION_TRIGGERS.filter(b => lower.includes(b));
    if (detectedImpersonation.length > 0 && (detectedUrgency.length > 0 || detectedRewards.length > 0 || lower.includes('fee') || lower.includes('verify'))) {
      const pts = 25;
      contentRisk += pts;
      indicators.push({
        type: 'impersonation',
        name: 'Brand / Authority Impersonation',
        severity: 'high',
        description: `Purports to represent [${detectedImpersonation.join(', ')}] while displaying coercive indicators.`,
        scoreImpact: pts
      });
      technicalSignals.push({
        category: 'Brand & Authority',
        key: 'Impersonation Target',
        value: detectedImpersonation.join(', ').toUpperCase(),
        status: 'malicious',
        details: 'Institution brand leveraged without cryptographic origin proof'
      });
      contributingSignals.push({
        category: 'Identity Risk',
        factor: 'Brand Spoofing',
        points: pts,
        reason: 'Coercive message claims affiliation with high-trust authority'
      });
    } else if (detectedImpersonation.length > 0) {
      technicalSignals.push({
        category: 'Brand & Authority',
        key: 'Entity Mention',
        value: detectedImpersonation.join(', '),
        status: 'neutral',
        details: 'Recognized brand entity mentioned in standard context'
      });
    }

    // 4. Financial Manipulation & Demands
    const detectedFinancial = FINANCIAL_MANIPULATION_TRIGGERS.filter(f => lower.includes(f));
    if (detectedFinancial.length > 0) {
      const pts = Math.min(30, detectedFinancial.length * 15);
      contentRisk += pts;
      indicators.push({
        type: 'financial',
        name: 'Financial or Payment Demands',
        severity: 'high',
        description: `Solicits payment, crypto, or banking transactions: [${detectedFinancial.join(', ')}].`,
        scoreImpact: pts
      });
      technicalSignals.push({
        category: 'Financial Signals',
        key: 'Payment Demands',
        value: detectedFinancial.slice(0, 3).join(', '),
        status: 'suspicious',
        details: 'Requests sensitive financial transmission or upfront fee'
      });
      contributingSignals.push({
        category: 'Content Risk',
        factor: 'Payment Solicitation',
        points: pts,
        reason: 'Unverified requests for money transfer, crypto, or credentials'
      });
    }

    // 5. Credential / OTP Solicitation
    const detectedCredentials = CREDENTIAL_THEFT_TRIGGERS.filter(c => lower.includes(c));
    if (detectedCredentials.length > 0) {
      const pts = Math.min(35, detectedCredentials.length * 18);
      contentRisk += pts;
      indicators.push({
        type: 'credential_harvest',
        name: 'Credential & Authentication Solicitation',
        severity: 'critical',
        description: `Attempts to harvest security secrets: [${detectedCredentials.join(', ')}].`,
        scoreImpact: pts
      });
      technicalSignals.push({
        category: 'Credential Security',
        key: 'Authentication Vectors',
        value: detectedCredentials.slice(0, 3).join(', '),
        status: 'malicious',
        details: 'Explicit solicitation of verification codes, PINs, or credentials'
      });
      contributingSignals.push({
        category: 'Credential Risk',
        factor: 'Secret Exfiltration',
        points: pts,
        reason: 'High-risk solicitation of one-time passwords or security credentials'
      });
    }

    // 6. Extracted URLs inside text
    const matchedUrls = text.match(EXTRACT_URL_REGEX) || [];
    if (matchedUrls.length > 0) {
      const hasSuspiciousTLD = matchedUrls.some(u => /\.(top|xyz|click|work|fit|cc|club)(\/|$)/i.test(u));
      const urlPts = hasSuspiciousTLD ? 30 : 20;
      urlStructureRisk += urlPts;
      indicators.push({
        type: 'url',
        name: hasSuspiciousTLD ? 'High-Risk Embedded Link (.top/.xyz)' : 'Embedded Action Link',
        severity: hasSuspiciousTLD ? 'high' : 'medium',
        description: `Directs user to external target: ${matchedUrls[0]}`,
        scoreImpact: urlPts
      });
      technicalSignals.push({
        category: 'Payload Vector',
        key: 'Extracted Links',
        value: matchedUrls.slice(0, 2).join(', '),
        status: hasSuspiciousTLD ? 'malicious' : 'suspicious',
        details: hasSuspiciousTLD ? 'High-abuse top-level domain frequently used in phishing campaigns' : 'External link found in unauthenticated message'
      });
      contributingSignals.push({
        category: 'URL Risk',
        factor: 'Embedded Action Link',
        points: urlPts,
        reason: 'Directs recipient outside verified communication channel'
      });
    } else {
      technicalSignals.push({
        category: 'Payload Vector',
        key: 'Extracted Links',
        value: 'None (Plaintext)',
        status: 'clean',
        details: 'No suspicious hyperlinks or redirection targets found in payload'
      });
    }

    // 7. General Linguistic Entropy
    const words = text.split(/\s+/).filter(Boolean);
    const capsCount = (text.match(/[A-Z]/g) || []).length;
    const capsRatio = text.length > 0 ? capsCount / text.length : 0;
    if (capsRatio > 0.35 && text.length > 25) {
      indicators.push({
        type: 'formatting',
        name: 'Excessive Capitalization',
        severity: 'low',
        description: 'High uppercase ratio designed to artificially amplify alarm or excitement.',
        scoreImpact: 8
      });
      technicalSignals.push({
        category: 'Linguistic Analysis',
        key: 'Capitalization Ratio',
        value: `${Math.round(capsRatio * 100)}% Uppercase`,
        status: 'suspicious',
        details: 'Elevated capitalization creates emotional urgency'
      });
    }

    // AI Analysis
    const aiOutput = await aiProvider.analyzeMessage(text);

    // Merge AI signals
    for (const aiInd of aiOutput.indicators) {
      if (!indicators.some(i => i.name.toLowerCase() === aiInd.name.toLowerCase())) {
        indicators.push(aiInd);
      }
    }
    for (const tech of aiOutput.technicalAnalysis) {
      technicalSignals.push(tech);
    }

    if (aiOutput.aiScoreWeight > 0) {
      contributingSignals.push({
        category: 'AI Classification',
        factor: 'Linguistic Scam Detection',
        points: aiOutput.aiScoreWeight,
        reason: `${aiOutput.modelUsed} identified social engineering manipulation markers`
      });
    }

    const finalScore = RiskEngine.calculate({
      domainRisk: 0,
      urlStructureRisk,
      sslRisk: 0,
      reputationRisk: 0,
      contentRisk,
      aiRisk: aiOutput.aiScoreWeight,
      contributingSignals
    });

    const duration = Date.now() - startTime;

    return {
      id: `scan-${crypto.randomUUID().slice(0, 8)}`,
      scanType: 'message',
      target: text,
      riskScore: finalScore.score,
      riskLevel: finalScore.level,
      threatType: aiOutput.threatType || (finalScore.score > 60 ? 'Social Engineering & Scam' : 'Informational Message'),
      confidence: aiOutput.confidence,
      summary: aiOutput.summary,
      explanation: {
        whyDangerous: aiOutput.whyDangerous.length > 0 ? aiOutput.whyDangerous : [
          finalScore.level === 'SAFE' ? 'Message content appears benign and informational' : 'High density of psychological manipulation markers'
        ],
        threatMechanics: aiOutput.threatMechanics
      },
      indicators,
      technicalSignals,
      riskBreakdown: finalScore.breakdown,
      recommendations: aiOutput.recommendations,
      threatIntelligence: {
        heuristicEngine: {
          status: 'Social Engineering Linguistic Heuristics Active',
          rulesTriggered: indicators.map(i => i.name)
        }
      },
      externalReputation: {
        threatIntelFeed: 'Linguistic manipulation & urgency trigger filter',
        dnsVerification: matchedUrls.length > 0 ? 'Embedded links extracted' : 'Plain Text / No External URLs',
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

export const messageAnalyzer = new MessageAnalyzerService();
