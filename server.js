import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const contentTypes = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript' };

createServer((request, response) => {
  const path = resolve(root, `.${request.url === '/' ? '/index.html' : request.url}`);
  if (!path.startsWith(root)) return response.writeHead(403).end();
  try {
    if (!statSync(path).isFile()) throw new Error('Not a file');
    response.writeHead(200, { 'Content-Type': `${contentTypes[extname(path)] || 'application/octet-stream'}; charset=utf-8` });
    createReadStream(path).pipe(response);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(4173, () => console.log('A/B Test Planner is running at http://localhost:4173'));
