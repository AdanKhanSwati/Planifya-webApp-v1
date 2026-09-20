import { createReadStream, statSync } from 'node:fs';
import { createServer, request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { extname, join, normalize } from 'node:path';

const root = new URL('../dist/client/', import.meta.url).pathname;
const port = Number(process.env.PLANIFYA_PREVIEW_PORT || 4173);
const firebaseKey = 'AIzaSyBYm61RGgVLjE4e5Ebo2DjQazOwaC53-TU';
const types = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function proxy(req, res, target) {
  const url = new URL(target);
  const headers = { ...req.headers, host: url.host, 'x-planifya-client': 'web-preview' };
  delete headers.origin;
  delete headers.referer;
  delete headers.cookie;
  const upstream = (url.protocol === 'https:' ? httpsRequest : httpRequest)(url, {
    method: req.method, headers,
  }, (response) => {
    const responseHeaders = { ...response.headers };
    delete responseHeaders['set-cookie'];
    res.writeHead(response.statusCode || 502, responseHeaders);
    response.pipe(res);
  });
  upstream.on('error', (error) => {
    res.writeHead(502, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ message: error.message }));
  });
  req.pipe(upstream);
}

createServer((req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (requestUrl.pathname.startsWith('/api/') || requestUrl.pathname.startsWith('/socket.io/')) {
    return proxy(req, res, `https://api.planifya.pk${requestUrl.pathname}${requestUrl.search}`);
  }
  if (requestUrl.pathname === '/__firebase/token') {
    return proxy(req, res, `https://securetoken.googleapis.com/v1/token?key=${firebaseKey}`);
  }
  if (requestUrl.pathname.startsWith('/__firebase/')) {
    const action = requestUrl.pathname.slice('/__firebase/'.length);
    return proxy(req, res, `https://identitytoolkit.googleapis.com/v1/${action}?key=${firebaseKey}`);
  }

  const relative = requestUrl.pathname === '/' ? 'index.html' : requestUrl.pathname.replace(/^\/+/, '');
  const safe = normalize(relative).replace(/^(\.\.(\/|\\|$))+/, '');
  let file = join(root, safe);
  try {
    if (statSync(file).isDirectory()) file = join(file, 'index.html');
    const details = statSync(file);
    res.writeHead(200, {
      'content-type': types[extname(file)] || 'application/octet-stream',
      'content-length': details.size,
      'cache-control': 'no-store',
    });
    createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`Planifya preview listening on http://127.0.0.1:${port}`);
});
