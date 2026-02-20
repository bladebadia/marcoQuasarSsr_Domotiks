import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de tipos MIME
const MIME_TYPES = {
  js: 'application/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  eot: 'application/vnd.ms-fontobject',
  map: 'application/json',
};

const DIST_SSR_PATH = join(__dirname, '../dist/ssr');
const RENDER_TEMPLATE_PATH = join(DIST_SSR_PATH, 'render-template.js');
const SERVER_ENTRY_PATH = join(DIST_SSR_PATH, 'server/server-entry.js');

function isStaticFile(url) {
  return (
    url.startsWith('/client/') ||
    /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map)$/.test(url)
  );
}

function getStaticFilePath(url) {
  return url.startsWith('/client/') ? join(DIST_SSR_PATH, url) : join(DIST_SSR_PATH, 'client', url);
}

function serveStaticFile(req, res) {
  const staticPath = getStaticFilePath(req.url);
  if (!existsSync(staticPath)) return false;
  const content = readFileSync(staticPath);
  const ext = req.url.split('.').pop()?.toLowerCase();
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  if (typeof res.send === 'function') {
    res.send(content);
  } else if (typeof res.end === 'function') {
    res.end(content);
  }
  return true;
}

function createSSRContext(req, res, onRenderedCallbacks) {
  return {
    url: req.url,
    req,
    res,
    _meta: {
      runtimePageContent: '',
      endingHeadTags: '',
      headTags: '',
      bodyTags: '',
      htmlAttrs: '',
      headAttrs: '',
      bodyAttrs: '',
    },
    modules: new Set(),
    onRendered: (fn) => {
      if (typeof fn === 'function') onRenderedCallbacks.push(fn);
    },
    rendered: () => {},
    $q: {},
    ssrContext: true,
  };
}

function processSSRContext(ssrContext) {
  if (ssrContext.modules && typeof ssrContext.modules.values === 'function') {
    ssrContext.modules = Array.from(ssrContext.modules);
  }
  if (Array.isArray(ssrContext.onRendered)) {
    ssrContext.onRendered.forEach((callback) => {
      if (typeof callback === 'function') {
        try {
          callback();
        } catch (error) {
          console.warn('Error ejecutando callback onRendered:', error.message);
        }
      }
    });
  }
}

async function trySSRRendering(req, res) {
  if (!existsSync(RENDER_TEMPLATE_PATH) || !existsSync(SERVER_ENTRY_PATH)) {
    console.log('SSR modules not found');
    return false;
  }
  try {
    console.log('Attempting SSR rendering...');
    const [renderTemplate, serverEntry, { renderToString }] = await Promise.all([
      import('../dist/ssr/render-template.js'),
      import('../dist/ssr/server/server-entry.js'),
      import('vue/server-renderer'),
    ]);
    const onRenderedCallbacks = [];
    const ssrContext = createSSRContext(req, res, onRenderedCallbacks);
    const app = await serverEntry.default(ssrContext);
    const html = await renderToString(app, ssrContext);
    onRenderedCallbacks.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.warn('Error en onRendered callback:', e);
      }
    });
    ssrContext._meta.runtimePageContent = html;
    processSSRContext(ssrContext);
    const finalHtml = renderTemplate.default(ssrContext);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    if (typeof res.send === 'function') {
      res.send(finalHtml);
    } else if (typeof res.end === 'function') {
      res.end(finalHtml);
    }
    console.log('SSR rendering successful');
    return true;
  } catch (error) {
    console.error('SSR rendering failed:', error.message);
    return false;
  }
}

function generateFallbackHTML(req) {
  const timestamp = new Date().toLocaleString('es-ES');
  return `<!DOCTYPE html>\n<html lang="es">\n  <head>\n    <title>SpanishNook - Plataforma de Español</title>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <meta name="description" content="Aprende español de forma personalizada con SpanishNook">\n    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>">\n    <link rel="stylesheet" href="/client/assets/index-BoXRLnYr.css">\n    <style>body{background:#667eea;color:white;}</style>\n  </head>\n  <body>\n    <div id="app"></div>\n    <div class="container" id="fallback">\n      <div class="logo">📚</div>\n      <h1>SpanishNook</h1>\n      <p class="subtitle">Cargando aplicación...</p>\n      <div class="loading">\n        <strong>Ruta:</strong> ${req.url}<br>\n        <strong>Tiempo:</strong> ${timestamp}\n      </div>\n    </div>\n  </body>\n</html>`;
}

export default async function handler(_req, _res) {
  // Adaptar req/res para compatibilidad Vercel/Node/Express
  const req = _req || { url: '/', headers: {} };
  const res = _res;
  // Adaptar headers si es necesario
  if (req.headers && typeof req.headers.get === 'function') {
    const plainHeaders = {};
    for (const [key, value] of req.headers.entries()) {
      plainHeaders[key.toLowerCase()] = value;
    }
    req.headers = plainHeaders;
  } else {
    req.headers = req.headers || {};
  }
  try {
    if (isStaticFile(req.url)) {
      if (serveStaticFile(req, res)) return;
    }
    if (await trySSRRendering(req, res)) return;
    const fallbackHTML = generateFallbackHTML(req);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    if (typeof res.send === 'function') {
      res.send(fallbackHTML);
    } else if (typeof res.end === 'function') {
      res.end(fallbackHTML);
    }
  } catch (error) {
    res.status?.(500);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const errorHtml = `<html><body><h1>Error del Servidor</h1><pre>${error.message}</pre></body></html>`;
    if (typeof res.send === 'function') {
      res.send(errorHtml);
    } else if (typeof res.end === 'function') {
      res.end(errorHtml);
    }
  }
}
