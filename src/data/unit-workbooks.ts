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
  {
    unitId: 'a1-unit-2',
    level: 'a1',
    title: 'Unidad 2 · Datos personales',
    instructions: 'Practica cómo decir tu edad, país, ciudad, teléfono y correo electrónico. Completa la ficha y escribe una presentación personal breve.',
    fill: [
      { id: 'fill-1', prompt: 'How ____ are you?', answer: 'old' },
      { id: 'fill-2', prompt: 'I am ____ years old.', answer: 'twenty' },
      { id: 'fill-3', prompt: 'Where ____ you from?', answer: 'are' },
      { id: 'fill-4', prompt: 'I am ____ Spain.', answer: 'from' },
      { id: 'fill-5', prompt: 'What is your phone ____?', answer: 'number' },
      { id: 'fill-6', prompt: 'What is your email ____?', answer: 'address' },
    ],
    translation: { prompt: 'Tengo veinte años y soy de Colombia.', answer: 'I am twenty years old and I am from Colombia.', hint: 'Para la edad usa I am … years old. Para el país, usa I am from…' },
    order: { words: ['from', 'I', 'Colombia.', 'am'], answer: 'I am from Colombia.', prompt: 'Pon las palabras en orden para decir tu país.' },
    dictation: { answer: 'What is your email address?', prompt: 'Escucha y escribe la pregunta.' },
    writing: { prompt: 'Completa una ficha personal en 4–5 frases: nombre, edad, país o ciudad y correo de ejemplo.', sample: 'My name is Luis. I am twenty years old. I am from Colombia. I live in Bogotá. My email address is luis@example.com.', lines: 5 },
    reading: { title: 'Lee y comprende', text: 'Hi! My name is Sofia. I am nineteen years old. I am from Peru, but I live in Lima. My phone number is 555-0182.', question: 'Where does Sofia live?', answer: 'Lima' },
    selfCheck: { items: ['Puedo decir mi edad.', 'Puedo decir de dónde soy.', 'Puedo decir dónde vivo.', 'Puedo preguntar por un teléfono o correo.'] },
  },
];

export function getUnitWorkbook(level: LevelId, unitId?: string): UnitWorkbook | undefined {
  return unitWorkbooks.find((workbook) => workbook.level === level && workbook.unitId === unitId);
}
