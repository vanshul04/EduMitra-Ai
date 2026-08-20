from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import asyncio
import json
import re

from config import client, GEMINI_MODEL_ID, supabase
from utils.embeddings import generate_query_embedding_async
from utils.supabase_ops import similarity_search, get_document, _check_supabase
from utils.error_helpers import gemini_error_to_http, extract_gemini_text, generate_content_with_retry

router = APIRouter()

class StartVivaRequest(BaseModel):
    document_id: str
    difficulty: str = "medium" # "easy", "medium", "hard"
    num_questions: int = 3

class EvaluateAnswerRequest(BaseModel):
    document_id: str
    question: str
    user_answer: str

@router.post("/viva/start")
async def start_viva_session(req: StartVivaRequest):
    """
    Generate viva/interview questions based on the document.
    """
    try:
        doc = get_document(req.document_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Document not found.")
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    query = "technical interview questions viva concepts depth principles"
    query_embedding = await generate_query_embedding_async(query)

    loop = asyncio.get_event_loop()
    chunks = await loop.run_in_executor(
        None, lambda: similarity_search(query_embedding, req.document_id, match_count=12)
    )

    if not chunks:
        raise HTTPException(status_code=404, detail="No content found for this document.")

    context = "\n\n".join([c["content"] for c in chunks])
    prompt = f"""You are EduMitra-AI Technical Interviewer.
Generate exactly {req.num_questions} technical viva/interview questions at {req.difficulty} difficulty level based on this content.

Content:
{context}

Output ONLY a valid JSON array of strings, e.g.:
["Explain concept X in detail.", "How does Y work under the hood?", "What is the difference between A and B?"]"""

    try:
        response = await loop.run_in_executor(
            None, lambda: generate_content_with_retry(client, model_id=GEMINI_MODEL_ID, contents=prompt)
        )
        text = extract_gemini_text(response).strip()
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text).strip()
        
        questions = json.loads(text)
        if not isinstance(questions, list):
            questions = [questions]

        return {
            "document_id": req.document_id,
            "document_title": doc.get("title"),
            "difficulty": req.difficulty,
            "questions": questions,
        }
    except Exception as e:
        raise gemini_error_to_http(e, "Viva question generation")


@router.post("/viva/evaluate")
async def evaluate_viva_answer(req: EvaluateAnswerRequest):
    """
    Evaluate user's interview answer and return detailed scoring, strengths, weaknesses, and ideal answer.
    """
    try:
        doc = get_document(req.document_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Document not found.")
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    query = f"{req.question} answer context facts principles"
    query_embedding = await generate_query_embedding_async(query)

    loop = asyncio.get_event_loop()
    chunks = await loop.run_in_executor(
        None, lambda: similarity_search(query_embedding, req.document_id, match_count=10)
    )

    context = "\n\n".join([c["content"] for c in chunks]) if chunks else "General knowledge context."

    prompt = f"""You are EduMitra-AI Technical Examiner.
Evaluate the candidate's answer to the technical interview question.

Question: {req.question}
Candidate's Answer: {req.user_answer}

Reference Context from Document:
{context}

Provide your evaluation as a valid JSON object with exact keys:
- "score": A float between 0.0 and 10.0 (e.g. 8.5)
- "correctness": Brief assessment of technical accuracy
- "strengths": Array of string bullet points of what candidate did well
- "weaknesses": Array of string bullet points of what candidate missed
- "ideal_answer": Concise, model ideal answer (2-3 paragraphs)
- "tips": Array of actionable improvement tips

Output ONLY valid JSON."""

    try:
        response = await loop.run_in_executor(
            None, lambda: generate_content_with_retry(client, model_id=GEMINI_MODEL_ID, contents=prompt)
        )
        text = extract_gemini_text(response).strip()
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text).strip()

        eval_data = json.loads(text)

        # Save to database if possible
        def _save_viva():
            try:
                _check_supabase()
                supabase.table("viva_sessions").insert({
                    "document_id": req.document_id,
                    "topic": req.question[:60],
                    "score": float(eval_data.get("score", 7.0)),
                    "evaluation": eval_data,
                }).execute()
            except Exception as ex:
                print("Note: Could not persist viva session to DB:", ex)

        await loop.run_in_executor(None, _save_viva)

        return {
            "document_id": req.document_id,
            "question": req.question,
            "user_answer": req.user_answer,
            "evaluation": eval_data
        }
    except Exception as e:
        raise gemini_error_to_http(e, "Viva evaluation")
