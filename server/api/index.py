import os
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from routers import (
    process_video,
    process_pdf,
    flashcards,
    quiz,
    chat,
    documents,
    tools,
    pdf_export,
    notes,
    viva,
    learning_path,
    bookmarks,
)

START_TIME = time.time()

app = FastAPI(
    title="EduMitra-AI API",
    description="Production SaaS backend services for EduMitra-AI — Your AI-powered learning companion.",
    version="2.0.0",
)

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

_additional_origins = os.getenv("ADDITIONAL_ORIGINS", "")
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://learning-assistant-ighr.vercel.app"
]
if _additional_origins:
    ALLOWED_ORIGINS.extend([o.strip() for o in _additional_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS ,"https://edu-mitra-ai-five.vercel.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(process_video.router, tags=["Processing"])
app.include_router(process_pdf.router, tags=["Processing"])
app.include_router(flashcards.router, tags=["Generation"])
app.include_router(quiz.router, tags=["Generation"])
app.include_router(chat.router, tags=["Chat"])
app.include_router(documents.router, tags=["Document Management"])
app.include_router(tools.router, tags=["AI Tools"])
app.include_router(pdf_export.router, tags=["Export"])
app.include_router(notes.router, tags=["AI Notes"])
app.include_router(viva.router, tags=["Viva / Interview"])
app.include_router(learning_path.router, tags=["Learning Paths"])
app.include_router(bookmarks.router, tags=["Bookmarks"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "ok",
        "app": "EduMitra-AI API",
        "version": "2.0.0",
        "message": "Your AI-powered learning companion is running smoothly.",
    }


@app.get("/health", tags=["Health"])
async def health():
    uptime_seconds = int(time.time() - START_TIME)
    return {
        "status": "healthy",
        "version": "2.0.0",
        "uptime_seconds": uptime_seconds,
        "environment": os.getenv("ENVIRONMENT", "development"),
    }