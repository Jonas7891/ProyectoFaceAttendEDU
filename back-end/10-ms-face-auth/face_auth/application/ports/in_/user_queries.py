"""Inbound contract for user directory queries."""
from abc import ABC, abstractmethod


class UserQueriesPort(ABC):
    @abstractmethod
    def exists(self, username: str) -> dict[str, bool]:
        raise NotImplementedError

    @abstractmethod
    def list_users(self) -> list[dict[str, bool | str]]:
        raise NotImplementedError

    @abstractmethod
    def list_active_users(self, active_usernames: set[str]) -> list[dict[str, bool | str]]:
        raise NotImplementedError
