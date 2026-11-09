"""Facial use cases: enroll, verify and identify a face (application layer).

The routers parse the request, turn an image into an encoding and translate the exceptions
below into HTTP; the rules live here:

- a face cannot be enrolled for two people (`FaceTemplateService.enroll` with
  `reject_duplicates_within`);
- a 1:N search answers only with a person of the caller's scope, otherwise "no match";
- a 1:1 verify of a person outside the scope looks like a person without a template;
- every comparison, enrollment and deletion leaves an audit record (`record_match`).

The 1:N scan still loads every active template; replacing it with a vector index is
tracked separately.
"""
from __future__ import annotations

import logging
import math
from dataclasses import dataclass

from application.match_audit import record_match
from application.match_selection import PersonScope, best_allowed
from domain.entities.facial_embedding import FacialEmbedding
from domain.entities.match_log import BiometricMatchLog
from domain.ports.out.biometric_repository import BiometricRepositoryPort
from domain.ports.out.match_log_repository import MatchLogRepositoryPort
from domain.similarity import euclidean, face_similarity
from domain.value_objects.biometric_type import BiometricType

logger = logging.getLogger(__name__)

OPERATION_VERIFY = "VERIFY"
OPERATION_IDENTIFY = "IDENTIFY"
OPERATION_ENROLL = "ENROLL"
OPERATION_DELETE = "DELETE"


class NoActiveTemplate(Exception):
    """The person has no active facial template, or is outside the caller's scope."""


class NoMatch(Exception):
    """No allowed person clears the threshold."""


class FaceAlreadyEnrolled(Exception):
    """The face is already enrolled for a different person."""


@dataclass(frozen=True)
class CallContext:
    """Who made the call, for the audit record only."""

    correlation_id: str | None = None
    actor_user_id: str | None = None


class _Everyone:
    async def allows(self, person_id: str) -> bool:  # noqa: ARG002 - the scope of auth-off callers
        return True


EVERYONE: PersonScope = _Everyone()


async def best_facial_match(
    encoding: list[float],
    repository: BiometricRepositoryPort,
    threshold: float,
    scope: PersonScope = EVERYONE,
) -> tuple[FacialEmbedding | None, float]:
    """1:N face scan (`face_similarity`), one template per person; only an allowed person matches."""
    scored: list[tuple[float, FacialEmbedding]] = []
    seen: set[str] = set()
    for template in await repository.list_active():
        if template.person_id in seen:
            continue
        seen.add(template.person_id)
        scored.append((face_similarity(encoding, list(template.encoding)), template))
    best, score = await best_allowed(scored, threshold, scope)
    return best, float(max(score, 0.0))


async def closest_other_face(
    encoding: list[float],
    repository: BiometricRepositoryPort,
    person_id: str,
    max_distance: float,
) -> tuple[FacialEmbedding | None, float]:
    """Nearest template of a *different* person by Euclidean distance; the template is
    returned only when it is within `max_distance`."""
    best: FacialEmbedding | None = None
    best_distance = math.inf
    for template in await repository.list_active():
        if template.person_id == person_id:
            continue
        distance = euclidean(encoding, list(template.encoding))
        if distance < best_distance:
            best_distance = distance
            best = template
    return (best, best_distance) if best is not None and best_distance <= max_distance else (None, best_distance)


class FaceTemplateService:
    """A person's facial template: enroll, read, history and soft delete."""

    def __init__(self, repository: BiometricRepositoryPort, match_logs: MatchLogRepositoryPort | None) -> None:
        self._repository = repository
        self._match_logs = match_logs

    async def enroll(
        self,
        person_id: str,
        encoding: list[float],
        model_version: str,
        context: CallContext,
        *,
        threshold: float = 0.0,
        reject_duplicates_within: float | None = None,
    ) -> FacialEmbedding:
        """Stores a new active template. With `reject_duplicates_within`, refuses a face that is
        that close to another person's (the distance is logged, never returned to the client)."""
        if reject_duplicates_within is not None:
            duplicate, distance = await closest_other_face(
                encoding, self._repository, person_id, reject_duplicates_within
            )
            if duplicate is not None:
                logger.info("enroll refused: face %.4f from another person's template", distance)
                raise FaceAlreadyEnrolled()
        stored = await self._repository.enroll(
            FacialEmbedding(person_id=person_id, encoding=encoding, model_version=model_version)
        )
        await self._audit(
            OPERATION_ENROLL, context, matched=True, score=1.0, threshold=threshold,
            person_id=person_id, embedding_id=stored.embedding_id, actor_user_id=context.actor_user_id,
        )
        return stored

    async def active(self, person_id: str) -> FacialEmbedding:
        active = await self._repository.find_active(person_id)
        if active is None:
            raise NoActiveTemplate()
        return active

    async def history(self, person_id: str) -> list[FacialEmbedding]:
        return await self._repository.list_history(person_id)

    async def remove(self, person_id: str, context: CallContext) -> None:
        """Soft delete: the document stays, is_active goes false and deleted_at is set."""
        if not await self._repository.deactivate(person_id):
            raise NoActiveTemplate()
        await self._audit(OPERATION_DELETE, context, matched=False, score=0.0, threshold=0.0, person_id=person_id)

    async def _audit(self, operation: str, context: CallContext, **fields) -> None:
        await record_match(
            self._match_logs,
            BiometricMatchLog(
                biometric_type=BiometricType.FACIAL,
                operation=operation,
                correlation_id=context.correlation_id,
                **fields,
            ),
        )


class VerifyFaceService:
    """1:1: is this face the claimed person?"""

    def __init__(self, repository: BiometricRepositoryPort, match_logs: MatchLogRepositoryPort | None) -> None:
        self._repository = repository
        self._match_logs = match_logs

    async def verify(
        self, person_id: str, encoding: list[float], threshold: float, scope: PersonScope, context: CallContext
    ) -> tuple[bool, float]:
        # A person of another school answers like one without a template: no existence oracle.
        if not await scope.allows(person_id):
            raise NoActiveTemplate()
        active = await self._repository.find_active(person_id)
        if active is None:
            raise NoActiveTemplate()
        score = face_similarity(encoding, list(active.encoding))
        matched = score >= threshold
        await record_match(
            self._match_logs,
            BiometricMatchLog(
                biometric_type=BiometricType.FACIAL,
                operation=OPERATION_VERIFY,
                matched=matched,
                score=score,
                threshold=threshold,
                person_id=person_id,
                matched_person_id=person_id if matched else None,
                embedding_id=active.embedding_id,
                correlation_id=context.correlation_id,
            ),
        )
        return matched, score


class IdentifyFaceService:
    """1:N: whose face is this, among the people the caller may see?"""

    def __init__(self, repository: BiometricRepositoryPort, match_logs: MatchLogRepositoryPort | None) -> None:
        self._repository = repository
        self._match_logs = match_logs

    async def identify(
        self, encoding: list[float], threshold: float, scope: PersonScope, context: CallContext
    ) -> tuple[str, float]:
        best, score = await best_facial_match(encoding, self._repository, threshold, scope)
        await record_match(
            self._match_logs,
            BiometricMatchLog(
                biometric_type=BiometricType.FACIAL,
                operation=OPERATION_IDENTIFY,
                matched=best is not None,
                score=score,
                threshold=threshold,
                matched_person_id=best.person_id if best is not None else None,
                embedding_id=best.embedding_id if best is not None else None,
                correlation_id=context.correlation_id,
            ),
        )
        if best is None:
            raise NoMatch()
        return best.person_id, score
