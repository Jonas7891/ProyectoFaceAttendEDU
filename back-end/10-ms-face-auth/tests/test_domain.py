import pytest

from face_auth.domain.entities.biometric_sample import BiometricSample
from face_auth.domain.entities.user import User


def test_user_normalizes_username():
    user = User(None, "  alice  ", None, None)

    assert user.username == "alice"
    assert not user.has_face


def test_user_rejects_blank_username():
    with pytest.raises(ValueError, match="usuario es requerido"):
        User(None, "   ", None, None)


def test_sample_rejects_invalid_user():
    with pytest.raises(ValueError, match="usuario de la muestra"):
        BiometricSample(None, 0, None, "sample", None, None)
