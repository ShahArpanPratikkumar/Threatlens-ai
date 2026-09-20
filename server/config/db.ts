import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { SecurityAnalysisResult, UserProfile } from '../types.ts';

export interface StoredUser extends UserProfile {
  passwordHash: string;
  normalizedEmail: string;
  accountStatus: 'active' | 'suspended' | 'pending';
  lastLoginAt?: string;
  updatedAt?: string;
}

export interface StoredAnonymousSession {
  sessionId: string;
  scanCount: number;
  scanIds: string[];
  ip?: string;
  createdAt: string;
  lastScanAt?: string;
  expiresAt: string;
}

interface DBStorage {
  users: StoredUser[];
  scans: SecurityAnalysisResult[];
  anonymousSessions: StoredAnonymousSession[];
}

const STORAGE_FILE = path.join(process.cwd(), '.threatlens_data.json');

class StorageManager {
  private data: DBStorage = {
    users: [],
    scans: [],
    anonymousSessions: []
  };
  private isLoaded = false;

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.anonymousSessions) {
          this.data.anonymousSessions = [];
        }

        // Multi-user migration: associate any legacy unassigned scans to demo analyst
        const demoUserId = 'usr-demo-03eaaf';
        let migratedCount = 0;
        for (const scan of this.data.scans) {
          if (!scan.userId && !scan.anonymousSessionId) {
            scan.userId = demoUserId;
            migratedCount++;
          }
        }
        if (migratedCount > 0) {
          this.saveData();
        }
      }
    } catch {
      // Memory storage fallback
    }
    this.isLoaded = true;
  }

  private saveData() {
    try {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch {
      // Non-fatal if filesystem is read-only
    }
  }

  private seedDefaultsIfEmpty() {
    if (this.data.scans.length === 0) {
      const now = new Date();
      const demoUserId = 'usr-demo-03eaaf';
      const sampleScans: SecurityAnalysisResult[] = [
        {
          id: 'scan-demo-bank',
          userId: demoUserId,
          scanType: 'url',
          target: 'http://secure-wellsfargo-update.login-verify.top/auth/signin',
          riskScore: 94,
          riskLevel: 'CRITICAL',
          threatType: 'Credential Phishing',
          confidence: 0.96,
          summary: 'Highly deceptive credential harvesting portal impersonating Wells Fargo with fraudulent authentication endpoints and suspicious TLD.',
          explanation: {
            whyDangerous: [
              'Domain mimics trusted banking institution (Wells Fargo) on an untrusted top-level domain (.top)',
              'Insecure plain HTTP protocol exposing user credentials to network interception',
              'Subdomain nesting tricks users into believing they are on a legitimate bank portal',
              'Heuristic markers match active credential theft kits'
            ],
            threatMechanics: 'The attack leverages deceptive brand homoglyphs and typosquatting on a bulletproof host to capture username, password, and 2FA tokens.'
          },
          indicators: [
            { type: 'domain', name: 'Brand Impersonation', severity: 'critical', description: 'Wells Fargo brand spoofing in subdomain', scoreImpact: 35 },
            { type: 'ssl', name: 'Insecure Protocol (HTTP)', severity: 'high', description: 'Sensitive login attempted over unencrypted connection', scoreImpact: 20 },
            { type: 'tld', name: 'Suspicious TLD (.top)', severity: 'medium', description: 'Known high-abuse registrar TLD', scoreImpact: 15 },
            { type: 'pattern', name: 'Credential Harvesting Pattern', severity: 'critical', description: 'Auth endpoints (/auth/signin) on third-party host', scoreImpact: 24 }
          ],
          technicalSignals: [
            { category: 'Protocol', key: 'Scheme', value: 'http', status: 'malicious', details: 'Unencrypted plain text' },
            { category: 'Domain', key: 'Registrar TLD', value: '.top', status: 'suspicious', details: 'High risk zone' },
            { category: 'Subdomains', key: 'Depth', value: 3, status: 'suspicious', details: 'Excessive subdomain nesting' },
            { category: 'Host', key: 'Brand Match', value: 'Wells Fargo', status: 'malicious', details: 'Impersonation detected' }
          ],
          riskBreakdown: {
            domainRisk: 35,
            urlStructureRisk: 25,
            sslRisk: 20,
            reputationRisk: 0,
            contentRisk: 14,
            aiRisk: 0,
            contributingSignals: [
              { category: 'Domain', factor: 'Impersonation', points: 35, reason: 'Target domain mimics banking domain' },
              { category: 'SSL', factor: 'Missing Encryption', points: 20, reason: 'HTTP instead of HTTPS' },
              { category: 'Structure', factor: 'Suspicious Keywords', points: 25, reason: 'Presence of login-verify and auth/signin' },
              { category: 'Content', factor: 'Phishing Signature', points: 14, reason: 'Structure matches credential harvesting kit' }
            ]
          },
          recommendations: [
            'Do NOT enter credentials or 2-factor authentication codes.',
            'Report the domain to registrar abuse contact and antiphishing feeds.',
            'If credentials were submitted, immediately reset your Wells Fargo password from the official website.'
          ],
          threatIntelligence: {
            heuristicEngine: {
              status: 'Flagged by ThreatLens Heuristic Engine (4 rules triggered)',
              rulesTriggered: ['Impersonation (Wells Fargo)', 'Missing TLS Encryption', 'Credential Trap Keywords', 'Phishing Kit Signature']
            },
            dnsStatus: {
              status: 'NXDOMAIN / Unresolved host signature',
              isResolved: false
            }
          },
          externalReputation: {
            threatIntelFeed: 'Flagged across ThreatLens Heuristic Engine',
            dnsVerification: 'NXDOMAIN / Unresolved host signature',
            isHeuristicOnly: false
          },
          metadata: {
            timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
            analysisDurationMs: 420,
            aiModelUsed: 'gemini-3.8-flash',
            isAiFallback: false
          }
        },
        {
          id: 'scan-demo-github',
          userId: demoUserId,
          scanType: 'url',
          target: 'https://github.com',
          riskScore: 4,
          riskLevel: 'SAFE',
          threatType: 'Legitimate Service',
          confidence: 0.99,
          summary: 'Verified authentic domain belonging to GitHub Inc. with valid TLS certificate and clean global reputation.',
          explanation: {
            whyDangerous: [],
            threatMechanics: 'No threat indicators identified. Domain demonstrates verified identity, high trust authority, and modern security headers.'
          },
          indicators: [
            { type: 'ssl', name: 'Valid TLS Certificate', severity: 'info', description: 'Issued by trusted public CA with HSTS enabled', scoreImpact: 0 },
            { type: 'reputation', name: 'Global Trust Rank', severity: 'info', description: 'Tranco Top 100 verified domain', scoreImpact: 0 }
          ],
          technicalSignals: [
            { category: 'Protocol', key: 'Scheme', value: 'https', status: 'clean', details: 'TLS 1.3 / HSTS' },
            { category: 'Domain', key: 'TLD', value: '.com', status: 'clean', details: 'Standard authoritative registry' },
            { category: 'Reputation', key: 'Known Authority', value: 'GitHub / Microsoft', status: 'clean', details: 'Verified corporate domain' }
          ],
          riskBreakdown: {
            domainRisk: 0,
            urlStructureRisk: 2,
            sslRisk: 0,
            reputationRisk: 0,
            contentRisk: 2,
            aiRisk: 0,
            contributingSignals: [
              { category: 'Reputation', factor: 'High Authority Domain', points: 0, reason: 'Standard legitimate developer portal' }
            ]
          },
          recommendations: [
            'Safe to browse and interact.',
            'Always verify repository URLs before running unfamiliar CLI commands or scripts.'
          ],
          threatIntelligence: {
            heuristicEngine: {
              status: 'Clean — No anomalous threat patterns detected',
              rulesTriggered: []
            },
            dnsStatus: {
              status: 'Active host (140.82.112.4 — GitHub Inc.)',
              isResolved: true
            }
          },
          externalReputation: {
            threatIntelFeed: 'Clean across ThreatLens Global Trusted Registry',
            dnsVerification: 'Active authoritative internet infrastructure',
            isHeuristicOnly: false
          },
          metadata: {
            timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
            analysisDurationMs: 290,
            aiModelUsed: 'gemini-3.8-flash',
            isAiFallback: false
          }
        },
        {
          id: 'scan-demo-sms',
          userId: demoUserId,
          scanType: 'message',
          target: 'Congratulations! You won ₹50,000 cash bonus from National Lottery. Click here immediately to claim: http://lottery-claim-prize.info/claim?id=94829 Offer expires in 15 mins!',
          riskScore: 92,
          riskLevel: 'CRITICAL',
          threatType: 'Advance-Fee Scam & Phishing',
          confidence: 0.95,
          summary: 'Scam message utilizing extreme urgency, unverified lottery claims, and an unencrypted link to harvest financial and banking details.',
          explanation: {
            whyDangerous: [
              'Fabricated reward incentive to lower victim defenses',
              'Aggressive artificial deadline (15 minutes urgency panic trigger)',
              'Directs to an unvetted insecure HTTP domain (.info)',
              'Classic social engineering vector targeting UPI/bank credentials'
            ],
            threatMechanics: 'Scammers induce urgency so victims click before thinking, where a malicious webpage prompts for an initial "processing fee" or login credentials.'
          },
          indicators: [
            { type: 'urgency', name: 'Artificial Urgency', severity: 'high', description: '15 mins expiration pressure tactic', scoreImpact: 25 },
            { type: 'reward', name: 'Unsolicited Reward Claim', severity: 'critical', description: 'Unrealistic cash prize claim (₹50,000)', scoreImpact: 35 },
            { type: 'url', name: 'Suspicious HTTP Link', severity: 'high', description: 'Unencrypted prize claim portal', scoreImpact: 22 },
            { type: 'financial', name: 'Financial Bait', severity: 'medium', description: 'High likelihood of advance-fee fraud', scoreImpact: 10 }
          ],
          technicalSignals: [
            { category: 'Urgency', key: 'Expiration Warning', value: '15 mins', status: 'malicious', details: 'Psychological panic inducer' },
            { category: 'Financial', key: 'Reward Amount', value: '₹50,000', status: 'malicious', details: 'Advance fee bait' },
            { category: 'Embedded URL', key: 'Protocol', value: 'http', status: 'suspicious', details: 'Unencrypted landing link' }
          ],
          riskBreakdown: {
            domainRisk: 20,
            urlStructureRisk: 22,
            sslRisk: 10,
            reputationRisk: 0,
            contentRisk: 40,
            aiRisk: 0,
            contributingSignals: [
              { category: 'Content', factor: 'Urgency Pattern', points: 25, reason: 'Fear-of-missing-out panic trigger' },
              { category: 'Content', factor: 'Fake Financial Incentive', points: 35, reason: 'Unsolicited prize claim' },
              { category: 'URL', factor: 'Unencrypted Link', points: 22, reason: 'Plain HTTP destination' },
              { category: 'Pattern', factor: 'Social Engineering', points: 10, reason: 'Advance fee fraud pattern' }
            ]
          },
          recommendations: [
            'Do NOT click the link or reply to the sender.',
            'Never pay an upfront fee to claim prizes or lottery winnings.',
            'Block and report the sender phone number or email.'
          ],
          threatIntelligence: {
            heuristicEngine: {
              status: 'Urgency & Financial Scam Patterns Detected',
              rulesTriggered: ['Artificial Urgency (15 mins)', 'Advance-Fee Prize Lure', 'Insecure HTTP Link']
            },
            dnsStatus: {
              status: 'Suspicious TLD (.info unverified destination)',
              isResolved: true
            }
          },
          externalReputation: {
            threatIntelFeed: 'Linguistic manipulation & urgency trigger filter',
            dnsVerification: 'Embedded links extracted (lottery-claim-prize.info)',
            isHeuristicOnly: false
          },
          metadata: {
            timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
            analysisDurationMs: 380,
            aiModelUsed: 'gemini-3.8-flash',
            isAiFallback: false
          }
        }
      ];

      this.data.scans = sampleScans;
      this.saveData();
    }
  }

  // Scans with strict user isolation
  public getScans(userId?: string): SecurityAnalysisResult[] {
    let scans = this.data.scans;
    if (userId) {
      scans = scans.filter(s => s.userId === userId);
    }
    return [...scans].sort((a, b) => new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime());
  }

  public getScanById(id: string): SecurityAnalysisResult | undefined {
    return this.data.scans.find(s => s.id === id);
  }

  public saveScan(scan: SecurityAnalysisResult): SecurityAnalysisResult {
    this.data.scans.unshift(scan);
    // Keep max 500 items in store
    if (this.data.scans.length > 500) {
      this.data.scans = this.data.scans.slice(0, 500);
    }
    this.saveData();
    return scan;
  }

  public deleteScan(id: string, userId: string): { success: boolean; notFound?: boolean; unauthorized?: boolean } {
    const index = this.data.scans.findIndex(s => s.id === id);
    if (index === -1) {
      return { success: false, notFound: true };
    }
    const scan = this.data.scans[index];
    if (scan.userId && scan.userId !== userId) {
      return { success: false, unauthorized: true };
    }
    this.data.scans.splice(index, 1);
    this.saveData();
    return { success: true };
  }

  public clearUserScans(userId: string): number {
    const initialLen = this.data.scans.length;
    this.data.scans = this.data.scans.filter(s => s.userId !== userId);
    const removed = initialLen - this.data.scans.length;
    if (removed > 0) {
      this.saveData();
    }
    return removed;
  }

  public clearAllScans(): void {
    this.data.scans = [];
    this.saveData();
  }

  // Anonymous Sessions Management
  public getAnonymousSession(sessionId: string, ip?: string): StoredAnonymousSession {
    if (!this.data.anonymousSessions) {
      this.data.anonymousSessions = [];
    }
    let session = this.data.anonymousSessions.find(s => s.sessionId === sessionId);
    if (!session) {
      const now = new Date();
      session = {
        sessionId,
        scanCount: 0,
        scanIds: [],
        ip,
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      this.data.anonymousSessions.push(session);
      this.saveData();
    }
    return session;
  }

  public recordAnonymousScan(sessionId: string, scanId: string, ip?: string): StoredAnonymousSession {
    const session = this.getAnonymousSession(sessionId, ip);
    session.scanCount += 1;
    if (!session.scanIds.includes(scanId)) {
      session.scanIds.push(scanId);
    }
    session.lastScanAt = new Date().toISOString();
    if (ip) {
      session.ip = ip;
    }
    this.saveData();
    return session;
  }

  public transferAnonymousScans(sessionId?: string, userId?: string): number {
    if (!sessionId || !userId) return 0;
    let transferred = 0;
    for (const scan of this.data.scans) {
      if (scan.anonymousSessionId === sessionId && !scan.userId) {
        scan.userId = userId;
        transferred++;
      }
    }
    if (transferred > 0) {
      this.saveData();
    }
    return transferred;
  }

  // Users with strict email normalization & security
  public getUserByEmail(email: string): StoredUser | undefined {
    const normalized = email.trim().toLowerCase();
    return this.data.users.find(u => 
      (u.normalizedEmail && u.normalizedEmail === normalized) ||
      u.email.toLowerCase() === normalized
    );
  }

  public getUserById(id: string): StoredUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(user: StoredUser): StoredUser {
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  public updateUser(id: string, updates: Partial<StoredUser>): StoredUser | undefined {
    const user = this.getUserById(id);
    if (!user) return undefined;
    Object.assign(user, updates);
    this.saveData();
    return user;
  }

  public deleteUser(id: string): boolean {
    this.clearUserScans(id);
    const len = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    if (this.data.users.length !== len) {
      this.saveData();
      return true;
    }
    return false;
  }
}

export const db = new StorageManager();
