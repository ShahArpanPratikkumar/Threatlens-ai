import type { Response } from 'express';
import crypto from 'crypto';
import { db } from '../config/db.ts';
import { urlAnalyzer } from '../services/urlAnalyzer.ts';
import { messageAnalyzer } from '../services/messageAnalyzer.ts';
import { screenshotAnalyzer } from '../services/screenshotAnalyzer.ts';
import { qrAnalyzer } from '../services/qrAnalyzer.ts';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import type { DashboardStats, SecurityAnalysisResult } from '../types.ts';

export class ScanController {
  public static async getAnonymousStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const anonId = (req.headers['x-threatlens-anon-session'] as string) || (req.query.sessionId as string);
      if (!anonId) {
        return res.json({
          sessionId: `anon-${crypto.randomUUID()}`,
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
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to retrieve session status' });
    }
  }

  public static async scanUrl(req: AuthenticatedRequest, res: Response) {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string' || !url.trim()) {
        return res.status(400).json({ error: 'Please provide a valid URL string.' });
      }

      // Check if user is authenticated
      if (!req.user?.id) {
        // Enforce 1 free scan limit for anonymous visitors via server session
        let anonId = (req.headers['x-threatlens-anon-session'] as string) || req.body.anonymousSessionId;
        if (!anonId || typeof anonId !== 'string') {
          anonId = `anon-${crypto.randomUUID()}`;
        }
        res.setHeader('X-ThreatLens-Anon-Session', anonId);

        const session = db.getAnonymousSession(anonId, req.ip);
        if (session.scanCount >= 1) {
          return res.status(403).json({
            error: 'You have used your free ThreatLens scan.',
            code: 'AUTH_REQUIRED',
            requiresAuth: true,
            message: 'Create an account or sign in to continue analyzing URLs and keep your scan history.',
            anonymousSession: {
              sessionId: anonId,
              scanCount: session.scanCount,
              remaining: 0
            }
          });
        }

        // Execute real, data-driven analysis
        const result = await urlAnalyzer.analyze(url.trim());
        result.anonymousSessionId = anonId;
        db.saveScan(result);
        db.recordAnonymousScan(anonId, result.id, req.ip);

        return res.json({
          ...result,
          anonymousSession: {
            sessionId: anonId,
            scanCount: 1,
            remaining: 0
          }
        });
      }

      // Authenticated scan: Full access, associated with user account
      const result = await urlAnalyzer.analyze(url.trim());
      result.userId = req.user.id;
      db.saveScan(result);

      return res.json(result);
    } catch (err: any) {
      console.error('URL scan error:', err);
      return res.status(500).json({ error: err?.message || 'Error executing URL security inspection' });
    }
  }

  public static async scanMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'Please provide message or email text to analyze.' });
      }

      const result = await messageAnalyzer.analyze(message.trim());
      if (req.user?.id) {
        result.userId = req.user.id;
      }
      db.saveScan(result);

      return res.json(result);
    } catch (err: any) {
      console.error('Message scan error:', err);
      return res.status(500).json({ error: err?.message || 'Error executing scam message inspection' });
    }
  }

  public static async scanScreenshot(req: AuthenticatedRequest, res: Response) {
    try {
      const { image, filename } = req.body;
      if (!image || typeof image !== 'string') {
        return res.status(400).json({ error: 'Please provide an image in base64 format.' });
      }

      const result = await screenshotAnalyzer.analyze(image, filename);
      if (req.user?.id) {
        result.userId = req.user.id;
      }
      db.saveScan(result);

      return res.json(result);
    } catch (err: any) {
      console.error('Screenshot scan error:', err);
      return res.status(500).json({ error: err?.message || 'Error analyzing screenshot image' });
    }
  }

  public static async scanQr(req: AuthenticatedRequest, res: Response) {
    try {
      const { payload, metaSource } = req.body;
      if (!payload || typeof payload !== 'string' || !payload.trim()) {
        return res.status(400).json({ error: 'Please provide decoded QR payload text or link.' });
      }

      const result = await qrAnalyzer.analyzePayload(payload.trim(), metaSource);
      if (req.user?.id) {
        result.userId = req.user.id;
      }
      db.saveScan(result);

      return res.json(result);
    } catch (err: any) {
      console.error('QR scan error:', err);
      return res.status(500).json({ error: err?.message || 'Error analyzing QR code destination' });
    }
  }

  public static async getScans(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required to access scan history' });
      }
      const userId = req.user.id;
      const { q, level, type, limit = '50', page = '1' } = req.query;
      let scans = db.getScans(userId);

      if (q && typeof q === 'string') {
        const query = q.toLowerCase();
        scans = scans.filter(s => 
          s.target.toLowerCase().includes(query) || 
          s.threatType.toLowerCase().includes(query) ||
          s.summary.toLowerCase().includes(query)
        );
      }

      if (level && typeof level === 'string' && level !== 'ALL') {
        scans = scans.filter(s => s.riskLevel.toUpperCase() === level.toUpperCase());
      }

      if (type && typeof type === 'string' && type !== 'ALL') {
        scans = scans.filter(s => s.scanType.toLowerCase() === type.toLowerCase());
      }

      const parsedLimit = Math.max(1, parseInt(limit as string) || 50);
      const parsedPage = Math.max(1, parseInt(page as string) || 1);
      const startIndex = (parsedPage - 1) * parsedLimit;
      const paginated = scans.slice(startIndex, startIndex + parsedLimit);

      return res.json({
        total: scans.length,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.max(1, Math.ceil(scans.length / parsedLimit)),
        scans: paginated
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to retrieve scan history' });
    }
  }

  public static async getScanById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const scan = db.getScanById(id);
      if (!scan) {
        return res.status(404).json({ error: 'Scan record not found' });
      }

      // If user is authenticated, enforce strict user data isolation
      if (req.user?.id) {
        if (scan.userId && scan.userId !== req.user.id) {
          return res.status(403).json({ error: 'Access denied. You do not have permission to view this threat report.' });
        }
        return res.json(scan);
      }

      // If anonymous visitor, allow access ONLY if this scan was performed in their anonymous session
      const anonId = (req.headers['x-threatlens-anon-session'] as string) || (req.query.sessionId as string);
      if (scan.anonymousSessionId && anonId && scan.anonymousSessionId === anonId) {
        return res.json(scan);
      }

      // Otherwise require authentication
      return res.status(401).json({ error: 'Authentication required to view this threat report' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Error fetching scan details' });
    }
  }

  public static async deleteScan(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const result = db.deleteScan(id, req.user.id);
      if (result.notFound) {
        return res.status(404).json({ error: 'Scan record not found' });
      }
      if (result.unauthorized) {
        return res.status(403).json({ error: 'Access denied. You do not have permission to delete this scan record.' });
      }
      return res.json({ message: 'Scan record deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Error deleting scan record' });
    }
  }

  public static async clearHistory(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const count = db.clearUserScans(req.user.id);
      return res.json({ message: `Purged ${count} scan record(s) for your account` });
    } catch (err: any) {
      return res.status(500).json({ error: 'Error clearing history' });
    }
  }

  public static async getDashboardStats(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const scans = db.getScans(req.user.id);
      const totalScans = scans.length;
      const threatsDetected = scans.filter(s => s.riskLevel !== 'SAFE').length;
      const highRiskThreats = scans.filter(s => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL').length;
      const safeScans = scans.filter(s => s.riskLevel === 'SAFE').length;

      // Real calculations strictly based on user's database records
      let securityAwarenessScore = 100;
      if (totalScans > 0) {
        const ratio = safeScans / totalScans;
        securityAwarenessScore = Math.min(100, Math.max(10, Math.round(50 + ratio * 50)));
      }

      const riskDistribution = {
        safe: scans.filter(s => s.riskLevel === 'SAFE').length,
        low: scans.filter(s => s.riskLevel === 'LOW').length,
        medium: scans.filter(s => s.riskLevel === 'MEDIUM').length,
        high: scans.filter(s => s.riskLevel === 'HIGH').length,
        critical: scans.filter(s => s.riskLevel === 'CRITICAL').length
      };

      // Aggregates by type
      const typeMap: Record<string, number> = { url: 0, message: 0, screenshot: 0, qr: 0 };
      scans.forEach(s => {
        typeMap[s.scanType] = (typeMap[s.scanType] || 0) + 1;
      });
      const scansByType = [
        { type: 'URL Scan', count: typeMap.url || 0 },
        { type: 'Message Scan', count: typeMap.message || 0 },
        { type: 'Screenshot', count: typeMap.screenshot || 0 },
        { type: 'QR Code', count: typeMap.qr || 0 }
      ];

      // Top threat categories
      const threatCounts: Record<string, number> = {};
      scans.forEach(s => {
        if (s.riskLevel !== 'SAFE' && s.threatType) {
          threatCounts[s.threatType] = (threatCounts[s.threatType] || 0) + 1;
        }
      });
      const topThreatCategories = Object.entries(threatCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Scans over time (last 7 days) strictly from user database records
      const dayMap: Record<string, { scans: number; threats: number }> = {};
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dayMap[key] = { scans: 0, threats: 0 };
      }

      scans.forEach(s => {
        const d = new Date(s.metadata.timestamp);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (dayMap[key]) {
          dayMap[key].scans += 1;
          if (s.riskLevel !== 'SAFE') {
            dayMap[key].threats += 1;
          }
        }
      });

      const scansOverTime = Object.entries(dayMap).map(([date, data]) => ({
        date,
        scans: data.scans,
        threats: data.threats
      }));

      const stats: DashboardStats = {
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
    } catch (err: any) {
      console.error('Stats error:', err);
      return res.status(500).json({ error: 'Failed to compute dashboard statistics' });
    }
  }
}
