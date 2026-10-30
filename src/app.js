import http from 'node:http';

const HEALTH_ALLOWED_METHODS = 'GET, HEAD';
const SERVICE_NAME = 'health-service';

// Self-contained status page: no external assets, explicit light background
// and dark text so it never renders as a blank/black screen.
const PANEL_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${SERVICE_NAME} status</title>
<style>
html, body { margin: 0; background: #fff; color: #111; font-family: system-ui, sans-serif; }
main { padding: 2rem; }
.status { color: #0a6b2d; font-weight: bold; }
</style>
</head>
<body>
<main>
<h1>${SERVICE_NAME}</h1>
<p>Status: <span class="status">ok</span></p>
</main>
</body>
</html>
`;

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...extraHeaders,
  });
  // Node omits the body automatically for HEAD requests.
  res.end(body);
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(html),
  });
  // Node omits the body automatically for HEAD requests.
  res.end(html);
}

function handleRequest(req, res) {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost');

  if (pathname === '/health') {
    if (req.method === 'GET' || req.method === 'HEAD') {
      return sendJson(res, 200, { status: 'ok' });
    }
    return sendJson(res, 405, { error: 'Method Not Allowed' }, { Allow: HEALTH_ALLOWED_METHODS });
  }

  if (pathname === '/panel') {
    if (req.method === 'GET' || req.method === 'HEAD') {
      return sendHtml(res, 200, PANEL_HTML);
    }
    return sendJson(res, 405, { error: 'Method Not Allowed' }, { Allow: HEALTH_ALLOWED_METHODS });
  }

  return sendJson(res, 404, { error: 'Not Found' });
}

export function createServer() {
  return http.createServer(handleRequest);
}
