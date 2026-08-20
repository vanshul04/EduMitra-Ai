from typing import Optional
import asyncio
import re

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, field_validator

from utils.chunker import chunk_text
from utils.embeddings import generate_embeddings_batch_async
from utils.supabase_ops import store_document, store_chunks
from utils.error_helpers import gemini_error_to_http
from utils.auth import get_current_user


router = APIRouter()

MIN_TRANSCRIPT_WORDS = 50


class VideoRequest(BaseModel):
    url: str

    @field_validator("url")
    @classmethod
    def validate_youtube_url(cls, v: str) -> str:
        v = v.strip()

        if not v:
            raise ValueError("URL cannot be empty.")

        if "youtube.com" not in v and "youtu.be" not in v:
            raise ValueError(
                "URL must be a YouTube link "
                "(youtube.com or youtu.be)."
            )

        return v


def extract_video_id(url: str) -> str:
    """
    Extract the YouTube video ID from common YouTube URL formats.

    Supported:
    - https://www.youtube.com/watch?v=VIDEO_ID
    - https://youtu.be/VIDEO_ID
    - https://www.youtube.com/embed/VIDEO_ID
    - https://www.youtube.com/shorts/VIDEO_ID
    """

    patterns = [
        r"(?:v=)([0-9A-Za-z_-]{11})(?:[&?]|$)",
        r"(?:youtu\.be/)([0-9A-Za-z_-]{11})(?:[&?]|$)",
        r"(?:youtube\.com/embed/)([0-9A-Za-z_-]{11})(?:[&?]|$)",
        r"(?:youtube\.com/shorts/)([0-9A-Za-z_-]{11})(?:[&?]|$)",
    ]

    for pattern in patterns:
        match = re.search(pattern, url)

        if match:
            return match.group(1)

    raise ValueError(
        "Could not extract video ID from this URL. "
        "Please use a standard YouTube link."
    )


@router.post("/process-video")
async def process_video(
    request: VideoRequest,
    user_id: Optional[str] = Depends(get_current_user),
):
    """
    Process a YouTube video:

    1. Validate YouTube URL
    2. Extract video ID
    3. Fetch transcript
    4. Validate transcript
    5. Split transcript into chunks
    6. Generate embeddings
    7. Store document and chunks in Supabase
    """

    # =========================================================
    # 1. EXTRACT VIDEO ID
    # =========================================================

    try:
        video_id = extract_video_id(request.url)

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    # =========================================================
    # 2. FETCH YOUTUBE TRANSCRIPT
    # =========================================================

    loop = asyncio.get_running_loop()

    try:
        from youtube_transcript_api import YouTubeTranscriptApi

        def fetch_transcript():
            api = YouTubeTranscriptApi()

            transcript = api.fetch(video_id)

            # New youtube-transcript-api versions return
            # FetchedTranscript objects.
            #
            # Convert to the traditional list of dictionaries
            # used by EduMitra-AI.

            return transcript.to_raw_data()

        transcript_list = await loop.run_in_executor(
            None,
            fetch_transcript,
        )

        full_text = " ".join(
            entry["text"]
            for entry in transcript_list
            if entry.get("text")
        )

    except Exception as e:
        error_name = type(e).__name__
        error_message = str(e).lower()

        # Transcript disabled
        if error_name == "TranscriptsDisabled":
            raise HTTPException(
                status_code=400,
                detail=(
                    "Transcripts are disabled for this video. "
                    "Please try another YouTube video."
                ),
            )

        # Transcript not found
        if error_name == "NoTranscriptFound":
            raise HTTPException(
                status_code=400,
                detail=(
                    "No transcript was found for this video. "
                    "Make sure captions/subtitles are available "
                    "and try another video."
                ),
            )

        # Video unavailable/private
        if (
            "video unavailable" in error_message
            or "private video" in error_message
            or "video is private" in error_message
        ):
            raise HTTPException(
                status_code=400,
                detail="This YouTube video is unavailable or private.",
            )

        # Generic transcript error
        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to fetch the YouTube transcript. "
                f"Details: {e}"
            ),
        )

    # =========================================================
    # 3. VALIDATE TRANSCRIPT
    # =========================================================

    full_text = full_text.strip()

    if not full_text:
        raise HTTPException(
            status_code=400,
            detail="The video transcript is empty.",
        )

    word_count = len(full_text.split())

    if word_count < MIN_TRANSCRIPT_WORDS:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Transcript is too short ({word_count} words). "
                f"Please use a video containing at least "
                f"{MIN_TRANSCRIPT_WORDS} words."
            ),
        )

    # =========================================================
    # 4. CHUNK TRANSCRIPT
    # =========================================================

    try:
        chunks = chunk_text(
            full_text,
            chunk_size=500,
            overlap=50,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process transcript chunks: {e}",
        )

    if not chunks:
        raise HTTPException(
            status_code=422,
            detail=(
                "Could not split the transcript into chunks. "
                "The video content may be too short."
            ),
        )

    # =========================================================
    # 5. GENERATE EMBEDDINGS
    # =========================================================

    try:
        embeddings = await generate_embeddings_batch_async(chunks)

    except RuntimeError as e:
        raise HTTPException(
            status_code=429,
            detail=str(e),
        )

    except Exception as e:
        raise gemini_error_to_http(
            e,
            "Embedding generation",
        )

    # =========================================================
    # 6. STORE DOCUMENT + CHUNKS
    # =========================================================

    title = f"YouTube: {video_id}"

    try:
        document_id = await loop.run_in_executor(
            None,
            lambda: store_document(
                title=title,
                source_type="youtube",
                source_url=request.url,
                user_id=user_id,
            ),
        )

        chunk_count = await loop.run_in_executor(
            None,
            lambda: store_chunks(
                document_id,
                chunks,
                embeddings,
            ),
        )

    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail=str(e),
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to store video data: {e}",
        )

    # =========================================================
    # 7. SUCCESS RESPONSE
    # =========================================================

    return {
        "document_id": document_id,
        "chunk_count": chunk_count,
        "title": title,
        "video_id": video_id,
        "word_count": word_count,
        "message": "Video processed successfully",
    }