from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import asyncio

from config import client, GEMINI_MODEL_ID, openrouter_client, FALLBACK_MODELS
from utils.embeddings import generate_query_embedding_async
from utils.supabase_ops import similarity_search, get_document
from utils.error_helpers import gemini_error_to_http, extract_gemini_text, generate_content_with_retry

router = APIRouter()

class ToolRequest(BaseModel):
    document_id: str

@router.post("/summarize")
async def summarize_document(request: ToolRequest):
    """
    Generate an executive summary and key takeaways of the document.
    """
    try:
        doc = get_document(request.document_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Document not found.")
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    query = "overview summary main points key takeaways highlights introduction conclusion"
    query_embedding = await generate_query_embedding_async(query)

    loop = asyncio.get_event_loop()
    chunks = await loop.run_in_executor(
        None, lambda: similarity_search(query_embedding, request.document_id, match_count=15)
    )

    if not chunks:
        raise HTTPException(status_code=404, detail="No content found for this document.")

    context = "\n\n".join([c["content"] for c in chunks])
    prompt = f"""You are EduMitra-AI, an elite academic AI tutor.
Provide a comprehensive, beautifully structured executive summary of the following document content.

Include:
1. Executive Summary (2-3 paragraphs)
2. Core Takeaways (Bullet points)
3. Essential Terminology & Definitions
4. Key Takeaway Conclusion

Content:
{context}"""

    try:
        response = await loop.run_in_executor(
            None, lambda: generate_content_with_retry(client, model_id=GEMINI_MODEL_ID, contents=prompt)
        )
        summary = extract_gemini_text(response)
        return {"document_id": request.document_id, "title": doc.get("title"), "summary": summary}
    except Exception as e:
        raise gemini_error_to_http(e, "Summary generation")


@router.post("/key-concepts")
async def extract_key_concepts(request: ToolRequest):
    """
    Extract key concepts, definitions, and formulas/principles from the document.
    """
    try:
        doc = get_document(request.document_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Document not found.")
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    query = "concepts definitions principles terminology fundamentals core ideas"
    query_embedding = await generate_query_embedding_async(query)

    loop = asyncio.get_event_loop()
    chunks = await loop.run_in_executor(
        None, lambda: similarity_search(query_embedding, request.document_id, match_count=15)
    )

    if not chunks:
        raise HTTPException(status_code=404, detail="No content found for this document.")

    context = "\n\n".join([c["content"] for c in chunks])
    prompt = f"""You are EduMitra-AI. Extract and organize all key concepts, formulas, definitions, and core principles from this document.

Format each concept clearly with:
- **Concept Name**
- **Definition / Explanation**
- **Why it matters**
- **Example or Application**

Content:
{context}"""

    try:
        response = await loop.run_in_executor(
            None, lambda: generate_content_with_retry(client, model_id=GEMINI_MODEL_ID, contents=prompt)
        )
        concepts = extract_gemini_text(response)
        return {"document_id": request.document_id, "title": doc.get("title"), "key_concepts": concepts}
    except Exception as e:
        raise gemini_error_to_http(e, "Key concept extraction")


@router.post("/study-plan")
async def generate_study_plan(request: ToolRequest):
    """
    Generate a structured 5-day step-by-step study plan based on the document.
    """
    try:
        doc = get_document(request.document_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Document not found.")
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    query = "topics structure sequence chapters learning path concepts roadmap"
    query_embedding = await generate_query_embedding_async(query)

    loop = asyncio.get_event_loop()
    chunks = await loop.run_in_executor(
        None, lambda: similarity_search(query_embedding, request.document_id, match_count=15)
    )

    if not chunks:
        raise HTTPException(status_code=404, detail="No content found for this document.")

    context = "\n\n".join([c["content"] for c in chunks])
    prompt = f"""You are EduMitra-AI. Design a structured, actionable 5-Day Study Plan to master the material in this document.

Structure:
- Day 1: Foundations & Core Concepts
- Day 2: Deep Dive & Detailed Analysis
- Day 3: Practical Applications & Examples
- Day 4: Self-Assessment & Flashcard Review
- Day 5: Comprehensive Mastery & Exam Prep

Each day should include:
- Specific topics to study
- 3 key goals
- Practice tasks/questions

Content:
{context}"""

    try:
        response = await loop.run_in_executor(
            None, lambda: generate_content_with_retry(client, model_id=GEMINI_MODEL_ID, contents=prompt)
        )
        plan = extract_gemini_text(response)
        return {"document_id": request.document_id, "title": doc.get("title"), "study_plan": plan}
    except Exception as e:
        raise gemini_error_to_http(e, "Study plan generation")
