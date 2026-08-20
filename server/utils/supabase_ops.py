from typing import List, Dict, Any, Optional
from config import supabase

def _check_supabase():
    """Raise a clear RuntimeError if the Supabase client failed to initialize."""
    if supabase is None:
        raise RuntimeError(
            "Supabase client is not initialized. "
            "Please update SUPABASE_SERVICE_KEY in server/.env with a valid JWT from "
            "your Supabase Dashboard (Settings → API → service_role key)."
        )

def store_document(
    title: str,
    source_type: str,
    source_url: Optional[str] = None,
    user_id: Optional[str] = None
) -> str:
    """Insert a document record associated with user_id and return its ID."""
    _check_supabase()
    payload: Dict[str, Any] = {
        "title": title,
        "source_type": source_type,
        "source_url": source_url,
    }
    if user_id:
        payload["user_id"] = user_id

    try:
        response = supabase.table("documents").insert(payload).execute()
    except Exception as e:
        raise RuntimeError(
            f"Database error while storing document. Check your Supabase connection. Details: {e}"
        ) from e

    if not response.data:
        raise RuntimeError(
            "Failed to store document — Supabase returned no data. "
            "Make sure you have run the database migrations in your Supabase SQL Editor."
        )
    return response.data[0]["id"]

def store_chunks(document_id: str, chunks: List[str], embeddings: List[List[float]]) -> int:
    """Batch insert chunks with their embeddings. Returns the number of stored chunks."""
    _check_supabase()
    if not chunks:
        return 0

    if len(chunks) != len(embeddings):
        raise ValueError(
            f"Chunk count ({len(chunks)}) does not match embedding count ({len(embeddings)})."
        )

    records = [
        {
            "document_id": document_id,
            "content": chunk,
            "embedding": embedding,
            "chunk_index": idx,
        }
        for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings))
    ]

    batch_size = 50
    stored = 0
    for i in range(0, len(records), batch_size):
        batch = records[i : i + batch_size]
        try:
            resp = supabase.table("chunks").insert(batch).execute()
        except Exception as e:
            raise RuntimeError(
                f"Database error while storing chunk batch (index {i}). Details: {e}"
            ) from e
        if not resp.data:
            raise RuntimeError(
                f"Supabase returned no data for chunk batch at index {i}."
            )
        stored += len(resp.data)

    return stored

def similarity_search(
    query_embedding: List[float], document_id: str, match_count: int = 5
) -> List[Dict[str, Any]]:
    """
    Perform pgvector similarity search via the match_chunks RPC function.
    Returns list of {id, content, similarity} dicts.
    """
    _check_supabase()
    try:
        response = supabase.rpc(
            "match_chunks",
            {
                "query_embedding": query_embedding,
                "doc_id": document_id,
                "match_count": match_count,
            },
        ).execute()
        return response.data or []
    except Exception as e:
        err_str = str(e).lower()
        if "match_chunks" in err_str or "function" in err_str or "rpc" in err_str:
            raise RuntimeError(
                "The 'match_chunks' function is not found in Supabase. "
                "Please run server/migrations/001_initial_saas_schema.sql first."
            ) from e
        raise RuntimeError(f"Similarity search failed: {e}") from e

def get_document(document_id: str) -> Dict[str, Any]:
    """
    Fetch a single document record by ID.
    """
    _check_supabase()
    try:
        response = (
            supabase.table("documents")
            .select("*")
            .eq("id", document_id)
            .maybe_single()
            .execute()
        )
    except Exception as e:
        raise RuntimeError(f"Database error while fetching document: {e}") from e

    if not response.data:
        raise ValueError(f"Document with id '{document_id}' not found.")
    return response.data
