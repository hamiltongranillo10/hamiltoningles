import { useEffect, useMemo, useState } from 'react';
import { AudioButton } from '../components/AudioButton';
import { Icon } from '../components/Icons';
import type { AppView } from '../components/AppShell';
import { levels, type LevelData, type LevelId } from '../data/course';
import { answerMatches } from '../utils';

interface WorksheetViewProps {
  level: LevelData;
  answers: Record<string, string>;
  reviewed: boolean;
  onAnswer: (key: string, value: string) => void;
  onReview: (score: number) => void;
  onNavigate: (view: AppView) => void;
  onSelectLevel: (id: LevelId) => void;
}

export function WorksheetView({ level, answers, reviewed, onAnswer, onReview, onNavigate, onSelectLevel }: WorksheetViewProps) {
  const [showKey, setShowKey] = useState(false);
  const [includeKeyPrint, setIncludeKeyPrint] = useState(false);
  const [chosenWords, setChosenWords] = useState<number[]>([]);
  const workbook = level.workbook;
  const fillScore = useMemo(() => workbook.fill.filter((item) => answerMatches(answers[`${level.id}.${item.id}`] ?? '', item.answer)).length, [answers, level.id, workbook.fill]);
  const isTranslationCorrect = answerMatches(answers[`${level.id}.translation`] ?? '', workbook.translation.answer);
  const isOrderCorrect = answerMatches(answers[`${level.id}.order`] ?? '', workbook.order.answer);
  const isDictationCorrect = answerMatches(answers[`${level.id}.dictation`] ?? '', workbook.dictation.answer);
  const totalScore = fillScore + Number(isTranslationCorrect) + Number(isOrderCorrect) + Number(isDictationCorrect);
  const totalGraded = workbook.fill.length + 3;

  useEffect(() => {
    setShowKey(false);
    setIncludeKeyPrint(false);
    setChosenWords([]);
  }, [level.id]);

  function setField(name: string, value: string) {
    onAnswer(`${level.id}.${name}`, value);
  }

  function reviewSheet() { onReview(totalScore); }

  function clearSheet() {
    workbook.fill.forEach((item) => setField(item.id, ''));
    setField('translation', '');
    setField('order', '');
    setField('dictation', '');
    setField('writing', '');
    setChosenWords([]);
  }

  function addWord(index: number) {
    const next = [...chosenWords, index];
    setChosenWords(next);
    setField('order', next.map((item) => workbook.order.words[item]).join(' '));
  }

  function removeWord(position: number) {
    const next = chosenWords.filter((_, index) => index !== position);
    setChosenWords(next);
    setField('order', next.map((item) => workbook.order.words[item]).join(' '));
  }

  function fillInput(item: (typeof workbook.fill)[number], index: number) {
    const key = `${level.id}.${item.id}`;
    const [before, after = ''] = item.prompt.split('____');
    const correct = answerMatches(answers[key] ?? '', item.answer);
    return (
      <div className={`fill-row${reviewed ? (correct ? ' is-correct' : ' is-incorrect') : ''}`} key={item.id}>
        <span className="exercise-number">{String(index + 1).padStart(2, '0')}</span>
        <label className="fill-prompt" htmlFor={key}>{before}<input id={key} autoComplete="off" value={answers[key] ?? ''} onChange={(event) => setField(item.id, event.target.value)} placeholder="Tu respuesta" aria-label={`Ejercicio ${index + 1}: completa la frase`} /><span className="print-inline-answer" aria-hidden="true" />{after}</label>
        <span className="print-answer-space" aria-hidden="true" />
        {reviewed && <span className={`answer-mark ${correct ? 'good' : 'needs-work'}`}>{correct ? 'Correcta' : 'Revísala'}</span>}
      </div>
    );
  }

  return (
    <div className={`view-page worksheet-view${includeKeyPrint ? ' include-key-print' : ''}`}>
      <div className="section-heading worksheet-titlebar">
        <div><span className="eyebrow">CUADERNO DE PRÁCTICA · {level.cefr}</span><h1>Una hoja completa para esta lección</h1><p>Frases, ejercicios para completar, traducción y producción escrita según el nivel. Resuélvela aquí o imprímela para escribir a mano.</p></div>
        <button className="button button-primary print-button no-print" type="button" onClick={() => window.print()}><Icon name="print" size={16} /> Imprimir / Guardar PDF</button>
      </div>

      <div className="level-ribbon no-print"><span className={`level-badge level-${level.id}`}>{level.cefr}</span><strong>{level.module}</strong><span>{level.lessonTitle}</span><span className="ribbon-spacer" /><label className="ribbon-level-label">Cambiar nivel<select value={level.id} onChange={(event) => onSelectLevel(event.target.value as LevelId)} aria-label="Cambiar nivel de la hoja">{levels.map((item) => <option key={item.id} value={item.id}>{item.cefr} · {item.name}</option>)}</select></label><button type="button" className="text-button" onClick={() => onNavigate('lesson')}><Icon name="back" size={15} /> Lección</button></div>

      <div className="workbook-steps no-print">
        <div><span>01</span><strong>Aprende</strong><small>{level.phrases.length} frases y guía de pronunciación</small></div>
        <div><span>02</span><strong>Resuelve</strong><small>{workbook.fill.length + 3} ejercicios revisables</small></div>
        <div><span>03</span><strong>Produce</strong><small>Traducción y escritura para {level.cefr}</small></div>
      </div>

      <section className="workbook-sheet surface-card" id="worksheet-print-area">
        <div className="workbook-sheet-head">
          <div><span className="eyebrow">{level.module.toUpperCase()} · HOJA DE TRABAJO</span><h2>{workbook.title}</h2><p>{workbook.instructions}</p></div>
          <div className="worksheet-id"><span>NIVEL</span><strong>{level.cefr}</strong><span>{level.weeks}</span></div>
        </div>

        <div className="exercise-section workbook-learn-section">
          <div className="exercise-section-title"><span className="section-number">01</span><div><span className="eyebrow">REPASA</span><h3>Frases de la lección</h3></div></div>
          <div className="worksheet-phrase-grid">{level.phrases.slice(0, 4).map((phrase, index) => <div className="worksheet-phrase" key={phrase.english}><span>{String(index + 1).padStart(2, '0')}</span><strong>{phrase.english}</strong><small>{phrase.spanish}</small><em>Pronunciación aprox.: {phrase.pronunciation}</em></div>)}</div>
        </div>

        <div className="exercise-section">
          <div className="exercise-section-title"><span className="section-number">02</span><div><span className="eyebrow">RETO DE COMPLETAR</span><h3>Escribe la palabra que falta</h3><p>Responde y pulsa «Revisar» para ver tu resultado.</p></div></div>
          <div className="fill-list">{workbook.fill.map((item, index) => fillInput(item, index))}</div>
          <div className="print-writing-lines fill-print-lines" aria-hidden="true"><span /><span /><span /><span /></div>
        </div>

        <div className="exercise-section two-exercises">
          <div className="exercise-card">
            <div className="exercise-section-title"><span className="section-number">03</span><div><span className="eyebrow">TRADUCE</span><h3>Expresa esta idea</h3></div></div>
            <p className="prompt-quote">{workbook.translation.prompt}</p>
            <label className="field-label" htmlFor="translation-answer">Tu traducción en inglés</label>
            <textarea id="translation-answer" className="answer-textarea" rows={2} value={answers[`${level.id}.translation`] ?? ''} onChange={(event) => setField('translation', event.target.value)} placeholder="Escribe tu traducción…" />
            <span className="print-answer-space large" aria-hidden="true" />
            <p className="hint-text no-print"><Icon name="sparkle" size={14} /> Pista: {workbook.translation.hint}</p>
            {reviewed && <span className={`answer-mark ${isTranslationCorrect ? 'good' : 'needs-work'}`}>{isTranslationCorrect ? '¡Bien traducido!' : 'Revisa el orden y las palabras clave.'}</span>}
          </div>

          <div className="exercise-card">
            <div className="exercise-section-title"><span className="section-number">04</span><div><span className="eyebrow">ORDENA LA FRASE</span><h3>Construye una oración</h3></div></div>
            <p className="prompt-quote">{workbook.order.prompt}</p>
            <div className="word-answer-box" aria-live="polite">{chosenWords.length ? chosenWords.map((wordIndex, position) => <button key={`${wordIndex}-${position}`} type="button" className="chosen-word no-print" onClick={() => removeWord(position)} aria-label={`Quitar palabra ${workbook.order.words[wordIndex]}`}>{workbook.order.words[wordIndex]}</button>) : <span className="muted no-print">Pulsa las palabras para ordenarlas.</span>}{answers[`${level.id}.order`] && <span className="print-screen-answer">{answers[`${level.id}.order`]}</span>}</div>
            <div className="word-bank no-print">{workbook.order.words.map((word, index) => <button key={`${word}-${index}`} type="button" className="word-token" disabled={chosenWords.includes(index)} onClick={() => addWord(index)}>{word}</button>)}</div>
            <div className="print-answer-space large" aria-hidden="true" />
            <button className="text-button no-print" type="button" onClick={() => { setChosenWords([]); setField('order', ''); }}>Borrar frase</button>
            {reviewed && <span className={`answer-mark ${isOrderCorrect ? 'good' : 'needs-work'}`}>{isOrderCorrect ? 'Orden correcto' : 'Vuelve a revisar la estructura.'}</span>}
          </div>
        </div>

        <div className="exercise-section two-exercises">
          <div className="exercise-card dictation-card">
            <div className="exercise-section-title"><span className="section-number">05</span><div><span className="eyebrow">ESCUCHA Y ESCRIBE</span><h3>Dictado corto</h3></div></div>
            <p className="prompt-quote">{workbook.dictation.prompt}</p><AudioButton text={workbook.dictation.answer} />
            <label className="field-label" htmlFor="dictation-answer">Lo que escuchaste</label>
            <input id="dictation-answer" className="text-input" value={answers[`${level.id}.dictation`] ?? ''} onChange={(event) => setField('dictation', event.target.value)} placeholder="Escribe la frase en inglés…" />
            <span className="print-answer-space" aria-hidden="true" />
            {reviewed && <span className={`answer-mark ${isDictationCorrect ? 'good' : 'needs-work'}`}>{isDictationCorrect ? 'Dictado correcto' : 'Escucha otra vez y revisa.'}</span>}
          </div>
          <div className="exercise-card writing-card">
            <div className="exercise-section-title"><span className="section-number">06</span><div><span className="eyebrow">PRODUCE</span><h3>Ahora te toca a ti</h3></div></div>
            <p className="prompt-quote">{workbook.writing.prompt}</p>
            <label className="field-label" htmlFor="writing-answer">Tu respuesta</label>
            <textarea id="writing-answer" className="answer-textarea writing-textarea" rows={5} value={answers[`${level.id}.writing`] ?? ''} onChange={(event) => setField('writing', event.target.value)} placeholder="Escribe aquí…" />
            <div className="print-writing-lines" aria-hidden="true">{Array.from({ length: workbook.writing.lines }, (_, index) => <span key={index} />)}</div>
            <p className="hint-text">Esta respuesta es abierta; no hay una única solución correcta.</p>
          </div>
        </div>

        <div className="worksheet-footer"><span>English, paso a paso</span><span>{level.cefr} · {level.module}</span><span>Cuaderno de práctica</span></div>
      </section>

      <section className="workbook-controls surface-card no-print">
        <div className="review-actions"><button type="button" className="button button-primary" onClick={reviewSheet}><Icon name="check" size={16} /> Revisar respuestas</button><button type="button" className="button button-subtle" onClick={clearSheet}><Icon name="trash" size={15} /> Borrar respuestas</button>{reviewed && <span className="score-badge">{totalScore} / {totalGraded} correctas · {totalScore * 10} pts posibles</span>}</div>
        <div className="answer-options"><label className="check-control"><input type="checkbox" checked={showKey} onChange={(event) => setShowKey(event.target.checked)} /> Mostrar clave de respuestas</label><label className="check-control"><input type="checkbox" checked={includeKeyPrint} onChange={(event) => setIncludeKeyPrint(event.target.checked)} /> Incluir la clave al imprimir</label></div>
        {reviewed && <p className="review-feedback" role="status">Revisa las marcas en cada respuesta. La producción escrita se deja abierta para que puedas expresarte con tus propias palabras.</p>}
        {showKey && <div className="answer-key"><span className="eyebrow">CLAVE · {level.cefr}</span><h3>Respuestas sugeridas</h3><ol>{workbook.fill.map((item) => <li key={item.id}>{item.prompt.replace('____', item.answer)}</li>)}<li><strong>Traducción:</strong> {workbook.translation.answer}</li><li><strong>Orden:</strong> {workbook.order.answer}</li><li><strong>Dictado:</strong> {workbook.dictation.answer}</li><li><strong>Producción:</strong> {workbook.writing.sample}</li></ol></div>}
      </section>

      <div className="workbook-bottom-actions no-print"><button className="text-button" type="button" onClick={() => onNavigate('lesson')}><Icon name="back" size={16} /> Volver a aprender</button><button className="button button-outline" type="button" onClick={() => onNavigate('practice')}>Ir a práctica variada <Icon name="arrow" size={16} /></button></div>
    </div>
  );
}
