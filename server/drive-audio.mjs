import { Buffer } from 'node:buffer';

export const MAX_AUDIO_BYTES = 16 * 1024 * 1024;
const MAX_REQUEST_BYTES = 4096;
const MAX_REDIRECTS = 5;
const FETCH_TIMEOUT_MS = 20_000;

const MIME_TO_EXTENSION = new Map([
  ['audio/mpeg', 'mp3'],
  ['audio/mp3', 'mp3'],
  ['audio/wav', 'wav'],
  ['audio/x-wav', 'wav'],
  ['audio/wave', 'wav'],
  ['audio/webm', 'webm'],
  ['audio/ogg', 'ogg'],
  ['audio/mp4', 'm4a'],
  ['application/octet-stream', 'audio'],
]);

export class DriveAudioError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'DriveAudioError';
    this.status = status;
  }
}

export function parseDriveFileId(value) {
  if (typeof value !== 'string' || value.length > 2048) return null;
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }

  if (url.protocol !== 'https:' || url.hostname !== 'drive.google.com' || url.username || url.password || url.port) return null;

  const pathMatch = url.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]{5,200})(?:\/|$)/);
  const queryId = (url.pathname === '/open' || url.pathname === '/uc') ? url.searchParams.get('id') : null;
  const id = pathMatch?.[1] ?? queryId;
  return id && /^[A-Za-z0-9_-]{5,200}$/.test(id) ? id : null;
}

function isAllowedGoogleRedirect(value) {
  let url;
  try {
    url = value instanceof URL ? value : new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) return false;
  const hostname = url.hostname.toLowerCase();
  return hostname === 'drive.google.com'
    || hostname === 'drive.usercontent.google.com'
    || hostname === 'googleusercontent.com'
    || hostname.endsWith('.googleusercontent.com');
}

function sniffAudioMime(bytes) {
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WAVE') return 'audio/wav';
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RF64' && bytes.toString('ascii', 8, 12) === 'WAVE') return 'audio/wav';
  if (bytes.length >= 4 && bytes.toString('ascii', 0, 4) === 'OggS') return 'audio/ogg';
  if (bytes.length >= 4 && bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) return 'audio/webm';
  if (bytes.length >= 8 && bytes.toString('ascii', 4, 8) === 'ftyp') return 'audio/mp4';
  if (bytes.length >= 3 && bytes.toString('ascii', 0, 3) === 'ID3') return 'audio/mpeg';
  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return 'audio/mpeg';
  return null;
}

async function readLimitedBody(body) {
  if (!body) throw new DriveAudioError(422, 'Drive no entregó datos de audio. Revisa que el enlace tenga acceso de lector.');
  const parts = [];
  let total = 0;
  try {
    for await (const part of body) {
      const bytes = Buffer.from(part);
      total += bytes.length;
      if (total > MAX_AUDIO_BYTES) {
        await body.cancel?.().catch(() => {});
        throw new DriveAudioError(413, 'El audio supera el límite de 16 MiB.');
      }
      parts.push(bytes);
    }
  } catch (error) {
    if (error instanceof DriveAudioError) throw error;
    throw new DriveAudioError(502, 'No se pudo descargar el audio desde Drive. Inténtalo de nuevo.');
  }
  return Buffer.concat(parts, total);
}

export async function fetchDriveAudio(driveUrl, fetchImpl = globalThis.fetch) {
  const id = parseDriveFileId(driveUrl);
  if (!id) throw new DriveAudioError(400, 'Pega un enlace HTTPS válido de un archivo de Google Drive.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let response;
  let current = new URL(`https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`);

  try {
    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
      response = await fetchImpl(current, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: { accept: 'audio/*, application/octet-stream;q=0.9' },
      });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;

      const location = response.headers.get('location');
      await response.body?.cancel().catch(() => {});
      if (!location || redirects === MAX_REDIRECTS) throw new DriveAudioError(502, 'Drive devolvió una redirección que no se pudo validar.');
      const next = new URL(location, current);
      if (!isAllowedGoogleRedirect(next)) throw new DriveAudioError(502, 'Se bloqueó una redirección fuera de los dominios seguros de Google.');
      current = next;
    }

    if (!response) throw new DriveAudioError(502, 'Drive no respondió. Inténtalo de nuevo.');
    if (response.status === 403 || response.status === 404) {
      throw new DriveAudioError(422, 'No se puede leer el archivo. En Drive, activa «Cualquier persona con el enlace · Lector».');
    }
    if (!response.ok) throw new DriveAudioError(502, 'Drive no pudo entregar el archivo. Comprueba el enlace y vuelve a intentar.');

    const declaredMime = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
    if (declaredMime === 'text/html' || declaredMime === 'application/xhtml+xml') {
      throw new DriveAudioError(422, 'Drive entregó una página de acceso, no el archivo. Comprueba que el enlace sea público y que no requiera iniciar sesión.');
    }
    if (declaredMime && !MIME_TO_EXTENSION.has(declaredMime)) {
      throw new DriveAudioError(415, 'El enlace no parece ser MP3, WAV, WebM, OGG o M4A.');
    }

    const declaredLength = Number(response.headers.get('content-length'));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_AUDIO_BYTES) {
      await response.body?.cancel().catch(() => {});
      throw new DriveAudioError(413, 'El audio supera el límite de 16 MiB.');
    }

    const bytes = await readLimitedBody(response.body);
    const contentType = sniffAudioMime(bytes);
    if (!contentType) throw new DriveAudioError(415, 'El archivo descargado no contiene un formato de audio admitido.');
    return { bytes, contentType, extension: MIME_TO_EXTENSION.get(contentType) ?? 'audio' };
  } catch (error) {
    if (error instanceof DriveAudioError) throw error;
    if (controller.signal.aborted || error?.name === 'AbortError' || error?.name === 'TimeoutError') {
      throw new DriveAudioError(504, 'La descarga desde Drive tardó demasiado. Revisa el enlace y vuelve a intentarlo.');
    }
    throw new DriveAudioError(502, 'No se pudo conectar con Drive. Comprueba el enlace y vuelve a intentar.');
  } finally {
    clearTimeout(timeout);
  }
}

async function readRequestJson(req) {
  const chunks = [];
  let total = 0;
  for await (const part of req) {
    const bytes = Buffer.from(part);
    total += bytes.length;
    if (total > MAX_REQUEST_BYTES) throw new DriveAudioError(413, 'La solicitud es demasiado grande.');
    chunks.push(bytes);
  }
  try {
    return JSON.parse(Buffer.concat(chunks, total).toString('utf8'));
  } catch {
    throw new DriveAudioError(400, 'La solicitud no contiene JSON válido.');
  }
}

function sendJson(res, status, message) {
  const body = Buffer.from(JSON.stringify({ error: message }));
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': body.length,
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  res.end(body);
}

export async function handleDriveAudioRequest(req, res, { fetchImpl = globalThis.fetch } = {}) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    sendJson(res, 405, 'Este endpoint solo acepta solicitudes POST.');
    return;
  }

  try {
    const contentType = String(req.headers?.['content-type'] ?? '').toLowerCase();
    if (!contentType.startsWith('application/json')) throw new DriveAudioError(415, 'La solicitud debe ser JSON.');
    const payload = await readRequestJson(req);
    if (payload?.rightsConfirmed !== true) {
      throw new DriveAudioError(403, 'Confirma que tienes derecho a reproducir y procesar este audio antes de continuar.');
    }
    const file = await fetchDriveAudio(payload?.driveUrl, fetchImpl);
    res.writeHead(200, {
      'content-type': file.contentType,
      'content-length': file.bytes.length,
      'content-disposition': `inline; filename="tu-audio.${file.extension}"`,
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    });
    res.end(file.bytes);
  } catch (error) {
    const status = error instanceof DriveAudioError ? error.status : 500;
    const message = error instanceof DriveAudioError ? error.message : 'No se pudo procesar el audio. Inténtalo de nuevo.';
    sendJson(res, status, message);
  }
}
