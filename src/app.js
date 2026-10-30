import http from 'node:http';

const READ_ONLY_METHODS = 'GET, HEAD';

// Self-contained status page: inline CSS/JS only, light theme, and visible
// fallback text so it is readable even if the script never runs.
const PANEL_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>Service status</title>
<style>
  html, body { margin: 0; background: #fff; color: #111; }
  body { font: 16px/1.5 system-ui, sans-serif; padding: 2rem; }
  #status { font-weight: bold; }
  .ok { color: #0a6b2d; }
  .error { color: #a40e0e; }
</style>
</head>
<body>
<h1>Service status</h1>
<p>Health: <span id="status">Checking status…</span></p>
<noscript><p>JavaScript is disabled, so the status cannot be checked from this page. Open /health directly.</p></noscript>
<script>
(function () {
  var el = document.getElementById('status');
  function show(text, cls) { el.textContent = text; el.className = cls; }
  fetch('/health', { cache: 'no-store' })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      if (data && data.status === 'ok') show('ok', 'ok');
      else show('Error: unexpected response', 'error');
    })
    .catch(function (err) { show('Error: ' + err.message, 'error'); });
})();
</script>
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
    return sendJson(res, 405, { error: 'Method Not Allowed' }, { Allow: READ_ONLY_METHODS });
  }

  if (pathname === '/panel') {
    if (req.method === 'GET' || req.method === 'HEAD') {
      return sendHtml(res, 200, PANEL_HTML);
    }
    return sendJson(res, 405, { error: 'Method Not Allowed' }, { Allow: READ_ONLY_METHODS });
  }

  return sendJson(res, 404, { error: 'Not Found' });
}

export function createServer() {
  return http.createServer(handleRequest);
}
