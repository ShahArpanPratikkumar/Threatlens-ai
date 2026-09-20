import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../config/db.ts';
import type { AuthenticatedRequest } from '../middleware/auth.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'threatlens_super_secret_jwt_key_2026';

export class AuthController {
  public static async register(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, email, password, anonymousSessionId } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Please provide name, email, and password.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existing = db.getUserByEmail(normalizedEmail);
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const now = new Date().toISOString();

      const newUser = db.createUser({
        id: `usr-${crypto.randomUUID().slice(0, 8)}`,
        name: name.trim(),
        email: email.trim(),
        normalizedEmail,
        passwordHash,
        createdAt: now,
        lastLoginAt: now,
        accountStatus: 'active',
        role: 'analyst'
      });

      // Transfer any anonymous scans performed prior to account creation
      const anonId = anonymousSessionId || req.headers['x-threatlens-anon-session'] as string;
      if (anonId) {
        db.transferAnonymousScans(anonId, newUser.id);
      }

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, name: newUser.name },
        JWT_SECRET,
        { expiresIn: '7d' }
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
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Server error during registration' });
    }
  }

  public static async login(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, password, anonymousSessionId } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      // Check if user exists
      let user = db.getUserByEmail(normalizedEmail);
      
      // Seed default demo user if logging in with demo credentials for instant hackathon walkthrough
      if (!user && (normalizedEmail === 'demo@threatlens.ai' || normalizedEmail === 'analyst@threatlens.ai')) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('password123', salt);
        user = db.createUser({
          id: 'usr-demo-03eaaf',
          name: 'Cyber Analyst',
          email: 'analyst@threatlens.ai',
          normalizedEmail: 'analyst@threatlens.ai',
          passwordHash,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          accountStatus: 'active',
          role: 'analyst'
        });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Update last login timestamp
      const now = new Date().toISOString();
      db.updateUser(user.id, { lastLoginAt: now });

      // Transfer any anonymous scans to this user
      const anonId = anonymousSessionId || req.headers['x-threatlens-anon-session'] as string;
      if (anonId) {
        db.transferAnonymousScans(anonId, user.id);
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          lastLoginAt: now,
          accountStatus: user.accountStatus || 'active',
          role: user.role
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Server error during login' });
    }
  }

  public static async me(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const user = db.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
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

  public static async updateProfile(req: AuthenticatedRequest, res: Response) {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const updated = db.updateUser(req.user.id, { name: name.trim() });
    if (!updated) return res.status(404).json({ error: 'User not found' });
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

  public static async updatePassword(req: AuthenticatedRequest, res: Response) {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }
    const user = db.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: 'Current password does not match' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    db.updateUser(req.user.id, { passwordHash });

    return res.json({ message: 'Password updated successfully' });
  }

  public static async deleteAccount(req: AuthenticatedRequest, res: Response) {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    db.deleteUser(req.user.id);
    return res.json({ message: 'Account and associated profile data deleted' });
  }
}
