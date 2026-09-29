import { useEffect, useRef, useState } from 'react';
import { AudioButton } from '../components/AudioButton';
import { Icon } from '../components/Icons';
import { createAudioModelClient, type AudioModelProgress } from '../audio-model-client';
import { decodeAudioForWhisper } from '../audio-input';

const MAX_RECORDING_SECONDS = 20;
const MAX_MIC_AUDIO_BYTES = 10 * 1024 * 1024;

function progressLabel(progress: AudioModelProgress | null) {
  if (!progress) return 'El modelo se prepara al usarlo por primera vez.';
  return progress.message;
}

export function VoiceView() {
  const clientRef = useRef<ReturnType<typeof createAudioModelClient> | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  const translationJobRef = useRef(0);
  const skipNextTranslationRef = useRef('');
  const [phrase, setPhrase] = useState('');
  const [translation, setTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isRequestingMic, setIsRequestingMic] = useState(false);
  const [recordMessage, setRecordMessage] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<AudioModelProgress | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    const client = createAudioModelClient(setProgress);
    clientRef.current = client;
    return () => {
      mountedRef.current = false;
      translationJobRef.current += 1;
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      client.dispose();
      clientRef.current = null;
    };
  }, []);

  useEffect(() => {
    const text = phrase.trim();
    const job = ++translationJobRef.current;
    if (!text) {
      setTranslation('');
      setIsTranslating(false);
      return;
    }
    setProgress(null);
    if (skipNextTranslationRef.current === text) {
      skipNextTranslationRef.current = '';
      return;
    }

    const timer = window.setTimeout(async () => {
      const client = clientRef.current;
      if (!client) return;
      setError('');
      setIsTranslating(true);
      try {
        const result = await client.translate(text);
        if (mountedRef.current && job === translationJobRef.current) setTranslation(result);
      } catch (cause) {
        if (mountedRef.current && job === translationJobRef.current) {
          setError(cause instanceof Error ? cause.message : 'No se pudo traducir en este dispositivo.');
        }
      } finally {
        if (mountedRef.current && job === translationJobRef.current) setIsTranslating(false);
      }
    }, 650);
    return () => window.clearTimeout(timer);
  }, [phrase]);

  async function startRecording() {
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
          if (mountedRef.current) setRecordMessage('Reconociendo y traduciendo localmente…');
          const segments = await client.transcribeAndTranslate(samples);
          if (!mountedRef.current) return;
          const recognized = segments.map((segment) => segment.text).join(' ').trim().slice(0, 160);
          const translated = segments.map((segment) => segment.translation).join(' ').trim();
          skipNextTranslationRef.current = recognized;
          setPhrase(recognized);
          setTranslation(translated);
          setRecordMessage('Listo. Revisa el texto: la transcripción automática puede equivocarse.');
        } catch (cause) {
          if (mountedRef.current) {
            setRecordMessage('');
            setError(cause instanceof Error ? cause.message : 'No se pudo reconocer la frase.');
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
          <p className="lead">Escribe una frase breve en inglés. El modelo local prepara su significado en español; también puedes practicar con tu micrófono.</p>
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
            onChange={(event) => { setPhrase(event.currentTarget.value); setRecordMessage(''); }}
            placeholder="Escribe o pega aquí una frase corta en inglés…"
            aria-describedby="voice-count voice-helper"
          />
          <div className="voice-counter-row"><span id="voice-helper">La traducción aparece al terminar de escribir.</span><span id="voice-count">{phrase.length}/160</span></div>
          <div className="voice-actions">
            <AudioButton text={phrase} label="Escuchar mi fragmento" />
            <button className={`button ${isRecording ? 'button-danger' : 'button-outline'}`} type="button" onClick={isRecording ? stopRecording : startRecording} disabled={isRequestingMic}>
              <Icon name="mic" size={16} /> {isRequestingMic ? 'Esperando permiso…' : isRecording ? 'Detener y revisar' : 'Grabar mi voz'}
            </button>
          </div>
          {recordMessage && <p className="voice-record-status" role="status">{recordMessage}</p>}
          {error && <p className="error-notice" role="alert">{error}</p>}
          <p className="voice-microphone-note"><Icon name="shield" size={14} /> El micrófono solo se activa al pulsar «Grabar mi voz». La grabación se reconoce en este dispositivo y no se sube.</p>
        </section>

        <section className="surface-card voice-result-panel" aria-labelledby="voice-result-title">
          <span className="eyebrow"><Icon name="volume" size={13} /> TRADUCCIÓN Y PRONUNCIACIÓN</span>
          <h2 id="voice-result-title">Tu idea, en dos idiomas</h2>
          {phrase.trim() ? (
            <>
              <div className="voice-original"><span>INGLÉS</span><p>{phrase.trim()}</p></div>
              <div className="voice-translation"><span>ESPAÑOL</span>
                {isTranslating && !translation ? <p className="muted">{progressLabel(progress)}</p> : <p>{translation || 'Preparando una traducción local…'}</p>}
              </div>
              {translation && <AudioButton text={phrase.trim()} label="Escuchar pronunciación" />}
            </>
          ) : (
            <div className="voice-placeholder"><Icon name="sparkle" size={18} /><p>La traducción y la guía para escuchar aparecerán aquí.</p></div>
          )}
          {progress && progress.stage !== 'ready' && <div className="local-progress" role="status"><span>{progress.message}</span>{progress.percent !== undefined && <progress value={progress.percent} max={100} aria-label="Descarga del modelo" />}</div>}
        </section>
      </div>

      <div className="privacy-panel surface-card"><Icon name="shield" size={16} /><p><strong>Uso privado y responsable</strong><span>El clip y el texto se quedan temporalmente en esta página; nada se envía a un servicio de IA de pago. Los modelos públicos se descargan la primera vez y pueden guardarse en la caché del navegador. La rapidez depende de tu dispositivo y conexión.</span></p></div>
      <p className="model-credit">Modelos gratuitos y locales: <a href="https://huggingface.co/onnx-community/whisper-base.en" target="_blank" rel="noreferrer">Whisper Base English, ONNX</a> · <a href="https://huggingface.co/onnx-community/opus-mt-en-es" target="_blank" rel="noreferrer">OPUS-MT English–Spanish, CC BY 4.0</a>. Se descargan la primera vez; la descarga puede ocupar bastante espacio y requiere conexión, pero no consume créditos de IA ni envía el audio.</p>
    </div>
  );
}
