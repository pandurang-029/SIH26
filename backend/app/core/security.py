import os
import re
import uuid
from pathlib import Path
from app.core.config import settings


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename by removing path traversal characters, unsafe symbols,
    and stripping whitespace.
    """
    # Remove path directory parts if passed
    basename = os.path.basename(filename)
    # Replace unsafe characters with underscore, keeping alphanumeric, dots, hyphens
    sanitized = re.sub(r"[^a-zA-Z0-9._-]", "_", basename)
    # Prevent leading dots or hidden files
    sanitized = sanitized.lstrip(".")
    return sanitized if sanitized else "document"


def generate_document_id() -> str:
    """
    Generate unique document UUIDv4.
    """
    return str(uuid.uuid4())


DOC_ID_REGEX = re.compile(r"^[a-zA-Z0-9_-]{1,64}$")


def is_valid_document_id(document_id: str) -> bool:
    """
    Validate that document_id is a safe alphanumeric string/UUID without path traversal.
    """
    if not document_id or not isinstance(document_id, str):
        return False
    return bool(DOC_ID_REGEX.match(document_id.strip()))


def get_file_extension(filename: str) -> str:
    """
    Extract lowercased file extension without leading dot.
    """
    parts = filename.rsplit(".", 1)
    if len(parts) > 1:
        return parts[1].lower()
    return ""


def is_allowed_extension(extension: str) -> bool:
    """
    Check if extension is in allowed set.
    """
    return extension.lower() in settings.ALLOWED_EXTENSIONS
