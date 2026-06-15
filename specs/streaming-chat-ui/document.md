# Streaming Chat UI

## Overview
Build a responsive agent interface with a header, settings dialog, chat stream, tool chips, animated thinking states, iteration counter, and a file explorer side panel.

## Goals
- Deliver a professional black-themed responsive layout.
- Render user messages in bubbles and assistant output inline.
- Stream tokens in real time over SSE.
- Show animated `thinking....` and `creating sandbox...` states with a shiny effect.
- Show tool activity chips inline where they occur.

## Scope / non-goals
- In scope: layout, responsive behavior, stream rendering, file explorer, status badges.
- Non-goals: markdown WYSIWYG editing, multi-chat tabs.

## User flows / UX / design notes
- Header contains app title, iteration indicator, connection state, and settings button.
- Main content splits into chat panel and file explorer; on small screens explorer collapses below or into a drawer-like section.
- Chat scrolls smoothly during streaming.
- Tool chips appear in the transcript in chronological order using compact labels like `create: /home/user/...` and `read: /home/user/...`.
- Assistant content appears as clean typography blocks, not chat bubbles.

## Functional requirements
- Use Radix primitives for dialog, scroll area, separator, tooltip, collapsible, and tabs if helpful.
- Use Zustand for settings, session, and stream state.
- Show iteration counter resetting for each new user message and increasing per loop step.
- Support viewport meta tag and responsive CSS for mobile, tablet, and desktop.
- File explorer allows selecting files to preview content.

## Data model / schema
- Frontend message/event view models: user, assistant, tool_call, tool_result, status.
- Store slices: settings, chat, explorer.

## API contracts
- Consumes backend SSE from `POST /api/chat/stream`.
- Consumes file tree and file content endpoints.

## Edge cases / failure modes
- SSE disconnect/retry.
- Partial assistant response if backend errors.
- Empty transcript or empty file tree.
- Extremely long assistant outputs.

## Acceptance criteria
- UI is responsive and readable across major viewport sizes.
- Streaming visibly updates token-by-token.
- Tool chips and status animations are shown live.
- Settings dialog and file explorer are fully usable.

## Test plan / test cases
- Component/store tests for stream event reduction.
- Manual responsive QA for desktop and mobile widths.
- SSE loading/error state verification.

## Implementation notes
- Use CSS keyframes for shimmer and subtle motion.
- Avoid generic chat bubble styling for assistant messages.
- Use localStorage-backed Zustand persist for settings only.

## Status / open questions
- Status: done
- Open questions: none.