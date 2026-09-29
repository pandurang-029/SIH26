from typing import List, Optional
from pydantic import BaseModel, Field


class SourceReference(BaseModel):
    """Source page and exact supporting text excerpt grounding."""
    page_number: int = Field(..., description="Source page number where text appears")
    supporting_text: str = Field(..., description="Relevant text snippet from source document")


class KeyFact(BaseModel):
    """Core fact extracted directly from source text."""
    fact: str = Field(..., description="Factual statement from the document")
    source_page: Optional[int] = Field(None, description="Page number where fact is found")


class Entity(BaseModel):
    """Named entity identified in text."""
    name: str = Field(..., description="Entity name or identifier")
    type: str = Field(..., description="Entity category (e.g. Organization, Person, System, Location, Policy)")
    source_page: Optional[int] = Field(None, description="Page number reference")


class Event(BaseModel):
    """Event or timeline occurrence mentioned in source."""
    description: str = Field(..., description="Event description")
    date: Optional[str] = Field(None, description="Date or timeframe associated with event")
    source_page: Optional[int] = Field(None, description="Page number reference")


class KeyFinding(BaseModel):
    """Key analytical finding extracted from document."""
    finding: str = Field(..., description="Analytical finding or insight")
    importance: Optional[str] = Field("High", description="Level of importance (High, Medium, Low)")
    source_page: Optional[int] = Field(None, description="Page number reference")


class Risk(BaseModel):
    """Identified risk, vulnerability, or operational challenge."""
    risk: str = Field(..., description="Description of identified risk or concern")
    severity: Optional[str] = Field("Medium", description="Severity level (Critical, High, Medium, Low)")
    source_page: Optional[int] = Field(None, description="Page number reference")


class Recommendation(BaseModel):
    """Actionable recommendation explicitly stated in source."""
    recommendation: str = Field(..., description="Actionable advice or proposed solution")
    priority: Optional[str] = Field("Medium", description="Implementation priority (High, Medium, Low)")
    source_page: Optional[int] = Field(None, description="Page number reference")


class Statistic(BaseModel):
    """Numerical metric or quantitative data point."""
    metric: str = Field(..., description="Name or description of measured metric")
    value: str = Field(..., description="Quantitative value or figure")
    context: Optional[str] = Field("", description="Contextual explanation of metric")
    source_page: Optional[int] = Field(None, description="Page number reference")


class CommonContentRepresentation(BaseModel):
    """
    Normalized, structured representation of document intelligence.
    Serves as the single source of truth for all future output generators.
    """
    document_title: str = Field(..., description="Extracted or inferred title of source document")
    document_topic: str = Field(..., description="Core subject area or domain of document")
    executive_context: str = Field(..., description="Executive summary paragraph explaining document scope")
    key_facts: List[KeyFact] = Field(default_factory=list, description="Extracted factual assertions")
    entities: List[Entity] = Field(default_factory=list, description="Key organizations, systems, or people")
    events: List[Event] = Field(default_factory=list, description="Chronological or key events")
    key_findings: List[KeyFinding] = Field(default_factory=list, description="Major findings or insights")
    risks: List[Risk] = Field(default_factory=list, description="Identified risks or threats")
    recommendations: List[Recommendation] = Field(default_factory=list, description="Proposed actions")
    important_statistics: List[Statistic] = Field(default_factory=list, description="Key numerical metrics")
    source_references: List[SourceReference] = Field(default_factory=list, description="Page grounding excerpts")
