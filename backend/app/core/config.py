from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    APP_NAME: str = "Investment Research Dashboard API"
    DEBUG: bool = False
    DATABASE_URL: str   
    FRONTEND_URL: str = "https://ai-research-dashboard-kkbixpm5i-nitnem-s-projects.vercel.app/login"

    #DATABASE_URL="sqlite+aiosqlite:///./test.db"
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
