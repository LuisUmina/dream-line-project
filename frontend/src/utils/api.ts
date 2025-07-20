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

// AI Agent question generator (reemplaza Gemini)
export async function generateQuestionsWithGemini(topic: string, content?: string): Promise<Question[]> {
  // Validar que se haya proporcionado contenido del documento
  if (!content) {
    throw new Error("El documento de referencia es obligatorio para generar preguntas con IA.");
  }

  try {
    // Paso 1: Setup del agente
    console.log("Configurando agente con:", { topic, documentLength: content.length });
    
    const setupResponse = await fetch('http://localhost:8000/api/setup-agent/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: topic,
        system_prompt: `You are a helpful assistant that specializes in ${topic}`,
        documents: [content]
      })
    });

    if (!setupResponse.ok) {
      throw new Error(`Error al configurar el agente: ${setupResponse.status} ${setupResponse.statusText}`);
    }

    const setupData = await setupResponse.json();
    console.log("Agente configurado:", setupData);

    const agentId = setupData._id;
    // const knowledgeSummary = setupData.knowledge_summary; // Guardado para uso futuro

    if (!agentId) {
      throw new Error("No se recibió un ID válido del agente.");
    }

    // Paso 2: Generar preguntas usando el agente
    console.log("Generando preguntas con agente ID:", agentId);
    
    const questionsResponse = await fetch(`http://localhost:8000/api/agent/${agentId}/generate-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        num_questions: 5,
        difficulty: "advanced"
      })
    });

    if (!questionsResponse.ok) {
      throw new Error(`Error al generar preguntas: ${questionsResponse.status} ${questionsResponse.statusText}`);
    }

    const questionsData = await questionsResponse.json();
    console.log("Preguntas generadas por la API:", questionsData);

    // Transformar las preguntas al formato esperado
    const transformedQuestions: Question[] = questionsData.map((q: any, index: number) => {
      const correctAnswerText = q.options[q.correctAnswer]; // Obtener el texto de la respuesta correcta usando el índice
      console.log(`Pregunta ${index + 1}:`, {
        originalCorrectAnswer: q.correctAnswer,
        correctAnswerText,
        options: q.options,
        explanation: q.explanation
      });
      
      return {
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options,
        correctAnswer: correctAnswerText, // Usar el texto de la respuesta correcta
        explanation: q.explanation || correctAnswerText, // Si la explicación está vacía, usar la respuesta correcta
        difficulty: q.difficulty,
        topic: q.topic,
        xp: q.xp
      };
    });

    console.log("Preguntas transformadas:", transformedQuestions);

    return transformedQuestions;

  } catch (error) {
    console.error('Error conectando con la API local:', error);
    
    // Si hay error con la API local, mostrar mensaje específico y usar fallback
    throw new Error(`No se pudo conectar con la API local (${error instanceof Error ? error.message : 'Error desconocido'}). Verifica que el servidor esté ejecutándose en http://localhost:8000`);
  }
}

export async function submitAnswer(questionId: string, answer: string, correctAnswer: string): Promise<{
  isCorrect: boolean;
  feedback: string;
  xpEarned: number;
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Validar la respuesta comparando con la respuesta correcta
  console.log('Validando respuesta:', { questionId, answer, correctAnswer });
  
  const isCorrect = answer === correctAnswer;
  
  return {
    isCorrect,
    feedback: isCorrect 
      ? '¡Excelente! Tu respuesta es correcta.' 
      : `No es correcto. La respuesta correcta es: "${correctAnswer}". Revisa el concepto e inténtalo de nuevo.`,
    xpEarned: isCorrect ? 50 : 10,
  };
}