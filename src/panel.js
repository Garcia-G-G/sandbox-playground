// Status panel: a self-contained HTML document with inline styles.
// Colors, labels and icons follow docs/panel-palette.md.

export const SAMPLE_ITEMS = Object.freeze([
  Object.freeze({ title: 'Migración de la base de datos', state: 'progress' }),
  Object.freeze({ title: 'Revisión del contrato de API', state: 'approved' }),
  Object.freeze({ title: 'Despliegue en staging', state: 'error' }),
  Object.freeze({ title: 'Pruebas de carga', state: 'progress' }),
  Object.freeze({ title: 'Documentación de /health', state: 'approved' }),
]);

const STATES = Object.freeze({
  progress: Object.freeze({ label: 'En curso', icon: '◐' }),
  approved: Object.freeze({ label: 'Aprobado', icon: '✓' }),
  error: Object.freeze({ label: 'Error', icon: '✕' }),
});

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

const STYLE = `
:root {
  color-scheme: light dark;
  --bg: #FFFFFF;
  --surface: #F3F5FA;
  --text: #0B1020;
  --text-muted: #444E68;
  --border: #7B849B;
  --accent: #0046D5;
  --state-progress-bg: #FFC21A;
  --state-progress-fg: #1A1200;
  --state-progress-border: #8A5F00;
  --state-approved-bg: #D3F4DD;
  --state-approved-fg: #05431A;
  --state-approved-border: #1B7A38;
  --state-error-bg: #FFDFE2;
  --state-error-fg: #730010;
  --state-error-border: #C20E2D;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0B1020;
    --surface: #161D35;
    --text: #F2F5FF;
    --text-muted: #B3BBD2;
    --border: #7480A0;
    --accent: #8CB0FF;
    --state-progress-bg: #3D2C00;
    --state-progress-fg: #FFD45C;
    --state-progress-border: #FFC21A;
    --state-approved-bg: #073A1B;
    --state-approved-fg: #93F2B2;
    --state-approved-border: #34C468;
    --state-error-bg: #4D0A16;
    --state-error-fg: #FFB8C0;
    --state-error-border: #FF6277;
  }
}
*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  line-height: 1.5;
}
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.panel-header {
  border-block-end: 4px solid var(--accent);
  padding: 1rem clamp(1rem, 4vw, 2rem);
}
.panel-header h1 { margin: 0; font-size: clamp(1.375rem, 1rem + 2vw, 2rem); color: var(--accent); }
.panel-header p { margin: 0.25rem 0 0; color: var(--text-muted); }
main { padding: 1.5rem clamp(1rem, 4vw, 2rem); max-inline-size: 60rem; }
.items { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.75rem; }
.item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  padding: 0.75rem 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
}
.item-title { overflow-wrap: anywhere; min-inline-size: 0; }
.empty { color: var(--text-muted); }
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-weight: 700;
  white-space: nowrap;
}
.state-progress { background: var(--state-progress-bg); color: var(--state-progress-fg); border: 2px solid var(--state-progress-border); }
.state-approved { background: var(--state-approved-bg); color: var(--state-approved-fg); border: 2px solid var(--state-approved-border); }
.state-error { background: var(--state-error-bg); color: var(--state-error-fg); border: 2px solid var(--state-error-border); }
@media (forced-colors: active) {
  .badge { border-color: CanvasText; }
}
`;

function renderItem({ title, state }) {
  const meta = STATES[state];
  if (!meta) throw new TypeError(`Unknown state: ${state}`);
  return `<li class="item">
        <span class="item-title">${escapeHtml(title)}</span>
        <span class="badge state-${state}"><span aria-hidden="true">${meta.icon}</span> ${meta.label}</span>
      </li>`;
}

export function renderPanel(items = SAMPLE_ITEMS) {
  const list = items.length
    ? `<ul class="items">
      ${items.map(renderItem).join('\n      ')}
    </ul>`
    : '<p class="empty">No hay elementos que mostrar.</p>';

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Panel de estado</title>
  <style>${STYLE}</style>
</head>
<body>
  <header class="panel-header">
    <h1>Panel de estado</h1>
    <p>Estado actual de las tareas</p>
  </header>
  <main>
    ${list}
  </main>
</body>
</html>
`;
}
