"""
Quality Control & Provenance Verification Service.
Performs lightweight, deterministic claim extraction and matching against the CommonContentRepresentation (CCR).
CCR remains the SINGLE SOURCE OF TRUTH. Zero Gemini calls during quality check.
"""
import re
import logging
from typing import List, Dict, Any, Optional
from app.schemas.content_representation import CommonContentRepresentation
from app.schemas.output_schemas import (
    ExecutiveSummaryOutput,
    AdvisoryOutput,
    PresentationOutput,
    SocialMediaOutput,
    InfographicOutput,
)
from app.schemas.quality_schemas import ClaimProvenance, QualityControlReport

logger = logging.getLogger(__name__)


class QualityService:
    """
    Deterministic Quality Control & Provenance Verification Engine.
    Extracted claims are compared against the Common Content Representation (CCR).
    """

    @classmethod
    def generate_report(
        cls,
        document_id: str,
        ccr: CommonContentRepresentation,
        outputs: Dict[str, Any],
        output_types: List[str],
    ) -> QualityControlReport:
        all_claims: List[ClaimProvenance] = []
        claim_counter = 1

        for out_type in output_types:
            clean_type = out_type.lower().strip()
            model_data = outputs.get(clean_type)

            if not model_data:
                continue

            extracted = cls._extract_claims_from_output(model_data, clean_type, claim_counter)
            claim_counter += len(extracted)

            for claim in extracted:
                verified = cls._verify_claim(claim, ccr)
                all_claims.append(verified)

        # Compute summary metrics
        total = len(all_claims)
        supported = sum(1 for c in all_claims if c.support_status == "supported")
        partially_supported = sum(1 for c in all_claims if c.support_status == "partially_supported")
        unsupported = sum(1 for c in all_claims if c.support_status == "unsupported")
        recs = sum(1 for c in all_claims if c.support_status == "recommendation")

        # Determine overall quality status
        if unsupported > 0:
            overall_status = "failed"
        elif partially_supported > 0:
            overall_status = "review_required"
        else:
            overall_status = "passed"

        return QualityControlReport(
            document_id=document_id,
            overall_status=overall_status,
            total_claims=total,
            supported_claims=supported,
            partially_supported_claims=partially_supported,
            unsupported_claims=unsupported,
            recommendations=recs,
            claims=all_claims,
        )

    @classmethod
    def _extract_claims_from_output(
        cls, model_data: Any, output_type: str, start_id: int
    ) -> List[ClaimProvenance]:
        claims: List[ClaimProvenance] = []
        curr_id = start_id

        if isinstance(model_data, dict):
            # Dict payload conversion if passed raw
            if output_type == "executive_summary":
                model_data = ExecutiveSummaryOutput(**model_data)
            elif output_type == "advisory":
                model_data = AdvisoryOutput(**model_data)
            elif output_type == "presentation":
                model_data = PresentationOutput(**model_data)
            elif output_type == "social_media":
                model_data = SocialMediaOutput(**model_data)
            elif output_type == "infographic":
                model_data = InfographicOutput(**model_data)

        if isinstance(model_data, ExecutiveSummaryOutput):
            # 1. Statistics
            for stat in model_data.important_statistics or []:
                pages = [stat.source_page] if stat.source_page else []
                claims.append(
                    ClaimProvenance(
                        claim_id=f"claim_{curr_id}",
                        claim_text=f"{stat.metric}: {stat.value}",
                        claim_type="statistic",
                        support_status="supported" if pages else "partially_supported",
                        source_pages=pages,
                        supporting_text=[],
                        confidence="high" if pages else "medium",
                        reason=f"Extracted numerical metric '{stat.metric}'",
                        output_type=output_type,
                    )
                )
                curr_id += 1

            # 2. Key Points
            for pt in model_data.key_points or []:
                is_rec = any(w in pt.lower() for w in ["should", "recommend", "advise", "must", "upgrade", "deploy", "implement"])
                claims.append(
                    ClaimProvenance(
                        claim_id=f"claim_{curr_id}",
                        claim_text=pt,
                        claim_type="recommendation" if is_rec else "finding",
                        support_status="recommendation" if is_rec else "unsupported",
                        source_pages=[],
                        supporting_text=[],
                        confidence="high" if is_rec else None,
                        reason="Actionable recommendation Directive" if is_rec else "Executive decision point",
                        output_type=output_type,
                    )
                )
                curr_id += 1

            # 3. Risks
            for rk in model_data.risks or []:
                pages = [rk.source_page] if rk.source_page else []
                claims.append(
                    ClaimProvenance(
                        claim_id=f"claim_{curr_id}",
                        claim_text=rk.risk,
                        claim_type="risk",
                        support_status="supported" if pages else "partially_supported",
                        source_pages=pages,
                        supporting_text=[],
                        confidence="high" if pages else "medium",
                        reason="Identified operational risk",
                        output_type=output_type,
                    )
                )
                curr_id += 1

            # 4. Recommendations
            for rec in model_data.recommendations or []:
                pages = [rec.source_page] if rec.source_page else []
                claims.append(
                    ClaimProvenance(
                        claim_id=f"claim_{curr_id}",
                        claim_text=rec.recommendation,
                        claim_type="recommendation",
                        support_status="recommendation",
                        source_pages=pages,
                        supporting_text=[],
                        confidence="high",
                        reason="Strategic recommendation directive",
                        output_type=output_type,
                    )
                )
                curr_id += 1

        elif isinstance(model_data, AdvisoryOutput):
            # 1. Situation Briefing
            if model_data.situation:
                claims.append(
                    ClaimProvenance(
                        claim_id=f"claim_{curr_id}",
                        claim_text=model_data.situation,
                        claim_type="general_statement",
                        support_status="unsupported",
                        source_pages=[],
                        supporting_text=[],
                        confidence=None,
                        reason="Advisory situation briefing overview",
                        output_type=output_type,
                    )
                )
                curr_id += 1

            # 2. Key Findings
            for kf in model_data.key_findings or []:
                pages = [kf.source_page] if kf.source_page else []
                claims.append(
                    ClaimProvenance(
                        claim_id=f"claim_{curr_id}",
                        claim_text=kf.finding,
                        claim_type="finding",
                        support_status="supported" if pages else "partially_supported",
                        source_pages=pages,
                        supporting_text=[],
                        confidence="high" if pages else "medium",
                        reason="Advisory key analytical finding",
                        output_type=output_type,
                    )
                )
                curr_id += 1

            # 3. Recommended Actions
            for ra in model_data.recommended_actions or []:
                pages = [ra.source_page] if ra.source_page else []
                claims.append(
                    ClaimProvenance(
                        claim_id=f"claim_{curr_id}",
                        claim_text=ra.recommendation,
                        claim_type="recommendation",
                        support_status="recommendation",
                        source_pages=pages,
                        supporting_text=[],
                        confidence="high",
                        reason="Advisory recommended action directive",
                        output_type=output_type,
                    )
                )
                curr_id += 1

        elif isinstance(model_data, PresentationOutput):
            for slide in model_data.slides or []:
                for pt in slide.key_points or []:
                    is_rec = any(w in pt.lower() for w in ["should", "recommend", "advise", "must", "upgrade", "deploy", "implement"])
                    claims.append(
                        ClaimProvenance(
                            claim_id=f"claim_{curr_id}",
                            claim_text=pt,
                            claim_type="recommendation" if is_rec else "finding",
                            support_status="recommendation" if is_rec else "unsupported",
                            source_pages=[],
                            supporting_text=[],
                            confidence="high" if is_rec else None,
                            reason=f"Slide {slide.slide_number} bullet statement",
                            slide_number=slide.slide_number,
                            output_type=output_type,
                        )
                    )
                    curr_id += 1

        elif isinstance(model_data, SocialMediaOutput):
            for post in model_data.posts or []:
                pages = [ref.page_number for ref in post.source_references if ref.page_number]
                if not pages and model_data.source_references:
                    pages = [ref.page_number for ref in model_data.source_references if ref.page_number]

                claims.append(
                    ClaimProvenance(
                        claim_id=f"claim_{curr_id}",
                        claim_text=post.content,
                        claim_type="finding",
                        support_status="supported" if pages else "partially_supported",
                        source_pages=pages,
                        supporting_text=[],
                        confidence="high" if pages else "medium",
                        reason=f"Social media post ({post.platform}) content",
                        output_type=output_type,
                    )
                )
                curr_id += 1

        elif isinstance(model_data, InfographicOutput):
            for stat in model_data.key_statistics or []:
                pages = [stat.source_page] if stat.source_page else []
                claims.append(
                    ClaimProvenance(
                        claim_id=f"claim_{curr_id}",
                        claim_text=f"{stat.metric}: {stat.value}",
                        claim_type="statistic",
                        support_status="supported" if pages else "partially_supported",
                        source_pages=pages,
                        supporting_text=[],
                        confidence="high" if pages else "medium",
                        reason=f"Infographic key statistic '{stat.metric}'",
                        output_type=output_type,
                    )
                )
                curr_id += 1

            for sec in model_data.sections or []:
                pages = [ref.page_number for ref in sec.source_references if ref.page_number]
                claims.append(
                    ClaimProvenance(
                        claim_id=f"claim_{curr_id}",
                        claim_text=f"{sec.heading}: {sec.content}",
                        claim_type="finding",
                        support_status="supported" if pages else "partially_supported",
                        source_pages=pages,
                        supporting_text=[],
                        confidence="high" if pages else "medium",
                        reason=f"Infographic section '{sec.heading}'",
                        output_type=output_type,
                    )
                )
                curr_id += 1

            for kt in model_data.key_takeaways or []:
                is_rec = any(w in kt.lower() for w in ["should", "recommend", "advise", "must", "upgrade", "deploy", "implement"])
                claims.append(
                    ClaimProvenance(
                        claim_id=f"claim_{curr_id}",
                        claim_text=kt,
                        claim_type="recommendation" if is_rec else "finding",
                        support_status="recommendation" if is_rec else "unsupported",
                        source_pages=[],
                        supporting_text=[],
                        confidence="high" if is_rec else None,
                        reason="Infographic key takeaway statement",
                        output_type=output_type,
                    )
                )
                curr_id += 1

        return claims

    @classmethod
    def _verify_claim(
        cls, claim: ClaimProvenance, ccr: CommonContentRepresentation
    ) -> ClaimProvenance:
        # Recommendations remain classified separately
        if claim.support_status == "recommendation" or claim.claim_type == "recommendation":
            claim.support_status = "recommendation"
            claim.confidence = "high"
            if not claim.reason:
                claim.reason = "Recommendation classified separately from factual statements."
            # Inherit source references if available in CCR recommendations
            cls._populate_source_refs_from_ccr(claim, ccr)
            return claim

        text = claim.claim_text.lower().strip()

        # 1. Check for numerical values and metrics
        numbers_in_claim = re.findall(r"\b\d+(?:\.\d+)?%?\b", claim.claim_text)
        if numbers_in_claim:
            claim.claim_type = "statistic"
            matched_stat, is_conflicting, conflict_val = cls._match_statistic_in_ccr(numbers_in_claim, text, ccr)

            if is_conflicting:
                claim.support_status = "unsupported"
                claim.confidence = "high"
                claim.reason = f"Numerical value conflict detected (Generated claim contains '{numbers_in_claim[0]}', whereas CCR records '{conflict_val}')."
                return claim

            if matched_stat:
                claim.support_status = "supported"
                claim.confidence = "high"
                claim.reason = f"Verified against CCR statistic '{matched_stat.get('metric', '')}' ({matched_stat.get('value', '')})."
                if matched_stat.get("source_page"):
                    claim.source_pages = [matched_stat["source_page"]]
                cls._populate_source_refs_from_ccr(claim, ccr)
                return claim

        # 2. Match against CCR Key Findings and Key Facts
        for kf in ccr.key_findings or []:
            finding_text = kf.finding.lower()
            if cls._text_similarity_match(text, finding_text):
                claim.support_status = "supported"
                claim.confidence = "high"
                claim.reason = f"Matches CCR Key Finding: '{kf.finding}'"
                if kf.source_page:
                    claim.source_pages = [kf.source_page]
                cls._populate_source_refs_from_ccr(claim, ccr)
                return claim

        for fact in ccr.key_facts or []:
            fact_text = fact.fact.lower()
            if cls._text_similarity_match(text, fact_text):
                claim.support_status = "supported"
                claim.confidence = "high"
                claim.reason = f"Matches CCR Key Fact: '{fact.fact}'"
                if fact.source_page:
                    claim.source_pages = [fact.source_page]
                cls._populate_source_refs_from_ccr(claim, ccr)
                return claim

        # 3. Match against CCR Entities
        for ent in ccr.entities or []:
            ent_name = ent.name.lower()
            if ent_name in text:
                claim.support_status = "supported" if claim.source_pages else "partially_supported"
                claim.confidence = "medium"
                claim.reason = f"Refers to validated entity '{ent.name}' in CCR"
                if ent.source_page and not claim.source_pages:
                    claim.source_pages = [ent.source_page]
                cls._populate_source_refs_from_ccr(claim, ccr)
                return claim

        # 4. Match against CCR Events
        for ev in ccr.events or []:
            ev_desc = ev.description.lower()
            if ev_desc in text or text in ev_desc:
                claim.support_status = "supported"
                claim.confidence = "high"
                claim.reason = f"Matches CCR Event: '{ev.description}'"
                if ev.source_page:
                    claim.source_pages = [ev.source_page]
                cls._populate_source_refs_from_ccr(claim, ccr)
                return claim

        # 5. Check if claim already has inherited source pages from Step 5 generator
        if claim.source_pages:
            claim.support_status = "supported"
            claim.confidence = "medium"
            claim.reason = "Supported by CCR document context and page references."
            cls._populate_source_refs_from_ccr(claim, ccr)
            return claim

        # 6. Fallback: Factual claim not grounded in CCR
        claim.support_status = "unsupported"
        claim.confidence = "medium"
        claim.reason = "Claim contains factual assertions not found in validated CCR."
        return claim

    @classmethod
    def _match_statistic_in_ccr(
        cls, numbers: List[str], claim_text: str, ccr: CommonContentRepresentation
    ) -> tuple[Optional[dict], bool, Optional[str]]:
        # Compare numbers against ccr.important_statistics
        for stat in ccr.important_statistics or []:
            stat_val = str(stat.value).lower()
            stat_metric = str(stat.metric).lower()

            # Exact number match
            for num in numbers:
                if num in stat_val or stat_val in num:
                    return stat.model_dump(), False, None

            # Metric name matches but number is conflicting
            if any(w in claim_text for w in stat_metric.split() if len(w) > 3):
                for num in numbers:
                    if num not in stat_val and stat_val not in num:
                        return None, True, stat_val

        # Check ccr.key_facts for number match
        for fact in ccr.key_facts or []:
            fact_text = fact.fact.lower()
            for num in numbers:
                if num in fact_text:
                    return {"metric": fact.fact, "value": num, "source_page": fact.source_page}, False, None

        return None, False, None

    @classmethod
    def _text_similarity_match(cls, t1: str, t2: str) -> bool:
        """Lightweight keyword overlap similarity check."""
        words1 = set(w for w in re.findall(r"\w+", t1) if len(w) > 3)
        words2 = set(w for w in re.findall(r"\w+", t2) if len(w) > 3)
        if not words1 or not words2:
            return False
        overlap = words1.intersection(words2)
        return len(overlap) >= min(len(words1), len(words2)) * 0.4 or len(overlap) >= 2

    @classmethod
    def _populate_source_refs_from_ccr(
        cls, claim: ClaimProvenance, ccr: CommonContentRepresentation
    ):
        """Inherit supporting text quotes from CCR source_references matching claim source_pages."""
        if not claim.source_pages:
            return

        supporting = []
        for ref in ccr.source_references or []:
            if ref.page_number in claim.source_pages and ref.supporting_text:
                if ref.supporting_text not in supporting:
                    supporting.append(ref.supporting_text)

        claim.supporting_text = supporting
