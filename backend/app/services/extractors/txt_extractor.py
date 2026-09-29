from pathlib import Path
from typing import Any, Dict
from app.services.extractors.base_extractor import BaseDocumentExtractor


class TxtExtractor(BaseDocumentExtractor):
    """
    Plain text (TXT) extractor using Python standard library.
    Handles UTF-8 and Latin-1 fallback decodings.
    """

    def extract(self, file_path: Path) -> Dict[str, Any]:
        if not file_path.exists():
            raise FileNotFoundError(f"TXT file not found: {file_path}")

        full_text = ""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                full_text = f.read()
        except UnicodeDecodeError:
            try:
                with open(file_path, "r", encoding="latin-1") as f:
                    full_text = f.read()
            except Exception as err:
                raise ValueError(f"Failed to read text document encoding: {str(err)}")
        except Exception as err:
            raise ValueError(f"Failed to read TXT document: {str(err)}")

        cleaned_text = full_text.strip()
        pages = [
            {
                "page_number": 1,
                "text": cleaned_text
            }
        ]
        metrics = self.calculate_metrics(cleaned_text, 1)

        return {
            "full_text": cleaned_text,
            "pages": pages,
            "metadata": metrics
        }
