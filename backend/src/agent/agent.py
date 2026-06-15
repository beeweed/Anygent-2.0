import json
import re
import asyncio
from typing import AsyncGenerator, Optional, Callable

from src.agent.models import AgentSession, ProviderSettings, StreamEvent, ToolResult
from src.agent.systemprompt import SYSTEM_PROMPT
from src.config.constants import MAX_ITERATIONS
from src.services.openrouter import openrouter_service
from src.services.sandbox_manager import sandbox_manager
from src.tools.registry import registry


class AgentRuntimeError(RuntimeError):
    """Raised when the agent cannot complete a turn."""


class AgentRunner:
    def __init__(self) -> None:
        self._max_iterations = MAX_ITERATIONS

    async def stream_turn(
        self,
        session: AgentSession,
        user_message: str,
        settings: ProviderSettings,
        on_file_tree: Optional[Callable[[AgentSession], AsyncGenerator[StreamEvent, None]]] = None,
    ) -> AsyncGenerator[StreamEvent, None]:
        session.current_iteration = 0
        session.settings = settings
        session.history.append({"role": "user", "content": user_message})

        if session.sandbox is None:
            yield StreamEvent(event="status", data={"label": "creating sandbox...", "phase": "sandbox"})
            await sandbox_manager.ensure_sandbox(session, settings)
            file_tree = await sandbox_manager.list_tree(session)
            session.latest_file_tree = file_tree
            yield StreamEvent(event="files", data={"tree": [node.model_dump(by_alias=True) for node in file_tree]})

        yield StreamEvent(event="status", data={"label": "thinking....", "phase": "thinking"})

        while session.current_iteration < self._max_iterations:
            session.current_iteration += 1
            yield StreamEvent(event="iteration", data={"current": session.current_iteration, "max": self._max_iterations})

            content_fragments: list[str] = []
            tool_call_fragments: dict[int, dict] = {}
            finish_reason: str | None = None

            async for chunk in openrouter_service.stream_chat(
                settings=settings,
                messages=self._build_messages(session.history),
                tools=registry.definitions,
            ):
                choices = chunk.get("choices", [])
                if not choices:
                    continue
                choice = choices[0]
                delta = choice.get("delta", {})
                finish_reason = choice.get("finish_reason") or finish_reason

                token = delta.get("content")
                if token:
                    content_fragments.append(token)
                    yield StreamEvent(event="token", data={"text": token})

                if delta.get("tool_calls"):
                    tool_call_fragments = openrouter_service.accumulate_tool_calls(
                        tool_call_fragments,
                        delta["tool_calls"],
                    )

            assistant_message = openrouter_service.build_assistant_message(content_fragments, tool_call_fragments)
            session.history.append(assistant_message)

            if tool_call_fragments or finish_reason == "tool_calls":
                tool_calls = openrouter_service.parse_tool_calls(tool_call_fragments)
                session.history[-1]["tool_calls"] = [
                    {
                        "id": tool_call["id"],
                        "type": "function",
                        "function": {
                            "name": tool_call["name"],
                            "arguments": json.dumps(tool_call["arguments"]),
                        },
                    }
                    for tool_call in tool_calls
                ]

                for tool_call in tool_calls:
                    file_path = tool_call["arguments"].get("file_path", "")
                    action_label = "create"
                    if tool_call["name"] == "file_read":
                        action_label = "read"
                    elif tool_call["name"] == "file_write":
                        action_label = self._infer_write_label(file_path)

                    yield StreamEvent(
                        event="tool_call",
                        data={
                            "toolCallId": tool_call["id"],
                            "name": tool_call["name"],
                            "path": file_path,
                            "label": f"{action_label}: {file_path}",
                        },
                    )

                    result_content, is_error = await registry.execute(
                        tool_call["name"],
                        session,
                        tool_call["arguments"],
                    )
                    session.history.append(
                        {
                            "role": "tool",
                            "tool_call_id": tool_call["id"],
                            "content": result_content,
                            "is_error": is_error,
                        }
                    )
                    yield StreamEvent(
                        event="tool_result",
                        data={
                            "toolCallId": tool_call["id"],
                            "name": tool_call["name"],
                            "path": file_path,
                            "content": result_content,
                            "isError": is_error,
                        },
                    )

                    if tool_call["name"] == "file_write":
                        file_tree = await sandbox_manager.list_tree(session)
                        session.latest_file_tree = file_tree
                        yield StreamEvent(event="files", data={"tree": [node.model_dump(by_alias=True) for node in file_tree]})

                yield StreamEvent(event="status", data={"label": "thinking....", "phase": "thinking"})
                continue

            final_text = assistant_message.get("content") or ""
            if re.search(r"\S", final_text):
                yield StreamEvent(event="assistant_message", data={"content": final_text})
            yield StreamEvent(event="done", data={"iterations": session.current_iteration})
            return

        raise AgentRuntimeError(
            f"Max iteration limit of {self._max_iterations} reached before the task completed."
        )

    def _build_messages(self, history: list[dict]) -> list[dict]:
        return [{"role": "system", "content": SYSTEM_PROMPT}, *history]

    def _infer_write_label(self, file_path: str) -> str:
        if file_path:
            return "create"
        return "write"


agent_runner = AgentRunner()
