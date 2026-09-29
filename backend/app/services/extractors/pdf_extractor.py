from pathlib import Path
from typing import Any, Dict, List
import pymupdf  # PyMuPDF
from app.services.extractors.base_extractor import BaseDocumentExtractor


class PdfExtractor(BaseDocumentExtractor):
    """
    PDF text extractor using PyMuPDF (fitz).
    Extracts text page by page and maintains page-level numbering.
    """

    def extract(self, file_path: Path) -> Dict[str, Any]:
        if not file_path.exists():
            raise FileNotFoundError(f"PDF file not found: {file_path}")

        pages: List[Dict[str, Any]] = []
        full_text_list: List[str] = []

        try:
            doc = pymupdf.open(file_path)
            total_pages = len(doc)

            if total_pages == 0:
                raise ValueError("PDF file contains no pages or is unreadable.")

            for i in range(total_pages):
                page = doc.load_page(i)
                page_text = page.get_text("text") or ""
                cleaned_text = page_text.strip()
                
                pages.append({
                    "page_number": i + 1,
                    "text": cleaned_text
                })
                if cleaned_text:
                    full_text_list.append(cleaned_text)

            doc.close()

        except Exception as err:
            raise ValueError(f"Failed to parse PDF document: {str(err)}")

        full_text = "\n\n".join(full_text_list)
        metrics = self.calculate_metrics(full_text, len(pages))

        return {
            "full_text": full_text,
            "pages": pages,
            "metadata": metrics
        }
