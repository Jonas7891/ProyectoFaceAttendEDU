"""Which candidate of a 1:N search a caller gets (a search must not cross schools).

The templates carry no school, so the scan still runs over all of them; what changes is the
answer. Among the candidates that clear the threshold, best score first, the first one the
caller's scope allows wins. When none does, the answer is the same "no match" as for a face
that was never enrolled: a caller learns nothing about other schools.
"""
from __future__ import annotations

from collections.abc import Sequence
from typing import Any, Protocol, TypeVar

T = TypeVar("T")

# Candidates above the threshold whose school is looked up, best first. A face is normally one
# person; this only bounds the work (one academic lookup each, cached) in degenerate data.
MAX_CANDIDATES = 5


class PersonScope(Protocol):
    """The people a caller may identify or verify."""

    async def allows(self, person_id: str) -> bool: ...


async def best_allowed(
    scored: Sequence[tuple[float, T]], threshold: float, scope: PersonScope
) -> tuple[T | None, Any]:
    """`(template, score)` of the best candidate at or above `threshold` the caller may see.

    `scored` is every `(score, template)` of the scan. When nothing qualifies the template is
    `None` and the score is the best raw score, which is only for the server-side audit log.
    """
    best_overall = max((score for score, _ in scored), default=0)
    qualifying = sorted((item for item in scored if item[0] >= threshold), key=lambda item: -item[0])
    for score, template in qualifying[:MAX_CANDIDATES]:
        if await scope.allows(template.person_id):  # type: ignore[attr-defined]
            return template, score
    return None, best_overall
