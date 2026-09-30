import type { LevelId } from './course';

export interface CourseUnit {
  id: string;
  level: LevelId;
  number: number;
  title: string;
  topic: string;
  objective: string;
  grammar: string;
  vocabulary: string[];
}

const unit = (level: LevelId, number: number, title: string, topic: string, objective: string, grammar: string, vocabulary: string[]): CourseUnit => ({ id: `${level}-unit-${number}`, level, number, title, topic, objective, grammar, vocabulary });

export const curriculum: CourseUnit[] = [
  unit('a1', 1, 'Saludos y presentaciones', 'Hello / Hi · verbo to be', 'Saludar, presentarte y responder cómo estás.', 'I am / You are · preguntas con be.', ['hello · hola', 'name · nombre', 'fine · bien']),
  unit('a1', 2, 'Datos personales', 'Información básica · preguntas Wh-', 'Dar tu edad, nacionalidad, teléfono y correo.', 'What / Where / How old · my / your.', ['age · edad', 'country · país', 'number · número']),
  unit('a1', 3, 'Familia y personas', 'Have got · posesivos', 'Describir a tu familia y relaciones cercanas.', 'I have got · his / her · plurales.', ['family · familia', 'brother · hermano', 'kind · amable']),
  unit('a1', 4, 'Casa y objetos', 'There is / There are · preposiciones', 'Decir qué hay en una habitación y dónde está.', 'There is / are · in / on / under.', ['room · habitación', 'table · mesa', 'next to · al lado de']),
  unit('a1', 5, 'Rutinas diarias', 'Present simple · horas', 'Contar tu rutina y decir cuándo haces algo.', 'I work · do you…? · at / in / on.', ['usually · normalmente', 'morning · mañana', 'start · empezar']),
  unit('a1', 6, 'Comida y compras', 'Would like · cantidades', 'Pedir comida, comprar productos y preguntar precios.', 'I would like · some / any · How much?', ['menu · menú', 'price · precio', 'water · agua']),
  unit('a1', 7, 'Ciudad y direcciones', 'Imperatives · can', 'Pedir y dar indicaciones sencillas.', 'Turn left · go straight · Can you…?', ['street · calle', 'left · izquierda', 'near · cerca']),
  unit('a1', 8, 'Repaso y situación final', 'Integración A1', 'Mantener una conversación corta sobre tu vida cotidiana.', 'Repaso de be, have, present simple y preguntas.', ['review · repaso', 'understand · entender', 'conversation · conversación']),
  unit('a2', 1, 'Rutinas y tiempo libre', 'Present simple · adverbs', 'Describir hábitos y actividades de ocio.', 'Always / usually / sometimes · preguntas con do.', ['free time · tiempo libre', 'often · a menudo', 'weekend · fin de semana']),
  unit('a2', 2, 'Viajes y transporte', 'Past simple · travel', 'Contar un viaje y resolver situaciones prácticas.', 'Regular and irregular past · ago / last.', ['ticket · billete', 'arrive · llegar', 'platform · andén']),
  unit('a2', 3, 'Salud y bienestar', 'Should · symptoms', 'Describir un problema de salud y pedir consejo.', 'Should / shouldn’t · have to.', ['headache · dolor de cabeza', 'rest · descansar', 'appointment · cita']),
  unit('a2', 4, 'Planes futuros', 'Going to · will', 'Hablar de planes, predicciones y compromisos.', 'Be going to · will · present continuous.', ['plan · plan', 'tomorrow · mañana', 'probably · probablemente']),
  unit('a2', 5, 'Trabajo y estudios', 'Comparatives · abilities', 'Describir tareas, habilidades y preferencias.', 'Can / can’t · -er / more.', ['skill · habilidad', 'easy · fácil', 'improve · mejorar']),
  unit('a2', 6, 'Historias cotidianas', 'Past continuous', 'Narrar lo que estaba ocurriendo en un momento pasado.', 'Was / were + -ing · when / while.', ['suddenly · de repente', 'happen · ocurrir', 'while · mientras']),
  unit('a2', 7, 'Opiniones sencillas', 'Because · but · so', 'Dar opiniones y explicar razones con claridad.', 'Linkers · too / enough.', ['agree · estar de acuerdo', 'prefer · preferir', 'reason · razón']),
  unit('a2', 8, 'Repaso funcional', 'Integración A2', 'Resolver una conversación cotidiana de principio a fin.', 'Repaso de tiempos, modales y conectores.', ['review · repaso', 'choice · elección', 'solution · solución']),
  unit('b1', 1, 'Experiencias personales', 'Past simple · present perfect', 'Contar experiencias y conectar pasado y presente.', 'Have + past participle · since / for.', ['experience · experiencia', 'ever · alguna vez', 'recently · recientemente']),
  unit('b1', 2, 'Historias y eventos', 'Narrative tenses', 'Organizar una historia con contexto y secuencia.', 'Past simple · past continuous · past perfect.', ['scene · escena', 'meanwhile · mientras tanto', 'finally · finalmente']),
  unit('b1', 3, 'Opiniones y argumentos', 'Linkers · modals', 'Expresar una postura y justificarla.', 'Although · however · might.', ['opinion · opinión', 'evidence · evidencia', 'suggest · sugerir']),
  unit('b1', 4, 'Trabajo y proyectos', 'Present perfect continuous', 'Describir procesos, objetivos y resultados.', 'Have been + -ing · used to.', ['deadline · fecha límite', 'progress · progreso', 'responsible · responsable']),
  unit('b1', 5, 'Medios y tecnología', 'Passive voice', 'Explicar cómo se crean y usan productos.', 'Is made · was designed · by.', ['device · dispositivo', 'privacy · privacidad', 'feature · función']),
  unit('b1', 6, 'Decisiones y problemas', 'First / second conditional', 'Analizar opciones y proponer soluciones.', 'If + present / past · would.', ['option · opción', 'risk · riesgo', 'solve · resolver']),
  unit('b1', 7, 'Sociedad y cambio', 'Relative clauses', 'Describir personas, ideas y cambios sociales.', 'Who / which / that · defining clauses.', ['community · comunidad', 'impact · impacto', 'change · cambio']),
  unit('b1', 8, 'Repaso comunicativo', 'Integración B1', 'Mantener una conversación autónoma y bien conectada.', 'Repaso de tiempos, voz pasiva y condicionales.', ['fluency · fluidez', 'clarify · aclarar', 'summarize · resumir']),
  unit('b2', 1, 'Ideas y argumentos', 'Connectors · conditionals', 'Defender una postura con razones y concesiones.', 'Although · therefore · mixed conditionals.', ['claim · afirmación', 'trade-off · compensación', 'nevertheless · sin embargo']),
  unit('b2', 2, 'Trabajo profesional', 'Formal register', 'Participar en reuniones y presentar propuestas.', 'Hedging · indirect questions.', ['agenda · agenda', 'outcome · resultado', 'stakeholder · parte interesada']),
  unit('b2', 3, 'Debate y negociación', 'Concession · emphasis', 'Debatir, matizar y negociar acuerdos.', 'Even though · what matters is…', ['negotiate · negociar', 'concern · inquietud', 'compromise · compromiso']),
  unit('b2', 4, 'Investigación y datos', 'Reporting verbs', 'Resumir información y valorar evidencia.', 'It is believed · the study suggests.', ['finding · hallazgo', 'trend · tendencia', 'reliable · fiable']),
  unit('b2', 5, 'Cultura y sociedad', 'Nuance · collocations', 'Comparar perspectivas culturales con precisión.', 'Both…and · whereas · despite.', ['perspective · perspectiva', 'whereas · mientras que', 'diverse · diverso']),
  unit('b2', 6, 'Problemas complejos', 'Inversion · discourse', 'Explicar causas, consecuencias y alternativas.', 'Not only… but also · rarely.', ['consequence · consecuencia', 'underlying · subyacente', 'address · abordar']),
  unit('b2', 7, 'Presentaciones', 'Signposting', 'Presentar una idea de manera estructurada.', 'First of all · moving on · to conclude.', ['highlight · destacar', 'framework · marco', 'recommendation · recomendación']),
  unit('b2', 8, 'Repaso avanzado', 'Integración B2', 'Comunicar una posición compleja con fluidez.', 'Repaso de registro, conectores y matices.', ['coherent · coherente', 'persuasive · convincente', 'refine · perfeccionar']),
  unit('c1', 1, 'Registro y matices', 'Inversion · collocations', 'Elegir formulaciones precisas para un contexto profesional.', 'Rarely have we… · arguably · albeit.', ['nuance · matiz', 'measured · mesurado', 'compelling · convincente']),
  unit('c1', 2, 'Análisis crítico', 'Evaluation language', 'Evaluar afirmaciones y limitar conclusiones.', 'It would appear · to some extent.', ['limitation · limitación', 'assumption · suposición', 'substantiate · fundamentar']),
  unit('c1', 3, 'Persuasión ética', 'Rhetoric · emphasis', 'Persuadir sin exagerar y anticipar objeciones.', 'Notwithstanding · the point is that…', ['objection · objeción', 'rationale · fundamento', 'incentive · incentivo']),
  unit('c1', 4, 'Investigación avanzada', 'Nominalisation', 'Sintetizar hallazgos con lenguaje académico.', 'Nominal clauses · passive reporting.', ['methodology · metodología', 'correlation · correlación', 'implication · implicación']),
  unit('c1', 5, 'Comunicación ejecutiva', 'Conciseness · tone', 'Redactar mensajes claros, breves y diplomáticos.', 'Would you mind · I would suggest.', ['concise · conciso', 'diplomatic · diplomático', 'feasible · viable']),
  unit('c1', 6, 'Perspectivas globales', 'Hedging · contrast', 'Comparar perspectivas y reconocer incertidumbre.', 'While it is true that · nevertheless.', ['consensus · consenso', 'polarisation · polarización', 'arguably · podría decirse que']),
  unit('c1', 7, 'Debate académico', 'Complex discourse', 'Responder a preguntas difíciles con precisión.', 'Insofar as · provided that · whereby.', ['counterargument · contraargumento', 'premise · premisa', 'derive · derivar']),
  unit('c1', 8, 'Dominio integrado', 'Integración C1', 'Sostener una interacción avanzada con autonomía y matices.', 'Repaso de registro, precisión y discurso complejo.', ['mastery · dominio', 'synthesis · síntesis', 'articulate · expresar']),
];

export function unitsForLevel(level: LevelId): CourseUnit[] {
  return curriculum.filter((item) => item.level === level);
}

export function getUnit(level: LevelId, id?: string): CourseUnit {
  return unitsForLevel(level).find((item) => item.id === id) ?? unitsForLevel(level)[0];
}
