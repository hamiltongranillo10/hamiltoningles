import type { LevelId } from './course';

export interface UnitReading {
  title: string;
  text: string;
  question: string;
  answer: string;
}

export interface UnitSelfCheck {
  items: string[];
}

export interface UnitWorkbook {
  unitId: string;
  level: LevelId;
  title: string;
  instructions: string;
  fill: { id: string; prompt: string; answer: string }[];
  translation: { prompt: string; answer: string; hint: string };
  order: { words: string[]; answer: string; prompt: string };
  dictation: { answer: string; prompt: string };
  writing: { prompt: string; sample: string; lines: number };
  reading?: UnitReading;
  selfCheck?: UnitSelfCheck;
}

export const unitWorkbooks: UnitWorkbook[] = [
  {
    unitId: 'a1-unit-1',
    level: 'a1',
    title: 'Unidad 1 · Primer contacto',
    instructions: 'Completa los ejercicios para saludar, presentarte y preguntar cómo está otra persona. Después revisa tu comprensión y escribe una mini presentación.',
    fill: [
      { id: 'fill-1', prompt: '____! My name is Ana.', answer: 'Hello' },
      { id: 'fill-2', prompt: 'I ____ fine, thanks.', answer: 'am' },
      { id: 'fill-3', prompt: 'Nice to ____ you.', answer: 'meet' },
      { id: 'fill-4', prompt: 'What ____ your name?', answer: 'is' },
      { id: 'fill-5', prompt: 'See you ____!', answer: 'later' },
      { id: 'fill-6', prompt: 'My name ____ Luis.', answer: 'is' },
    ],
    translation: { prompt: 'Hola, me llamo Ana. Mucho gusto.', answer: 'Hello, my name is Ana. Nice to meet you.', hint: 'Empieza con Hello. Para «me llamo», usa My name is…' },
    order: { words: ['name', 'My', 'Ana.', 'is'], answer: 'My name is Ana.', prompt: 'Pon las palabras en orden para presentarte.' },
    dictation: { answer: 'How are you?', prompt: 'Escucha y escribe la pregunta.' },
    writing: { prompt: 'Escribe 3–4 frases: saluda, di tu nombre y pregunta cómo está otra persona.', sample: 'Hello! My name is Ana. Nice to meet you. How are you?', lines: 4 },
    reading: { title: 'Lee y comprende', text: 'Hello! My name is Ana. I am from Mexico. I am fine today. Nice to meet you, Luis.', question: 'Where is Ana from?', answer: 'Mexico' },
    selfCheck: { items: ['Puedo saludar en inglés.', 'Puedo decir mi nombre.', 'Puedo preguntar How are you?', 'Puedo despedirme con See you later.'] },
  },
];

export function getUnitWorkbook(level: LevelId, unitId?: string): UnitWorkbook | undefined {
  return unitWorkbooks.find((workbook) => workbook.level === level && workbook.unitId === unitId);
}
