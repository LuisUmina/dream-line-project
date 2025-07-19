import google.generativeai as genai
from typing import List
from models import Question
from config import settings
from db import agents_collection
from bson import ObjectId
import json
import random

# Configure the Gemini client
genai.configure(api_key=settings.GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

async def generate_questions(agent_id: str, num_questions: int = 5, difficulty: str = None) -> List[Question]:
    """
    Generate questions based on an agent's knowledge and topic using Gemini AI
    """
    
    # Get the agent's configuration to determine the topic and knowledge
    agent_config = await agents_collection.find_one({"_id": ObjectId(agent_id)})
    if not agent_config:
        raise ValueError("Agent not found")
    
    knowledge_summary = agent_config.get('knowledge_summary', '')
    agent_name = agent_config.get('name', 'conocimiento general')
    
    # Check if knowledge_summary is empty or too short
    if not knowledge_summary or len(knowledge_summary.strip()) < 10:
        print(f"DEBUG - Knowledge summary is empty or too short: '{knowledge_summary}'")
        print("DEBUG - Using fallback questions due to insufficient knowledge")
        return _create_fallback_questions(agent_id, agent_name, num_questions, difficulty)
    
    print(f"DEBUG - Agent: {agent_name}, Knowledge length: {len(knowledge_summary)} chars")
    
    difficulty_filter = f" de nivel {difficulty}" if difficulty else ""
    
    # Determine how many text questions to generate (25% probability)
    num_text_questions = 0
    num_multiple_choice = num_questions
    
    for _ in range(num_questions):
        if random.random() < 0.25:  # 25% chance
            num_text_questions += 1
            num_multiple_choice -= 1
    
    print(f"DEBUG - Generating {num_multiple_choice} multiple choice and {num_text_questions} text questions")
    
    all_questions = []
    
    # Generate multiple choice questions
    if num_multiple_choice > 0:
        mc_questions = await _generate_multiple_choice_questions(agent_id, agent_name, knowledge_summary, num_multiple_choice, difficulty)
        all_questions.extend(mc_questions)
    
    # Generate text questions
    if num_text_questions > 0:
        text_questions = await _generate_text_questions(agent_id, agent_name, knowledge_summary, num_text_questions, difficulty)
        all_questions.extend(text_questions)
    
    # Shuffle the questions to mix multiple choice and text questions
    random.shuffle(all_questions)
    
    # Reassign IDs to maintain order
    for i, question in enumerate(all_questions):
        question.id = f"agent-{agent_id}-{i+1}"
    
    return all_questions


async def _generate_multiple_choice_questions(agent_id: str, agent_name: str, knowledge_summary: str, num_questions: int, difficulty: str = None) -> List[Question]:
    """Generate multiple choice questions"""
    
    difficulty_filter = f" de nivel {difficulty}" if difficulty else ""
    
    prompt = f"""
Eres un experto en educación. Genera exactamente {num_questions} preguntas de opción múltiple en español{difficulty_filter}.

CONOCIMIENTO BASE:
{knowledge_summary}

INSTRUCCIONES CRÍTICAS:
- Responde SOLO con un array JSON válido
- NO incluyas explicaciones fuera del JSON
- NO uses markdown o bloques de código
- Cada pregunta debe basarse en el conocimiento proporcionado

FORMATO EXACTO:
[
  {{
    "id": "agent-{agent_id}-1",
    "type": "multiple_choice", 
    "question": "¿Pregunta específica basada en el conocimiento?",
    "options": [
      "Respuesta correcta basada en el conocimiento",
      "Opción incorrecta pero plausible",
      "Otra opción incorrecta",
      "Cuarta opción incorrecta"
    ],
    "correctAnswer": 0,
    "explanation": "Explicación detallada de por qué la respuesta es correcta según el conocimiento.",
    "difficulty": "{difficulty or 'beginner'}",
    "topic": "{agent_name.lower()}",
    "xp": {_calculate_xp(difficulty or 'beginner')}
  }}
]

REGLAS:
1. correctAnswer = índice (0-3) de la respuesta correcta
2. Preguntas específicas al conocimiento, no genéricas
3. Opciones realistas y educativas
4. XP: beginner(80-100), intermediate(100-130), advanced(130-160)

Genera el JSON ahora:
    """
    
    try:
        response = await model.generate_content_async(prompt)
        
        # Clean the response text
        response_text = response.text.strip()
        
        # Remove any markdown code blocks if present
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        response_text = response_text.strip()
        
        print(f"DEBUG - Raw MC AI response: {response_text[:300]}...")
        
        # Parse the JSON response
        questions_data = json.loads(response_text)
        
        # Validate that we got a list
        if not isinstance(questions_data, list):
            print("DEBUG - MC Response is not a list, falling back")
            return _create_fallback_multiple_choice_questions(agent_id, agent_name, num_questions, difficulty)
        
        # Convert to Question objects
        questions = []
        for i, q_data in enumerate(questions_data):
            question = Question(
                id=q_data.get("id", f"agent-{agent_id}-mc-{i+1}"),
                type="multiple_choice",
                question=q_data.get("question", ""),
                options=q_data.get("options", []),
                correctAnswer=q_data.get("correctAnswer", 0),
                explanation=q_data.get("explanation", ""),
                difficulty=q_data.get("difficulty", "beginner"),
                topic=q_data.get("topic", agent_name.lower()),
                xp=q_data.get("xp", _calculate_xp(q_data.get("difficulty", "beginner")))
            )
            questions.append(question)
            
        print(f"DEBUG - Successfully generated {len(questions)} MC questions")
        return questions
        
    except json.JSONDecodeError as e:
        print(f"DEBUG - MC JSON decode error: {e}")
        return _create_fallback_multiple_choice_questions(agent_id, agent_name, num_questions, difficulty)
    except Exception as e:
        print(f"DEBUG - MC General error: {e}")
        return _create_fallback_multiple_choice_questions(agent_id, agent_name, num_questions, difficulty)


async def _generate_text_questions(agent_id: str, agent_name: str, knowledge_summary: str, num_questions: int, difficulty: str = None) -> List[Question]:
    """Generate text questions that require written answers"""
    
    difficulty_filter = f" de nivel {difficulty}" if difficulty else ""
    
    prompt = f"""
Eres un experto en educación. Genera exactamente {num_questions} preguntas de respuesta abierta en español{difficulty_filter}.

CONOCIMIENTO BASE:
{knowledge_summary}

INSTRUCCIONES CRÍTICAS:
- Responde SOLO con un array JSON válido
- NO incluyas explicaciones fuera del JSON
- NO uses markdown o bloques de código
- Cada pregunta debe basarse en el conocimiento proporcionado
- Las preguntas deben ser más extensas y requerir explicaciones detalladas del estudiante

FORMATO EXACTO:
[
  {{
    "id": "agent-{agent_id}-1",
    "type": "text_question",
    "question": "Pregunta extensa que requiere una explicación detallada del estudiante sobre el conocimiento. Debe permitir al estudiante demostrar comprensión profunda del tema.",
    "difficulty": "{difficulty or 'beginner'}",
    "topic": "{agent_name.lower()}",
    "xp": {_calculate_xp(difficulty or 'beginner')}
  }}
]

REGLAS:
1. Preguntas largas que inviten a respuestas elaboradas
2. Deben permitir al estudiante explicar conceptos, procesos o aplicaciones
3. Basadas específicamente en el conocimiento del agente
4. XP: beginner(80-100), intermediate(100-130), advanced(130-160)
5. Ejemplos de tipos: "Explica...", "Describe en detalle...", "Analiza...", "Compara..."

Genera el JSON ahora:
    """
    
    try:
        response = await model.generate_content_async(prompt)
        
        # Clean the response text
        response_text = response.text.strip()
        
        # Remove any markdown code blocks if present
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        response_text = response_text.strip()
        
        print(f"DEBUG - Raw Text AI response: {response_text[:300]}...")
        
        # Parse the JSON response
        questions_data = json.loads(response_text)
        
        # Validate that we got a list
        if not isinstance(questions_data, list):
            print("DEBUG - Text Response is not a list, falling back")
            return _create_fallback_text_questions(agent_id, agent_name, num_questions, difficulty)
        
        # Convert to Question objects
        questions = []
        for i, q_data in enumerate(questions_data):
            question = Question(
                id=q_data.get("id", f"agent-{agent_id}-text-{i+1}"),
                type="text_question",
                question=q_data.get("question", ""),
                options=None,  # Text questions don't have options
                correctAnswer=None,  # Text questions don't have correct answer index
                explanation=None,  # Text questions don't have explanations
                difficulty=q_data.get("difficulty", "beginner"),
                topic=q_data.get("topic", agent_name.lower()),
                xp=q_data.get("xp", _calculate_xp(q_data.get("difficulty", "beginner")))
            )
            questions.append(question)
            
        print(f"DEBUG - Successfully generated {len(questions)} text questions")
        return questions
        
    except json.JSONDecodeError as e:
        print(f"DEBUG - Text JSON decode error: {e}")
        return _create_fallback_text_questions(agent_id, agent_name, num_questions, difficulty)
    except Exception as e:
        print(f"DEBUG - Text General error: {e}")
        return _create_fallback_text_questions(agent_id, agent_name, num_questions, difficulty)

def _calculate_xp(difficulty: str) -> int:
    """Calculate XP based on difficulty level"""
    xp_ranges = {
        "beginner": (80, 100),
        "intermediate": (100, 130), 
        "advanced": (130, 160)
    }
    min_xp, max_xp = xp_ranges.get(difficulty, (80, 100))
    return random.randint(min_xp, max_xp)

def _create_fallback_questions(agent_id: str, agent_name: str, num_questions: int, difficulty: str = None) -> List[Question]:
    """Create fallback questions when AI generation fails"""
    
    # 25% chance for text questions
    num_text_questions = 0
    num_multiple_choice = num_questions
    
    for _ in range(num_questions):
        if random.random() < 0.25:
            num_text_questions += 1
            num_multiple_choice -= 1
    
    all_questions = []
    
    # Generate fallback multiple choice questions
    if num_multiple_choice > 0:
        mc_questions = _create_fallback_multiple_choice_questions(agent_id, agent_name, num_multiple_choice, difficulty)
        all_questions.extend(mc_questions)
    
    # Generate fallback text questions
    if num_text_questions > 0:
        text_questions = _create_fallback_text_questions(agent_id, agent_name, num_text_questions, difficulty)
        all_questions.extend(text_questions)
    
    # Shuffle and reassign IDs
    random.shuffle(all_questions)
    for i, question in enumerate(all_questions):
        question.id = f"agent-{agent_id}-{i+1}"
    
    return all_questions


def _create_fallback_multiple_choice_questions(agent_id: str, agent_name: str, num_questions: int, difficulty: str = None) -> List[Question]:
    """Create fallback multiple choice questions when AI generation fails"""
    
    fallback_questions = []
    difficulties = ["beginner", "intermediate", "advanced"]
    
    for i in range(num_questions):
        diff = difficulty if difficulty else random.choice(difficulties)
        
        question = Question(
            id=f"agent-{agent_id}-mc-{i+1}",
            type="multiple_choice",
            question=f"¿Cuál es un aspecto importante del conocimiento de {agent_name}?",
            options=[
                f"Concepto fundamental de {agent_name}",
                "Opción incorrecta 1",
                "Opción incorrecta 2", 
                "Opción incorrecta 3"
            ],
            correctAnswer=0,
            explanation=f"Este es un concepto fundamental en el área de conocimiento de {agent_name}.",
            difficulty=diff,
            topic=agent_name.lower(),
            xp=_calculate_xp(diff)
        )
        fallback_questions.append(question)
    
    return fallback_questions


def _create_fallback_text_questions(agent_id: str, agent_name: str, num_questions: int, difficulty: str = None) -> List[Question]:
    """Create fallback text questions when AI generation fails"""
    
    fallback_questions = []
    difficulties = ["beginner", "intermediate", "advanced"]
    
    question_templates = [
        f"Explica en detalle los conceptos fundamentales relacionados con {agent_name}.",
        f"Describe cómo aplicarías los conocimientos de {agent_name} en un proyecto real.",
        f"Analiza las ventajas y desventajas de los enfoques utilizados en {agent_name}.",
        f"Compara diferentes aspectos o metodologías dentro del área de {agent_name}.",
        f"Desarrolla un ejemplo práctico que demuestre tu comprensión de {agent_name}."
    ]
    
    for i in range(num_questions):
        diff = difficulty if difficulty else random.choice(difficulties)
        question_text = question_templates[i % len(question_templates)]
        
        question = Question(
            id=f"agent-{agent_id}-text-{i+1}",
            type="text_question",
            question=question_text,
            options=None,
            correctAnswer=None,
            explanation=None,
            difficulty=diff,
            topic=agent_name.lower(),
            xp=_calculate_xp(diff)
        )
        fallback_questions.append(question)
    
    return fallback_questions


