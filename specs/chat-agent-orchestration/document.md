# Chat Agent Orchestration

## Overview
Implement the backend agent loop that sends messages to OpenRouter, lets the model decide tool calls natively, executes sandbox file tools, records all events, and streams status plus tokens to the frontend.

## Goals
- Use native tool calling only.
- Maintain complete in-memory history for the active chat session, including tool results and failures.
- Enforce a max iteration limit of 1000 per user turn.
- Stream output token-by-token and interrupt/resume around tool execution.

## Scope / non-goals
- In scope: session memory, agent loop, tool execution, SSE event protocol, structured errors.
- Non-goals: long-term persistence across backend restarts, autonomous web browsing, multi-agent orchestration.

## User flows / UX / design notes
- User sends message.
- If sandbox does not yet exist, backend emits `status` event for sandbox creation, creates sandbox, and then continues.
- Backend emits `iteration` updates as the loop progresses.
- Assistant text streams as content events.
- Tool call events are emitted as compact metadata for UI chips.
- Final assistant response closes the stream cleanly.

## Functional requirements
- Session memory must store all chat and tool messages with no truncation in application logic.
- Agent loop must pass tool schemas via OpenRouter `tools` parameter on every completion request.
- Tool call handling must parse structured `tool_calls` from the API response and never rely on text-formatted faux calls.
- Backend must support sequential tool execution, feeding tool results back into the model until final assistant text or max iterations hit.
- Errors from tools or provider requests must be returned to the model as tool results where applicable and also emitted to the UI.

## Data model / schema
- `UserMessage`, `AssistantMessage`, `ToolUse`, `ToolUseMessage`, `ToolResult`, `ToolResultMessage` per provided Pydantic models.
- `AgentSession`: session_id, settings snapshot, sandbox reference, history, latest file tree, iteration count.
- `StreamEvent`: event type and JSON payload.

## API contracts
- `POST /api/chat/stream`
  - request: `{ sessionId: string, message: string, settings: ProviderSettings }`
  - response: SSE stream with events such as `status`, `iteration`, `token`, `tool_call`, `tool_result`, `files`, `done`, `error`.
- `GET /api/sessions/{session_id}/files`
  - response: current sandbox file tree.

## Edge cases / failure modes
- OpenRouter returns tool calls with invalid JSON arguments.
- Missing tool name or unsupported tool name.
- Sandbox creation fails.
- Tool loops exceed max iteration.
- Provider stream disconnects mid-response.

## Acceptance criteria
- Tool calls originate from the model API response structure.
- Tool execution and result feedback produce correct multi-step behavior.
- Complete history is retained during a session.
- Stream halts gracefully with a terminal event on success or error.

## Test plan / test cases
- Unit tests for tool call parsing and argument validation.
- Unit tests for iteration cap behavior.
- Integration-style tests for agent loop with mocked provider responses.
- Tests that tool errors are surfaced and preserved in history.

## Implementation notes
- Use async generator for SSE streaming.
- Prefer non-streaming OpenRouter responses inside the tool loop for deterministic tool handling, while streaming final assistant content to UI via chunked content events derived from the final text.
- Keep provider adapter interface generic enough for future providers.

## Status / open questions
- Status: done
- Open questions: none.