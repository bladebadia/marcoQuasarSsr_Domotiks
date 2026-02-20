const { ssrProductionExport } = require('../dist/ssr/server/entry');

module.exports = async (req, res) => {
  const { handler } = ssrProductionExport;
  await handler(req, res);
};
