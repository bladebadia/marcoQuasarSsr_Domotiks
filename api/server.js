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

// Rutas base
const DIST_SSR_PATH = join(__dirname, '../dist/ssr');
const RENDER_TEMPLATE_PATH = join(DIST_SSR_PATH, 'render-template.js');
const SERVER_ENTRY_PATH = join(DIST_SSR_PATH, 'server/server-entry.js');

/**
 * Determina si la URL es un archivo estático
 */
function isStaticFile(url) {
  return (
    url.startsWith('/client/') ||
    /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map)$/.test(url)
  );
}

/**
 * Obtiene la ruta del archivo estático
 */
function getStaticFilePath(url) {
  return url.startsWith('/client/') ? join(DIST_SSR_PATH, url) : join(DIST_SSR_PATH, 'client', url);
}

/**
 * Sirve archivos estáticos
 */
function serveStaticFile(req, res) {
  const staticPath = getStaticFilePath(req.url);

  if (!existsSync(staticPath)) {
    return false;
  }

  const content = readFileSync(staticPath);
  const ext = req.url.split('.').pop()?.toLowerCase();
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(content);

  return true;
}

/**
 * Crea el contexto SSR
 */
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

/**
 * Procesa el contexto SSR después del renderizado
 */
function processSSRContext(ssrContext) {
  // Convertir modules Set a array si es necesario
  if (ssrContext.modules && typeof ssrContext.modules.values === 'function') {
    ssrContext.modules = Array.from(ssrContext.modules);
  }

  // Ejecutar callbacks onRendered
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

/**
 * Intenta renderizar usando SSR de Quasar
 */
async function trySSRRendering(req, res) {
  if (!existsSync(RENDER_TEMPLATE_PATH) || !existsSync(SERVER_ENTRY_PATH)) {
    console.log('SSR modules not found');
    return false;
  }

  try {
    console.log('Attempting SSR rendering...');

    // Importar módulos dinámicamente
    const [renderTemplate, serverEntry, { renderToString }] = await Promise.all([
      import('../dist/ssr/render-template.js'),
      import('../dist/ssr/server/server-entry.js'),
      import('vue/server-renderer'),
    ]);

    // Crear contexto y renderizar
    const onRenderedCallbacks = [];
    const ssrContext = createSSRContext(req, res, onRenderedCallbacks);
    const app = await serverEntry.default(ssrContext);
    const html = await renderToString(app, ssrContext);

    // Ejecutar callbacks onRendered
    onRenderedCallbacks.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.warn('Error en onRendered callback:', e);
      }
    });

    // Configurar contenido y procesar contexto
    ssrContext._meta.runtimePageContent = html;
    processSSRContext(ssrContext);

    // Generar HTML final
    const finalHtml = renderTemplate.default(ssrContext);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(finalHtml);

    console.log('SSR rendering successful');
    return true;
  } catch (error) {
    console.error('SSR rendering failed:', error.message);
    return false;
  }
}

/**
 * Genera HTML fallback
 */
function generateFallbackHTML(req) {
  const timestamp = new Date().toLocaleString('es-ES');

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <title>SpanishNook - Plataforma de Español</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Aprende español de forma personalizada con SpanishNook">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>">
    <link rel="stylesheet" href="/client/assets/index-BoXRLnYr.css">
    
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white; min-height: 100vh; display: flex;
        align-items: center; justify-content: center; padding: 20px;
      }
      .container {
        max-width: 600px; background: rgba(255,255,255,0.15);
        backdrop-filter: blur(15px); border-radius: 20px; padding: 40px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3); text-align: center;
        border: 1px solid rgba(255,255,255,0.2);
      }
      .logo { font-size: 4rem; margin-bottom: 1rem; }
      h1 { font-size: 2.2rem; margin-bottom: 0.5rem; font-weight: 600; }
      .subtitle { font-size: 1.1rem; opacity: 0.9; margin-bottom: 2rem; }
      .btn {
        background: rgba(255,255,255,0.2); color: white;
        border: 1px solid rgba(255,255,255,0.3); padding: 12px 24px;
        border-radius: 10px; cursor: pointer; font-size: 16px; margin: 10px;
        transition: all 0.3s ease; text-decoration: none; display: inline-block;
      }
      .btn:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }
      #app { display: none; }
      .loading { opacity: 0.7; font-size: 0.9rem; margin-top: 1rem; }
    </style>
  </head>
  <body>
    <div id="app"></div>
    
    <div class="container" id="fallback">
      <div class="logo">📚</div>
      <h1>SpanishNook</h1>
      <p class="subtitle">Cargando aplicación...</p>
      
      <div class="loading">
        <strong>Ruta:</strong> ${req.url}<br>
        <strong>Tiempo:</strong> ${timestamp}
      </div>
      
      <div style="margin-top: 2rem;">
        <button class="btn" onclick="location.reload()">🔄 Recargar</button>
        <a href="/TestNivel" class="btn">🧪 Test de Nivel</a>
        <a href="/ClasesIndividuales" class="btn">👨‍🏫 Clases</a>
      </div>
    </div>
    
    <script type="module" src="/client/assets/index-D4RwMDBV.js"></script>
    
    <script>
      let appMounted = false;
      
      function checkAppMount() {
        const app = document.getElementById('app');
        const fallback = document.getElementById('fallback');
        
        if (app && app.innerHTML.trim() && !appMounted) {
          fallback.style.display = 'none';
          app.style.display = 'block';
          appMounted = true;
          console.log('Vue app mounted successfully');
        }
      }
      
      // Verificar montaje cada segundo durante 10 segundos
      let checks = 0;
      const interval = setInterval(() => {
        checkAppMount();
        checks++;
        
        if (appMounted || checks > 10) {
          clearInterval(interval);
          if (!appMounted) {
            console.log('Vue app failed to mount, keeping fallback');
          }
        }
      }, 1000);
      
      // Verificación inicial
      document.addEventListener('DOMContentLoaded', checkAppMount);
    </script>
  </body>
</html>`;
}

/**
 * Función principal de la API
 */
export default async function handler(req, res) {
  const startTime = Date.now();
  console.log('__dirname:', __dirname);
  console.log('DIST_SSR_PATH:', DIST_SSR_PATH);
  console.log('RENDER_TEMPLATE exists:', existsSync(RENDER_TEMPLATE_PATH));
  console.log('SERVER_ENTRY exists:', existsSync(SERVER_ENTRY_PATH));

  try {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

    // 1. Servir archivos estáticos
    if (isStaticFile(req.url)) {
      if (serveStaticFile(req, res)) {
        console.log(`Static file served in ${Date.now() - startTime}ms`);
        return;
      }
    }

    // 2. Intentar SSR
    if (await trySSRRendering(req, res)) {
      console.log(`SSR completed in ${Date.now() - startTime}ms`);
      return;
    }

    // 3. Fallback HTML
    console.log('Using fallback HTML');
    const fallbackHTML = generateFallbackHTML(req);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(fallbackHTML);

    console.log(`Fallback served in ${Date.now() - startTime}ms`);
  } catch (error) {
    console.error('Handler error:', error.message);

    res.status(500).setHeader('Content-Type', 'text/html; charset=utf-8').send(`
<!DOCTYPE html>
<html>
  <head><title>Error - SpanishNook</title></head>
  <body style="font-family: system-ui; padding: 40px; text-align: center; background: #f5f5f5;">
    <h1 style="color: #e74c3c;">⚠️ Error del Servidor</h1>
    <p style="color: #7f8c8d; margin: 20px 0;">Error: ${error.message}</p>
    <button onclick="location.reload()" style="background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">
      Recargar Página
    </button>
  </body>
</html>
    `);
  }
}
