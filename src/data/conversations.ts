import type { LevelId } from './course';

export interface ConversationTopic {
  id: string;
  level: LevelId;
  title: string;
  description: string;
  opening: string;
  openingTranslation: string;
  prompts: string[];
  vocabulary: string[];
}

export const conversationTopics: ConversationTopic[] = [
  { id: 'a1-introductions', level: 'a1', title: 'Presentaciones', description: 'Saluda, di tu nombre y habla de ti.', opening: 'Hi! I’m Alex. What’s your name and where are you from?', openingTranslation: '¡Hola! Soy Alex. ¿Cómo te llamas y de dónde eres?', prompts: ['Say your name.', 'Tell me where you are from.', 'Say how you feel today.'], vocabulary: ['name · nombre', 'from · de', 'fine · bien'] },
  { id: 'a1-cafe', level: 'a1', title: 'En una cafetería', description: 'Pide una bebida y algo sencillo de comer.', opening: 'Welcome! What would you like to drink today?', openingTranslation: '¡Bienvenido! ¿Qué te gustaría beber hoy?', prompts: ['Order a drink.', 'Ask for the price.', 'Say thank you.'], vocabulary: ['water · agua', 'coffee · café', 'please · por favor'] },
  { id: 'a2-routine', level: 'a2', title: 'Mi rutina', description: 'Habla de tus horarios y actividades diarias.', opening: 'Tell me about a normal day in your life.', openingTranslation: 'Háblame de un día normal en tu vida.', prompts: ['Say when you get up.', 'Describe your work or studies.', 'Tell me what you do after work.'], vocabulary: ['usually · normalmente', 'start · empezar', 'after · después'] },
  { id: 'a2-travel', level: 'a2', title: 'Viaje y hotel', description: 'Resuelve una situación práctica durante un viaje.', opening: 'Hello! You have a reservation for two nights. How can I help?', openingTranslation: '¡Hola! Tienes una reserva para dos noches. ¿Cómo puedo ayudarte?', prompts: ['Ask about breakfast.', 'Request a different room.', 'Ask what time checkout is.'], vocabulary: ['reservation · reserva', 'room · habitación', 'checkout · salida'] },
  { id: 'b1-stories', level: 'b1', title: 'Una experiencia', description: 'Cuenta algo que te ocurrió y explica cómo te sentiste.', opening: 'What is an experience you remember clearly?', openingTranslation: '¿Qué experiencia recuerdas claramente?', prompts: ['Set the scene.', 'Explain what happened.', 'Say what you learned.'], vocabulary: ['experience · experiencia', 'although · aunque', 'learn · aprender'] },
  { id: 'b1-opinions', level: 'b1', title: 'Opiniones y razones', description: 'Expresa una opinión y apóyala con razones.', opening: 'What is one thing you would like to change in your city?', openingTranslation: '¿Qué cambiarías en tu ciudad?', prompts: ['State your opinion.', 'Give one reason.', 'Mention a possible solution.'], vocabulary: ['because · porque', 'however · sin embargo', 'solution · solución'] },
  { id: 'b2-interview', level: 'b2', title: 'Entrevista de trabajo', description: 'Practica respuestas claras y profesionales.', opening: 'Thanks for coming. Could you tell me about your experience?', openingTranslation: 'Gracias por venir. ¿Puedes contarme tu experiencia?', prompts: ['Describe a strength.', 'Give an example of a challenge.', 'Explain what you want to learn.'], vocabulary: ['strength · fortaleza', 'challenge · desafío', 'achieve · lograr'] },
  { id: 'b2-debate', level: 'b2', title: 'Debate y matices', description: 'Defiende una postura, concede un punto y matiza.', opening: 'Should people work from home whenever possible?', openingTranslation: '¿Debería la gente trabajar desde casa siempre que sea posible?', prompts: ['Give your position.', 'Acknowledge another view.', 'Propose a compromise.'], vocabulary: ['although · aunque', 'whereas · mientras que', 'trade-off · equilibrio'] },
  { id: 'c1-proposals', level: 'c1', title: 'Propuesta profesional', description: 'Presenta una idea con precisión y registro profesional.', opening: 'Let’s discuss your proposal and the evidence behind it.', openingTranslation: 'Hablemos de tu propuesta y de la evidencia que la respalda.', prompts: ['Frame the problem.', 'Qualify your claim.', 'Recommend a next step.'], vocabulary: ['evidence · evidencia', 'arguably · podría decirse que', 'recommend · recomendar'] },
  { id: 'c1-nuance', level: 'c1', title: 'Matices y perspectivas', description: 'Compara perspectivas y expresa reservas con elegancia.', opening: 'The findings are interesting, but what limitations should we consider?', openingTranslation: 'Los resultados son interesantes, pero ¿qué limitaciones debemos considerar?', prompts: ['Name a limitation.', 'Compare two perspectives.', 'Reach a measured conclusion.'], vocabulary: ['limitation · limitación', 'nevertheless · sin embargo', 'to some extent · hasta cierto punto'] },
];

export function topicsForLevel(level: LevelId): ConversationTopic[] {
  return conversationTopics.filter((topic) => topic.level === level);
}

export function getConversationTopic(id: string): ConversationTopic {
  return conversationTopics.find((topic) => topic.id === id) ?? conversationTopics[0];
}
