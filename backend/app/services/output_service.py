import os
import logging
from typing import Dict, List, Optional
from app.schemas.content_representation import CommonContentRepresentation
from app.schemas.output_schemas import (
    ExecutiveSummaryOutput,
    AdvisoryOutput,
    PresentationOutput,
    PresentationSlide,
    SocialMediaOutput,
    SocialMediaPost,
    InfographicOutput,
    InfographicSection,
    TransformationConfig,
    GeneratedOutputsResponse,
)
from app.services.generators import (
    ExecutiveSummaryGenerator,
    AdvisoryGenerator,
    PresentationGenerator,
    SocialMediaGenerator,
    InfographicGenerator,
)

logger = logging.getLogger(__name__)


class OutputService:
    """
    Orchestration service consuming validated CommonContentRepresentation (CCR) and TransformationConfig
    to generate Executive Summary, Advisory, Presentation, Social Media, and Infographic outputs.
    """

    @classmethod
    def generate_outputs(
        cls,
        document_id: str,
        ccr: CommonContentRepresentation,
        output_types: List[str],
        configuration: Optional[TransformationConfig] = None,
    ) -> GeneratedOutputsResponse:
        exec_summary: Optional[ExecutiveSummaryOutput] = None
        advisory: Optional[AdvisoryOutput] = None
        presentation: Optional[PresentationOutput] = None
        social_media: Optional[SocialMediaOutput] = None
        infographic: Optional[InfographicOutput] = None
        errors: Dict[str, str] = {}

        cfg = configuration or TransformationConfig()
        use_mock = os.environ.get("USE_MOCK_AI", "false").lower() == "true"

        for out_type in output_types:
            out_type_clean = out_type.lower().strip()

            try:
                if use_mock:
                    if out_type_clean == "executive_summary":
                        exec_summary = cls._generate_mock_executive_summary(ccr, cfg)
                    elif out_type_clean == "advisory":
                        advisory = cls._generate_mock_advisory(ccr, cfg)
                    elif out_type_clean == "presentation":
                        presentation = cls._generate_mock_presentation(ccr, cfg)
                    elif out_type_clean == "social_media":
                        social_media = cls._generate_mock_social_media(ccr, cfg)
                    elif out_type_clean == "infographic":
                        infographic = cls._generate_mock_infographic(ccr, cfg)
                    else:
                        errors[out_type] = f"Unsupported output type: '{out_type}'"

                else:
                    if out_type_clean == "executive_summary":
                        generator = ExecutiveSummaryGenerator()
                        exec_summary = generator.generate(ccr, cfg)
                    elif out_type_clean == "advisory":
                        generator = AdvisoryGenerator()
                        advisory = generator.generate(ccr, cfg)
                    elif out_type_clean == "presentation":
                        generator = PresentationGenerator()
                        presentation = generator.generate(ccr, cfg)
                    elif out_type_clean == "social_media":
                        generator = SocialMediaGenerator()
                        social_media = generator.generate(ccr, cfg)
                    elif out_type_clean == "infographic":
                        generator = InfographicGenerator()
                        infographic = generator.generate(ccr, cfg)
                    else:
                        errors[out_type] = f"Unsupported output type: '{out_type}'"

            except Exception as err:
                logger.error(f"Failed to generate output '{out_type}' for document ID '{document_id}': {str(err)}")
                errors[out_type] = str(err)

        return GeneratedOutputsResponse(
            document_id=document_id,
            executive_summary=exec_summary,
            advisory=advisory,
            presentation=presentation,
            social_media=social_media,
            infographic=infographic,
            configuration=cfg,
            errors=errors,
        )

    @staticmethod
    def _generate_mock_executive_summary(
        ccr: CommonContentRepresentation, config: Optional[TransformationConfig] = None
    ) -> ExecutiveSummaryOutput:
        cfg = config or TransformationConfig()
        lang_prefix = f"[{cfg.language.value.upper()}] " if cfg.language.value != "english" else ""
        return ExecutiveSummaryOutput(
            title=f"{lang_prefix}Executive Summary: {ccr.document_title}",
            executive_summary=f"{lang_prefix}Decision briefing tailored for {cfg.audience.value} ({cfg.tone.value} tone). {ccr.executive_context}",
            key_points=[
                f"{lang_prefix}Core finding: {item.finding}" for item in ccr.key_findings[:3]
            ] or [f"{lang_prefix}Primary operational parameters established and validated."],
            important_statistics=ccr.important_statistics,
            risks=ccr.risks,
            recommendations=ccr.recommendations,
            source_references=ccr.source_references,
        )

    @staticmethod
    def _generate_mock_advisory(
        ccr: CommonContentRepresentation, config: Optional[TransformationConfig] = None
    ) -> AdvisoryOutput:
        cfg = config or TransformationConfig()
        lang_prefix = f"[{cfg.language.value.upper()}] " if cfg.language.value != "english" else ""
        return AdvisoryOutput(
            title=f"{lang_prefix}Security & Operational Advisory: {ccr.document_title}",
            situation=f"{lang_prefix}Advisory briefing regarding {ccr.document_topic}. {ccr.executive_context}",
            key_findings=ccr.key_findings,
            risk_assessment=f"{lang_prefix}Assessment of operational risks identified in source document for {cfg.audience.value}.",
            recommended_actions=ccr.recommendations,
            priority="High",
            intended_audience=cfg.audience.value.replace("_", " ").title(),
            source_references=ccr.source_references,
        )

    @staticmethod
    def _generate_mock_presentation(
        ccr: CommonContentRepresentation, config: Optional[TransformationConfig] = None
    ) -> PresentationOutput:
        cfg = config or TransformationConfig()
        lang_prefix = f"[{cfg.language.value.upper()}] " if cfg.language.value != "english" else ""
        return PresentationOutput(
            title=f"{lang_prefix}Presentation Deck: {ccr.document_title}",
            subtitle=f"{lang_prefix}Briefing Slides for {cfg.audience.value.replace('_', ' ').title()}",
            slides=[
                PresentationSlide(
                    slide_number=1,
                    title=f"{lang_prefix}1. Executive Context & Scope",
                    key_points=[
                        f"Topic: {ccr.document_topic}",
                        ccr.executive_context[:120] + "..." if len(ccr.executive_context) > 120 else ccr.executive_context,
                    ],
                    speaker_notes="Introduce the executive scope and core operational context.",
                    source_references=ccr.source_references[:1],
                ),
                PresentationSlide(
                    slide_number=2,
                    title=f"{lang_prefix}2. Key Analytical Findings",
                    key_points=[
                        item.finding for item in ccr.key_findings[:3]
                    ] or ["Analytical findings grounded in source document."],
                    speaker_notes="Highlight the main findings derived directly from source content.",
                    source_references=ccr.source_references[:1],
                ),
                PresentationSlide(
                    slide_number=3,
                    title=f"{lang_prefix}3. Risk Assessment & Recommendations",
                    key_points=[
                        f"Risk: {r.risk}" for r in ccr.risks[:2]
                    ] + [
                        f"Action: {rec.recommendation}" for rec in ccr.recommendations[:2]
                    ],
                    speaker_notes="Detail identified risks alongside corresponding mitigation recommendations.",
                    source_references=ccr.source_references[:1],
                ),
                PresentationSlide(
                    slide_number=4,
                    title=f"{lang_prefix}4. Closing & Next Steps",
                    key_points=[
                        "Proceed with recommended operational directives.",
                        "Maintain source provenance across all implementation phases.",
                    ],
                    speaker_notes="Summarize closing takeaways and invite questions.",
                    source_references=ccr.source_references[:1],
                ),
            ],
        )

    @staticmethod
    def _generate_mock_social_media(
        ccr: CommonContentRepresentation, config: Optional[TransformationConfig] = None
    ) -> SocialMediaOutput:
        cfg = config or TransformationConfig()
        lang_prefix = f"[{cfg.language.value.upper()}] " if cfg.language.value != "english" else ""
        posts = [
            SocialMediaPost(
                post_id="post_1",
                platform="linkedin",
                content=f"{lang_prefix}📢 NTRO Operational Briefing: {ccr.document_title}. {ccr.executive_context[:150]}... Grounded in validated source intelligence.",
                hashtags=["#NTRO", "#CyberSecurity", "#GovTech", "#GenAI"],
                source_references=ccr.source_references[:1],
            ),
            SocialMediaPost(
                post_id="post_2",
                platform="x",
                content=f"{lang_prefix}1/2 Key Insight on {ccr.document_topic}: {ccr.key_findings[0].finding if ccr.key_findings else 'Operational posture updated.'}",
                hashtags=["#NTRO", "#TechUpdate"],
                source_references=ccr.source_references[:1],
            ),
            SocialMediaPost(
                post_id="post_3",
                platform="x",
                content=f"{lang_prefix}2/2 Strategic Recommendation: {ccr.recommendations[0].recommendation if ccr.recommendations else 'Implement security directives.'}",
                hashtags=["#CyberDefence"],
                source_references=ccr.source_references[:1],
            ),
        ]
        return SocialMediaOutput(
            title=f"{lang_prefix}Social Media Campaign: {ccr.document_title}",
            platform="multi_platform",
            posts=posts,
            hashtags=["#NTRO", "#CyberSecurity", "#GovTech"],
            source_references=ccr.source_references,
        )

    @staticmethod
    def _generate_mock_infographic(
        ccr: CommonContentRepresentation, config: Optional[TransformationConfig] = None
    ) -> InfographicOutput:
        cfg = config or TransformationConfig()
        lang_prefix = f"[{cfg.language.value.upper()}] " if cfg.language.value != "english" else ""
        sections = [
            InfographicSection(
                heading=f"{lang_prefix}1. Operational Overview",
                content=ccr.executive_context[:180],
                suggested_visual="process_flow",
                source_references=ccr.source_references[:1],
            ),
            InfographicSection(
                heading=f"{lang_prefix}2. Key Analytical Findings",
                content=ccr.key_findings[0].finding if ccr.key_findings else "Analytical findings established.",
                suggested_visual="bar_chart",
                source_references=ccr.source_references[:1],
            ),
            InfographicSection(
                heading=f"{lang_prefix}3. Quantitative Metrics",
                content=f"Metrics evaluated across {len(ccr.important_statistics)} indicators.",
                suggested_visual="number_highlight",
                source_references=ccr.source_references[:1],
            ),
        ]
        return InfographicOutput(
            title=f"{lang_prefix}Infographic Specification: {ccr.document_title}",
            subtitle=f"{lang_prefix}Visual Content Specification for {config.audience.value.replace('_', ' ').title()}",
            sections=sections,
            key_statistics=ccr.important_statistics,
            key_takeaways=[
                rec.recommendation for rec in ccr.recommendations[:3]
            ] or ["Maintain source provenance across visual elements."],
            source_references=ccr.source_references,
        )
