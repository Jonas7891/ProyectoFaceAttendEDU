from pydantic import BaseModel, Field

MAX_FINGERPRINT_SAMPLE_BASE64_LENGTH = 4_194_304


class RegisterFaceRequest(BaseModel):
    username: str = Field(min_length=1, max_length=150)
    image: str = Field(min_length=1, max_length=4_000_000)
    challenge_token: str = Field(min_length=20, max_length=500)


class LoginFaceRequest(BaseModel):
    image: str = Field(min_length=1, max_length=4_000_000)
    challenge_token: str = Field(min_length=20, max_length=500)


class LivenessStepRequest(BaseModel):
    challenge_token: str = Field(min_length=20, max_length=500)
    action_index: int = Field(ge=0, le=2)
    images: list[str] = Field(min_length=6, max_length=6)


class RegisterFingerprintSampleRequest(BaseModel):
    username: str = Field(min_length=1, max_length=150)
    sample_format: int | None = Field(default=None, ge=0)
    data_base64: str = Field(min_length=1, max_length=MAX_FINGERPRINT_SAMPLE_BASE64_LENGTH)
    quality: int | None = Field(default=None, ge=0, le=100)


class LoginFingerprintSampleRequest(BaseModel):
    sample_format: int | None = Field(default=None, ge=0)
    data_base64: str = Field(min_length=1, max_length=MAX_FINGERPRINT_SAMPLE_BASE64_LENGTH)
    quality: int | None = Field(default=None, ge=0, le=100)


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=20, max_length=500)


class LogoutRequest(BaseModel):
    refresh_token: str | None = Field(default=None, min_length=20, max_length=500)
    session_id: str | None = Field(default=None, min_length=8, max_length=64)
