from __future__ import annotations

from pathlib import PurePosixPath

from src.config.constants import SANDBOX_ROOT


class SandboxPathError(ValueError):
    """Raised when a sandbox path is invalid."""


def normalize_sandbox_path(file_path: str) -> str:
    if not file_path:
        raise SandboxPathError("file_path is required")
    if not file_path.startswith(SANDBOX_ROOT):
        raise SandboxPathError(f"Path must start with {SANDBOX_ROOT}")

    normalized = str(PurePosixPath(file_path))
    if normalized in {"/", ""}:
        raise SandboxPathError(f"Path must stay inside {SANDBOX_ROOT}")

    if not normalized.startswith(SANDBOX_ROOT):
        raise SandboxPathError(f"Path must stay inside {SANDBOX_ROOT}")

    parts = PurePosixPath(normalized).parts
    if ".." in parts:
        raise SandboxPathError("Path traversal is not allowed")

    return normalized


def add_line_numbers(content: str) -> str:
    lines = content.splitlines()
    if not lines:
        return "1\t"
    return "\n".join(f"{index}\t{line}" for index, line in enumerate(lines, start=1))
