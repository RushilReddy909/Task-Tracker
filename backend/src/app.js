import 'express-async-errors'; // lets thrown errors in async handlers reach errorHandler
import path from 'node:path';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// In production the frontend is built into frontend/dist and served
// directly by this same server (see the root package.json's "build"
// script), so there's no separate frontend host/port to configure. In
// dev, Vite's own dev server serves the frontend and proxies /api here
// instead — this block simply doesn't run then.
const frontendDistPath = path.resolve(import.meta.dirname, '../../frontend/dist');

// CLIENT_ORIGIN may be a comma-separated list for multiple allowed origins.
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

if (process.env.NODE_ENV === 'production') {
  // Serve the built frontend's static assets (JS/CSS/images/favicon).
  app.use(express.static(frontendDistPath));

  // SPA fallback: any non-API GET that didn't match a static file is a
  // client-side route (e.g. /analytics), so hand back index.html and let
  // React Router take over — otherwise a hard refresh on those routes
  // would 404 since the server has no route for them.
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Must be last: 404 handler (API routes only reach here now — the SPA
// fallback above already claims every non-API GET in production), then
// the global error handler.
app.use(notFound);
app.use(errorHandler);

export default app;
