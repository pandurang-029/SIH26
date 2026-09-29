import unittest
import io
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Set env to use MockAIService for test suite
os.environ["USE_MOCK_AI"] = "true"

from fastapi.testclient import TestClient
from app.main import app
from app.services.ai_service import GeminiAIService, MockAIService
from app.schemas.content_representation import CommonContentRepresentation

client = TestClient(app)


class TestGeminiContentAnalysis(unittest.TestCase):

    def test_01_ai_service_missing_api_key(self):
        """Verify GeminiAIService raises clean ValueError when API key is missing."""
        service = GeminiAIService(api_key="")
        pages = [{"page_number": 1, "text": "Sample text"}]
        with self.assertRaises(ValueError) as ctx:
            service.analyze_document(pages, "test.txt")
        self.assertIn("GEMINI_API_KEY environment variable is not configured", str(ctx.exception))

    def test_02_mock_ai_service_structure(self):
        """Verify MockAIService returns valid CommonContentRepresentation."""
        service = MockAIService()
        pages = [{"page_number": 1, "text": "Sample text for grounding"}]
        res = service.analyze_document(pages, "sample.pdf")
        
        self.assertIsInstance(res, CommonContentRepresentation)
        self.assertEqual(res.document_title, "Analyzed Content: sample.pdf")
        self.assertTrue(len(res.key_facts) > 0)
        self.assertEqual(res.key_facts[0].source_page, 1)

    def test_03_analysis_endpoint_success(self):
        """Verify POST /api/documents/{document_id}/analyze returns 200 OK and structured result."""
        # 1. Upload sample text document
        files = {"file": ("advisory_policy.txt", b"NTRO Operational Directive 2026. Security protocols active.", "text/plain")}
        upload_res = client.post("/api/documents/upload", files=files)
        self.assertEqual(upload_res.status_code, 201)
        doc_id = upload_res.json()["document_id"]

        # 2. Analyze document
        analyze_res = client.post(f"/api/documents/{doc_id}/analyze")
        self.assertEqual(analyze_res.status_code, 200)
        data = analyze_res.json()
        
        self.assertIn("document_title", data)
        self.assertIn("key_facts", data)
        self.assertIn("source_references", data)
        self.assertEqual(data["source_references"][0]["page_number"], 1)

    def test_04_analysis_endpoint_missing_doc_id(self):
        """Verify 404 response for invalid document ID."""
        res = client.post("/api/documents/non-existent-doc-uuid/analyze")
        self.assertEqual(res.status_code, 404)
        self.assertIn("not found", res.json()["detail"].lower())

    def test_05_oversized_text_analysis_guard(self):
        """Verify input length guard handles oversized documents gracefully."""
        from app.api.analysis import MAX_ANALYSIS_CHAR_LIMIT
        
        # Create a document larger than MAX_ANALYSIS_CHAR_LIMIT
        large_content = ("A" * (MAX_ANALYSIS_CHAR_LIMIT + 500)).encode("utf-8")
        files = {"file": ("huge_doc.txt", large_content, "text/plain")}
        upload_res = client.post("/api/documents/upload", files=files)
        self.assertEqual(upload_res.status_code, 201)
        doc_id = upload_res.json()["document_id"]

        analyze_res = client.post(f"/api/documents/{doc_id}/analyze")
        self.assertEqual(analyze_res.status_code, 400)
        self.assertIn("Document is larger than", analyze_res.json()["detail"])


if __name__ == "__main__":
    unittest.main()
