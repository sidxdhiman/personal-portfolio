// Zero-dependency local dev server.
// Serves the static site AND runs the Netlify contact function at /api/contact,
// so the contact form (which posts to Telegram) works locally without the Netlify CLI.
// Usage: node server.js   (reads .env from the project root, then http://localhost:3000)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { handler } = require('./netlify/functions/contact');

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;
const MAX_BODY = 1024 * 16;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.eot': 'application/vnd.ms-fontobject',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json'
};

function loadEnv(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
    return true;
  } catch (e) {
    return false;
  }
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
}

function serveStatic(req, res, urlPath) {
  let filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end();
  }
  if (urlPath === '/' || urlPath === '') {
    filePath = path.join(ROOT, 'index.html');
  }
  fs.stat(filePath, function (err, stats) {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      return res.end('Not found');
    }
    const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    const stream = fs.createReadStream(filePath);
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': stats.size });
    stream.pipe(res);
  });
}

loadEnv(path.join(ROOT, '.env'));

const server = http.createServer(async function (req, res) {
  const url = new URL(req.url, 'http://localhost');
  const urlPath = decodeURIComponent(url.pathname);

  if (urlPath === '/api/contact') {
    if (req.method !== 'POST') {
      return sendJson(res, 405, { ok: false });
    }
    const chunks = [];
    let size = 0;
    req.on('data', function (chunk) {
      size += chunk.length;
      if (size > MAX_BODY) {
        res.writeHead(413);
        res.end();
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', async function () {
      const body = Buffer.concat(chunks).toString('utf8');
      try {
        const result = await handler({ httpMethod: 'POST', body: body });
        sendJson(res, result.statusCode, JSON.parse(result.body));
      } catch (e) {
        console.error('contact handler failed:', e.message);
        sendJson(res, 500, { ok: false });
      }
    });
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    return res.end();
  }
  serveStatic(req, res, urlPath);
});

server.listen(PORT, function () {
  console.log('Serving portfolio at http://localhost:' + PORT);
  console.log('Contact form posts to /api/contact (Telegram). Press Ctrl+C to stop.');
});