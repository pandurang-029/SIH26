from abc import ABC, abstractmethod
from typing import Optional
from pydantic import BaseModel
from app.schemas.content_representation import CommonContentRepresentation
from app.schemas.output_schemas import TransformationConfig


class BaseOutputGenerator(ABC):
    """
    Abstract interface for output generators consuming CommonContentRepresentation (CCR).
    """

    @abstractmethod
    def generate(
        self, ccr: CommonContentRepresentation, config: Optional[TransformationConfig] = None
    ) -> BaseModel:
        """
        Generate validated output model from CCR single source of truth.
        """
        pass
