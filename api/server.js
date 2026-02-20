import render from '../dist/ssr/server/server-entry.js';

export default async function handler(req, res) {
  const ssrContext = {
    req,
    res,
    url: req.url
  };

  try {
    const app = await render(ssrContext);
    
    const { renderToString } = await import('vue/server-renderer');
    const html = await renderToString(app);
    
    res.setHeader('Content-Type', 'text/html');
    res.end(html);
  } catch (error) {
    if (error.url) {
      res.writeHead(error.code || 302, { Location: error.url });
      res.end();
    } else {
      console.error(error);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }
}