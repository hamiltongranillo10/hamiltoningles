import { lazy, Suspense, useEffect, useState } from 'react';
import { AppShell, type AppView } from './components/AppShell';
import { getLevel, levels, type LevelId } from './data/course';
import { HomeView } from './views/HomeView';
import { LessonView } from './views/LessonView';
import { PracticeView } from './views/PracticeView';
import { WorksheetView } from './views/WorksheetView';
import { readStored, writeStored } from './utils';

const VoiceView = lazy(() => import('./views/VoiceView').then((module) => ({ default: module.VoiceView })));
const DriveAudioView = lazy(() => import('./views/DriveAudioView').then((module) => ({ default: module.DriveAudioView })));

const levelKey = 'ingles-demo.selected-level';
const answersKey = 'ingles-demo.worksheet-answers';
const favoritesKey = 'ingles-demo.saved-phrases';
const reviewedKey = 'ingles-demo.reviewed-levels';
const completedKey = 'ingles-demo.completed-levels';
const pointsKey = 'ingles-demo.practice-points';

function initialLevel(): LevelId {
  const stored = readStored<string>(levelKey, 'a1');
  return levels.some((level) => level.id === stored) ? (stored as LevelId) : 'a1';
}

function viewFromHash(hash: string): AppView {
  const route = hash.replace(/^#/, '').toLowerCase();
  if (route === 'practica') return 'practice';
  if (route === 'hoja') return 'worksheet';
  if (route === 'lecciones') return 'lesson';
  if (route === 'fragmento-autorizado' || route === 'mi-voz') return 'voice';
  if (route === 'tu-audio') return 'audio';
  return 'home';
}

function hashForView(view: AppView): string {
  if (view === 'practice') return '#practica';
  if (view === 'worksheet') return '#hoja';
  if (view === 'lesson') return '#lecciones';
  if (view === 'voice') return '#fragmento-autorizado';
  if (view === 'audio') return '#tu-audio';
  return '#inicio';
}

function FeatureLoading() {
  return <div className="surface-card feature-loading" role="status"><span className="loading-dot" />Preparando esta sección…</div>;
}

export default function App() {
  const [view, setView] = useState<AppView>(() => viewFromHash(window.location.hash));
  const [selectedLevel, setSelectedLevel] = useState<LevelId>(initialLevel);
  const [answers, setAnswers] = useState<Record<string, string>>(() => readStored(answersKey, {}));
  const [favorites, setFavorites] = useState<string[]>(() => readStored(favoritesKey, []));
  const [reviewedLevels, setReviewedLevels] = useState<LevelId[]>(() => readStored(reviewedKey, []));
  const [completedLevels, setCompletedLevels] = useState<LevelId[]>(() => readStored(completedKey, []));
  const [points, setPoints] = useState<number>(() => readStored(pointsKey, 0));
  const level = getLevel(selectedLevel);

  useEffect(() => { writeStored(levelKey, selectedLevel); }, [selectedLevel]);
  useEffect(() => { writeStored(answersKey, answers); }, [answers]);
  useEffect(() => { writeStored(favoritesKey, favorites); }, [favorites]);
  useEffect(() => { writeStored(reviewedKey, reviewedLevels); }, [reviewedLevels]);
  useEffect(() => { writeStored(completedKey, completedLevels); }, [completedLevels]);
  useEffect(() => { writeStored(pointsKey, points); }, [points]);

  useEffect(() => {
    const syncRoute = () => setView(viewFromHash(window.location.hash));
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  function navigate(next: AppView) {
    setView(next);
    const hash = hashForView(next);
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function selectLevel(id: LevelId) {
    setSelectedLevel(id);
  }

  function updateAnswer(key: string, value: string) {
    setAnswers((current) => ({ ...current, [key]: value }));
    const levelId = key.split('.')[0] as LevelId;
    setReviewedLevels((current) => current.filter((id) => id !== levelId));
  }

  function reviewWorksheet(score: number) {
    setReviewedLevels((current) => current.includes(level.id) ? current : [...current, level.id]);
    if (!completedLevels.includes(level.id)) {
      setCompletedLevels((current) => current.includes(level.id) ? current : [...current, level.id]);
      setPoints((current) => current + score * 10);
    }
  }

  function toggleFavorite(text: string) {
    const clean = text.trim();
    if (!clean) return;
    setFavorites((current) => {
      const match = current.find((item) => item.toLocaleLowerCase() === clean.toLocaleLowerCase());
      if (match) return current.filter((item) => item !== match);
      return current.length >= 12 ? current : [...current, clean];
    });
  }

  return (
    <AppShell view={view} onNavigate={navigate}>
      {view === 'home' && <HomeView level={level} selectedLevel={selectedLevel} onSelectLevel={selectLevel} onNavigate={navigate} completedIds={completedLevels} points={points} />}
      {view === 'lesson' && <LessonView level={level} selectedLevel={selectedLevel} onSelectLevel={selectLevel} onNavigate={navigate} completed={completedLevels.includes(level.id)} />}
      {view === 'worksheet' && <WorksheetView level={level} answers={answers} reviewed={reviewedLevels.includes(level.id)} onAnswer={updateAnswer} onReview={reviewWorksheet} onNavigate={navigate} onSelectLevel={selectLevel} />}
      {view === 'practice' && <PracticeView level={level} selectedLevel={selectedLevel} onSelectLevel={selectLevel} points={points} favorites={favorites} onToggleFavorite={toggleFavorite} onAwardPoints={(earned) => setPoints((current) => current + earned)} />}
      {view === 'voice' && <Suspense fallback={<FeatureLoading />}><VoiceView /></Suspense>}
      {view === 'audio' && <Suspense fallback={<FeatureLoading />}><DriveAudioView /></Suspense>}
    </AppShell>
  );
}
