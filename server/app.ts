import express from 'express';
import apiRouter from './routes/api.ts';

const app = express();

// Increase payload limit for screenshot forensic uploads
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Security headers & basic CORS for extension communication and cross-origin usage
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-ThreatLens-Anon-Session');
  res.setHeader('Access-Control-Expose-Headers', 'X-ThreatLens-Anon-Session');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Mount API router on both /api (standard path) and / (rewritten path)
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
