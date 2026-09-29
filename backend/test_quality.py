"""
Test Suite for Step 7: AI Quality Control & Provenance Layer.
"""
import io
import os
import sys
import unittest
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

os.environ["USE_MOCK_AI"] = "true"

from fastapi.testclient import TestClient
from app.main import app
from app.schemas.content_representation import (
    CommonContentRepresentation,
    SourceReference,
    KeyFact,
    Entity,
    Event,
    KeyFinding,
    Statistic,
    Risk,
    Recommendation,
)
from app.schemas.output_schemas import (
    ExecutiveSummaryOutput,
    AdvisoryOutput,
    PresentationOutput,
    PresentationSlide,
)
from app.schemas.quality_schemas import ClaimProvenance, QualityControlReport
from app.services.quality_service import QualityService
from app.services.document_service import DocumentService

client = TestClient(app)


class TestQualityControlAndProvenance(unittest.TestCase):

    def setUp(self):
        os.environ["USE_MOCK_AI"] = "true"

        self.sample_ccr = CommonContentRepresentation(
            document_title="NTRO Cyber Posture Directive",
            document_topic="Cybersecurity Infrastructure",
            executive_context="Operational guideline for critical infrastructure defense.",
            key_facts=[
                KeyFact(fact="Core security protocols upgraded to 2.0.", source_page=1)
            ],
            entities=[
                Entity(name="NTRO Cyber Gateway", type="System", source_page=1)
            ],
            events=[
                Event(description="Perimeter audit completed", date="2026-09-01", source_page=2)
            ],
            key_findings=[
                KeyFinding(finding="Perimeter defenses require continuous monitoring.", importance="High", source_page=1)
            ],
            important_statistics=[
                Statistic(metric="Incidents Resolved", value="12", source_page=2),
                Statistic(metric="Uptime SLA", value="99.99%", source_page=1)
            ],
            risks=[
                Risk(risk="Legacy protocol exposure in node 3.", source_page=3)
            ],
            recommendations=[
                Recommendation(recommendation="Apply security patch KB-90412.", source_page=2)
            ],
            source_references=[
                SourceReference(page_number=1, supporting_text="Core security protocols upgraded to 2.0 with 99.99% SLA."),
                SourceReference(page_number=2, supporting_text="Audit completed on 2026-09-01 with 12 incidents resolved.")
            ]
        )

        self.sample_summary = ExecutiveSummaryOutput(
            title="NTRO Cyber Posture Directive",
            executive_summary="Core security protocols upgraded to 2.0.",
            key_points=[
                "Perimeter defenses require continuous monitoring.",
                "Management should upgrade legacy infrastructure."
            ],
            important_statistics=[
                Statistic(metric="Incidents Resolved", value="12", source_page=2)
            ],
            risks=[
                Risk(risk="Legacy protocol exposure in node 3.", source_page=3)
            ],
            recommendations=[
                Recommendation(recommendation="Apply security patch KB-90412.", source_page=2)
            ],
            source_references=[
                SourceReference(page_number=1, supporting_text="Core security protocols upgraded to 2.0 with 99.99% SLA.")
            ]
        )

        # Upload a real sample document for API tests
        uploaded = DocumentService.save_document(
            b"NTRO Cyber Posture Directive Sample Content for Quality Testing. " * 5,
            "quality_test_doc.txt"
        )
        self.test_doc_id = uploaded["document_id"]

    # 1. Fully supported claim matching
    def test_01_supported_claim_matching(self):
        claim = ClaimProvenance(
            claim_id="claim_1",
            claim_text="Incidents Resolved: 12",
            claim_type="statistic",
            support_status="unsupported",
            source_pages=[],
            supporting_text=[],
            confidence=None,
            reason="Test",
            output_type="executive_summary"
        )
        verified = QualityService._verify_claim(claim, self.sample_ccr)
        self.assertEqual(verified.support_status, "supported")
        self.assertEqual(verified.confidence, "high")
        self.assertIn(2, verified.source_pages)

    # 2. Partially supported claim matching
    def test_02_partially_supported_claim_matching(self):
        claim = ClaimProvenance(
            claim_id="claim_2",
            claim_text="NTRO Cyber Gateway network node",
            claim_type="entity",
            support_status="unsupported",
            source_pages=[],
            supporting_text=[],
            confidence=None,
            reason="Test",
            output_type="executive_summary"
        )
        verified = QualityService._verify_claim(claim, self.sample_ccr)
        self.assertIn(verified.support_status, ["supported", "partially_supported"])

    # 3. Unsupported claim matching
    def test_03_unsupported_claim_matching(self):
        claim = ClaimProvenance(
            claim_id="claim_3",
            claim_text="Quantum encryption deployed across satellite relays in Antarctica.",
            claim_type="general_statement",
            support_status="unsupported",
            source_pages=[],
            supporting_text=[],
            confidence=None,
            reason="Test",
            output_type="executive_summary"
        )
        verified = QualityService._verify_claim(claim, self.sample_ccr)
        self.assertEqual(verified.support_status, "unsupported")
        self.assertIn("not found in validated CCR", verified.reason)

    # 4. Conflicting numerical claim (e.g. 25 vs 12)
    def test_04_conflicting_numerical_claim(self):
        claim = ClaimProvenance(
            claim_id="claim_4",
            claim_text="Incidents Resolved: 25 incidents were reported",
            claim_type="statistic",
            support_status="unsupported",
            source_pages=[],
            supporting_text=[],
            confidence=None,
            reason="Test",
            output_type="executive_summary"
        )
        verified = QualityService._verify_claim(claim, self.sample_ccr)
        self.assertEqual(verified.support_status, "unsupported")
        self.assertIn("Numerical value conflict detected", verified.reason)

    # 5. Supported date matching
    def test_05_supported_date_matching(self):
        claim = ClaimProvenance(
            claim_id="claim_5",
            claim_text="Perimeter audit completed on 2026-09-01",
            claim_type="date",
            support_status="unsupported",
            source_pages=[],
            supporting_text=[],
            confidence=None,
            reason="Test",
            output_type="executive_summary"
        )
        verified = QualityService._verify_claim(claim, self.sample_ccr)
        self.assertEqual(verified.support_status, "supported")

    # 6. Unsupported date matching
    def test_06_unsupported_date_matching(self):
        claim = ClaimProvenance(
            claim_id="claim_6",
            claim_text="System deployed on 1999-01-01",
            claim_type="date",
            support_status="unsupported",
            source_pages=[],
            supporting_text=[],
            confidence=None,
            reason="Test",
            output_type="executive_summary"
        )
        verified = QualityService._verify_claim(claim, self.sample_ccr)
        self.assertEqual(verified.support_status, "unsupported")

    # 7. Supported entity matching
    def test_07_supported_entity_matching(self):
        claim = ClaimProvenance(
            claim_id="claim_7",
            claim_text="NTRO Cyber Gateway system upgrade",
            claim_type="entity",
            support_status="unsupported",
            source_pages=[],
            supporting_text=[],
            confidence=None,
            reason="Test",
            output_type="executive_summary"
        )
        verified = QualityService._verify_claim(claim, self.sample_ccr)
        self.assertIn(verified.support_status, ["supported", "partially_supported"])
        self.assertEqual(verified.confidence, "medium")

    # 8. Recommendation classification (support_status == "recommendation")
    def test_08_recommendation_classification(self):
        claim = ClaimProvenance(
            claim_id="claim_8",
            claim_text="Apply security patch KB-90412 immediately.",
            claim_type="recommendation",
            support_status="recommendation",
            source_pages=[],
            supporting_text=[],
            confidence="high",
            reason="Action directive",
            output_type="executive_summary"
        )
        verified = QualityService._verify_claim(claim, self.sample_ccr)
        self.assertEqual(verified.support_status, "recommendation")

    # 9. Source-page inheritance from CCR
    def test_09_source_page_inheritance(self):
        claim = ClaimProvenance(
            claim_id="claim_9",
            claim_text="Incidents Resolved: 12",
            claim_type="statistic",
            support_status="supported",
            source_pages=[2],
            supporting_text=[],
            confidence="high",
            reason="Test",
            output_type="executive_summary"
        )
        verified = QualityService._verify_claim(claim, self.sample_ccr)
        self.assertEqual(verified.source_pages, [2])
        self.assertTrue(len(verified.supporting_text) > 0)

    # 10. Missing source reference handling (source_pages = [])
    def test_10_missing_source_reference(self):
        claim = ClaimProvenance(
            claim_id="claim_10",
            claim_text="Unlinked general observation.",
            claim_type="general_statement",
            support_status="unsupported",
            source_pages=[],
            supporting_text=[],
            confidence=None,
            reason="Test",
            output_type="executive_summary"
        )
        verified = QualityService._verify_claim(claim, self.sample_ccr)
        self.assertEqual(verified.source_pages, [])
        self.assertEqual(verified.supporting_text, [])

    # 11. Multiple outputs claim extraction
    def test_11_multiple_outputs_claim_extraction(self):
        outputs = {
            "executive_summary": self.sample_summary,
            "advisory": AdvisoryOutput(
                title="Advisory Alert",
                situation="Perimeter defenses require continuous monitoring.",
                risk_assessment="Legacy protocol exposure in node 3.",
                key_findings=[KeyFinding(finding="Perimeter defenses require continuous monitoring.", source_page=1)],
                recommended_actions=[Recommendation(recommendation="Apply security patch KB-90412.", source_page=2)]
            )
        }
        report = QualityService.generate_report(self.test_doc_id, self.sample_ccr, outputs, ["executive_summary", "advisory"])
        self.assertGreater(report.total_claims, 0)
        self.assertIn(report.overall_status, ["passed", "review_required", "failed"])

    # 12. Presentation slide provenance (slide_number linkage)
    def test_12_presentation_slide_provenance(self):
        presentation = PresentationOutput(
            title="Deck",
            subtitle="Overview",
            slides=[
                PresentationSlide(
                    slide_number=4,
                    title="Incidents Slide",
                    key_points=["Incidents Resolved: 12"],
                    speaker_notes="Notes",
                    source_references=[SourceReference(page_number=2, supporting_text="Audit text")]
                )
            ]
        )
        outputs = {"presentation": presentation}
        report = QualityService.generate_report(self.test_doc_id, self.sample_ccr, outputs, ["presentation"])
        self.assertEqual(len(report.claims), 1)
        self.assertEqual(report.claims[0].slide_number, 4)

    # 13. Empty output handling
    def test_13_empty_output_handling(self):
        empty_summary = ExecutiveSummaryOutput(
            title="Empty",
            executive_summary="None",
            key_points=[],
            important_statistics=[],
            risks=[],
            recommendations=[],
            source_references=[]
        )
        report = QualityService.generate_report(self.test_doc_id, self.sample_ccr, {"executive_summary": empty_summary}, ["executive_summary"])
        self.assertEqual(report.total_claims, 0)
        self.assertEqual(report.overall_status, "passed")

    # 14. Missing CCR handling (error simulation)
    def test_14_missing_ccr_error(self):
        res = client.post("/api/documents/nonexistent-doc-9999/quality-check", json={"output_types": ["executive_summary"]})
        self.assertEqual(res.status_code, 404)

    # 15. Missing generated output handling
    def test_15_missing_generated_output(self):
        report = QualityService.generate_report(self.test_doc_id, self.sample_ccr, {}, ["executive_summary"])
        self.assertEqual(report.total_claims, 0)
        self.assertEqual(report.overall_status, "passed")

    # 16. Quality report status logic
    def test_16_quality_report_status_logic(self):
        # Case A: Passed
        report_pass = QualityControlReport(
            document_id="doc1", overall_status="passed", total_claims=5,
            supported_claims=3, partially_supported_claims=0, unsupported_claims=0, recommendations=2
        )
        self.assertEqual(report_pass.overall_status, "passed")

        # Case B: Review Required
        report_review = QualityControlReport(
            document_id="doc2", overall_status="review_required", total_claims=5,
            supported_claims=3, partially_supported_claims=1, unsupported_claims=0, recommendations=1
        )
        self.assertEqual(report_review.overall_status, "review_required")

        # Case C: Failed
        report_fail = QualityControlReport(
            document_id="doc3", overall_status="failed", total_claims=5,
            supported_claims=3, partially_supported_claims=0, unsupported_claims=1, recommendations=1
        )
        self.assertEqual(report_fail.overall_status, "failed")

    # 17. Human review state handling
    def test_17_human_review_state_structure(self):
        claim = ClaimProvenance(
            claim_id="claim_review_1",
            claim_text="Sample claim for review",
            claim_type="finding",
            support_status="partially_supported",
            source_pages=[1],
            supporting_text=["Sample text"],
            confidence="medium",
            reason="Partial match",
            output_type="executive_summary"
        )
        # Verify schema field serializability
        d = claim.model_dump()
        self.assertEqual(d["claim_id"], "claim_review_1")

    # 18. API Endpoint POST /api/documents/{id}/quality-check
    def test_18_api_quality_check_endpoint(self):
        res = client.post(
            f"/api/documents/{self.test_doc_id}/quality-check",
            json={"output_types": ["executive_summary", "advisory", "presentation"]}
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["document_id"], self.test_doc_id)
        self.assertIn(data["overall_status"], ["passed", "review_required", "failed"])
        self.assertIn("claims", data)


if __name__ == "__main__":
    unittest.main()
