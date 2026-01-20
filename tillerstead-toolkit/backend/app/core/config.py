"""
Application configuration
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./tillerstead_toolkit.db"
    
    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Redis (for background jobs)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # File storage
    UPLOAD_DIR: str = "./uploads"
    EXPORT_DIR: str = "./exports"
    
    # Connectors
    HOMEDEPOT_FEED_PATH: Optional[str] = None
    THIRDPARTY_API_KEY: Optional[str] = None
    THIRDPARTY_API_URL: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
