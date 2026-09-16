import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(HERE, '..');
const LANDING_DIR = resolve(REPO_ROOT, 'landing');
const APP_DIST_DIR = resolve(REPO_ROOT, 'packages/app/dist');
const ZK_CONFIG_DIR = resolve(APP_DIST_DIR, 'zk-config');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function contentTypeFor(filePath) {
  return MIME_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}

async function tryServeFile(response, rootDir, relativePath) {
  const safeRelativePath = normalize(relativePath).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(rootDir, safeRelativePath);
  if (!filePath.startsWith(rootDir)) {
    return false;
  }
  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      return false;
    }
    const body = await readFile(filePath);
    response.writeHead(200, {
      'content-type': contentTypeFor(filePath),
      'content-length': body.length,
    });
    response.end(body);
    return true;
  } catch {
    return false;
  }
}

async function serveSpaFallback(response, rootDir) {
  const served = await tryServeFile(response, rootDir, 'index.html');
  if (!served) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}

const server = createServer((request, response) => {
  void handleRequest(request, response);
});

async function handleRequest(request, response) {
  const requestUrl = new URL(request.url ?? '/', 'http://internal');
  const pathname = decodeURIComponent(requestUrl.pathname);

  if (pathname === '/zk-config' || pathname.startsWith('/zk-config/')) {
    const relativePath = pathname.slice('/zk-config/'.length);
    const served = await tryServeFile(response, ZK_CONFIG_DIR, relativePath);
    if (!served) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Not found');
    }
    return;
  }

  if (pathname === '/app' || pathname.startsWith('/app/')) {
    const relativePath = pathname === '/app' ? '' : pathname.slice('/app/'.length);
    if (relativePath.length === 0) {
      await serveSpaFallback(response, APP_DIST_DIR);
      return;
    }
    const served = await tryServeFile(response, APP_DIST_DIR, relativePath);
    if (!served) {
      await serveSpaFallback(response, APP_DIST_DIR);
    }
    return;
  }

  const landingRelativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
  const served = await tryServeFile(response, LANDING_DIR, landingRelativePath);
  if (!served) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}

const port = Number.parseInt(process.env['PORT'] ?? '4173', 10);
server.listen(port, '0.0.0.0', () => {
  process.stdout.write(`serve: listening on 0.0.0.0:${port} (landing at /, app at /app/*, zk-config at /zk-config/*)\n`);
});
