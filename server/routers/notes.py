from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import asyncio

from config import client, GEMINI_MODEL_ID, supabase
from utils.embeddings import generate_query_embedding_async
from utils.supabase_ops import similarity_search, get_document, _check_supabase
from utils.error_helpers import gemini_error_to_http, extract_gemini_text, generate_content_with_retry

router = APIRouter()

class GenerateNotesRequest(BaseModel):
    document_id: str
    note_type: str = "exam" # "summary", "exam", "cheat_sheet", "detailed"

class SaveNoteRequest(BaseModel):
    document_id: Optional[str] = None
    title: str
    note_type: str = "summary"
    content: str

PROMPTS = {
    "summary": "Provide a high-level executive summary note covering all core ideas, definitions, and takeaways.",
    "exam": "Generate structured Exam Preparation Notes. Focus on frequently tested questions, key definitions, formulas, and critical concepts.",
    "cheat_sheet": "Generate a concise, dense Revision Cheat Sheet. Use bullet points, bold key terms, short code/formula snippets, and quick memory cues.",
    "detailed": "Generate comprehensive, detailed Study Notes covering every section of the document in logical, structured depth."
}

@router.post("/notes/generate")
async def generate_ai_notes(req: GenerateNotesRequest):
    """
    Generate structured AI study notes from document context.
    """
    try:
        doc = get_document(req.document_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Document not found.")
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    query = "key concepts definitions main ideas summary exam topics cheat sheet"
    query_embedding = await generate_query_embedding_async(query)

    loop = asyncio.get_event_loop()
    chunks = await loop.run_in_executor(
        None, lambda: similarity_search(query_embedding, req.document_id, match_count=15)
    )

    if not chunks:
        raise HTTPException(status_code=404, detail="No content found for this document.")

    context = "\n\n".join([c["content"] for c in chunks])
    instruction = PROMPTS.get(req.note_type, PROMPTS["exam"])

    prompt = f"""You are EduMitra-AI Note Engine.
{instruction}

Document Title: {doc.get('title')}

Document Content:
{context}

Format your output in clean, beautiful Markdown with clear headings, lists, tables, and code snippets where appropriate."""

    try:
        response = await loop.run_in_executor(
            None, lambda: generate_content_with_retry(client, model_id=GEMINI_MODEL_ID, contents=prompt)
        )
        note_content = extract_gemini_text(response)
        return {
            "document_id": req.document_id,
            "document_title": doc.get("title"),
            "note_type": req.note_type,
            "title": f"{req.note_type.replace('_', ' ').title()} Notes - {doc.get('title')}",
            "content": note_content,
        }
    except Exception as e:
        raise gemini_error_to_http(e, "Notes generation")


@router.get("/notes")
async def get_all_notes():
    """
    Fetch saved notes from Supabase.
    """
    _check_supabase()
    loop = asyncio.get_event_loop()

    def _get():
        resp = supabase.table("notes").select("*").order("created_at", desc=True).execute()
        return resp.data or []

    try:
        data = await loop.run_in_executor(None, _get)
        return {"notes": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch notes: {e}")


@router.post("/notes")
async def save_note(req: SaveNoteRequest):
    """
    Save or update a note in Supabase.
    """
    _check_supabase()
    loop = asyncio.get_event_loop()

    def _save():
        payload = {
            "title": req.title,
            "note_type": req.note_type,
            "content": req.content,
        }
        if req.document_id:
            payload["document_id"] = req.document_id
        resp = supabase.table("notes").insert(payload).execute()
        return resp.data[0] if resp.data else None

    try:
        saved = await loop.run_in_executor(None, _save)
        return {"status": "success", "note": saved}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save note: {e}")
