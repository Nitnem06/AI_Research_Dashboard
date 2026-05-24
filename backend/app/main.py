import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.utils.database import init_db
from app.middleware.tenant import TenantMiddleware
from app.routers import auth, research

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initialising database...")
    await init_db()

    logger.info("Loading knowledge base (FAISS)...")
    try:
        from app.services.ai.vector_store.retriever import init_knowledge_base
        init_knowledge_base()
    except Exception as e:
        logger.warning(f"Knowledge base init failed: {e}")

    logger.info("🚀 Research Dashboard API ready")
    yield
    # Shutdown
    logger.info("Shutting down...")


app = FastAPI(
    title="Investment Research Dashboard API",
    description="AI-powered financial research with tool orchestration and multi-tenant isolation",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tenant context middleware
app.add_middleware(TenantMiddleware)

# Routers
app.include_router(auth.router)
app.include_router(research.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": settings.APP_NAME}

@app.get("/")
async def root():
    return {
        "message": "AI Research Dashboard API running",
        "docs": "/docs",
        "health": "/health"
    }