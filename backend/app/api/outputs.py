import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas.output_schemas import GenerateOutputsRequest, GeneratedOutputsResponse
from app.services.document_service import DocumentService
from app.services.ai_service import GeminiAIService, MockAIService
from app.services.output_service import OutputService
from app.core.config import settings
import os

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["Output Generation"])


@router.post(
    "/{document_id}/generate",
    response_model=GeneratedOutputsResponse,
    summary="Generate Multi-Format Outputs from CCR",
    description="Consumes the validated Common Content Representation (CCR) single source of truth to generate Executive Summary, Advisory, and Presentation slide deck outputs."
)
async def generate_outputs(document_id: str, request: GenerateOutputsRequest):
    if not document_id or not document_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document ID is required."
        )

    if not request.output_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one output type must be specified in request."
        )

    # Validate output types
    valid_types = {"executive_summary", "advisory", "presentation", "social_media", "infographic"}
    for ot in request.output_types:
        if ot.lower().strip() not in valid_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported output type '{ot}'. Supported types are 'executive_summary', 'advisory', 'presentation', 'social_media', 'infographic'."
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
        logger.error(f"Failed to load document ID '{document_id}': {str(err)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unable to process document ID '{document_id}' prior to output generation."
        )

    pages = extraction_data.get("pages", [])
    filename = extraction_data.get("filename", "document")

    # 2. Get CCR (using MockAIService or GeminiAIService)
    use_mock_ai = settings.USE_MOCK_AI or os.environ.get("USE_MOCK_AI", "false").lower() == "true"
    if use_mock_ai:
        ai_service = MockAIService()
    else:
        ai_service = GeminiAIService()

    try:
        ccr = ai_service.analyze_document(pages, filename)
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to obtain Common Content Representation: {str(val_err)}"
        )
    except Exception as err:
        logger.error(f"Error obtaining CCR for document ID '{document_id}': {str(err)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred obtaining the Common Content Representation."
        )

    # 3. Generate requested outputs from CCR
    response = OutputService.generate_outputs(
        document_id=document_id,
        ccr=ccr,
        output_types=request.output_types,
        configuration=request.configuration,
    )

    return response
