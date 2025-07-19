import google.generativeai as genai
from models import AnswerValidationResponse
from config import settings
from db import agents_collection
from bson import ObjectId
import json
import re

# Configure the Gemini client
genai.configure(api_key=settings.GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

async def validate_answer(agent_id: str, question_id: str, question: str, user_answer: str, difficulty: str) -> AnswerValidationResponse:
    """
    Validate a user's answer against a question using the agent's knowledge
    """
    
    # Get the agent's configuration
    agent_config = await agents_collection.find_one({"_id": ObjectId(agent_id)})
    if not agent_config:
        raise ValueError("Agent not found")
    
    knowledge_summary = agent_config.get('knowledge_summary', '')
    agent_name = agent_config.get('name', 'conocimiento general')
    
    # Calculate maximum points based on difficulty
    max_points = _get_max_points(difficulty)
    
    # Create validation prompt
    prompt = f"""
Eres un evaluador experto en educación. Evalúa la respuesta del estudiante basándote en el conocimiento específico del agente.

CONOCIMIENTO DEL AGENTE:
{knowledge_summary}

PREGUNTA: {question}

RESPUESTA DEL ESTUDIANTE: {user_answer}

DIFICULTAD: {difficulty}
PUNTOS MÁXIMOS: {max_points}

INSTRUCCIONES:
1. Evalúa qué tan bien responde el estudiante a la pregunta
2. Considera la precisión, completitud y comprensión demostrada
3. Usa el conocimiento del agente como referencia para la evaluación
4. Asigna puntos de 0 a {max_points} basado en la calidad de la respuesta
5. Si la respuesta obtiene >= 75% de los puntos, se considera exitosa

Responde ÚNICAMENTE con un JSON en este formato exacto:
{{
    "points_earned": número_entre_0_y_{max_points},
    "feedback": "Retroalimentación detallada sobre la respuesta del estudiante",
    "correct_answer": "La respuesta correcta completa (solo si la respuesta del estudiante es incorrecta o incompleta)"
}}

CRITERIOS DE EVALUACIÓN:
- {difficulty} nivel: {"Conceptos básicos y comprensión fundamental" if difficulty == "beginner" else "Aplicación práctica y análisis" if difficulty == "intermediate" else "Síntesis avanzada y pensamiento crítico"}
- Precisión técnica según el conocimiento del agente
- Claridad y organización de la respuesta
- Demostración de comprensión profunda

Evalúa ahora:
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
        
        print(f"DEBUG - Validation response: {response_text[:300]}...")
        
        # Parse the JSON response
        validation_data = json.loads(response_text)
        
        points_earned = validation_data.get("points_earned", 0)
        feedback = validation_data.get("feedback", "No se pudo generar retroalimentación.")
        correct_answer = validation_data.get("correct_answer")
        
        # Ensure points are within valid range
        points_earned = max(0, min(points_earned, max_points))
        
        # Calculate percentage
        percentage = (points_earned / max_points) * 100 if max_points > 0 else 0
        
        # Determine if successful (>= 75%)
        is_successful = percentage >= 75.0
        
        return AnswerValidationResponse(
            is_successful=is_successful,
            points_earned=points_earned,
            max_points=max_points,
            percentage=round(percentage, 2),
            feedback=feedback,
            correct_answer=correct_answer if not is_successful else None
        )
        
    except json.JSONDecodeError as e:
        print(f"DEBUG - JSON decode error in validation: {e}")
        # Fallback evaluation
        return _create_fallback_validation(user_answer, question, max_points)
    
    except Exception as e:
        print(f"DEBUG - General error in validation: {e}")
        # Fallback evaluation
        return _create_fallback_validation(user_answer, question, max_points)


def _get_max_points(difficulty: str) -> int:
    """Get maximum points based on difficulty level"""
    points_map = {
        "beginner": 100,
        "intermediate": 130,
        "advanced": 160
    }
    return points_map.get(difficulty, 100)


def _create_fallback_validation(user_answer: str, question: str, max_points: int) -> AnswerValidationResponse:
    """Create a basic fallback validation when AI fails"""
    
    # Simple heuristic: longer answers get more points, up to 50%
    answer_length = len(user_answer.strip())
    
    if answer_length == 0:
        points_earned = 0
        feedback = "No se proporcionó respuesta."
    elif answer_length < 10:
        points_earned = int(max_points * 0.2)
        feedback = "Respuesta muy breve. Se necesita más detalle y explicación."
    elif answer_length < 50:
        points_earned = int(max_points * 0.4)
        feedback = "Respuesta parcial. Incluye algunos puntos relevantes pero necesita más desarrollo."
    else:
        points_earned = int(max_points * 0.5)
        feedback = "Respuesta elaborada. Se necesita evaluación manual para determinar la precisión técnica."
    
    percentage = (points_earned / max_points) * 100
    is_successful = percentage >= 75.0
    
    return AnswerValidationResponse(
        is_successful=is_successful,
        points_earned=points_earned,
        max_points=max_points,
        percentage=round(percentage, 2),
        feedback=feedback,
        correct_answer="No se pudo determinar la respuesta correcta. Consulta con un instructor." if not is_successful else None
    )
