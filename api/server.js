import ssrHandler from '../dist/ssr/server/server-entry.js';

function ensureHeaders(req) {
  // Construir headers desde socket.headers, rawHeaders o dejar vacío
  let headers = req.headers;
  if (!headers && req.socket && req.socket.headers) {
    headers = req.socket.headers;
  }
  if (!headers && req.rawHeaders) {
    headers = {};
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      headers[req.rawHeaders[i].toLowerCase()] = req.rawHeaders[i + 1];
    }
  }
  if (!headers) headers = {};

  // Asignar headers en todos los subniveles posibles
  req.headers = headers;
  if (req.request) req.request.headers = headers;
  if (req.connection) req.connection.headers = headers;
  if (req.socket) req.socket.headers = headers;
}

export default async function handler(req, res) {
  ensureHeaders(req);
  await ssrHandler(req, res);
}
