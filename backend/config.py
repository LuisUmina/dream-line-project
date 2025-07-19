import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    # API Keys
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    
    # Database
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "ai_agents_db")
    
    # App Settings
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    def validate_required_keys(self):
        """Validate that required API keys are present"""
        missing_keys = []
        
        if not self.GOOGLE_API_KEY:
            missing_keys.append("GOOGLE_API_KEY")
            
        if missing_keys:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_keys)}")
        
        return True

# Create settings instance
settings = Settings()

# Optionally validate keys on import (uncomment if you want strict validation)
# settings.validate_required_keys()
