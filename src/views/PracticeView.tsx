import { useEffect, useMemo, useState } from 'react';
import { AudioButton } from '../components/AudioButton';
import { Icon } from '../components/Icons';
import { LevelPicker } from '../components/LevelPicker';
import type { LevelData, LevelId } from '../data/course';
import { answerMatches } from '../utils';

type Mode = 'translation' | 'order' | 'dictation';

interface PracticeViewProps {
  level: LevelData;
  selectedLevel: LevelId;
  onSelectLevel: (id: LevelId) => void;
  points: number;
  favorites: string[];
  onToggleFavorite: (text: string) => void;
  onAwardPoints: (points: number) => void;
}

function makeScramble(phrase: string, round: number): string[] {
  const words = phrase.match(/[^\s]+/g) ?? [];
  if (words.length < 2) return words;
  const shift = (round % (words.length - 1)) + 1;
  return [...words.slice(shift), ...words.slice(0, shift)];
}

const modes: { id: Mode; label: string; icon: 'book' | 'practice' | 'volume' }[] = [
  { id: 'translation', label: 'Español → inglés', icon: 'book' },
  { id: 'order', label: 'Ordena la frase', icon: 'practice' },
  { id: 'dictation', label: 'Dictado', icon: 'volume' },
];

export function PracticeView({ level, selectedLevel, onSelectLevel, points, favorites, onToggleFavorite, onAwardPoints }: PracticeViewProps) {
  const [mode, setMode] = useState<Mode>('translation');
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selectedWords, setSelectedWords] = useState<number[]>([]);
  const [correct, setCorrect] = useState(false);
  const [message, setMessage] = useState('');
  const phrase = level.phrases[(round - 1 + level.phrases.length) % level.phrases.length]!;
  const custom = round === 0 ? level.practice[mode] : null;
  const expected = custom?.answer ?? phrase.english;
  const prompt = mode === 'translation' ? (custom?.prompt ?? phrase.spanish) : mode === 'order' ? (custom?.prompt ?? 'Ordena las palabras para formar la frase en inglés.') : (custom?.prompt ?? 'Escucha la frase y escríbela en inglés.');
  const tokens = useMemo(() => {
    if (mode === 'order' && round === 0) return level.practice.order.words;
    return makeScramble(round === 0 ? level.phrases[0]!.english : phrase.english, round + 1);
  }, [level.phrases, level.practice.order.words, mode, phrase.english, round]);
  const displayOrder = selectedWords.map((index) => tokens[index]).join(' ');
  const [completedRounds, setCompletedRounds] = useState<number[]>(() => {
    try { return JSON.parse(window.localStorage.getItem(`practice-done:${level.id}:${mode}`) ?? '[]') as number[]; } catch { return []; }
  });

  useEffect(() => {
    setRound(0); setAnswer(''); setSelectedWords([]); setCorrect(false); setMessage('');
    try { setCompletedRounds(JSON.parse(window.localStorage.getItem(`practice-done:${level.id}:${mode}`) ?? '[]') as number[]); } catch { setCompletedRounds([]); }
  }, [level.id, mode]);

  function checkAnswer() {
    const submitted = mode === 'order' ? displayOrder : answer;
    if (answerMatches(submitted, expected)) {
      setCorrect(true);
      setMessage('¡Correcto! Buen trabajo.');
      if (!completedRounds.includes(round)) {
        const next = [...completedRounds, round];
        setCompletedRounds(next);
        try { window.localStorage.setItem(`practice-done:${level.id}:${mode}`, JSON.stringify(next)); } catch { /* progress is optional */ }
        onAwardPoints(10);
      }
    } else {
      setCorrect(false);
      setMessage('Casi. Vuelve a escuchar o revisa el orden de las palabras.');
    }
  }

  function nextRound() {
    setRound((value) => (value + 1) % 5);
    setAnswer(''); setSelectedWords([]); setCorrect(false); setMessage('');
  }

  function addWord(index: number) { setSelectedWords((current) => [...current, index]); }
  function removeWord(position: number) { setSelectedWords((current) => current.filter((_, index) => index !== position)); }

  const currentPhrase = mode === 'dictation' && round > 0 ? phrase.english : (custom?.answer ?? level.phrases[0]!.english);
  const inputId = `practice-answer-${mode}`;

  return (
    <div className="view-page practice-view">
      <div className="section-heading practice-heading">
        <div><span className="eyebrow">PRÁCTICA ESCRITA VARIADA · {level.cefr}</span><h1>Escucha, escribe y construye frases</h1><p>Un espacio aparte para practicar lo aprendido. Cambia de nivel o de actividad cuando quieras.</p></div>
        <div className="points-card practice-points"><span>PUNTOS DE PRÁCTICA</span><strong>{points} <small>XP</small></strong><span>Se guardan en este dispositivo</span></div>
      </div>
      <div className="practice-toolbar surface-card"><div><span className="eyebrow">NIVEL ACTUAL</span><p>{level.cefr} · {level.module}</p></div><LevelPicker value={selectedLevel} onChange={onSelectLevel} compact /><span className="practice-demo-tag"><span className="status-dot" /> Actividad local de demostración</span></div>

      <div className="practice-layout">
        <section className="practice-workspace surface-card">
          <div className="practice-round-top"><div><span className="eyebrow">RONDA DE PRÁCTICA</span><h2>{round + 1} <span>/ 5</span></h2></div><div className="round-progress"><div><i style={{ width: `${(completedRounds.length / 5) * 100}%` }} /></div><span>{completedRounds.length} de 5 actividades resueltas</span></div></div>
          <div className="mode-tabs" role="tablist" aria-label="Tipo de práctica">
            {modes.map((item) => <button key={item.id} type="button" role="tab" aria-selected={mode === item.id} className={`mode-tab${mode === item.id ? ' is-active' : ''}`} onClick={() => setMode(item.id)}><Icon name={item.icon} size={15} />{item.label}</button>)}
          </div>

          <div className="practice-prompt-card">
            <div className="practice-prompt-heading"><span className="eyebrow">{mode === 'translation' ? 'TRADUCE AL INGLÉS' : mode === 'order' ? 'ORDENA LAS PALABRAS' : 'ESCUCHA Y ESCRIBE'}</span><span className={`level-badge level-mini level-${level.id}`}>{level.cefr}</span></div>
            <h3>{mode === 'translation' ? '¿Cómo expresarías esta idea?' : mode === 'order' ? 'Construye una frase natural' : 'Escribe lo que escuchas'}</h3>
            <p className="prompt-quote">{prompt}</p>
            {mode === 'order' ? (
              <div className="order-builder">
                <div className="word-answer-box practice-word-box" aria-live="polite">{selectedWords.length ? selectedWords.map((wordIndex, position) => <button key={`${wordIndex}-${position}`} type="button" className="chosen-word" onClick={() => removeWord(position)}>{tokens[wordIndex]}</button>) : <span className="muted">Pulsa las palabras para construir la frase.</span>}</div>
                <div className="word-bank">{tokens.map((word, index) => <button key={`${word}-${index}`} type="button" className="word-token" disabled={selectedWords.includes(index)} onClick={() => addWord(index)}>{word}</button>)}</div>
              </div>
            ) : (
              <div className="practice-answer-area">
                {mode === 'dictation' && <div className="dictation-player"><AudioButton text={currentPhrase} /><span>La voz, si está disponible, proviene del dispositivo.</span></div>}
                <label className="field-label" htmlFor={inputId}>{mode === 'translation' ? 'Tu traducción en inglés' : 'Tu respuesta'}</label>
                <input id={inputId} className="text-input" value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !correct) checkAnswer(); }} placeholder={mode === 'translation' ? 'Escribe la traducción…' : 'Escribe lo que escuchaste…'} />
              </div>
            )}
            <div className="practice-submit-row"><button type="button" className="button button-primary" onClick={checkAnswer} disabled={correct}>{correct ? <><Icon name="check" size={16} /> Correcto</> : 'Comprobar'}</button><button type="button" className="button button-subtle" onClick={() => { setAnswer(''); setSelectedWords([]); setCorrect(false); setMessage(''); }}>Borrar</button><span className="round-hint">Pista: usa el contexto de {level.cefr}.</span></div>
            {message && <div className={`practice-feedback${correct ? ' success' : ''}`} role="status">{message}{correct && <button type="button" className="text-button" onClick={nextRound}>Siguiente ejercicio <Icon name="arrow" size={14} /></button>}</div>}
          </div>
          <p className="practice-note">La ronda usa ejemplos de «{level.lessonTitle}». Los puntos y aciertos son de demostración, no una certificación de nivel.</p>
        </section>

        <aside className="mini-lab surface-card">
          <div className="lab-heading"><div className="info-icon mint"><Icon name="sparkle" size={17} /></div><span className="eyebrow">TU MINI LABORATORIO</span></div>
          <h2>Tus palabras, tu ritmo</h2><p>Escribe una palabra o frase corta en inglés y escúchala hasta que te suene natural.</p>
          <form className="lab-form" onSubmit={(event) => { event.preventDefault(); const input = (event.currentTarget.elements.namedItem('lab-phrase') as HTMLInputElement); const phraseText = input.value.trim(); if (phraseText) { onToggleFavorite(phraseText); input.value = ''; } }}>
            <label className="sr-only" htmlFor="lab-phrase">Frase en inglés para guardar</label><input id="lab-phrase" name="lab-phrase" className="text-input" placeholder="Ej. Could you help me?" maxLength={120} /><button type="submit" className="icon-button" aria-label="Guardar frase"><Icon name="bookmark" size={17} /></button>
          </form>
          <p className="lab-local-note">Las frases se guardan solo en este dispositivo.</p>
          <div className="lab-divider" />
          <div className="saved-header"><div><span className="eyebrow">MI LISTA GUARDADA</span><h3>{favorites.length} / 12</h3></div><span className="saved-count-label">EXPRESIONES</span></div>
          {favorites.length === 0 ? <div className="saved-empty"><Icon name="bookmark" size={18} /><p>Guarda aquí expresiones que quieras volver a practicar.</p></div> : <ul className="saved-list">{favorites.map((favorite) => <li key={favorite}><span>{favorite}</span><AudioButton text={favorite} compact label="Escuchar expresión" /><button type="button" className="icon-button icon-button-small" aria-label={`Quitar ${favorite}`} onClick={() => onToggleFavorite(favorite)}><Icon name="trash" size={14} /></button></li>)}</ul>}
          <div className="lab-tip"><Icon name="sparkle" size={15} /><span>Escucha primero, intenta decirlo tú y luego compárate con el modelo.</span></div>
        </aside>
      </div>
      <div className="practice-separation-note"><Icon name="book" size={17} /><p><strong>¿Buscas una hoja para resolver?</strong><span>Vuelve a Lecciones y abre el cuaderno vinculado a cada nivel.</span></p></div>
    </div>
  );
}
