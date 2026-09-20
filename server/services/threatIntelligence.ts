import dns from 'dns/promises';

export interface ThreatIntelResult {
  heuristicEngine: {
    status: string;
    rulesTriggered: string[];
  };
  dnsStatus: {
    status: string;
    isResolved: boolean;
    ipAddresses?: string[];
  };
  scoreBonus: number; // added to overall risk if flagged
  signals: Array<{
    category: string;
    factor: string;
    points: number;
    reason: string;
  }>;
}

const HIGH_RISK_TLDS = new Set([
  'xyz', 'top', 'work', 'click', 'country', 'kim', 'gq', 'tk', 'ml', 'cf', 'ga', 'buzz', 'fit', 'loan', 'surf', 'support', 'rest'
]);

const ABUSED_DYNAMIC_HOSTS = [
  'ngrok-free.app',
  'trycloudflare.com',
  'duckdns.org',
  'pages.dev',
  'firebaseapp.com',
  'glitch.me',
  'loca.lt'
];

export class ThreatIntelligenceService {
  public async checkUrl(targetUrl: string): Promise<ThreatIntelResult> {
    const signals: ThreatIntelResult['signals'] = [];
    let scoreBonus = 0;
    const rulesTriggered: string[] = [];

    let hostname = '';
    let pathname = '';
    try {
      const parsed = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
      hostname = parsed.hostname.toLowerCase();
      pathname = parsed.pathname.toLowerCase();
    } catch {
      hostname = targetUrl.toLowerCase();
    }

    // 1. High-Risk TLD Assessment
    const parts = hostname.split('.');
    const tld = parts[parts.length - 1] || '';
    if (HIGH_RISK_TLDS.has(tld)) {
      scoreBonus += 15;
      rulesTriggered.push(`High-Risk TLD (.${tld})`);
      signals.push({
        category: 'Threat Intel',
        factor: 'High-Risk TLD Zone',
        points: 15,
        reason: `Top-level domain .${tld} possesses elevated abuse rates across global phishing telemetry`
      });
    }

    // 2. Abused Free / Dynamic Infrastructure Check
    const matchedAbusedHost = ABUSED_DYNAMIC_HOSTS.find(host => hostname.endsWith(host));
    if (matchedAbusedHost) {
      scoreBonus += 25;
      rulesTriggered.push(`Abused Tunnel/Hosting Infrastructure (${matchedAbusedHost})`);
      signals.push({
        category: 'Threat Intel',
        factor: 'Ephemeral Tunnel / Hosting Infrastructure',
        points: 25,
        reason: `Host is mounted on ${matchedAbusedHost}, frequently utilized for disposable phishing kits and bypassing gateway filters`
      });
    }

    // 3. Phishing Path / Keyword Signatures
    const phishKeywords = ['login', 'signin', 'verify', 'update', 'banking', 'wallet', 'secure', 'auth', 'recovery', 'passcode'];
    const matchedKeywords = phishKeywords.filter(kw => pathname.includes(kw));
    if (matchedKeywords.length >= 2) {
      scoreBonus += 15;
      rulesTriggered.push(`Credential Harvesting Path Pattern (${matchedKeywords.join(', ')})`);
      signals.push({
        category: 'Threat Intel',
        factor: 'Targeted Credential Trap Pattern',
        points: 15,
        reason: `Deep URL path utilizes aggressive verification lures: [${matchedKeywords.join(', ')}]`
      });
    }

    // 4. Autonomous DNS & Host Resolution Telemetry
    let isResolved = false;
    let resolvedIps: string[] = [];
    let dnsMessage = 'Domain actively resolved to public internet infrastructure';

    try {
      // Resolve IPv4 addresses
      const ips = await dns.resolve4(hostname);
      resolvedIps = ips || [];
      if (resolvedIps.length > 0) {
        isResolved = true;
        dnsMessage = `Active host (${resolvedIps.slice(0, 2).join(', ')}${resolvedIps.length > 2 ? ` +${resolvedIps.length - 2} more` : ''})`;
      }
    } catch (dnsErr: any) {
      isResolved = false;
      dnsMessage = dnsErr.code === 'ENOTFOUND'
        ? 'NXDOMAIN (Host name has no valid DNS A-records registered)'
        : `DNS resolution returned ${dnsErr.code || 'timeout'}`;
      
      scoreBonus += 10;
      rulesTriggered.push('Unresolved / Transient Host Signature');
      signals.push({
        category: 'Threat Intel',
        factor: 'Unresolved / Fast-Flux Host',
        points: 10,
        reason: 'Domain failed standard recursive DNS resolution or is unassigned in root registries'
      });
    }

    const heuristicStatus = rulesTriggered.length > 0
      ? `Flagged by ThreatLens Heuristic Engine (${rulesTriggered.length} rule${rulesTriggered.length > 1 ? 's' : ''} triggered)`
      : 'Clean — No anomalous threat patterns detected by ThreatLens Engine';

    return {
      heuristicEngine: {
        status: heuristicStatus,
        rulesTriggered
      },
      dnsStatus: {
        status: dnsMessage,
        isResolved,
        ipAddresses: resolvedIps
      },
      scoreBonus,
      signals
    };
  }
}

export const threatIntel = new ThreatIntelligenceService();

