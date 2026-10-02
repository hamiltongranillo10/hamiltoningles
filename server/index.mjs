import { createServer } from 'node:http';
import { handleDriveAudioRequest } from './drive-audio.mjs';
import { handleConversationRequest } from './conversation.mjs';

const port = Number(process.env.PORT ?? 8080);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error('PORT must be an integer from 1024 through 65535.');
}

const server = createServer((req, res) => {
  const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
  if (pathname === '/health' && req.method === 'GET') {
    const body = JSON.stringify({ ok: true });
    res.writeHead(200, {
      'content-type': 'application/json; charset=utf-8',
      'content-length': Buffer.byteLength(body),
      'cache-control': 'no-store',
    });
    res.end(body);
    return;
  }
  if (pathname === '/api/drive/audio') {
    void handleDriveAudioRequest(req, res);
    return;
  }
  if (pathname === '/api/conversation') {
    void handleConversationRequest(req, res);
    return;
  }
  if (pathname.startsWith('/api/')) {
    const body = JSON.stringify({ error: 'Ruta API no encontrada.' });
    res.writeHead(404, {
      'content-type': 'application/json; charset=utf-8',
      'content-length': Buffer.byteLength(body),
      'cache-control': 'no-store',
    });
    res.end(body);
    return;
  }
  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' });
  res.end('Not found');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Audio API listening on 0.0.0.0:${port}`);
});
