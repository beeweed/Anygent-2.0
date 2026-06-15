# Agent Studio Spec

## Project overview
Build a production-grade autonomous coding agent web application that uses OpenRouter for model access and E2B sandboxes for isolated file operations. The product must let users configure provider keys in the UI, create a sandbox automatically on first message, stream token output in real time, expose native tool calling for file read/write, and render a responsive professional dark interface with chat on the left and a sandbox file explorer on the right.

## Goals
- Provide a reliable chat-based AI agent for reading, creating, and overwriting files in an E2B sandbox.
- Use native tool calling only, with tool calls emitted by the LLM API response rather than simulated text.
- Preserve complete conversation history in memory for the active session, including user messages, assistant text, tool calls, tool results, and errors.
- Stream model tokens and agent status updates live via SSE.
- Offer a polished responsive UI built with React + Vite + Radix UI primitives and Zustand.
- Keep persistence local to the browser using localStorage where needed. No database.

## Design direction
- Dark, high-contrast black UI with restrained accent color and subtle glass borders.
- User messages use bubbles; assistant responses render inline without bubbles.
- Tool activity appears as compact chip blocks inside the stream where actions occur.
- Settings dialog in header for API keys, model choice, backend URL awareness, and sandbox template settings.
- File tree panel on the right with expandable folders and file previews.
- Animated status text for thinking and sandbox creation with a shimmering effect.

## Technical stack decisions
- Frontend: React 18, Vite, TypeScript, Tailwind CSS, Radix UI primitives, Zustand, EventSource stream handling, localStorage-backed settings.
- Backend: Python 3.12+, FastAPI, Pydantic, asyncio, uvicorn, httpx for OpenRouter API calls, official e2b SDK, SSE via StreamingResponse.
- Tool calling: OpenRouter Chat Completions endpoint using OpenAI-compatible `tools` payload and `tool_calls` loop.
- State: In-memory session state on backend keyed by session id; browser-side persisted settings in localStorage.
- Tests: pytest backend unit/integration tests and Vitest frontend utility/component tests where practical.

## Architecture rules
- Keep provider integrations behind service interfaces so more LLM providers can be added later.
- Validate settings before starting a chat run.
- Never persist secrets to disk on the backend; receive keys from UI per session.
- Sandbox creation occurs lazily on the first user message and is reused for the current session.
- File tools only operate on absolute `/home/user/...` paths in the active sandbox.
- Tool execution is sequential and each result is fed back to the model before continuing.
- Max iteration per user message is 1000 and resets each turn.
- Full conversation memory for the current session must include raw message roles and tool events with no truncation logic in the app layer.
- Backend URL for frontend must only come from `frontend/.env`.

## Feature list
| Feature | Status | Spec |
| --- | --- | --- |
| Settings and provider configuration | done | specs/settings-and-provider-config/document.md |
| Chat agent orchestration | done | specs/chat-agent-orchestration/document.md |
| File tree and sandbox integration | done | specs/file-tree-and-sandbox/document.md |
| Streaming chat UI | done | specs/streaming-chat-ui/document.md |