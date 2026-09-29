export interface AudioSegment {
  id: number;
  text: string;
  translation: string;
  start: number | null;
  end: number | null;
}

export interface TranscriptionSegment {
  id: number;
  text: string;
  start: number | null;
  end: number | null;
}

export interface AudioModelProgress {
  stage: 'loading-asr' | 'loading-translation' | 'transcribing' | 'translating' | 'ready';
  percent?: number;
  file?: string;
  message: string;
}

export type AudioWorkerRequest =
  | { id: number; action: 'translate'; text: string }
  | { id: number; action: 'transcribe'; audio: Float32Array }
  | { id: number; action: 'transcribe-and-translate'; audio: Float32Array };

export type AudioWorkerCommand =
  | { action: 'translate'; text: string }
  | { action: 'transcribe'; audio: Float32Array }
  | { action: 'transcribe-and-translate'; audio: Float32Array };

export type AudioWorkerResult =
  | { translation: string }
  | { transcription: TranscriptionSegment[] }
  | { segments: AudioSegment[] };

export type AudioWorkerResponse =
  | { id: number; kind: 'progress'; progress: AudioModelProgress }
  | { id: number; kind: 'result'; result: AudioWorkerResult }
  | { id: number; kind: 'error'; message: string };

interface PendingRequest {
  resolve: (result: AudioWorkerResult) => void;
  reject: (error: Error) => void;
}

export function createAudioModelClient(onProgress: (progress: AudioModelProgress) => void) {
  let worker: Worker | null = null;
  let fatalError: Error | null = null;
  let nextId = 0;
  let latestRequestId = 0;
  let disposed = false;
  const pending = new Map<number, PendingRequest>();

  function rejectPending(error: Error) {
    for (const item of pending.values()) item.reject(error);
    pending.clear();
    latestRequestId = 0;
  }

  function failWorker(error: Error) {
    if (disposed || fatalError) return;
    fatalError = error;
    rejectPending(error);
  }

  try {
    worker = new Worker(new URL('./workers/audio-worker.ts', import.meta.url), { type: 'module' });
  } catch {
    fatalError = new Error('Este navegador no pudo iniciar el worker de modelos locales. Actualiza el navegador o prueba con uno compatible.');
  }

  if (worker) {
    worker.addEventListener('message', (event: MessageEvent<AudioWorkerResponse>) => {
      const message = event.data;
      if (message.kind === 'progress') {
        if (message.id === latestRequestId && pending.has(message.id)) onProgress(message.progress);
        return;
      }
      const item = pending.get(message.id);
      if (!item) return;
      pending.delete(message.id);
      if (latestRequestId === message.id) latestRequestId = 0;
      if (message.kind === 'error') item.reject(new Error(message.message));
      else item.resolve(message.result);
    });

    worker.addEventListener('error', () => {
      failWorker(new Error('No se pudo cargar el worker del modelo local. Comprueba que el navegador permita workers y vuelve a intentarlo.'));
    });
    worker.addEventListener('messageerror', () => {
      failWorker(new Error('El navegador no pudo leer la respuesta del modelo local. Vuelve a intentarlo.'));
    });
  }

  function send(request: AudioWorkerCommand): Promise<AudioWorkerResult> {
    if (disposed) return Promise.reject(new Error('El procesamiento local ya terminó.'));
    if (fatalError) return Promise.reject(fatalError);
    const currentWorker = worker;
    if (!currentWorker) return Promise.reject(new Error('El worker local no está disponible en este navegador.'));

    const id = ++nextId;
    const message = { ...request, id } as AudioWorkerRequest;
    latestRequestId = id;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      try {
        if (message.action !== 'translate' && message.audio.buffer instanceof ArrayBuffer) {
          currentWorker.postMessage(message, [message.audio.buffer]);
        } else {
          currentWorker.postMessage(message);
        }
      } catch {
        pending.delete(id);
        if (latestRequestId === id) latestRequestId = 0;
        reject(new Error('No se pudo enviar el trabajo al modelo local. Vuelve a intentarlo.'));
      }
    });
  }

  return {
    async translate(text: string): Promise<string> {
      const result = await send({ action: 'translate', text });
      if (!('translation' in result)) throw new Error('La traducción local no devolvió texto.');
      return result.translation;
    },
    async transcribe(audio: Float32Array): Promise<TranscriptionSegment[]> {
      const result = await send({ action: 'transcribe', audio });
      if (!('transcription' in result)) throw new Error('El reconocimiento local no devolvió texto.');
      return result.transcription;
    },
    async transcribeAndTranslate(audio: Float32Array): Promise<AudioSegment[]> {
      const result = await send({ action: 'transcribe-and-translate', audio });
      if (!('segments' in result)) throw new Error('La transcripción local no devolvió segmentos.');
      return result.segments;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      worker?.terminate();
      rejectPending(new Error('Se cerró esta vista.'));
      worker = null;
    },
  };
}
