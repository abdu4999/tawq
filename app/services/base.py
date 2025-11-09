from __future__ import annotations

from sqlmodel import Session


class BaseService:
    """Base class for services that interact with the database session."""

    def __init__(self, session: Session):
        self.session = session

    def add_and_commit(self, instance):
        self.session.add(instance)
        self.session.commit()
        self.session.refresh(instance)
        return instance
