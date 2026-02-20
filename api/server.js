import ssrModule from '../dist/ssr/server/server-entry.js';

export default async function handler(req, res) {
  const ssrHandler = ssrModule.handler || ssrModule.default?.handler || ssrModule;
  await ssrHandler(req, res);
}
