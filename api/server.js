import ssrHandler from '../dist/ssr/server/server-entry.js';

export default async function handler(req, res) {
  if (!req.headers) {
    req.headers = {};
  }
  await ssrHandler(req, res);
}
