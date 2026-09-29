from pathlib import Path
from typing import Any, Dict, List
import zipfile
import xml.etree.ElementTree as ET

try:
    import docx
except ImportError:
    docx = None

from app.services.extractors.base_extractor import BaseDocumentExtractor


class DocxExtractor(BaseDocumentExtractor):
    """
    DOCX text extractor using python-docx with zipfile fallback.
    Extracts paragraphs and tables text, maintaining document structure.
    """

    def extract(self, file_path: Path) -> Dict[str, Any]:
        if not file_path.exists():
            raise FileNotFoundError(f"DOCX file not found: {file_path}")

        extracted_chunks: List[str] = []

        if docx is not None:
            try:
                doc = docx.Document(file_path)

                # Extract paragraphs
                for p in doc.paragraphs:
                    text = p.text.strip()
                    if text:
                        extracted_chunks.append(text)

                # Extract tables text where present
                for table in doc.tables:
                    for row in table.rows:
                        row_texts = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                        if row_texts:
                            extracted_chunks.append(" | ".join(row_texts))
            except Exception:
                extracted_chunks = self._extract_via_zipfile(file_path)
        else:
            extracted_chunks = self._extract_via_zipfile(file_path)

        full_text = "\n\n".join(extracted_chunks)
        
        # DOCX documents are treated as 1 logical document page
        pages = [
            {
                "page_number": 1,
                "text": full_text
            }
        ]
        
        metrics = self.calculate_metrics(full_text, 1)

        return {
            "full_text": full_text,
            "pages": pages,
            "metadata": metrics
        }

    def _extract_via_zipfile(self, file_path: Path) -> List[str]:
        chunks: List[str] = []
        try:
            with zipfile.ZipFile(file_path, "r") as z:
                if "word/document.xml" not in z.namelist():
                    return chunks
                xml_content = z.read("word/document.xml")
                tree = ET.fromstring(xml_content)
                for elem in tree.iter():
                    tag = elem.tag.split("}")[-1] if "}" in elem.tag else elem.tag
                    if tag == "p":
                        texts = [node.text for node in elem.iter() if (node.tag.split("}")[-1] if "}" in node.tag else node.tag) == "t" and node.text]
                        if texts:
                            t_str = "".join(texts).strip()
                            if t_str:
                                chunks.append(t_str)
                    elif tag == "tr":
                        row_texts = []
                        for tc in elem:
                            tc_tag = tc.tag.split("}")[-1] if "}" in tc.tag else tc.tag
                            if tc_tag == "tc":
                                c_texts = [node.text for node in tc.iter() if (node.tag.split("}")[-1] if "}" in node.tag else node.tag) == "t" and node.text]
                                if c_texts:
                                    row_texts.append("".join(c_texts).strip())
                        if row_texts:
                            chunks.append(" | ".join(row_texts))
        except Exception:
            pass
        return chunks
