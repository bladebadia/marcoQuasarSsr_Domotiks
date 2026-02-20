import ssrHandler from '../dist/ssr/server/server-entry.js';

function buildHeaders(rawHeaders) {
  const headers = {};
  for (let i = 0; i < rawHeaders.length; i += 2) {
    headers[rawHeaders[i].toLowerCase()] = rawHeaders[i + 1];
  }
  return headers;
}

export default async function handler(req, res) {
  if (!req.headers && req.rawHeaders) {
    req.headers = buildHeaders(req.rawHeaders);
  }
  await ssrHandler(req, res);
}
