import ssrHandler from '../dist/ssr/server/server-entry.js';

export default async function handler(req, res) {
  console.log('REQ KEYS:', Object.keys(req));
  console.log('REQ HEADERS:', req.headers);
  try {
    console.log('REQ:', JSON.stringify(req, null, 2));
  } catch (e) {
    console.log('REQ (no JSON):', req);
  }
  if (!req.headers) {
    req.headers = {};
  }
  await ssrHandler(req, res);
}
