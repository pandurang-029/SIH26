import unittest
import io
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Ensure mock mode is enabled for automated unit tests
os.environ["USE_MOCK_AI"] = "true"

from fastapi.testclient import TestClient
from app.main import app
from app.schemas.content_representation import CommonContentRepresentation, SourceReference
from app.schemas.output_schemas import (
    ExecutiveSummaryOutput,
    AdvisoryOutput,
    PresentationOutput,
    PresentationSlide,
    GeneratedOutputsResponse,
)
from app.services.output_service import OutputService

client = TestClient(app)


class TestMultiOutputGeneration(unittest.TestCase):

    def setUp(self):
        self.sample_ccr = CommonContentRepresentation(
            document_title="NTRO Security Protocol Directive",
            document_topic="Cyber Infrastructure Protection",
            executive_context="Comprehensive policy on national infrastructure resilience.",
            key_facts=[
                {"fact": "System parameters upgraded to standard 2.0.", "source_page": 1}
            ],
            entities=[
                {"name": "NTRO Platform", "type": "System", "source_page": 1}
            ],
            events=[
                {"description": "Directive issued.", "date": "2026-09-10", "source_page": 1}
            ],
            key_findings=[
                {"finding": "Network perimeter defenses require continuous monitoring.", "importance": "High", "source_page": 1}
            ],
            risks=[
                {"risk": "Outdated endpoint configurations poses access vulnerabilities.", "severity": "High", "source_page": 1}
            ],
            recommendations=[
                {"recommendation": "Deploy zero-trust authorization on all endpoints.", "priority": "High", "source_page": 1}
            ],
            important_statistics=[
                {"metric": "Uptime Target", "value": "99.99%", "context": "System SLA", "source_page": 1}
            ],
            source_references=[
                {"page_number": 1, "supporting_text": "Operational directive parameters active."}
            ]
        )

    def test_01_executive_summary_schema_validation(self):
        obj = ExecutiveSummaryOutput(
            title="Summary Title",
            executive_summary="Summary body paragraph.",
            key_points=["Point 1", "Point 2"],
            important_statistics=[],
            risks=[],
            recommendations=[],
            source_references=[{"page_number": 1, "supporting_text": "Sample text"}]
        )
        self.assertEqual(obj.title, "Summary Title")
        self.assertEqual(len(obj.key_points), 2)
        self.assertEqual(obj.source_references[0].page_number, 1)

    def test_02_advisory_schema_validation(self):
        obj = AdvisoryOutput(
            title="Advisory Title",
            situation="Situation brief.",
            key_findings=[],
            risk_assessment="Assessment text.",
            recommended_actions=[],
            priority="Critical",
            intended_audience="Senior Leadership",
            source_references=[]
        )
        self.assertEqual(obj.priority, "Critical")
        self.assertEqual(obj.intended_audience, "Senior Leadership")

    def test_03_presentation_schema_validation(self):
        slide = PresentationSlide(
            slide_number=1,
            title="Title Slide",
            key_points=["Bullet 1"],
            speaker_notes="Talking point.",
            source_references=[]
        )
        deck = PresentationOutput(
            title="Deck Title",
            subtitle="Subtitle",
            slides=[slide]
        )
        self.assertEqual(len(deck.slides), 1)
        self.assertEqual(deck.slides[0].title, "Title Slide")

    def test_04_mock_executive_summary_generation(self):
        res = OutputService._generate_mock_executive_summary(self.sample_ccr)
        self.assertIsInstance(res, ExecutiveSummaryOutput)
        self.assertIn("Executive Summary", res.title)
        self.assertTrue(len(res.source_references) > 0)

    def test_05_mock_advisory_generation(self):
        res = OutputService._generate_mock_advisory(self.sample_ccr)
        self.assertIsInstance(res, AdvisoryOutput)
        self.assertEqual(res.priority, "High")

    def test_06_mock_presentation_generation(self):
        res = OutputService._generate_mock_presentation(self.sample_ccr)
        self.assertIsInstance(res, PresentationOutput)
        self.assertEqual(len(res.slides), 4)

    def test_07_api_endpoint_multi_output_generation(self):
        # 1. Upload file
        files = {"file": ("directive.txt", b"NTRO Directive text.", "text/plain")}
        upload_res = client.post("/api/documents/upload", files=files)
        self.assertEqual(upload_res.status_code, 201)
        doc_id = upload_res.json()["document_id"]

        # 2. Generate outputs
        req_body = {
            "output_types": ["executive_summary", "advisory", "presentation"]
        }
        gen_res = client.post(f"/api/documents/{doc_id}/generate", json=req_body)
        self.assertEqual(gen_res.status_code, 200)
        data = gen_res.json()

        self.assertIn("executive_summary", data)
        self.assertIn("advisory", data)
        self.assertIn("presentation", data)
        self.assertIsNotNone(data["executive_summary"])
        self.assertIsNotNone(data["advisory"])
        self.assertIsNotNone(data["presentation"])

    def test_08_missing_ccr_document_id(self):
        req_body = {"output_types": ["executive_summary"]}
        res = client.post("/api/documents/invalid-non-existent-id/generate", json=req_body)
        self.assertEqual(res.status_code, 404)

    def test_09_unsupported_output_type(self):
        # Upload valid doc
        files = {"file": ("test.txt", b"Test content.", "text/plain")}
        upload_res = client.post("/api/documents/upload", files=files)
        doc_id = upload_res.json()["document_id"]

        req_body = {"output_types": ["invalid_unsupported_format"]}
        res = client.post(f"/api/documents/{doc_id}/generate", json=req_body)
        self.assertEqual(res.status_code, 400)
        self.assertIn("Unsupported output type", res.json()["detail"])

    def test_10_empty_output_types_request(self):
        files = {"file": ("test2.txt", b"Test content.", "text/plain")}
        upload_res = client.post("/api/documents/upload", files=files)
        doc_id = upload_res.json()["document_id"]

        req_body = {"output_types": []}
        res = client.post(f"/api/documents/{doc_id}/generate", json=req_body)
        self.assertEqual(res.status_code, 400)

    def test_11_source_page_references_preservation(self):
        files = {"file": ("provenance_doc.txt", b"Source page provenance test.", "text/plain")}
        upload_res = client.post("/api/documents/upload", files=files)
        doc_id = upload_res.json()["document_id"]

        req_body = {"output_types": ["executive_summary", "presentation"]}
        gen_res = client.post(f"/api/documents/{doc_id}/generate", json=req_body)
        self.assertEqual(gen_res.status_code, 200)
        data = gen_res.json()
        
        exec_sum = data["executive_summary"]
        self.assertTrue(len(exec_sum["source_references"]) > 0)
        self.assertEqual(exec_sum["source_references"][0]["page_number"], 1)

    def test_12_no_api_key_leakage(self):
        files = {"file": ("security_test.txt", b"Security check content.", "text/plain")}
        upload_res = client.post("/api/documents/upload", files=files)
        doc_id = upload_res.json()["document_id"]

        req_body = {"output_types": ["advisory"]}
        res = client.post(f"/api/documents/{doc_id}/generate", json=req_body)
        res_text = str(res.json())
        self.assertNotIn("AIza", res_text)
        self.assertNotIn("GEMINI_API_KEY", res_text)


if __name__ == "__main__":
    unittest.main()
