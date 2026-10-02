/**
 * LA CAVA NOIRE // Servidor de Desarrollo Local
 * Servidor HTTP nativo ultraligero sin dependencias externas (Zero-Dependencies).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8082;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
};

function startServer(port) {
  const server = http.createServer((req, res) => {
    // Manejo de métodos
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('Method Not Allowed');
      return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // Default route
    if (pathname === '/' || pathname === '') {
      pathname = '/index.html';
    }

    // Seguridad: Prevenir path traversal
    const safePath = path.normalize(path.join(BASE_DIR, pathname));
    if (!safePath.startsWith(BASE_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('403 Forbidden');
      return;
    }

    fs.stat(safePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Fallback a index.html para SPA o 404
        const fallbackPath = path.join(BASE_DIR, 'index.html');
        fs.readFile(fallbackPath, (fallbackErr, data) => {
          if (fallbackErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
            res.end('404 Not Found');
            return;
          }
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=UTF-8',
            'Cache-Control': 'no-cache'
          });
          res.end(data);
        });
        return;
      }

      const ext = path.extname(safePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
      });

      const stream = fs.createReadStream(safePath);
      stream.pipe(res);
      stream.on('error', () => {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('500 Internal Server Error');
      });
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[LA CAVA NOIRE] Puerto ${port} ocupado, probando con ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('[LA CAVA NOIRE] Error en el servidor:', err);
    }
  });

  server.listen(port, () => {
    console.log('\n============================================================');
    console.log('  [LA CAVA NOIRE] Quesería Gourmet & Afinación');
    console.log('============================================================');
    console.log(`  Servidor local activo en:`);
    console.log(`     > Local:    http://localhost:${port}`);
    console.log(`     > Network:  http://127.0.0.1:${port}`);
    console.log('============================================================\n');
  });
}

startServer(DEFAULT_PORT);
