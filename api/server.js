import ssrHandler from '../dist/ssr/server/server-entry.js';

function buildHeaders(rawHeaders) {
  const headers = {};
  for (let i = 0; i < rawHeaders.length; i += 2) {
    headers[rawHeaders[i].toLowerCase()] = rawHeaders[i + 1];
  }
  return headers;
}

function deepLog(obj, path = 'req', depth = 2) {
  if (depth < 0) return;
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (key === 'headers') {
        console.log(`${path}.${key}:`, obj[key]);
      }
      if (typeof obj[key] === 'object') {
        deepLog(obj[key], `${path}.${key}`, depth - 1);
      }
    }
  }
}

export default async function handler(req, res) {
  if (!req.headers && req.rawHeaders) {
    req.headers = buildHeaders(req.rawHeaders);
  }
  if (req.request && !req.request.headers && req.rawHeaders) {
    req.request.headers = buildHeaders(req.rawHeaders);
  }
  if (req.connection && !req.connection.headers && req.rawHeaders) {
    req.connection.headers = buildHeaders(req.rawHeaders);
  }
  // Loguear en profundidad
  deepLog(req);
  await ssrHandler(req, res);
}
