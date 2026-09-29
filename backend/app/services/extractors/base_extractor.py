from abc import ABC, abstractmethod
from typing import Any, Dict, List
from pathlib import Path


class BaseDocumentExtractor(ABC):
    """
    Abstract base class for document text extractors.
    All format extractors (PDF, DOCX, TXT) inherit from this interface.
    """

    @abstractmethod
    def extract(self, file_path: Path) -> Dict[str, Any]:
        """
        Extract text from file path and return normalized structure:
        {
            "full_text": str,
            "pages": [{"page_number": int, "text": str}],
            "metadata": {"total_pages": int, "word_count": int, "char_count": int}
        }
        """
        pass

    @staticmethod
    def calculate_metrics(full_text: str, total_pages: int) -> Dict[str, Any]:
        """
        Calculate word count and character count metrics.
        """
        words = full_text.split()
        return {
            "total_pages": total_pages,
            "word_count": len(words),
            "char_count": len(full_text),
        }
