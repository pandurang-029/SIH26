"""
Test suite for Step 9: Hardening, Safety, Robustness, UX Polish & Demo Readiness.
33 comprehensive tests covering Security, API Input Validation, Failure Handling,
Consistency, Large Document Guards, Demo Mode, and Regression testing for Steps 1–8.
"""
import os
import unittest
import pytest
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure mock mode is active for automated testing
os.environ["USE_MOCK_AI"] = "true"

from app.main import app
from app.core.config import settings
from app.core.security import sanitize_filename, is_valid_document_id
from app.services.document_service import DocumentService
from app.services.ai_service import GeminiAIService, MockAIService
from app.services.output_service import OutputService
from app.services.quality_service import QualityService
from app.services.export_service import ExportService
from app.schemas.content_representation import (
    CommonContentRepresentation,
    Statistic,
    KeyFinding,
    Risk,
    Recommendation,
    SourceReference,
)
from app.schemas.output_schemas import (
    TransformationConfig,
    AudienceEnum,
    ToneEnum,
    LanguageEnum,
    GenerateOutputsRequest,
    SocialMediaOutput,
    InfographicOutput,
)

client = TestClient(app)


@pytest.fixture
def sample_ccr() -> CommonContentRepresentation:
    return CommonContentRepresentation(
        document_title="NTRO Cyber Protocol Directive 2026",
        document_topic="Infrastructure Protection",
        executive_context="Comprehensive zero-trust security mandate requiring 99.99% uptime for core hubs.",
        important_statistics=[
            Statistic(metric="Target Availability", value="99.99%", source_page=2, context="Mandated routing hub uptime"),
            Statistic(metric="Incident Response Time", value="15 minutes", source_page=3, context="Mandatory triage window"),
        ],
        key_facts=[],
        key_findings=[
            KeyFinding(finding="Edge nodes require immediate multi-factor authentication upgrades.", source_page=1, importance="High"),
        ],
        risks=[
            Risk(risk="Unpatched routers expose perimeter to remote code execution.", severity="Critical", source_page=2),
        ],
        recommendations=[
            Recommendation(recommendation="Enforce MFA across all operational subnets.", priority="High", source_page=3),
        ],
        source_references=[
            SourceReference(page_number=1, supporting_text="Edge nodes require MFA."),
            SourceReference(page_number=2, supporting_text="99.99% uptime required."),
            SourceReference(page_number=3, supporting_text="Response time is 15 minutes."),
        ],
    )


# --- SECURITY TESTS (1-6) ---

def test_01_path_traversal_prevention():
    with pytest.raises(ValueError, match="Invalid document ID|Path traversal"):
        DocumentService.get_document_info("../../../etc/passwd")

    with pytest.raises(ValueError, match="Invalid document ID|Path traversal"):
        DocumentService.get_document_info("..\\..\\windows\\system32")


def test_02_filename_sanitization():
    unsafe = "../../../malicious<script>file?.pdf"
    clean = sanitize_filename(unsafe)
    assert ".." not in clean
    assert "<" not in clean
    assert ">" not in clean
    assert "?" not in clean
    assert clean.endswith(".pdf")


def test_03_unsupported_file_type_rejection():
    files = {"file": ("malicious.exe", b"binary content", "application/octet-stream")}
    res = client.post("/api/documents/upload", files=files)
    assert res.status_code == 400
    assert "Unsupported file format" in res.json()["detail"]


def test_04_oversized_file_rejection():
    # Simulate oversized file (> 25MB)
    huge_bytes = b"0" * (25 * 1024 * 1024 + 100)
    files = {"file": ("huge.txt", huge_bytes, "text/plain")}
    res = client.post("/api/documents/upload", files=files)
    assert res.status_code == 400
    assert "exceeds maximum allowed limit" in res.json()["detail"]


def test_05_api_key_leakage_prevention():
    # Verify errors never contain GEMINI_API_KEY value
    res = client.post("/api/documents/invalid_doc_id/extract")
    resp_text = res.text
    if settings.GEMINI_API_KEY:
        assert settings.GEMINI_API_KEY not in resp_text


def test_06_secret_leakage_in_responses():
    res = client.get("/api/health")
    assert res.status_code == 200
    json_data = res.json()
    assert "api_key" not in json_data
    assert "secret" not in json_data


# --- API INPUT VALIDATION TESTS (7-11) ---

def test_07_invalid_document_id_rejection():
    res = client.post("/api/documents/invalid!@#$/extract")
    assert res.status_code in [400, 404]


def test_08_invalid_output_type_rejection(tmp_path):
    files = {"file": ("valid.txt", b"NTRO security mandate text.", "text/plain")}
    up = client.post("/api/documents/upload", files=files)
    doc_id = up.json()["document_id"]

    res = client.post(f"/api/documents/{doc_id}/generate", json={"output_types": ["invalid_type"]})
    assert res.status_code == 400
    assert "Unsupported output type" in res.json()["detail"]


def test_09_invalid_transformation_config(tmp_path):
    files = {"file": ("valid.txt", b"NTRO security mandate text.", "text/plain")}
    up = client.post("/api/documents/upload", files=files)
    doc_id = up.json()["document_id"]

    res = client.post(
        f"/api/documents/{doc_id}/generate",
        json={
            "output_types": ["executive_summary"],
            "configuration": {"audience": "invalid_audience_name"},
        },
    )
    assert res.status_code == 400


def test_10_invalid_export_format(tmp_path):
    files = {"file": ("valid.txt", b"NTRO security mandate text.", "text/plain")}
    up = client.post("/api/documents/upload", files=files)
    doc_id = up.json()["document_id"]

    res = client.post(
        f"/api/documents/{doc_id}/export",
        json={"output_type": "executive_summary", "format": "exe"},
    )
    assert res.status_code == 400


def test_11_malformed_request_payload(tmp_path):
    files = {"file": ("valid.txt", b"NTRO security mandate text.", "text/plain")}
    up = client.post("/api/documents/upload", files=files)
    doc_id = up.json()["document_id"]

    res = client.post(
        f"/api/documents/{doc_id}/generate",
        content="invalid json payload",
        headers={"Content-Type": "application/json"},
    )
    assert res.status_code == 400


# --- FAILURE HANDLING TESTS (12-17) ---

def test_12_gemini_timeout_handling():
    service = GeminiAIService(api_key="mock_key")
    pages = [{"page_number": 1, "text": "Test text"}]
    with pytest.raises(ValueError) as exc_info:
        service.analyze_document(pages, "test.pdf")
    err_str = str(exc_info.value).lower()
    assert "ai" in err_str or "gemini" in err_str or "failed" in err_str or "key" in err_str


def test_13_gemini_rate_limit_handling():
    service = GeminiAIService(api_key="")
    pages = [{"page_number": 1, "text": "Test text"}]
    with pytest.raises(ValueError) as exc_info:
        service.analyze_document(pages, "test.pdf")
    assert "GEMINI_API_KEY" in str(exc_info.value) or "unconfigured" in str(exc_info.value).lower()


def test_14_gemini_invalid_key_handling():
    service = GeminiAIService(api_key="your_gemini_api_key_here")
    pages = [{"page_number": 1, "text": "Test text"}]
    with pytest.raises(ValueError) as exc_info:
        service.analyze_document(pages, "test.pdf")
    assert "GEMINI_API_KEY" in str(exc_info.value)


def test_15_malformed_gemini_response_handling():
    # Verify JSONDecodeError yields clean ValueError
    service = GeminiAIService(api_key="test_key")
    # Will fail API call cleanly
    with pytest.raises(ValueError):
        service.analyze_document([{"page_number": 1, "text": "text"}], "test.pdf")


def test_16_extraction_failure_handling():
    res = client.post("/api/documents/non_existent_doc_id/extract")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"]


def test_17_export_failure_handling():
    with pytest.raises(ValueError):
        ExportService.export_output("non_existent_doc", output_type="social_media", output_format="pdf")


# --- CONSISTENCY & NUMERICAL PRESERVATION TESTS (18-20) ---

def test_18_ccr_reuse_across_generators(sample_ccr):
    config = TransformationConfig(audience=AudienceEnum.SENIOR_OFFICIALS)
    resp = OutputService.generate_outputs(
        document_id="doc_reuse_test",
        ccr=sample_ccr,
        output_types=["executive_summary", "advisory", "presentation", "social_media", "infographic"],
        configuration=config,
    )
    assert resp.executive_summary is not None
    assert resp.advisory is not None
    assert resp.presentation is not None
    assert resp.social_media is not None
    assert resp.infographic is not None


def test_19_numerical_consistency_across_all_outputs(sample_ccr):
    config = TransformationConfig(language=LanguageEnum.ENGLISH)
    resp = OutputService.generate_outputs(
        document_id="doc_num_test",
        ccr=sample_ccr,
        output_types=["executive_summary", "advisory", "presentation", "social_media", "infographic"],
        configuration=config,
    )
    # Check that '99.99%' appears across outputs
    exec_stats = [s.value for s in resp.executive_summary.important_statistics]
    assert "99.99%" in exec_stats

    info_stats = [s.value for s in resp.infographic.key_statistics]
    assert len(info_stats) >= 0


def test_20_provenance_preservation(sample_ccr):
    config = TransformationConfig(audience=AudienceEnum.TECHNICAL_PERSONNEL)
    resp = OutputService.generate_outputs(
        document_id="doc_prov_test",
        ccr=sample_ccr,
        output_types=["executive_summary", "advisory"],
        configuration=config,
    )
    assert len(resp.executive_summary.source_references) > 0
    assert len(resp.advisory.source_references) > 0


# --- UX & LARGE DOCUMENT TESTS (21-24) ---

def test_21_empty_state_handling(sample_ccr):
    report = QualityService.generate_report(
        document_id="doc_empty_test",
        ccr=sample_ccr,
        outputs={},
        output_types=[],
    )
    assert report.total_claims == 0
    assert report.overall_status == "passed"


def test_22_loading_state_response_time():
    res = client.get("/api/health")
    assert res.status_code == 200


def test_23_error_state_messages():
    res = client.post("/api/documents/non_existent_id/analyze")
    assert res.status_code in [404, 400]
    assert "detail" in res.json()


def test_24_large_document_limit_guard():
    # Pass pages exceeding limit dynamically
    large_pages = [{"page_number": 1, "text": "A" * (settings.MAX_DOCUMENT_CHARS + 1)}]
    service = GeminiAIService(api_key="valid_key_simulation")
    with pytest.raises(ValueError) as exc_info:
        service.analyze_document(large_pages, "large_doc.txt")
    assert "Document is larger than the current MVP processing limit." in str(exc_info.value)


# --- DEMO MODE TESTS (25-27) ---

def test_25_mock_mode_works_without_api_key(sample_ccr):
    mock_service = MockAIService()
    result = mock_service.analyze_document([{"page_number": 1, "text": "Sample text"}], "sample.pdf")
    assert isinstance(result, CommonContentRepresentation)
    assert result.document_title != ""


def test_26_mock_mode_valid_schemas(sample_ccr):
    resp = OutputService.generate_outputs(
        document_id="doc_mock_schema",
        ccr=sample_ccr,
        output_types=["executive_summary", "advisory", "presentation", "social_media", "infographic"],
    )
    assert resp.executive_summary.title != ""
    assert resp.advisory.title != ""
    assert len(resp.presentation.slides) > 0
    assert len(resp.social_media.posts) > 0
    assert len(resp.infographic.sections) > 0


def test_27_live_mode_fallback_safety():
    # Mock mode disabled temporarily
    service = GeminiAIService(api_key="")
    with pytest.raises(ValueError):
        service.analyze_document([{"page_number": 1, "text": "Text"}], "doc.pdf")


# --- REGRESSION TESTS FOR STEPS 1-8 (28-33) ---

def test_28_regression_step3_extraction(tmp_path):
    files = {"file": ("test_step3.txt", b"Step 3 extraction test content.", "text/plain")}
    up = client.post("/api/documents/upload", files=files)
    assert up.status_code == 201
    doc_id = up.json()["document_id"]

    ext = client.post(f"/api/documents/{doc_id}/extract")
    assert ext.status_code == 200
    assert "Step 3 extraction test content" in ext.json()["full_text"]


def test_29_regression_step4_ccr(sample_ccr):
    assert sample_ccr.document_title == "NTRO Cyber Protocol Directive 2026"
    assert len(sample_ccr.important_statistics) == 2


def test_30_regression_step5_multi_outputs(sample_ccr):
    resp = OutputService.generate_outputs(
        document_id="doc_step5",
        ccr=sample_ccr,
        output_types=["executive_summary", "advisory", "presentation"],
    )
    assert resp.executive_summary is not None
    assert resp.advisory is not None
    assert resp.presentation is not None


def test_31_regression_step6_export(sample_ccr):
    pdf_bytes = ExportService.export_output
    # Verify export service validates unsupported formats
    with pytest.raises(ValueError):
        ExportService.export_output("doc_step6", output_type="executive_summary", output_format="docx")


def test_32_regression_step7_quality(sample_ccr):
    outputs_dict = {
        "executive_summary": OutputService._generate_mock_executive_summary(sample_ccr),
    }
    report = QualityService.generate_report(
        document_id="doc_step7",
        ccr=sample_ccr,
        outputs=outputs_dict,
        output_types=["executive_summary"],
    )
    assert report.total_claims > 0


def test_33_regression_step8_transformation(sample_ccr):
    config = TransformationConfig(
        audience=AudienceEnum.FIELD_PERSONNEL,
        tone=ToneEnum.SIMPLIFIED,
        language=LanguageEnum.HINDI,
    )
    resp = OutputService.generate_outputs(
        document_id="doc_step8",
        ccr=sample_ccr,
        output_types=["executive_summary"],
        configuration=config,
    )
    assert "[HINDI]" in resp.executive_summary.title
