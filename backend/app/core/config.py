import os
from typing import List
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "NTRO GenAI Content Transformation Platform"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # Storage & Processing settings
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    MAX_UPLOAD_SIZE_MB: int = 25
    MAX_DOCUMENT_CHARS: int = 1000000
    ALLOWED_EXTENSIONS: set = {"pdf", "docx", "txt"}
    
    # Secrets & API Keys / LLM Configuration
    # Provider: "local" (default offline Qwen via llama.cpp) or "gemini"
    LLM_PROVIDER: str = "local"
    LOCAL_LLM_URL: str = "http://127.0.0.1:8080/v1"
    LOCAL_LLM_MODEL: str = "Qwen/Qwen2.5-3B-Instruct-GGUF:Q4_K_M"
    LOCAL_LLM_TIMEOUT: float = 180.0
    
    # Gemini Single key (legacy / backwards-compatible fallback)
    GEMINI_API_KEY: str = ""
    # Multiple comma-separated keys for automatic rotation & failover
    GEMINI_API_KEYS: str = ""
    GEMINI_MODEL: str = "gemini-3.5-flash"
    USE_MOCK_AI: bool = False
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/ntro_genai_db"

    # Security & Daily Login Rate Limiting
    MAX_LOGIN_ATTEMPTS_PER_DAY: int = 5
    LOGIN_LOCKOUT_HOURS: int = 24

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def max_upload_size_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    def get_api_keys(self) -> List[str]:
        """
        Return a deduplicated ordered list of Gemini API keys for rotation & failover.

        Sources (merged in order of precedence):
          1. GEMINI_API_KEYS  – comma/newline/semicolon-separated list of keys
          2. GEMINI_API_KEY   – legacy single-key fallback
        """
        seen: set = set()
        keys: List[str] = []

        def _add(raw: str) -> None:
            normalized = raw.replace("\n", ",").replace(";", ",")
            for k in normalized.split(","):
                k = k.strip()
                if k and k not in seen:
                    seen.add(k)
                    keys.append(k)

        if self.GEMINI_API_KEYS and self.GEMINI_API_KEYS.strip():
            _add(self.GEMINI_API_KEYS)
        if self.GEMINI_API_KEY and self.GEMINI_API_KEY.strip():
            _add(self.GEMINI_API_KEY)

        return keys


settings = Settings()
# Ensure upload directory exists securely on startup
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
