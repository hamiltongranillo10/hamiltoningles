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
  {
    unitId: 'a1-unit-5',
    level: 'a1',
    title: 'Unidad 5 · Rutinas diarias',
    instructions: 'Habla de tus hábitos y actividades diarias. Practica el presente simple, las horas y los adverbios usually, sometimes y never.',
    fill: [
      { id: 'fill-1', prompt: 'I ____ up at seven o’clock.', answer: 'get' },
      { id: 'fill-2', prompt: 'She ____ breakfast at eight.', answer: 'has' },
      { id: 'fill-3', prompt: 'I ____ to work by bus.', answer: 'go' },
      { id: 'fill-4', prompt: 'He ____ English every evening.', answer: 'studies' },
      { id: 'fill-5', prompt: 'I ____ watch TV before bed.', answer: 'usually' },
      { id: 'fill-6', prompt: 'What time ____ you start work?', answer: 'do' },
    ],
    translation: { prompt: 'Normalmente me levanto a las siete y voy al trabajo en autobús.', answer: 'I usually get up at seven and go to work by bus.', hint: 'El adverbio usually suele ir antes del verbo principal. Con I usa get y go sin -s.' },
    order: { words: ['at', 'I', 'seven.', 'get', 'up'], answer: 'I get up at seven.', prompt: 'Pon las palabras en orden para hablar de tu rutina.' },
    dictation: { answer: 'What time do you start work?', prompt: 'Escucha y escribe la pregunta.' },
    writing: { prompt: 'Describe tu día en 4–5 frases. Incluye una hora, una actividad de la mañana y una de la tarde.', sample: 'I usually get up at seven. I have breakfast and go to work by bus. I have lunch at one. In the evening, I study English.', lines: 5 },
    reading: { title: 'Lee y comprende', text: 'Daniel gets up at six thirty every weekday. He has breakfast and walks to work. He starts work at eight. In the evening, he usually cooks dinner and reads a book.', question: 'How does Daniel go to work?', answer: 'He walks' },
    selfCheck: { items: ['Puedo hablar de mi rutina.', 'Puedo decir la hora de una actividad.', 'Puedo usar el presente simple.', 'Puedo usar usually, sometimes y never.'] },
  },
  {
    unitId: 'a1-unit-6',
    level: 'a1',
    title: 'Unidad 6 · Comida y compras',
    instructions: 'Practica cómo pedir comida, expresar lo que quieres y preguntar precios y cantidades. Usa would like, some, any y how much.',
    fill: [
      { id: 'fill-1', prompt: 'I ____ like a sandwich, please.', answer: 'would' },
      { id: 'fill-2', prompt: 'Can I have ____ water?', answer: 'some' },
      { id: 'fill-3', prompt: 'How ____ is this coffee?', answer: 'much' },
      { id: 'fill-4', prompt: 'Are there ____ apples?', answer: 'any' },
      { id: 'fill-5', prompt: 'I would like ____ orange, please.', answer: 'an' },
      { id: 'fill-6', prompt: 'How much ____ two sandwiches?', answer: 'are' },
    ],
    translation: { prompt: 'Quisiera una botella de agua y una manzana, por favor.', answer: 'I would like a bottle of water and an apple, please.', hint: 'Usa I would like para pedir con amabilidad. Apple empieza con sonido vocálico: an apple.' },
    order: { words: ['like', 'I', 'a', 'would', 'coffee,', 'please.'], answer: 'I would like a coffee, please.', prompt: 'Pon las palabras en orden para hacer un pedido.' },
    dictation: { answer: 'How much is the soup?', prompt: 'Escucha y escribe la pregunta.' },
    writing: { prompt: 'Escribe un pedido breve de 4–5 frases. Saluda, pide dos productos, pregunta el precio y despídete.', sample: 'Hello. I would like a sandwich and a bottle of water, please. How much are they? Thank you. Goodbye.', lines: 5 },
    reading: { title: 'Lee y comprende', text: 'At the market, Leo buys some bananas, two apples and a bottle of water. The bananas are two pounds. He asks, “How much are the apples?” The seller says, “They are one pound.”', question: 'How much are the apples?', answer: 'One pound' },
    selfCheck: { items: ['Puedo pedir comida con amabilidad.', 'Puedo preguntar cuánto cuesta algo.', 'Puedo usar some y any.', 'Puedo decir cantidades y precios.'] },
  },
  {
    unitId: 'a1-unit-7',
    level: 'a1',
    title: 'Unidad 7 · Ciudad y direcciones',
    instructions: 'Aprende a pedir y dar indicaciones sencillas. Practica los imperativos, can y el vocabulario de calles y lugares.',
    fill: [
      { id: 'fill-1', prompt: 'Go ____ ahead for two blocks.', answer: 'straight' },
      { id: 'fill-2', prompt: 'Turn ____ at the bank.', answer: 'left' },
      { id: 'fill-3', prompt: 'The library is ____ the station.', answer: 'near' },
      { id: 'fill-4', prompt: '____ you tell me the way to the museum?', answer: 'Can' },
      { id: 'fill-5', prompt: 'The café is ____ the supermarket and the bank.', answer: 'between' },
      { id: 'fill-6', prompt: 'Cross the ____ at the traffic lights.', answer: 'street' },
    ],
    translation: { prompt: '¿Puedes decirme cómo llegar a la biblioteca? Sigue recto y gira a la derecha.', answer: 'Can you tell me how to get to the library? Go straight and turn right.', hint: 'Para pedir ayuda usa Can you tell me…? Los imperativos no necesitan sujeto: Go straight.' },
    order: { words: ['right', 'Turn', 'at', 'the', 'corner.'], answer: 'Turn right at the corner.', prompt: 'Pon las palabras en orden para dar una indicación.' },
    dictation: { answer: 'The museum is next to the park.', prompt: 'Escucha y escribe la frase.' },
    writing: { prompt: 'Escribe 4–5 frases para explicar cómo llegar desde una estación hasta un lugar de tu ciudad.', sample: 'Go straight for one block. Turn left at the bank. The library is next to the park. You can see it on the right.', lines: 5 },
    reading: { title: 'Lee y comprende', text: 'The hotel is near the train station. Go straight for one block and turn right at the bank. The hotel is next to a small café, opposite the park.', question: 'What is the hotel next to?', answer: 'A small café' },
    selfCheck: { items: ['Puedo pedir indicaciones.', 'Puedo decir go straight y turn left/right.', 'Puedo usar can para pedir ayuda.', 'Puedo ubicar un lugar en la ciudad.'] },
  },
  {
    unitId: 'a1-unit-8',
    level: 'a1',
    title: 'Unidad 8 · Repaso y situación final',
    instructions: 'Integra lo aprendido en A1: preséntate, habla de tu familia y rutina, pide algo y resuelve una situación en la ciudad.',
    fill: [
      { id: 'fill-1', prompt: 'My name ____ Sofia and I am from Chile.', answer: 'is' },
      { id: 'fill-2', prompt: 'There ____ two chairs in the kitchen.', answer: 'are' },
      { id: 'fill-3', prompt: 'I usually ____ up at seven.', answer: 'get' },
      { id: 'fill-4', prompt: 'I would ____ a coffee, please.', answer: 'like' },
      { id: 'fill-5', prompt: 'Can you tell me ____ to the station?', answer: 'how' },
      { id: 'fill-6', prompt: 'She ____ got one brother.', answer: 'has' },
    ],
    translation: { prompt: 'Hola, me llamo Luis. Normalmente voy al trabajo en autobús y quisiera un café.', answer: 'Hello, my name is Luis. I usually go to work by bus and I would like a coffee.', hint: 'Combina My name is…, usually go y I would like… en una sola presentación.' },
    order: { words: ['usually', 'I', 'English', 'study', 'evening.', 'in', 'the'], answer: 'I usually study English in the evening.', prompt: 'Ordena la frase para hablar de una rutina.' },
    dictation: { answer: 'Can you help me find the library?', prompt: 'Escucha y escribe la pregunta.' },
    writing: { prompt: 'Escribe una presentación final de 6–8 frases. Incluye tu nombre, origen, familia, rutina, una petición y una dirección.', sample: 'Hello, my name is Luis and I am from Chile. I have got one sister. I usually get up at seven and go to work by bus. I would like a coffee, please. Can you tell me how to get to the library? Thank you.', lines: 8 },
    reading: { title: 'Lee y comprende', text: 'Hi, I am Marta. I am from Argentina and I live in Córdoba. I have got one brother. I usually get up at seven and walk to work. Today I am at a café. I would like a tea, please, and then I need directions to the library.', question: 'What does Marta want at the café?', answer: 'A tea' },
    selfCheck: { items: ['Puedo presentarme y hablar de mi origen.', 'Puedo describir mi familia y mi rutina.', 'Puedo pedir comida o bebida.', 'Puedo pedir y dar indicaciones sencillas.'] },
  },
  {
    unitId: 'a2-unit-1',
    level: 'a2',
    title: 'Unidad 1 · Rutinas y tiempo libre',
    instructions: 'Describe tus hábitos, actividades de ocio y fines de semana. Practica el presente simple, las preguntas con do y los adverbios de frecuencia.',
    fill: [
      { id: 'fill-1', prompt: 'I ____ play tennis on Saturdays.', answer: 'usually' },
      { id: 'fill-2', prompt: 'She ____ to the gym twice a week.', answer: 'goes' },
      { id: 'fill-3', prompt: 'How often ____ you watch films?', answer: 'do' },
      { id: 'fill-4', prompt: 'He ____ plays video games after work.', answer: 'sometimes' },
      { id: 'fill-5', prompt: 'We ____ go out on Sunday evenings.', answer: 'often' },
      { id: 'fill-6', prompt: 'What ____ your brother do at weekends?', answer: 'does' },
    ],
    translation: { prompt: 'Normalmente juego al tenis los sábados, pero a veces veo películas en casa.', answer: 'I usually play tennis on Saturdays, but sometimes I watch films at home.', hint: 'Usa usually y sometimes antes del verbo principal. Después de I usa play y watch sin -s.' },
    order: { words: ['often', 'We', 'at', 'weekends.', 'go', 'cycling'], answer: 'We often go cycling at weekends.', prompt: 'Ordena la frase para hablar de una actividad habitual.' },
    dictation: { answer: 'How often do you meet your friends?', prompt: 'Escucha y escribe la pregunta.' },
    writing: { prompt: 'Escribe 5–6 frases sobre tu tiempo libre. Incluye dos adverbios de frecuencia y una pregunta para otra persona.', sample: 'I usually read at home in the evening. I often go cycling at weekends. Sometimes I meet my friends for coffee. How often do you play sports?', lines: 6 },
    reading: { title: 'Lee y comprende', text: 'Every Saturday, Maya goes swimming in the morning. She often meets her friends for lunch afterwards. In the afternoon, she sometimes watches a film, but she never stays up late on Saturday night.', question: 'What does Maya do in the morning?', answer: 'She goes swimming' },
    selfCheck: { items: ['Puedo hablar de mis actividades de tiempo libre.', 'Puedo usar usually, often, sometimes y never.', 'Puedo preguntar How often…?', 'Puedo describir mis planes habituales de fin de semana.'] },
  },
];

export function getUnitWorkbook(level: LevelId, unitId?: string): UnitWorkbook | undefined {
  return unitWorkbooks.find((workbook) => workbook.level === level && workbook.unitId === unitId);
}
