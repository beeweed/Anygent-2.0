from __future__ import annotations

import asyncio

from src.agent.models import AgentSession, ProviderSettings


class SessionStore:
    def __init__(self) -> None:
        self._sessions: dict[str, AgentSession] = {}
        self._lock = asyncio.Lock()

    async def get_or_create(self, session_id: str, settings: ProviderSettings) -> AgentSession:
        async with self._lock:
            session = self._sessions.get(session_id)
            if session is None:
                session = AgentSession(session_id=session_id, settings=settings)
                self._sessions[session_id] = session
            else:
                session.settings = settings
            return session

    async def get(self, session_id: str) -> AgentSession | None:
        async with self._lock:
            return self._sessions.get(session_id)


session_store = SessionStore()
