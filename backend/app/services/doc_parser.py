"""
Document Parser Stub: Architecture place-holder for PyMuPDF (PDF), python-docx (DOCX), and TXT extractors.
"""

class DocumentParser:
    @staticmethod
    def parse_pdf(file_bytes: bytes) -> str:
        raise NotImplementedError("PDF parsing with PyMuPDF will be implemented in subsequent phase.")

    @staticmethod
    def parse_docx(file_bytes: bytes) -> str:
        raise NotImplementedError("DOCX parsing with python-docx will be implemented in subsequent phase.")

    @staticmethod
    def parse_txt(file_bytes: bytes) -> str:
        return file_bytes.decode("utf-8", errors="ignore")
