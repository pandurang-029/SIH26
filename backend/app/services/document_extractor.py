from pathlib import Path
from typing import Any, Dict
from app.services.extractors import (
    BaseDocumentExtractor,
    PdfExtractor,
    DocxExtractor,
    TxtExtractor,
)


class DocumentExtractorFactory:
    """
    Factory to select appropriate document extractor based on file extension.
    """

    _extractors: Dict[str, BaseDocumentExtractor] = {
        "pdf": PdfExtractor(),
        "docx": DocxExtractor(),
        "txt": TxtExtractor(),
    }

    @classmethod
    def get_extractor(cls, file_type: str) -> BaseDocumentExtractor:
        file_type_lower = file_type.lower().lstrip(".")
        extractor = cls._extractors.get(file_type_lower)
        if not extractor:
            raise ValueError(f"Unsupported file format for extraction: '{file_type}'")
        return extractor

    @classmethod
    def extract_document(cls, file_path: Path, file_type: str) -> Dict[str, Any]:
        extractor = cls.get_extractor(file_type)
        return extractor.extract(file_path)
