import express from 'express';
import ssrHandler from '../dist/ssr/server/server-entry.js';

const app = express();

app.all(/.*/, async (_req, _res) => {
  // Protección extra para req/res undefined y headers
  const req = _req || { headers: {} };
  const res = _res;
  if (!req.headers) req.headers = {};
  if (typeof req.headers.get === 'function') {
    // Es un objeto Headers, convertir a objeto plano
    const plainHeaders = {};
    for (const [key, value] of req.headers.entries()) {
      plainHeaders[key.toLowerCase()] = value;
    }
    req.headers = plainHeaders;
  }
  await ssrHandler(req, res);
});

export default app;
