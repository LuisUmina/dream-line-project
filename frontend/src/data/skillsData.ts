import { SkillSection, Lesson, Question } from '../types';

const fundamentalsQuestions: Question[] = [
  {
    id: 'var-1',
    type: 'multiple_choice',
    question: '¿Cuál es la forma correcta de declarar una variable en JavaScript?',
    options: ['var nombre = "Juan";', 'variable nombre = "Juan";', 'declare nombre = "Juan";', 'string nombre = "Juan";'],
    correctAnswer: 'var nombre = "Juan";',
    explanation: 'En JavaScript, usamos "var", "let" o "const" para declarar variables.',
    difficulty: 'beginner',
    topic: 'variables',
    xp: 50,
  },
  {
    id: 'var-2',
    type: 'code_completion',
    question: 'Completa el código para crear una variable llamada "edad" con valor 25:',
    options: ['let edad = ___;', 'const edad = ___;', 'var edad = ___;'],
    correctAnswer: '25',
    explanation: 'El valor 25 es un número entero que se asigna directamente sin comillas.',
    difficulty: 'beginner',
    topic: 'variables',
    xp: 75,
  },
  {
    id: 'cond-1',
    type: 'multiple_choice',
    question: '¿Cuál es el operador correcto para "igual a" en JavaScript?',
    options: ['=', '==', '===', '!='],
    correctAnswer: '===',
    explanation: 'El operador === compara valor y tipo, siendo más estricto que ==.',
    difficulty: 'beginner',
    topic: 'conditionals',
    xp: 60,
  },
  {
    id: 'loop-1',
    type: 'debugging',
    question: 'Encuentra el error en este bucle:\nfor (let i = 0; i < 10; i--) {\n  console.log(i);\n}',
    options: ['i++', 'i--', 'i < 10', 'let i = 0'],
    correctAnswer: 'i--',
    explanation: 'El bucle debería usar i++ para incrementar, no i-- que causa un bucle infinito.',
    difficulty: 'intermediate',
    topic: 'loops',
    xp: 100,
  },
];

export const skillsData: SkillSection[] = [
  {
    id: 'fundamentals',
    title: 'Fundamentos de Programación',
    description: 'Aprende los conceptos básicos de programación',
    icon: '💻',
    isUnlocked: true,
    lessons: [
      {
        id: 'variables-basics',
        title: 'Variables',
        description: 'Aprende qué son las variables y cómo usarlas',
        topic: 'variables',
        difficulty: 'beginner',
        xpReward: 100,
        prerequisites: [],
        isLocked: false,
        isCompleted: true,
        content: `
          Las variables son contenedores que almacenan datos. En JavaScript, puedes declararlas usando:
          
          • var: Forma tradicional (evitar en código moderno)
          • let: Para variables que pueden cambiar
          • const: Para constantes que no cambian
          
          Ejemplos:
          let nombre = "Ana";
          const edad = 25;
          let puntuacion = 0;
        `,
        questions: fundamentalsQuestions.filter(q => q.topic === 'variables'),
      },
      {
        id: 'data-types',
        title: 'Tipos de Datos',
        description: 'Números, texto, booleanos y más',
        topic: 'data-types',
        difficulty: 'beginner',
        xpReward: 120,
        prerequisites: ['variables-basics'],
        isLocked: false,
        isCompleted: true,
        content: `
          JavaScript tiene varios tipos de datos:
          
          • Números: 42, 3.14, -7
          • Texto (strings): "Hola", 'Mundo'
          • Booleanos: true, false
          • null y undefined
          • Objetos y arrays
          
          Ejemplos:
          let numero = 42;
          let mensaje = "¡Hola!";
          let esVerdad = true;
        `,
        questions: [],
      },
      {
        id: 'conditionals',
        title: 'Condicionales',
        description: 'Toma decisiones en tu código',
        topic: 'conditionals',
        difficulty: 'beginner',
        xpReward: 150,
        prerequisites: ['data-types'],
        isLocked: false,
        isCompleted: false,
        content: `
          Los condicionales permiten que tu programa tome decisiones:
          
          • if: Ejecuta código si una condición es verdadera
          • else: Ejecuta código si la condición es falsa
          • else if: Múltiples condiciones
          
          Ejemplo:
          if (edad >= 18) {
            console.log("Eres mayor de edad");
          } else {
            console.log("Eres menor de edad");
          }
        `,
        questions: fundamentalsQuestions.filter(q => q.topic === 'conditionals'),
      },
      {
        id: 'loops',
        title: 'Bucles',
        description: 'Repite acciones de forma eficiente',
        topic: 'loops',
        difficulty: 'intermediate',
        xpReward: 180,
        prerequisites: ['conditionals'],
        isLocked: true,
        isCompleted: false,
        content: `
          Los bucles repiten código múltiples veces:
          
          • for: Cuando sabes cuántas veces repetir
          • while: Mientras una condición sea verdadera
          • forEach: Para arrays
          
          Ejemplo:
          for (let i = 0; i < 5; i++) {
            console.log("Número: " + i);
          }
        `,
        questions: fundamentalsQuestions.filter(q => q.topic === 'loops'),
      },
      {
        id: 'functions',
        title: 'Funciones',
        description: 'Organiza tu código en bloques reutilizables',
        topic: 'functions',
        difficulty: 'intermediate',
        xpReward: 200,
        prerequisites: ['loops'],
        isLocked: true,
        isCompleted: false,
        content: `
          Las funciones son bloques de código reutilizable:
          
          • function: Declaración tradicional
          • Arrow functions: Sintaxis moderna
          • Parámetros y valores de retorno
          
          Ejemplo:
          function saludar(nombre) {
            return "¡Hola, " + nombre + "!";
          }
          
          const suma = (a, b) => a + b;
        `,
        questions: [],
      },
    ],
  },
];