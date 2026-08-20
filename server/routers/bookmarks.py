from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import asyncio

from config import supabase
from utils.supabase_ops import _check_supabase

router = APIRouter()

class AddBookmarkRequest(BaseModel):
    title: str
    category: str = "general" # "chat", "concept", "flashcard", "note"
    content: str
    source_info: Optional[str] = None

@router.get("/bookmarks")
async def get_bookmarks():
    """
    Fetch saved bookmarks from Supabase.
    """
    _check_supabase()
    loop = asyncio.get_event_loop()

    def _get():
        resp = supabase.table("bookmarks").select("*").order("created_at", desc=True).execute()
        return resp.data or []

    try:
        data = await loop.run_in_executor(None, _get)
        return {"bookmarks": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch bookmarks: {e}")

@router.post("/bookmarks")
async def add_bookmark(req: AddBookmarkRequest):
    """
    Save a new bookmark.
    """
    _check_supabase()
    loop = asyncio.get_event_loop()

    def _add():
        resp = supabase.table("bookmarks").insert({
            "title": req.title,
            "category": req.category,
            "content": req.content,
            "source_info": req.source_info,
        }).execute()
        return resp.data[0] if resp.data else None

    try:
        saved = await loop.run_in_executor(None, _add)
        return {"status": "success", "bookmark": saved}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save bookmark: {e}")

@router.delete("/bookmarks/{bookmark_id}")
async def delete_bookmark(bookmark_id: str):
    """
    Delete a bookmark by ID.
    """
    _check_supabase()
    loop = asyncio.get_event_loop()

    def _delete():
        resp = supabase.table("bookmarks").delete().eq("id", bookmark_id).execute()
        return resp.data

    try:
        data = await loop.run_in_executor(None, _delete)
        return {"status": "success", "deleted": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete bookmark: {e}")
