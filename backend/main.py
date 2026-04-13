from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import get_settings
from routers import analysis, rewrite, research, bibliography, logical_analysis, full_analysis, validity


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    settings = get_settings()
    print(f"Starting Writing Analyzer API on {settings.APP_HOST}:{settings.APP_PORT}")
    print(f"Using model: {settings.LLM_MODEL}")
    print(f"API base URL: {settings.LLM_BASE_URL}")
    yield


app = FastAPI(
    title="Writing Analyzer",
    description="AI-powered writing analysis, rewriting, research, and bibliography checking tool",
    version="1.0.0",
    lifespan=lifespan,
)

settings = get_settings()
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis.router)
app.include_router(rewrite.router)
app.include_router(research.router)
app.include_router(bibliography.router)
app.include_router(logical_analysis.router)
app.include_router(full_analysis.router)
app.include_router(validity.router)


@app.get("/")
async def root():
    return {"message": "Writing Analyzer API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
