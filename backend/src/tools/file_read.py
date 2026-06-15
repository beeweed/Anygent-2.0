from __future__ import annotations

import json

from src.agent.models import AgentSession
from src.services.sandbox_manager import sandbox_manager
from src.utils.paths import SandboxPathError, add_line_numbers, normalize_sandbox_path

TOOL_DEFINITION = {
    "type": "function",
    "function": {
        "name": "file_read",
        "description": "Read the content of an existing file from the sandbox. Returns content with line numbers.",
        "parameters": {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "description": "Absolute path starting with /home/user/. Example: /home/user/project/src/main.py"
                }
            },
            "required": ["file_path"]
        }
    }
}


async def execute(session: AgentSession, arguments: dict) -> tuple[str, bool]:
    try:
        file_path = normalize_sandbox_path(arguments["file_path"])
        exists = await sandbox_manager.file_exists(session, file_path)
        if not exists:
            return (
                json.dumps(
                    {
                        "ok": False,
                        "error": {
                            "type": "file_not_found",
                            "message": f"File does not exist: {file_path}",
                            "file_path": file_path,
                        },
                    }
                ),
                True,
            )
        content = await sandbox_manager.read_file(session, file_path)
        return (
            json.dumps(
                {
                    "ok": True,
                    "action": "read",
                    "file_path": file_path,
                    "content": add_line_numbers(content),
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
