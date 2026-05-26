import json
import os
from typing import Any
from urllib.parse import quote_plus

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError


_engine: Engine | None = None
_db_ready = False


def _build_connection_string() -> str | None:
    direct = os.getenv("AZURE_SQL_CONNECTION_STRING")
    if direct:
        return direct

    server = os.getenv("AZURE_SQL_SERVER")
    database = os.getenv("AZURE_SQL_DATABASE")
    username = os.getenv("AZURE_SQL_USERNAME")
    password = os.getenv("AZURE_SQL_PASSWORD")

    if not all([server, database, username, password]):
        return None

    driver = os.getenv("AZURE_SQL_DRIVER", "ODBC Driver 18 for SQL Server")
    odbc = (
        f"DRIVER={{{driver}}};"
        f"SERVER={server};"
        f"DATABASE={database};"
        f"UID={username};"
        f"PWD={password};"
        "Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
    )
    return f"mssql+pyodbc:///?odbc_connect={quote_plus(odbc)}"


def get_engine() -> Engine | None:
    global _engine

    if _engine is not None:
        return _engine

    connection_string = _build_connection_string()
    if not connection_string:
        return None

    _engine = create_engine(connection_string, pool_pre_ping=True, future=True)
    return _engine


def initialize_database() -> bool:
    global _db_ready

    engine = get_engine()
    if engine is None:
        _db_ready = False
        return False

    try:
        with engine.begin() as connection:
            connection.execute(
                text(
                    """
                    IF OBJECT_ID('dbo.meal_history', 'U') IS NULL
                    BEGIN
                        CREATE TABLE dbo.meal_history (
                            id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
                            user_email NVARCHAR(320) NULL,
                            meal_label NVARCHAR(200) NULL,
                            food_items NVARCHAR(MAX) NOT NULL,
                            total_nutrition NVARCHAR(MAX) NOT NULL,
                            details NVARCHAR(MAX) NULL,
                            metadata NVARCHAR(MAX) NULL,
                            source NVARCHAR(50) NOT NULL DEFAULT 'manual',
                            created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
                        );
                    END;

                    IF COL_LENGTH('dbo.meal_history', 'metadata') IS NULL
                    BEGIN
                        ALTER TABLE dbo.meal_history ADD metadata NVARCHAR(MAX) NULL;
                    END;
                    """
                )
            )
        _db_ready = True
        return True
    except SQLAlchemyError as exc:
        print(f"[WARNING] Azure SQL init failed: {exc}")
        _db_ready = False
        return False


def is_database_ready() -> bool:
    return _db_ready and get_engine() is not None


def save_meal_history(payload: dict[str, Any]) -> dict[str, Any] | None:
    engine = get_engine()
    if engine is None:
        return None

    known_keys = {
        "user_email",
        "meal_label",
        "food_items",
        "total_nutrition",
        "details",
        "metadata",
        "source",
    }

    metadata_payload = payload.get("metadata")
    extra_payload = {key: value for key, value in payload.items() if key not in known_keys}
    if extra_payload:
        if isinstance(metadata_payload, dict):
            metadata_payload = {**metadata_payload, **extra_payload}
        elif metadata_payload is None:
            metadata_payload = extra_payload
        else:
            metadata_payload = {
                "value": metadata_payload,
                "extra": extra_payload,
            }

    try:
        with engine.begin() as connection:
            result = connection.execute(
                text(
                    """
                    INSERT INTO dbo.meal_history (
                        user_email,
                        meal_label,
                        food_items,
                        total_nutrition,
                        details,
                        metadata,
                        source
                    )
                    OUTPUT inserted.id, inserted.created_at
                    VALUES (:user_email, :meal_label, :food_items, :total_nutrition, :details, :metadata, :source)
                    """
                ),
                {
                    "user_email": payload.get("user_email"),
                    "meal_label": payload.get("meal_label"),
                    "food_items": json.dumps(payload.get("food_items", []), ensure_ascii=False),
                    "total_nutrition": json.dumps(payload.get("total_nutrition", {}), ensure_ascii=False),
                    "details": json.dumps(payload.get("details", []), ensure_ascii=False),
                    "metadata": json.dumps(metadata_payload, ensure_ascii=False) if metadata_payload is not None else None,
                    "source": payload.get("source", "manual"),
                },
            )
            row = result.mappings().first()
            if row is None:
                return None

            created_at = row["created_at"]
            return {
                "id": str(row["id"]),
                "created_at": created_at.isoformat() if hasattr(created_at, "isoformat") else str(created_at),
            }
    except SQLAlchemyError as exc:
        print(f"[WARNING] Failed to save meal history: {exc}")
        return None


def list_meal_history(limit: int = 10) -> list[dict[str, Any]]:
    engine = get_engine()
    if engine is None:
        return []

    try:
        with engine.begin() as connection:
            result = connection.execute(
                text(
                    """
                    SELECT
                        id,
                        user_email,
                        meal_label,
                        food_items,
                        total_nutrition,
                        details,
                        metadata,
                        source,
                        created_at
                    FROM (
                        SELECT TOP (:limit)
                            *
                        FROM dbo.meal_history
                        ORDER BY created_at DESC
                    ) AS meal_history
                    ORDER BY created_at DESC
                    """
                ),
                {"limit": int(limit)},
            )

            rows: list[dict[str, Any]] = []
            for row in result.mappings().all():
                metadata_value = row["metadata"] if row["metadata"] else None
                rows.append(
                    {
                        "id": str(row["id"]),
                        "user_email": row["user_email"],
                        "meal_label": row["meal_label"],
                        "food_items": json.loads(row["food_items"]) if row["food_items"] else [],
                        "total_nutrition": json.loads(row["total_nutrition"]) if row["total_nutrition"] else {},
                        "details": json.loads(row["details"]) if row["details"] else [],
                        "metadata": json.loads(metadata_value) if metadata_value else {},
                        "source": row["source"],
                        "created_at": row["created_at"].isoformat() if hasattr(row["created_at"], "isoformat") else str(row["created_at"]),
                    }
                )
            return rows
    except SQLAlchemyError as exc:
        print(f"[WARNING] Failed to read meal history: {exc}")
        return []
