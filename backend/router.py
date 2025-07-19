from fastapi import APIRouter, Body, HTTPException
from typing import List
from models import AgentConfig, Question, QuestionRequest, AnswerValidationRequest, AnswerValidationResponse
from agent_service import create_agent_from_docs, get_agent_response
from question_service import generate_questions
from answer_validation_service import validate_answer

router = APIRouter()

@router.post("/setup-agent/", response_model=AgentConfig)
async def setup_agent_endpoint(
    name: str = Body(...),
    system_prompt: str = Body(...),
    documents: List[str] = Body(...)
):
    """
    Creates and configures an agent based on a set of documents.
    """
    if not documents:
        raise HTTPException(status_code=400, detail="No documents provided.")
        
    new_agent = await create_agent_from_docs(name, system_prompt, documents)
    return new_agent

@router.post("/agent/{agent_id}/chat/")
async def chat_with_agent(agent_id: str, user_prompt: str = Body(embed=True)):
    """
    Interacts with a specific, configured agent.
    """
    response = await get_agent_response(agent_id, user_prompt)
    if response is None:
        raise HTTPException(status_code=404, detail="Agent not found.")
    
    return {"response": response}


@router.post("/agent/{agent_id}/generate-questions/", response_model=List[Question])
async def generate_questions_endpoint(
    agent_id: str,
    num_questions: int = Body(default=5),
    difficulty: str = Body(default=None)
):
    """
    Generates educational questions based on an agent's knowledge and topic.
    
    Args:
        agent_id: The ID of the agent to generate questions for
        num_questions: Number of questions to generate (1-20, default: 5)
        difficulty: Optional difficulty level ('beginner', 'intermediate', 'advanced')
    
    Returns:
        List of questions with multiple choice options, correct answers, and explanations
    """
    if num_questions < 1 or num_questions > 20:
        raise HTTPException(status_code=400, detail="Number of questions must be between 1 and 20.")
    
    if difficulty and difficulty not in ['beginner', 'intermediate', 'advanced']:
        raise HTTPException(status_code=400, detail="Difficulty must be 'beginner', 'intermediate', or 'advanced'.")
    
    try:
        questions = await generate_questions(agent_id, num_questions, difficulty)
        return questions
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")


@router.post("/agent/{agent_id}/validate-answer/", response_model=AnswerValidationResponse)
async def validate_answer_endpoint(
    agent_id: str,
    question_id: str = Body(...),
    question: str = Body(...),
    user_answer: str = Body(...),
    difficulty: str = Body(...)
):
    """
    Validates a user's answer to a question using the agent's knowledge.
    
    Args:
        agent_id: The ID of the agent whose knowledge to use for validation
        question_id: The ID of the question being answered
        question: The text of the question
        user_answer: The user's answer to validate
        difficulty: The difficulty level of the question ('beginner', 'intermediate', 'advanced')
    
    Returns:
        Validation result with points, feedback, and success status
    """
    if difficulty not in ['beginner', 'intermediate', 'advanced']:
        raise HTTPException(status_code=400, detail="Difficulty must be 'beginner', 'intermediate', or 'advanced'.")
    
    if not user_answer.strip():
        raise HTTPException(status_code=400, detail="User answer cannot be empty.")
    
    if not question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    
    try:
        validation_result = await validate_answer(agent_id, question_id, question, user_answer, difficulty)
        return validation_result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating answer: {str(e)}")