import express from 'express';
import ssrHandler from '../dist/ssr/server/server-entry.js';

const app = express();

app.all(/.*/, async (req, res) => {
  // Asegurar que req.headers exista
  req.headers = req.headers || {};
  await ssrHandler(req, res);
});

export default app;
