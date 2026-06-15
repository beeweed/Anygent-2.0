from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from src.agent.agent import AgentRuntimeError, agent_runner
from src.agent.models import ChatStreamRequest, FileContentRequest, ModelsRequest
from src.services.openrouter import openrouter_service
from src.services.sandbox_manager import sandbox_manager
from src.services.session_store import session_store
from src.utils.sse import encode_sse_event

app = FastAPI(title="Agent Studio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check() -> dict[str, str]:
    return {"status": "healthy"}


@app.get("/api/readiness")
async def readiness_check() -> dict[str, str]:
    return {"status": "ready"}


@app.post("/api/providers/openrouter/models")
async def get_openrouter_models(payload: ModelsRequest) -> JSONResponse:
    try:
        models = await openrouter_service.fetch_models(payload.api_key)
        return JSONResponse({"data": [model.model_dump(by_alias=True) for model in models]})
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/chat/stream")
async def stream_chat(payload: ChatStreamRequest) -> StreamingResponse:
    session = await session_store.get_or_create(payload.session_id, payload.settings)

    async def event_generator():
        try:
            async for event in agent_runner.stream_turn(session, payload.message, payload.settings):
                yield encode_sse_event(event.event, event.data)
        except AgentRuntimeError as exc:
            yield encode_sse_event("error", {"message": str(exc)})
        except Exception as exc:
            yield encode_sse_event("error", {"message": str(exc)})

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.get("/api/sessions/{session_id}/files")
async def get_session_files(session_id: str) -> JSONResponse:
    session = await session_store.get(session_id)
    if session is None or session.sandbox is None:
        return JSONResponse({"root": []})

    file_tree = await sandbox_manager.list_tree(session)
    session.latest_file_tree = file_tree
    return JSONResponse({"root": [node.model_dump(by_alias=True) for node in file_tree]})


@app.post("/api/sessions/{session_id}/file-content")
async def get_file_content(session_id: str, payload: FileContentRequest) -> JSONResponse:
    session = await session_store.get(session_id)
    if session is None or session.sandbox is None:
        raise HTTPException(status_code=404, detail="Sandbox session not found")

    content = await sandbox_manager.get_file_preview(session, payload.path)
    return JSONResponse({"path": payload.path, "content": content})
