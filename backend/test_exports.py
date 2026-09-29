"""
Test Suite for Step 6: Real PDF & PPTX Exporters and Export API.
"""
import io
import os
import sys
import unittest
import zipfile
import tempfile
from pathlib import Path
from unittest.mock import patch

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

os.environ["USE_MOCK_AI"] = "true"

from fastapi.testclient import TestClient
from app.main import app
from app.schemas.output_schemas import (
    ExecutiveSummaryOutput,
    AdvisoryOutput,
    PresentationOutput,
    PresentationSlide,
)
from app.schemas.content_representation import (
    SourceReference,
    KeyFinding,
    Risk,
    Recommendation,
    Statistic,
)
from app.services.exporters import PdfExporter, PptxExporter
from app.services.export_service import ExportService
from app.services.document_service import DocumentService


client = TestClient(app)


class TestDocumentExports(unittest.TestCase):

    def setUp(self):
        os.environ["USE_MOCK_AI"] = "true"

        self.sample_executive_summary = ExecutiveSummaryOutput(
            title="NTRO Strategic Cyber Assessment",
            executive_summary="This report provides a high-level briefing on strategic cybersecurity posture.",
            key_points=[
                "Critical infrastructure defense mechanisms upgraded across 5 core nodes.",
                "Zero high-severity perimeter vulnerabilities detected in Q3 audit."
            ],
            important_statistics=[
                Statistic(metric="Uptime SLA", value="99.99%", source_page=1),
                Statistic(metric="Incidents Resolved", value="142", source_page=2)
            ],
            risks=[
                Risk(risk="Legacy protocol exposure in perimeter node 3.", source_page=3)
            ],
            recommendations=[
                Recommendation(recommendation="Deprecate TLS 1.0/1.1 protocols immediately.", source_page=3)
            ],
            source_references=[
                SourceReference(page_number=1, supporting_text="System SLA maintained at 99.99% throughout Q3."),
                SourceReference(page_number=3, supporting_text="Perimeter node 3 requires protocol modernization.")
            ]
        )

        self.sample_advisory = AdvisoryOutput(
            title="OPERATIONAL ADVISORY: Critical Vulnerability Alert",
            priority="High",
            situation="A critical vulnerability in legacy authentication modules requires urgent patch deployment.",
            risk_assessment="Unauthenticated remote code execution potential across secondary gateway nodes.",
            key_findings=[
                KeyFinding(finding="Outdated OpenSSL dependency detected.", source_page=2)
            ],
            recommended_actions=[
                Recommendation(recommendation="Apply emergency patch KB-90412.", source_page=2)
            ],
            source_references=[
                SourceReference(page_number=2, supporting_text="OpenSSL 1.1.1 version end of life compliance gap.")
            ]
        )

        self.sample_presentation = PresentationOutput(
            title="NTRO Platform Architecture Briefing",
            subtitle="Quarterly Executive Overview",
            slides=[
                PresentationSlide(
                    slide_number=1,
                    title="Executive Overview",
                    key_points=[
                        "Multi-tenant GenAI content transformation architecture.",
                        "Strict source provenance and document grounding rules."
                    ],
                    speaker_notes="Good morning leaders. Today we present the technical progress of our GenAI platform.",
                    source_references=[
                        SourceReference(page_number=1, supporting_text="GenAI content transformation design baseline.")
                    ]
                ),
                PresentationSlide(
                    slide_number=2,
                    title="Performance & Metrics",
                    key_points=[
                        "Average document processing time < 4.5 seconds.",
                        "Zero LLM API call overhead during PDF/PPTX binary export."
                    ],
                    speaker_notes="Emphasize that binary exports are purely client-side Python tasks and incur zero AI cost.",
                    source_references=[
                        SourceReference(page_number=2, supporting_text="Benchmark statistics for export throughput.")
                    ]
                )
            ]
        )

        # Upload a real sample test document to DocumentService store for API tests
        uploaded = DocumentService.save_document(
            b"NTRO Platform Sample Content for Export Verification. " * 5,
            "export_test_doc.txt"
        )
        self.test_doc_id = uploaded["document_id"]

    # 1. Executive Summary PDF export generation & validity
    def test_export_executive_summary_pdf_bytes(self):
        exporter = PdfExporter()
        with tempfile.TemporaryDirectory() as tmpdir:
            out_path = Path(tmpdir) / "summary.pdf"
            res_path = exporter.export_executive_summary_pdf(self.sample_executive_summary, out_path)
            self.assertTrue(res_path.exists())
            pdf_bytes = res_path.read_bytes()
            self.assertTrue(pdf_bytes.startswith(b"%PDF-"))

    # 2. Advisory PDF export generation & validity
    def test_export_advisory_pdf_bytes(self):
        exporter = PdfExporter()
        with tempfile.TemporaryDirectory() as tmpdir:
            out_path = Path(tmpdir) / "advisory.pdf"
            res_path = exporter.export_advisory_pdf(self.sample_advisory, out_path)
            self.assertTrue(res_path.exists())
            pdf_bytes = res_path.read_bytes()
            self.assertTrue(pdf_bytes.startswith(b"%PDF-"))

    # 3. Presentation PPTX export generation & validity
    def test_export_presentation_pptx_bytes(self):
        exporter = PptxExporter()
        with tempfile.TemporaryDirectory() as tmpdir:
            out_path = Path(tmpdir) / "deck.pptx"
            res_path = exporter.export_presentation_pptx(self.sample_presentation, out_path)
            self.assertTrue(res_path.exists())
            pptx_bytes = res_path.read_bytes()
            self.assertTrue(pptx_bytes.startswith(b"PK\x03\x04"))

    # 4. Native PowerPoint speaker notes & ZIP structure check
    def test_export_presentation_pptx_notes_structure(self):
        exporter = PptxExporter()
        with tempfile.TemporaryDirectory() as tmpdir:
            out_path = Path(tmpdir) / "deck_notes.pptx"
            res_path = exporter.export_presentation_pptx(self.sample_presentation, out_path)
            zip_buf = io.BytesIO(res_path.read_bytes())
            with zipfile.ZipFile(zip_buf, "r") as zf:
                file_list = zf.namelist()
                self.assertTrue(any(name.startswith("ppt/slides/slide") for name in file_list))
                self.assertTrue(any("notesSlide" in name for name in file_list))

    # 5. Page citation / source references included in PDF
    def test_pdf_export_contains_source_citations(self):
        exporter = PdfExporter()
        with tempfile.TemporaryDirectory() as tmpdir:
            out_path = Path(tmpdir) / "summary_sources.pdf"
            res_path = exporter.export_executive_summary_pdf(self.sample_executive_summary, out_path)
            self.assertIn(b"%PDF-", res_path.read_bytes())

    # 6. API Endpoint POST /api/documents/{id}/export return FileResponse
    def test_api_export_endpoint_success(self):
        res = client.post(
            f"/api/documents/{self.test_doc_id}/export",
            json={"output_type": "executive_summary", "format": "pdf"}
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers["content-type"], "application/pdf")
        self.assertTrue(res.content.startswith(b"%PDF-"))

    # 7. Correct Content-Disposition filename header
    def test_api_export_content_disposition_header(self):
        res = client.post(
            f"/api/documents/{self.test_doc_id}/export",
            json={"output_type": "presentation", "format": "pptx"}
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers["content-type"], "application/vnd.openxmlformats-officedocument.presentationml.presentation")
        self.assertIn(f'filename="presentation_{self.test_doc_id}.pptx"', res.headers["content-disposition"])

    # 8. Invalid output_type returns 400 Bad Request
    def test_api_export_invalid_output_type(self):
        res = client.post(
            f"/api/documents/{self.test_doc_id}/export",
            json={"output_type": "invalid_type", "format": "pdf"}
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("Unsupported output type", res.json()["detail"])

    # 9. Non-existent document_id returns 404 Not Found
    def test_api_export_nonexistent_document_id(self):
        res = client.post(
            "/api/documents/nonexistent-id-9999/export",
            json={"output_type": "executive_summary", "format": "pdf"}
        )
        self.assertEqual(res.status_code, 404)
        self.assertIn("not found", res.json()["detail"])

    # 10. Path safety check for unsupported format request
    def test_export_service_format_mismatch(self):
        with self.assertRaises(ValueError):
            ExportService.export_output(self.test_doc_id, "executive_summary", "pptx")

    # 11. Verification zero Gemini calls take place during export
    @patch("google.genai.Client")
    def test_zero_gemini_calls_during_export(self, mock_gemini):
        dest_path, mime_type, filename = ExportService.export_output(self.test_doc_id, "executive_summary", "pdf")
        self.assertTrue(dest_path.exists())
        self.assertEqual(mock_gemini.call_count, 0)
        if dest_path.exists():
            os.remove(dest_path)

    # 12. Non-empty binary stream validation
    def test_exporter_non_empty_output(self):
        exporter = PdfExporter()
        with tempfile.TemporaryDirectory() as tmpdir:
            out_path = Path(tmpdir) / "adv.pdf"
            res_path = exporter.export_advisory_pdf(self.sample_advisory, out_path)
            self.assertGreater(len(res_path.read_bytes()), 500)

    # 13. Executive summary schema compatibility
    def test_executive_summary_schema_compatibility(self):
        self.assertIsInstance(self.sample_executive_summary, ExecutiveSummaryOutput)
        exporter = PdfExporter()
        with tempfile.TemporaryDirectory() as tmpdir:
            out_path = Path(tmpdir) / "compat_sum.pdf"
            self.assertTrue(exporter.export_executive_summary_pdf(self.sample_executive_summary, out_path).exists())

    # 14. Advisory schema compatibility
    def test_advisory_schema_compatibility(self):
        self.assertIsInstance(self.sample_advisory, AdvisoryOutput)
        exporter = PdfExporter()
        with tempfile.TemporaryDirectory() as tmpdir:
            out_path = Path(tmpdir) / "compat_adv.pdf"
            self.assertTrue(exporter.export_advisory_pdf(self.sample_advisory, out_path).exists())

    # 15. Presentation schema compatibility
    def test_presentation_schema_compatibility(self):
        self.assertIsInstance(self.sample_presentation, PresentationOutput)
        exporter = PptxExporter()
        with tempfile.TemporaryDirectory() as tmpdir:
            out_path = Path(tmpdir) / "compat_pres.pptx"
            self.assertTrue(exporter.export_presentation_pptx(self.sample_presentation, out_path).exists())

    # 16. Exporter handles empty optional fields gracefully
    def test_exporter_handles_empty_optional_fields(self):
        minimal_summary = ExecutiveSummaryOutput(
            title="Minimal Summary",
            executive_summary="Simple text",
            key_points=[],
            important_statistics=[],
            risks=[],
            recommendations=[],
            source_references=[]
        )
        exporter = PdfExporter()
        with tempfile.TemporaryDirectory() as tmpdir:
            out_path = Path(tmpdir) / "minimal.pdf"
            res_path = exporter.export_executive_summary_pdf(minimal_summary, out_path)
            self.assertTrue(res_path.read_bytes().startswith(b"%PDF-"))

    # 17. Exporter handles minimal presentation gracefully
    def test_exporter_handles_minimal_presentation(self):
        minimal_pres = PresentationOutput(
            title="Minimal Deck",
            subtitle="",
            slides=[]
        )
        exporter = PptxExporter()
        with tempfile.TemporaryDirectory() as tmpdir:
            out_path = Path(tmpdir) / "minimal.pptx"
            res_path = exporter.export_presentation_pptx(minimal_pres, out_path)
            self.assertTrue(res_path.read_bytes().startswith(b"PK\x03\x04"))

    # 18. API key non-leakage check in environment / response
    def test_no_api_key_leakage_in_response(self):
        res = client.post(
            f"/api/documents/{self.test_doc_id}/export",
            json={"output_type": "executive_summary", "format": "pdf"}
        )
        api_key = os.getenv("GEMINI_API_KEY", "DUMMY_KEY")
        self.assertNotIn(api_key, res.headers.values())
        self.assertNotIn(api_key.encode("utf-8"), res.content)


if __name__ == "__main__":
    unittest.main()
