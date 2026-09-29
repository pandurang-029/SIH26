from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import health, documents, analysis, outputs, exports, quality, auth

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for NTRO GenAI Content Transformation Platform",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(health.router, prefix="/api", tags=["Health Check"])
app.include_router(auth.router, prefix="/api", tags=["Authentication & Security"])
app.include_router(documents.router, prefix="/api", tags=["Documents"])
app.include_router(analysis.router, prefix="/api", tags=["Content Analysis"])
app.include_router(outputs.router, prefix="/api", tags=["Output Generation"])
app.include_router(exports.router, prefix="/api", tags=["Export & File Downloads"])
app.include_router(quality.router, prefix="/api", tags=["Quality Control & Provenance"])


from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging

logger = logging.getLogger(__name__)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle malformed payloads and invalid query/body parameters cleanly."""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": f"Malformed request parameters: {str(exc.errors()[0].get('msg', 'Invalid input'))}"},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Catch unhandled errors and return clean HTTP 500 without stack trace leaks."""
    logger.error(f"Unhandled server exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred while processing your request."},
    )


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "health_check": "/api/health",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
