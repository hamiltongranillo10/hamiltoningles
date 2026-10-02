const MAX_BODY_BYTES = 32 * 1024;
const MAX_MESSAGES = 12;

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
        reject(new Error('La conversación es demasiado larga.'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function parseModelJson(content) {
  const clean = String(content ?? '').trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  try {
    const parsed = JSON.parse(clean);
    return {
      reply: String(parsed.reply ?? '').trim(),
      translation: String(parsed.translation ?? '').trim(),
      correction: String(parsed.correction ?? '').trim(),
      tip: String(parsed.tip ?? '').trim(),
    };
  } catch {
    return { reply: clean, translation: '', correction: '', tip: '' };
  }
}

export async function handleConversationRequest(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Método no permitido.' });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    sendJson(res, 503, { error: 'La IA conversacional todavía no está configurada en el servidor.' });
    return;
  }

  try {
    const raw = await readBody(req);
    const input = JSON.parse(raw || '{}');
    const level = typeof input.level === 'string' ? input.level.slice(0, 8) : 'a1';
    const topic = typeof input.topic === 'string' ? input.topic.slice(0, 120) : 'práctica libre';
    const history = Array.isArray(input.messages) ? input.messages.slice(-MAX_MESSAGES) : [];
    const messages = history
      .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
      .map((item) => ({ role: item.role, content: item.content.slice(0, 500) }));

    const baseUrl = (process.env.OPENAI_API_BASE || 'https://api.openai.com/v1').replace(/\/$/, '');
    const model = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: 350,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Eres el compañero de práctica de inglés de una aplicación educativa. Habla con naturalidad y adapta tu dificultad al nivel CEFR ${level}. Tema actual: ${topic}. Responde principalmente en inglés, con una pregunta breve para mantener la conversación. Corrige como máximo un error importante y de forma amable. Devuelve SOLO un objeto JSON válido con estas claves: reply (respuesta en inglés), translation (traducción al español), correction (corrección en español o cadena vacía), tip (consejo breve en español o cadena vacía). No inventes que tienes acceso al micrófono ni prometas acciones externas.`,
          },
          ...messages,
        ],
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Conversation provider error:', response.status, payload);
      sendJson(res, 502, { error: 'El servicio de IA no pudo responder en este momento.' });
      return;
    }

    const result = parseModelJson(payload.choices?.[0]?.message?.content);
    if (!result.reply) {
      sendJson(res, 502, { error: 'La IA devolvió una respuesta vacía.' });
      return;
    }
    sendJson(res, 200, result);
  } catch (error) {
    console.error('Conversation request error:', error);
    sendJson(res, 400, { error: error instanceof Error ? error.message : 'No se pudo procesar la conversación.' });
  }
}
