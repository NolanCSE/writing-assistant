from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    LLM_API_KEY: str = ""
    LLM_BASE_URL: str = "https://openrouter.ai/api/v1"
    
    # Default/fallback model - used when no specific model is specified
    LLM_MODEL: str = "openrouter/auto"
    
    # Task-specific models for optimized performance and cost
    # Reasoning model: Used for logical analysis, validity checking, and comprehensive analysis tasks
    # Requires strong reasoning capabilities and structured thinking
    LLM_MODEL_REASONING: str = "openrouter/openai/o1-mini"
    
    # Balanced model: Used for writing analysis and research tasks
    # Requires good balance of speed, quality, and context understanding
    LLM_MODEL_BALANCED: str = "anthropic/claude-3.5-sonnet"
    
    # Creative model: Used for rewriting and content generation tasks
    # Requires strong language generation and creative writing capabilities
    LLM_MODEL_CREATIVE: str = "anthropic/claude-3.5-sonnet"
    
    # Fast model: Used for quick tasks like bibliography checking
    # Optimized for speed and cost efficiency on simple tasks
    LLM_MODEL_FAST: str = "google/gemini-flash-1.5"
    
    LLM_APP_TITLE: str = "Writing Analyzer"
    CORS_ORIGINS: str = "*"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000


@lru_cache
def get_settings() -> Settings:
    return Settings()
