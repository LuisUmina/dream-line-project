from fastapi import FastAPI
from .router import router

app = FastAPI(title="Scalable AI Agent")

app.include_router(router, tags=["Agent"], prefix="/api")