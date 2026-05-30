import json
import os
from typing import Any
from urllib.parse import quote_plus

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError

try:
    from supabase import Client, create_client
except Exception:  # pragma: no cover - optional dependency during local bootstrap
    Client = Any  # type: ignore[assignment]
    create_client = None  # type: ignore[assignment]


_engine: Engine | None = None
_supabase_client: Client | None = None
_db_ready = False
_backend_name = "none"


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


def _build_supabase_client() -> Client | None:
    global _supabase_client, _backend_name

    if _supabase_client is not None:
        return _supabase_client

    supabase_url = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")

    if not supabase_url or not supabase_service_key or create_client is None:
        return None

    _supabase_client = create_client(supabase_url, supabase_service_key)
    _backend_name = "supabase"
    return _supabase_client


def _json_default(value: Any, fallback: Any) -> Any:
    if value is None:
        return fallback
    if isinstance(value, str):
        try:
            return json.loads(value)
        except Exception:
            return value
    return value


def _normalize_payload_dict(payload: dict[str, Any]) -> dict[str, Any]:
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

    return {
        "user_email": payload.get("user_email"),
        "meal_label": payload.get("meal_label"),
        "food_items": payload.get("food_items", []),
        "total_nutrition": payload.get("total_nutrition", {}),
        "details": payload.get("details", []),
        "metadata": metadata_payload if metadata_payload is not None else {},
        "source": payload.get("source", "manual"),
    }


def get_engine() -> Engine | None:
    global _engine, _backend_name

    if _engine is not None:
        return _engine

    connection_string = _build_connection_string()
    if not connection_string:
        return None

    _engine = create_engine(connection_string, pool_pre_ping=True, future=True)
    _backend_name = "azure_sql"
    return _engine


def initialize_database() -> bool:
    global _db_ready

    supabase_client = _build_supabase_client()
    if supabase_client is not None:
        try:
            supabase_client.table("meal_history").select("id").limit(1).execute()
            _db_ready = True
            return True
        except Exception as exc:
            print(f"[WARNING] Supabase init failed: {exc}")
            _db_ready = False
            return False

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
    return _db_ready and get_database_connection_configured()


def get_database_connection_configured() -> bool:
    return _build_supabase_client() is not None or get_engine() is not None


def get_database_backend_name() -> str:
    if _build_supabase_client() is not None:
        return "supabase"
    if get_engine() is not None:
        return "azure_sql"
    return "none"


def save_meal_history(payload: dict[str, Any]) -> dict[str, Any] | None:
    normalized_payload = _normalize_payload_dict(payload)

    supabase_client = _build_supabase_client()
    if supabase_client is not None:
        try:
            result = (
                supabase_client.table("meal_history")
                .insert(normalized_payload)
                .select("id, created_at")
                .execute()
            )
            inserted_rows = getattr(result, "data", None) or []
            if not inserted_rows:
                return None

            row = inserted_rows[0]
            created_at = row.get("created_at")
            return {
                "id": str(row.get("id")),
                "created_at": created_at.isoformat() if hasattr(created_at, "isoformat") else str(created_at),
            }
        except Exception as exc:
            print(f"[WARNING] Failed to save meal history to Supabase: {exc}")
            return None

    engine = get_engine()
    if engine is None:
        return None

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
                    "user_email": normalized_payload.get("user_email"),
                    "meal_label": normalized_payload.get("meal_label"),
                    "food_items": json.dumps(normalized_payload.get("food_items", []), ensure_ascii=False),
                    "total_nutrition": json.dumps(normalized_payload.get("total_nutrition", {}), ensure_ascii=False),
                    "details": json.dumps(normalized_payload.get("details", []), ensure_ascii=False),
                    "metadata": json.dumps(normalized_payload.get("metadata", {}), ensure_ascii=False),
                    "source": normalized_payload.get("source", "manual"),
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


def delete_meal_history(entry_id: str) -> bool:
    supabase_client = _build_supabase_client()
    if supabase_client is not None:
        try:
            result = supabase_client.table("meal_history").delete().eq("id", entry_id).execute()
            deleted_rows = getattr(result, "data", None) or []
            return bool(deleted_rows)
        except Exception as exc:
            print(f"[WARNING] Failed to delete meal history from Supabase: {exc}")
            return False

    engine = get_engine()
    if engine is None:
        return False

    try:
        with engine.begin() as connection:
            result = connection.execute(
                text(
                    """
                    DELETE FROM dbo.meal_history
                    WHERE id = :id
                    """
                ),
                {"id": entry_id},
            )
            return bool(result.rowcount and result.rowcount > 0)
    except SQLAlchemyError as exc:
        print(f"[WARNING] Failed to delete meal history: {exc}")
        return False


def list_meal_history(limit: int = 10) -> list[dict[str, Any]]:
    supabase_client = _build_supabase_client()
    if supabase_client is not None:
        try:
            result = (
                supabase_client.table("meal_history")
                .select("id, user_email, meal_label, food_items, total_nutrition, details, metadata, source, created_at")
                .order("created_at", desc=True)
                .limit(int(limit))
                .execute()
            )
            rows = getattr(result, "data", None) or []
            return [
                {
                    "id": str(row.get("id")),
                    "user_email": row.get("user_email"),
                    "meal_label": row.get("meal_label"),
                    "food_items": _json_default(row.get("food_items"), []),
                    "total_nutrition": _json_default(row.get("total_nutrition"), {}),
                    "details": _json_default(row.get("details"), []),
                    "metadata": _json_default(row.get("metadata"), {}),
                    "source": row.get("source", "manual"),
                    "created_at": row.get("created_at").isoformat() if hasattr(row.get("created_at"), "isoformat") else str(row.get("created_at")),
                }
                for row in rows
            ]
        except Exception as exc:
            print(f"[WARNING] Failed to read meal history from Supabase: {exc}")
            return []

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