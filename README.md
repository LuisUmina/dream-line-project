# Proyecto Educativo con Gemini AI

Este proyecto es una plataforma educativa que utiliza la API de Gemini AI para generar quizzes personalizados basados en temas y documentos de referencia.

## Configuración del Entorno

1. Clona este repositorio
2. Instala las dependencias con `npm install`
3. Copia el archivo `.env.example` a `.env` (o crea uno nuevo)
4. Agrega tu API key de Gemini AI en el archivo `.env`:

```
VITE_GEMINI_API_KEY=tu_api_key_aqui
```

5. Inicia el servidor de desarrollo con `npm run dev`

## Funcionalidades

- Lecciones interactivas sobre programación
- Generación de quizzes personalizados con Gemini AI
- Carga de documentos (PDF, TXT, Word) como referencia para la generación de preguntas
- Seguimiento de progreso y sistema de puntos XP

## Tecnologías

- React + TypeScript
- Vite
- Tailwind CSS
- Gemini AI API
