from __future__ import annotations

import json

from src.agent.models import AgentSession
from src.services.sandbox_manager import sandbox_manager
from src.utils.paths import SandboxPathError, normalize_sandbox_path

TOOL_DEFINITION = {
    "type": "function",
    "function": {
        "name": "file_write",
        "description": "Create or overwrite a file at the given path inside the sandbox. Use for creating new files or fully rewriting existing ones.",
        "parameters": {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "description": "Absolute path starting with /home/user/. Example: /home/user/project/src/App.tsx"
                },
                "content": {
                    "type": "string",
                    "description": "The full content to write to the file."
                }
            },
            "required": ["file_path", "content"]
        }
    }
}


async def execute(session: AgentSession, arguments: dict) -> tuple[str, bool]:
    try:
        file_path = normalize_sandbox_path(arguments["file_path"])
        content = arguments["content"]
        await sandbox_manager.write_file(session, file_path, content)
        return (
            json.dumps(
                {
                    "ok": True,
                    "action": "write",
                    "file_path": file_path,
                    "bytes": len(content.encode("utf-8")),
                }
            ),
            False,
        )
    except (KeyError, SandboxPathError) as exc:
        return (
            json.dumps(
                {
                    "ok": False,
                    "error": {
                        "type": "invalid_request",
                        "message": str(exc),
                        "file_path": arguments.get("file_path"),
                    },
                }
            ),
            True,
        )
    except Exception as exc:
        return (
            json.dumps(
                {
                    "ok": False,
                    "error": {
                        "type": exc.__class__.__name__,
                        "message": str(exc),
                        "file_path": arguments.get("file_path"),
                    },
                }
            ),
            True,
        )
