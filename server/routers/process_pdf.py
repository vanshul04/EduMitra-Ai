from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from typing import Optional
import asyncio
import pymupdf as fitz  # PyMuPDF

from utils.chunker import chunk_text
from utils.embeddings import generate_embeddings_batch_async
from utils.supabase_ops import store_document, store_chunks
from utils.error_helpers import gemini_error_to_http
from utils.auth import get_current_user

router = APIRouter()

MAX_PDF_SIZE_MB = 20
MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024
MIN_PDF_TEXT_CHARS = 100  # Minimum characters to process (catches image-only PDFs)
ALLOWED_CONTENT_TYPES = {"application/pdf", "application/x-pdf"}


@router.post("/process-pdf")
async def process_pdf(file: UploadFile = File(...), user_id: Optional[str] = Depends(get_current_user)):
    """
    Process an uploaded PDF: extract text, chunk it, embed it, store in Supabase.
    """
    # ── Validate file type ────────────────────────────────────────────────
    filename = file.filename or ""
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    content_type = file.content_type or ""
    if content_type and content_type.startswith(("text/", "image/")):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # ── Read contents ─────────────────────────────────────────────────────
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {e}")

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(contents) > MAX_PDF_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum allowed size is {MAX_PDF_SIZE_MB}MB.",
        )

    # ── Validate PDF header (magic bytes) ────────────────────────────────
    if not contents.startswith(b"%PDF"):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file does not appear to be a valid PDF.",
        )

    # ── Extract text with PyMuPDF ─────────────────────────────────────────
    loop = asyncio.get_event_loop()
    try:
        def _extract():
            pdf_doc = fitz.open(stream=contents, filetype="pdf")
            page_count = len(pdf_doc)
            if page_count == 0:
                pdf_doc.close()
                raise ValueError("PDF has no pages.")
            text_parts = []
            for page in pdf_doc:
                try:
                    text_parts.append(page.get_text())
                except Exception:
                    text_parts.append("")  # Skip unreadable pages gracefully
            pdf_doc.close()
            return "\n".join(text_parts), page_count

        full_text, page_count = await loop.run_in_executor(None, _extract)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse PDF. The file may be corrupted or password-protected. Details: {e}",
        )

    # ── Validate extracted text ───────────────────────────────────────────
    text_stripped = full_text.strip()
    if not text_stripped:
        raise HTTPException(
            status_code=422,
            detail=(
                "No readable text found in this PDF. "
                "It appears to be a scanned image or password-protected. "
                "Please use a PDF with selectable text."
            ),
        )
    if len(text_stripped) < MIN_PDF_TEXT_CHARS:
        raise HTTPException(
            status_code=422,
            detail=(
                f"PDF contains very little text ({len(text_stripped)} characters). "
                "Please upload a PDF with more content."
            ),
        )

    # ── Chunk text ────────────────────────────────────────────────────────
    chunks = chunk_text(full_text, chunk_size=500, overlap=50)
    if not chunks:
        raise HTTPException(
            status_code=422,
            detail="Could not extract content chunks from the PDF. The document may be too short.",
        )

    # ── Generate embeddings (batch, async) ────────────────────────────────
    try:
        embeddings = await generate_embeddings_batch_async(chunks)
    except RuntimeError as e:
        raise HTTPException(status_code=429, detail=str(e))
    except Exception as e:
        raise gemini_error_to_http(e, "Embedding generation")

    # ── Store in Supabase ─────────────────────────────────────────────────
    title = filename.removesuffix(".pdf").removesuffix(".PDF").strip() or "Uploaded PDF"
    try:
        document_id = await loop.run_in_executor(
            None,
            lambda: store_document(title=title, source_type="pdf", source_url=None, user_id=user_id),
        )
        chunk_count = await loop.run_in_executor(
            None, lambda: store_chunks(document_id, chunks, embeddings)
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    return {
        "document_id": document_id,
        "chunk_count": chunk_count,
        "page_count": page_count,
        "title": title,
        "message": "PDF processed successfully",
    }
