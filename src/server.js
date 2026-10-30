import { pathToFileURL } from 'node:url';
import { createServer } from './app.js';

const DEFAULT_PORT = 3000;

// Only plain decimal digits without a leading zero; rejects '1e3', '0x50', ' 80', '+80', '080', etc.
const PORT_PATTERN = /^[1-9][0-9]{0,4}$/;

export function resolvePort(value) {
  if (typeof value !== 'string' || !PORT_PATTERN.test(value)) return DEFAULT_PORT;
  const port = Number(value);
  return port <= 65535 ? port : DEFAULT_PORT;
}

// import.meta.main only exists from Node 24.2; compare URLs so every Node 24 release works.
const isEntryPoint =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntryPoint) {
  const port = resolvePort(process.env.PORT);
  const server = createServer();
  server.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}
