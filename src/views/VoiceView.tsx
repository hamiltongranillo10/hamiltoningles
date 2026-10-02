import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { AudioButton } from '../components/AudioButton';
import { Icon } from '../components/Icons';
import { createAudioModelClient, type AudioModelProgress } from '../audio-model-client';
import { createBrowserTranslator } from '../browser-translator';
import { decodeAudioForWhisper } from '../audio-input';
import { conversationTopics, getConversationTopic, topicsForLevel, type ConversationTopic } from '../data/conversations';
import type { LevelId } from '../data/course';
import { readStored, writeStored } from '../utils';

const MAX_RECORDING_SECONDS = 20;
const MAX_MIC_AUDIO_BYTES = 10 * 1024 * 1024;
type TranslationEngine = 'browser' | 'local';

type ConversationMessage = { id: number; speaker: 'companion' | 'you'; english: string; translation: string; tip?: string; correction?: string };
type ConversationSession = { id: number; topicId: string; level: LevelId; title: string; turns: number; corrections: number; startedAt: string; endedAt: string };

const conversationHistoryKey = 'ingles-demo.conversation-history';
const conversationLevelKey = 'ingles-demo.conversation-level';
const conversationTopicKey = 'ingles-demo.conversation-topic';
const validLevels: LevelId[] = ['a1', 'a2', 'b1', 'b2', 'c1'];

function initialConversationPreferences() {
  const storedLevel = readStored<string>(conversationLevelKey, 'a1');
  const level = validLevels.includes(storedLevel as LevelId) ? storedLevel as LevelId : 'a1';
  const storedTopic = readStored<string>(conversationTopicKey, 'a1-introductions');
  const topic = conversationTopics.find((item) => item.id === storedTopic && item.level === level) ?? topicsForLevel(level)[0];
  return { level, topicId: topic.id };
}

function correctionFor(text: string): string | undefined {
  const clean = text.trim();
  const rules: Array<[RegExp, string]> = [
    [/\bi have (\d+) years\b/i, 'Para la edad usamos “I am $1 years old.”'],
    [/\bshe go to\b/i, 'Con she/he/it, usa la tercera persona: “She goes to…”'],
    [/\bi am agree\b/i, 'La expresión natural es “I agree.”'],
    [/\bpeople is\b/i, 'People es plural: “People are…”'],
    [/\bhe have\b/i, 'Con he/she/it usamos has: “He has…”'],
  ];
  const match = rules.find(([pattern]) => pattern.test(clean));
  return match ? clean.replace(match[0], match[1]) : undefined;
}

function starterForTopic(topic: ConversationTopic): ConversationMessage[] {
  return [{ id: Date.now(), speaker: 'companion', english: topic.opening, translation: topic.openingTranslation, tip: topic.prompts[0] }];
}

function correctionLabel(count: number): string {
  return `${count} corrección${count === 1 ? '' : 'es'}`;
}

function progressLabel(progress: AudioModelProgress | null) {
  return progress?.message ?? 'El traductor se prepara al usarlo por primera vez.';
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo traducir en este dispositivo.';
}

async function requestConversationReply(level: LevelId, topic: ConversationTopic, messages: ConversationMessage[]) {
  const response = await fetch('/api/conversation', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      level,
      topic: topic.title,
      messages: messages.slice(-12).map((message) => ({
        role: message.speaker === 'you' ? 'user' : 'assistant',
        content: message.english,
      })),
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload.error === 'string' ? payload.error : 'La IA conversacional no pudo responder.');
  return payload as { reply: string; translation?: string; correction?: string; tip?: string };
}

export function VoiceView() {
  const initialPreferences = initialConversationPreferences();
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
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>(() => starterForTopic(getConversationTopic(initialPreferences.topicId)));
  const [conversationInput, setConversationInput] = useState('');
  const [conversationStatus, setConversationStatus] = useState('');
  const [isConversationRecording, setIsConversationRecording] = useState(false);
  const [conversationLevel, setConversationLevel] = useState<LevelId>(initialPreferences.level);
  const [conversationTopicId, setConversationTopicId] = useState(initialPreferences.topicId);
  const [conversationHistory, setConversationHistory] = useState<ConversationSession[]>(() => {
    const stored = readStored<unknown>(conversationHistoryKey, []);
    return Array.isArray(stored) ? stored.filter((item): item is ConversationSession => Boolean(item && typeof item === 'object' && 'id' in item && 'title' in item && 'level' in item)) : [];
  });
  const [conversationTurns, setConversationTurns] = useState(0);
  const [conversationCorrections, setConversationCorrections] = useState(0);
  const [pronunciationFeedback, setPronunciationFeedback] = useState('');
  const conversationStartedAtRef = useRef(new Date().toISOString());
  const conversationTopic = getConversationTopic(conversationTopicId);

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

  useEffect(() => { writeStored(conversationHistoryKey, conversationHistory); }, [conversationHistory]);
  useEffect(() => { writeStored(conversationLevelKey, conversationLevel); }, [conversationLevel]);
  useEffect(() => { writeStored(conversationTopicKey, conversationTopicId); }, [conversationTopicId]);

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

  function speakCompanion(text: string) {
    if (!('speechSynthesis' in window)) {
      setConversationStatus('Este navegador no ofrece lectura en voz alta.');
      return;
    }
    window.speechSynthesis.cancel();
    const voice = window.speechSynthesis.getVoices().find((item) => /ryan|daniel|george|male|guy/i.test(item.name) && /en[-_]gb|en[-_]us/i.test(item.lang))
      ?? window.speechSynthesis.getVoices().find((item) => /en[-_]gb|en[-_]us/i.test(item.lang));
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice?.lang ?? 'en-GB';
    if (voice) utterance.voice = voice;
    utterance.pitch = 0.78;
    utterance.rate = 0.88;
    utterance.onstart = () => setConversationStatus('Reproduciendo con la voz del compañero.');
    utterance.onend = () => setConversationStatus('');
    utterance.onerror = () => setConversationStatus('No se pudo reproducir esta frase.');
    window.speechSynthesis.speak(utterance);
  }

  async function addConversationMessage(text: string) {
    const clean = text.trim().slice(0, 160);
    if (!clean) return;
    const id = Date.now();
    const correction = correctionFor(clean);
    setConversationMessages((current) => [...current, { id, speaker: 'you', english: clean, translation: 'Traduciendo…', correction }]);
    setConversationInput('');
    setConversationTurns((current) => current + 1);
    if (correction) setConversationCorrections((current) => current + 1);
    setConversationHistory((current) => [{ id, topicId: conversationTopic.id, level: conversationLevel, title: conversationTopic.title, turns: conversationTurns + 1, corrections: conversationCorrections + (correction ? 1 : 0), startedAt: conversationStartedAtRef.current, endedAt: new Date().toISOString() }, ...current].slice(0, 20));
    setConversationStatus('Traduciendo y preparando la respuesta de la IA…');
    try {
      const result = await translateWithFallback(clean);
      setConversationMessages((current) => current.map((message) => message.id === id ? { ...message, translation: result.translation } : message));
      const reply = await requestConversationReply(conversationLevel, conversationTopic, [...conversationMessages, { id, speaker: 'you', english: clean, translation: result.translation, correction }]);
      setConversationMessages((current) => [...current, {
        id: Date.now(),
        speaker: 'companion',
        english: reply.reply,
        translation: reply.translation || 'Traducción no disponible.',
        correction: reply.correction || undefined,
        tip: reply.tip || undefined,
      }]);
      setConversationStatus('');
    } catch {
      setConversationMessages((current) => current.map((message) => message.id === id ? { ...message, translation: 'Traducción no disponible; puedes continuar la conversación.' } : message));
      setConversationStatus('No se pudo obtener una respuesta de la IA. Revisa la configuración del servidor e inténtalo de nuevo.');
    }
  }

  function submitConversation(event: FormEvent) {
    event.preventDefault();
    void addConversationMessage(conversationInput);
  }

  function changeConversationLevel(level: LevelId) {
    const firstTopic = topicsForLevel(level)[0];
    if (!firstTopic) return;
    setConversationLevel(level);
    setConversationTopicId(firstTopic.id);
    setConversationMessages(starterForTopic(firstTopic));
    setConversationTurns(0);
    setConversationCorrections(0);
    setPronunciationFeedback('');
    conversationStartedAtRef.current = new Date().toISOString();
  }

  function changeConversationTopic(topicId: string) {
    const nextTopic = getConversationTopic(topicId);
    setConversationTopicId(nextTopic.id);
    setConversationLevel(nextTopic.level);
    setConversationMessages(starterForTopic(nextTopic));
    setConversationTurns(0);
    setConversationCorrections(0);
    setPronunciationFeedback('');
    conversationStartedAtRef.current = new Date().toISOString();
  }

  async function startRecording(target: 'translator' | 'conversation' = 'translator') {
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
        if (mountedRef.current) setIsConversationRecording(false);

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
          if (target === 'conversation') {
            const wordCount = recognized.split(/\s+/).filter(Boolean).length;
            const clarity = Math.min(98, Math.max(58, 58 + wordCount * 4));
            setPronunciationFeedback(`Claridad estimada: ${clarity}%. El navegador reconoció ${wordCount} palabra${wordCount === 1 ? '' : 's'}; repite la frase más despacio si quieres mejorarla.`);
            await addConversationMessage(recognized);
            return;
          }
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
      setIsConversationRecording(target === 'conversation');
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

      <section className="surface-card conversation-workspace" aria-labelledby="conversation-title">
        <div className="conversation-heading">
          <div>
            <span className="eyebrow"><Icon name="mic" size={12} /> CONVERSACIÓN LIBRE · CON VOZ MASCULINA</span>
            <h2 id="conversation-title">Platica de lo que quieras</h2>
            <p>Elige un nivel y un tema. El compañero sigue el hilo, responde en inglés natural, muestra una traducción breve y te corrige solo cuando ayuda.</p>
          </div>
          <span className="conversation-badge"><span className="status-dot" />Chat abierto</span>
        </div>

        <div className="conversation-filters" aria-label="Configuración de conversación">
          <label>Nivel<select value={conversationLevel} onChange={(event) => changeConversationLevel(event.currentTarget.value as LevelId)}><option value="a1">A1 · Base</option><option value="a2">A2 · Cotidiano</option><option value="b1">B1 · Autónomo</option><option value="b2">B2 · Fluidez</option><option value="c1">C1 · Avanzado</option></select></label>
          <label>Tema<select value={conversationTopic.id} onChange={(event) => changeConversationTopic(event.currentTarget.value)}>{topicsForLevel(conversationLevel).map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}</select></label>
          <div className="conversation-topic-note"><strong>{conversationTopic.title}</strong><span>{conversationTopic.description}</span></div>
        </div>

        <div className="companion-voice-card">
          <div><span className="eyebrow">VOZ DEL COMPAÑERO</span><strong>Microsoft Ryan Online (Natural) — English (United Kingdom)</strong><small>Las voces disponibles vienen del dispositivo o navegador.</small></div>
          <button className="button button-subtle button-small" type="button" onClick={() => speakCompanion('Hello, Hamilton. What would you like to practice today?')}><Icon name="volume" size={13} /> Probar voz</button>
        </div>

        <div className="conversation-thread" aria-live="polite">
          {conversationMessages.map((message) => (
            <article className={`chat-message ${message.speaker === 'you' ? 'chat-message-you' : 'chat-message-companion'}`} key={message.id}>
              <div className="chat-message-meta"><span>{message.speaker === 'you' ? 'TÚ' : 'COMPAÑERO IA'}</span>{message.speaker === 'companion' && <button className="text-button" type="button" onClick={() => speakCompanion(message.english)}><Icon name="volume" size={12} /> Escuchar</button>}</div>
              <p className="chat-english">{message.english}</p>
              <p className="chat-translation">{message.translation}</p>
              {message.correction && <p className="chat-correction"><strong>Corrección:</strong> {message.correction}</p>}
              {message.tip && <p className="chat-tip"><strong>Consejo:</strong> {message.tip}</p>}
            </article>
          ))}
        </div>

        <form className="conversation-composer" onSubmit={submitConversation}>
          <label htmlFor="conversation-language">Hablar en:</label>
          <select id="conversation-language" defaultValue="en"><option value="en">Inglés</option><option value="es">Español</option></select>
          <textarea value={conversationInput} onChange={(event) => setConversationInput(event.currentTarget.value)} placeholder="Escribe lo que quieras preguntarle…" rows={2} maxLength={160} />
          <button className="button button-subtle button-small" type="submit" disabled={!conversationInput.trim()}>Enviar</button>
          <button className={`button button-primary button-small ${isConversationRecording ? 'button-danger' : ''}`} type="button" onClick={isConversationRecording ? stopRecording : () => void startRecording('conversation')} disabled={isRequestingMic}><Icon name="mic" size={13} /> {isRequestingMic ? 'Permiso…' : isConversationRecording ? 'Detener' : 'Hablar'}</button>
        </form>
        {conversationStatus && <p className="conversation-status" role="status">{conversationStatus}</p>}
        {pronunciationFeedback && <p className="pronunciation-feedback" role="status"><Icon name="mic" size={13} /><span><strong>Pronunciación orientativa</strong>{pronunciationFeedback}</span></p>}
        <p className="conversation-note">Puedes hablar en inglés o español. El compañero convierte tu respuesta al idioma de práctica y el audio no se sube.</p>
      </section>

      <section className="conversation-progress-grid" aria-label="Progreso de conversación">
        <div className="surface-card conversation-progress-card"><span className="eyebrow">ESTA PRÁCTICA</span><strong>{conversationTurns} <small>turnos</small></strong><p>{correctionLabel(conversationCorrections)} detectada{conversationCorrections === 1 ? '' : 's'}.</p></div>
        <div className="surface-card conversation-history-card"><div className="history-heading"><span className="eyebrow">HISTORIAL LOCAL</span><strong>{conversationHistory.length} registro{conversationHistory.length === 1 ? '' : 's'}</strong></div>{conversationHistory.length === 0 ? <p>Aquí aparecerán tus prácticas y correcciones. Se guardan solo en este dispositivo.</p> : <ul>{conversationHistory.slice(0, 4).map((session) => <li key={session.id}><span>{session.level.toUpperCase()} · {session.title}</span><small>{session.turns} turnos · {correctionLabel(session.corrections)}</small></li>)}</ul>}</div>
      </section>

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
            <button className={`button ${isRecording ? 'button-danger' : 'button-outline'}`} type="button" onClick={isRecording ? stopRecording : () => void startRecording()} disabled={isRequestingMic}>
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
