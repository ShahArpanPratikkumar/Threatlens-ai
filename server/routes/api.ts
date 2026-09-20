import { Router } from 'express';
import { AuthController } from '../controllers/authController.ts';
import { ScanController } from '../controllers/scanController.ts';
import { requireAuth, optionalAuth } from '../middleware/auth.ts';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'ThreatLens AI Cybersecurity Engine',
    version: '1.0.0'
  });
});

// Auth routes
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', requireAuth, AuthController.me);
router.put('/auth/profile', requireAuth, AuthController.updateProfile);
router.put('/auth/password', requireAuth, AuthController.updatePassword);
router.delete('/auth/account', requireAuth, AuthController.deleteAccount);

// Anonymous scan session check
router.get('/scan/anonymous/status', optionalAuth, ScanController.getAnonymousStatus);

// Scanning routes (supports both guest users with 1-scan limit and unlimited authenticated users)
router.post('/scan/url', optionalAuth, ScanController.scanUrl);
router.post('/scan/message', optionalAuth, ScanController.scanMessage);
router.post('/scan/screenshot', optionalAuth, ScanController.scanScreenshot);
router.post('/scan/qr', optionalAuth, ScanController.scanQr);

// Scans & History (Protected per-user telemetry)
router.get('/scans', requireAuth, ScanController.getScans);
router.get('/scans/:id', optionalAuth, ScanController.getScanById);
router.delete('/scans/:id', requireAuth, ScanController.deleteScan);
router.delete('/scans', requireAuth, ScanController.clearHistory);

// Dashboard Statistics (Protected per-user telemetry)
router.get('/dashboard/stats', requireAuth, ScanController.getDashboardStats);

export default router;
