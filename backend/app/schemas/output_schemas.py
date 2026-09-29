from enum import Enum
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from app.schemas.content_representation import (
    SourceReference,
    KeyFact,
    KeyFinding,
    Risk,
    Recommendation,
    Statistic,
)


class AudienceEnum(str, Enum):
    SENIOR_OFFICIALS = "senior_officials"
    TECHNICAL_PERSONNEL = "technical_personnel"
    FIELD_PERSONNEL = "field_personnel"
    GENERAL_AUDIENCE = "general_audience"


class ToneEnum(str, Enum):
    FORMAL = "formal"
    TECHNICAL = "technical"
    NEUTRAL = "neutral"
    SIMPLIFIED = "simplified"


class LanguageEnum(str, Enum):
    ENGLISH = "english"
    HINDI = "hindi"
    MARATHI = "marathi"


class DetailLevelEnum(str, Enum):
    BRIEF = "brief"
    MEDIUM = "medium"
    DETAILED = "detailed"


class CommunicationObjectiveEnum(str, Enum):
    INFORM = "inform"
    BRIEF = "brief"
    ADVISE = "advise"
    EXPLAIN = "explain"
    RECOMMEND = "recommend"


class TransformationConfig(BaseModel):
    """Structured configuration parameters for content transformation."""
    audience: AudienceEnum = Field(
        default=AudienceEnum.SENIOR_OFFICIALS,
        description="Target recipient audience ('senior_officials', 'technical_personnel', 'field_personnel', 'general_audience')"
    )
    tone: ToneEnum = Field(
        default=ToneEnum.FORMAL,
        description="Communication tone ('formal', 'technical', 'neutral', 'simplified')"
    )
    language: LanguageEnum = Field(
        default=LanguageEnum.ENGLISH,
        description="Target output language ('english', 'hindi', 'marathi')"
    )
    detail_level: DetailLevelEnum = Field(
        default=DetailLevelEnum.MEDIUM,
        description="Depth of detail ('brief', 'medium', 'detailed')"
    )
    communication_objective: CommunicationObjectiveEnum = Field(
        default=CommunicationObjectiveEnum.INFORM,
        description="Core communication goal ('inform', 'brief', 'advise', 'explain', 'recommend')"
    )


class GenerateOutputsRequest(BaseModel):
    """Request payload for multi-output generation."""
    output_types: List[str] = Field(
        default_factory=lambda: ["executive_summary", "advisory", "presentation"],
        description="List of requested output types ('executive_summary', 'advisory', 'presentation', 'social_media', 'infographic')"
    )
    configuration: Optional[TransformationConfig] = Field(
        default_factory=TransformationConfig,
        description="Transformation configuration settings for audience, tone, language, detail level, and objective"
    )


class ExecutiveSummaryOutput(BaseModel):
    """Structured Executive Summary output model."""
    title: str = Field(..., description="Document / Summary Title")
    executive_summary: str = Field(..., description="High-level executive briefing paragraph")
    key_points: List[str] = Field(default_factory=list, description="Core bullet points for senior leadership")
    important_statistics: List[Statistic] = Field(default_factory=list, description="Extracted numerical metrics")
    risks: List[Risk] = Field(default_factory=list, description="Operational risks and concerns")
    recommendations: List[Recommendation] = Field(default_factory=list, description="Proposed actionable steps")
    source_references: List[SourceReference] = Field(default_factory=list, description="Page citations and text excerpts")


class AdvisoryOutput(BaseModel):
    """Structured Actionable Advisory output model."""
    title: str = Field(..., description="Advisory Title")
    situation: str = Field(..., description="Current situation briefing")
    key_findings: List[KeyFinding] = Field(default_factory=list, description="Key analytical findings")
    risk_assessment: str = Field(..., description="Comprehensive risk assessment overview")
    recommended_actions: List[Recommendation] = Field(default_factory=list, description="Actionable directives")
    priority: str = Field("High", description="Advisory urgency/priority level (Critical, High, Medium, Low)")
    intended_audience: str = Field("Senior Officials", description="Target recipient audience")
    source_references: List[SourceReference] = Field(default_factory=list, description="Page citations and text excerpts")


class PresentationSlide(BaseModel):
    """Individual slide content model."""
    slide_number: int = Field(..., description="Sequential slide number")
    title: str = Field(..., description="Slide headline title")
    key_points: List[str] = Field(default_factory=list, description="Bullet points for slide presentation")
    speaker_notes: str = Field("", description="Detailed speaker talking points and context")
    source_references: List[SourceReference] = Field(default_factory=list, description="Page citations for slide content")


class PresentationOutput(BaseModel):
    """Structured Presentation Slide Deck content model."""
    title: str = Field(..., description="Presentation Title")
    subtitle: str = Field(..., description="Presentation Subtitle or Deck Overview")
    slides: List[PresentationSlide] = Field(default_factory=list, description="Ordered list of presentation slides")


class SocialMediaPost(BaseModel):
    """Individual social media post model."""
    post_id: str = Field(..., description="Unique post identifier (e.g. post_1)")
    platform: str = Field(..., description="Target platform ('linkedin' or 'x')")
    content: str = Field(..., description="Post text body")
    hashtags: List[str] = Field(default_factory=list, description="Relevant hashtags")
    source_references: List[SourceReference] = Field(default_factory=list, description="Source page citations for post content")


class SocialMediaOutput(BaseModel):
    """Structured Social Media content output model."""
    title: str = Field(..., description="Campaign or Output Title")
    platform: str = Field(..., description="Primary social platform ('linkedin', 'x', 'multi_platform')")
    posts: List[SocialMediaPost] = Field(default_factory=list, description="List of social media posts or thread items")
    hashtags: List[str] = Field(default_factory=list, description="Overall post hashtags")
    source_references: List[SourceReference] = Field(default_factory=list, description="Page citations and excerpts")


class InfographicSection(BaseModel):
    """Section specification within an infographic content model."""
    heading: str = Field(..., description="Section headline")
    content: str = Field(..., description="Section narrative text or bullet points")
    suggested_visual: str = Field(
        ...,
        description="Recommended visualization type ('timeline', 'bar_chart', 'number_highlight', 'process_flow', 'comparison', 'map')"
    )
    source_references: List[SourceReference] = Field(default_factory=list, description="Source page citations")


class InfographicOutput(BaseModel):
    """Structured Infographic specification content model."""
    title: str = Field(..., description="Infographic Main Title")
    subtitle: str = Field(..., description="Infographic Subtitle or Theme")
    sections: List[InfographicSection] = Field(default_factory=list, description="Ordered list of visual infographic sections")
    key_statistics: List[Statistic] = Field(default_factory=list, description="Key numerical metrics highlighted")
    key_takeaways: List[str] = Field(default_factory=list, description="Summary takeaways for visual display")
    source_references: List[SourceReference] = Field(default_factory=list, description="Page citations and excerpts")


class GeneratedOutputsResponse(BaseModel):
    """Combined response payload containing generated output models and partial failure errors."""
    document_id: str = Field(..., description="Unique document ID")
    executive_summary: Optional[ExecutiveSummaryOutput] = None
    advisory: Optional[AdvisoryOutput] = None
    presentation: Optional[PresentationOutput] = None
    social_media: Optional[SocialMediaOutput] = None
    infographic: Optional[InfographicOutput] = None
    configuration: Optional[TransformationConfig] = None
    errors: Dict[str, str] = Field(default_factory=dict, description="Error messages for any failed output types")
