from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import asyncio
import json
import re

from config import client, GEMINI_MODEL_ID, supabase
from utils.embeddings import generate_query_embedding_async
from utils.supabase_ops import similarity_search, get_document, _check_supabase
from utils.error_helpers import gemini_error_to_http, extract_gemini_text, generate_content_with_retry

router = APIRouter()

class GenerateLearningPathRequest(BaseModel):
    document_id: str

@router.post("/learning-path/generate")
async def generate_learning_path(req: GenerateLearningPathRequest):
    """
    Generate a structured AI Learning Path from document content.
    """
    try:
        doc = get_document(req.document_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Document not found.")
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    query = "prerequisites topics chapters sequence roadmap concepts difficulty estimated time"
    query_embedding = await generate_query_embedding_async(query)

    loop = asyncio.get_event_loop()
    chunks = await loop.run_in_executor(
        None, lambda: similarity_search(query_embedding, req.document_id, match_count=15)
    )

    if not chunks:
        raise HTTPException(status_code=404, detail="No content found for this document.")

    context = "\n\n".join([c["content"] for c in chunks])
    prompt = f"""You are EduMitra-AI Curriculum Architect.
Generate a structured, logical AI Learning Path to master the material in this document.

Document Title: {doc.get('title')}
Content:
{context}

Output ONLY valid JSON with keys:
- "title": Title of learning path
- "prerequisites": Array of string prerequisites
- "estimated_hours": Integer estimated study hours
- "difficulty": "Beginner", "Intermediate", or "Advanced"
- "modules": Array of objects, each with:
    - "module_number": Integer (1, 2, 3...)
    - "title": Module name
    - "description": Short description of what to learn
    - "topics": Array of string sub-topics
    - "estimated_minutes": Integer
"""

    try:
        response = await loop.run_in_executor(
            None, lambda: generate_content_with_retry(client, model_id=GEMINI_MODEL_ID, contents=prompt)
        )
        text = extract_gemini_text(response).strip()
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text).strip()

        path_data = json.loads(text)

        def _save():
            try:
                _check_supabase()
                supabase.table("learning_paths").insert({
                    "document_id": req.document_id,
                    "title": path_data.get("title", doc.get("title")),
                    "path_data": path_data
                }).execute()
            except Exception as ex:
                print("Note: Could not persist learning path to DB:", ex)

        await loop.run_in_executor(None, _save)

        return {
            "document_id": req.document_id,
            "path": path_data
        }
    except Exception as e:
        raise gemini_error_to_http(e, "Learning path generation")
