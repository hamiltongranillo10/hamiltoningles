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
  {
    unitId: 'a1-unit-3',
    level: 'a1',
    title: 'Unidad 3 · Familia y personas',
    instructions: 'Practica cómo hablar de tu familia y describir a personas cercanas. Usa have got, los posesivos y adjetivos básicos.',
    fill: [
      { id: 'fill-1', prompt: 'I ____ got two sisters.', answer: 'have' },
      { id: 'fill-2', prompt: 'She ____ got a brother.', answer: 'has' },
      { id: 'fill-3', prompt: 'This is ____ mother.', answer: 'my' },
      { id: 'fill-4', prompt: 'He is ____ father.', answer: 'my' },
      { id: 'fill-5', prompt: 'My parents ____ kind.', answer: 'are' },
      { id: 'fill-6', prompt: 'This is Maria. ____ sister is Ana.', answer: 'Her' },
    ],
    translation: { prompt: 'Tengo un hermano y dos hermanas. Mi familia es amable.', answer: 'I have got one brother and two sisters. My family is kind.', hint: 'Usa I have got para hablar de lo que tienes. Family es singular: My family is…' },
    order: { words: ['has', 'She', 'a', 'brother.'], answer: 'She has a brother.', prompt: 'Pon las palabras en orden para describir a una persona.' },
    dictation: { answer: 'My parents are very kind.', prompt: 'Escucha y escribe la frase.' },
    writing: { prompt: 'Describe a tu familia en 4–5 frases. Incluye cuántas personas hay y usa al menos dos posesivos.', sample: 'I have got one brother and one sister. My brother is funny. His name is Carlos. My sister is kind. Her name is Ana.', lines: 5 },
    reading: { title: 'Lee y comprende', text: 'This is Emma. She has got one brother and two sisters. Her brother is Tom. He is twelve years old. Emma says her family is very friendly.', question: 'How many sisters has Emma got?', answer: 'Two' },
    selfCheck: { items: ['Puedo decir cuántos hermanos tengo.', 'Puedo usar have got y has got.', 'Puedo usar my, his y her.', 'Puedo describir a una persona con un adjetivo.'] },
  },
  {
    unitId: 'a1-unit-4',
    level: 'a1',
    title: 'Unidad 4 · Casa y objetos',
    instructions: 'Describe una habitación y di dónde están los objetos. Practica there is, there are y las preposiciones in, on, under y next to.',
    fill: [
      { id: 'fill-1', prompt: 'There ____ a sofa in the living room.', answer: 'is' },
      { id: 'fill-2', prompt: 'There ____ two chairs near the table.', answer: 'are' },
      { id: 'fill-3', prompt: 'The book is ____ the table.', answer: 'on' },
      { id: 'fill-4', prompt: 'The shoes are ____ the bed.', answer: 'under' },
      { id: 'fill-5', prompt: 'The lamp is ____ to the sofa.', answer: 'next' },
      { id: 'fill-6', prompt: 'There ____ a picture on the wall.', answer: 'is' },
    ],
    translation: { prompt: 'Hay una mesa en la cocina y dos sillas junto a ella.', answer: 'There is a table in the kitchen and two chairs next to it.', hint: 'Usa There is con un objeto y There are con dos o más. Next to significa «junto a». ' },
    order: { words: ['a', 'There', 'bedroom.', 'is', 'in', 'bed'], answer: 'There is a bed in the bedroom.', prompt: 'Pon las palabras en orden para describir una habitación.' },
    dictation: { answer: 'The keys are on the table.', prompt: 'Escucha y escribe la frase.' },
    writing: { prompt: 'Describe una habitación en 4–5 frases. Incluye al menos tres objetos y tres preposiciones.', sample: 'There is a bed in my bedroom. There is a lamp on the table. My shoes are under the bed. A chair is next to the window.', lines: 5 },
    reading: { title: 'Lee y comprende', text: 'This is my kitchen. There is a small table in the middle. There are four chairs around it. The plates are in the cupboard and the cups are on the shelf.', question: 'Where are the cups?', answer: 'On the shelf' },
    selfCheck: { items: ['Puedo decir qué hay en una habitación.', 'Puedo usar there is y there are.', 'Puedo usar in, on y under.', 'Puedo describir dónde está un objeto.'] },
  },
];

export function getUnitWorkbook(level: LevelId, unitId?: string): UnitWorkbook | undefined {
  return unitWorkbooks.find((workbook) => workbook.level === level && workbook.unitId === unitId);
}
