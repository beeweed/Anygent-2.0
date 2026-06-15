from __future__ import annotations

from collections.abc import Callable, Coroutine
from typing import Any

from src.agent.models import AgentSession
from src.tools import file_read, file_write

ToolExecutor = Callable[[AgentSession, dict[str, Any]], Coroutine[Any, Any, tuple[str, bool]]]


class ToolRegistry:
    def __init__(self) -> None:
        self._definitions = [file_write.TOOL_DEFINITION, file_read.TOOL_DEFINITION]
        self._executors: dict[str, ToolExecutor] = {
            "file_write": file_write.execute,
            "file_read": file_read.execute,
        }

    @property
    def definitions(self) -> list[dict[str, Any]]:
        return self._definitions

    async def execute(self, name: str, session: AgentSession, arguments: dict[str, Any]) -> tuple[str, bool]:
        executor = self._executors.get(name)
        if executor is None:
            return f'{{"ok": false, "error": {{"type": "tool_not_found", "message": "Unknown tool: {name}"}}}}', True
        return await executor(session, arguments)


registry = ToolRegistry()
