import ssrHandler from '../dist/ssr/server/server-entry.js';

function buildHeaders(rawHeaders) {
  const headers = {};
  for (let i = 0; i < rawHeaders.length; i += 2) {
    headers[rawHeaders[i].toLowerCase()] = rawHeaders[i + 1];
  }
  return headers;
}

export default async function handler(req, res) {
  // Asegura headers en req
  if (!req.headers && req.rawHeaders) {
    req.headers = buildHeaders(req.rawHeaders);
  }
  // Asegura headers en req.request
  if (req.request && !req.request.headers && req.rawHeaders) {
    req.request.headers = buildHeaders(req.rawHeaders);
  }
  // Asegura headers en req.connection
  if (req.connection && !req.connection.headers && req.rawHeaders) {
    req.connection.headers = buildHeaders(req.rawHeaders);
  }
  await ssrHandler(req, res);
}
