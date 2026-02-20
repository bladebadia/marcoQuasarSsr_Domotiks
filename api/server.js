import ssrHandler from '../dist/ssr/server/server-entry.js';

export default async function handler(req, res) {
  // Adaptar req para asegurar que tiene headers (compatibilidad Vercel/Express)
  if (!req.headers && req.getHeader) {
    req.headers = {};
    for (const key of req.rawHeaders || []) {
      req.headers[key.toLowerCase()] = req.getHeader(key);
    }
  }
  await ssrHandler(req, res);
}
