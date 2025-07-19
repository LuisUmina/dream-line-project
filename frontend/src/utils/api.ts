import { Question } from '../types';

// Mock OpenAI API call for generating questions
export async function generateQuestions(topic: string): Promise<Question[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock questions based on topic
  const mockQuestions: Question[] = [
    {
      id: `${topic}-gen-1`,
      type: 'multiple_choice',
      question: `¿Cuál es un concepto importante sobre ${topic}?`,
      options: [
        'Es fundamental para programar',
        'No es necesario aprenderlo',
        'Solo se usa en JavaScript',
        'Es obsoleto'
      ],
      correctAnswer: 'Es fundamental para programar',
      explanation: `${topic} es un concepto esencial en programación que todo desarrollador debe dominar.`,
      difficulty: 'beginner',
      topic: topic.toLowerCase(),
      xp: 75,
    },
    {
      id: `${topic}-gen-2`,
      type: 'code_completion',
      question: `Completa este código relacionado con ${topic}:`,
      options: [`// Código sobre ${topic}`, `console.log("Aprendiendo ${topic}");`],
      correctAnswer: topic,
      explanation: `Esta es una implementación básica de ${topic}.`,
      difficulty: 'intermediate',
      topic: topic.toLowerCase(),
      xp: 100,
    },
    {
      id: `${topic}-gen-3`,
      type: 'debugging',
      question: `Encuentra el error en este código sobre ${topic}:`,
      options: ['Sintaxis incorrecta', 'Variable no definida', 'Lógica errónea'],
      correctAnswer: 'Sintaxis incorrecta',
      explanation: `En este caso, el error está en la sintaxis del ${topic}.`,
      difficulty: 'advanced',
      topic: topic.toLowerCase(),
      xp: 125,
    },
  ];

  return mockQuestions;
}

export async function submitAnswer(questionId: string, answer: string): Promise<{
  isCorrect: boolean;
  feedback: string;
  xpEarned: number;
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock response
  const isCorrect = Math.random() > 0.3; // 70% chance of being correct
  
  return {
    isCorrect,
    feedback: isCorrect 
      ? '¡Excelente! Tu respuesta es correcta.' 
      : 'No es correcto. Revisa el concepto e inténtalo de nuevo.',
    xpEarned: isCorrect ? 50 : 10,
  };
}