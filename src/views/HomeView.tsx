import { Icon } from '../components/Icons';
import { LevelPicker } from '../components/LevelPicker';
import { levels, type LevelData, type LevelId } from '../data/course';
import type { AppView } from '../components/AppShell';

interface HomeViewProps {
  level: LevelData;
  selectedLevel: LevelId;
  onSelectLevel: (id: LevelId) => void;
  onNavigate: (view: AppView) => void;
  completedIds: LevelId[];
  points: number;
}

export function HomeView({ level, selectedLevel, onSelectLevel, onNavigate, completedIds, points }: HomeViewProps) {
  return (
    <div className="view-page home-view">
      <div className="page-heading-row">
        <div>
          <span className="eyebrow">RUTA COMPLETA · A1 A C1</span>
          <h1>Aprende inglés <span className="heading-soft">sin saltarte pasos.</span></h1>
          <p className="lead">Primero aprende. Después resuelve tu hoja y practica con actividades aparte.</p>
        </div>
        <div className="points-card">
          <span>PROGRESO LOCAL</span>
          <strong>{completedIds.length} <small>/ 5 niveles</small></strong>
          <div className="points-line" role="progressbar" aria-label="Niveles revisados" aria-valuemin={0} aria-valuemax={5} aria-valuenow={completedIds.length} aria-valuetext={`${completedIds.length} de 5 niveles revisados`}>
            <i style={{ width: `${Math.min(completedIds.length * 20, 100)}%` }} />
          </div>
          <span>{points} puntos de práctica</span>
        </div>
      </div>

      <section className="home-hero surface-card">
        <div className="hero-copy">
          <span className="eyebrow eyebrow-pill"><span className="status-dot" /> TU SIGUIENTE PASO</span>
          <h2>{level.cefr} <span>·</span> {level.lessonTitle}</h2>
          <p>{level.objective}</p>
          <div className="hero-actions">
            <button type="button" className="button button-primary" onClick={() => onNavigate('lesson')}>Continuar mi lección <Icon name="arrow" size={17} /></button>
            <button type="button" className="button button-outline" onClick={() => onNavigate('practice')}>Ir a práctica <Icon name="practice" size={16} /></button>
          </div>
          <div className="hero-footnote"><Icon name="book" size={15} /> Lecciones, hojas y prácticas están en espacios distintos.</div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="hero-monogram">Aa</div>
          <div className="hero-mini-card"><span>{level.cefr} · UNIDAD MODELO</span><strong>{level.name}</strong><small>{level.module}</small></div>
        </div>
      </section>

      <section className="course-section">
        <div className="section-heading">
          <div><span className="eyebrow">TU RUTA</span><h2>Elige tu nivel</h2><p>Una unidad completa de muestra por nivel, con su propia hoja de trabajo.</p></div>
          <LevelPicker value={selectedLevel} onChange={onSelectLevel} compact />
        </div>
        <div className="level-card-grid">
          {levels.map((item, index) => {
            const selected = item.id === selectedLevel;
            const complete = completedIds.includes(item.id);
            return (
              <button key={item.id} type="button" className={`level-card${selected ? ' selected' : ''}`} onClick={() => { onSelectLevel(item.id); onNavigate('lesson'); }} aria-pressed={selected}>
                <span className="level-card-top"><span className={`level-badge level-${item.id}`}>{item.cefr}</span><span className="level-card-state">{complete ? 'Revisada' : `0${index + 1} · Unidad modelo`}</span></span>
                <strong>{item.name}</strong><span className="level-card-subtitle">{item.subtitle}</span>
                <span className="level-card-foot"><span>{item.weeks}</span><Icon name="arrow" size={16} /></span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="home-bottom-grid">
        <article className="info-card surface-card">
          <div className="info-icon lavender"><Icon name="book" size={18} /></div>
          <div><span className="eyebrow">LECCIONES</span><h3>Aprende con una ruta clara</h3><p>Objetivo, explicación, vocabulario y ejemplos bilingües, sin ejercicios amontonados.</p></div>
          <button className="text-button" type="button" onClick={() => onNavigate('lesson')}>Abrir lección <Icon name="arrow" size={15} /></button>
        </article>
        <article className="info-card surface-card">
          <div className="info-icon mint"><Icon name="practice" size={18} /></div>
          <div><span className="eyebrow">PRÁCTICA ESCRITA</span><h3>Practica por separado</h3><p>Traducción, ordenar frases y dictado; tu avance y tus frases guardadas quedan en este dispositivo.</p></div>
          <button className="text-button" type="button" onClick={() => onNavigate('practice')}>Ir a practicar <Icon name="arrow" size={15} /></button>
        </article>
        <article className="info-card surface-card">
          <div className="info-icon lavender"><Icon name="mic" size={18} /></div>
          <div><span className="eyebrow">MI VOZ</span><h3>Prueba una frase en voz alta</h3><p>Escucha una frase breve y practica grabando con reconocimiento local opcional.</p></div>
          <button className="text-button" type="button" onClick={() => onNavigate('voice')}>Practicar mi voz <Icon name="arrow" size={15} /></button>
        </article>
        <article className="info-card surface-card">
          <div className="info-icon mint"><Icon name="music" size={18} /></div>
          <div><span className="eyebrow">TU AUDIO</span><h3>Escucha desde Drive</h3><p>Con permiso para usar el archivo, genera un borrador inglés-español sin enviarlo a una IA de pago.</p></div>
          <button className="text-button" type="button" onClick={() => onNavigate('audio')}>Abrir tu audio <Icon name="arrow" size={15} /></button>
        </article>
      </section>
      <p className="demo-disclaimer">Demo independiente: cada nivel contiene una unidad modelo. El progreso se guarda en este dispositivo; las prácticas de voz y audio son temporales.</p>
    </div>
  );
}
