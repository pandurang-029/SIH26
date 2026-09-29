import logging
from typing import Optional
from app.core.config import settings
from app.schemas.content_representation import CommonContentRepresentation
from app.schemas.output_schemas import PresentationOutput, TransformationConfig
from app.services.generators.base_generator import BaseOutputGenerator
from app.services.gemini_rotator import GeminiKeyRotator, call_gemini_with_rotation
from app.services.output_prompts import (
    PRESENTATION_SYSTEM_INSTRUCTION,
    build_presentation_prompt,
)

logger = logging.getLogger(__name__)


class PresentationGenerator(BaseOutputGenerator):
    """
    Generator for Presentation Slide Deck Content Model consuming CCR and TransformationConfig.
    Uses automatic Gemini API key rotation when quota/429 limits are hit.
    """

    def __init__(self, api_key: str | None = None, model_name: str | None = None):
        self._rotator: Optional[GeminiKeyRotator] = (
            GeminiKeyRotator([api_key]) if api_key else None
        )
        m_name = model_name or settings.GEMINI_MODEL or "gemini-3.5-flash"
        if m_name in ("gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-2.5-flash", "gemini-flash-latest", "gemini-3.6-flash", "gemini-3.8-flash"):
            m_name = "gemini-3.5-flash"
        self.model_name = m_name

    def generate(
        self, ccr: CommonContentRepresentation, config: Optional[TransformationConfig] = None
    ) -> PresentationOutput:
        cfg = config or TransformationConfig()
        prompt = build_presentation_prompt(ccr, cfg)

        try:
            return call_gemini_with_rotation(
                prompt=prompt,
                system_instruction=PRESENTATION_SYSTEM_INSTRUCTION,
                response_schema=PresentationOutput,
                model_name=self.model_name,
                rotator=self._rotator,
                temperature=0.1,
            )
        except Exception as err:
            logger.error("Presentation Generation error: %s", err, exc_info=False)
            raise ValueError(f"Presentation generation failed: {str(err)}")

