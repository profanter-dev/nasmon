from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app import aggregator


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    await aggregator.start()
    yield


app = FastAPI(lifespan=lifespan)

app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await aggregator.on_connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await aggregator.on_disconnect(websocket)


@app.get("/{full_path:path}")
async def serve_spa(full_path: str) -> FileResponse:
    return FileResponse("static/index.html")
