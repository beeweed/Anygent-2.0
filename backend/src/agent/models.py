from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal

from pydantic import BaseModel, Field


class UserMessage(BaseModel):
    content: str
    role: str = "user"


class AssistantMessage(BaseModel):
    content: str | None
    role: str = "assistant"
    tool_calls: list[dict[str, Any]] | None = None


class ToolUse(BaseModel):
    type: str = "tool_use"
    id: str
    name: str
    input: dict


class ToolUseMessage(BaseModel):
    role: str = "assistant"
    content: list[ToolUse]


class ToolResult(BaseModel):
    type: str = "tool_result"
    tool_use_id: str
    content: str
    is_error: bool


class ToolResultMessage(BaseModel):
    role: str = "user"
    content: list[ToolResult]


class ProviderSettings(BaseModel):
    provider: str = "openrouter"
    openrouter_api_key: str = Field(..., alias="openrouterApiKey")
    selected_model: str = Field(..., alias="selectedModel")
    e2b_api_key: str = Field(..., alias="e2bApiKey")
    e2b_template_id: str | None = Field(default=None, alias="e2bTemplateId")

    model_config = {"populate_by_name": True}


class ChatStreamRequest(BaseModel):
    session_id: str = Field(..., alias="sessionId")
    message: str
    settings: ProviderSettings

    model_config = {"populate_by_name": True}


class ModelsRequest(BaseModel):
    api_key: str = Field(..., alias="apiKey")

    model_config = {"populate_by_name": True}


class FileContentRequest(BaseModel):
    path: str


class ModelSummary(BaseModel):
    id: str
    name: str
    context_length: int | None = Field(default=None, alias="contextLength")
    description: str | None = None
    prompt_pricing: str | None = Field(default=None, alias="promptPricing")
    completion_pricing: str | None = Field(default=None, alias="completionPricing")
    supported_parameters: list[str] = Field(default_factory=list, alias="supportedParameters")

    model_config = {"populate_by_name": True}


class FileNode(BaseModel):
    name: str
    path: str
    node_type: Literal["file", "directory"] = Field(alias="nodeType")
    size: int | None = None
    children: list["FileNode"] = Field(default_factory=list)

    model_config = {"populate_by_name": True}


class StreamEvent(BaseModel):
    event: str
    data: dict[str, Any]


@dataclass(slots=True)
class AgentSession:
    session_id: str
    settings: ProviderSettings
    sandbox: Any | None = None
    history: list[dict[str, Any]] = field(default_factory=list)
    latest_file_tree: list[FileNode] = field(default_factory=list)
    current_iteration: int = 0
