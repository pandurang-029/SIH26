import json
from app.schemas.content_representation import CommonContentRepresentation
from app.schemas.output_schemas import TransformationConfig

EXECUTIVE_SUMMARY_SYSTEM_INSTRUCTION = """You are transforming a validated Common Content Representation (CCR) into a structured Executive Summary.

CRITICAL INSTRUCTIONS:
1. Grounding: Use ONLY factual information present in the supplied CCR JSON. Do NOT invent or extrapolate facts.
2. Audience & Tone: Adapt vocabulary and style to the specified audience, tone, detail level, objective, and target language.
3. Multilingual Rules: If the target language is Hindi or Marathi, generate natural professional text while strictly preserving exact numbers, metrics, dates, and proper entity names. Do NOT alter facts.
4. Source Page References: Retain page citations (`source_page` or `source_references`) for all claims and statistics.
5. Output Format: Return ONLY valid JSON matching the requested ExecutiveSummaryOutput schema.
"""

ADVISORY_SYSTEM_INSTRUCTION = """You are transforming a validated Common Content Representation (CCR) into an Actionable Advisory.

CRITICAL INSTRUCTIONS:
1. Grounding: Use ONLY information present in the supplied CCR JSON. Do NOT invent risks, dates, or events.
2. Structure: Clearly articulate situation briefing, risk assessment, key findings, and recommended actions.
3. Audience & Multilingual: Adapt style to the specified audience, tone, detail level, and target language (English, Hindi, Marathi). Preserve numbers and proper names exactly.
4. Separation: Explicitly distinguish source-grounded facts from recommendations.
5. Source References: Retain source page citations where available.
6. Output Format: Return ONLY valid JSON matching the requested AdvisoryOutput schema.
"""

PRESENTATION_SYSTEM_INSTRUCTION = """You are transforming a validated Common Content Representation (CCR) into a structured Presentation Content Model (Slide Deck).

CRITICAL INSTRUCTIONS:
1. Structure: Generate a coherent 4-8 slide presentation deck adapted to the target audience, tone, and communication objective.
2. Grounding: Every factual slide point must rely ONLY on the supplied CCR.
3. Multilingual Rules: Support English, Hindi, and Marathi generation without altering numerical values or proper entity names.
4. Speaker Notes: Add informative, professional talking points for each slide based strictly on the CCR.
5. Source References: Include source page citations for factual claims on each slide.
6. Output Format: Return ONLY valid JSON matching the requested PresentationOutput schema.
"""

SOCIAL_MEDIA_SYSTEM_INSTRUCTION = """You are transforming a validated Common Content Representation (CCR) into a structured Social Media Campaign.

CRITICAL INSTRUCTIONS:
1. Grounding: Every factual post must rely ONLY on the supplied CCR JSON. Do NOT invent engagement claims or fake statistics.
2. Platforms: Generate professional posts for LinkedIn and concise thread posts for X.
3. Multilingual & Style: Adapt language (English, Hindi, Marathi) and tone according to configuration. Preserve numbers and proper entity names.
4. Hashtags: Include relevant organizational hashtags without fabricating fake organization names.
5. Source References: Retain source page citations for each post.
6. Output Format: Return ONLY valid JSON matching the requested SocialMediaOutput schema.
"""

INFOGRAPHIC_SYSTEM_INSTRUCTION = """You are transforming a validated Common Content Representation (CCR) into a structured Infographic Content Model.

CRITICAL INSTRUCTIONS:
1. Grounding: Content and statistics must rely ONLY on the supplied CCR JSON. Do NOT generate fake numerical visualizations.
2. Visual Types: Recommend appropriate visualization types ('timeline', 'bar_chart', 'number_highlight', 'process_flow', 'comparison', 'map') ONLY when supported by CCR data.
3. Multilingual & Style: Adapt language (English, Hindi, Marathi), tone, and detail level to configuration. Preserve exact metrics.
4. Source References: Include source page citations for each infographic section.
5. Output Format: Return ONLY valid JSON matching the requested InfographicOutput schema.
"""


def _build_config_header(config: TransformationConfig) -> str:
    return f"""Transformation Configuration Settings:
- Target Audience: {config.audience.value}
- Communication Tone: {config.tone.value}
- Target Output Language: {config.language.value}
- Depth of Detail: {config.detail_level.value}
- Communication Objective: {config.communication_objective.value}
"""


def build_executive_summary_prompt(ccr: CommonContentRepresentation, config: TransformationConfig) -> str:
    return f"""{_build_config_header(config)}

Common Content Representation (CCR) Input JSON:
{json.dumps(ccr.model_dump(), indent=2)}

Transform the above CCR into a structured ExecutiveSummaryOutput JSON response following the system instructions and configuration settings.
"""


def build_advisory_prompt(ccr: CommonContentRepresentation, config: TransformationConfig) -> str:
    return f"""{_build_config_header(config)}

Common Content Representation (CCR) Input JSON:
{json.dumps(ccr.model_dump(), indent=2)}

Transform the above CCR into a structured AdvisoryOutput JSON response following the system instructions and configuration settings.
"""


def build_presentation_prompt(ccr: CommonContentRepresentation, config: TransformationConfig) -> str:
    return f"""{_build_config_header(config)}

Common Content Representation (CCR) Input JSON:
{json.dumps(ccr.model_dump(), indent=2)}

Transform the above CCR into a structured PresentationOutput JSON response following the system instructions and configuration settings.
"""


def build_social_media_prompt(ccr: CommonContentRepresentation, config: TransformationConfig) -> str:
    return f"""{_build_config_header(config)}

Common Content Representation (CCR) Input JSON:
{json.dumps(ccr.model_dump(), indent=2)}

Transform the above CCR into a structured SocialMediaOutput JSON response following the system instructions and configuration settings.
"""


def build_infographic_prompt(ccr: CommonContentRepresentation, config: TransformationConfig) -> str:
    return f"""{_build_config_header(config)}

Common Content Representation (CCR) Input JSON:
{json.dumps(ccr.model_dump(), indent=2)}

Transform the above CCR into a structured InfographicOutput JSON response following the system instructions and configuration settings.
"""
