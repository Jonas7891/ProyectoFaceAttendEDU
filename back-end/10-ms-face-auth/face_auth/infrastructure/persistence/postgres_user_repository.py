from datetime import datetime, timezone

from ...domain.entities.user import User
from ...domain.exceptions import DuplicateUserError
from .schema import ensure_postgres_identity


def _psycopg():
    import psycopg  # import perezoso: permite unit tests sin driver instalado

    return psycopg


class PostgresUserRepository:
    def __init__(self, database_url: str) -> None:
        self.database_url = database_url

    def initialize(self) -> None:
        psycopg = _psycopg()
        with psycopg.connect(self.database_url) as connection:
            ensure_postgres_identity(connection)

    def get_by_username(self, username: str) -> User | None:
        psycopg = _psycopg()
        from psycopg.rows import dict_row

        with psycopg.connect(self.database_url, row_factory=dict_row) as connection:
            row = connection.execute(
                "SELECT person_id, username, app_user.created_at FROM app_user JOIN person USING (person_id) WHERE username = %s AND app_user.status AND person.status",
                (username,),
            ).fetchone()
        return self._user(row) if row else None

    def get_by_id(self, user_id: int) -> User | None:
        psycopg = _psycopg()
        from psycopg.rows import dict_row

        with psycopg.connect(self.database_url, row_factory=dict_row) as connection:
            row = connection.execute(
                "SELECT person_id, username, app_user.created_at FROM app_user JOIN person USING (person_id) WHERE person_id = %s AND app_user.status AND person.status",
                (user_id,),
            ).fetchone()
        return self._user(row) if row else None

    def list_users(self) -> list[User]:
        psycopg = _psycopg()
        from psycopg.rows import dict_row

        with psycopg.connect(self.database_url, row_factory=dict_row) as connection:
            rows = connection.execute(
                "SELECT person_id, username, app_user.created_at FROM app_user JOIN person USING (person_id) WHERE app_user.status AND person.status ORDER BY person_id"
            ).fetchall()
        return [self._user(row) for row in rows]

    def save(self, user: User) -> User:
        psycopg = _psycopg()
        from psycopg.rows import dict_row

        now = user.created_at or datetime.now(timezone.utc)
        try:
            with psycopg.connect(self.database_url, row_factory=dict_row) as connection:
                if user.id is None:
                    row = connection.execute(
                        "INSERT INTO person (created_at, updated_at) VALUES (%s, %s) RETURNING person_id",
                        (now, now),
                    ).fetchone()
                    person_id = row["person_id"]
                    row = connection.execute(
                        "INSERT INTO app_user (person_id, username, created_at, updated_at) VALUES (%s, %s, %s, %s) RETURNING person_id, username, created_at",
                        (person_id, user.username, now, now),
                    ).fetchone()
                else:
                    row = connection.execute(
                        "UPDATE app_user SET username = %s, updated_at = %s WHERE person_id = %s RETURNING person_id, username, created_at",
                        (user.username, now, user.id),
                    ).fetchone()
                    if row is None:
                        raise ValueError("El usuario no existe en PostgreSQL")
        except psycopg.errors.UniqueViolation as exc:
            raise DuplicateUserError("El usuario ya está registrado") from exc
        return User(row["person_id"], row["username"], user.face_encoding, row["created_at"])

    @staticmethod
    def _user(row: dict) -> User:
        return User(row["person_id"], row["username"], None, row["created_at"])

    def deactivate(self, person_id: int) -> None:
        """Soft-delete de identidad: conserva fila para FK/auditoría, desactiva login."""
        psycopg = _psycopg()
        with psycopg.connect(self.database_url) as connection:
            connection.execute(
                "UPDATE app_user SET status = FALSE, updated_at = %s WHERE person_id = %s",
                (datetime.now(timezone.utc), person_id),
            )
            connection.execute(
                "UPDATE person SET status = FALSE, updated_at = %s WHERE person_id = %s",
                (datetime.now(timezone.utc), person_id),
            )

    def hard_delete(self, person_id: int) -> None:
        psycopg = _psycopg()
        with psycopg.connect(self.database_url) as connection:
            connection.execute("DELETE FROM app_user WHERE person_id = %s", (person_id,))
            connection.execute("DELETE FROM person WHERE person_id = %s", (person_id,))