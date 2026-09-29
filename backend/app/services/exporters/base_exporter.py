from abc import ABC, abstractmethod
from pathlib import Path
from pydantic import BaseModel


class BaseDocumentExporter(ABC):
    """
    Abstract interface for document file exporters (PDF & PPTX).
    Exporters consume validated Step 5 Pydantic output models and render physical files.
    Exporters NEVER invoke Gemini APIs or regenerate content.
    """

    @abstractmethod
    def export(self, output_model: BaseModel, destination_path: Path) -> Path:
        """
        Render validated output model to destination file path.
        """
        pass
