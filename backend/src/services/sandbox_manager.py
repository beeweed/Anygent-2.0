from __future__ import annotations

import asyncio
from typing import Any

from e2b import Sandbox

from src.agent.models import AgentSession, FileNode, ProviderSettings
from src.config.constants import SANDBOX_ROOT, SANDBOX_TIMEOUT_SECONDS
from src.utils.paths import normalize_sandbox_path


class SandboxManager:
    async def ensure_sandbox(self, session: AgentSession, settings: ProviderSettings) -> Any:
        if session.sandbox is not None:
            return session.sandbox

        def _create() -> Any:
            kwargs = {
                "api_key": settings.e2b_api_key,
                "timeout": SANDBOX_TIMEOUT_SECONDS,
            }
            if settings.e2b_template_id:
                kwargs["template"] = settings.e2b_template_id

            create_method = getattr(Sandbox, "create", None)
            if callable(create_method):
                try:
                    return create_method(**kwargs)
                except TypeError:
                    pass

            return Sandbox(
                template=settings.e2b_template_id or None,
                timeout=SANDBOX_TIMEOUT_SECONDS,
                api_key=settings.e2b_api_key,
            )

        session.sandbox = await asyncio.to_thread(_create)
        return session.sandbox

    async def read_file(self, session: AgentSession, file_path: str) -> str:
        sandbox = session.sandbox
        normalized = normalize_sandbox_path(file_path)

        def _read() -> str:
            try:
                return sandbox.files.read(normalized)
            except Exception:
                data = sandbox.files.read(normalized, format="bytes")
                if isinstance(data, bytearray):
                    return bytes(data).decode("utf-8", errors="replace")
                if isinstance(data, bytes):
                    return data.decode("utf-8", errors="replace")
                return str(data)

        return await asyncio.to_thread(_read)

    async def write_file(self, session: AgentSession, file_path: str, content: str) -> None:
        sandbox = session.sandbox
        normalized = normalize_sandbox_path(file_path)

        def _write() -> None:
            sandbox.files.write(normalized, content)

        await asyncio.to_thread(_write)

    async def file_exists(self, session: AgentSession, file_path: str) -> bool:
        sandbox = session.sandbox
        normalized = normalize_sandbox_path(file_path)
        return await asyncio.to_thread(sandbox.files.exists, normalized)

    async def list_tree(self, session: AgentSession, depth: int = 8) -> list[FileNode]:
        sandbox = session.sandbox
        if sandbox is None:
            return []

        entries = await asyncio.to_thread(sandbox.files.list, SANDBOX_ROOT, depth)
        return self._build_tree(entries)

    async def get_file_preview(self, session: AgentSession, file_path: str) -> str:
        return await self.read_file(session, file_path)

    def _build_tree(self, entries: list[Any]) -> list[FileNode]:
        root: dict[str, FileNode] = {}

        def ensure_dir(path: str) -> FileNode:
            path = path.rstrip("/") or SANDBOX_ROOT
            if path in root:
                return root[path]
            name = path.split("/")[-1] or SANDBOX_ROOT.rstrip("/")
            node = FileNode(name=name, path=path, nodeType="directory", children=[])
            root[path] = node
            if path != SANDBOX_ROOT:
                parent_path = "/".join(path.rstrip("/").split("/")[:-1]) or "/"
                if parent_path == "/":
                    parent_path = SANDBOX_ROOT
                parent = ensure_dir(parent_path)
                if not any(child.path == node.path for child in parent.children):
                    parent.children.append(node)
            return node

        ensure_dir(SANDBOX_ROOT)

        normalized_entries = sorted(entries, key=lambda item: getattr(item, "path", ""))
        for entry in normalized_entries:
            path = getattr(entry, "path", None)
            if not path or path == SANDBOX_ROOT:
                continue
            entry_type = str(getattr(entry, "type", "file"))
            is_dir = "dir" in entry_type.lower() or entry_type.lower() == "directory"
            parent_path = "/".join(path.rstrip("/").split("/")[:-1]) or SANDBOX_ROOT
            if parent_path == "/":
                parent_path = SANDBOX_ROOT
            parent = ensure_dir(parent_path)
            if is_dir:
                node = ensure_dir(path)
                node.size = getattr(entry, "size", None)
            else:
                node = FileNode(
                    name=getattr(entry, "name", path.split("/")[-1]),
                    path=path,
                    nodeType="file",
                    size=getattr(entry, "size", None),
                    children=[],
                )
                root[path] = node
                if not any(child.path == node.path for child in parent.children):
                    parent.children.append(node)

        def sort_nodes(nodes: list[FileNode]) -> list[FileNode]:
            for node in nodes:
                if node.children:
                    node.children = sort_nodes(node.children)
            return sorted(nodes, key=lambda item: (item.node_type != "directory", item.name.lower()))

        top_level = root[SANDBOX_ROOT].children
        return sort_nodes(top_level)


sandbox_manager = SandboxManager()
