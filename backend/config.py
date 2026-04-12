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
    LLM_MODEL: str = "openrouter/auto"
    LLM_APP_TITLE: str = "Writing Analyzer"
    CORS_ORIGINS: str = "*"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000


@lru_cache
def get_settings() -> Settings:
    return Settings()
