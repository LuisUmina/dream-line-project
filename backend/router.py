from fastapi import APIRouter, Body, HTTPException
from typing import List
from backend.models import AgentConfig
from .agent_service import create_agent_from_docs, get_agent_response

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