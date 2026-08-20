from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, field_validator
import asyncio
import re

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
                "URL must be a YouTube link (youtube.com or youtu.be)."
            )

        return v


def extract_video_id(url: str) -> str:
    """Extract YouTube video ID from various URL formats."""

    patterns = [
        r"(?:v=|/)([0-9A-Za-z_-]{11})(?:[&?]|$)",
        r"(?:embed/)([0-9A-Za-z_-]{11})",
        r"(?:youtu\.be/)([0-9A-Za-z_-]{11})",
        r"(?:shorts/)([0-9A-Za-z_-]{11})",
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
async def process_video(request: VideoRequest, user_id: Optional[str] = Depends(get_current_user)):
    """
    Process a YouTube video:
    1. Fetch transcript
    2. Chunk transcript
    3. Generate embeddings
    4. Store document and chunks in Supabase
    """

    # ---------------------------------------------------------
    # Extract YouTube Video ID
    # ---------------------------------------------------------

    try:
        video_id = extract_video_id(request.url)

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    # ---------------------------------------------------------
    # Fetch YouTube Transcript
    # ---------------------------------------------------------

    loop = asyncio.get_event_loop()

    try:
        from youtube_transcript_api import YouTubeTranscriptApi

        def _fetch():
            # New youtube-transcript-api API
            api = YouTubeTranscriptApi()

            transcript = api.fetch(video_id)

            # Convert FetchedTranscript to the old
            # list-of-dictionaries format used by this project.
            return transcript.to_raw_data()

        transcript_list = await loop.run_in_executor(
            None,
            _fetch
        )

        full_text = " ".join(
            [
                entry["text"]
                for entry in transcript_list
                if entry.get("text")
            ]
        )

    except Exception as e:

        name = type(e).__name__

        if name == "TranscriptsDisabled":
            raise HTTPException(
                status_code=400,
                detail=(
                    "Transcripts are disabled for this video. "
                    "Try a different video."
                ),
            )

        if name == "NoTranscriptFound":
            raise HTTPException(
                status_code=400,
                detail=(
                    "No transcript found for this video. "
                    "Make sure the video has captions/subtitles enabled."
                ),
            )

        if (
            "video unavailable" in str(e).lower()
            or "private" in str(e).lower()
        ):
            raise HTTPException(
                status_code=400,
                detail="This video is unavailable or private.",
            )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to fetch transcript. "
                f"The video may be unavailable. Details: {e}"
            ),
        )

    # ---------------------------------------------------------
    # Validate Transcript
    # ---------------------------------------------------------

    word_count = len(full_text.split())

    if not full_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Transcript is empty."
        )

    if word_count < MIN_TRANSCRIPT_WORDS:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Transcript is too short ({word_count} words). "
                f"Please use a video with at least "
                f"{MIN_TRANSCRIPT_WORDS} words of content."
            ),
        )

    # ---------------------------------------------------------
    # Chunk Transcript
    # ---------------------------------------------------------

    chunks = chunk_text(
        full_text,
        chunk_size=500,
        overlap=50
    )

    if not chunks:
        raise HTTPException(
            status_code=422,
            detail=(
                "Could not split transcript into chunks. "
                "The video content may be too short."
            ),
        )

    # ---------------------------------------------------------
    # Generate Embeddings
    # ---------------------------------------------------------

    try:

        embeddings = await generate_embeddings_batch_async(
            chunks
        )

    except RuntimeError as e:

        raise HTTPException(
            status_code=429,
            detail=str(e)
        )

    except Exception as e:

        raise gemini_error_to_http(
            e,
            "Embedding generation"
        )

    # ---------------------------------------------------------
    # Store in Supabase
    # ---------------------------------------------------------

    title = f"YouTube: {video_id}"

    try:

        document_id = await loop.run_in_executor(
            None,
            lambda: store_document(
                title=title,
                source_type="youtube",
                source_url=request.url,
                user_id=user_id
            ),
        )

        chunk_count = await loop.run_in_executor(
            None,
            lambda: store_chunks(
                document_id,
                chunks,
                embeddings
            ),
        )

    except RuntimeError as e:

        raise HTTPException(
            status_code=503,
            detail=str(e)
        )

    # ---------------------------------------------------------
    # Success
    # ---------------------------------------------------------

    return {
        "document_id": document_id,
        "chunk_count": chunk_count,
        "title": title,
        "message": "Video processed successfully",
    }