import { pipeline, type ProgressInfo } from '@huggingface/transformers';
import type { AudioModelProgress, AudioSegment, AudioWorkerRequest, AudioWorkerResponse, AudioWorkerResult, TranscriptionSegment } from '../audio-model-client';

const ASR_MODEL = 'onnx-community/whisper-base.en';
const TRANSLATION_MODEL = 'onnx-community/opus-mt-en-es';

type InferenceDevice = 'webgpu' | 'wasm';

interface WorkerScope {
  postMessage(message: AudioWorkerResponse): void;
  addEventListener(type: 'message', listener: (event: MessageEvent<AudioWorkerRequest>) => void): void;
}

const scope = self as unknown as WorkerScope;
let asrPromise: ReturnType<typeof createAsr> | undefined;
let translationPromise: ReturnType<typeof createTranslator> | undefined;
let asrDevice: InferenceDevice = 'wasm';
let translationDevice: InferenceDevice = 'wasm';
let preferWasmAsr = false;
let preferWasmTranslation = false;
let queue = Promise.resolve();

function report(id: number, stage: AudioModelProgress['stage'], message: string, percent?: number, file?: string) {
  scope.postMessage({ id, kind: 'progress', progress: { stage, message, percent, file } });
}

function progressFor(id: number, stage: 'loading-asr' | 'loading-translation', label: string) {
  return (event: ProgressInfo) => {
    const percent = 'progress' in event && typeof event.progress === 'number' ? Math.round(event.progress) : undefined;
    const file = 'file' in event ? event.file : undefined;
    const message = event.status === 'ready'
      ? `${label} listo en este dispositivo.`
      : percent === undefined
        ? `Preparando ${label.toLowerCase()} local…`
        : `Descargando ${label.toLowerCase()} (${percent}%).`;
    report(id, stage, message, percent, file);
  };
}

async function hasWebGPU() {
  if (typeof navigator === 'undefined') return false;
  const gpu = (navigator as unknown as { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu;
  if (!gpu || typeof gpu.requestAdapter !== 'function') return false;
  try {
    return Boolean(await gpu.requestAdapter());
  } catch {
    return false;
  }
}

async function createAsr(id: number) {
  if (!preferWasmAsr && await hasWebGPU()) {
    try {
      const model = await pipeline('automatic-speech-recognition', ASR_MODEL, {
        device: 'webgpu',
        progress_callback: progressFor(id, 'loading-asr', 'Whisper'),
      });
      asrDevice = 'webgpu';
      return model;
    } catch {
      preferWasmAsr = true;
      report(id, 'loading-asr', 'WebGPU no pudo iniciar Whisper; continúo con WASM local.');
    }
  }
  asrDevice = 'wasm';
  return pipeline('automatic-speech-recognition', ASR_MODEL, {
    device: 'wasm',
    progress_callback: progressFor(id, 'loading-asr', 'Whisper'),
  });
}

async function createTranslator(id: number) {
  if (!preferWasmTranslation && await hasWebGPU()) {
    try {
      const model = await pipeline('translation', TRANSLATION_MODEL, {
        device: 'webgpu',
        progress_callback: progressFor(id, 'loading-translation', 'Traducción'),
      });
      translationDevice = 'webgpu';
      return model;
    } catch {
      preferWasmTranslation = true;
      report(id, 'loading-translation', 'WebGPU no pudo iniciar la traducción; continúo con WASM local.');
    }
  }
  translationDevice = 'wasm';
  return pipeline('translation', TRANSLATION_MODEL, {
    device: 'wasm',
    progress_callback: progressFor(id, 'loading-translation', 'Traducción'),
  });
}

function getAsr(id: number) {
  if (!asrPromise) {
    asrPromise = createAsr(id).catch((error: unknown) => {
      asrPromise = undefined;
      throw error;
    });
  }
  return asrPromise;
}

function getTranslator(id: number) {
  if (!translationPromise) {
    translationPromise = createTranslator(id).catch((error: unknown) => {
      translationPromise = undefined;
      throw error;
    });
  }
  return translationPromise;
}

async function transcribeWithFallback(audio: Float32Array, id: number) {
  const options = { return_timestamps: true, chunk_length_s: 30, stride_length_s: 5 } as const;
  let transcriber = await getAsr(id);
  try {
    return await transcriber(audio, options);
  } catch (error) {
    if (asrDevice !== 'webgpu') throw error;
    preferWasmAsr = true;
    asrPromise = undefined;
    report(id, 'loading-asr', 'El acelerador no pudo procesar este audio; reintento con WASM local.');
    transcriber = await getAsr(id);
    return transcriber(audio, options);
  }
}

async function translateOne(text: string, id: number) {
  let translator = await getTranslator(id);
  try {
    const [output] = await translator(text);
    return output?.translation_text?.trim() ?? '';
  } catch (error) {
    if (translationDevice !== 'webgpu') throw error;
    preferWasmTranslation = true;
    translationPromise = undefined;
    report(id, 'loading-translation', 'El acelerador no pudo traducir esta línea; reintento con WASM local.');
    translator = await getTranslator(id);
    const [output] = await translator(text);
    return output?.translation_text?.trim() ?? '';
  }
}

async function translateTexts(texts: string[], id: number) {
  const translations: string[] = [];
  for (let index = 0; index < texts.length; index += 1) {
    report(id, 'translating', `Traduciendo línea ${index + 1} de ${texts.length} en este dispositivo…`);
    const translation = await translateOne(texts[index], id);
    if (!translation) throw new Error('El modelo local no devolvió una traducción. Vuelve a intentarlo o usa un navegador de escritorio compatible.');
    translations.push(translation);
  }
  return translations;
}

function userFacingError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  if (/ShapeInferenceError|Can't create a session|no available backend|ERROR_CODE\s*:\s*6|onnxruntime|webgpu|wasm/i.test(message)) {
    return 'Este dispositivo no pudo iniciar una sesión compatible del modelo local. Recarga la página y prueba con un audio más corto o un navegador actualizado.';
  }
  return message || 'El modelo local no pudo completar el procesamiento. Revisa la conexión y los recursos del dispositivo.';
}

async function recognizeAudio(audio: Float32Array, id: number): Promise<TranscriptionSegment[]> {
  report(id, 'transcribing', 'Reconociendo la voz en este dispositivo…');
  const output = await transcribeWithFallback(audio, id);
  const raw = output.chunks?.filter((chunk) => chunk.text.trim()) ?? [];
  const chunks = raw.length > 0
    ? raw.map((chunk) => ({ text: chunk.text.trim(), start: chunk.timestamp[0], end: chunk.timestamp[1] }))
    : output.text.trim()
      ? [{ text: output.text.trim(), start: null, end: null }]
      : [];
  if (chunks.length === 0) throw new Error('No se reconocieron palabras. Prueba con una voz más clara o un fragmento corto.');
  return chunks.map((chunk, index) => ({ id: index + 1, ...chunk }));
}

async function processRequest(request: AudioWorkerRequest): Promise<AudioWorkerResult> {
  if (request.action === 'translate') {
    const text = request.text.trim();
    if (!text) return { translation: '' };
    const [translation] = await translateTexts([text], request.id);
    report(request.id, 'ready', 'Traducción lista en este dispositivo.');
    return { translation };
  }

  const transcription = await recognizeAudio(request.audio, request.id);
  if (request.action === 'transcribe') {
    report(request.id, 'ready', 'Voz reconocida en este dispositivo.');
    return { transcription };
  }

  const translations = await translateTexts(transcription.map((segment) => segment.text), request.id);
  const segments: AudioSegment[] = transcription.map((segment, index) => ({
    ...segment,
    translation: translations[index],
  }));
  report(request.id, 'ready', 'Borrador listo para revisar.');
  return { segments };
}

scope.addEventListener('message', (event) => {
  const request = event.data;
  queue = queue.then(async () => {
    try {
      const result = await processRequest(request);
      scope.postMessage({ id: request.id, kind: 'result', result });
    } catch (error) {
      scope.postMessage({ id: request.id, kind: 'error', message: userFacingError(error) });
    }
  });
});
