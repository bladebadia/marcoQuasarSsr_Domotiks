import express from 'express';
import ssrHandler from '../dist/ssr/server/server-entry.js';

const app = express();

app.all(/.*/, async (req, res) => {
  // Adaptar req para asegurar que tenga headers (compatibilidad Vercel/Quasar SSR)
  if (!req.headers && req.getHeaders) {
    req.headers = req.getHeaders();
  } else if (!req.headers) {
    req.headers = {};
  }
  await ssrHandler(req, res);
});

export default app;
