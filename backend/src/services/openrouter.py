from __future__ import annotations

import json
from collections.abc import AsyncGenerator
from typing import Any

import httpx

from src.agent.models import ModelSummary, ProviderSettings
from src.config.constants import APP_TITLE, OPENROUTER_BASE_URL


class OpenRouterService:
    def __init__(self) -> None:
        self._base_url = OPENROUTER_BASE_URL

    def _headers(self, api_key: str) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://agent-studio.local",
            "X-OpenRouter-Title": APP_TITLE,
        }

    async def fetch_models(self, api_key: str) -> list[ModelSummary]:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{self._base_url}/models", headers=self._headers(api_key))
            response.raise_for_status()
            data = response.json().get("data", [])
            models: list[ModelSummary] = []
            for item in data:
                models.append(
                    ModelSummary(
                        id=item.get("id", ""),
                        name=item.get("name") or item.get("id", "Unknown model"),
                        contextLength=item.get("context_length"),
                        description=item.get("description"),
                        promptPricing=item.get("pricing", {}).get("prompt"),
                        completionPricing=item.get("pricing", {}).get("completion"),
                        supportedParameters=item.get("supported_parameters", []),
                    )
                )
            return models

    async def stream_chat(
        self,
        settings: ProviderSettings,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]],
    ) -> AsyncGenerator[dict[str, Any], None]:
        payload = {
            "model": settings.selected_model,
            "messages": messages,
            "tools": tools,
            "tool_choice": "auto",
            "parallel_tool_calls": False,
            "stream": True,
        }

        async with httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=30.0)) as client:
            async with client.stream(
                "POST",
                f"{self._base_url}/chat/completions",
                headers=self._headers(settings.openrouter_api_key),
                json=payload,
            ) as response:
                response.raise_for_status()
                async for event in self._iter_sse_events(response):
                    yield event

    async def _iter_sse_events(self, response: httpx.Response) -> AsyncGenerator[dict[str, Any], None]:
        data_lines: list[str] = []
        async for line in response.aiter_lines():
            if line.startswith(":"):
                continue
            if not line:
                if data_lines:
                    payload = "\n".join(data_lines)
                    data_lines.clear()
                    if payload == "[DONE]":
                        return
                    yield json.loads(payload)
                continue
            if line.startswith("data:"):
                data_lines.append(line[5:].strip())

        if data_lines:
            payload = "\n".join(data_lines)
            if payload != "[DONE]":
                yield json.loads(payload)

    @staticmethod
    def build_assistant_message(
        content_fragments: list[str],
        tool_call_fragments: dict[int, dict[str, Any]],
    ) -> dict[str, Any]:
        content = "".join(content_fragments) or None
        if not tool_call_fragments:
            return {"role": "assistant", "content": content}

        tool_calls: list[dict[str, Any]] = []
        for index in sorted(tool_call_fragments):
            fragment = tool_call_fragments[index]
            tool_calls.append(
                {
                    "id": fragment.get("id") or f"call_{index}",
                    "type": "function",
                    "function": {
                        "name": fragment.get("name", ""),
                        "arguments": fragment.get("arguments", "{}"),
                    },
                }
            )
        return {"role": "assistant", "content": content, "tool_calls": tool_calls}

    @staticmethod
    def accumulate_tool_calls(
        existing: dict[int, dict[str, Any]], chunk_tool_calls: list[dict[str, Any]]
    ) -> dict[int, dict[str, Any]]:
        for item in chunk_tool_calls:
            index = item.get("index", 0)
            fragment = existing.setdefault(index, {"arguments": ""})
            if item.get("id"):
                fragment["id"] = item["id"]
            function = item.get("function", {})
            if function.get("name"):
                fragment["name"] = function["name"]
            if function.get("arguments"):
                fragment["arguments"] = fragment.get("arguments", "") + function["arguments"]
        return existing

    @staticmethod
    def parse_tool_calls(tool_call_fragments: dict[int, dict[str, Any]]) -> list[dict[str, Any]]:
        parsed: list[dict[str, Any]] = []
        for index in sorted(tool_call_fragments):
            item = tool_call_fragments[index]
            raw_arguments = item.get("arguments", "{}")
            try:
                arguments = json.loads(raw_arguments or "{}")
            except json.JSONDecodeError:
                arguments = {"_raw": raw_arguments}
            parsed.append(
                {
                    "id": item.get("id") or f"call_{index}",
                    "name": item.get("name", ""),
                    "arguments": arguments,
                    "raw_arguments": raw_arguments,
                }
            )
        return parsed


openrouter_service = OpenRouterService()
