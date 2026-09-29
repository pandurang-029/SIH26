import logging
import os
from fastapi import APIRouter, HTTPException, status
from app.schemas.content_representation import CommonContentRepresentation
from app.services.document_service import DocumentService
from app.services.ai_service import GeminiAIService, MockAIService
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["Content Analysis"])

MAX_ANALYSIS_CHAR_LIMIT = settings.MAX_DOCUMENT_CHARS


@router.post(
    "/{document_id}/analyze",
    response_model=CommonContentRepresentation,
    summary="Analyze Document with Gemini AI",
    description="Analyzes page-grounded document text and returns structured CommonContentRepresentation."
)
async def analyze_document(document_id: str):
    if not document_id or not document_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document ID is required."
        )

    # 1. Retrieve & extract document using Step 3 pipeline
    try:
        extraction_data = DocumentService.extract_document(document_id)
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document ID '{document_id}' not found."
        )
    except Exception as err:
        logger.error(f"Extraction failed during analysis for ID '{document_id}': {str(err)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unable to extract text from document ID '{document_id}' prior to AI analysis."
        )

    full_text = extraction_data.get("full_text", "")
    pages = extraction_data.get("pages", [])
    filename = extraction_data.get("filename", "document")

    # 2. Large document input guard
    if len(full_text) > settings.MAX_DOCUMENT_CHARS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document is larger than the current MVP processing limit."
        )

    # 3. Select AI Service provider
    # Use MockAIService if explicitly requested via config/env for test environments without keys
    use_mock_ai = settings.USE_MOCK_AI or os.environ.get("USE_MOCK_AI", "false").lower() == "true"
    
    if use_mock_ai:
        ai_service = MockAIService()
    else:
        ai_service = GeminiAIService()

    # 4. Invoke AI Service & return validated CommonContentRepresentation
    try:
        representation = ai_service.analyze_document(pages, filename)
        return representation
    except ValueError as val_err:
        error_msg = str(val_err)
        logger.warning(f"AI Content Analysis error for document ID '{document_id}': {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    except Exception as err:
        logger.error(f"Unexpected error analyzing document ID '{document_id}': {str(err)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred during Gemini AI content analysis."
        )
