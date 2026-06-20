# Two-page UI redesign

## Overview
Replace the current dashboard-style frontend with a two-page application that matches the supplied design references. The home page centers the composer and suggestion chips, while the chat page shows the transcript layout, recent chats sidebar, header controls, and bottom composer. Existing backend integrations, settings, streaming, and chat history must continue to work.

## Goals
- Match `mainpage-design.html` and `chatpage-design.html` as closely as possible.
- Preserve current chat behavior, streaming, settings, health checks, and history persistence.
- Redirect users from `/` to `/chat` when they submit a prompt on the home page.
- Keep the frontend free of runtime, type, and lint errors.

## Scope / non-goals
- In scope: visual redesign, manual routing for `/` and `/chat`, home-to-chat prompt handoff, sidebar/history restyling, settings integration, responsive behavior.
- Non-goals: backend feature changes, auth, database work, file explorer UI parity with the old layout.

## User flows / UX / design notes
- `/` renders a centered welcome prompt card with title text, suggestion chips, and a top header inside the shell matching the provided home design.
- Submitting the composer on `/` always navigates to `/chat`.
- If settings are complete, the queued home prompt is sent automatically after navigation.
- If settings are incomplete, the queued prompt is preserved in the chat composer and the user sees the existing readiness guidance.
- `/chat` renders the provided chat design with recent chats in the sidebar, user bubble on the right, assistant text on the left, and the composer pinned to the bottom.
- The app logo/brand area returns the user to a fresh home draft state so a new conversation can be started.
- Existing stored chats remain accessible from the sidebar and selecting one navigates to `/chat`.

## Functional requirements
- Support two routes: `/` and `/chat` without introducing routing regressions.
- Maintain backend health detection and settings dialog access from both pages.
- Preserve streaming transcript rendering, tool chip rendering, status indicator behavior, and chat history persistence.
- Home suggestions can populate the composer quickly.
- Sidebar remains hidden on small screens and visible on medium+ screens per the reference design.
- Create/update frontend env configuration so `VITE_BACKEND_URL` points at the exposed backend URL.

## Data model / schema
- Reuse existing Zustand stores for transcript, session id, history, and settings.
- Extend chat state as needed for queued prompt handoff between pages.
- No backend schema changes.

## API contracts
- Continue using `GET /api/health`, `POST /api/chat/stream`, `GET /api/sessions/{sessionId}/files`, and `POST /api/sessions/{sessionId}/file-content`.
- Frontend may use the configured `VITE_BACKEND_URL` to target the exposed backend URL directly.

## Edge cases / failure modes
- User submits on home without keys configured.
- User refreshes on `/chat` with an existing active chat.
- User deletes the active chat from the sidebar.
- Backend unavailable at load time.
- Long chat titles and long assistant responses.

## Acceptance criteria
- Home page matches the provided design with centered composer and suggestion chips.
- Chat page matches the provided design with sidebar, header, transcript, and bottom composer.
- Sending from home navigates to `/chat`.
- Existing chat features still work after the redesign.
- Frontend lint/build pass and the app loads without console/runtime errors.

## Test plan / test cases
- Manual QA for `/` and `/chat` on desktop and mobile widths.
- Verify home prompt redirects to `/chat` and sends/persists correctly.
- Verify selecting previous chats loads the correct transcript.
- Verify settings dialog opens on both pages.
- Run frontend lint/build and backend tests if available.

## Implementation notes
- Prefer updating existing components instead of adding an external router dependency.
- Keep styling close to the reference using existing Tailwind setup and CSS variables.
- Preserve current store-backed logic for transcript and history updates.

## Status / open questions
- Status: done
- Open questions: none.