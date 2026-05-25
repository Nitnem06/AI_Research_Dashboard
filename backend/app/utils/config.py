from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Research Dashboard API"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/research_db"

    # Auth
    SECRET_KEY: str = "change-me-in-production-please"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Anthropic
    ANTHROPIC_API_KEY: str = ""

    # NewsAPI (optional - falls back to mock)
    NEWS_API_KEY: str = ""

    # FAISS vector store path
    VECTOR_STORE_PATH: str = "./app/data/faiss_index"
    SAMPLE_DOCS_PATH: str = "./app/data/sample_docs"

    # CORS
    FRONTEND_URL: str = "https://ai-research-dashboard-kkbixpm5i-nitnem-s-projects.vercel.app/login"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()