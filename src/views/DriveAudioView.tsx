import { useEffect, useRef, useState } from 'react';
import { AudioButton } from '../components/AudioButton';
import { Icon } from '../components/Icons';
import { createAudioModelClient, type AudioModelProgress, type AudioSegment } from '../audio-model-client';
import { decodeAudioForWhisper } from '../audio-input';
import { drivePreviewUrl, extractDriveFileId } from '../utils/drive';

function formatTime(value: number | null) {
  if (value === null || !Number.isFinite(value)) return '';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function DriveAudioView() {
  const clientRef = useRef<ReturnType<typeof createAudioModelClient> | null>(null);
  const mountedRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const [driveLink, setDriveLink] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [segments, setSegments] = useState<AudioSegment[]>([]);
  const [editedIds, setEditedIds] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [retranslatingId, setRetranslatingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<AudioModelProgress | null>(null);
  const fileId = extractDriveFileId(driveLink);

  useEffect(() => {
    mountedRef.current = true;
    const client = createAudioModelClient(setProgress);
    clientRef.current = client;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      client.dispose();
      clientRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!audioUrl) return undefined;
    return () => URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  function updateLink(value: string) {
    abortRef.current?.abort();
    abortRef.current = null;
    setDriveLink(value);
    setAuthorized(false);
    setAudioUrl('');
    setSegments([]);
    setEditedIds([]);
    setError('');
    setIsProcessing(false);
    setProgress(null);
  }

  async function transcribeAndTranslate() {
    if (!fileId || !authorized || isProcessing) return;
    const client = clientRef.current;
    if (!client) {
      setError('El modelo local aún se está iniciando. Espera un momento e inténtalo de nuevo.');
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setError('');
    setSegments([]);
    setEditedIds([]);
    setIsProcessing(true);
    setProgress({ stage: 'transcribing', message: 'Recuperando el archivo autorizado desde Drive…' });
    try {
      const response = await fetch('/api/drive/audio', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ driveUrl: driveLink.trim(), rightsConfirmed: authorized }),
        signal: controller.signal,
      });
      if (!response.ok) {
        let message = 'No se pudo recuperar el audio desde Drive.';
        try {
          const body = await response.json() as { error?: unknown };
          if (typeof body.error === 'string') message = body.error;
        } catch { /* Keep the safe default message. */ }
        throw new Error(message);
      }

      const audio = await response.blob();
      if (audio.size === 0) throw new Error('Drive entregó un archivo vacío.');
      if (!mountedRef.current) return;
      setAudioUrl(URL.createObjectURL(audio));
      setProgress({ stage: 'transcribing', message: 'Convirtiendo el audio en este navegador para el reconocimiento local…' });
      const samples = await decodeAudioForWhisper(audio);
      const result = await client.transcribeAndTranslate(samples);
      if (mountedRef.current) setSegments(result);
    } catch (cause) {
      if (mountedRef.current && !(cause instanceof DOMException && cause.name === 'AbortError')) {
        setError(cause instanceof Error ? cause.message : 'No se pudo transcribir este archivo.');
      }
    } finally {
      if (mountedRef.current) setIsProcessing(false);
      abortRef.current = null;
    }
  }

  function editSegment(id: number, text: string) {
    setSegments((current) => current.map((segment) => segment.id === id ? { ...segment, text } : segment));
    setEditedIds((current) => current.includes(id) ? current : [...current, id]);
  }

  async function retranslate(id: number) {
    const segment = segments.find((item) => item.id === id);
    const client = clientRef.current;
    if (!segment || !client || !segment.text.trim()) return;
    setRetranslatingId(id);
    setError('');
    try {
      const translation = await client.translate(segment.text.trim());
      if (!mountedRef.current) return;
      setSegments((current) => current.map((item) => item.id === id ? { ...item, translation } : item));
      setEditedIds((current) => current.filter((item) => item !== id));
    } catch (cause) {
      if (mountedRef.current) setError(cause instanceof Error ? cause.message : 'No se pudo traducir la línea corregida.');
    } finally {
      if (mountedRef.current) setRetranslatingId(null);
    }
  }

  return (
    <div className="view-page drive-audio-view">
      <div className="page-heading-row drive-heading">
        <div>
          <span className="eyebrow eyebrow-pill"><Icon name="music" size={13} /> SECCIÓN APARTE · TU AUDIO</span>
          <h1>Escucha y traduce desde Drive</h1>
          <p className="lead">Pega el enlace de un audio público. Tras confirmar que tienes permiso, se procesa localmente para mostrar inglés, español y pronunciación por segmento.</p>
        </div>
        <div className="voice-mark"><Icon name="music" size={22} /></div>
      </div>

      <div className="drive-audio-layout">
        <section className="surface-card drive-form-panel" aria-labelledby="drive-link-title">
          <label id="drive-link-title" className="field-label voice-label" htmlFor="drive-audio-link">ENLACE COMPARTIDO DE DRIVE</label>
          <input
            id="drive-audio-link"
            className="text-input drive-link-input"
            type="url"
            value={driveLink}
            disabled={isProcessing}
            onChange={(event) => updateLink(event.currentTarget.value)}
            placeholder="https://drive.google.com/file/d/…/view"
            autoComplete="url"
          />
          <p className="drive-helper">MP3, WAV, WebM, OGG o M4A · máximo 16 MiB · acceso «Cualquier persona con el enlace · Lector».</p>

          <label className="permission-card">
            <input type="checkbox" checked={authorized} onChange={(event) => setAuthorized(event.currentTarget.checked)} disabled={!fileId || isProcessing} />
            <span>Confirmo que el audio es mío, de dominio público o que tengo permiso para reproducirlo y procesarlo.</span>
          </label>
          {!fileId && driveLink.trim() && <p className="error-notice compact-error" role="status">Usa un enlace HTTPS de un archivo de Google Drive; no se admiten carpetas ni enlaces de otros sitios.</p>}
          <button className="button button-primary drive-submit" type="button" onClick={transcribeAndTranslate} disabled={!fileId || !authorized || isProcessing}>
            <Icon name="sparkle" size={15} /> {isProcessing ? 'Procesando localmente…' : 'Transcribir y traducir'}
          </button>
          {error && <p className="error-notice" role="alert">{error}</p>}
          {isProcessing && <div className="local-progress drive-progress" role="status"><span>{progress?.message ?? 'Procesando…'}</span>{progress?.percent !== undefined && <progress value={progress.percent} max={100} aria-label="Descarga del modelo" />}</div>}
          <div className="drive-privacy-note"><Icon name="shield" size={14} /><span>El archivo público pasa temporalmente por el servidor para entregarse al navegador; no se guarda. El audio no se envía a Gemini, GPT ni a otro servicio de inferencia. Los modelos locales se descargan la primera vez y pueden quedar en caché.</span></div>
        </section>

        <section className="surface-card drive-player-panel" aria-label="Reproductor de audio">
          {audioUrl ? (
            <div className="native-audio-player"><div className="voice-mark"><Icon name="music" size={21} /></div><strong>Tu audio</strong><audio controls src={audioUrl}>Tu navegador no puede reproducir este audio.</audio><span>El archivo está temporalmente en memoria en este dispositivo.</span></div>
          ) : fileId && authorized ? (
            <iframe title="Vista previa del audio compartido en Google Drive" src={drivePreviewUrl(fileId)} allow="autoplay" referrerPolicy="no-referrer" />
          ) : (
            <div className="drive-player-empty"><div className="voice-mark"><Icon name="music" size={22} /></div><strong>Tu reproductor aparecerá aquí</strong><p>Pega un enlace de Drive con acceso para lectores y confirma que tienes permiso.</p></div>
          )}
        </section>
      </div>

      {(isProcessing || segments.length > 0) && <section className="surface-card transcript-panel" aria-labelledby="transcript-title">
        <div className="transcript-heading"><div><span className="eyebrow">BORRADOR REVISABLE</span><h2 id="transcript-title">Inglés, español y pronunciación</h2></div><span className="level-badge level-a1">{segments.length || '…'} líneas</span></div>
        <p className="transcript-caveat">La música, el canto, los acentos y las voces superpuestas pueden provocar omisiones o errores. Puedes corregir el inglés y traducir de nuevo.</p>
        {segments.length > 0 ? <div className="transcript-list">{segments.map((segment) => <article className="transcript-row" key={segment.id}>
          <div className="transcript-row-top"><span className="transcript-number">{String(segment.id).padStart(2, '0')}</span>{segment.start !== null && <span className="transcript-time">{formatTime(segment.start)}</span>}</div>
          <label className="transcript-field"><span>INGLÉS RECONOCIDO</span><textarea rows={2} value={segment.text} onChange={(event) => editSegment(segment.id, event.currentTarget.value)} aria-label={`Línea ${segment.id} en inglés`} /></label>
          <div className="transcript-field transcript-translation"><span>ESPAÑOL</span><p>{segment.translation || 'Pulsa «Traducir de nuevo» para generar la traducción.'}</p></div>
          <div className="transcript-row-actions"><AudioButton compact text={segment.text} label="Escuchar pronunciación" /><button className="button button-outline button-small" type="button" onClick={() => void retranslate(segment.id)} disabled={retranslatingId !== null || !segment.text.trim()}><Icon name="sparkle" size={13} />{retranslatingId === segment.id ? 'Traduciendo…' : editedIds.includes(segment.id) ? 'Traducir cambios' : 'Traducir de nuevo'}</button></div>
        </article>)}</div> : <div className="transcript-wait"><span className="loading-dot" /><p>{progress?.message ?? 'Cargando y preparando el modelo local…'}</p></div>}
      </section>}

      <div className="privacy-panel surface-card"><Icon name="shield" size={16} /><p><strong>Permiso y privacidad</strong><span>Procesa solo audio que sea tuyo, de dominio público o cuyo uso tengas autorizado. El archivo y las líneas de resultado no se guardan en base de datos ni en el servidor; desaparecen al cerrar o recargar esta página. La inferencia se ejecuta en el navegador y la caché del modelo depende de su configuración.</span></p></div>
      <p className="model-credit">Modelos gratuitos y locales: <a href="https://huggingface.co/onnx-community/whisper-base.en" target="_blank" rel="noreferrer">Whisper Base English, ONNX</a> · <a href="https://huggingface.co/onnx-community/opus-mt-en-es" target="_blank" rel="noreferrer">OPUS-MT English–Spanish, ONNX (CC BY 4.0)</a>. Se descargan la primera vez; la descarga puede ocupar bastante espacio y requiere conexión, pero no consume créditos de IA ni envía el audio a un servicio de inferencia.</p>
    </div>
  );
}
