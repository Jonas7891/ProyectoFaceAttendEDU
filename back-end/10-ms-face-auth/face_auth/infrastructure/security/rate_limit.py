"""Rate limiting en memoria (sliding window) para endpoints biométricos.

Diseñado para 1 proceso. Con múltiples réplicas usar Redis (interfaz compatible).
"""
from __future__ import annotations

import time
from collections import defaultdict, deque


class RateLimiter:
    def __init__(self, max_attempts: int = 20, window_seconds: int = 60) -> None:
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def check(self, key: str) -> tuple[bool, int]:
        """Retorna (permitido, reintentos_restantes). No lanza."""
        now = time.time()
        window = self._hits[key]
        while window and window[0] <= now - self.window_seconds:
            window.popleft()
        if len(window) >= self.max_attempts:
            return False, 0
        window.append(now)
        return True, self.max_attempts - len(window)

    def reset(self, key: str) -> None:  # solo tests
        self._hits.pop(key, None)
