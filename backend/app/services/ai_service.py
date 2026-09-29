import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from app.core.config import settings
from app.schemas.content_representation import CommonContentRepresentation
from app.services.gemini_rotator import GeminiKeyRotator, call_gemini_with_rotation
from app.services.prompt_templates import (
    SYSTEM_CONTENT_UNDERSTANDING_INSTRUCTION,
    build_analysis_prompt,
)

logger = logging.getLogger(__name__)


class BaseAIService(ABC):
    """
    Abstract interface for Generative AI content analysis providers.
    Ensures model-agnostic architecture so Gemini can be replaced or augmented later.
    """

    @abstractmethod
    def analyze_document(
        self, pages: List[Dict[str, Any]], filename: str
    ) -> CommonContentRepresentation:
        """
        Analyze page-aware document text and return normalized CommonContentRepresentation.
        """
        pass


class GeminiAIService(BaseAIService):
    """
    Gemini API implementation using the official Google GenAI Python SDK.

    Supports automatic key rotation: when one key hits a quota / rate-limit
    error the service transparently switches to the next configured key so
    requests keep succeeding without manual intervention.
    """

    def __init__(self, api_key: str | None = None, model_name: str | None = None):
        self._rotator: Optional[GeminiKeyRotator] = (
            GeminiKeyRotator([api_key]) if api_key is not None else None
        )
        m_name = model_name or settings.GEMINI_MODEL or "gemini-3.5-flash"
        if m_name in ("gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-2.5-flash", "gemini-flash-latest", "gemini-3.6-flash", "gemini-3.8-flash"):
            m_name = "gemini-3.5-flash"
        self.model_name = m_name

    def analyze_document(
        self, pages: List[Dict[str, Any]], filename: str
    ) -> CommonContentRepresentation:
        # Large Document Guard
        total_chars = sum(len(p.get("text", "")) for p in pages)
        if total_chars > settings.MAX_DOCUMENT_CHARS:
            raise ValueError("Document is larger than the current MVP processing limit.")

        prompt = build_analysis_prompt(pages, filename)

        return call_gemini_with_rotation(
            prompt=prompt,
            system_instruction=SYSTEM_CONTENT_UNDERSTANDING_INSTRUCTION,
            response_schema=CommonContentRepresentation,
            model_name=self.model_name,
            rotator=self._rotator,
            temperature=0.1,
        )

class MockAIService(BaseAIService):
    """
    Deterministic mock AI service for automated unit testing without live API keys.
    """

    def analyze_document(
        self, pages: List[Dict[str, Any]], filename: str
    ) -> CommonContentRepresentation:
        total_pages = len(pages)
        sample_page = pages[0].get("page_number", 1) if pages else 1

        return CommonContentRepresentation(
            document_title=f"Analyzed Content: {filename}",
            document_topic="Enterprise Security & Operational Protocol",
            executive_context=f"Comprehensive analysis of {filename} containing {total_pages} extracted page(s).",
            key_facts=[
                {
                    "fact": f"Document {filename} parsed successfully.",
                    "source_page": sample_page
                }
            ],
            entities=[
                {
                    "name": "NTRO Platform",
                    "type": "System",
                    "source_page": sample_page
                }
            ],
            events=[
                {
                    "description": "Document analysis phase initialized.",
                    "date": "Current Session",
                    "source_page": sample_page
                }
            ],
            key_findings=[
                {
                    "finding": "Source content contains operational procedures and protocol guidelines.",
                    "importance": "High",
                    "source_page": sample_page
                }
            ],
            risks=[
                {
                    "risk": "Unverified external file attachments may compromise data lineage.",
                    "severity": "Medium",
                    "source_page": sample_page
                }
            ],
            recommendations=[
                {
                    "recommendation": "Maintain page-level source references across all transformation outputs.",
                    "priority": "High",
                    "source_page": sample_page
                }
            ],
            important_statistics=[
                {
                    "metric": "Document Extracted Pages",
                    "value": str(total_pages),
                    "context": "Total pages parsed by PyMuPDF/Docx/Txt extractor",
                    "source_page": sample_page
                }
            ],
            source_references=[
                {
                    "page_number": sample_page,
                    "supporting_text": pages[0].get("text", "")[:100] if pages else "Sample text excerpt"
                }
            ]
        )
