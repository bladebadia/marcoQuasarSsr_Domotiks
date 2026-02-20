import { ssrProductionExport } from '../dist/ssr/server/index.js';

export default async function handler(req, res) {
  const { handler: ssrHandler } = ssrProductionExport;
  await ssrHandler(req, res);
}
