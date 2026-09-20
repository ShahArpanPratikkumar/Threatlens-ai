import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import app from './server/app.ts';

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

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
