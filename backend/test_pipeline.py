import unittest
import io
import os
import sys
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

import pymupdf  # PyMuPDF
import zipfile
try:
    import docx
except ImportError:
    docx = None
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)


def create_sample_pdf() -> bytes:
    """Create a minimal 2-page valid PDF document in memory."""
    doc = pymupdf.open()
    
    # Page 1
    page1 = doc.new_page()
    page1.insert_text((50, 50), "NTRO GenAI Security Advisory Header - Page 1 content")
    
    # Page 2
    page2 = doc.new_page()
    page2.insert_text((50, 50), "Technical Annex & Recommendations - Page 2 content")
    
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def create_sample_docx() -> bytes:
    """Create a minimal valid DOCX document in memory."""
    if docx is not None:
        doc = docx.Document()
        doc.add_heading("Executive Summary Document", level=1)
        doc.add_paragraph("This is paragraph 1 detailing operational parameters.")
        doc.add_paragraph("This is paragraph 2 containing technical specifications.")
        
        # Add a sample table
        table = doc.add_table(rows=2, cols=2)
        table.cell(0, 0).text = "Param"
        table.cell(0, 1).text = "Value"
        table.cell(1, 0).text = "Status"
        table.cell(1, 1).text = "Active"
        
        buffer = io.BytesIO()
        doc.save(buffer)
        return buffer.getvalue()
    else:
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as z:
            z.writestr('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>')
            z.writestr('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>')
            z.writestr('word/document.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Executive Summary Document</w:t></w:r></w:p><w:p><w:r><w:t>This is paragraph 1 detailing operational parameters.</w:t></w:r></w:p><w:p><w:r><w:t>This is paragraph 2 containing technical specifications.</w:t></w:r></w:p><w:tbl><w:tr><w:tc><w:p><w:r><w:t>Param</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Value</w:t></w:r></w:p></w:tc></w:tr><w:tr><w:tc><w:p><w:r><w:t>Status</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Active</w:t></w:r></w:p></w:tc></w:tr></w:tbl></w:body></w:document>')
        return buffer.getvalue()


def create_sample_txt() -> bytes:
    """Create a minimal valid TXT document in memory."""
    content = "NTRO Content Transformation Platform\nLine 2: Confidential Briefing Document."
    return content.encode("utf-8")


class TestDocumentUploadAndExtraction(unittest.TestCase):

    def test_01_valid_txt_upload_and_extraction(self):
        txt_bytes = create_sample_txt()
        files = {"file": ("test_briefing.txt", txt_bytes, "text/plain")}
        
        # 1. Upload
        res = client.post("/api/documents/upload", files=files)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertIn("document_id", data)
        self.assertEqual(data["filename"], "test_briefing.txt")
        self.assertEqual(data["file_type"], "txt")
        
        doc_id = data["document_id"]
        
        # 2. Extract
        ext_res = client.post(f"/api/documents/{doc_id}/extract")
        self.assertEqual(ext_res.status_code, 200)
        ext_data = ext_res.json()
        self.assertIn("Confidential Briefing Document", ext_data["full_text"])
        self.assertEqual(ext_data["metadata"]["total_pages"], 1)

    def test_02_valid_pdf_upload_and_extraction(self):
        pdf_bytes = create_sample_pdf()
        files = {"file": ("advisory_report.pdf", pdf_bytes, "application/pdf")}
        
        # 1. Upload
        res = client.post("/api/documents/upload", files=files)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        doc_id = data["document_id"]
        self.assertEqual(data["file_type"], "pdf")
        
        # 2. Extract Page-by-Page
        ext_res = client.post(f"/api/documents/{doc_id}/extract")
        self.assertEqual(ext_res.status_code, 200)
        ext_data = ext_res.json()
        self.assertEqual(len(ext_data["pages"]), 2)
        self.assertIn("Page 1 content", ext_data["pages"][0]["text"])
        self.assertIn("Page 2 content", ext_data["pages"][1]["text"])
        self.assertEqual(ext_data["metadata"]["total_pages"], 2)

    def test_03_valid_docx_upload_and_extraction(self):
        docx_bytes = create_sample_docx()
        files = {"file": ("spec_doc.docx", docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
        
        # 1. Upload
        res = client.post("/api/documents/upload", files=files)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        doc_id = data["document_id"]
        self.assertEqual(data["file_type"], "docx")
        
        # 2. Extract
        ext_res = client.post(f"/api/documents/{doc_id}/extract")
        self.assertEqual(ext_res.status_code, 200)
        ext_data = ext_res.json()
        self.assertIn("Executive Summary Document", ext_data["full_text"])
        self.assertIn("Param | Value", ext_data["full_text"])

    def test_04_unsupported_file_extension(self):
        files = {"file": ("malicious_script.exe", b"MZBinaryExecData", "application/octet-stream")}
        res = client.post("/api/documents/upload", files=files)
        self.assertEqual(res.status_code, 400)
        self.assertIn("Unsupported file format", res.json()["detail"])

    def test_05_empty_file_upload(self):
        files = {"file": ("empty.txt", b"", "text/plain")}
        res = client.post("/api/documents/upload", files=files)
        self.assertEqual(res.status_code, 400)
        self.assertIn("empty", res.json()["detail"].lower())

    def test_06_oversized_file_upload(self):
        # Create bytes larger than limit
        large_bytes = b"X" * (settings.max_upload_size_bytes() + 1024)
        files = {"file": ("large_doc.txt", large_bytes, "text/plain")}
        res = client.post("/api/documents/upload", files=files)
        self.assertEqual(res.status_code, 400)
        self.assertIn("exceeds maximum allowed limit", res.json()["detail"].lower())

    def test_07_missing_document_id_extraction(self):
        res = client.post("/api/documents/invalid-uuid-99999/extract")
        self.assertEqual(res.status_code, 404)
        self.assertIn("not found", res.json()["detail"].lower())

    def test_08_corrupted_pdf_document_extraction(self):
        # Create corrupted fake pdf file
        corrupted_bytes = b"%PDF-1.4 Fake corrupted data junk"
        files = {"file": ("corrupted.pdf", corrupted_bytes, "application/pdf")}
        upload_res = client.post("/api/documents/upload", files=files)
        self.assertEqual(upload_res.status_code, 201)
        doc_id = upload_res.json()["document_id"]

        ext_res = client.post(f"/api/documents/{doc_id}/extract")
        self.assertEqual(ext_res.status_code, 422)
        self.assertIn("Failed to parse PDF document", ext_res.json()["detail"])


if __name__ == "__main__":
    unittest.main()
