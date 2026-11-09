"""The facial use cases run without HTTP: enroll, verify, identify and the one-face-one-person rule."""
from __future__ import annotations

import asyncio

import pytest

from application.facial_services import (
    CallContext,
    FaceAlreadyEnrolled,
    FaceTemplateService,
    IdentifyFaceService,
    NoActiveTemplate,
    NoMatch,
    VerifyFaceService,
)
from tests.support.in_memory_repositories import InMemoryBiometricRepository, InMemoryMatchLogRepository

ALICE = "11111111-1111-4111-8111-111111111111"
BOB = "22222222-2222-4222-8222-222222222222"
FACE = [1.0, 0.0, 0.0, 0.0]
OTHER_FACE = [0.0, 1.0, 0.0, 0.0]
CONTEXT = CallContext(correlation_id="corr-1", actor_user_id="user-1")


class _Only:
    def __init__(self, *people: str) -> None:
        self.people = set(people)

    async def allows(self, person_id: str) -> bool:
        return person_id in self.people


def run(coro):
    return asyncio.run(coro)


@pytest.fixture
def repos():
    return InMemoryBiometricRepository(), InMemoryMatchLogRepository()


def test_enroll_stores_the_template_and_audits_who_did_it(repos):
    repository, logs = repos
    stored = run(FaceTemplateService(repository, logs).enroll(ALICE, FACE, "facenet-v1", CONTEXT))
    assert stored.person_id == ALICE
    assert logs.entries[-1].operation == "ENROLL"
    assert logs.entries[-1].actor_user_id == "user-1"


def test_a_face_already_enrolled_for_someone_else_is_refused(repos):
    repository, logs = repos
    templates = FaceTemplateService(repository, logs)
    run(templates.enroll(ALICE, FACE, "facenet-v1", CONTEXT))
    with pytest.raises(FaceAlreadyEnrolled):
        run(templates.enroll(BOB, FACE, "facenet-v1", CONTEXT, reject_duplicates_within=0.5))
    # The same person may re-enroll, and a different face is not a duplicate.
    run(templates.enroll(ALICE, FACE, "facenet-v1", CONTEXT, reject_duplicates_within=0.5))
    run(templates.enroll(BOB, OTHER_FACE, "facenet-v1", CONTEXT, reject_duplicates_within=0.5))


def test_verify_hides_a_person_outside_the_scope(repos):
    repository, logs = repos
    run(FaceTemplateService(repository, logs).enroll(ALICE, FACE, "facenet-v1", CONTEXT))
    verify = VerifyFaceService(repository, logs)
    assert run(verify.verify(ALICE, FACE, 0.5, _Only(ALICE), CONTEXT))[0] is True
    with pytest.raises(NoActiveTemplate):
        run(verify.verify(ALICE, FACE, 0.5, _Only(BOB), CONTEXT))


def test_identify_answers_only_with_an_allowed_person(repos):
    repository, logs = repos
    run(FaceTemplateService(repository, logs).enroll(ALICE, FACE, "facenet-v1", CONTEXT))
    identify = IdentifyFaceService(repository, logs)
    person_id, _ = run(identify.identify(FACE, 0.5, _Only(ALICE), CONTEXT))
    assert person_id == ALICE
    with pytest.raises(NoMatch):
        run(identify.identify(FACE, 0.5, _Only(BOB), CONTEXT))
    assert logs.entries[-1].operation == "IDENTIFY" and logs.entries[-1].matched is False


def test_removing_a_missing_template_is_reported(repos):
    repository, logs = repos
    with pytest.raises(NoActiveTemplate):
        run(FaceTemplateService(repository, logs).remove(ALICE, CONTEXT))
