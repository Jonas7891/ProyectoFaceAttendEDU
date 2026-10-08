"""Application queries for the user directory."""
from __future__ import annotations

from ..ports.in_.user_queries import UserQueriesPort
from ..ports.out.user_repository import UserRepository


class UserQueries(UserQueriesPort):
    def __init__(self, repository: UserRepository) -> None:
        self.repository = repository

    def exists(self, username: str) -> dict[str, bool]:
        user = self.repository.get_by_username(username.strip())
        if user is None or user.id is None:
            return {"exists": False}
        return {
            "exists": True,
            "has_face": user.face_encoding is not None,
            "has_fingerprint": self.repository.has_fingerprint(user.id),
        }

    def list_users(self) -> list[dict[str, bool | str]]:
        return [
            {
                "username": user.username,
                "has_face": user.face_encoding is not None,
                "has_fingerprint": self.repository.has_fingerprint(user.id),
            }
            for user in self.repository.list_users()
        ]

    def list_active_users(self, active_usernames: set[str]) -> list[dict[str, bool | str]]:
        return [
            user
            for user in self.list_users()
            if user["username"] in active_usernames
        ]
