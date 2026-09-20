import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'threatlens_super_secret_jwt_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please provide a valid Bearer token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string };
    const user = db.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User associated with this token no longer exists.' });
    }
    req.user = { id: user.id, email: user.email, name: user.name };
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string };
      const user = db.getUserById(decoded.id);
      if (user) {
        req.user = { id: user.id, email: user.email, name: user.name };
      }
    } catch {
      // Ignored for optional
    }
  }
  next();
}
