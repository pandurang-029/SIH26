import logging
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from app.services.export_service import ExportService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["Export & File Downloads"])


class ExportRequest(BaseModel):
    output_type: str = Field(..., description="Target output type ('executive_summary', 'advisory', 'presentation')")
    format: str = Field(..., description="Target file format ('pdf' or 'pptx')")


@router.post(
    "/{document_id}/export",
    summary="Export Generated Output File (PDF / PPTX)",
    description="Converts validated Step 5 output models to downloadable PDF or PPTX files. Does NOT invoke Gemini API."
)
async def export_output_file(document_id: str, request: ExportRequest):
    if not document_id or not document_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document ID is required."
        )

    if not request.output_type or not request.format:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both 'output_type' and 'format' must be specified."
        )

    try:
        file_path, mime_type, filename = ExportService.export_output(
            document_id=document_id,
            output_type=request.output_type,
            output_format=request.format,
        )

        return FileResponse(
            path=str(file_path),
            media_type=mime_type,
            filename=filename,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )

    except FileNotFoundError as fnf_err:
        logger.info(f"Document ID '{document_id}' not found for export: {str(fnf_err)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document ID '{document_id}' not found."
        )
    except ValueError as val_err:
        logger.warning(f"Export validation failure for document ID '{document_id}': {str(val_err)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )
    except Exception as err:
        logger.error(f"Unexpected error exporting file for document ID '{document_id}': {str(err)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while rendering the requested export file."
        )
