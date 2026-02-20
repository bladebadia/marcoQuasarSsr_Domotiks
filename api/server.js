import express from 'express';
import ssrHandler from '../dist/ssr/server/server-entry.js';

const app = express();

app.all(/.*/, async (req, res) => {
  await ssrHandler(req, res);
});

export default app;
