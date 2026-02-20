import express from 'express';
import ssrHandler from '../dist/ssr/server/server-entry.js';

const app = express();

app.all(/.*/, async (req, res) => {
  // Adaptar req.headers si es un objeto Headers (Web API)
  if (req.headers && typeof req.headers.get === 'function') {
    // Es un objeto Headers, convertir a objeto plano
    const plainHeaders = {};
    for (const [key, value] of req.headers.entries()) {
      plainHeaders[key.toLowerCase()] = value;
    }
    req.headers = plainHeaders;
  } else {
    req.headers = req.headers || {};
  }
  await ssrHandler(req, res);
});

export default app;
