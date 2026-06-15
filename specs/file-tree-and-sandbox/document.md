# File Tree and Sandbox Integration

## Overview
Integrate the official E2B SDK so each chat session owns a sandbox where the agent can read and overwrite files. Expose the sandbox file structure in the UI.

## Goals
- Create a sandbox automatically on the first user message using the provided E2B API key and optional template id.
- Use a 1 hour timeout.
- Implement `file_read` and `file_write` tools against the sandbox filesystem.
- Refresh and return the file tree after writes.

## Scope / non-goals
- In scope: sandbox lifecycle, filesystem tools, file tree API.
- Non-goals: shell execution tool, package installation tool, persistent remote storage.

## User flows / UX / design notes
- Before first message, chat input is disabled until required settings are present.
- On first send, status reads `creating sandbox...` with animated shimmer.
- After sandbox creation, file tree appears and updates as files change.
- Users can browse nested folders and inspect file contents from the explorer.

## Functional requirements
- `file_write.py` must expose exact user-requested tool schema and overwrite or create files at absolute `/home/user/...` paths.
- `file_read.py` must expose exact user-requested tool schema and return content with line numbers; nonexistent paths must return a structured error.
- `systemprompt.py` must live in `backend/src/agent/` and contain the agent system prompt.
- Sandbox-aware filesystem service must normalize, validate, and reject paths outside `/home/user`.
- File tree endpoint must return hierarchical nodes for the sandbox working tree.

## Data model / schema
- `FileNode`: path, name, type, children, size.
- Tool result content strings for success and structured error payloads.

## API contracts
- `GET /api/sessions/{session_id}/files`
  - response: `{ root: FileNode[] }`
- `POST /api/sessions/{session_id}/file-content`
  - request: `{ path: string }`
  - response: `{ path: string, content: string }`

## Edge cases / failure modes
- Invalid absolute path.
- Attempts to escape `/home/user`.
- Binary or unreadable file content.
- Large directories.

## Acceptance criteria
- First chat creates sandbox automatically.
- Reads/writes occur in sandbox only.
- File tree updates after writes.
- Nonexistent reads return structured error and allow the loop to continue.

## Test plan / test cases
- Path validation unit tests.
- Tool success/failure tests.
- File tree transformation tests.

## Implementation notes
- Use E2B filesystem methods where possible; fall back to command execution only if required by SDK limitations.
- Preserve exact tool schema shape requested by user.

## Status / open questions
- Status: done
- Open questions: none.