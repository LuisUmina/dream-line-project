from bson import ObjectId
import google.generativeai as genai
from typing import List
from db import agents_collection
from models import AgentConfig
from config import settings

# Configure the Gemini client (use environment variables in production)
genai.configure(api_key=settings.GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')  # Updated model name

async def create_agent_from_docs(name: str, system_prompt: str, documents: List[str]) -> AgentConfig:
    # 1. Combine all documents into a single text block
    full_text = "\n\n".join(documents)
    
    # 2. Use Gemini to summarize the documents for the agent's knowledge base
    prompt = f"Summarize the following information into a concise knowledge base: {full_text}"
    summary_response = await model.generate_content_async(prompt)
    
    # 3. Create the agent configuration object
    agent_data = {
        "name": name,
        "system_prompt": system_prompt,
        "knowledge_summary": summary_response.text
    }
    
    # 4. Insert the new agent config into MongoDB
    result = await agents_collection.insert_one(agent_data)
    created_agent = await agents_collection.find_one({"_id": result.inserted_id})
    
    # 5. Convert the MongoDB document to an AgentConfig model
    # Convert ObjectId to string for the id field
    created_agent["id"] = str(created_agent["_id"])
    del created_agent["_id"]  # Remove the original _id field
    
    return AgentConfig(**created_agent)

async def get_agent_response(agent_id: str, user_prompt: str) -> str:
    # 1. Find the agent's configuration in MongoDB
    agent_config = await agents_collection.find_one({"_id": ObjectId(agent_id)})
    if not agent_config:
        return None

    # 2. Construct the full prompt for Gemini
    full_prompt = f"""
    System Prompt: {agent_config['system_prompt']}

    Knowledge Base: {agent_config['knowledge_summary']}
    
    User Question: {user_prompt}
    
    Answer:
    """
    
    # 3. Get the response from Gemini
    response = await model.generate_content_async(full_prompt)
    return response.text