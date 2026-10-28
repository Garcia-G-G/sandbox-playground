import http from 'node:http';

const HEALTH_ALLOWED_METHODS = 'GET, HEAD';

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

function handleRequest(req, res) {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost');

  if (pathname === '/health') {
    if (req.method === 'GET' || req.method === 'HEAD') {
      return sendJson(res, 200, { status: 'ok' });
    }
    return sendJson(res, 405, { error: 'Method Not Allowed' }, { Allow: HEALTH_ALLOWED_METHODS });
  }

  return sendJson(res, 404, { error: 'Not Found' });
}

export function createServer() {
  return http.createServer(handleRequest);
}
