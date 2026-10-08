import pytest
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError

from face_auth.infrastructure.web.error_handlers import _validation_response
from face_auth.infrastructure.web.schemas.auth_schema import (
    MAX_FINGERPRINT_SAMPLE_BASE64_LENGTH,
    RegisterFingerprintSampleRequest,
)


def test_fingerprint_sample_limit_matches_three_mib_decode_limit():
    payload = RegisterFingerprintSampleRequest(
        username="alice",
        sample_format=5,
        data_base64="A" * MAX_FINGERPRINT_SAMPLE_BASE64_LENGTH,
        quality=24,
    )

    assert len(payload.data_base64) == 4_194_304

    with pytest.raises(ValidationError):
        RegisterFingerprintSampleRequest(
            username="alice",
            data_base64="A" * (MAX_FINGERPRINT_SAMPLE_BASE64_LENGTH + 1),
        )


def test_validation_response_identifies_field_without_echoing_biometric_data():
    error = RequestValidationError([{
        "type": "int_parsing",
        "loc": ("body", "quality"),
        "msg": "Input should be a valid integer",
        "input": "PRIVATE_BIOMETRIC_SAMPLE",
    }])

    response = _validation_response(error)
    body = response.body.decode()

    assert response.status_code == 422
    assert '"code":"validation_error"' in body
    assert '"loc":["body","quality"]' in body
    assert "PRIVATE_BIOMETRIC_SAMPLE" not in body
