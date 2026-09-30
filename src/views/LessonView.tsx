import { AudioButton } from '../components/AudioButton';
import { Icon } from '../components/Icons';
import { LevelPicker } from '../components/LevelPicker';
import type { AppView } from '../components/AppShell';
import { levels, type LevelData, type LevelId } from '../data/course';
import { getUnit, unitsForLevel } from '../data/curriculum';

interface LessonViewProps {
  level: LevelData;
  selectedLevel: LevelId;
  selectedUnitId: string;
  onSelectLevel: (id: LevelId) => void;
  onSelectUnit: (id: string) => void;
  onNavigate: (view: AppView) => void;
  completed: boolean;
}

export function LessonView({ level, selectedLevel, selectedUnitId, onSelectLevel, onSelectUnit, onNavigate, completed }: LessonViewProps) {
  const levelIndex = levels.findIndex((item) => item.id === level.id) + 1;
  const units = unitsForLevel(level.id);
  const activeUnit = getUnit(level.id, selectedUnitId);

  return (
    <div className="view-page lesson-view">
      <div className="section-heading level-heading">
        <div><span className="eyebrow">LECCIONES · RUTA A1–C1</span><h1>Aprende a tu ritmo</h1><p>Esta pantalla es solo para entender el contenido. Los ejercicios están en una hoja aparte.</p></div>
        <LevelPicker value={selectedLevel} onChange={onSelectLevel} compact />
      </div>

      <div className="lesson-meta-line"><span className={`level-badge level-${level.id}`}>{level.cefr}</span><span>{level.module}</span><Icon name="chevron" size={14} /><span>Unidad {activeUnit.number} de 8</span><span className="meta-spacer" />{completed && <span className="completed-pill"><Icon name="check" size={14} /> Hoja revisada</span>}</div>
      <div className="lesson-title-row"><div><span className="eyebrow">{activeUnit.topic}</span><h2>{activeUnit.title}</h2><p>{activeUnit.objective}</p></div><button type="button" className="button button-primary" onClick={() => onNavigate('worksheet')}>Abrir hoja de trabajo <Icon name="arrow" size={16} /></button></div>

      <section className="unit-roadmap surface-card" aria-label={`Unidades del nivel ${level.cefr}`}>
        <div className="unit-roadmap-heading"><div><span className="eyebrow">RUTA CURRICULAR · {level.cefr}</span><h3>Avanza unidad por unidad</h3></div><span>{units.length} unidades</span></div>
        <div className="unit-roadmap-grid">{units.map((unit) => <button key={unit.id} type="button" className={`unit-roadmap-card${unit.id === activeUnit.id ? ' is-active' : ''}`} onClick={() => onSelectUnit(unit.id)} aria-pressed={unit.id === activeUnit.id}><span>{String(unit.number).padStart(2, '0')}</span><strong>{unit.title}</strong><small>{unit.topic}</small></button>)}</div>
      </section>

      <div className="lesson-layout">
        <div className="lesson-main-column">
          <section className="lesson-section surface-card">
            <div className="section-label"><span className="section-number">01</span><div><span className="eyebrow">APRENDE</span><h3>La idea principal</h3></div></div>
            <p className="lesson-explanation">{activeUnit.objective} {level.explanation}</p>
            <div className="grammar-note"><span className="note-label">GRAMÁTICA EN CONTEXTO</span><p>{activeUnit.grammar}</p></div>
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
            <div className="vocabulary-chips">{activeUnit.vocabulary.map((word) => <span key={word} className="vocabulary-chip">{word}</span>)}</div>
          </section>
        </div>

        <aside className="lesson-aside">
          <section className="lesson-checklist surface-card">
            <span className="eyebrow">AL TERMINAR PODRÁS</span>
            <h3>Tu objetivo de aprendizaje</h3>
            <ul><li><Icon name="check" size={15} /> Entender las frases clave.</li><li><Icon name="check" size={15} /> Identificar la estructura nueva.</li><li><Icon name="check" size={15} /> Usarla en una situación propia.</li></ul>
            <div className="aside-rule" />
            <span className="eyebrow">UNIDAD {String(levelIndex).padStart(2, '0')} · {level.cefr}</span>
            <h3>{activeUnit.title}</h3>
            <p>Unidad {activeUnit.number} de 8. Aprende el contenido, escucha ejemplos y continúa con la hoja de práctica del nivel.</p>
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
