import os
import json
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
from app.core.config import settings
from app.core.security import (
    sanitize_filename,
    generate_document_id,
    is_valid_document_id,
    get_file_extension,
    is_allowed_extension,
)
from app.services.document_extractor import DocumentExtractorFactory


class DocumentService:
    """
    Service responsible for secure file persistence, lookup, and extraction execution.
    Storage is decoupled for easy replacement with cloud storage or DB later.
    """

    @staticmethod
    def save_document(file_content: bytes, filename: str) -> Dict[str, Any]:
        """
        Validate, sanitize, and save uploaded file to backend/uploads/.
        Save metadata alongside document in JSON format.
        """
        if not file_content:
            raise ValueError("Uploaded file is empty (0 bytes).")

        if len(file_content) > settings.max_upload_size_bytes():
            raise ValueError(
                f"File size exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_MB} MB."
            )

        sanitized_name = sanitize_filename(filename)
        extension = get_file_extension(sanitized_name)

        if not extension or not is_allowed_extension(extension):
            raise ValueError(
                f"Unsupported file format '.{extension}'. Only PDF, DOCX, and TXT files are accepted."
            )

        doc_id = generate_document_id()
        saved_filename = f"{doc_id}.{extension}"
        storage_path = settings.UPLOAD_DIR / saved_filename
        meta_path = settings.UPLOAD_DIR / f"{doc_id}.json"

        # Save raw binary bytes to local storage
        with open(storage_path, "wb") as f:
            f.write(file_content)

        meta_data = {
            "document_id": doc_id,
            "filename": sanitized_name,
            "saved_filename": saved_filename,
            "file_type": extension,
            "file_size": len(file_content),
            "upload_status": "uploaded",
        }

        # Store sidecar metadata JSON file
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta_data, f, indent=2)

        return meta_data

    @staticmethod
    def get_document_info(document_id: str) -> Tuple[Path, Dict[str, Any]]:
        """
        Locate document and metadata by document_id with strict path containment checks.
        """
        if not is_valid_document_id(document_id):
            raise ValueError(f"Invalid document ID format '{document_id}'.")

        meta_path = (settings.UPLOAD_DIR / f"{document_id}.json").resolve()
        upload_dir_resolved = settings.UPLOAD_DIR.resolve()

        try:
            if not meta_path.is_relative_to(upload_dir_resolved):
                raise ValueError(f"Path traversal detected for document ID '{document_id}'.")
        except ValueError as p_err:
            if "Path traversal" in str(p_err):
                raise
            raise ValueError(f"Path traversal detected for document ID '{document_id}'.")

        if not meta_path.exists():
            raise FileNotFoundError(f"Document ID '{document_id}' not found.")

        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)

        file_path = (settings.UPLOAD_DIR / meta["saved_filename"]).resolve()
        if not file_path.is_relative_to(upload_dir_resolved):
            raise ValueError(f"Path traversal detected for binary file of document ID '{document_id}'.")

        if not file_path.exists():
            raise FileNotFoundError(f"Document binary file for ID '{document_id}' not found.")

        return file_path, meta

    @classmethod
    def extract_document(cls, document_id: str) -> Dict[str, Any]:
        """
        Execute document text extraction and return normalized extraction structure.
        """
        file_path, meta = cls.get_document_info(document_id)
        extraction_res = DocumentExtractorFactory.extract_document(
            file_path, meta["file_type"]
        )

        return {
            "document_id": document_id,
            "filename": meta["filename"],
            "file_type": meta["file_type"],
            "file_size": meta["file_size"],
            "full_text": extraction_res["full_text"],
            "pages": extraction_res["pages"],
            "metadata": extraction_res["metadata"],
        }
