# Settings and Provider Configuration

## Overview
Provide a settings surface where users can configure OpenRouter and E2B credentials, select models, and define optional sandbox template settings without leaving the chat experience.

## Goals
- Allow entry of OpenRouter API key.
- Fetch and present available OpenRouter models after the API key is saved.
- Allow entry of E2B API key and optional custom template id.
- Persist non-sensitive UX settings in localStorage and keep sensitive keys in localStorage only because the user explicitly wants client-side configurability and no database.
- Keep the provider layer extensible for future model providers.

## Scope / non-goals
- In scope: settings dialog, model loading, client-side settings persistence, validation feedback.
- Non-goals: multi-user auth, server-side credential vaulting, billing dashboards.

## User flows / UX / design notes
- User opens settings from header.
- User enters OpenRouter API key and saves.
- Frontend requests backend model listing endpoint using the provided key.
- Models load into a searchable/selectable list.
- User enters E2B API key and optional template id.
- Saved settings are reflected immediately in the chat readiness state.
- Settings dialog uses Radix Dialog, labels, help text, and inline validation.

## Functional requirements
- Settings fields: OpenRouter API key, selected provider, selected model, E2B API key, E2B template id, sandbox timeout display, backend status readout.
- Model list must be fetched from OpenRouter using the provided key and handled for loading, success, and failure states.
- Architecture must allow adding new providers by implementing a provider adapter contract.
- Persist settings to localStorage and hydrate on app load.

## Data model / schema
- `ProviderSettings`: provider, openrouterApiKey, selectedModel, e2bApiKey, e2bTemplateId.
- `ModelSummary`: id, name, context_length, pricing summary, supported_parameters.

## API contracts
- `POST /api/providers/openrouter/models`
  - request: `{ apiKey: string }`
  - response: `{ data: ModelSummary[] }`
- `GET /api/health`
  - response: service status.

## Edge cases / failure modes
- Invalid API key.
- Network timeouts.
- Empty model catalog.
- User saves settings without required keys.

## Acceptance criteria
- User can open settings, save keys, fetch models, and choose a model.
- UI clearly indicates readiness/missing configuration.
- Settings survive refresh via localStorage.
- Provider abstraction does not hardcode OpenRouter deeply into presentation logic.

## Test plan / test cases
- Validate localStorage hydration.
- Validate model fetch success and error handling.
- Validate required-field gating before chat submission.

## Implementation notes
- Use Zustand persistent store for settings.
- Separate provider repository code in frontend and backend.
- Mask API keys in display after save.

## Status / open questions
- Status: done
- Open questions: none; current implementation targets OpenRouter first with extensible provider interfaces.