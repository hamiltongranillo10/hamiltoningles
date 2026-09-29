import type { AudioModelProgress } from './audio-model-client';

interface NativeTranslator {
  translate(text: string): Promise<unknown>;
  destroy?: () => void;
}

interface NativeTranslatorMonitor extends EventTarget {}

interface NativeTranslatorApi {
  create(options: {
    sourceLanguage: 'en';
    targetLanguage: 'es';
    monitor: (monitor: NativeTranslatorMonitor) => void;
  }): Promise<NativeTranslator>;
}

function getNativeTranslatorApi(): NativeTranslatorApi | null {
  return (globalThis as typeof globalThis & { Translator?: NativeTranslatorApi }).Translator ?? null;
}

export function createBrowserTranslator(onProgress: (progress: AudioModelProgress) => void) {
  let translatorPromise: Promise<NativeTranslator> | null = null;
  let translator: NativeTranslator | null = null;
  let disposed = false;

  function prepare(): boolean {
    if (disposed) return false;
    const api = getNativeTranslatorApi();
    if (!api) {
      onProgress({
        stage: 'loading-translation',
        message: 'Este navegador no incluye un traductor de IA integrado; probaré el modelo local de respaldo.',
      });
      return false;
    }
    if (translatorPromise) return true;

    onProgress({ stage: 'loading-translation', message: 'Preparando la traducción integrada del navegador…' });
    try {
      const pending = api.create({
        sourceLanguage: 'en',
        targetLanguage: 'es',
        monitor(monitor) {
          monitor.addEventListener('downloadprogress', (event: Event) => {
            if (disposed) return;
            const loaded = (event as Event & { loaded?: number }).loaded;
            const percent = typeof loaded === 'number' && Number.isFinite(loaded)
              ? Math.max(0, Math.min(100, Math.round(loaded * 100)))
              : undefined;
            onProgress({
              stage: 'loading-translation',
              percent,
              message: percent === undefined
                ? 'El navegador está descargando su modelo de traducción local…'
                : `El navegador prepara su traductor local (${percent}%).`,
            });
          });
        },
      });
      translatorPromise = pending;
      void pending.then((instance) => {
        if (disposed) {
          instance.destroy?.();
          return;
        }
        translator = instance;
        onProgress({ stage: 'ready', message: 'Traductor integrado del navegador listo en este dispositivo.' });
      }, () => {
        if (translatorPromise === pending) translatorPromise = null;
        if (!disposed) {
          onProgress({
            stage: 'loading-translation',
            message: 'El traductor integrado no pudo iniciar; probaré el modelo local de respaldo.',
          });
        }
      });
      return true;
    } catch {
      translatorPromise = null;
      onProgress({
        stage: 'loading-translation',
        message: 'El navegador no pudo iniciar su traductor integrado; probaré el modelo local de respaldo.',
      });
      return false;
    }
  }

  async function translate(text: string): Promise<string> {
    const clean = text.trim();
    if (!clean) return '';
    if (disposed) throw new Error('El traductor del navegador ya se cerró.');
    if (!translatorPromise) throw new Error('El traductor integrado aún no está preparado.');

    const instance = await translatorPromise;
    if (disposed) throw new Error('El traductor del navegador ya se cerró.');
    const output = await instance.translate(clean);
    if (typeof output !== 'string' || !output.trim()) {
      throw new Error('El traductor integrado del navegador no devolvió una traducción.');
    }
    return output.trim();
  }

  function isSupported(): boolean {
    return Boolean(getNativeTranslatorApi());
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    translator?.destroy?.();
    translator = null;
    translatorPromise = null;
  }

  return { isSupported, prepare, translate, dispose };
}
