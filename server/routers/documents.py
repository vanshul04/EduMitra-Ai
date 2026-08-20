from fastapi import APIRouter, HTTPException
import asyncio
from typing import List, Optional
from config import supabase
from utils.supabase_ops import _check_supabase

router = APIRouter()

@router.get("/documents")
async def list_documents(source_type: Optional[str] = None, search: Optional[str] = None):
    """
    Fetch all processed documents from Supabase.
    Supports filtering by source_type ('pdf' or 'youtube') and search query.
    """
    _check_supabase()
    loop = asyncio.get_event_loop()

    def _query():
        query = supabase.table("documents").select("*").order("created_at", desc=True)
        if source_type in ("pdf", "youtube"):
            query = query.eq("source_type", source_type)
        if search and search.strip():
            query = query.ilike("title", f"%{search.strip()}%")
        resp = query.execute()
        return resp.data or []

    try:
        docs = await loop.run_in_executor(None, _query)
        
        # Enrich documents with chunk count
        enriched = []
        for doc in docs:
            doc_id = doc["id"]
            count_resp = (
                supabase.table("chunks")
                .select("id", count="exact")
                .eq("document_id", doc_id)
                .execute()
            )
            chunk_count = count_resp.count if count_resp.count is not None else 0
            doc["chunk_count"] = chunk_count
            enriched.append(doc)
            
        return {"documents": enriched}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch documents: {e}")

@router.get("/documents/{document_id}")
async def get_document_by_id(document_id: str):
    """
    Fetch a single document with metadata.
    """
    _check_supabase()
    loop = asyncio.get_event_loop()

    def _get():
        resp = supabase.table("documents").select("*").eq("id", document_id).maybe_single().execute()
        return resp.data

    try:
        doc = await loop.run_in_executor(None, _get)
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found.")
        
        count_resp = (
            supabase.table("chunks")
            .select("id", count="exact")
            .eq("document_id", document_id)
            .execute()
        )
        doc["chunk_count"] = count_resp.count if count_resp.count is not None else 0
        return doc
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@router.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    """
    Delete a document and its associated chunks (cascade delete).
    """
    _check_supabase()
    loop = asyncio.get_event_loop()

    def _delete():
        # Chunks are set to cascade delete in SQL, but we can explicitly delete chunks first as safety
        supabase.table("chunks").delete().eq("document_id", document_id).execute()
        resp = supabase.table("documents").delete().eq("id", document_id).execute()
        return resp.data

    try:
        data = await loop.run_in_executor(None, _delete)
        return {"status": "success", "message": "Document deleted successfully", "deleted": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {e}")
