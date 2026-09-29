"""
Pydantic Schemas for AI Quality Control & Provenance Verification Layer.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class ClaimProvenance(BaseModel):
    """Structured representation of an extracted claim and its provenance verification."""
    claim_id: str = Field(..., description="Unique claim identifier (e.g. claim_1)")
    claim_text: str = Field(..., description="Exact claim text extracted from generated output")
    claim_type: str = Field(
        ...,
        description="Type of claim ('statistic', 'finding', 'risk', 'recommendation', 'date', 'entity', 'general_statement')"
    )
    support_status: str = Field(
        ...,
        description="Allowed status: 'supported', 'partially_supported', 'unsupported', 'recommendation'"
    )
    source_pages: List[int] = Field(default_factory=list, description="Inherited source page numbers from CCR")
    supporting_text: List[str] = Field(default_factory=list, description="Supporting text quotes inherited from CCR")
    confidence: Optional[str] = Field(None, description="Categorical confidence ('high', 'medium', 'low', or None)")
    reason: str = Field(..., description="Detailed explanation of quality check match or conflict result")
    slide_number: Optional[int] = Field(None, description="Slide number if claim is from a Presentation slide")
    output_type: str = Field(..., description="Source output type ('executive_summary', 'advisory', 'presentation')")


class QualityControlReport(BaseModel):
    """Aggregated Quality Control and Provenance Verification Report."""
    document_id: str = Field(..., description="Unique document ID")
    overall_status: str = Field(..., description="Allowed status: 'passed', 'review_required', 'failed'")
    total_claims: int = Field(..., description="Total extracted claims evaluated")
    supported_claims: int = Field(..., description="Count of fully supported claims")
    partially_supported_claims: int = Field(..., description="Count of partially supported claims")
    unsupported_claims: int = Field(..., description="Count of unsupported or conflicting claims")
    recommendations: int = Field(..., description="Count of distinct recommendation items")
    claims: List[ClaimProvenance] = Field(default_factory=list, description="Detailed list of claim provenance items")


class QualityCheckRequest(BaseModel):
    """Payload for Quality Check API request."""
    output_types: List[str] = Field(
        default_factory=lambda: ["executive_summary", "advisory", "presentation"],
        description="List of target output types to evaluate"
    )
