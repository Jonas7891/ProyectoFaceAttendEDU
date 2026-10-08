import argparse
import json
import os
import random
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import psycopg
from pymongo import MongoClient, UpdateOne

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from face_auth.infrastructure.persistence.schema import (  # noqa: E402
    ensure_mongo_biometric_indexes,
    ensure_postgres_identity,
)


DEFAULT_POSTGRES_URL = "postgresql://faceauth:faceauth@localhost:5432/face_auth"
DEFAULT_MONGO_URL = "mongodb://biometric:biometric@localhost:27017/?authSource=admin"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Carga estudiantes en PostgreSQL y embeddings faciales de prueba en MongoDB")
    parser.add_argument("--count", type=int, default=100_000)
    parser.add_argument("--prefix", default="student")
    parser.add_argument("--batch-size", type=int, default=1_000)
    parser.add_argument("--seed", type=int, default=20260915, help="Semilla para generar embeddings reproducibles")
    parser.add_argument("--postgres-url", default=os.getenv("POSTGRES_URL", DEFAULT_POSTGRES_URL))
    parser.add_argument("--mongo-url", default=os.getenv("MONGO_URL", DEFAULT_MONGO_URL))
    parser.add_argument("--mongo-db", default=os.getenv("MONGO_DB", "biometric"))
    return parser.parse_args()


def ensure_postgres_schema(connection: psycopg.Connection) -> None:
    ensure_postgres_identity(connection)


def ensure_mongo_indexes(database) -> None:
    ensure_mongo_biometric_indexes(database)


def embedding(generator: random.Random) -> str:
    values = [generator.uniform(-1.0, 1.0) for _ in range(128)]
    length = sum(value * value for value in values) ** 0.5
    return json.dumps([round(value / length, 8) for value in values], separators=(",", ":"))


def insert_students(connection: psycopg.Connection, students: list[dict]) -> dict[str, int]:
    document_numbers = [student["document_number"] for student in students]
    placeholders = ",".join(["(%s,%s,%s,%s,%s,%s,%s,%s)"] * len(students))
    values = [
        value
        for student in students
        for value in (
            student["document_number"],
            student["name"],
            student["last_name"],
            student["email"],
            student["phone"],
            True,
            student["created_at"],
            student["created_at"],
        )
    ]
    connection.execute(
        f"INSERT INTO person (document_number, name, last_name, email, phone, status, created_at, updated_at) VALUES {placeholders} ON CONFLICT (document_number) DO NOTHING",
        values,
    )
    connection.execute(
        """
        INSERT INTO app_user (person_id, username, authentication_type, status, created_at, updated_at)
        SELECT person_id, document_number, 'biometric', TRUE, created_at, updated_at
        FROM person
        WHERE document_number = ANY(%s)
        ON CONFLICT (username) DO NOTHING
        """,
        (document_numbers,),
    )
    rows = connection.execute(
        "SELECT person_id, document_number FROM person WHERE document_number = ANY(%s)",
        (document_numbers,),
    ).fetchall()
    return {row[1]: row[0] for row in rows}


def main() -> None:
    args = parse_args()
    if args.count < 1 or args.batch_size < 1:
        raise SystemExit("--count y --batch-size deben ser mayores que cero")

    mongo_client = MongoClient(args.mongo_url, serverSelectionTimeoutMS=5_000)
    started = time.perf_counter()
    generator = random.Random(args.seed)
    created_at = datetime.now(timezone.utc)
    inserted = 0
    try:
        mongo_client.admin.command("ping")
        database = mongo_client[args.mongo_db]
        ensure_mongo_indexes(database)
        with psycopg.connect(args.postgres_url) as connection:
            ensure_postgres_schema(connection)
            for start in range(1, args.count + 1, args.batch_size):
                end = min(start + args.batch_size, args.count + 1)
                students = [
                    {
                        "document_number": f"{args.prefix.upper()}-{number:08d}",
                        "name": f"Estudiante{number:08d}",
                        "last_name": f"Prueba{number:08d}",
                        "email": f"{args.prefix.lower()}.{number:08d}@example.edu",
                        "phone": f"300{number % 10_000_000:07d}",
                        "created_at": created_at,
                    }
                    for number in range(start, end)
                ]
                person_ids = insert_students(connection, students)
                operations = [
                    UpdateOne(
                        {"person_id": person_ids[student["document_number"]]},
                        {
                            "$set": {
                                "person_id": person_ids[student["document_number"]],
                                "encoding": embedding(generator),
                                "updated_at": created_at,
                            },
                            "$setOnInsert": {"created_at": created_at},
                        },
                        upsert=True,
                    )
                    for student in students
                ]
                database.face_samples.bulk_write(operations, ordered=False)
                inserted += len(students)
                print(f"Procesados {inserted}/{args.count}", flush=True)
        elapsed = time.perf_counter() - started
        print(f"Carga terminada: {inserted} estudiantes sincronizados en {elapsed:.2f}s ({inserted / elapsed:.0f} estudiantes/s).")
        print("Identidad: PostgreSQL person/app_user | Biometria: MongoDB face_samples")
    finally:
        mongo_client.close()


if __name__ == "__main__":
    main()
