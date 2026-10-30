import http from 'node:http';
import { renderPanel } from './panel.js';

const HEALTH_ALLOWED_METHODS = 'GET, HEAD';
const PANEL_ALLOWED_METHODS = 'GET, HEAD';

const HTML_SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
};

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

function sendHtml(res, statusCode, body, extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...HTML_SECURITY_HEADERS,
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

  if (pathname === '/panel') {
    if (req.method === 'GET' || req.method === 'HEAD') {
      return sendHtml(res, 200, renderPanel());
    }
    return sendJson(res, 405, { error: 'Method Not Allowed' }, { Allow: PANEL_ALLOWED_METHODS });
  }

  return sendJson(res, 404, { error: 'Not Found' });
}

export function createServer() {
  return http.createServer(handleRequest);
}
