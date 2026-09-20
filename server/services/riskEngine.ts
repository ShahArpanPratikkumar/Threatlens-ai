import type { RiskBreakdown } from '../types.ts';

export interface ScoreInput {
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

export class RiskEngine {
  public static calculate(input: ScoreInput): {
    score: number;
    level: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    breakdown: RiskBreakdown;
  } {
    // Sum weighted contributions
    const rawTotal = 
      input.domainRisk +
      input.urlStructureRisk +
      input.sslRisk +
      input.reputationRisk +
      input.contentRisk +
      input.aiRisk;

    // Normalize between 0 and 100
    const normalizedScore = Math.max(0, Math.min(100, Math.round(rawTotal)));

    let level: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'SAFE';
    if (normalizedScore >= 81) {
      level = 'CRITICAL';
    } else if (normalizedScore >= 61) {
      level = 'HIGH';
    } else if (normalizedScore >= 41) {
      level = 'MEDIUM';
    } else if (normalizedScore >= 21) {
      level = 'LOW';
    } else {
      level = 'SAFE';
    }

    const breakdown: RiskBreakdown = {
      domainRisk: Math.round(input.domainRisk),
      urlStructureRisk: Math.round(input.urlStructureRisk),
      sslRisk: Math.round(input.sslRisk),
      reputationRisk: Math.round(input.reputationRisk),
      contentRisk: Math.round(input.contentRisk),
      aiRisk: Math.round(input.aiRisk),
      contributingSignals: input.contributingSignals
    };

    return {
      score: normalizedScore,
      level,
      breakdown
    };
  }

  public static getThreatColor(level: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): {
    text: string;
    bg: string;
    border: string;
    badge: string;
  } {
    switch (level) {
      case 'CRITICAL':
        return {
          text: 'text-rose-400',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
        };
      case 'HIGH':
        return {
          text: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        };
      case 'MEDIUM':
        return {
          text: 'text-yellow-400',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
        };
      case 'LOW':
        return {
          text: 'text-cyan-400',
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/30',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
        };
      case 'SAFE':
      default:
        return {
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        };
    }
  }
}
