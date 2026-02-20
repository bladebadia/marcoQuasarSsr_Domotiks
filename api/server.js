import ssrHandler from '../dist/ssr/server/server-entry.js';

export default async function handler(req, res) {
  // Si headers no existe pero sí socket.headers, usa esa referencia
  if (!req.headers && req.socket && req.socket.headers) {
    req.headers = req.socket.headers;
  }
  // Fallback: construir headers desde rawHeaders si es necesario
  if (!req.headers && req.rawHeaders) {
    req.headers = {};
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      req.headers[req.rawHeaders[i].toLowerCase()] = req.rawHeaders[i + 1];
    }
  }
  await ssrHandler(req, res);
}
