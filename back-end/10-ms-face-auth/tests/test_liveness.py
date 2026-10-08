"""Tests del reto de prueba de vida: registro (3 gestos) y login rápido (2)."""
from __future__ import annotations

import pytest

from face_auth.infrastructure.web import auth


def test_challenge_default_registro_tres_gestos_aleatorios():
    vistos = set()
    for _ in range(20):
        token, actions = auth.create_liveness_challenge()
        assert len(actions) == 3
        assert set(actions) == set(auth.LIVENESS_ACTIONS)
        vistos.add(tuple(actions))
    assert len(vistos) > 1  # el orden es aleatorio


def test_challenge_login_dos_gestos_aleatorios():
    vistos = set()
    for _ in range(30):
        token, actions = auth.create_liveness_challenge(2)
        assert len(actions) == 2
        assert len(set(actions)) == 2
        assert set(actions) <= set(auth.LIVENESS_ACTIONS)
        vistos.add(tuple(actions))
    assert len(vistos) > 3  # subconjunto y orden varían


def test_challenge_rechaza_numero_invalido():
    with pytest.raises(ValueError, match="2 o 3"):
        auth.create_liveness_challenge(1)
    with pytest.raises(ValueError, match="2 o 3"):
        auth.create_liveness_challenge(4)


def test_flujo_login_dos_pasos_completa():
    token, actions = auth.create_liveness_challenge(2)
    assert auth.verify_liveness_challenge(token) == (actions, 0)
    with pytest.raises(ValueError, match="no se ha completado"):
        auth.verify_liveness_challenge(token, require_complete=True)
    token, _, step = auth.advance_liveness_challenge(token)
    assert step == 1
    token, _, step = auth.advance_liveness_challenge(token)
    assert step == 2
    assert auth.verify_liveness_challenge(token, require_complete=True) == (actions, 2)
    assert auth.consume_liveness_challenge(token) == actions


def test_flujo_registro_tres_pasos_sigue_completo():
    token, actions = auth.create_liveness_challenge(3)
    for expected in (1, 2, 3):
        token, _, step = auth.advance_liveness_challenge(token)
        assert step == expected
    auth.consume_liveness_challenge(token)


def test_reuso_de_token_se_rechaza():
    token, _ = auth.create_liveness_challenge(2)
    auth.advance_liveness_challenge(token)
    with pytest.raises(ValueError, match="ya fue utilizado"):
        auth.advance_liveness_challenge(token)
