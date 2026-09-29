import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import test from 'node:test';
import {
  DriveAudioError,
  fetchDriveAudio,
  handleDriveAudioRequest,
  parseDriveFileId,
} from './drive-audio.mjs';

const validLink = 'https://drive.google.com/file/d/abc_123-xyz/view?usp=sharing';
const mp3 = Buffer.from('ID3\x04\x00\x00\x00\x00\x00\x00audio');

function mockResponse(status, headers = {}, body = null) {
  return new Response(body, { status, headers });
}

test('accepts only HTTPS Google Drive file-share URL forms', () => {
  assert.equal(parseDriveFileId(validLink), 'abc_123-xyz');
  assert.equal(parseDriveFileId('https://drive.google.com/open?id=abc_123-xyz'), 'abc_123-xyz');
  assert.equal(parseDriveFileId('https://drive.google.com/uc?id=abc_123-xyz&export=download'), 'abc_123-xyz');
  assert.equal(parseDriveFileId('http://drive.google.com/file/d/abc_123-xyz/view'), null);
  assert.equal(parseDriveFileId('https://drive.google.com.evil.test/file/d/abc_123-xyz/view'), null);
  assert.equal(parseDriveFileId('https://example.com/file/d/abc_123-xyz/view'), null);
  assert.equal(parseDriveFileId('https://user:pass@drive.google.com/file/d/abc_123-xyz/view'), null);
  assert.equal(parseDriveFileId('https://drive.google.com/drive/folders/abc_123-xyz'), null);
});

test('downloads a recognized small MP3 from Drive without changing the target host', async () => {
  let requested;
  const result = await fetchDriveAudio(validLink, async (url, options) => {
    requested = { url: String(url), options };
    return mockResponse(200, { 'content-type': 'audio/mpeg', 'content-length': String(mp3.length) }, mp3);
  });
  assert.equal(new URL(requested.url).hostname, 'drive.google.com');
  assert.equal(new URL(requested.url).searchParams.get('id'), 'abc_123-xyz');
  assert.equal(requested.options.redirect, 'manual');
  assert.equal(result.contentType, 'audio/mpeg');
  assert.deepEqual(result.bytes, mp3);
});

test('rejects an oversized file from its declared content length', async () => {
  await assert.rejects(
    fetchDriveAudio(validLink, async () => mockResponse(200, {
      'content-type': 'audio/mpeg',
      'content-length': String(16 * 1024 * 1024 + 1),
    })),
    (error) => error instanceof DriveAudioError && error.status === 413,
  );
});

test('rejects HTML, unsupported MIME and unknown binary content', async () => {
  await assert.rejects(fetchDriveAudio(validLink, async () => mockResponse(200, { 'content-type': 'text/html' }, '<html>login</html>')), /Drive entregó una página/);
  await assert.rejects(fetchDriveAudio(validLink, async () => mockResponse(200, { 'content-type': 'video/mp4' }, mp3)), /no parece ser MP3/);
  await assert.rejects(fetchDriveAudio(validLink, async () => mockResponse(200, { 'content-type': 'application/octet-stream' }, 'not audio')), /no contiene un formato/);
});

test('refuses redirect targets outside HTTPS Google media hosts', async () => {
  let calls = 0;
  await assert.rejects(fetchDriveAudio(validLink, async () => {
    calls += 1;
    return mockResponse(302, { location: 'http://127.0.0.1:8080/private' });
  }), (error) => error instanceof DriveAudioError && error.status === 502);
  assert.equal(calls, 1);
});

test('serves accepted bytes with no-store headers and returns JSON validation errors', async () => {
  function makeRequest(body) {
    const request = Readable.from([Buffer.from(body)]);
    request.method = 'POST';
    request.headers = { 'content-type': 'application/json' };
    return request;
  }
  function makeResponse() {
    return {
      headers: {},
      status: 0,
      body: null,
      setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
      writeHead(status, headers = {}) {
        this.status = status;
        for (const [name, value] of Object.entries(headers)) this.headers[name.toLowerCase()] = value;
      },
      end(body) { this.body = body; },
    };
  }

  const okRes = makeResponse();
  await handleDriveAudioRequest(makeRequest(JSON.stringify({ driveUrl: validLink, rightsConfirmed: true })), okRes, {
    fetchImpl: async () => mockResponse(200, { 'content-type': 'audio/mpeg' }, mp3),
  });
  assert.equal(okRes.status, 200);
  assert.equal(okRes.headers['cache-control'], 'no-store');
  assert.equal(okRes.headers['content-type'], 'audio/mpeg');
  assert.deepEqual(okRes.body, mp3);

  const badRes = makeResponse();
  await handleDriveAudioRequest(makeRequest(JSON.stringify({ driveUrl: 'https://example.com/audio.mp3', rightsConfirmed: true })), badRes, {
    fetchImpl: async () => { throw new Error('must not be called'); },
  });
  assert.equal(badRes.status, 400);
  assert.equal(badRes.headers['cache-control'], 'no-store');
  assert.match(JSON.parse(badRes.body.toString()).error, /Google Drive/);
});

test('requires rights confirmation before making any Drive request', async () => {
  const request = Readable.from([Buffer.from(JSON.stringify({ driveUrl: validLink }))]);
  request.method = 'POST';
  request.headers = { 'content-type': 'application/json' };
  const response = {
    headers: {}, status: 0, body: null,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    writeHead(status, headers = {}) {
      this.status = status;
      for (const [name, value] of Object.entries(headers)) this.headers[name.toLowerCase()] = value;
    },
    end(body) { this.body = body; },
  };
  let fetchCalls = 0;
  await handleDriveAudioRequest(request, response, { fetchImpl: async () => { fetchCalls += 1; throw new Error('must not be called'); } });
  assert.equal(response.status, 403);
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.match(JSON.parse(response.body.toString()).error, /Confirma que tienes derecho/);
  assert.equal(fetchCalls, 0);
});

test('exposes a parseable no-store JSON error over real HTTP', async (t) => {
  const server = createServer((req, res) => { void handleDriveAudioRequest(req, res); });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const response = await fetch(`http://127.0.0.1:${address.port}/api/drive/audio`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ driveUrl: 'https://example.com/not-a-drive-file', rightsConfirmed: true }),
  });
  const payload = await response.json();
  assert.equal(response.status, 400);
  assert.match(response.headers.get('cache-control') ?? '', /no-store/);
  assert.equal(typeof payload.error, 'string');
  assert.match(payload.error, /Google Drive/);
});
