"""
Central application configuration.
Loaded from environment variables (.env). No secrets are hardcoded.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    mongodb_uri: str = "mongodb://localhost:27017"
    database_name: str = "college_service_request"
    jwt_secret: str = "change_this_secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440
    frontend_url: str = "http://localhost:5173"
    upload_dir: str = "uploads"
    max_upload_mb: int = 10

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
