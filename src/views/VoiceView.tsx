import { useEffect, useRef, useState } from 'react';
import { AudioButton } from '../components/AudioButton';
import { Icon } from '../components/Icons';
import { createAudioModelClient, type AudioModelProgress } from '../audio-model-client';
import { createBrowserTranslator } from '../browser-translator';
import { decodeAudioForWhisper } from '../audio-input';

const MAX_RECORDING_SECONDS = 20;
const MAX_MIC_AUDIO_BYTES = 10 * 1024 * 1024;
type TranslationEngine = 'browser' | 'local';

function progressLabel(progress: AudioModelProgress | null) {
  return progress?.message ?? 'El traductor se prepara al usarlo por primera vez.';
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo traducir en este dispositivo.';
}

export function VoiceView() {
  const clientRef = useRef<ReturnType<typeof createAudioModelClient> | null>(null);
  const browserTranslatorRef = useRef<ReturnType<typeof createBrowserTranslator> | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  const translationJobRef = useRef(0);
  const [phrase, setPhrase] = useState('');
  const [translation, setTranslation] = useState('');
  const [translationEngine, setTranslationEngine] = useState<TranslationEngine | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isRequestingMic, setIsRequestingMic] = useState(false);
  const [recordMessage, setRecordMessage] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<AudioModelProgress | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    const client = createAudioModelClient(setProgress);
    const browserTranslator = createBrowserTranslator(setProgress);
    clientRef.current = client;
    browserTranslatorRef.current = browserTranslator;
    return () => {
      mountedRef.current = false;
      translationJobRef.current += 1;
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      client.dispose();
      browserTranslator.dispose();
      clientRef.current = null;
      browserTranslatorRef.current = null;
    };
  }, []);

  async function translateWithFallback(text: string): Promise<{ translation: string; engine: TranslationEngine }> {
    const browserTranslator = browserTranslatorRef.current;
    let browserError: Error | null = null;
    if (browserTranslator?.isSupported()) {
      try {
        browserTranslator.prepare();
        const result = await browserTranslator.translate(text);
        return { translation: result, engine: 'browser' };
      } catch (cause) {
        browserError = cause instanceof Error ? cause : new Error('El traductor del navegador no pudo responder.');
      }
    }

    const localClient = clientRef.current;
    if (!localClient) throw new Error('La sección de voz se está cerrando. Vuelve a abrirla e intenta de nuevo.');
    try {
      const result = await localClient.translate(text);
      if (!result.trim()) throw new Error('El modelo local no devolvió texto.');
      return { translation: result.trim(), engine: 'local' };
    } catch (localCause) {
      const localError = errorMessage(localCause);
      if (browserError) {
        throw new Error(`No funcionó la traducción integrada del navegador ni el respaldo local. Navegador: ${browserError.message} Respaldo: ${localError}`);
      }
      throw new Error(`No funcionó el modelo local de traducción. ${localError}`);
    }
  }

  async function runTranslation(text: string, job: number) {
    if (!text || job !== translationJobRef.current) return;
    setError('');
    setIsTranslating(true);
    try {
      const result = await translateWithFallback(text);
      if (mountedRef.current && job === translationJobRef.current) {
        setTranslation(result.translation);
        setTranslationEngine(result.engine);
        setProgress({
          stage: 'ready',
          message: result.engine === 'browser'
            ? 'Traducción con la IA integrada del navegador; procesada en este dispositivo.'
            : 'Traducción completada con el modelo local de respaldo.',
        });
      }
    } catch (cause) {
      if (mountedRef.current && job === translationJobRef.current) {
        setProgress(null);
        setTranslation('');
        setTranslationEngine(null);
        setError(errorMessage(cause));
      }
    } finally {
      if (mountedRef.current && job === translationJobRef.current) setIsTranslating(false);
    }
  }

  useEffect(() => {
    const text = phrase.trim();
    const job = ++translationJobRef.current;
    if (!text) {
      setTranslation('');
      setTranslationEngine(null);
      setIsTranslating(false);
      return;
    }

    setTranslation('');
    setTranslationEngine(null);
    const timer = window.setTimeout(() => { void runTranslation(text, job); }, 650);
    return () => window.clearTimeout(timer);
  }, [phrase]);

  function handlePhraseChange(value: string) {
    setPhrase(value);
    setTranslation('');
    setTranslationEngine(null);
    setError('');
    setRecordMessage('');
    setProgress(null);
    if (value.trim()) browserTranslatorRef.current?.prepare();
  }

  function translateNow() {
    const text = phrase.trim();
    if (!text || isTranslating) return;
    const job = ++translationJobRef.current;
    setTranslation('');
    setTranslationEngine(null);
    setProgress(null);
    browserTranslatorRef.current?.prepare();
    void runTranslation(text, job);
  }

  async function startRecording() {
    // Start native translator creation synchronously from the user's click; some browsers require activation.
    browserTranslatorRef.current?.prepare();
    setError('');
    setRecordMessage('');
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Este navegador no ofrece grabación local. Puedes escribir una frase en el campo de arriba.');
      return;
    }

    try {
      setIsRequestingMic(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      const chunks: Blob[] = [];
      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      });
      recorder.addEventListener('stop', async () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        if (timerRef.current !== null) window.clearTimeout(timerRef.current);
        timerRef.current = null;
        if (mountedRef.current) setIsRecording(false);

        const audio = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        if (audio.size === 0) {
          if (mountedRef.current) setError('No se recibió audio. Comprueba el micrófono y vuelve a probar.');
          return;
        }
        if (audio.size > MAX_MIC_AUDIO_BYTES) {
          if (mountedRef.current) setError('La grabación es demasiado grande. Prueba con una frase más corta.');
          return;
        }

        const client = clientRef.current;
        if (!client) return;
        if (mountedRef.current) setRecordMessage('Preparando la grabación en este navegador…');
        try {
          const samples = await decodeAudioForWhisper(audio);
          if (mountedRef.current) setRecordMessage('Reconociendo la voz localmente…');
          const transcription = await client.transcribe(samples);
          if (!mountedRef.current) return;
          const recognized = transcription.map((segment) => segment.text).join(' ').trim().slice(0, 160);
          if (!recognized) throw new Error('No se reconocieron palabras. Prueba con una frase clara y breve.');
          setPhrase(recognized);
          setTranslation('');
          setTranslationEngine(null);
          setRecordMessage('Listo. Revisa el texto reconocido; se traducirá en esta misma página.');
          if (recognized === phrase.trim()) {
            const job = ++translationJobRef.current;
            void runTranslation(recognized, job);
          }
        } catch (cause) {
          if (mountedRef.current) {
            setRecordMessage('');
            setError(errorMessage(cause));
          }
        }
      }, { once: true });
      recorder.start();
      setIsRecording(true);
      setRecordMessage(`Grabando en este dispositivo; máximo ${MAX_RECORDING_SECONDS} segundos.`);
      timerRef.current = window.setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, MAX_RECORDING_SECONDS * 1000);
    } catch (cause) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      recorderRef.current = null;
      const denied = cause instanceof DOMException && (cause.name === 'NotAllowedError' || cause.name === 'PermissionDeniedError');
      setError(denied
        ? 'No se concedió el permiso de micrófono. Puedes escribir tu frase o permitirlo en la configuración del navegador.'
        : 'No se pudo acceder al micrófono. Comprueba que el dispositivo lo tenga disponible.');
    } finally {
      if (mountedRef.current) setIsRequestingMic(false);
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }

  return (
    <div className="view-page voice-view">
      <div className="page-heading-row voice-heading">
        <div>
          <span className="eyebrow eyebrow-pill"><Icon name="mic" size={13} /> PRÁCTICA LIBRE · TU VOZ</span>
          <h1>Mi fragmento autorizado</h1>
          <p className="lead">Escribe una frase breve en inglés. La IA integrada del navegador la traduce cuando está disponible; también puedes practicar con tu micrófono.</p>
        </div>
        <div className="voice-mark"><Icon name="music" size={22} /></div>
      </div>

      <div className="voice-layout">
        <section className="surface-card voice-input-panel" aria-labelledby="voice-input-title">
          <label id="voice-input-title" className="field-label voice-label" htmlFor="voice-phrase">LÍNEA BREVE EN INGLÉS · MÁXIMO 160 CARACTERES</label>
          <textarea
            id="voice-phrase"
            className="answer-textarea voice-textarea"
            maxLength={160}
            rows={4}
            value={phrase}
            onChange={(event) => handlePhraseChange(event.currentTarget.value)}
            placeholder="Escribe o pega aquí una frase corta en inglés…"
            aria-describedby="voice-count voice-helper"
          />
          <div className="voice-counter-row"><span id="voice-helper">Se traduce al terminar de escribir; si no sucede, pulsa «Traducir ahora».</span><span id="voice-count">{phrase.length}/160</span></div>
          <div className="voice-actions">
            <AudioButton text={phrase} label="Escuchar mi fragmento" />
            <button className="button button-primary" type="button" onClick={translateNow} disabled={!phrase.trim() || isTranslating}>
              <Icon name="sparkle" size={15} /> {isTranslating ? 'Traduciendo…' : 'Traducir ahora'}
            </button>
            <button className={`button ${isRecording ? 'button-danger' : 'button-outline'}`} type="button" onClick={isRecording ? stopRecording : startRecording} disabled={isRequestingMic}>
              <Icon name="mic" size={16} /> {isRequestingMic ? 'Esperando permiso…' : isRecording ? 'Detener y revisar' : 'Grabar mi voz'}
            </button>
          </div>
          {recordMessage && <p className="voice-record-status" role="status">{recordMessage}</p>}
          {error && <p className="error-notice" role="alert">{error}</p>}
          <p className="voice-microphone-note"><Icon name="shield" size={14} /> El micrófono solo se activa al pulsar «Grabar mi voz». Whisper reconoce la frase en este dispositivo; el audio no se sube.</p>
        </section>

        <section className="surface-card voice-result-panel" aria-labelledby="voice-result-title">
          <span className="eyebrow"><Icon name="volume" size={13} /> TRADUCCIÓN Y PRONUNCIACIÓN</span>
          <h2 id="voice-result-title">Tu idea, en dos idiomas</h2>
          {phrase.trim() ? (
            <>
              <div className="voice-original"><span>INGLÉS</span><p>{phrase.trim()}</p></div>
              <div className="voice-translation"><span>ESPAÑOL</span>
                {isTranslating && !translation ? <p className="muted">{progressLabel(progress)}</p> : <p>{translation || 'Pulsa «Traducir ahora» para volver a intentarlo.'}</p>}
              </div>
              {translation && <>
                <AudioButton text={phrase.trim()} label="Escuchar pronunciación" />
                {translationEngine && <p className="translation-source" role="status">{translationEngine === 'browser' ? 'IA integrada del navegador · procesamiento local' : 'Modelo local de respaldo · sin API de pago'}</p>}
              </>}
            </>
          ) : (
            <div className="voice-placeholder"><Icon name="sparkle" size={18} /><p>La traducción y la guía para escuchar aparecerán aquí.</p></div>
          )}
          {progress && progress.stage !== 'ready' && <div className="local-progress" role="status"><span>{progress.message}</span>{progress.percent !== undefined && <progress value={progress.percent} max={100} aria-label="Descarga del modelo" />}</div>}
        </section>
      </div>

      <div className="privacy-panel surface-card"><Icon name="shield" size={16} /><p><strong>Procesamiento en tu navegador</strong><span>En Chrome/Edge de escritorio, la IA integrada traduce en este dispositivo y prepara su modelo la primera vez. Si no está disponible, se usa el respaldo local. La voz no se sube y no se llama a una API de IA de pago; el navegador puede descargar modelos la primera vez.</span></p></div>
      <p className="model-credit">Respaldo de voz y traducción local: <a href="https://huggingface.co/onnx-community/whisper-base.en" target="_blank" rel="noreferrer">Whisper Base English, ONNX</a> · <a href="https://huggingface.co/onnx-community/opus-mt-en-es" target="_blank" rel="noreferrer">OPUS-MT English–Spanish, CC BY 4.0</a>. Solo se descargan si el navegador necesita ese respaldo; no consumen créditos de IA.</p>
    </div>
  );
}
