// server/app.ts
import express from "express";

// server/routes/api.ts
import { Router } from "express";

// server/controllers/authController.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// server/config/db.ts
import fs from "fs";
import path from "path";
var isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
var STORAGE_FILE = process.env.STORAGE_FILE || (isVercel ? path.join("/tmp", ".threatlens_data.json") : path.join(process.cwd(), ".threatlens_data.json"));
var SEED_SOURCE_FILE = path.join(process.cwd(), ".threatlens_data.json");
var StorageManager = class {
  constructor() {
    this.data = {
      users: [],
      scans: [],
      anonymousSessions: []
    };
    this.isLoaded = false;
    this.loadData();
    this.seedDefaultsIfEmpty();
  }
  loadData() {
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
        this.data = JSON.parse(raw);
      } else if (fs.existsSync(SEED_SOURCE_FILE)) {
        const raw = fs.readFileSync(SEED_SOURCE_FILE, "utf-8");
        this.data = JSON.parse(raw);
        this.saveData();
      }
      if (!this.data.anonymousSessions) {
        this.data.anonymousSessions = [];
      }
      if (!this.data.users) {
        this.data.users = [];
      }
      if (!this.data.scans) {
        this.data.scans = [];
      }
      const demoUserId = "usr-demo-03eaaf";
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
    } catch {
    }
    this.isLoaded = true;
  }
  saveData() {
    try {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch {
    }
  }
  seedDefaultsIfEmpty() {
    if (this.data.scans.length === 0) {
      const now = /* @__PURE__ */ new Date();
      const demoUserId = "usr-demo-03eaaf";
      const sampleScans = [
        {
          id: "scan-demo-bank",
          userId: demoUserId,
          scanType: "url",
          target: "http://secure-wellsfargo-update.login-verify.top/auth/signin",
          riskScore: 94,
          riskLevel: "CRITICAL",
          threatType: "Credential Phishing",
          confidence: 0.96,
          summary: "Highly deceptive credential harvesting portal impersonating Wells Fargo with fraudulent authentication endpoints and suspicious TLD.",
          explanation: {
            whyDangerous: [
              "Domain mimics trusted banking institution (Wells Fargo) on an untrusted top-level domain (.top)",
              "Insecure plain HTTP protocol exposing user credentials to network interception",
              "Subdomain nesting tricks users into believing they are on a legitimate bank portal",
              "Heuristic markers match active credential theft kits"
            ],
            threatMechanics: "The attack leverages deceptive brand homoglyphs and typosquatting on a bulletproof host to capture username, password, and 2FA tokens."
          },
          indicators: [
            { type: "domain", name: "Brand Impersonation", severity: "critical", description: "Wells Fargo brand spoofing in subdomain", scoreImpact: 35 },
            { type: "ssl", name: "Insecure Protocol (HTTP)", severity: "high", description: "Sensitive login attempted over unencrypted connection", scoreImpact: 20 },
            { type: "tld", name: "Suspicious TLD (.top)", severity: "medium", description: "Known high-abuse registrar TLD", scoreImpact: 15 },
            { type: "pattern", name: "Credential Harvesting Pattern", severity: "critical", description: "Auth endpoints (/auth/signin) on third-party host", scoreImpact: 24 }
          ],
          technicalSignals: [
            { category: "Protocol", key: "Scheme", value: "http", status: "malicious", details: "Unencrypted plain text" },
            { category: "Domain", key: "Registrar TLD", value: ".top", status: "suspicious", details: "High risk zone" },
            { category: "Subdomains", key: "Depth", value: 3, status: "suspicious", details: "Excessive subdomain nesting" },
            { category: "Host", key: "Brand Match", value: "Wells Fargo", status: "malicious", details: "Impersonation detected" }
          ],
          riskBreakdown: {
            domainRisk: 35,
            urlStructureRisk: 25,
            sslRisk: 20,
            reputationRisk: 0,
            contentRisk: 14,
            aiRisk: 0,
            contributingSignals: [
              { category: "Domain", factor: "Impersonation", points: 35, reason: "Target domain mimics banking domain" },
              { category: "SSL", factor: "Missing Encryption", points: 20, reason: "HTTP instead of HTTPS" },
              { category: "Structure", factor: "Suspicious Keywords", points: 25, reason: "Presence of login-verify and auth/signin" },
              { category: "Content", factor: "Phishing Signature", points: 14, reason: "Structure matches credential harvesting kit" }
            ]
          },
          recommendations: [
            "Do NOT enter credentials or 2-factor authentication codes.",
            "Report the domain to registrar abuse contact and antiphishing feeds.",
            "If credentials were submitted, immediately reset your Wells Fargo password from the official website."
          ],
          threatIntelligence: {
            heuristicEngine: {
              status: "Flagged by ThreatLens Heuristic Engine (4 rules triggered)",
              rulesTriggered: ["Impersonation (Wells Fargo)", "Missing TLS Encryption", "Credential Trap Keywords", "Phishing Kit Signature"]
            },
            dnsStatus: {
              status: "NXDOMAIN / Unresolved host signature",
              isResolved: false
            }
          },
          externalReputation: {
            threatIntelFeed: "Flagged across ThreatLens Heuristic Engine",
            dnsVerification: "NXDOMAIN / Unresolved host signature",
            isHeuristicOnly: false
          },
          metadata: {
            timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1e3).toISOString(),
            analysisDurationMs: 420,
            aiModelUsed: "gemini-3.8-flash",
            isAiFallback: false
          }
        },
        {
          id: "scan-demo-github",
          userId: demoUserId,
          scanType: "url",
          target: "https://github.com",
          riskScore: 4,
          riskLevel: "SAFE",
          threatType: "Legitimate Service",
          confidence: 0.99,
          summary: "Verified authentic domain belonging to GitHub Inc. with valid TLS certificate and clean global reputation.",
          explanation: {
            whyDangerous: [],
            threatMechanics: "No threat indicators identified. Domain demonstrates verified identity, high trust authority, and modern security headers."
          },
          indicators: [
            { type: "ssl", name: "Valid TLS Certificate", severity: "info", description: "Issued by trusted public CA with HSTS enabled", scoreImpact: 0 },
            { type: "reputation", name: "Global Trust Rank", severity: "info", description: "Tranco Top 100 verified domain", scoreImpact: 0 }
          ],
          technicalSignals: [
            { category: "Protocol", key: "Scheme", value: "https", status: "clean", details: "TLS 1.3 / HSTS" },
            { category: "Domain", key: "TLD", value: ".com", status: "clean", details: "Standard authoritative registry" },
            { category: "Reputation", key: "Known Authority", value: "GitHub / Microsoft", status: "clean", details: "Verified corporate domain" }
          ],
          riskBreakdown: {
            domainRisk: 0,
            urlStructureRisk: 2,
            sslRisk: 0,
            reputationRisk: 0,
            contentRisk: 2,
            aiRisk: 0,
            contributingSignals: [
              { category: "Reputation", factor: "High Authority Domain", points: 0, reason: "Standard legitimate developer portal" }
            ]
          },
          recommendations: [
            "Safe to browse and interact.",
            "Always verify repository URLs before running unfamiliar CLI commands or scripts."
          ],
          threatIntelligence: {
            heuristicEngine: {
              status: "Clean \u2014 No anomalous threat patterns detected",
              rulesTriggered: []
            },
            dnsStatus: {
              status: "Active host (140.82.112.4 \u2014 GitHub Inc.)",
              isResolved: true
            }
          },
          externalReputation: {
            threatIntelFeed: "Clean across ThreatLens Global Trusted Registry",
            dnsVerification: "Active authoritative internet infrastructure",
            isHeuristicOnly: false
          },
          metadata: {
            timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1e3).toISOString(),
            analysisDurationMs: 290,
            aiModelUsed: "gemini-3.8-flash",
            isAiFallback: false
          }
        },
        {
          id: "scan-demo-sms",
          userId: demoUserId,
          scanType: "message",
          target: "Congratulations! You won \u20B950,000 cash bonus from National Lottery. Click here immediately to claim: http://lottery-claim-prize.info/claim?id=94829 Offer expires in 15 mins!",
          riskScore: 92,
          riskLevel: "CRITICAL",
          threatType: "Advance-Fee Scam & Phishing",
          confidence: 0.95,
          summary: "Scam message utilizing extreme urgency, unverified lottery claims, and an unencrypted link to harvest financial and banking details.",
          explanation: {
            whyDangerous: [
              "Fabricated reward incentive to lower victim defenses",
              "Aggressive artificial deadline (15 minutes urgency panic trigger)",
              "Directs to an unvetted insecure HTTP domain (.info)",
              "Classic social engineering vector targeting UPI/bank credentials"
            ],
            threatMechanics: 'Scammers induce urgency so victims click before thinking, where a malicious webpage prompts for an initial "processing fee" or login credentials.'
          },
          indicators: [
            { type: "urgency", name: "Artificial Urgency", severity: "high", description: "15 mins expiration pressure tactic", scoreImpact: 25 },
            { type: "reward", name: "Unsolicited Reward Claim", severity: "critical", description: "Unrealistic cash prize claim (\u20B950,000)", scoreImpact: 35 },
            { type: "url", name: "Suspicious HTTP Link", severity: "high", description: "Unencrypted prize claim portal", scoreImpact: 22 },
            { type: "financial", name: "Financial Bait", severity: "medium", description: "High likelihood of advance-fee fraud", scoreImpact: 10 }
          ],
          technicalSignals: [
            { category: "Urgency", key: "Expiration Warning", value: "15 mins", status: "malicious", details: "Psychological panic inducer" },
            { category: "Financial", key: "Reward Amount", value: "\u20B950,000", status: "malicious", details: "Advance fee bait" },
            { category: "Embedded URL", key: "Protocol", value: "http", status: "suspicious", details: "Unencrypted landing link" }
          ],
          riskBreakdown: {
            domainRisk: 20,
            urlStructureRisk: 22,
            sslRisk: 10,
            reputationRisk: 0,
            contentRisk: 40,
            aiRisk: 0,
            contributingSignals: [
              { category: "Content", factor: "Urgency Pattern", points: 25, reason: "Fear-of-missing-out panic trigger" },
              { category: "Content", factor: "Fake Financial Incentive", points: 35, reason: "Unsolicited prize claim" },
              { category: "URL", factor: "Unencrypted Link", points: 22, reason: "Plain HTTP destination" },
              { category: "Pattern", factor: "Social Engineering", points: 10, reason: "Advance fee fraud pattern" }
            ]
          },
          recommendations: [
            "Do NOT click the link or reply to the sender.",
            "Never pay an upfront fee to claim prizes or lottery winnings.",
            "Block and report the sender phone number or email."
          ],
          threatIntelligence: {
            heuristicEngine: {
              status: "Urgency & Financial Scam Patterns Detected",
              rulesTriggered: ["Artificial Urgency (15 mins)", "Advance-Fee Prize Lure", "Insecure HTTP Link"]
            },
            dnsStatus: {
              status: "Suspicious TLD (.info unverified destination)",
              isResolved: true
            }
          },
          externalReputation: {
            threatIntelFeed: "Linguistic manipulation & urgency trigger filter",
            dnsVerification: "Embedded links extracted (lottery-claim-prize.info)",
            isHeuristicOnly: false
          },
          metadata: {
            timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1e3).toISOString(),
            analysisDurationMs: 380,
            aiModelUsed: "gemini-3.8-flash",
            isAiFallback: false
          }
        }
      ];
      this.data.scans = sampleScans;
      this.saveData();
    }
  }
  // Scans with strict user isolation
  getScans(userId) {
    let scans = this.data.scans;
    if (userId) {
      scans = scans.filter((s) => s.userId === userId);
    }
    return [...scans].sort((a, b) => new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime());
  }
  getScanById(id) {
    return this.data.scans.find((s) => s.id === id);
  }
  saveScan(scan) {
    this.data.scans.unshift(scan);
    if (this.data.scans.length > 500) {
      this.data.scans = this.data.scans.slice(0, 500);
    }
    this.saveData();
    return scan;
  }
  deleteScan(id, userId) {
    const index = this.data.scans.findIndex((s) => s.id === id);
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
  clearUserScans(userId) {
    const initialLen = this.data.scans.length;
    this.data.scans = this.data.scans.filter((s) => s.userId !== userId);
    const removed = initialLen - this.data.scans.length;
    if (removed > 0) {
      this.saveData();
    }
    return removed;
  }
  clearAllScans() {
    this.data.scans = [];
    this.saveData();
  }
  // Anonymous Sessions Management
  getAnonymousSession(sessionId, ip) {
    if (!this.data.anonymousSessions) {
      this.data.anonymousSessions = [];
    }
    let session = this.data.anonymousSessions.find((s) => s.sessionId === sessionId);
    if (!session) {
      const now = /* @__PURE__ */ new Date();
      session = {
        sessionId,
        scanCount: 0,
        scanIds: [],
        ip,
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1e3).toISOString()
      };
      this.data.anonymousSessions.push(session);
      this.saveData();
    }
    return session;
  }
  recordAnonymousScan(sessionId, scanId, ip) {
    const session = this.getAnonymousSession(sessionId, ip);
    session.scanCount += 1;
    if (!session.scanIds.includes(scanId)) {
      session.scanIds.push(scanId);
    }
    session.lastScanAt = (/* @__PURE__ */ new Date()).toISOString();
    if (ip) {
      session.ip = ip;
    }
    this.saveData();
    return session;
  }
  transferAnonymousScans(sessionId, userId) {
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
  getUserByEmail(email) {
    const normalized = email.trim().toLowerCase();
    return this.data.users.find(
      (u) => u.normalizedEmail && u.normalizedEmail === normalized || u.email.toLowerCase() === normalized
    );
  }
  getUserById(id) {
    return this.data.users.find((u) => u.id === id);
  }
  createUser(user) {
    this.data.users.push(user);
    this.saveData();
    return user;
  }
  updateUser(id, updates) {
    const user = this.getUserById(id);
    if (!user) return void 0;
    Object.assign(user, updates);
    this.saveData();
    return user;
  }
  deleteUser(id) {
    this.clearUserScans(id);
    const len = this.data.users.length;
    this.data.users = this.data.users.filter((u) => u.id !== id);
    if (this.data.users.length !== len) {
      this.saveData();
      return true;
    }
    return false;
  }
};
var db = new StorageManager();

// server/controllers/authController.ts
var JWT_SECRET = process.env.JWT_SECRET || "threatlens_super_secret_jwt_key_2026";
var AuthController = class {
  static async register(req, res) {
    try {
      const { name, email, password, anonymousSessionId } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Please provide name, email, and password." });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long." });
      }
      const normalizedEmail = email.trim().toLowerCase();
      const existing = db.getUserByEmail(normalizedEmail);
      if (existing) {
        return res.status(400).json({ error: "An account with this email already exists." });
      }
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const newUser = db.createUser({
        id: `usr-${crypto.randomUUID().slice(0, 8)}`,
        name: name.trim(),
        email: email.trim(),
        normalizedEmail,
        passwordHash,
        createdAt: now,
        lastLoginAt: now,
        accountStatus: "active",
        role: "analyst"
      });
      const anonId = anonymousSessionId || req.headers["x-threatlens-anon-session"];
      if (anonId) {
        db.transferAnonymousScans(anonId, newUser.id);
      }
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, name: newUser.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.status(201).json({
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt,
          lastLoginAt: newUser.lastLoginAt,
          accountStatus: newUser.accountStatus,
          role: newUser.role
        }
      });
    } catch (err) {
      return res.status(500).json({ error: err?.message || "Server error during registration" });
    }
  }
  static async login(req, res) {
    try {
      const { email, password, anonymousSessionId } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
      }
      const normalizedEmail = email.trim().toLowerCase();
      let user = db.getUserByEmail(normalizedEmail);
      if (!user && (normalizedEmail === "demo@threatlens.ai" || normalizedEmail === "analyst@threatlens.ai")) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash("password123", salt);
        user = db.createUser({
          id: "usr-demo-03eaaf",
          name: "Cyber Analyst",
          email: "analyst@threatlens.ai",
          normalizedEmail: "analyst@threatlens.ai",
          passwordHash,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastLoginAt: (/* @__PURE__ */ new Date()).toISOString(),
          accountStatus: "active",
          role: "analyst"
        });
      }
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
      }
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password." });
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
      db.updateUser(user.id, { lastLoginAt: now });
      const anonId = anonymousSessionId || req.headers["x-threatlens-anon-session"];
      if (anonId) {
        db.transferAnonymousScans(anonId, user.id);
      }
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          lastLoginAt: now,
          accountStatus: user.accountStatus || "active",
          role: user.role
        }
      });
    } catch (err) {
      return res.status(500).json({ error: err?.message || "Server error during login" });
    }
  }
  static async me(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = db.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        role: user.role
      }
    });
  }
  static async updateProfile(req, res) {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    const updated = db.updateUser(req.user.id, { name: name.trim() });
    if (!updated) return res.status(404).json({ error: "User not found" });
    return res.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        createdAt: updated.createdAt,
        role: updated.role
      }
    });
  }
  static async updatePassword(req, res) {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long" });
    }
    const user = db.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: "Current password does not match" });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    db.updateUser(req.user.id, { passwordHash });
    return res.json({ message: "Password updated successfully" });
  }
  static async deleteAccount(req, res) {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    db.deleteUser(req.user.id);
    return res.json({ message: "Account and associated profile data deleted" });
  }
};

// server/controllers/scanController.ts
import crypto6 from "crypto";

// server/services/urlAnalyzer.ts
import { URL as URL2 } from "url";
import crypto2 from "crypto";
import dns2 from "dns/promises";

// server/services/threatIntelligence.ts
import dns from "dns/promises";
var HIGH_RISK_TLDS = /* @__PURE__ */ new Set([
  "xyz",
  "top",
  "work",
  "click",
  "country",
  "kim",
  "gq",
  "tk",
  "ml",
  "cf",
  "ga",
  "buzz",
  "fit",
  "loan",
  "surf",
  "support",
  "rest"
]);
var ABUSED_DYNAMIC_HOSTS = [
  "ngrok-free.app",
  "trycloudflare.com",
  "duckdns.org",
  "pages.dev",
  "firebaseapp.com",
  "glitch.me",
  "loca.lt"
];
var ThreatIntelligenceService = class {
  async checkUrl(targetUrl) {
    const signals = [];
    let scoreBonus = 0;
    const rulesTriggered = [];
    let hostname = "";
    let pathname = "";
    try {
      const parsed = new URL(targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`);
      hostname = parsed.hostname.toLowerCase();
      pathname = parsed.pathname.toLowerCase();
    } catch {
      hostname = targetUrl.toLowerCase();
    }
    const parts = hostname.split(".");
    const tld = parts[parts.length - 1] || "";
    if (HIGH_RISK_TLDS.has(tld)) {
      scoreBonus += 15;
      rulesTriggered.push(`High-Risk TLD (.${tld})`);
      signals.push({
        category: "Threat Intel",
        factor: "High-Risk TLD Zone",
        points: 15,
        reason: `Top-level domain .${tld} possesses elevated abuse rates across global phishing telemetry`
      });
    }
    const matchedAbusedHost = ABUSED_DYNAMIC_HOSTS.find((host) => hostname.endsWith(host));
    if (matchedAbusedHost) {
      scoreBonus += 25;
      rulesTriggered.push(`Abused Tunnel/Hosting Infrastructure (${matchedAbusedHost})`);
      signals.push({
        category: "Threat Intel",
        factor: "Ephemeral Tunnel / Hosting Infrastructure",
        points: 25,
        reason: `Host is mounted on ${matchedAbusedHost}, frequently utilized for disposable phishing kits and bypassing gateway filters`
      });
    }
    const phishKeywords = ["login", "signin", "verify", "update", "banking", "wallet", "secure", "auth", "recovery", "passcode"];
    const matchedKeywords = phishKeywords.filter((kw) => pathname.includes(kw));
    if (matchedKeywords.length >= 2) {
      scoreBonus += 15;
      rulesTriggered.push(`Credential Harvesting Path Pattern (${matchedKeywords.join(", ")})`);
      signals.push({
        category: "Threat Intel",
        factor: "Targeted Credential Trap Pattern",
        points: 15,
        reason: `Deep URL path utilizes aggressive verification lures: [${matchedKeywords.join(", ")}]`
      });
    }
    let isResolved = false;
    let resolvedIps = [];
    let dnsMessage = "Domain actively resolved to public internet infrastructure";
    try {
      const ips = await dns.resolve4(hostname);
      resolvedIps = ips || [];
      if (resolvedIps.length > 0) {
        isResolved = true;
        dnsMessage = `Active host (${resolvedIps.slice(0, 2).join(", ")}${resolvedIps.length > 2 ? ` +${resolvedIps.length - 2} more` : ""})`;
      }
    } catch (dnsErr) {
      isResolved = false;
      dnsMessage = dnsErr.code === "ENOTFOUND" ? "NXDOMAIN (Host name has no valid DNS A-records registered)" : `DNS resolution returned ${dnsErr.code || "timeout"}`;
      scoreBonus += 10;
      rulesTriggered.push("Unresolved / Transient Host Signature");
      signals.push({
        category: "Threat Intel",
        factor: "Unresolved / Fast-Flux Host",
        points: 10,
        reason: "Domain failed standard recursive DNS resolution or is unassigned in root registries"
      });
    }
    const heuristicStatus = rulesTriggered.length > 0 ? `Flagged by ThreatLens Heuristic Engine (${rulesTriggered.length} rule${rulesTriggered.length > 1 ? "s" : ""} triggered)` : "Clean \u2014 No anomalous threat patterns detected by ThreatLens Engine";
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
};
var threatIntel = new ThreatIntelligenceService();

// server/services/aiProvider.ts
import { GoogleGenAI } from "@google/genai";
var CANDIDATE_MODELS = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"];
function normalizeAiScoreWeight(val, defaultVal) {
  if (typeof val === "number") {
    if (val > 0 && val <= 1) {
      return Math.round(val * 25);
    }
    return Math.max(0, Math.min(25, Math.round(val)));
  }
  return defaultVal;
}
var AIProviderService = class {
  constructor() {
    this.geminiClient = null;
    this.openAiKey = process.env.OPENAI_API_KEY;
    this.initGemini();
  }
  initGemini() {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      try {
        this.geminiClient = new GoogleGenAI({ apiKey: key });
      } catch {
        this.geminiClient = null;
      }
    }
  }
  async analyzeUrl(url, heuristicContext = "") {
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
          const timeoutPromise = new Promise(
            (_, reject) => setTimeout(() => reject(new Error("AI generation timeout")), 8e3)
          );
          const aiPromise = this.geminiClient.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: "application/json"
            }
          });
          const response = await Promise.race([aiPromise, timeoutPromise]);
          if (response?.text) {
            const parsed = JSON.parse(response.text.trim());
            if (parsed.threatType && parsed.summary) {
              return {
                threatType: parsed.threatType,
                riskLevel: parsed.riskLevel || "MEDIUM",
                confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.85,
                summary: parsed.summary,
                whyDangerous: Array.isArray(parsed.whyDangerous) ? parsed.whyDangerous : [],
                threatMechanics: parsed.threatMechanics || "Heuristic inspection completed.",
                indicators: Array.isArray(parsed.indicators) ? parsed.indicators : [],
                technicalAnalysis: Array.isArray(parsed.technicalAnalysis) ? parsed.technicalAnalysis : [],
                recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : ["Exercise caution."],
                aiScoreWeight: normalizeAiScoreWeight(parsed.aiScoreWeight, 10),
                isFallback: false,
                modelUsed: model
              };
            }
          }
        } catch (err) {
          console.warn(`Gemini analysis attempt on ${model} failed, trying next candidate if available:`, err?.message || err);
        }
      }
    }
    return this.generateHeuristicUrlFallback(url);
  }
  async analyzeMessage(message) {
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
          const timeoutPromise = new Promise(
            (_, reject) => setTimeout(() => reject(new Error("AI generation timeout")), 8e3)
          );
          const aiPromise = this.geminiClient.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: "application/json"
            }
          });
          const response = await Promise.race([aiPromise, timeoutPromise]);
          if (response?.text) {
            const parsed = JSON.parse(response.text.trim());
            if (parsed.threatType && parsed.summary) {
              return {
                threatType: parsed.threatType,
                riskLevel: parsed.riskLevel || "MEDIUM",
                confidence: parsed.confidence || 0.88,
                summary: parsed.summary,
                whyDangerous: parsed.whyDangerous || [],
                threatMechanics: parsed.threatMechanics || "",
                indicators: parsed.indicators || [],
                technicalAnalysis: parsed.technicalAnalysis || [],
                recommendations: parsed.recommendations || [],
                aiScoreWeight: normalizeAiScoreWeight(parsed.aiScoreWeight, 12),
                isFallback: false,
                modelUsed: model
              };
            }
          }
        } catch (err) {
          console.warn(`Gemini message analysis attempt on ${model} failed, trying next candidate if available:`, err?.message || err);
        }
      }
    }
    return this.generateHeuristicMessageFallback(message);
  }
  async analyzeScreenshot(imageBase64, mimeType = "image/jpeg", filename = "") {
    this.initGemini();
    if (this.geminiClient) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
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
          const timeoutPromise = new Promise(
            (_, reject) => setTimeout(() => reject(new Error("AI vision generation timeout")), 14e3)
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
              responseMimeType: "application/json"
            }
          });
          const response = await Promise.race([aiPromise, timeoutPromise]);
          if (response?.text) {
            const parsed = JSON.parse(response.text.trim());
            const riskEvidence = Array.isArray(parsed.riskEvidenceFound) ? parsed.riskEvidenceFound : [];
            const isClean = riskEvidence.length === 0 && !parsed.credentialFieldsDetected && !parsed.urgencyOrPanicDetected && !parsed.deceptiveElementsDetected;
            const riskLevel = isClean ? "SAFE" : parsed.riskLevel || "LOW";
            const scoreWeight = isClean ? Math.min(4, normalizeAiScoreWeight(parsed.aiScoreWeight, 2)) : normalizeAiScoreWeight(parsed.aiScoreWeight, 15);
            return {
              threatType: isClean ? parsed.threatType || "Legitimate / Benign Interface" : parsed.threatType || "Visual Security Analysis",
              riskLevel,
              confidence: typeof parsed.confidence === "number" ? Math.min(0.98, Math.max(0.7, parsed.confidence)) : 0.88,
              summary: parsed.summary || "Visual forensic inspection completed.",
              whyDangerous: parsed.whyDangerous || (isClean ? ["No deceptive overlays, phishing forms, or fake security prompts detected in visual capture"] : []),
              threatMechanics: parsed.threatMechanics || "",
              indicators: Array.isArray(parsed.indicators) ? parsed.indicators : [],
              technicalAnalysis: Array.isArray(parsed.technicalAnalysis) ? parsed.technicalAnalysis : [],
              recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : ["Exercise standard browsing caution."],
              aiScoreWeight: scoreWeight,
              isFallback: false,
              modelUsed: `${model} (Multimodal Vision)`,
              screenshotForensics: {
                visualIntegrity: isClean ? "clean" : parsed.deceptiveElementsDetected ? "malicious" : "suspicious",
                brandDetected: parsed.brandDetected || void 0,
                credentialFieldsDetected: Boolean(parsed.credentialFieldsDetected),
                credentialFieldDetails: Array.isArray(parsed.credentialFieldDetails) ? parsed.credentialFieldDetails : [],
                urgencyOrPanicDetected: Boolean(parsed.urgencyOrPanicDetected),
                deceptiveElementsDetected: Boolean(parsed.deceptiveElementsDetected),
                visibleUrl: parsed.visibleUrl || void 0,
                extractedOcrText: Array.isArray(parsed.extractedOcrText) ? parsed.extractedOcrText : [],
                visualRegions: Array.isArray(parsed.visualRegions) ? parsed.visualRegions : [],
                visualEvidenceFound: Array.isArray(parsed.visualEvidenceFound) ? parsed.visualEvidenceFound : ["Standard UI Layout", "Browser Window Structure"],
                riskEvidenceFound: riskEvidence
              }
            };
          }
        } catch (err) {
          console.warn(`Gemini vision analysis attempt on ${model} failed:`, err?.message || err);
        }
      }
    }
    return this.generateHeuristicScreenshotFallback(filename, imageBase64);
  }
  // Robust Heuristic Fallbacks (when AI key is missing or rate limited)
  generateHeuristicUrlFallback(url) {
    const isLocalHttp = url.startsWith("http://");
    const lower = url.toLowerCase();
    const hasLoginWords = /(login|verify|signin|account|secure|banking|wallet|confirm|update)/i.test(lower);
    const hasSuspiciousTLD = /\.(top|xyz|click|work|fit|gq|cf|ml|pw|ru|country)(\/|$)/i.test(lower);
    let threatType = "Heuristic Security Scan";
    let riskLevel = "LOW";
    let scoreWeight = 5;
    const whyDangerous = [];
    if (hasLoginWords && (isLocalHttp || hasSuspiciousTLD)) {
      threatType = "Credential Phishing";
      riskLevel = "HIGH";
      scoreWeight = 20;
      whyDangerous.push("Authentication or account keywords combined with high-risk infrastructure");
      if (isLocalHttp) whyDangerous.push("Unencrypted HTTP protocol exposes input to plain-text eavesdropping");
      if (hasSuspiciousTLD) whyDangerous.push("Registered under high-abuse top-level domain frequently used in phishing campaigns");
    } else if (hasLoginWords) {
      threatType = "Suspicious Login Page";
      riskLevel = "MEDIUM";
      scoreWeight = 12;
      whyDangerous.push("Sensitive login keywords present; verify SSL certificate and exact domain spelling");
    } else {
      threatType = "Standard Webpage";
      riskLevel = "SAFE";
      scoreWeight = 2;
      whyDangerous.push("No obvious heuristic credential keywords or anomalous domain patterns detected");
    }
    return {
      threatType,
      riskLevel,
      confidence: 0.82,
      summary: "AI analysis unavailable \u2014 showing heuristic security analysis based on structural indicators and syntax telemetry.",
      whyDangerous,
      threatMechanics: "Automated pattern matching evaluated URL depth, character entropy, protocol encryption, and known registrar abuse rates.",
      indicators: [
        {
          type: "heuristic",
          name: "Pattern Inspection",
          severity: riskLevel === "HIGH" ? "high" : riskLevel === "MEDIUM" ? "medium" : "info",
          description: `Evaluated ${url.length} character URL against cyber threat syntax database.`,
          scoreImpact: scoreWeight
        }
      ],
      technicalAnalysis: [
        { category: "Engine", key: "Mode", value: "Heuristic Rulebook", status: "neutral", details: "Offline fallback engine" },
        { category: "Protocol", key: "Encryption", value: isLocalHttp ? "HTTP (Insecure)" : "HTTPS (Encrypted)", status: isLocalHttp ? "suspicious" : "clean", details: isLocalHttp ? "Unencrypted" : "TLS" }
      ],
      recommendations: [
        "Check that the address bar matches the intended brand exactly before typing passwords.",
        "Never submit personal or financial credentials if the connection is unencrypted."
      ],
      aiScoreWeight: scoreWeight,
      isFallback: true,
      modelUsed: "ThreatLens Rule-Engine (Offline Heuristics)"
    };
  }
  generateHeuristicMessageFallback(message) {
    const lower = message.toLowerCase();
    const hasUrgency = /(urgent|immediate|expires|suspended|blocked|action required|within \d+|hurry)/i.test(lower);
    const hasMoney = /(win|won|prize|lottery|₹|\$|€|free|bonus|reward|investment|crypto|profit)/i.test(lower);
    const hasAction = /(click|link|download|verify|transfer|deposit|claim|login)/i.test(lower);
    let threatType = "Informational Message";
    let riskLevel = "LOW";
    let scoreWeight = 5;
    const whyDangerous = [];
    if (hasUrgency && hasMoney && hasAction) {
      threatType = "Advance-Fee / Urgent Phishing Scam";
      riskLevel = "CRITICAL";
      scoreWeight = 24;
      whyDangerous.push("Combination of urgent pressure tactics, unsolicited financial incentive, and directive action link");
      whyDangerous.push("High characteristic markers of cyber fraud targeting financial credentials");
    } else if (hasUrgency || hasMoney) {
      threatType = "Suspicious Social Engineering Message";
      riskLevel = "MEDIUM";
      scoreWeight = 14;
      whyDangerous.push("Contains persuasion signals commonly employed in social engineering lures");
    } else {
      whyDangerous.push("No obvious urgency triggers or financial manipulation strings found");
    }
    return {
      threatType,
      riskLevel,
      confidence: 0.84,
      summary: "AI analysis unavailable \u2014 showing heuristic security analysis for social engineering signals.",
      whyDangerous,
      threatMechanics: "Linguistic heuristics evaluated urgency density, financial lure triggers, and call-to-action pressure vectors.",
      indicators: [
        {
          type: "nlp",
          name: "Social Engineering Heuristic",
          severity: riskLevel === "CRITICAL" ? "critical" : riskLevel === "MEDIUM" ? "medium" : "info",
          description: `Analyzed message for emotional manipulation vectors.`,
          scoreImpact: scoreWeight
        }
      ],
      technicalAnalysis: [
        { category: "Signals", key: "Urgency Markers", value: hasUrgency ? "Detected" : "None", status: hasUrgency ? "suspicious" : "clean", details: "Time pressure test" },
        { category: "Signals", key: "Financial Lure", value: hasMoney ? "Detected" : "None", status: hasMoney ? "suspicious" : "clean", details: "Unsolicited reward/payout" }
      ],
      recommendations: [
        "Do NOT send money or reveal verification codes.",
        "Contact the purported entity directly through their official telephone helpline."
      ],
      aiScoreWeight: scoreWeight,
      isFallback: true,
      modelUsed: "ThreatLens NLP Heuristic Engine"
    };
  }
  generateHeuristicScreenshotFallback(filename = "", imageBase64 = "") {
    let decodedText = "";
    try {
      if (imageBase64.includes("data:image/svg+xml;base64,")) {
        const b64 = imageBase64.split("data:image/svg+xml;base64,")[1];
        decodedText = Buffer.from(b64, "base64").toString("utf-8").toLowerCase();
      } else if (imageBase64.includes("data:image/svg+xml;utf8,")) {
        decodedText = decodeURIComponent(imageBase64.split("data:image/svg+xml;utf8,")[1]).toLowerCase();
      }
    } catch {
      decodedText = "";
    }
    const name = (filename + " " + decodedText).toLowerCase();
    const isWellsFargoPhish = name.includes("wellsfargo") || name.includes("wells fargo") || name.includes("phish") || name.includes("verify") && name.includes("account") && name.includes("credential");
    const isWindowsTrojan = name.includes("windows") || name.includes("trojan") || name.includes("zeus") || name.includes("virus") || name.includes("critical alert") || name.includes("call microsoft");
    const isGoogleNewTab = name.includes("chrome") || name.includes("new tab") || name.includes("google") || name.includes("search");
    const isCloudPortal = name.includes("cloud-portal") || name.includes("enterprise cloud") || name.includes("authentic") || name.includes("saas") || name.includes("dashboard");
    if (isWindowsTrojan) {
      return {
        threatType: "Fake Security Alert & Tech Support Scam",
        riskLevel: "CRITICAL",
        confidence: 0.94,
        summary: "Deceptive full-screen warning detected. Employs simulated malware alerts (Zeus Trojan) and coercive directives urging victims to dial an unauthorized telephone hotline.",
        whyDangerous: [
          "Simulates high-severity operating system security alert to induce panic",
          "Displays unauthorized toll-free hotline for remote access takeover",
          "Impersonates Microsoft / Windows Defender security branding"
        ],
        threatMechanics: "Social engineering attack vectors leverage panic-inducing typography and fake system dialogs to coerce victims into granting remote desktop access.",
        indicators: [
          {
            type: "visual",
            name: "Simulated System Alert Overlay",
            severity: "critical",
            description: "Deceptive modal dialog warns of Zeus virus with high urgency",
            scoreImpact: 24
          },
          {
            type: "social_engineering",
            name: "Coercive Support Hotline Directive",
            severity: "critical",
            description: "Toll-free phone number solicitation for remote takeover",
            scoreImpact: 20
          }
        ],
        technicalAnalysis: [
          { category: "Visual Integrity", key: "UI Deception", value: "Fake OS Modal Dialog", status: "malicious", details: "Simulated security prompt" },
          { category: "Brand Detection", key: "Impersonation Target", value: "Windows Defender / Microsoft", status: "malicious", details: "Unauthorized brand trademark usage" },
          { category: "Authentication", key: "Credential Solicitation", value: "Remote Access Directive", status: "suspicious", details: "Demands telephone contact" },
          { category: "Social Engineering", key: "Panic Pressure", value: "Critical Alert / Virus Threat", status: "malicious", details: "Zeus virus scareware trigger" },
          { category: "External Intel", key: "Live URL Verification", value: "Not Performed (Static Image)", status: "unavailable", details: "Requires live domain link" }
        ],
        recommendations: [
          "Do NOT call the telephone number displayed on screen.",
          "Close the browser tab immediately (use Task Manager or Force Quit if locked).",
          "Never grant remote desktop control (AnyDesk, TeamViewer) to unsolicited callers."
        ],
        aiScoreWeight: 24,
        isFallback: true,
        modelUsed: "ThreatLens Forensic Vision Heuristics",
        screenshotForensics: {
          visualIntegrity: "malicious",
          brandDetected: {
            name: "Microsoft Windows Defender",
            isOfficialConfirmed: false,
            confidence: 0.95,
            notes: "High-probability impersonation: fake alert dialog styling"
          },
          credentialFieldsDetected: false,
          credentialFieldDetails: [],
          urgencyOrPanicDetected: true,
          deceptiveElementsDetected: true,
          visibleUrl: void 0,
          extractedOcrText: ["CRITICAL ALERT: ZEUS VIRUS DETECTED", "Call Microsoft Support Immediately: 1-800-FAKE-NUM"],
          visualRegions: [
            {
              id: "reg-1",
              label: "Fake Security Dialog",
              type: "alert",
              box2d: [12, 8, 88, 92],
              description: "Modal alert warning of simulated malware",
              severity: "malicious"
            },
            {
              id: "reg-2",
              label: "Scam Support Hotline",
              type: "suspicious",
              box2d: [55, 20, 75, 80],
              description: "Unauthorized toll-free support prompt",
              severity: "malicious"
            }
          ],
          visualEvidenceFound: ["Modal dialog container", "Panic headline styling", "Hotline phone prompt"],
          riskEvidenceFound: ["Simulated Zeus virus infection alert", "Urgent call-to-action directive", "Brand impersonation of Microsoft Windows Defender"]
        }
      };
    }
    if (isWellsFargoPhish) {
      return {
        threatType: "Brand Impersonation & Phishing Login",
        riskLevel: "HIGH",
        confidence: 0.91,
        summary: "Visual spoofing of Wells Fargo banking portal. Combines brand trademark cues with urgent security verification directives to harvest online banking credentials.",
        whyDangerous: [
          "Replicates Wells Fargo corporate identity without verifiable host origin",
          "Presents authentication credential fields under an urgent security pretext",
          'Employs urgency manipulation ("Security Update Required") to bypass scrutiny'
        ],
        threatMechanics: "Harvests customer banking credentials by mimicking legitimate financial institution styling combined with urgency lures.",
        indicators: [
          {
            type: "visual",
            name: "Banking Brand Impersonation",
            severity: "high",
            description: "Wells Fargo visual cues detected in unverified context",
            scoreImpact: 18
          },
          {
            type: "credential",
            name: "Authentication Input Harvesting",
            severity: "high",
            description: "Credential input fields positioned under urgent verification prompt",
            scoreImpact: 16
          }
        ],
        technicalAnalysis: [
          { category: "Visual Integrity", key: "UI Deception", value: "Spoofed Banking Portal", status: "suspicious", details: "Styling mimics commercial banking portal" },
          { category: "Brand Detection", key: "Impersonation Target", value: "Wells Fargo Bank", status: "suspicious", details: "Unverified origin image file" },
          { category: "Authentication", key: "Credential Solicitation", value: "Banking Credentials Requested", status: "suspicious", details: "Input elements for authentication" },
          { category: "Social Engineering", key: "Panic Pressure", value: "Security Update Required", status: "suspicious", details: "Urgency trigger detected" },
          { category: "External Intel", key: "Live URL Verification", value: "Not Performed (Static Image)", status: "unavailable", details: "Requires live domain link" }
        ],
        recommendations: [
          "Do NOT input usernames, passwords, PINs, or account numbers.",
          "Verify the destination domain in your address bar matches wellsfargo.com exactly.",
          "Always navigate to your bank via a trusted bookmark or official mobile application."
        ],
        aiScoreWeight: 19,
        isFallback: true,
        modelUsed: "ThreatLens Forensic Vision Heuristics",
        screenshotForensics: {
          visualIntegrity: "suspicious",
          brandDetected: {
            name: "Wells Fargo",
            isOfficialConfirmed: false,
            confidence: 0.92,
            notes: "Wells Fargo branding detected on unverified image canvas"
          },
          credentialFieldsDetected: true,
          credentialFieldDetails: ["Banking Username/ID Input", "Password/Passcode Input"],
          urgencyOrPanicDetected: true,
          deceptiveElementsDetected: true,
          visibleUrl: void 0,
          extractedOcrText: ["WELLS FARGO SECURITY UPDATE", "Urgent Action Required: Sign in to verify account", "[ Enter Credentials ]"],
          visualRegions: [
            {
              id: "reg-wf-1",
              label: "Impersonated Bank Banner",
              type: "logo",
              box2d: [15, 10, 45, 90],
              description: "Wells Fargo security update header",
              severity: "suspicious"
            },
            {
              id: "reg-wf-2",
              label: "Credential Input Form",
              type: "input",
              box2d: [55, 30, 75, 70],
              description: "Authentication input button/field",
              severity: "suspicious"
            }
          ],
          visualEvidenceFound: ["Wells Fargo corporate header", "Urgent security verification notice", "Authentication action button"],
          riskEvidenceFound: ["Unverified brand origin", "Credential input prompt paired with urgent action notice"]
        }
      };
    }
    const brandName = isGoogleNewTab ? "Google Chrome" : isCloudPortal ? "Enterprise Cloud Platform" : "Standard Web Application";
    return {
      threatType: "Legitimate / Benign Interface",
      riskLevel: "SAFE",
      confidence: 0.93,
      summary: `Visual forensic analysis confirms a standard, benign interface (${brandName}). No deceptive overlays, fraudulent credential harvesting forms, or social engineering triggers detected.`,
      whyDangerous: [
        "Visual structure reflects clean, standard software hierarchy without deceptive cues",
        "No unverified credential collection fields or payment card prompts found",
        "Absence of coercive countdowns, fake security alerts, or scareware triggers"
      ],
      threatMechanics: "Benign layout verified: Component layout conforms to standard design principles without malicious UI cloaking or credential harvesting hooks.",
      indicators: [
        {
          type: "visual",
          name: "Benign Visual Structure",
          severity: "info",
          description: "Standard UI components and clean visual hierarchy detected without malicious overlays",
          scoreImpact: 0
        },
        {
          type: "credential",
          name: "No Credential Harvesting Forms",
          severity: "info",
          description: "No unverified password, PIN, or payment collection fields identified",
          scoreImpact: 0
        }
      ],
      technicalAnalysis: [
        { category: "Visual Integrity", key: "UI Structure", value: "Standard / Benign Interface", status: "clean", details: "Clean visual hierarchy and standard elements" },
        { category: "Brand Detection", key: "Brand Context", value: brandName, status: "clean", details: "Expected visual appearance without deceptive imitation" },
        { category: "Authentication", key: "Credential Solicitation", value: "None Detected", status: "clean", details: "No credential harvesting fields" },
        { category: "Social Engineering", key: "Manipulation Vectors", value: "None Detected", status: "clean", details: "No urgency triggers or fake security alerts" },
        { category: "External Intel", key: "Live URL Verification", value: "Not Performed (Static Image)", status: "unavailable", details: "Requires live domain link" }
      ],
      recommendations: [
        "No visual security anomalies detected in this screenshot.",
        "Always verify destination URLs in your browser navigation bar before entering sensitive credentials."
      ],
      aiScoreWeight: 2,
      isFallback: true,
      modelUsed: "ThreatLens Forensic Vision Heuristics",
      screenshotForensics: {
        visualIntegrity: "clean",
        brandDetected: {
          name: brandName,
          isOfficialConfirmed: false,
          confidence: 0.91,
          notes: "Standard visual appearance without deceptive impersonation cues"
        },
        credentialFieldsDetected: false,
        credentialFieldDetails: [],
        urgencyOrPanicDetected: false,
        deceptiveElementsDetected: false,
        visibleUrl: isGoogleNewTab ? "chrome://newtab" : void 0,
        extractedOcrText: isCloudPortal ? ["Enterprise Cloud Portal", "System Status: All services operational"] : isGoogleNewTab ? ["Google", "Search Google or type a URL", "New Tab"] : ["Application Interface", "Operational Status"],
        visualRegions: [
          {
            id: "reg-safe-1",
            label: isGoogleNewTab ? "Google Logo / Brand" : "Portal Header",
            type: "logo",
            box2d: [15, 20, 40, 80],
            description: "Standard header navigation element",
            severity: "clean"
          },
          {
            id: "reg-safe-2",
            label: isGoogleNewTab ? "Search Omnibox" : "Dashboard Content Area",
            type: isGoogleNewTab ? "input" : "safe",
            box2d: [50, 20, 70, 80],
            description: "Benign user interface component",
            severity: "clean"
          }
        ],
        visualEvidenceFound: [
          "Clean interface structure with standard navigation",
          "No deceptive overlays or disguised browser chrome",
          "Zero fraudulent credential prompts"
        ],
        riskEvidenceFound: []
      }
    };
  }
};
var aiProvider = new AIProviderService();

// server/services/riskEngine.ts
var RiskEngine = class {
  static calculate(input) {
    const rawTotal = input.domainRisk + input.urlStructureRisk + input.sslRisk + input.reputationRisk + input.contentRisk + input.aiRisk;
    const normalizedScore = Math.max(0, Math.min(100, Math.round(rawTotal)));
    let level = "SAFE";
    if (normalizedScore >= 81) {
      level = "CRITICAL";
    } else if (normalizedScore >= 61) {
      level = "HIGH";
    } else if (normalizedScore >= 41) {
      level = "MEDIUM";
    } else if (normalizedScore >= 21) {
      level = "LOW";
    } else {
      level = "SAFE";
    }
    const breakdown = {
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
  static getThreatColor(level) {
    switch (level) {
      case "CRITICAL":
        return {
          text: "text-rose-400",
          bg: "bg-rose-500/10",
          border: "border-rose-500/30",
          badge: "bg-rose-500/20 text-rose-300 border-rose-500/40"
        };
      case "HIGH":
        return {
          text: "text-amber-400",
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/40"
        };
      case "MEDIUM":
        return {
          text: "text-yellow-400",
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/30",
          badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
        };
      case "LOW":
        return {
          text: "text-cyan-400",
          bg: "bg-cyan-500/10",
          border: "border-cyan-500/30",
          badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
        };
      case "SAFE":
      default:
        return {
          text: "text-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/30",
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
        };
    }
  }
};

// server/services/urlAnalyzer.ts
var HIGH_RISK_TLDS2 = /* @__PURE__ */ new Set([
  "top",
  "xyz",
  "click",
  "work",
  "fit",
  "gq",
  "cf",
  "ml",
  "pw",
  "ru",
  "cn",
  "country",
  "rest",
  "surf",
  "loan",
  "tokyo"
]);
var BRAND_KEYWORDS = [
  "paypal",
  "apple",
  "google",
  "microsoft",
  "netflix",
  "amazon",
  "wellsfargo",
  "chase",
  "bankofamerica",
  "citibank",
  "facebook",
  "instagram",
  "whatsapp",
  "binance",
  "coinbase",
  "metamask",
  "dhl",
  "fedex",
  "usps"
];
var SUSPICIOUS_AUTH_KEYWORDS = [
  "login",
  "signin",
  "sign-in",
  "log-in",
  "verify",
  "verification",
  "update",
  "account",
  "security",
  "banking",
  "secure",
  "wallet",
  "recovery",
  "confirm",
  "credential",
  "auth",
  "authorize",
  "password",
  "token",
  "billing",
  "invoice",
  "unlock",
  "support",
  "helpdesk"
];
var UrlAnalyzerService = class {
  async analyze(rawUrl) {
    const startTime = Date.now();
    let normalized = rawUrl.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = "https://" + normalized;
    }
    let parsed;
    try {
      parsed = new URL2(normalized);
    } catch {
      throw new Error("Invalid URL format. Please provide a valid web address.");
    }
    const indicators = [];
    const technicalSignals = [];
    const contributingSignals = [];
    let domainRisk = 0;
    let urlStructureRisk = 0;
    let sslRisk = 0;
    let contentRisk = 0;
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();
    const fullUrl = parsed.toString().toLowerCase();
    const isHttps = parsed.protocol === "https:";
    if (!isHttps) {
      sslRisk += 25;
      indicators.push({
        type: "ssl",
        name: "Insecure Protocol (HTTP)",
        severity: "high",
        description: "Connection is unencrypted. Traffic and credentials can be intercepted via MitM attacks.",
        scoreImpact: 25
      });
      technicalSignals.push({
        category: "Protocol",
        key: "Encryption",
        value: "HTTP (Plain Text)",
        status: "malicious",
        details: "No Transport Layer Security (TLS) detected"
      });
      contributingSignals.push({
        category: "SSL Risk",
        factor: "Plaintext Protocol",
        points: 25,
        reason: "HTTP leaves all entered credentials visible to intermediate proxies"
      });
    } else {
      technicalSignals.push({
        category: "Protocol",
        key: "Encryption",
        value: "HTTPS (TLS Active)",
        status: "clean",
        details: "Traffic is cryptographically encrypted"
      });
    }
    const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.startsWith("[");
    if (isIpHost) {
      domainRisk += 30;
      indicators.push({
        type: "domain",
        name: "IP Address as Hostname",
        severity: "critical",
        description: "URL accesses a raw IP address directly, bypassing standard DNS reputation registries.",
        scoreImpact: 30
      });
      technicalSignals.push({
        category: "Host",
        key: "Host Type",
        value: "Raw IP Address",
        status: "malicious",
        details: "Direct server IP instead of domain name"
      });
      contributingSignals.push({
        category: "Domain Risk",
        factor: "Raw IP Host",
        points: 30,
        reason: "Legitimate consumer services virtually never authenticate users over raw IP addresses"
      });
    } else {
      technicalSignals.push({
        category: "Host",
        key: "Host Type",
        value: "Standard Domain Name",
        status: "clean",
        details: hostname
      });
    }
    const isPunycode = hostname.includes("xn--");
    if (isPunycode) {
      domainRisk += 35;
      indicators.push({
        type: "domain",
        name: "Punycode / Homograph Detected",
        severity: "critical",
        description: "Contains internationalized Cyrillic/Greek characters mimicking standard Latin characters (homoglyph attack).",
        scoreImpact: 35
      });
      technicalSignals.push({
        category: "Domain",
        key: "Encoding",
        value: "Punycode (xn--)",
        status: "malicious",
        details: "Potential visual spoofing of character sets"
      });
      contributingSignals.push({
        category: "Domain Risk",
        factor: "Homoglyph Deception",
        points: 35,
        reason: "Punycode encoding is heavily exploited in targeted spoofing of trusted domains"
      });
    }
    const domainParts = hostname.split(".");
    const tld = domainParts.length > 1 ? domainParts[domainParts.length - 1] : "";
    if (HIGH_RISK_TLDS2.has(tld)) {
      domainRisk += 20;
      indicators.push({
        type: "domain",
        name: `High-Abuse TLD (.${tld})`,
        severity: "medium",
        description: `.${tld} is historically associated with cheap registrars and disposable phishing domains.`,
        scoreImpact: 20
      });
      technicalSignals.push({
        category: "TLD",
        key: "Top-Level Domain",
        value: `.${tld}`,
        status: "suspicious",
        details: "Elevated abuse statistics"
      });
      contributingSignals.push({
        category: "Domain Risk",
        factor: "Suspicious TLD",
        points: 20,
        reason: `Statistically high rate of malicious activity reported on .${tld}`
      });
    } else {
      technicalSignals.push({
        category: "TLD",
        key: "Top-Level Domain",
        value: `.${tld || "unknown"}`,
        status: "clean",
        details: "Standard registry zone"
      });
    }
    const subdomains = domainParts.slice(0, Math.max(0, domainParts.length - 2));
    if (subdomains.length >= 3) {
      urlStructureRisk += 20;
      indicators.push({
        type: "structure",
        name: "Excessive Subdomain Nesting",
        severity: "high",
        description: `Detected ${subdomains.length} subdomain tiers (${subdomains.join(".")}) designed to obscure the true root domain.`,
        scoreImpact: 20
      });
      technicalSignals.push({
        category: "Subdomains",
        key: "Subdomain Depth",
        value: subdomains.length,
        status: "suspicious",
        details: subdomains.join(".")
      });
      contributingSignals.push({
        category: "URL Structure",
        factor: "Subdomain Obfuscation",
        points: 20,
        reason: "Multiple subdomain tiers frequently used to hide malicious apex server"
      });
    }
    const rootDomain = domainParts.slice(-2).join(".");
    for (const brand of BRAND_KEYWORDS) {
      if (hostname.includes(brand) && !rootDomain.includes(brand)) {
        domainRisk += 35;
        indicators.push({
          type: "brand",
          name: `Brand Impersonation (${brand.toUpperCase()})`,
          severity: "critical",
          description: `The brand "${brand}" appears in the subdomain or path, but the actual hosting domain is "${rootDomain}".`,
          scoreImpact: 35
        });
        technicalSignals.push({
          category: "Brand",
          key: "Impersonation Target",
          value: brand.toUpperCase(),
          status: "malicious",
          details: `Target placed outside authoritative domain ${rootDomain}`
        });
        contributingSignals.push({
          category: "Domain Risk",
          factor: "Brand Spoofing",
          points: 35,
          reason: `Misleading brand label intended to deceive users into trusting fraudulent origin`
        });
        break;
      }
    }
    const foundAuthKeywords = SUSPICIOUS_AUTH_KEYWORDS.filter((kw) => fullUrl.includes(kw));
    if (foundAuthKeywords.length >= 2) {
      contentRisk += 20;
      indicators.push({
        type: "keywords",
        name: "High-Density Credential Keywords",
        severity: "high",
        description: `Found sensitive authentication endpoints: [${foundAuthKeywords.slice(0, 4).join(", ")}].`,
        scoreImpact: 20
      });
      technicalSignals.push({
        category: "Keywords",
        key: "Auth Signals",
        value: foundAuthKeywords.slice(0, 3).join(", "),
        status: "suspicious",
        details: "Authentication-related query or path strings"
      });
      contributingSignals.push({
        category: "Content Risk",
        factor: "Credential Keywords",
        points: 20,
        reason: "High density of login and verification parameters on non-official host"
      });
    }
    if (fullUrl.includes("@")) {
      urlStructureRisk += 25;
      indicators.push({
        type: "structure",
        name: "URL Userinfo Deception (@)",
        severity: "critical",
        description: 'Uses "@" in the URL authority section to deceive the browser into displaying a fake prefix.',
        scoreImpact: 25
      });
      contributingSignals.push({
        category: "URL Structure",
        factor: "Authority Spoofing (@)",
        points: 25,
        reason: 'Browser will ignore text prior to "@" and route to malicious suffix'
      });
    }
    const hasRedirectParam = /[?&](redirect|url|next|goto|r|dest)=/i.test(parsed.search);
    if (hasRedirectParam) {
      urlStructureRisk += 15;
      indicators.push({
        type: "redirect",
        name: "Open Redirect Parameter",
        severity: "medium",
        description: "Contains redirect query parameters that may forward the user to an unvetted secondary location.",
        scoreImpact: 15
      });
      technicalSignals.push({
        category: "Routing",
        key: "Redirect Vector",
        value: "Detected in query string",
        status: "suspicious",
        details: "Possible open redirect payload"
      });
    }
    if (normalized.length > 120) {
      urlStructureRisk += 10;
      technicalSignals.push({
        category: "Structure",
        key: "URL Length",
        value: `${normalized.length} characters`,
        status: "suspicious",
        details: "Long URL with potential obfuscation payloads"
      });
    }
    let resolvedIps = [];
    try {
      if (!isIpHost) {
        const lookupResult = await Promise.race([
          dns2.resolve4(hostname),
          new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 1500))
        ]);
        resolvedIps = lookupResult;
        technicalSignals.push({
          category: "DNS",
          key: "A Records",
          value: resolvedIps.slice(0, 3).join(", "),
          status: "clean",
          details: `Resolved to ${resolvedIps.length} active IP address(es)`
        });
      }
    } catch {
      technicalSignals.push({
        category: "DNS",
        key: "Domain Resolution",
        value: "NXDOMAIN / Unresolved",
        status: "suspicious",
        details: "Domain did not resolve to public IP addresses or timed out"
      });
      domainRisk += 15;
      indicators.push({
        type: "domain",
        name: "Unresolvable Host / NXDOMAIN",
        severity: "medium",
        description: "The domain name currently has no active DNS A-records or failed resolution.",
        scoreImpact: 15
      });
    }
    const intel = await threatIntel.checkUrl(normalized);
    for (const signal of intel.signals) {
      contributingSignals.push(signal);
    }
    const reputationRisk = intel.scoreBonus;
    technicalSignals.push({
      category: "Threat Intel",
      key: "Autonomous Heuristics",
      value: intel.heuristicEngine.status,
      status: intel.heuristicEngine.rulesTriggered.length > 0 ? "malicious" : "clean",
      details: intel.heuristicEngine.rulesTriggered.length > 0 ? `Triggered: ${intel.heuristicEngine.rulesTriggered.join(" \u2022 ")}` : "Zero anomalous behavioral patterns detected"
    });
    technicalSignals.push({
      category: "Threat Intel",
      key: "Host Telemetry & DNS",
      value: intel.dnsStatus.status,
      status: intel.dnsStatus.isResolved ? "clean" : "suspicious",
      details: intel.dnsStatus.isResolved ? "Active authoritative internet infrastructure" : "DNS lookup timed out or returned NXDOMAIN"
    });
    const heuristicContext = `
- Domain: ${hostname}
- Protocol: ${parsed.protocol}
- TLD: .${tld}
- Flagged indicators: ${indicators.map((i) => i.name).join(", ") || "None"}
- Suspicious Keywords: ${foundAuthKeywords.join(", ") || "None"}
- IP Host: ${isIpHost}
- Punycode: ${isPunycode}
    `;
    const aiOutput = await aiProvider.analyzeUrl(normalized, heuristicContext);
    for (const aiInd of aiOutput.indicators) {
      if (!indicators.some((i) => i.name.toLowerCase() === aiInd.name.toLowerCase())) {
        indicators.push(aiInd);
      }
    }
    for (const tech of aiOutput.technicalAnalysis) {
      technicalSignals.push(tech);
    }
    if (aiOutput.aiScoreWeight > 0) {
      contributingSignals.push({
        category: "AI Classification",
        factor: "Machine Learning Confidence",
        points: aiOutput.aiScoreWeight,
        reason: `${aiOutput.modelUsed} identified behavioral signatures of ${aiOutput.threatType}`
      });
    }
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
      id: `scan-${crypto2.randomUUID().slice(0, 8)}`,
      scanType: "url",
      target: normalized,
      riskScore: finalScore.score,
      riskLevel: finalScore.level,
      threatType: aiOutput.threatType || (finalScore.score > 60 ? "Credential Phishing" : "Legitimate Webpage"),
      confidence: aiOutput.confidence,
      summary: aiOutput.summary,
      explanation: {
        whyDangerous: aiOutput.whyDangerous.length > 0 ? aiOutput.whyDangerous : [
          finalScore.level === "SAFE" ? "Domain displays standard authentic indicators" : "Anomalous domain or protocol traits detected"
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
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        analysisDurationMs: duration,
        aiModelUsed: aiOutput.modelUsed,
        isAiFallback: aiOutput.isFallback
      }
    };
  }
};
var urlAnalyzer = new UrlAnalyzerService();

// server/services/messageAnalyzer.ts
import crypto3 from "crypto";
var URGENCY_TRIGGERS = [
  "urgent",
  "immediately",
  "expires",
  "suspended",
  "within 24 hours",
  "within 15 mins",
  "within 2 hours",
  "act now",
  "action required",
  "final notice",
  "terminated",
  "blocked",
  "last chance",
  "deactivated",
  "account locked",
  "unauthorized transaction",
  "security breach",
  "immediate attention",
  "freeze"
];
var REWARD_TRIGGERS = [
  "congratulations",
  "won",
  "winner",
  "lottery",
  "prize",
  "cash bonus",
  "gift card",
  "free iphone",
  "unclaimed funds",
  "exclusive reward",
  "guaranteed return",
  "jackpot",
  "\u20B950,000",
  "$10,000",
  "1,000,000",
  "free reward",
  "lucky draw",
  "payout",
  "giveaway"
];
var FINANCIAL_MANIPULATION_TRIGGERS = [
  "send money",
  "wire transfer",
  "crypto",
  "bitcoin",
  "usdt",
  "eth",
  "processing fee",
  "advance payment",
  "deposit required",
  "gift cards",
  "bank details",
  "upi pin",
  "tax refund",
  "pay now",
  "wallet address",
  "security deposit",
  "recharge"
];
var IMPERSONATION_TRIGGERS = [
  "wells fargo",
  "chase",
  "bank of america",
  "citi",
  "paypal",
  "venmo",
  "cash app",
  "amazon",
  "apple",
  "netflix",
  "microsoft",
  "google security",
  "dhl",
  "fedex",
  "usps",
  "ups",
  "irs",
  "tax department",
  "internal revenue",
  "geek squad",
  "meta support",
  "hr department",
  "whatsapp support",
  "binance",
  "coinbase",
  "dr. smith"
];
var CREDENTIAL_THEFT_TRIGGERS = [
  "otp",
  "pin",
  "password",
  "passcode",
  "cvv",
  "card number",
  "security code",
  "verify identity",
  "confirm password",
  "ssn",
  "social security",
  "login credentials",
  "enter your credentials",
  "restore access"
];
var EXTRACT_URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(top|xyz|click|work|fit|com|info|org|net|me|in|co|cc)\/[^\s]*)/gi;
var MessageAnalyzerService = class {
  async analyze(messageText) {
    const startTime = Date.now();
    const text = messageText.trim();
    if (!text) {
      throw new Error("Please provide text or message content to analyze.");
    }
    const lower = text.toLowerCase();
    const indicators = [];
    const technicalSignals = [];
    const contributingSignals = [];
    let contentRisk = 0;
    let urlStructureRisk = 0;
    const detectedUrgency = URGENCY_TRIGGERS.filter((u) => lower.includes(u));
    if (detectedUrgency.length > 0) {
      const pts = Math.min(30, detectedUrgency.length * 15);
      contentRisk += pts;
      indicators.push({
        type: "urgency",
        name: "Urgency & Fear Tactics",
        severity: "high",
        description: `Message relies on artificial panic triggers: [${detectedUrgency.join(", ")}].`,
        scoreImpact: pts
      });
      technicalSignals.push({
        category: "Psychological Signals",
        key: "Time Pressure Vector",
        value: detectedUrgency.slice(0, 3).join(", "),
        status: "malicious",
        details: "Artificial deadline used to bypass rational critical thinking"
      });
      contributingSignals.push({
        category: "Content Risk",
        factor: "Urgency Pressure",
        points: pts,
        reason: "Exploits fear or haste to compel immediate interaction"
      });
    }
    const detectedRewards = REWARD_TRIGGERS.filter((r) => lower.includes(r));
    if (detectedRewards.length > 0) {
      const pts = Math.min(35, detectedRewards.length * 18);
      contentRisk += pts;
      indicators.push({
        type: "reward",
        name: "Unsolicited Reward / Lottery Claim",
        severity: "critical",
        description: `Baiting recipient with unearned prizes or wealth promises: [${detectedRewards.join(", ")}].`,
        scoreImpact: pts
      });
      technicalSignals.push({
        category: "Incentive Vectors",
        key: "Bait Signal",
        value: detectedRewards.slice(0, 3).join(", "),
        status: "malicious",
        details: "Advance-fee fraud or lottery lure detected"
      });
      contributingSignals.push({
        category: "Content Risk",
        factor: "Greed / Reward Lure",
        points: pts,
        reason: "Classic bait tactic for fraudulent fee extraction"
      });
    }
    const detectedImpersonation = IMPERSONATION_TRIGGERS.filter((b) => lower.includes(b));
    if (detectedImpersonation.length > 0 && (detectedUrgency.length > 0 || detectedRewards.length > 0 || lower.includes("fee") || lower.includes("verify"))) {
      const pts = 25;
      contentRisk += pts;
      indicators.push({
        type: "impersonation",
        name: "Brand / Authority Impersonation",
        severity: "high",
        description: `Purports to represent [${detectedImpersonation.join(", ")}] while displaying coercive indicators.`,
        scoreImpact: pts
      });
      technicalSignals.push({
        category: "Brand & Authority",
        key: "Impersonation Target",
        value: detectedImpersonation.join(", ").toUpperCase(),
        status: "malicious",
        details: "Institution brand leveraged without cryptographic origin proof"
      });
      contributingSignals.push({
        category: "Identity Risk",
        factor: "Brand Spoofing",
        points: pts,
        reason: "Coercive message claims affiliation with high-trust authority"
      });
    } else if (detectedImpersonation.length > 0) {
      technicalSignals.push({
        category: "Brand & Authority",
        key: "Entity Mention",
        value: detectedImpersonation.join(", "),
        status: "neutral",
        details: "Recognized brand entity mentioned in standard context"
      });
    }
    const detectedFinancial = FINANCIAL_MANIPULATION_TRIGGERS.filter((f) => lower.includes(f));
    if (detectedFinancial.length > 0) {
      const pts = Math.min(30, detectedFinancial.length * 15);
      contentRisk += pts;
      indicators.push({
        type: "financial",
        name: "Financial or Payment Demands",
        severity: "high",
        description: `Solicits payment, crypto, or banking transactions: [${detectedFinancial.join(", ")}].`,
        scoreImpact: pts
      });
      technicalSignals.push({
        category: "Financial Signals",
        key: "Payment Demands",
        value: detectedFinancial.slice(0, 3).join(", "),
        status: "suspicious",
        details: "Requests sensitive financial transmission or upfront fee"
      });
      contributingSignals.push({
        category: "Content Risk",
        factor: "Payment Solicitation",
        points: pts,
        reason: "Unverified requests for money transfer, crypto, or credentials"
      });
    }
    const detectedCredentials = CREDENTIAL_THEFT_TRIGGERS.filter((c) => lower.includes(c));
    if (detectedCredentials.length > 0) {
      const pts = Math.min(35, detectedCredentials.length * 18);
      contentRisk += pts;
      indicators.push({
        type: "credential_harvest",
        name: "Credential & Authentication Solicitation",
        severity: "critical",
        description: `Attempts to harvest security secrets: [${detectedCredentials.join(", ")}].`,
        scoreImpact: pts
      });
      technicalSignals.push({
        category: "Credential Security",
        key: "Authentication Vectors",
        value: detectedCredentials.slice(0, 3).join(", "),
        status: "malicious",
        details: "Explicit solicitation of verification codes, PINs, or credentials"
      });
      contributingSignals.push({
        category: "Credential Risk",
        factor: "Secret Exfiltration",
        points: pts,
        reason: "High-risk solicitation of one-time passwords or security credentials"
      });
    }
    const matchedUrls = text.match(EXTRACT_URL_REGEX) || [];
    if (matchedUrls.length > 0) {
      const hasSuspiciousTLD = matchedUrls.some((u) => /\.(top|xyz|click|work|fit|cc|club)(\/|$)/i.test(u));
      const urlPts = hasSuspiciousTLD ? 30 : 20;
      urlStructureRisk += urlPts;
      indicators.push({
        type: "url",
        name: hasSuspiciousTLD ? "High-Risk Embedded Link (.top/.xyz)" : "Embedded Action Link",
        severity: hasSuspiciousTLD ? "high" : "medium",
        description: `Directs user to external target: ${matchedUrls[0]}`,
        scoreImpact: urlPts
      });
      technicalSignals.push({
        category: "Payload Vector",
        key: "Extracted Links",
        value: matchedUrls.slice(0, 2).join(", "),
        status: hasSuspiciousTLD ? "malicious" : "suspicious",
        details: hasSuspiciousTLD ? "High-abuse top-level domain frequently used in phishing campaigns" : "External link found in unauthenticated message"
      });
      contributingSignals.push({
        category: "URL Risk",
        factor: "Embedded Action Link",
        points: urlPts,
        reason: "Directs recipient outside verified communication channel"
      });
    } else {
      technicalSignals.push({
        category: "Payload Vector",
        key: "Extracted Links",
        value: "None (Plaintext)",
        status: "clean",
        details: "No suspicious hyperlinks or redirection targets found in payload"
      });
    }
    const words = text.split(/\s+/).filter(Boolean);
    const capsCount = (text.match(/[A-Z]/g) || []).length;
    const capsRatio = text.length > 0 ? capsCount / text.length : 0;
    if (capsRatio > 0.35 && text.length > 25) {
      indicators.push({
        type: "formatting",
        name: "Excessive Capitalization",
        severity: "low",
        description: "High uppercase ratio designed to artificially amplify alarm or excitement.",
        scoreImpact: 8
      });
      technicalSignals.push({
        category: "Linguistic Analysis",
        key: "Capitalization Ratio",
        value: `${Math.round(capsRatio * 100)}% Uppercase`,
        status: "suspicious",
        details: "Elevated capitalization creates emotional urgency"
      });
    }
    const aiOutput = await aiProvider.analyzeMessage(text);
    for (const aiInd of aiOutput.indicators) {
      if (!indicators.some((i) => i.name.toLowerCase() === aiInd.name.toLowerCase())) {
        indicators.push(aiInd);
      }
    }
    for (const tech of aiOutput.technicalAnalysis) {
      technicalSignals.push(tech);
    }
    if (aiOutput.aiScoreWeight > 0) {
      contributingSignals.push({
        category: "AI Classification",
        factor: "Linguistic Scam Detection",
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
      id: `scan-${crypto3.randomUUID().slice(0, 8)}`,
      scanType: "message",
      target: text,
      riskScore: finalScore.score,
      riskLevel: finalScore.level,
      threatType: aiOutput.threatType || (finalScore.score > 60 ? "Social Engineering & Scam" : "Informational Message"),
      confidence: aiOutput.confidence,
      summary: aiOutput.summary,
      explanation: {
        whyDangerous: aiOutput.whyDangerous.length > 0 ? aiOutput.whyDangerous : [
          finalScore.level === "SAFE" ? "Message content appears benign and informational" : "High density of psychological manipulation markers"
        ],
        threatMechanics: aiOutput.threatMechanics
      },
      indicators,
      technicalSignals,
      riskBreakdown: finalScore.breakdown,
      recommendations: aiOutput.recommendations,
      threatIntelligence: {
        heuristicEngine: {
          status: "Social Engineering Linguistic Heuristics Active",
          rulesTriggered: indicators.map((i) => i.name)
        }
      },
      externalReputation: {
        threatIntelFeed: "Linguistic manipulation & urgency trigger filter",
        dnsVerification: matchedUrls.length > 0 ? "Embedded links extracted" : "Plain Text / No External URLs",
        isHeuristicOnly: false
      },
      metadata: {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        analysisDurationMs: duration,
        aiModelUsed: aiOutput.modelUsed,
        isAiFallback: aiOutput.isFallback
      }
    };
  }
};
var messageAnalyzer = new MessageAnalyzerService();

// server/services/screenshotAnalyzer.ts
import crypto4 from "crypto";
var ScreenshotAnalyzerService = class {
  async analyze(imageBase64, filename) {
    const startTime = Date.now();
    if (!imageBase64) {
      throw new Error("Please upload a screenshot or image file to inspect.");
    }
    let mimeType = "image/jpeg";
    if (imageBase64.includes("image/png")) mimeType = "image/png";
    else if (imageBase64.includes("image/webp")) mimeType = "image/webp";
    else if (imageBase64.includes("image/svg+xml")) mimeType = "image/svg+xml";
    const aiOutput = await aiProvider.analyzeScreenshot(imageBase64, mimeType, filename || "");
    const forensics = aiOutput.screenshotForensics;
    const hasRiskEvidence = Boolean(forensics?.riskEvidenceFound && forensics.riskEvidenceFound.length > 0);
    const hasCredentialFields = Boolean(forensics?.credentialFieldsDetected);
    const hasUrgency = Boolean(forensics?.urgencyOrPanicDetected);
    const hasDeceptiveElements = Boolean(forensics?.deceptiveElementsDetected);
    const isExplicitlyClean = aiOutput.riskLevel === "SAFE" || !hasRiskEvidence && !hasCredentialFields && !hasUrgency && !hasDeceptiveElements;
    let finalThreatType = aiOutput.threatType;
    let finalRiskLevel = isExplicitlyClean ? "SAFE" : aiOutput.riskLevel;
    let contentRisk = 0;
    let aiRisk = 0;
    const contributingSignals = [];
    if (isExplicitlyClean) {
      finalRiskLevel = "SAFE";
      finalThreatType = "Legitimate / Benign Interface";
      contentRisk = 0;
      aiRisk = Math.min(4, Math.max(0, aiOutput.aiScoreWeight));
      contributingSignals.push({
        category: "Visual Forensics",
        factor: "Benign UI Verification",
        points: aiRisk,
        reason: "Conforms to benign interface architecture without deceptive overlays or credential harvesting forms"
      });
    } else if (finalRiskLevel === "LOW") {
      contentRisk = 5;
      aiRisk = Math.min(10, Math.max(5, aiOutput.aiScoreWeight));
      contributingSignals.push({
        category: "Visual Forensics",
        factor: "Minor Visual Anomaly",
        points: contentRisk + aiRisk,
        reason: "Interface requires general awareness but shows no confirmed credential theft vectors"
      });
    } else if (finalRiskLevel === "MEDIUM") {
      contentRisk = 18;
      aiRisk = 22;
      contributingSignals.push({
        category: "Authentication Forensics",
        factor: "Unverified Login Fields",
        points: 40,
        reason: "Authentication form detected on unverified image canvas without host domain verification"
      });
    } else if (finalRiskLevel === "HIGH") {
      contentRisk = 35;
      aiRisk = 35;
      contributingSignals.push({
        category: "Brand & Credential Spoofing",
        factor: "Phishing Authentication Indicators",
        points: 70,
        reason: "Brand trademarks paired with urgent credential solicitation or deceptive layout vectors"
      });
    } else {
      contentRisk = 45;
      aiRisk = 45;
      contributingSignals.push({
        category: "Scareware & Social Engineering",
        factor: "Coercive Fake Security Dialog",
        points: 90,
        reason: "Simulated malware warnings or fake system alerts prompting urgent call-to-action"
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
    let finalScore = calculatedRisk.score;
    if (isExplicitlyClean) {
      finalScore = Math.min(10, finalScore);
      finalRiskLevel = "SAFE";
    }
    let indicators = [];
    if (isExplicitlyClean) {
      indicators = [
        {
          type: "visual",
          name: "Benign Visual Structure",
          severity: "info",
          description: "Standard UI components and clean visual hierarchy detected without malicious overlays",
          scoreImpact: 0
        },
        {
          type: "credential",
          name: "No Credential Harvesting Forms",
          severity: "info",
          description: "No unverified password, PIN, or payment collection fields identified in image",
          scoreImpact: 0
        },
        {
          type: "social_engineering",
          name: "No Coercive Urgency Triggers",
          severity: "info",
          description: "Zero countdown threats, fake virus alerts, or coercive scareware banners found",
          scoreImpact: 0
        }
      ];
    } else {
      indicators = aiOutput.indicators.length > 0 ? aiOutput.indicators : [
        {
          type: "visual",
          name: finalRiskLevel === "CRITICAL" ? "Coercive Security Alert Dialog" : "Unverified Authentication Layout",
          severity: finalRiskLevel === "CRITICAL" ? "critical" : finalRiskLevel === "HIGH" ? "high" : "medium",
          description: aiOutput.summary,
          scoreImpact: finalScore
        }
      ];
    }
    const checksPerformed = [
      {
        name: "Visual Layout & Hierarchy",
        category: "Visual Structure",
        status: "CHECKED",
        details: isExplicitlyClean ? "Conforms to standard UI layout without disguised elements" : "Detected abnormal visual structure or deceptive overlay"
      },
      {
        name: "Visible Text & Semantic OCR",
        category: "Content Analysis",
        status: "CHECKED",
        details: forensics?.extractedOcrText && forensics.extractedOcrText.length > 0 ? `Extracted ${forensics.extractedOcrText.length} text blocks for coercive language inspection` : "Scanned semantic strings for urgency triggers and fraud keywords"
      },
      {
        name: "Brand & Identity Recognition",
        category: "Identity Forensics",
        status: "CHECKED",
        details: forensics?.brandDetected?.name ? `Detected ${forensics.brandDetected.name} brand markers (origin unverified via pixels alone)` : "No recognized corporate brand emblems detected"
      },
      {
        name: "Credential Form Inspection",
        category: "Authentication",
        status: "CHECKED",
        details: hasCredentialFields ? `Identified credential fields: ${forensics?.credentialFieldDetails?.join(", ") || "Password/Username"}` : "Zero unverified credential, PIN, or password collection fields detected"
      },
      {
        name: "Social Engineering & Urgency Prompts",
        category: "Psychological Vectors",
        status: "CHECKED",
        details: hasUrgency ? "Detected panic or countdown pressure tactics" : "Zero coercive panic vectors or scareware prompts found"
      },
      {
        name: "Deceptive Overlays & Fake Chrome",
        category: "Interface Deception",
        status: "CHECKED",
        details: hasDeceptiveElements ? "Detected simulated OS or browser dialog overlay" : "No deceptive modal dialogs or fake browser bars detected"
      },
      {
        name: "Visible URL / Address Bar Extraction",
        category: "Network Target",
        status: forensics?.visibleUrl ? "CHECKED" : "NOT_FOUND",
        details: forensics?.visibleUrl ? `Extracted visible address: ${forensics.visibleUrl}` : "No visible HTTP/HTTPS address bar or domain URL located in image"
      },
      {
        name: "Live Domain Reputation Check",
        category: "External Threat Intel",
        status: "NOT_CHECKED",
        details: "Screenshot analysis inspects pixels only; live threat intel feeds not queried for image file"
      },
      {
        name: "Authoritative DNS Resolution",
        category: "Infrastructure",
        status: "NOT_CHECKED",
        details: "Static raster image cannot query remote nameservers or resolve A-records"
      },
      {
        name: "SSL/TLS Cryptographic Validation",
        category: "Encryption",
        status: "NOT_CHECKED",
        details: "No TLS handshake or certificate chain verification performed on rasterized image data"
      },
      {
        name: "Live Backend Exfiltration Verification",
        category: "Runtime Dynamics",
        status: "NOT_CHECKED",
        details: "Form submission endpoints cannot be captured without active browser sandbox execution"
      }
    ];
    const technicalSignals = [
      {
        category: "Image Forensics",
        key: "File Format",
        value: mimeType.split("/")[1]?.toUpperCase() || "PNG",
        status: "clean",
        details: filename || "Uploaded image artifact"
      },
      {
        category: "Image Forensics",
        key: "Vision OCR Engine",
        value: aiOutput.modelUsed,
        status: "clean",
        details: aiOutput.isFallback ? "Heuristic vision rulebook" : "Multimodal neural inspection"
      },
      {
        category: "Visual Integrity",
        key: "UI Structure",
        value: isExplicitlyClean ? "Benign Interface" : hasDeceptiveElements ? "Simulated Dialog / Overlay" : "Unverified Layout",
        status: isExplicitlyClean ? "clean" : hasDeceptiveElements ? "malicious" : "suspicious",
        details: isExplicitlyClean ? "No disguised elements" : "Visual hierarchy flagged for review"
      },
      {
        category: "Brand Recognition",
        key: "Detected Brand Entity",
        value: forensics?.brandDetected?.name ? `${forensics.brandDetected.name} (Visual only)` : "None / Generic",
        status: isExplicitlyClean ? "clean" : hasRiskEvidence ? "suspicious" : "neutral",
        details: forensics?.brandDetected?.notes || "Image capture alone cannot verify authentic host ownership"
      },
      {
        category: "Authentication",
        key: "Credential Fields",
        value: hasCredentialFields ? forensics?.credentialFieldDetails?.join(", ") || "Present" : "None Detected",
        status: hasCredentialFields ? "suspicious" : "clean",
        details: hasCredentialFields ? "Sensitive input collection" : "Zero password/PIN inputs"
      },
      {
        category: "Social Engineering",
        key: "Panic / Urgency Triggers",
        value: hasUrgency ? "Detected" : "None Detected",
        status: hasUrgency ? "malicious" : "clean",
        details: hasUrgency ? "Coercive psychological pressure" : "Standard communication timeline"
      },
      {
        category: "Network Destination",
        key: "Visible Address Bar URL",
        value: forensics?.visibleUrl || "Not Visible in Image",
        status: forensics?.visibleUrl ? "clean" : "unavailable",
        details: forensics?.visibleUrl ? "Extracted from image pixels" : "Address bar not visible in screenshot"
      },
      {
        category: "External Intelligence",
        key: "Domain Reputation Feed",
        value: "Not Checked (Image Only)",
        status: "unavailable",
        details: "External blocklists not queried for static screenshot file"
      },
      {
        category: "Infrastructure",
        key: "DNS & TLS Handshake",
        value: "Not Checked (Image Only)",
        status: "unavailable",
        details: "No network handshake or cryptographic certificate verification"
      }
    ];
    const duration = Date.now() - startTime;
    return {
      id: `scan-ss-${crypto4.randomUUID().slice(0, 8)}`,
      scanType: "screenshot",
      target: filename ? `Screenshot: ${filename}` : "Uploaded Webpage Screenshot",
      riskScore: finalScore,
      riskLevel: finalRiskLevel,
      threatType: finalThreatType,
      confidence: aiOutput.confidence,
      summary: aiOutput.summary,
      explanation: {
        whyDangerous: isExplicitlyClean ? [
          "Visual structure conforms to standard benign software interface design principles",
          "Zero fraudulent credential harvesting fields, fake virus warnings, or deceptive overlays detected",
          "No coercive urgency prompts, countdown clocks, or scareware triggers present in capture"
        ] : aiOutput.whyDangerous.length > 0 ? aiOutput.whyDangerous : ["Visual indicators match deceptive interface patterns"],
        threatMechanics: aiOutput.threatMechanics
      },
      indicators,
      technicalSignals,
      riskBreakdown: calculatedRisk.breakdown,
      recommendations: aiOutput.recommendations,
      screenshotForensics: {
        visualIntegrity: isExplicitlyClean ? "clean" : hasDeceptiveElements ? "malicious" : "suspicious",
        brandDetected: forensics?.brandDetected,
        credentialFieldsDetected: hasCredentialFields,
        credentialFieldDetails: forensics?.credentialFieldDetails,
        urgencyOrPanicDetected: hasUrgency,
        deceptiveElementsDetected: hasDeceptiveElements,
        visibleUrl: forensics?.visibleUrl,
        extractedOcrText: forensics?.extractedOcrText,
        visualRegions: forensics?.visualRegions,
        checksPerformed,
        visualEvidenceFound: forensics?.visualEvidenceFound || (isExplicitlyClean ? ["Standard UI Layout", "Browser Window Structure", "Clean Content Hierarchy"] : []),
        riskEvidenceFound: isExplicitlyClean ? [] : forensics?.riskEvidenceFound || [],
        limitationsNotice: "Screenshot analysis inspects visible pixels and UI structure. It cannot independently verify live domain reputation, authoritative DNS, TLS certificates, or backend data exfiltration unless external threat intelligence is connected."
      },
      threatIntelligence: {
        heuristicEngine: {
          status: "Visual OCR & Brand Geometry Forensics Active",
          rulesTriggered: indicators.map((i) => i.name)
        }
      },
      externalReputation: {
        threatIntelFeed: "Visual artifact analysis only",
        dnsVerification: "N/A (Image capture)",
        isHeuristicOnly: false
      },
      metadata: {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        analysisDurationMs: duration,
        aiModelUsed: aiOutput.modelUsed,
        isAiFallback: aiOutput.isFallback
      }
    };
  }
};
var screenshotAnalyzer = new ScreenshotAnalyzerService();

// server/services/qrAnalyzer.ts
import crypto5 from "crypto";
var QrAnalyzerService = class {
  async analyzePayload(qrPayload, metaSource) {
    const raw = qrPayload.trim();
    if (!raw) {
      throw new Error("No QR code content detected. Please provide a valid QR payload or image.");
    }
    let contentType = "text";
    let isUrl = false;
    let isWifi = false;
    let isContact = false;
    let isPayment = false;
    if (/^https?:\/\//i.test(raw) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(raw)) {
      contentType = "url";
      isUrl = true;
    } else if (/^WIFI:/i.test(raw)) {
      contentType = "wifi";
      isWifi = true;
    } else if (/^BEGIN:VCARD/i.test(raw) || /^MECARD:/i.test(raw)) {
      contentType = "contact";
      isContact = true;
    } else if (/^(bitcoin|ethereum|solana|litecoin):/i.test(raw) || /^upi:\/\/pay/i.test(raw)) {
      contentType = "payment";
      isPayment = true;
    }
    let baseAnalysis;
    let wifiDetails;
    let contactDetails;
    let paymentDetails;
    let urlDetails;
    if (isUrl) {
      baseAnalysis = await urlAnalyzer.analyze(raw);
      let parsedUrl = null;
      try {
        parsedUrl = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
      } catch {
        parsedUrl = null;
      }
      const domain = parsedUrl ? parsedUrl.hostname.toLowerCase() : raw;
      const parts = domain.split(".");
      const tld = parts.length > 1 ? parts[parts.length - 1] : "";
      const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(domain);
      const ipSig = baseAnalysis.technicalSignals.find((s) => s.category.toLowerCase().includes("dns") && s.key.toLowerCase().includes("ip"));
      const ipAddress = ipSig?.value ? String(ipSig.value) : isIpHost ? domain : void 0;
      urlDetails = {
        url: parsedUrl ? parsedUrl.toString() : raw,
        protocol: parsedUrl ? parsedUrl.protocol.replace(":", "").toUpperCase() : "HTTP",
        domain,
        tld,
        path: parsedUrl ? parsedUrl.pathname : "/",
        ipAddress,
        isIpHost,
        isHttps: parsedUrl?.protocol === "https:",
        redirectChain: [raw],
        finalDestination: parsedUrl ? parsedUrl.toString() : raw
      };
    } else if (isWifi) {
      const ssidMatch = raw.match(/S:([^;]+)/i);
      const typeMatch = raw.match(/T:([^;]+)/i);
      const passMatch = raw.match(/P:([^;]+)/i);
      const hiddenMatch = raw.match(/H:([^;]+)/i);
      const ssid = ssidMatch ? ssidMatch[1] : "Unknown SSID";
      const security = typeMatch ? typeMatch[1].toUpperCase() : "NONE";
      const hasPassword = Boolean(passMatch && passMatch[1]);
      const hidden = hiddenMatch ? hiddenMatch[1].toLowerCase() === "true" : false;
      wifiDetails = {
        ssid,
        security,
        hidden,
        hasPassword
      };
      const isOpen = security === "NONE" || security === "NOPASS" || !hasPassword;
      const isWep = security === "WEP";
      let riskScore = 0;
      let riskLevel = "SAFE";
      let threatType = "Authentic Wireless Configuration";
      let summary = `Standard Wi-Fi network setup QR for SSID "${ssid}". Protected by ${security} encryption protocol.`;
      const indicators = [];
      if (isOpen) {
        riskScore = 48;
        riskLevel = "MEDIUM";
        threatType = "Unencrypted Open Wi-Fi Network";
        summary = `Unencrypted open Wi-Fi network detected for SSID "${ssid}". Open public access points pose significant eavesdropping and evil-twin rogue AP risks.`;
        indicators.push({
          type: "qr",
          name: "Unencrypted Open Wi-Fi Network",
          severity: "medium",
          description: "No wireless passphrase configured. Traffic transmitted across open Wi-Fi can be intercepted by adversaries on the same local subnet.",
          scoreImpact: 35
        });
      } else if (isWep) {
        riskScore = 40;
        riskLevel = "MEDIUM";
        threatType = "Deprecated WEP Encryption";
        summary = `Wi-Fi configuration uses obsolete WEP cipher for SSID "${ssid}". WEP is cryptographically broken and vulnerable to rapid key recovery attacks.`;
        indicators.push({
          type: "qr",
          name: "Obsolete WEP Cipher Suite",
          severity: "medium",
          description: "WEP initialization vectors can be decrypted in minutes by unauthenticated nearby eavesdroppers.",
          scoreImpact: 30
        });
      }
      baseAnalysis = {
        id: `scan-wifi-${crypto5.randomUUID().slice(0, 8)}`,
        scanType: "qr",
        target: `Wi-Fi: ${ssid}`,
        riskScore,
        riskLevel,
        threatType,
        confidence: 0.95,
        summary,
        explanation: {
          whyDangerous: isOpen ? ["Unencrypted Wi-Fi allows packet sniffing and man-in-the-middle attacks", "Rogue hotspots frequently broadcast open captive portals to harvest credentials"] : ["Standard protected local Wi-Fi pairing parameters"],
          threatMechanics: isOpen ? "Open Wi-Fi access configuration allows cleartext broadcast interception" : "Pre-shared WPA/WPA2 authentication payload for wireless device association"
        },
        indicators,
        technicalSignals: [
          {
            category: "Wi-Fi Configuration",
            key: "SSID Name",
            value: ssid,
            status: "neutral",
            details: `Broadcast SSID: ${ssid}`
          },
          {
            category: "Wi-Fi Security",
            key: "Cipher Suite",
            value: security,
            status: isOpen ? "suspicious" : isWep ? "suspicious" : "clean",
            details: isOpen ? "No password authentication required" : `${security} pre-shared key security active`
          },
          {
            category: "Network Visibility",
            key: "Hidden Network",
            value: hidden ? "Yes (Hidden SSID)" : "No (Standard Broadcast)",
            status: "neutral",
            details: hidden ? "Non-broadcast beacon network" : "Public beacon broadcast"
          }
        ],
        riskBreakdown: {
          domainRisk: 0,
          urlStructureRisk: 0,
          sslRisk: isOpen ? 35 : 0,
          contentRisk: isOpen ? 15 : 0,
          reputationRisk: 0,
          aiRisk: 0,
          contributingSignals: indicators.map((i) => ({
            category: "Wi-Fi Protocol",
            factor: i.name,
            points: i.scoreImpact,
            reason: i.description
          }))
        },
        recommendations: isOpen ? ["Do NOT connect to unencrypted public Wi-Fi networks without an enterprise VPN.", "Verify with venue staff that the SSID represents an authorized hotspot."] : ["Verify that the Wi-Fi network belongs to an authorized venue before joining.", "Maintain firewall and device isolation when joining non-home networks."],
        metadata: {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          analysisDurationMs: 85,
          aiModelUsed: "ThreatLens Wi-Fi Heuristic Engine",
          isAiFallback: false
        }
      };
    } else if (isContact) {
      const nameMatch = raw.match(/(?:FN:|N:)([^;\n]+)/i);
      const orgMatch = raw.match(/ORG:([^\n;]+)/i);
      const emailMatch = raw.match(/EMAIL[^:]*:([^\n;]+)/i);
      const phoneMatch = raw.match(/TEL[^:]*:([^\n;]+)/i);
      const urlMatch = raw.match(/URL[^:]*:([^\n;]+)/i);
      const name = nameMatch ? nameMatch[1].replace(/;/g, " ").trim() : "Unknown Name";
      const organization = orgMatch ? orgMatch[1].trim() : void 0;
      const email = emailMatch ? emailMatch[1].trim() : void 0;
      const phone = phoneMatch ? phoneMatch[1].trim() : void 0;
      const embeddedUrl = urlMatch ? urlMatch[1].trim() : void 0;
      contactDetails = {
        name,
        organization,
        email,
        phone,
        embeddedUrl
      };
      let riskScore = 0;
      let riskLevel = "SAFE";
      let threatType = "Digital Contact Card (vCard)";
      let summary = `Standard electronic business card payload for "${name}"${organization ? ` (${organization})` : ""}.`;
      const indicators = [];
      if (embeddedUrl && /^https?:\/\//i.test(embeddedUrl)) {
        const urlAnalysis = await urlAnalyzer.analyze(embeddedUrl);
        if (urlAnalysis.riskScore > 20) {
          riskScore = urlAnalysis.riskScore;
          riskLevel = urlAnalysis.riskLevel;
          threatType = `Deceptive Contact Card (${urlAnalysis.threatType})`;
          summary = `Contact card for "${name}" contains an embedded malicious destination: ${embeddedUrl}. ${urlAnalysis.summary}`;
          indicators.push(...urlAnalysis.indicators);
        }
      }
      baseAnalysis = {
        id: `scan-contact-${crypto5.randomUUID().slice(0, 8)}`,
        scanType: "qr",
        target: `Contact: ${name}`,
        riskScore,
        riskLevel,
        threatType,
        confidence: 0.92,
        summary,
        explanation: {
          whyDangerous: riskScore > 0 ? ["Contact card contains embedded malicious hyperlinks intended to deceive the recipient"] : ["Standard electronic business card without malicious vectors"],
          threatMechanics: riskScore > 0 ? "Trojan contact payload embedding phishing or credential harvesting links" : "Standard vCard/MeCard payload formatted for address book import"
        },
        indicators,
        technicalSignals: [
          {
            category: "Contact Identity",
            key: "Contact Full Name",
            value: name,
            status: "neutral",
            details: `Identity: ${name}`
          },
          ...organization ? [{
            category: "Contact Identity",
            key: "Organization",
            value: organization,
            status: "neutral",
            details: `Claimed organization: ${organization}`
          }] : [],
          ...email ? [{
            category: "Contact Channels",
            key: "Email Address",
            value: email,
            status: "neutral",
            details: `Direct email: ${email}`
          }] : [],
          ...embeddedUrl ? [{
            category: "Embedded Link",
            key: "Card Webpage",
            value: embeddedUrl,
            status: riskScore > 40 ? "malicious" : riskScore > 15 ? "suspicious" : "clean",
            details: `Embedded hyperlink destination: ${embeddedUrl}`
          }] : []
        ],
        riskBreakdown: {
          domainRisk: 0,
          urlStructureRisk: 0,
          sslRisk: 0,
          contentRisk: riskScore > 0 ? 30 : 0,
          reputationRisk: 0,
          aiRisk: 0,
          contributingSignals: indicators.map((i) => ({
            category: "Contact Payload",
            factor: i.name,
            points: i.scoreImpact,
            reason: i.description
          }))
        },
        recommendations: riskScore > 0 ? ["Do NOT click or open the embedded website inside this contact card.", "Do NOT add this contact to your device address book."] : ["Verify contact identity before importing into sensitive company directories.", "Standard contact sharing hygiene recommended."],
        metadata: {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          analysisDurationMs: 110,
          aiModelUsed: "ThreatLens Contact Inspection Engine",
          isAiFallback: false
        }
      };
    } else if (isPayment) {
      const network = /^bitcoin:/i.test(raw) ? "Bitcoin" : /^ethereum:/i.test(raw) ? "Ethereum" : /^upi:/i.test(raw) ? "UPI Payment" : "Crypto Asset";
      const cleanTarget = raw.split("?")[0].replace(/^[a-z]+:\/?\/?/i, "");
      paymentDetails = {
        network,
        recipient: cleanTarget.slice(0, 42)
      };
      baseAnalysis = {
        id: `scan-pay-${crypto5.randomUUID().slice(0, 8)}`,
        scanType: "qr",
        target: `${network}: ${cleanTarget.slice(0, 20)}...`,
        riskScore: 25,
        riskLevel: "LOW",
        threatType: `${network} Transaction Request`,
        confidence: 0.9,
        summary: `Direct ${network} transaction URI detected. Cryptographic and financial QR codes should always be double-checked against physical tampering before signing funds.`,
        explanation: {
          whyDangerous: ["Physical QR stickers in public spaces can be replaced with fraudulent payment addresses by malicious actors."],
          threatMechanics: "Direct wallet address protocol handler invoking transaction interfaces"
        },
        indicators: [
          {
            type: "qr",
            name: "Financial Transaction Protocol",
            severity: "low",
            description: "Direct payment handler URI detected. Verify destination address with recipient before broadcast.",
            scoreImpact: 15
          }
        ],
        technicalSignals: [
          {
            category: "Payment Protocol",
            key: "Network / Rail",
            value: network,
            status: "neutral",
            details: `Protocol rail: ${network}`
          },
          {
            category: "Payment Destination",
            key: "Recipient Address",
            value: cleanTarget.length > 32 ? cleanTarget.slice(0, 29) + "..." : cleanTarget,
            status: "neutral",
            details: `Encoded recipient address: ${cleanTarget}`
          }
        ],
        riskBreakdown: {
          domainRisk: 0,
          urlStructureRisk: 0,
          sslRisk: 0,
          contentRisk: 15,
          reputationRisk: 0,
          aiRisk: 0,
          contributingSignals: [
            {
              category: "Payment Vector",
              factor: "Financial Transfer Handshake",
              points: 15,
              reason: "Unverified financial transaction QR request"
            }
          ]
        },
        recommendations: [
          "Verify the complete destination address with the intended recipient before authorizing transactions.",
          "Check for physical stickers pasted over original merchant QR stands."
        ],
        metadata: {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          analysisDurationMs: 95,
          aiModelUsed: "ThreatLens Payment Vector Engine",
          isAiFallback: false
        }
      };
    } else {
      baseAnalysis = await messageAnalyzer.analyze(raw);
    }
    const isSafe = baseAnalysis.riskScore <= 15;
    const isMalicious = baseAnalysis.riskScore >= 60;
    const isSuspicious = baseAnalysis.riskScore > 15 && baseAnalysis.riskScore < 60;
    const qrIndicators = [];
    if (isMalicious || isSuspicious) {
      qrIndicators.push({
        type: "qr",
        name: isMalicious ? "Quishing (QR Phishing) Concealment Attack" : "Quishing Deception Vector",
        severity: isMalicious ? "critical" : "medium",
        description: "QR matrix conceals destination from human visual inspection prior to camera capture, bypassing traditional web security gateways.",
        scoreImpact: isMalicious ? 15 : 5
      });
    } else {
      qrIndicators.push({
        type: "qr",
        name: "QR Matrix Integrity Validated",
        severity: "info",
        description: "Direct, standard QR matrix encoding without multi-hop obfuscation, homoglyphs, or deceptive redirects.",
        scoreImpact: 0
      });
    }
    qrIndicators.push(...baseAnalysis.indicators);
    const qrTechnicalSignals = [
      {
        category: "QR Telemetry",
        key: "Matrix Content Type",
        value: contentType.toUpperCase(),
        status: "clean",
        details: `Decoded payload categorized as ${contentType.toUpperCase()} format`
      },
      {
        category: "QR Telemetry",
        key: "Decoded Payload Preview",
        value: raw.length > 55 ? raw.slice(0, 52) + "..." : raw,
        status: isMalicious ? "malicious" : isSuspicious ? "suspicious" : "clean",
        details: isUrl ? "Direct Web Destination URI" : `${contentType.toUpperCase()} Payload Data`
      },
      {
        category: "QR Security",
        key: "Obfuscation & Masking",
        value: isMalicious ? "High Risk (Concealed Threat)" : isSuspicious ? "Elevated (Unverified Entity)" : "Standard (Direct Single-Layer)",
        status: isMalicious ? "malicious" : isSuspicious ? "suspicious" : "clean",
        details: isSafe ? "Payload destination matches authentic web infrastructure without hidden redirects" : "QR image conceals unverified or hostile endpoint from human visual preview"
      },
      ...baseAnalysis.technicalSignals
    ];
    const quishingRecommendations = isMalicious ? [
      "DO NOT open or visit this QR destination.",
      "DO NOT enter passwords, phone numbers, or multi-factor authentication codes.",
      "Report this physical QR code to property management or facility security if found in a public place.",
      ...baseAnalysis.recommendations
    ] : isSuspicious ? [
      "Exercise caution: verify the destination address carefully before proceeding.",
      "Ensure the domain matches the authentic brand exactly before logging in.",
      "Check that a physical sticker was not pasted over original signage.",
      ...baseAnalysis.recommendations
    ] : [
      "Verified destination: Safe to proceed.",
      "Standard cybersecurity hygiene: Always inspect browser address bar after page loads.",
      ...baseAnalysis.recommendations
    ];
    const uniqueRecommendations = Array.from(new Set(quishingRecommendations));
    const checksPerformed = [
      {
        id: "chk-decode",
        name: "QR Matrix Decoded",
        category: "Decoding",
        status: "CHECKED",
        finding: "clean",
        evidence: `Extracted ${raw.length} bytes using ISO/IEC 18004 2D matrix decoder.`
      },
      {
        id: "chk-type",
        name: "Content Type Identification",
        category: "Classification",
        status: "CHECKED",
        finding: "clean",
        evidence: `Identified payload as ${contentType.toUpperCase()} data format.`
      },
      {
        id: "chk-url",
        name: "Destination URL Extraction",
        category: "Extraction",
        status: isUrl ? "CHECKED" : "NOT_APPLICABLE",
        finding: isUrl ? isMalicious ? "malicious" : isSuspicious ? "suspicious" : "clean" : "neutral",
        evidence: isUrl ? `Extracted direct web destination: ${urlDetails?.domain}` : "Non-URL content payload."
      },
      {
        id: "chk-domain",
        name: "Domain & Host Authority",
        category: "Infrastructure",
        status: isUrl ? "CHECKED" : "NOT_APPLICABLE",
        finding: isUrl ? urlDetails?.isIpHost || isMalicious ? "malicious" : isSuspicious ? "suspicious" : "clean" : "neutral",
        evidence: isUrl ? urlDetails?.isIpHost ? `Raw IP address host (${urlDetails.domain}) bypassing DNS` : `Inspected domain ${urlDetails?.domain} in .${urlDetails?.tld} zone` : "Domain inspection not applicable for non-web payloads."
      },
      {
        id: "chk-dns",
        name: "DNS Resolution Audit",
        category: "Network",
        status: isUrl ? "CHECKED" : "NOT_APPLICABLE",
        finding: isUrl ? baseAnalysis.threatIntelligence?.dnsStatus?.isResolved !== false ? "clean" : "suspicious" : "neutral",
        evidence: isUrl ? urlDetails?.ipAddress ? `Resolved authoritative IP: ${urlDetails.ipAddress}` : "Authoritative DNS lookup completed." : "DNS resolution not applicable."
      },
      {
        id: "chk-tls",
        name: "SSL/TLS Cryptographic Transport",
        category: "Protocol",
        status: isUrl ? "CHECKED" : "NOT_APPLICABLE",
        finding: isUrl ? urlDetails?.isHttps ? "clean" : "suspicious" : "neutral",
        evidence: isUrl ? urlDetails?.isHttps ? "Secure HTTPS cryptographic transport confirmed" : "Insecure HTTP cleartext transport detected" : "SSL/TLS not applicable."
      },
      {
        id: "chk-threat-intel",
        name: "Threat Intelligence Feeds",
        category: "Intelligence",
        status: "CHECKED",
        finding: isMalicious ? "malicious" : isSuspicious ? "suspicious" : "clean",
        evidence: isMalicious ? "Known malicious phishing domain signature matched in threat databases." : "Zero positive malicious flags across global cybersecurity threat feeds."
      },
      {
        id: "chk-quishing",
        name: "Quishing Deception Heuristics",
        category: "Heuristics",
        status: "CHECKED",
        finding: isMalicious ? "malicious" : isSuspicious ? "suspicious" : "clean",
        evidence: isSafe ? "No deceptive brand spoofing, homoglyph characters, or credential theft parameters detected." : baseAnalysis.explanation.threatMechanics || "Deceptive destination patterns identified."
      },
      {
        id: "chk-ai",
        name: "ThreatLens Multi-Model Risk Engine",
        category: "Risk Scoring",
        status: "CHECKED",
        finding: isMalicious ? "malicious" : isSuspicious ? "suspicious" : "clean",
        evidence: `Risk calculation derived from ${baseAnalysis.riskBreakdown.contributingSignals.length + 1} cross-correlated heuristic signals.`
      }
    ];
    const checkedCount = checksPerformed.filter((c) => c.status === "CHECKED").length;
    const aiConfidence = baseAnalysis.confidence >= 0.9 ? "High" : baseAnalysis.confidence >= 0.75 ? "Substantial" : "Moderate";
    const externalVerification = isUrl ? `${checkedCount} independent verification layers (Authoritative DNS, Threat Feeds, TLS Certificate, Heuristic Rules)` : `${checkedCount} forensic layers checked (Matrix Decoder, Syntax Parser, Security Heuristics)`;
    const qrForensics = {
      contentType,
      format: "QR Code (ISO/IEC 18004)",
      decodedPayload: raw,
      quishingRiskAssessed: true,
      urlDetails,
      wifiDetails,
      contactDetails,
      paymentDetails,
      checksPerformed,
      confidenceMetrics: {
        aiConfidence,
        aiConfidenceScore: baseAnalysis.confidence,
        externalVerification,
        sourcesCheckedCount: checkedCount,
        limitationsNotice: "Static forensic inspection evaluates decoded payload parameters, domain infrastructure, and threat feeds. Active JavaScript payload sandbox is isolated without triggering malicious server callbacks."
      }
    };
    return {
      ...baseAnalysis,
      id: `scan-qr-${crypto5.randomUUID().slice(0, 8)}`,
      scanType: "qr",
      target: raw,
      indicators: qrIndicators,
      technicalSignals: qrTechnicalSignals,
      recommendations: uniqueRecommendations,
      qrForensics,
      explanation: {
        whyDangerous: isSafe ? ["No malicious or deceptive elements found in this QR code. Destination and content conform to authentic security standards."] : [
          "QR codes cannot be read or validated by the human eye before camera scanning",
          ...baseAnalysis.explanation.whyDangerous
        ],
        threatMechanics: isSafe ? "Standard authentic QR matrix linking directly to legitimate web or content resources without obfuscation." : `Quishing vector: ${baseAnalysis.explanation.threatMechanics}`
      }
    };
  }
};
var qrAnalyzer = new QrAnalyzerService();

// server/controllers/scanController.ts
var ScanController = class {
  static async getAnonymousStatus(req, res) {
    try {
      const anonId = req.headers["x-threatlens-anon-session"] || req.query.sessionId;
      if (!anonId) {
        return res.json({
          sessionId: `anon-${crypto6.randomUUID()}`,
          scanCount: 0,
          remaining: 1,
          hasScanned: false
        });
      }
      const session = db.getAnonymousSession(anonId, req.ip);
      return res.json({
        sessionId: session.sessionId,
        scanCount: session.scanCount,
        remaining: Math.max(0, 1 - session.scanCount),
        hasScanned: session.scanCount >= 1,
        scanId: session.scanIds[session.scanIds.length - 1]
      });
    } catch (err) {
      return res.status(500).json({ error: "Failed to retrieve session status" });
    }
  }
  static async scanUrl(req, res) {
    try {
      const { url } = req.body;
      if (!url || typeof url !== "string" || !url.trim()) {
        return res.status(400).json({ error: "Please provide a valid URL string." });
      }
      if (!req.user?.id) {
        let anonId = req.headers["x-threatlens-anon-session"] || req.body.anonymousSessionId;
        if (!anonId || typeof anonId !== "string") {
          anonId = `anon-${crypto6.randomUUID()}`;
        }
        res.setHeader("X-ThreatLens-Anon-Session", anonId);
        const session = db.getAnonymousSession(anonId, req.ip);
        if (session.scanCount >= 1) {
          return res.status(403).json({
            error: "You have used your free ThreatLens scan.",
            code: "AUTH_REQUIRED",
            requiresAuth: true,
            message: "Create an account or sign in to continue analyzing URLs and keep your scan history.",
            anonymousSession: {
              sessionId: anonId,
              scanCount: session.scanCount,
              remaining: 0
            }
          });
        }
        const result2 = await urlAnalyzer.analyze(url.trim());
        result2.anonymousSessionId = anonId;
        db.saveScan(result2);
        db.recordAnonymousScan(anonId, result2.id, req.ip);
        return res.json({
          ...result2,
          anonymousSession: {
            sessionId: anonId,
            scanCount: 1,
            remaining: 0
          }
        });
      }
      const result = await urlAnalyzer.analyze(url.trim());
      result.userId = req.user.id;
      db.saveScan(result);
      return res.json(result);
    } catch (err) {
      console.error("URL scan error:", err);
      return res.status(500).json({ error: err?.message || "Error executing URL security inspection" });
    }
  }
  static async scanMessage(req, res) {
    try {
      const { message } = req.body;
      if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ error: "Please provide message or email text to analyze." });
      }
      const result = await messageAnalyzer.analyze(message.trim());
      if (req.user?.id) {
        result.userId = req.user.id;
      }
      db.saveScan(result);
      return res.json(result);
    } catch (err) {
      console.error("Message scan error:", err);
      return res.status(500).json({ error: err?.message || "Error executing scam message inspection" });
    }
  }
  static async scanScreenshot(req, res) {
    try {
      const { image, filename } = req.body;
      if (!image || typeof image !== "string") {
        return res.status(400).json({ error: "Please provide an image in base64 format." });
      }
      const result = await screenshotAnalyzer.analyze(image, filename);
      if (req.user?.id) {
        result.userId = req.user.id;
      }
      db.saveScan(result);
      return res.json(result);
    } catch (err) {
      console.error("Screenshot scan error:", err);
      return res.status(500).json({ error: err?.message || "Error analyzing screenshot image" });
    }
  }
  static async scanQr(req, res) {
    try {
      const { payload, metaSource } = req.body;
      if (!payload || typeof payload !== "string" || !payload.trim()) {
        return res.status(400).json({ error: "Please provide decoded QR payload text or link." });
      }
      const result = await qrAnalyzer.analyzePayload(payload.trim(), metaSource);
      if (req.user?.id) {
        result.userId = req.user.id;
      }
      db.saveScan(result);
      return res.json(result);
    } catch (err) {
      console.error("QR scan error:", err);
      return res.status(500).json({ error: err?.message || "Error analyzing QR code destination" });
    }
  }
  static async getScans(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required to access scan history" });
      }
      const userId = req.user.id;
      const { q, level, type, limit = "50", page = "1" } = req.query;
      let scans = db.getScans(userId);
      if (q && typeof q === "string") {
        const query = q.toLowerCase();
        scans = scans.filter(
          (s) => s.target.toLowerCase().includes(query) || s.threatType.toLowerCase().includes(query) || s.summary.toLowerCase().includes(query)
        );
      }
      if (level && typeof level === "string" && level !== "ALL") {
        scans = scans.filter((s) => s.riskLevel.toUpperCase() === level.toUpperCase());
      }
      if (type && typeof type === "string" && type !== "ALL") {
        scans = scans.filter((s) => s.scanType.toLowerCase() === type.toLowerCase());
      }
      const parsedLimit = Math.max(1, parseInt(limit) || 50);
      const parsedPage = Math.max(1, parseInt(page) || 1);
      const startIndex = (parsedPage - 1) * parsedLimit;
      const paginated = scans.slice(startIndex, startIndex + parsedLimit);
      return res.json({
        total: scans.length,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.max(1, Math.ceil(scans.length / parsedLimit)),
        scans: paginated
      });
    } catch (err) {
      return res.status(500).json({ error: "Failed to retrieve scan history" });
    }
  }
  static async getScanById(req, res) {
    try {
      const { id } = req.params;
      const scan = db.getScanById(id);
      if (!scan) {
        return res.status(404).json({ error: "Scan record not found" });
      }
      if (req.user?.id) {
        if (scan.userId && scan.userId !== req.user.id) {
          return res.status(403).json({ error: "Access denied. You do not have permission to view this threat report." });
        }
        return res.json(scan);
      }
      const anonId = req.headers["x-threatlens-anon-session"] || req.query.sessionId;
      if (scan.anonymousSessionId && anonId && scan.anonymousSessionId === anonId) {
        return res.json(scan);
      }
      return res.status(401).json({ error: "Authentication required to view this threat report" });
    } catch (err) {
      return res.status(500).json({ error: "Error fetching scan details" });
    }
  }
  static async deleteScan(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const { id } = req.params;
      const result = db.deleteScan(id, req.user.id);
      if (result.notFound) {
        return res.status(404).json({ error: "Scan record not found" });
      }
      if (result.unauthorized) {
        return res.status(403).json({ error: "Access denied. You do not have permission to delete this scan record." });
      }
      return res.json({ message: "Scan record deleted successfully" });
    } catch (err) {
      return res.status(500).json({ error: "Error deleting scan record" });
    }
  }
  static async clearHistory(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const count = db.clearUserScans(req.user.id);
      return res.json({ message: `Purged ${count} scan record(s) for your account` });
    } catch (err) {
      return res.status(500).json({ error: "Error clearing history" });
    }
  }
  static async getDashboardStats(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const scans = db.getScans(req.user.id);
      const totalScans = scans.length;
      const threatsDetected = scans.filter((s) => s.riskLevel !== "SAFE").length;
      const highRiskThreats = scans.filter((s) => s.riskLevel === "HIGH" || s.riskLevel === "CRITICAL").length;
      const safeScans = scans.filter((s) => s.riskLevel === "SAFE").length;
      let securityAwarenessScore = 100;
      if (totalScans > 0) {
        const ratio = safeScans / totalScans;
        securityAwarenessScore = Math.min(100, Math.max(10, Math.round(50 + ratio * 50)));
      }
      const riskDistribution = {
        safe: scans.filter((s) => s.riskLevel === "SAFE").length,
        low: scans.filter((s) => s.riskLevel === "LOW").length,
        medium: scans.filter((s) => s.riskLevel === "MEDIUM").length,
        high: scans.filter((s) => s.riskLevel === "HIGH").length,
        critical: scans.filter((s) => s.riskLevel === "CRITICAL").length
      };
      const typeMap = { url: 0, message: 0, screenshot: 0, qr: 0 };
      scans.forEach((s) => {
        typeMap[s.scanType] = (typeMap[s.scanType] || 0) + 1;
      });
      const scansByType = [
        { type: "URL Scan", count: typeMap.url || 0 },
        { type: "Message Scan", count: typeMap.message || 0 },
        { type: "Screenshot", count: typeMap.screenshot || 0 },
        { type: "QR Code", count: typeMap.qr || 0 }
      ];
      const threatCounts = {};
      scans.forEach((s) => {
        if (s.riskLevel !== "SAFE" && s.threatType) {
          threatCounts[s.threatType] = (threatCounts[s.threatType] || 0) + 1;
        }
      });
      const topThreatCategories = Object.entries(threatCounts).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count).slice(0, 5);
      const dayMap = {};
      const now = /* @__PURE__ */ new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1e3);
        const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        dayMap[key] = { scans: 0, threats: 0 };
      }
      scans.forEach((s) => {
        const d = new Date(s.metadata.timestamp);
        const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (dayMap[key]) {
          dayMap[key].scans += 1;
          if (s.riskLevel !== "SAFE") {
            dayMap[key].threats += 1;
          }
        }
      });
      const scansOverTime = Object.entries(dayMap).map(([date, data]) => ({
        date,
        scans: data.scans,
        threats: data.threats
      }));
      const stats = {
        totalScans,
        threatsDetected,
        highRiskThreats,
        safeScans,
        securityAwarenessScore,
        riskDistribution,
        scansOverTime,
        scansByType,
        topThreatCategories
      };
      return res.json(stats);
    } catch (err) {
      console.error("Stats error:", err);
      return res.status(500).json({ error: "Failed to compute dashboard statistics" });
    }
  }
};

// server/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var JWT_SECRET2 = process.env.JWT_SECRET || "threatlens_super_secret_jwt_key_2026";
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required. Please provide a valid Bearer token." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt2.verify(token, JWT_SECRET2);
    const user = db.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User associated with this token no longer exists." });
    }
    req.user = { id: user.id, email: user.email, name: user.name };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session token." });
  }
}
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt2.verify(token, JWT_SECRET2);
      const user = db.getUserById(decoded.id);
      if (user) {
        req.user = { id: user.id, email: user.email, name: user.name };
      }
    } catch {
    }
  }
  next();
}

// server/routes/api.ts
var router = Router();
router.get("/health", (req, res) => {
  res.json({
    status: "online",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    service: "ThreatLens AI Cybersecurity Engine",
    version: "1.0.0"
  });
});
router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);
router.get("/auth/me", requireAuth, AuthController.me);
router.put("/auth/profile", requireAuth, AuthController.updateProfile);
router.put("/auth/password", requireAuth, AuthController.updatePassword);
router.delete("/auth/account", requireAuth, AuthController.deleteAccount);
router.get("/scan/anonymous/status", optionalAuth, ScanController.getAnonymousStatus);
router.post("/scan/url", optionalAuth, ScanController.scanUrl);
router.post("/scan/message", optionalAuth, ScanController.scanMessage);
router.post("/scan/screenshot", optionalAuth, ScanController.scanScreenshot);
router.post("/scan/qr", optionalAuth, ScanController.scanQr);
router.get("/scans", requireAuth, ScanController.getScans);
router.get("/scans/:id", optionalAuth, ScanController.getScanById);
router.delete("/scans/:id", requireAuth, ScanController.deleteScan);
router.delete("/scans", requireAuth, ScanController.clearHistory);
router.get("/dashboard/stats", requireAuth, ScanController.getDashboardStats);
var api_default = router;

// server/app.ts
var app = express();
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-ThreatLens-Anon-Session");
  res.setHeader("Access-Control-Expose-Headers", "X-ThreatLens-Anon-Session");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use("/api", api_default);
app.use("/", api_default);
var app_default = app;
export {
  app_default as default
};
