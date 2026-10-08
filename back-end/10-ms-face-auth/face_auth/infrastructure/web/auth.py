import base64
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import json
import secrets
from secrets import token_urlsafe
import time
import uuid

import jwt

from ..config.settings import settings
import logging as _logging

logger = _logging.getLogger(__name__)

if not settings.jwt_secret:
    # Solo desarrollo/tests: secreto efímero por proceso (invalida sesiones al reiniciar).
    # Producción DEBE definir JWT_SECRET (>=32 chars); ver settings.require_jwt_secret().
    _logging.getLogger(__name__).warning("JWT_SECRET no configurado: usando secreto efímero (solo desarrollo)")
JWT_SECRET = settings.jwt_secret or token_urlsafe(32)
LIVENESS_ACTIONS = ("blink", "turn", "open_mouth")
LIVENESS_TOKEN_TTL_SECONDS = 120
_last_liveness_actions: tuple[str, ...] | None = None
_consumed_liveness_tokens: set[str] = set()
_active_sessions: dict[str, float] = {}


def _prune_consumed_tokens(max_size: int = 10000) -> None:
    # Evita crecimiento ilimitado en procesos de larga vida; los tokens caducan a los 120s.
    if len(_consumed_liveness_tokens) > max_size:
        _consumed_liveness_tokens.clear()


def create_access_token(subject: str) -> tuple[str, int]:
    expires_in = settings.access_token_expire_minutes * 60
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(seconds=expires_in)
    token = jwt.encode(
        {
            "iss": settings.jwt_issuer,
            "aud": settings.jwt_audience,
            "sub": subject,
            "sid": uuid.uuid4().hex,
            "jti": uuid.uuid4().hex,
            "iat": int(now.timestamp()),
            "auth_time": int(now.timestamp()),
            "exp": expires_at,
        },
        JWT_SECRET,
        algorithm="HS256",
    )
    _active_sessions[subject] = expires_at.timestamp()
    return token, expires_in


def active_session_usernames() -> list[str]:
    now = time.time()
    expired = [username for username, expires_at in _active_sessions.items() if expires_at <= now]
    for username in expired:
        _active_sessions.pop(username, None)
    return sorted(_active_sessions)


def register_active_session(username: str, expires_at_timestamp: float) -> None:
    """API pública para registrar sesiones (evita tocar el dict privado)."""
    _active_sessions[username] = expires_at_timestamp


def create_liveness_challenge(num_actions: int = 3) -> tuple[str, list[str]]:
    """Crea un reto con `num_actions` gestos aleatorios (2 = login rápido, 3 = registro).

    El subconjunto y el orden son aleatorios en cada reto: un vídeo con una
    secuencia fija no sirve aunque conozca los gestos posibles.
    """
    global _last_liveness_actions
    if num_actions not in (2, 3):
        raise ValueError("El número de gestos debe ser 2 o 3")
    randomizer = secrets.SystemRandom()
    actions = randomizer.sample(list(LIVENESS_ACTIONS), num_actions)
    randomizer.shuffle(actions)
    if tuple(actions) == _last_liveness_actions:
        randomizer.shuffle(actions)  # evita repetir la secuencia idéntica anterior
    _last_liveness_actions = tuple(actions)
    return _create_liveness_token(actions, 0), actions


def verify_liveness_challenge(token: str, require_complete: bool = False) -> tuple[list[str], int]:
    try:
        encoded_text, signature_text = token.split(".", 1)
        encoded = encoded_text.encode()
        expected = hmac.new(JWT_SECRET.encode(), encoded, hashlib.sha256).digest()
        signature = _decode_base64url(signature_text)
        if not hmac.compare_digest(expected, signature):
            raise ValueError("Reto de prueba de vida inválido")
        payload = json.loads(_decode_base64url(encoded_text).decode())
        actions = payload["actions"]
        step = payload["step"]
        valid = (
            isinstance(actions, list)
            and len(actions) in (2, 3)
            and len(set(actions)) == len(actions)
            and set(actions) <= set(LIVENESS_ACTIONS)
        )
        if payload["exp"] < time.time() or not valid or step not in range(len(actions) + 1):
            raise ValueError("El reto de prueba de vida expiró o es inválido")
        if require_complete and step != len(actions):
            raise ValueError("La prueba de vida no se ha completado")
        return actions, step
    except (KeyError, TypeError, json.JSONDecodeError) as exc:
        # Nota: ValueError intencional (expirado/incompleto) se propaga con su
        # mensaje; solo los errores de formato caen al mensaje genérico.
        # (JSONDecodeError hereda de ValueError: se captura explícito arriba.)
        raise ValueError("Reto de prueba de vida inválido") from exc


def advance_liveness_challenge(token: str) -> tuple[str, list[str], int]:
    if token in _consumed_liveness_tokens:
        raise ValueError("El paso de prueba de vida ya fue utilizado")
    actions, step = verify_liveness_challenge(token)
    _consumed_liveness_tokens.add(token)
    _prune_consumed_tokens()
    next_step = step + 1
    return _create_liveness_token(actions, next_step), actions, next_step


def consume_liveness_challenge(token: str) -> list[str]:
    if token in _consumed_liveness_tokens:
        raise ValueError("El reto de prueba de vida ya fue utilizado")
    actions, _ = verify_liveness_challenge(token, require_complete=True)
    _consumed_liveness_tokens.add(token)
    _prune_consumed_tokens()
    return actions


def _create_liveness_token(actions: list[str], step: int) -> str:
    payload = {"actions": actions, "step": step, "exp": int(time.time()) + LIVENESS_TOKEN_TTL_SECONDS}
    encoded = _encode_payload(payload)
    signature = hmac.new(JWT_SECRET.encode(), encoded, hashlib.sha256).digest()
    return f"{encoded.decode()}.{_base64url(signature)}"


def _encode_payload(payload: dict) -> bytes:
    return _base64url(json.dumps(payload, separators=(",", ":")).encode()).encode()


def _base64url(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode()


def _decode_base64url(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))
