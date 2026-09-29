from datetime import datetime, timezone
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("/health", summary="Health Check API")
async def health_check():
    """
    Health check endpoint returning system status, timestamp, service info, and version.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "backend": "FastAPI",
        "database": "disconnected (not initialized for MVP baseline)"
    }
