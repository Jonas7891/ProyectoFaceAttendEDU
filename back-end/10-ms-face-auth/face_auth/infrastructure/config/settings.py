from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    mongo_url: str = "mongodb://biometric:biometric@mongo:27017/?authSource=admin"
    mongo_db: str = "biometric"
    postgres_url: str = "postgresql://faceauth:faceauth@postgres:5432/face_auth"
    match_threshold: float = 0.6
    fingerprint_match_threshold: int = 8
    cors_origins: str = ""
    jwt_secret: str | None = None
    access_token_expire_minutes: int = 15
    jwt_issuer: str = "face-auth"
    jwt_audience: str = "face-auth-clients"
    refresh_token_expire_minutes: int = 10080  # 7 días; rotativo
    session_v2_enabled: bool = True  # flag reversible: false = respuesta legacy exacta
    rate_limit_max_attempts: int = 20
    rate_limit_window_seconds: int = 60
    audit_retention_days: int = 365
    # Detrás de Kong todas las peticiones llegan desde la IP del gateway: con
    # TRUST_PROXY_HEADERS=1 el rate limit usa la IP real que Kong añade al final
    # de X-Forwarded-For (no es falsificable por el cliente).
    trust_proxy_headers: bool = False
    model_config = SettingsConfigDict(env_file=".env", env_prefix="", extra="ignore")

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    def require_jwt_secret(self) -> str:
        if not self.jwt_secret:
            raise RuntimeError("JWT_SECRET no configurado: define JWT_SECRET en el entorno")
        if len(self.jwt_secret) < 32:
            raise RuntimeError("JWT_SECRET demasiado corto: mínimo 32 caracteres")
        return self.jwt_secret


settings = Settings()
