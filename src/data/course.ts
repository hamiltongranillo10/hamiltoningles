export type LevelId = 'a1' | 'a2' | 'b1' | 'b2' | 'c1';

export interface Phrase {
  english: string;
  spanish: string;
  pronunciation: string;
}

export interface FillItem {
  id: string;
  prompt: string;
  answer: string;
}

export interface LevelData {
  id: LevelId;
  cefr: string;
  name: string;
  subtitle: string;
  weeks: string;
  module: string;
  lessonTitle: string;
  topic: string;
  objective: string;
  explanation: string;
  grammar: string;
  vocabulary: string[];
  phrases: Phrase[];
  workbook: {
    title: string;
    instructions: string;
    fill: FillItem[];
    translation: { prompt: string; answer: string; hint: string };
    order: { words: string[]; answer: string; prompt: string };
    dictation: { answer: string; prompt: string };
    writing: { prompt: string; sample: string; lines: number };
  };
  practice: {
    translation: { prompt: string; answer: string; hint: string };
    order: { words: string[]; answer: string; prompt: string };
    dictation: { answer: string; prompt: string };
  };
}

export const levels: LevelData[] = [
  {
    id: 'a1', cefr: 'A1', name: 'Base absoluta', subtitle: 'Primeros pasos', weeks: 'Semanas 1–4',
    module: 'Módulo 1 · Primer contacto', lessonTitle: 'Saludos y presentaciones', topic: 'Hello / Hi · verbo to be',
    objective: 'Saludar, presentarte y responder cómo estás con frases cortas y naturales.',
    explanation: 'Hello y Hi funcionan a cualquier hora. Usa “Good morning” por la mañana y “Good evening” al llegar por la noche. Para decir tu nombre, empieza con “My name is…”.',
    grammar: 'I am / I’m = yo soy o estoy · You are / You’re = tú eres o estás. En una presentación: “My name is Ana.”',
    vocabulary: ['hello · hola', 'name · nombre', 'fine · bien', 'meet · conocer', 'later · luego'],
    phrases: [
      { english: 'Hello! My name is Ana.', spanish: '¡Hola! Me llamo Ana.', pronunciation: 'jelóu · mai néim is Ána' },
      { english: 'How are you? I am fine.', spanish: '¿Cómo estás? Estoy bien.', pronunciation: 'jáu ar iu · ai am fáin' },
      { english: 'Nice to meet you.', spanish: 'Mucho gusto.', pronunciation: 'náis tu míit iu' },
      { english: 'What is your name?', spanish: '¿Cómo te llamas?', pronunciation: 'juat is ior néim' },
      { english: 'See you later!', spanish: '¡Hasta luego!', pronunciation: 'sí iu léiter' },
    ],
    workbook: {
      title: 'Primer contacto',
      instructions: 'Completa con la palabra que falta. Después, traduce, ordena una frase y escribe una presentación breve.',
      fill: [
        { id: 'fill-1', prompt: 'My name ____ Ana.', answer: 'is' },
        { id: 'fill-2', prompt: 'I ____ fine, thanks.', answer: 'am' },
        { id: 'fill-3', prompt: 'Nice to ____ you.', answer: 'meet' },
        { id: 'fill-4', prompt: 'See you ____!', answer: 'later' },
      ],
      translation: { prompt: 'Hola, me llamo Ana. Mucho gusto.', answer: 'Hello, my name is Ana. Nice to meet you.', hint: 'Empieza con Hello. Para «me llamo», usa My name is…' },
      order: { words: ['name', 'My', 'Ana.', 'is'], answer: 'My name is Ana.', prompt: 'Pon las palabras en orden para presentarte.' },
      dictation: { answer: 'How are you?', prompt: 'Escucha y escribe la pregunta.' },
      writing: { prompt: 'Preséntate en inglés: escribe tu nombre y saluda a otra persona.', sample: 'Hello! My name is Ana. Nice to meet you.', lines: 3 },
    },
    practice: {
      translation: { prompt: '¿Cómo estás? Estoy bien, gracias.', answer: 'How are you? I am fine, thanks.', hint: 'Empieza con How are you?' },
      order: { words: ['is', 'name', 'My', 'Ana.'], answer: 'My name is Ana.', prompt: 'Forma una frase para decir tu nombre.' },
      dictation: { answer: 'Nice to meet you.', prompt: 'Escucha la frase y escríbela.' },
    },
  },
  {
    id: 'a2', cefr: 'A2', name: 'Vida cotidiana', subtitle: 'Rutinas y planes', weeks: 'Semanas 5–8',
    module: 'Módulo modelo · Un día normal', lessonTitle: 'Habla de tu rutina', topic: 'Present simple · frecuencia',
    objective: 'Describir una rutina, preguntar por horarios y pedir algo con cortesía.',
    explanation: 'Usa el presente simple para hábitos. Con he, she e it, añade normalmente -s al verbo: “She works”. Coloca usually antes del verbo principal: “I usually get up at seven.”',
    grammar: 'I / you / we / they work · he / she works. Para preguntas usa do o does: “What time do you start?”',
    vocabulary: ['usually · normalmente', 'get up · levantarse', 'commute · trasladarse', 'after work · después del trabajo', 'please · por favor'],
    phrases: [
      { english: 'I usually get up at seven.', spanish: 'Normalmente me levanto a las siete.', pronunciation: 'ai yúshuali guet ap at séven' },
      { english: 'She takes the bus to work.', spanish: 'Ella toma el autobús para ir al trabajo.', pronunciation: 'shi téiks de bas tu uérk' },
      { english: 'We have lunch at noon.', spanish: 'Almorzamos al mediodía.', pronunciation: 'uí jav lanch at núun' },
      { english: 'What do you do after class?', spanish: '¿Qué haces después de clase?', pronunciation: 'juat du iu du áfter klas' },
      { english: 'Could I have the menu, please?', spanish: '¿Me trae el menú, por favor?', pronunciation: 'kud ai jav de méniu, plis' },
    ],
    workbook: {
      title: 'Un día normal', instructions: 'Practica el presente simple, los hábitos y una situación cotidiana. Revisa la tercera persona singular.',
      fill: [
        { id: 'fill-1', prompt: 'I usually ____ breakfast at seven.', answer: 'have' },
        { id: 'fill-2', prompt: 'She ____ to work by bus.', answer: 'goes' },
        { id: 'fill-3', prompt: 'We ____ lunch at noon.', answer: 'have' },
        { id: 'fill-4', prompt: 'What time ____ your class start?', answer: 'does' },
      ],
      translation: { prompt: 'Normalmente vuelvo a casa en autobús.', answer: 'I usually go home by bus.', hint: 'Usa usually para «normalmente» y presente simple.' },
      order: { words: ['every day.', 'takes', 'She', 'the bus', 'to work'], answer: 'She takes the bus to work every day.', prompt: 'Ordena la oración sobre una rutina.' },
      dictation: { answer: 'What time do you start work?', prompt: 'Escucha y escribe la pregunta.' },
      writing: { prompt: 'Describe un día normal en 3–4 frases. Incluye una hora y una expresión de frecuencia.', sample: 'I usually get up at seven. I have breakfast at home. I take the bus to work.', lines: 4 },
    },
    practice: {
      translation: { prompt: 'Ella toma el autobús para ir al trabajo.', answer: 'She takes the bus to work.', hint: 'Con she, el verbo take cambia a takes.' },
      order: { words: ['at seven.', 'get up', 'I', 'usually'], answer: 'I usually get up at seven.', prompt: 'Ordena la frase de rutina.' },
      dictation: { answer: 'We have lunch at noon.', prompt: 'Escucha la frase y escríbela.' },
    },
  },
  {
    id: 'b1', cefr: 'B1', name: 'Comunicación autónoma', subtitle: 'Historias y opiniones', weeks: 'Semanas 9–12',
    module: 'Módulo modelo · Experiencias', lessonTitle: 'Cuenta lo que te pasó', topic: 'Past simple · present perfect',
    objective: 'Narrar una experiencia breve, enlazar eventos y expresar una opinión con razones.',
    explanation: 'El past simple sitúa un hecho terminado en un momento concreto. El present perfect conecta una experiencia pasada con el presente: “I’ve known Maya since school.”',
    grammar: 'Past simple: I visited / we arrived. Present perfect: have + participio. Usa since para el inicio y for para la duración.',
    vocabulary: ['experience · experiencia', 'since · desde', 'although · aunque', 'first · primero', 'in the end · al final'],
    phrases: [
      { english: 'I have known Maya since school.', spanish: 'Conozco a Maya desde la escuela.', pronunciation: 'ai jav nóun Méia sins skúul' },
      { english: 'We visited the museum last Saturday.', spanish: 'Visitamos el museo el sábado pasado.', pronunciation: 'uí vísited de miusíam last sáterdei' },
      { english: 'I think public transport is useful.', spanish: 'Creo que el transporte público es útil.', pronunciation: 'ai zink páblik tránsport is iúsful' },
      { english: 'When I arrived, the meeting had started.', spanish: 'Cuando llegué, la reunión ya había empezado.', pronunciation: 'juen ai arráivd, de míiting jad stárted' },
      { english: 'Have you ever tried surfing?', spanish: '¿Has probado surfear alguna vez?', pronunciation: 'jav iu éver tráid sérfing' },
    ],
    workbook: {
      title: 'Historias y experiencias', instructions: 'Elige el tiempo verbal que encaja con la situación y organiza una historia con inicio, desarrollo y cierre.',
      fill: [
        { id: 'fill-1', prompt: 'I have ____ here since January.', answer: 'worked' },
        { id: 'fill-2', prompt: 'We were walking when it ____ to rain.', answer: 'began' },
        { id: 'fill-3', prompt: 'When I arrived, they had already ____.', answer: 'left' },
        { id: 'fill-4', prompt: 'I have never ____ surfing.', answer: 'tried' },
      ],
      translation: { prompt: 'Aunque estaba cansada, terminé el informe.', answer: 'Although I was tired, I finished the report.', hint: 'Aunque = although. Mantén ambos hechos en pasado.' },
      order: { words: ['New York.', 'never', 'I', 'visited', 'have'], answer: 'I have never visited New York.', prompt: 'Ordena la frase sobre una experiencia de vida.' },
      dictation: { answer: 'I have been learning English for three years.', prompt: 'Escucha y escribe la experiencia.' },
      writing: { prompt: 'Cuenta una experiencia que recuerdes (50–70 palabras). Usa al menos un conector y distingue los hechos terminados de la experiencia.', sample: 'Last summer, I visited a small coastal town. Although the weather was rainy, I enjoyed the trip. I have kept in touch with the friends I met there.', lines: 6 },
    },
    practice: {
      translation: { prompt: 'Aunque estaba cansada, terminé el informe.', answer: 'Although I was tired, I finished the report.', hint: 'Usa although para introducir el contraste.' },
      order: { words: ['since school.', 'Maya', 'known', 'I have'], answer: 'I have known Maya since school.', prompt: 'Ordena la frase sobre una experiencia que continúa.' },
      dictation: { answer: 'Have you ever tried surfing?', prompt: 'Escucha la pregunta y escríbela.' },
    },
  },
  {
    id: 'b2', cefr: 'B2', name: 'Fluidez independiente', subtitle: 'Argumenta con claridad', weeks: 'Semanas 13–24',
    module: 'Módulo modelo · Ideas y argumentos', lessonTitle: 'Defiende una idea', topic: 'Conectores · condicionales',
    objective: 'Presentar una postura, reconocer matices y justificar una propuesta con argumentos claros.',
    explanation: 'Los conectores hacen visible la relación entre ideas. Although introduce contraste; therefore muestra consecuencia. Las condicionales permiten hablar de hipótesis y resultados.',
    grammar: 'Although + oración. If + past perfect, would have + participio expresa una hipótesis irreal del pasado.',
    vocabulary: ['evidence · evidencia', 'whereas · mientras que', 'therefore · por lo tanto', 'trade-off · compensación', 'to address · abordar'],
    phrases: [
      { english: 'Although the schedule was tight, we finished on time.', spanish: 'Aunque el calendario era ajustado, terminamos a tiempo.', pronunciation: 'oldóu de skédyul was táit, uí fínisht on táim' },
      { english: 'If I had more time, I would volunteer.', spanish: 'Si tuviera más tiempo, sería voluntario.', pronunciation: 'if ai jad mor táim, ai wud voluntír' },
      { english: 'The proposal should be reviewed before approval.', spanish: 'La propuesta debería revisarse antes de aprobarla.', pronunciation: 'de propóusal shud bi rivíud bifór aprúval' },
      { english: 'What matters most is how we communicate the change.', spanish: 'Lo más importante es cómo comunicamos el cambio.', pronunciation: 'juat máters móust is jáu uí comiúniqueit de chéinch' },
      { english: 'I see your point; nevertheless, I would add one concern.', spanish: 'Entiendo tu punto; sin embargo, añadiría una inquietud.', pronunciation: 'ai sí ior point; neverthelés, ai wud ad uan consérn' },
    ],
    workbook: {
      title: 'Ideas y argumentos', instructions: 'Completa las estructuras, traduce con precisión el contraste y redacta una postura con apoyo y concesión.',
      fill: [
        { id: 'fill-1', prompt: 'Although the data was ____, the team published a cautious summary.', answer: 'incomplete' },
        { id: 'fill-2', prompt: 'If we had known earlier, we would have ____ the meeting.', answer: 'rescheduled' },
        { id: 'fill-3', prompt: 'The proposal should be ____ before it is approved.', answer: 'reviewed' },
        { id: 'fill-4', prompt: 'The evidence was limited; ____, the trend was consistent.', answer: 'nevertheless' },
      ],
      translation: { prompt: 'Si hubiéramos recibido los datos antes, habríamos llegado a otra conclusión.', answer: 'If we had received the data sooner, we would have reached a different conclusion.', hint: 'Usa past perfect en la condición y would have + participio en el resultado.' },
      order: { words: ['the trial,', 'Only after', 'the team', 'identified', 'the error.'], answer: 'Only after the trial did the team identify the error.', prompt: 'Ordena la frase con inversión después de Only after.' },
      dictation: { answer: 'Although the evidence was limited, the conclusion was persuasive.', prompt: 'Escucha y escribe la frase con contraste.' },
      writing: { prompt: 'Escribe una respuesta argumentada de 80–100 palabras. Incluye una postura, dos razones y una concesión.', sample: 'Remote work can improve focus because employees control their environment. It also reduces commuting time. Although collaboration may require more planning, clear routines can address this challenge.', lines: 8 },
    },
    practice: {
      translation: { prompt: 'Aunque el calendario era ajustado, terminamos a tiempo.', answer: 'Although the schedule was tight, we finished on time.', hint: 'Abre con Although y conserva el contraste.' },
      order: { words: ['would', 'had', 'If I', 'volunteer.', 'more time,'], answer: 'If I had more time, I would volunteer.', prompt: 'Ordena la hipótesis.' },
      dictation: { answer: 'Nevertheless, the proposal deserves further review.', prompt: 'Escucha la frase y escríbela.' },
    },
  },
  {
    id: 'c1', cefr: 'C1', name: 'Dominio avanzado', subtitle: 'Precisión y matices', weeks: 'Semanas 25–40',
    module: 'Módulo modelo · Registro y matices', lessonTitle: 'Afina el tono y el matiz', topic: 'Inversión · collocations · registro',
    objective: 'Elegir formulaciones precisas, matizar una afirmación y ajustar el tono a un contexto profesional.',
    explanation: 'En un nivel avanzado no basta con que la frase sea gramatical. El registro, la colocación y el grado de certeza ayudan a comunicar con precisión. “The findings call into question…” señala una reserva sin descartar todo el estudio.',
    grammar: 'La inversión enfática puede aparecer después de expresiones negativas: “Rarely have we seen…”. Usa mitigadores como arguably o to some extent para graduar una afirmación.',
    vocabulary: ['to call into question · poner en duda', 'albeit · aunque / si bien', 'arguably · podría decirse que', 'to substantiate · fundamentar', 'on balance · en conjunto'],
    phrases: [
      { english: 'The findings call into question the original assumption.', spanish: 'Los hallazgos ponen en duda la suposición original.', pronunciation: 'de fáindings kol intu kuéstchon di oríyinal asámpshon' },
      { english: 'To a large extent, the two approaches are compatible.', spanish: 'En gran medida, los dos enfoques son compatibles.', pronunciation: 'tu a larch ekstént, de tú apróuches ar compátibl' },
      { english: 'Rarely have we seen such a thoughtful response.', spanish: 'Rara vez hemos visto una respuesta tan reflexiva.', pronunciation: 'rérli jav ui sín sach a zótful respáns' },
      { english: 'The evidence is compelling, albeit not conclusive.', spanish: 'La evidencia es convincente, aunque no concluyente.', pronunciation: 'di évidens is compéling, olbíit not conclúsiv' },
      { english: 'On balance, a more measured tone would be preferable.', spanish: 'En conjunto, sería preferible un tono más mesurado.', pronunciation: 'on bálans, a mor méshurd tón wud bi préfərabl' },
    ],
    workbook: {
      title: 'Precisión y registro', instructions: 'Completa las colocaciones, traduce preservando los matices y reescribe el mensaje con un registro profesional.',
      fill: [
        { id: 'fill-1', prompt: 'The findings call into ____ the original assumption.', answer: 'question' },
        { id: 'fill-2', prompt: 'The evidence is compelling, ____ not entirely conclusive.', answer: 'albeit' },
        { id: 'fill-3', prompt: 'Rarely ____ we encountered such a nuanced account.', answer: 'have' },
        { id: 'fill-4', prompt: 'The claim should be ____ by further evidence.', answer: 'substantiated' },
      ],
      translation: { prompt: 'No se trata tanto de reducir el coste como de hacerlo más previsible.', answer: 'It is less about reducing the cost than making it more predictable.', hint: 'La estructura It is less about X than Y conserva el matiz de «no tanto… como…».' },
      order: { words: ['a nuanced', 'Rarely', 'have we seen', 'response to', 'such', 'a setback.'], answer: 'Rarely have we seen such a nuanced response to a setback.', prompt: 'Ordena la frase y conserva la inversión enfática.' },
      dictation: { answer: 'The evidence is compelling, albeit not entirely conclusive.', prompt: 'Escucha la frase y escríbela respetando el matiz.' },
      writing: { prompt: 'Reescribe el mensaje informal con un registro profesional y prudente: «The numbers look weird, so I don’t think this plan works.» Explica en 2–3 frases qué matiz cambiaste.', sample: 'The figures appear to warrant further review, and it may be premature to conclude that the proposal is viable. A more detailed assessment would help establish the underlying cause.', lines: 7 },
    },
    practice: {
      translation: { prompt: 'La evidencia es convincente, aunque no concluyente.', answer: 'The evidence is compelling, albeit not conclusive.', hint: 'Albeit introduce una concesión concisa y formal.' },
      order: { words: ['the original', 'into question', 'The findings', 'assumption.', 'call'], answer: 'The findings call into question the original assumption.', prompt: 'Ordena la colocación avanzada.' },
      dictation: { answer: 'On balance, a more measured tone would be preferable.', prompt: 'Escucha la frase y escríbela.' },
    },
  },
];

export const getLevel = (id: LevelId): LevelData => levels.find((level) => level.id === id) ?? levels[0]!;
