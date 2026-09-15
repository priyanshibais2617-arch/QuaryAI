import uuid
import jwt
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.session import get_db
from app.db.models.user import User

security = HTTPBearer(auto_error=False)

def decode_supabase_jwt(token: str) -> Dict[str, Any]:
    """Decode and verify Supabase JWT using configured secret."""
    try:
        # Supabase signs access tokens with HS256 using the project's JWT secret
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Helper to generate signed JWT for testing or local development."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(hours=24)
    to_encode.update({"exp": expire, "iat": now})
    return jwt.encode(to_encode, settings.SUPABASE_JWT_SECRET, algorithm="HS256")

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """FastAPI dependency to extract, verify, and synchronize the authenticated user."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_supabase_jwt(token)

    supabase_user_id = payload.get("sub")
    if not supabase_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: missing user identifier",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email = payload.get("email")
    user_metadata = payload.get("user_metadata", {})
    role = user_metadata.get("role") or payload.get("role", "analyst")

    # Look up user by supabase_user_id
    result = await db.execute(
        select(User).where(User.supabase_user_id == supabase_user_id)
    )
    user = result.scalar_one_or_none()

    if user is None and email:
        # Check if user with matching email was created earlier
        result_email = await db.execute(
            select(User).where(User.email == email)
        )
        user = result_email.scalar_one_or_none()
        if user is not None:
            user.supabase_user_id = supabase_user_id
            await db.commit()
            await db.refresh(user)

    if user is None:
        # Auto-provision user record on first authenticated API interaction
        user = User(
            id=str(uuid.uuid4()),
            supabase_user_id=supabase_user_id,
            email=email or f"user-{supabase_user_id[:8]}@satquery.ai",
            role=role,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user
