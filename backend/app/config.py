from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./chargespot.db"
    ocm_base_url: str = "https://api.openchargemap.io/v3"
    ocm_api_key: str = ""
    cors_origins: str = "http://localhost:3000"
    cache_ttl_minutes: int = 60

    model_config = {"env_prefix": "CHARGESPOT_", "env_file": ".env"}


settings = Settings()
