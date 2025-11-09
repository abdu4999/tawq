from contextlib import contextmanager
from typing import Iterator

from sqlmodel import Session, SQLModel, create_engine

from .config import get_settings

settings = get_settings()
database_url = settings.resolved_database_url
engine_kwargs: dict[str, object] = {"echo": False}

if database_url.startswith("postgresql") and "sslmode" not in database_url:
    # Supabase requires SSL connections.
    engine_kwargs["connect_args"] = {"sslmode": "require"}

engine = create_engine(database_url, **engine_kwargs)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


@contextmanager
def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session
