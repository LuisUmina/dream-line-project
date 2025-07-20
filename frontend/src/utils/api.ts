import { Question } from '../types';

/**
 * Extrae texto de diferentes tipos de archivos
 * @param file Archivo del que extraer texto (PDF, TXT, DOCX)
 * @returns Texto extraído del archivo
 */
export async function extractTextFromFile(file: File): Promise<string> {
  try {
    // Para archivos de texto plano (TXT)
    if (file.type === 'text/plain') {
      return await file.text();
    }
    
    // Para otros formatos (PDF, DOCX) en un entorno real 
    // se usarían bibliotecas específicas como pdf.js, mammoth.js, etc.
    // Pero para esta implementación, simulamos la extracción
    
    if (file.type === 'application/pdf' || 
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Simulamos un tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En producción, aquí se implementaría la extracción real
      // Por ahora devolvemos un mensaje informativo
      return `Contenido extraído de ${file.name} (${Math.round(file.size/1024)} KB).\n\n` +
             `En un entorno de producción, aquí se mostraría el contenido real extraído del ${file.type === 'application/pdf' ? 'PDF' : 'documento Word'}. ` +
             `Este texto será enviado a la API de Gemini junto con el tema para generar preguntas personalizadas.`;
    }
    
    throw new Error(`Tipo de archivo no soportado: ${file.type}`);
  } catch (error) {
    console.error('Error al extraer texto del archivo:', error);
    throw error;
  }
}

// Regular question generator (mock)
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

// Gemini AI question generator
export async function generateQuestionsWithGemini(topic: string, content?: string): Promise<Question[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Obtenemos la API key de las variables de entorno
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.warn("API Key de Gemini no configurada. Usando respuestas simuladas.");
    // Si no hay API key, usamos la simulación
    const prompt = content 
      ? `Genera un quiz educativo sobre ${topic} basado en el siguiente contenido: ${content}`
      : `Genera un quiz educativo sobre ${topic}`;
    
    console.log("Prompt enviado a Gemini (simulación):", prompt);
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });
    const data = await response.json();
  }
  
  // Mock Gemini generated questions based on topic and content
  const geminiQuestions: Question[] = [
    {
      id: `gemini-${topic}-1`,
      type: 'multiple_choice',
      question: `¿Cuál es un principio fundamental de ${topic}?`,
      options: [
        'Abstracción y modelado de datos',
        'Compilación en tiempo real',
        'Renderizado estático',
        'Búsqueda secuencial'
      ],
      correctAnswer: 'Abstracción y modelado de datos',
      explanation: `La abstracción y el modelado de datos son principios fundamentales en ${topic} que permiten representar conceptos complejos de manera simplificada.`,
      difficulty: 'beginner',
      topic: topic.toLowerCase(),
      xp: 85,
    },
    {
      id: `gemini-${topic}-2`,
      type: 'multiple_choice',
      question: `En el contexto de ${topic}, ¿qué significa la optimización?`,
      options: [
        'Mejorar el rendimiento y eficiencia',
        'Añadir más características',
        'Aumentar el tamaño del código',
        'Eliminar la documentación'
      ],
      correctAnswer: 'Mejorar el rendimiento y eficiencia',
      explanation: `La optimización en ${topic} se refiere al proceso de mejorar el rendimiento y la eficiencia de un sistema sin comprometer su funcionalidad.`,
      difficulty: 'intermediate',
      topic: topic.toLowerCase(),
      xp: 110,
    },
    {
      id: `gemini-${topic}-3`,
      type: 'code_completion',
      question: `Completa el siguiente código relacionado con ${topic}:`,
      options: [
        `function implement${topic}() { /* código aquí */ }`,
        `class ${topic}Manager { constructor() { this.data = []; } }`,
        `const ${topic.toLowerCase()}Config = { enabled: true, mode: 'advanced' };`
      ],
      correctAnswer: `class ${topic}Manager { constructor() { this.data = []; } }`,
      explanation: `Esta implementación crea una clase para manejar operaciones relacionadas con ${topic}, siguiendo las mejores prácticas de programación orientada a objetos.`,
      difficulty: 'intermediate',
      topic: topic.toLowerCase(),
      xp: 120,
    },
    {
      id: `gemini-${topic}-4`,
      type: 'debugging',
      question: `Identifica el error en este código de ${topic}:`,
      options: [
        'Error de sintaxis',
        'Error lógico',
        'Error de referencia',
        'Error de tipo'
      ],
      correctAnswer: 'Error lógico',
      explanation: `Los errores lógicos en ${topic} son especialmente complicados porque el código se ejecuta pero no produce el resultado esperado. Este tipo de errores requiere un análisis cuidadoso del flujo y la lógica del programa.`,
      difficulty: 'advanced',
      topic: topic.toLowerCase(),
      xp: 150,
    },
    {
      id: `gemini-${topic}-5`,
      type: 'multiple_choice',
      question: `¿Cuál es una ventaja clave de utilizar ${topic} en proyectos modernos?`,
      options: [
        'Escalabilidad y mantenibilidad',
        'Menor necesidad de pruebas',
        'Eliminar la necesidad de documentación',
        'Reducir el número de desarrolladores'
      ],
      correctAnswer: 'Escalabilidad y mantenibilidad',
      explanation: `La escalabilidad y mantenibilidad son ventajas clave de ${topic} en proyectos modernos, permitiendo que las aplicaciones crezcan y se adapten a nuevas necesidades sin requerir reescrituras completas.`,
      difficulty: 'beginner',
      topic: topic.toLowerCase(),
      xp: 90,
    }
  ];

  return geminiQuestions;
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