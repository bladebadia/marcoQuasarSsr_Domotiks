import ssrHandler from '../dist/ssr/server/server-entry.js';

export default async function handler(req, res) {
  await ssrHandler(req, res);
}
