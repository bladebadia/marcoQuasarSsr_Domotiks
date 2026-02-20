import ssrHandler from '../dist/ssr/server/server-entry.js';

export default async function handler(req, res) {
  // Adaptar el request para que tenga las propiedades mínimas requeridas por Quasar SSR
  const expressReq = {
    ...req,
    headers: req.headers || {},
    url: req.url || req.originalUrl || '/',
    method: req.method || 'GET',
    connection: req.connection || {},
  };
  await ssrHandler(expressReq, res);
}
