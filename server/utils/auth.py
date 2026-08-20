from fastapi import Header, HTTPException, Depends
from typing import Optional
from config import supabase
import asyncio

async def get_current_user(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """
    FastAPI security dependency.
    Extracts Bearer token from HTTP Authorization header and verifies it via Supabase Auth.
    Returns user_id string if verified, None if unauthenticated request (or raises 401 on invalid token).
    """
    if not authorization:
        return None

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid Authorization header format. Expected 'Bearer <access_token>'."
        )

    token = authorization.split(" ")[1].strip()
    if not token:
        return None

    loop = asyncio.get_event_loop()

    def _verify():
        if supabase is None:
            return None
        try:
            user_resp = supabase.auth.get_user(token)
            if user_resp and user_resp.user:
                return user_resp.user.id
            return None
        except Exception as e:
            print("Token verification error:", e)
            return None

    user_id = await loop.run_in_executor(None, _verify)
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token. Please log in again."
        )

    return user_id
