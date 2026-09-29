"""
API Router for AI Quality Control & Provenance Verification Layer.
POST /api/documents/{document_id}/quality-check
Does NOT call Gemini during quality checking.
"""
import os
import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas.quality_schemas import QualityControlReport, QualityCheckRequest
from app.services.document_service import DocumentService
from app.services.ai_service import GeminiAIService, MockAIService
from app.services.output_service import OutputService
from app.services.quality_service import QualityService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["Quality Control & Provenance"])


@router.post(
    "/{document_id}/quality-check",
    response_model=QualityControlReport,
    summary="Run AI Quality & Provenance Check",
    description="Deterministically extracts factual claims from generated outputs and verifies them against the CommonContentRepresentation (CCR)."
)
async def run_quality_check(
    document_id: str, request: QualityCheckRequest
) -> QualityControlReport:
    if not document_id or not document_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document ID is required."
        )

    if not request.output_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one output type must be specified for quality checking."
        )

    # 1. Retrieve document info
    try:
        file_path, meta = DocumentService.get_document_info(document_id)
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document ID '{document_id}' not found."
        )
    except Exception as e:
        logger.error(f"Error retrieving document '{document_id}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve document info: {str(e)}"
        )

    # 2. Retrieve CCR from AIService
    use_mock = os.environ.get("USE_MOCK_AI", "false").lower() == "true"
    if use_mock:
        ai_service = MockAIService()
    else:
        ai_service = GeminiAIService()

    try:
        extraction = DocumentService.extract_document(document_id)
        pages = extraction["pages"]
        filename = meta["filename"]
        ccr = ai_service.analyze_document(pages, filename)
    except Exception as e:
        logger.error(f"Failed to generate/retrieve CCR for document '{document_id}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve CCR single source of truth: {str(e)}"
        )

    # 3. Retrieve Step 5 generated outputs
    try:
        generated_resp = OutputService.generate_outputs(
            document_id=document_id,
            ccr=ccr,
            output_types=request.output_types,
        )
    except Exception as e:
        logger.error(f"Failed to generate/retrieve outputs for document '{document_id}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve generated outputs: {str(e)}"
        )

    outputs_map = {
        "executive_summary": generated_resp.executive_summary,
        "advisory": generated_resp.advisory,
        "presentation": generated_resp.presentation,
    }

    # 4. Execute deterministic Quality Control report generation
    try:
        report = QualityService.generate_report(
            document_id=document_id,
            ccr=ccr,
            outputs=outputs_map,
            output_types=request.output_types,
        )
        return report
    except Exception as e:
        logger.error(f"Quality check evaluation failed for document '{document_id}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Quality check evaluation failed: {str(e)}"
        )
