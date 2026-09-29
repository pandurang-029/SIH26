"""
Test suite for Step 8: Configurable Content Transformation & Multilingual Adaptation.
"""
import os
import pytest
from pydantic import ValidationError
from app.schemas.content_representation import (
    CommonContentRepresentation,
    KeyFact,
    Statistic,
    KeyFinding,
    Risk,
    Recommendation,
    SourceReference,
    Entity,
    Event,
)
from app.schemas.output_schemas import (
    TransformationConfig,
    AudienceEnum,
    ToneEnum,
    LanguageEnum,
    DetailLevelEnum,
    CommunicationObjectiveEnum,
    GenerateOutputsRequest,
    SocialMediaOutput,
    SocialMediaPost,
    InfographicOutput,
    InfographicSection,
)
from app.services.generators import SocialMediaGenerator, InfographicGenerator
from app.services.output_prompts import build_executive_summary_prompt
from app.services.output_service import OutputService
from app.services.quality_service import QualityService


@pytest.fixture
def mock_ccr() -> CommonContentRepresentation:
    return CommonContentRepresentation(
        document_title="National Cybersecurity Guidelines 2026",
        document_topic="Cybersecurity & Infrastructure",
        executive_context="Critical infrastructure protection directive establishing zero-trust access and 99.99% uptime mandate.",
        important_statistics=[
            Statistic(metric="Target Uptime", value="99.99%", source_page=2, context="Mandated availability for core routing hubs"),
            Statistic(metric="Max Incident Response", value="15 minutes", source_page=3, context="Mandatory alert triage timeframe"),
        ],
        key_facts=[
            KeyFact(fact="Zero-trust access policy mandated for operational networks.", source_page=1),
        ],
        key_findings=[
            KeyFinding(finding="Legacy authentication protocols expose edge nodes to credential stuffing.", source_page=1, importance="High"),
        ],
        risks=[
            Risk(risk="Unpatched edge routers risk remote code execution.", severity="Critical", source_page=2),
        ],
        recommendations=[
            Recommendation(recommendation="Enforce multi-factor authentication across all operational networks.", priority="High", source_page=3),
        ],
        source_references=[
            SourceReference(page_number=1, supporting_text="Edge nodes remain vulnerable."),
            SourceReference(page_number=2, supporting_text="Mandated availability is 99.99%."),
            SourceReference(page_number=3, supporting_text="Alert triage must occur within 15 minutes."),
        ],
        entities=[
            Entity(name="NTRO Cyber Cell", type="Organization", source_page=1),
        ],
        events=[
            Event(description="Full zero-trust migration complete", date="2026-12-31", source_page=4),
        ],
    )


# 1. test_transformation_config_defaults
def test_transformation_config_defaults():
    config = TransformationConfig()
    assert config.audience == AudienceEnum.SENIOR_OFFICIALS
    assert config.tone == ToneEnum.FORMAL
    assert config.language == LanguageEnum.ENGLISH
    assert config.detail_level == DetailLevelEnum.MEDIUM
    assert config.communication_objective == CommunicationObjectiveEnum.INFORM


# 2. test_transformation_config_custom_values
def test_transformation_config_custom_values():
    config = TransformationConfig(
        audience=AudienceEnum.TECHNICAL_PERSONNEL,
        tone=ToneEnum.TECHNICAL,
        language=LanguageEnum.HINDI,
        detail_level=DetailLevelEnum.DETAILED,
        communication_objective=CommunicationObjectiveEnum.RECOMMEND,
    )
    assert config.audience == "technical_personnel"
    assert config.tone == "technical"
    assert config.language == "hindi"
    assert config.detail_level == "detailed"
    assert config.communication_objective == "recommend"


# 3. test_invalid_transformation_config_enum
def test_invalid_transformation_config_enum():
    with pytest.raises(ValidationError):
        TransformationConfig(audience="invalid_audience")
    with pytest.raises(ValidationError):
        TransformationConfig(language="spanish")


# 4. test_social_media_output_schema_validation
def test_social_media_output_schema_validation():
    sm = SocialMediaOutput(
        title="Cybersecurity Directive",
        platform="linkedin",
        posts=[
            SocialMediaPost(
                post_id="post_1",
                platform="linkedin",
                content="NTRO issues new zero-trust mandate requiring 99.99% system uptime.",
                hashtags=["#CyberSecurity", "#ZeroTrust"],
                source_references=[SourceReference(page_number=2, supporting_text="Mandated availability is 99.99%.")],
            )
        ],
        hashtags=["#NTRO", "#CyberSecurity"],
    )
    assert sm.platform == "linkedin"
    assert len(sm.posts) == 1
    assert sm.posts[0].post_id == "post_1"


# 5. test_infographic_output_schema_validation
def test_infographic_output_schema_validation():
    info = InfographicOutput(
        title="Zero-Trust Security Visual Guide",
        subtitle="Key mandates for national infrastructure",
        sections=[
            InfographicSection(
                heading="Target Availability",
                content="99.99% operational uptime required",
                suggested_visual="number_highlight",
                source_references=[SourceReference(page_number=2, supporting_text="99.99% uptime")],
            )
        ],
        key_takeaways=["Enforce MFA", "15 minute alert triage"],
    )
    assert info.title == "Zero-Trust Security Visual Guide"
    assert len(info.sections) == 1
    assert info.sections[0].suggested_visual == "number_highlight"


# 6. test_mock_social_media_generator
def test_mock_social_media_generator(mock_ccr):
    config = TransformationConfig(audience=AudienceEnum.GENERAL_AUDIENCE, tone=ToneEnum.NEUTRAL)
    result = OutputService._generate_mock_social_media(mock_ccr, config=config)
    assert isinstance(result, SocialMediaOutput)
    assert len(result.posts) > 0
    assert result.posts[0].content != ""


# 7. test_mock_infographic_generator
def test_mock_infographic_generator(mock_ccr):
    config = TransformationConfig(audience=AudienceEnum.TECHNICAL_PERSONNEL, detail_level=DetailLevelEnum.DETAILED)
    result = OutputService._generate_mock_infographic(mock_ccr, config=config)
    assert isinstance(result, InfographicOutput)
    assert len(result.sections) > 0
    assert len(result.sections[0].heading) > 0


# 8. test_audience_adaptation_prompt_formatting
def test_audience_adaptation_prompt_formatting(mock_ccr):
    config = TransformationConfig(audience=AudienceEnum.FIELD_PERSONNEL)
    prompt = build_executive_summary_prompt(mock_ccr, config=config)
    assert "field operational staff" in prompt.lower() or "field_personnel" in prompt.lower() or "tactical" in prompt.lower()


# 9. test_tone_adaptation_prompt_formatting
def test_tone_adaptation_prompt_formatting(mock_ccr):
    config = TransformationConfig(tone=ToneEnum.SIMPLIFIED)
    prompt = build_executive_summary_prompt(mock_ccr, config=config)
    assert "simplified" in prompt.lower() or "plain language" in prompt.lower()


# 10. test_language_adaptation_prompt_formatting
def test_language_adaptation_prompt_formatting(mock_ccr):
    config = TransformationConfig(language=LanguageEnum.HINDI)
    prompt = build_executive_summary_prompt(mock_ccr, config=config)
    assert "hindi" in prompt.lower()


# 11. test_objective_adaptation_prompt_formatting
def test_objective_adaptation_prompt_formatting(mock_ccr):
    config = TransformationConfig(communication_objective=CommunicationObjectiveEnum.ADVISE)
    prompt = build_executive_summary_prompt(mock_ccr, config=config)
    assert "advise" in prompt.lower() or "recommendations" in prompt.lower()


# 12. test_multilingual_hindi_generation_schema
def test_multilingual_hindi_generation_schema(mock_ccr):
    config = TransformationConfig(language=LanguageEnum.HINDI)
    response = OutputService.generate_outputs(
        document_id="doc_test_123",
        ccr=mock_ccr,
        output_types=["executive_summary", "advisory"],
        configuration=config,
    )
    assert response.executive_summary is not None
    assert response.advisory is not None
    assert response.configuration.language == LanguageEnum.HINDI


# 13. test_multilingual_marathi_generation_schema
def test_multilingual_marathi_generation_schema(mock_ccr):
    config = TransformationConfig(language=LanguageEnum.MARATHI)
    response = OutputService.generate_outputs(
        document_id="doc_test_123",
        ccr=mock_ccr,
        output_types=["executive_summary", "social_media"],
        configuration=config,
    )
    assert response.executive_summary is not None
    assert response.social_media is not None
    assert response.configuration.language == LanguageEnum.MARATHI


# 14. test_factual_consistency_numerical_preservation
def test_factual_consistency_numerical_preservation(mock_ccr):
    config = TransformationConfig(language=LanguageEnum.HINDI)
    response = OutputService.generate_outputs(
        document_id="doc_test_123",
        ccr=mock_ccr,
        output_types=["executive_summary"],
        configuration=config,
    )
    # Important statistics metrics/values must be preserved exactly
    stats = response.executive_summary.important_statistics
    assert len(stats) > 0
    assert any("99.99%" in s.value for s in stats)


# 15. test_quality_control_social_media_claim_extraction
def test_quality_control_social_media_claim_extraction(mock_ccr):
    sm = SocialMediaOutput(
        title="Campaign",
        platform="linkedin",
        posts=[
            SocialMediaPost(
                post_id="p1",
                platform="linkedin",
                content="System uptime requirement is 99.99% for zero-trust compliance.",
                hashtags=["#Security"],
                source_references=[SourceReference(page_number=2, supporting_text="Mandated availability is 99.99%.")],
            )
        ],
    )
    report = QualityService.generate_report(
        document_id="doc_test",
        ccr=mock_ccr,
        outputs={"social_media": sm},
        output_types=["social_media"],
    )
    assert report.total_claims >= 1
    assert any(c.output_type == "social_media" for c in report.claims)


# 16. test_quality_control_infographic_claim_extraction
def test_quality_control_infographic_claim_extraction(mock_ccr):
    info = InfographicOutput(
        title="Infographic",
        subtitle="Overview",
        key_statistics=[Statistic(metric="Target Uptime", value="99.99%", source_page=2)],
        sections=[
            InfographicSection(
                heading="Alert Triage",
                content="Alert triage timeframe is 15 minutes.",
                suggested_visual="number_highlight",
                source_references=[SourceReference(page_number=3, supporting_text="15 minutes")],
            )
        ],
    )
    report = QualityService.generate_report(
        document_id="doc_test",
        ccr=mock_ccr,
        outputs={"infographic": info},
        output_types=["infographic"],
    )
    assert report.total_claims >= 2
    assert any(c.output_type == "infographic" for c in report.claims)


# 17. test_api_generate_with_transformation_config
def test_api_generate_with_transformation_config():
    request = GenerateOutputsRequest(
        output_types=["executive_summary"],
        configuration=TransformationConfig(
            audience=AudienceEnum.TECHNICAL_PERSONNEL,
            tone=ToneEnum.TECHNICAL,
            language=LanguageEnum.ENGLISH,
        ),
    )
    assert request.configuration.audience == AudienceEnum.TECHNICAL_PERSONNEL


# 18. test_api_generate_social_media_and_infographic
def test_api_generate_social_media_and_infographic(mock_ccr):
    response = OutputService.generate_outputs(
        document_id="doc_test_123",
        ccr=mock_ccr,
        output_types=["social_media", "infographic"],
    )
    assert response.social_media is not None
    assert response.infographic is not None


# 19. test_api_reject_invalid_output_type
def test_api_reject_invalid_output_type():
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)
    # Upload doc first
    files = {"file": ("test_transform.txt", b"NTRO security guidelines for zero trust.", "text/plain")}
    upload_res = client.post("/api/documents/upload", files=files)
    assert upload_res.status_code == 201
    doc_id = upload_res.json()["document_id"]

    response = client.post(f"/api/documents/{doc_id}/generate", json={"output_types": ["invalid_type"]})
    assert response.status_code == 400


# 20. test_export_service_preserves_step8_types
def test_export_service_preserves_step8_types(mock_ccr):
    from app.services.export_service import ExportService
    with pytest.raises(ValueError):
        ExportService.export_output("doc_123", output_type="social_media", output_format="pdf")


# 21. test_full_pipeline_step8_end_to_end
def test_full_pipeline_step8_end_to_end(mock_ccr):
    config = TransformationConfig(
        audience=AudienceEnum.SENIOR_OFFICIALS,
        tone=ToneEnum.FORMAL,
        language=LanguageEnum.HINDI,
    )
    # Step 5: Multi-output generation
    outputs_resp = OutputService.generate_outputs(
        document_id="doc_full_test",
        ccr=mock_ccr,
        output_types=["executive_summary", "advisory", "presentation", "social_media", "infographic"],
        configuration=config,
    )
    assert outputs_resp.executive_summary is not None
    assert outputs_resp.advisory is not None
    assert outputs_resp.presentation is not None
    assert outputs_resp.social_media is not None
    assert outputs_resp.infographic is not None

    # Step 7: Quality report
    outputs_dict = {
        "executive_summary": outputs_resp.executive_summary,
        "advisory": outputs_resp.advisory,
        "presentation": outputs_resp.presentation,
        "social_media": outputs_resp.social_media,
        "infographic": outputs_resp.infographic,
    }
    report = QualityService.generate_report(
        document_id="doc_full_test",
        ccr=mock_ccr,
        outputs=outputs_dict,
        output_types=["executive_summary", "advisory", "presentation", "social_media", "infographic"],
    )
    assert report.total_claims > 0
    assert report.supported_claims + report.recommendations > 0
