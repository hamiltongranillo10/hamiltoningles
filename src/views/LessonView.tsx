import { AudioButton } from '../components/AudioButton';
import { Icon } from '../components/Icons';
import { LevelPicker } from '../components/LevelPicker';
import type { AppView } from '../components/AppShell';
import { levels, type LevelData, type LevelId } from '../data/course';

interface LessonViewProps {
  level: LevelData;
  selectedLevel: LevelId;
  onSelectLevel: (id: LevelId) => void;
  onNavigate: (view: AppView) => void;
  completed: boolean;
}

export function LessonView({ level, selectedLevel, onSelectLevel, onNavigate, completed }: LessonViewProps) {
  const levelIndex = levels.findIndex((item) => item.id === level.id) + 1;

  return (
    <div className="view-page lesson-view">
      <div className="section-heading level-heading">
        <div><span className="eyebrow">LECCIONES · RUTA A1–C1</span><h1>Aprende a tu ritmo</h1><p>Esta pantalla es solo para entender el contenido. Los ejercicios están en una hoja aparte.</p></div>
        <LevelPicker value={selectedLevel} onChange={onSelectLevel} compact />
      </div>

      <div className="lesson-meta-line"><span className={`level-badge level-${level.id}`}>{level.cefr}</span><span>{level.module}</span><Icon name="chevron" size={14} /><span>Lección modelo</span><span className="meta-spacer" />{completed && <span className="completed-pill"><Icon name="check" size={14} /> Hoja revisada</span>}</div>
      <div className="lesson-title-row"><div><span className="eyebrow">{level.topic}</span><h2>{level.lessonTitle}</h2><p>{level.objective}</p></div><button type="button" className="button button-primary" onClick={() => onNavigate('worksheet')}>Abrir hoja de trabajo <Icon name="arrow" size={16} /></button></div>

      <div className="lesson-layout">
        <div className="lesson-main-column">
          <section className="lesson-section surface-card">
            <div className="section-label"><span className="section-number">01</span><div><span className="eyebrow">APRENDE</span><h3>La idea principal</h3></div></div>
            <p className="lesson-explanation">{level.explanation}</p>
            <div className="grammar-note"><span className="note-label">GRAMÁTICA EN CONTEXTO</span><p>{level.grammar}</p></div>
          </section>

          <section className="lesson-section phrase-section surface-card">
            <div className="section-label"><span className="section-number">02</span><div><span className="eyebrow">FRASES DEL MÓDULO</span><h3>Escucha y entiende</h3></div></div>
            <p className="section-description">La guía de pronunciación es aproximada; escucha la voz del dispositivo si está disponible.</p>
            <div className="phrase-list">
              {level.phrases.map((phrase, index) => (
                <article key={phrase.english} className="phrase-row">
                  <span className="phrase-index">{String(index + 1).padStart(2, '0')}</span>
                  <div className="phrase-copy"><strong>{phrase.english}</strong><span>{phrase.spanish}</span><small>Pronunciación aproximada: {phrase.pronunciation}</small></div>
                  <AudioButton text={phrase.english} compact label="Escuchar frase" />
                </article>
              ))}
            </div>
          </section>

          <section className="lesson-section vocabulary-section surface-card">
            <div className="section-label"><span className="section-number">03</span><div><span className="eyebrow">VOCABULARIO</span><h3>Palabras para esta lección</h3></div></div>
            <div className="vocabulary-chips">{level.vocabulary.map((word) => <span key={word} className="vocabulary-chip">{word}</span>)}</div>
          </section>
        </div>

        <aside className="lesson-aside">
          <section className="lesson-checklist surface-card">
            <span className="eyebrow">AL TERMINAR PODRÁS</span>
            <h3>Tu objetivo de aprendizaje</h3>
            <ul><li><Icon name="check" size={15} /> Entender las frases clave.</li><li><Icon name="check" size={15} /> Identificar la estructura nueva.</li><li><Icon name="check" size={15} /> Usarla en una situación propia.</li></ul>
            <div className="aside-rule" />
            <span className="eyebrow">UNIDAD {String(levelIndex).padStart(2, '0')} · {level.cefr}</span>
            <h3>{level.module}</h3>
            <p>Una unidad de muestra para revisar la separación entre contenido, hoja de trabajo y práctica.</p>
          </section>
          <section className="workbook-callout">
            <div className="workbook-callout-top"><div className="info-icon lavender"><Icon name="print" size={18} /></div><span className="eyebrow">CUADERNO DE PRÁCTICA</span></div>
            <h3>Comprueba lo aprendido</h3>
            <p>Completa ejercicios del nivel {level.cefr}. Puedes responder aquí o imprimir la hoja en A4.</p>
            <button type="button" className="button button-primary button-full" onClick={() => onNavigate('worksheet')}>Resolver la hoja <Icon name="arrow" size={16} /></button>
            <span className="small-safe-note">La clave de respuestas es opcional.</span>
          </section>
        </aside>
      </div>
    </div>
  );
}
