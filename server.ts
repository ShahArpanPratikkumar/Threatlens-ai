import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/routes/api.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for screenshot forensic uploads
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Security headers & basic CORS for extension communication
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

  // API routes FIRST
  app.use('/api', apiRouter);

  // Serve extension files statically so users can view or download
  const extensionPath = path.join(process.cwd(), 'extension');
  app.use('/extension', express.static(extensionPath));
  const distExtensionPath = path.join(process.cwd(), 'dist-extension');
  app.use('/dist-extension', express.static(distExtensionPath));
  const publicPath = path.join(process.cwd(), 'public');
  app.use(express.static(publicPath));

  // Vite middleware for development / production SPA fallback
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ThreatLens SOC] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ThreatLens server:', err);
});
