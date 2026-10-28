import { pathToFileURL } from 'node:url';
import { createServer } from './app.js';

const DEFAULT_PORT = 3000;

export function resolvePort(value) {
  const port = Number(value);
  return Number.isInteger(port) && port >= 1 && port <= 65535 ? port : DEFAULT_PORT;
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
