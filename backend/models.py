from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Annotated, Literal
from bson import ObjectId
from pydantic import GetCoreSchemaHandler
from pydantic_core import core_schema

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type, handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        return core_schema.no_info_after_validator_function(
            cls.validate,
            core_schema.str_schema(),
        )

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str):
            if ObjectId.is_valid(v):
                return str(v)
        raise ValueError("Invalid ObjectId")

    def __str__(self):
        return str(super())

    
class AgentConfig(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
    id: Optional[str] = Field(alias="_id", default=None)
    name: str = Field(...)
    system_prompt: str = Field(...) # The core instruction for the agent
    knowledge_summary: Optional[str] = None # A summary of the documents


class Question(BaseModel):
    id: str
    type: Literal['multiple_choice', 'code_completion', 'debugging']
    question: str
    options: List[str]
    correctAnswer: int  # Index of the correct answer in options array
    explanation: str
    difficulty: Literal['beginner', 'intermediate', 'advanced']
    topic: str
    xp: int


class QuestionRequest(BaseModel):
    topic: str
    num_questions: int = Field(default=5, ge=1, le=20)
    difficulty: Optional[Literal['beginner', 'intermediate', 'advanced']] = None