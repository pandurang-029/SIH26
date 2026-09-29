import logging
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.document_service import DocumentService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["Documents"])


class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    file_type: str
    file_size: int
    upload_status: str


class ExtractedPageSchema(BaseModel):
    page_number: int
    text: str


class DocumentMetadataSchema(BaseModel):
    total_pages: int
    word_count: int
    char_count: int


class DocumentExtractionResponse(BaseModel):
    document_id: str
    filename: str
    file_type: str
    file_size: int
    full_text: str
    pages: List[ExtractedPageSchema]
    metadata: DocumentMetadataSchema


@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload Source Document",
    description="Accepts single PDF, DOCX, or TXT document up to 25MB."
)
async def upload_document(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename missing in upload request."
        )

    try:
        content = await file.read()
        saved_meta = DocumentService.save_document(content, file.filename)
        return DocumentUploadResponse(**saved_meta)
    except ValueError as val_err:
        logger.warning(f"Upload validation failed for file '{file.filename}': {str(val_err)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )
    except Exception as err:
        logger.error(f"Unexpected error uploading file '{file.filename}': {str(err)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while processing document upload."
        )


@router.post(
    "/{document_id}/extract",
    response_model=DocumentExtractionResponse,
    summary="Extract Document Content",
    description="Extracts page-by-page text, full text, and metrics for uploaded document."
)
async def extract_document(document_id: str):
    if not document_id or not document_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document ID is required."
        )

    try:
        extraction_data = DocumentService.extract_document(document_id)
        return DocumentExtractionResponse(**extraction_data)
    except FileNotFoundError as fnf_err:
        logger.info(f"Document ID '{document_id}' not found: {str(fnf_err)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document ID '{document_id}' not found."
        )
    except ValueError as val_err:
        err_msg = str(val_err)
        logger.warning(f"Document extraction failed for ID '{document_id}': {err_msg}")
        if "Invalid document ID" in err_msg or "Path traversal" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=err_msg
            )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=err_msg
        )
    except Exception as err:
        logger.error(f"Unexpected error extracting document ID '{document_id}': {str(err)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred during document text extraction."
        )
