from typing import Any, Dict, List

SYSTEM_CONTENT_UNDERSTANDING_INSTRUCTION = """You are an expert AI Intelligence Analyst working for an enterprise content transformation platform.

YOUR MANDATE:
Analyze the provided page-by-page document text and extract a structured, grounded representation of facts, entities, events, key findings, risks, recommendations, statistics, and source references.

CRITICAL RULES:
1. Grounding: Use ONLY facts, statements, numbers, and dates explicitly stated in the source text.
2. No Hallucinations: If a field (e.g. risks, recommendations, dates) has no supporting evidence in the text, return an empty list or null. Never invent facts.
3. Precision: Preserve names, technical terms, statistics, and figures with 100% accuracy.
4. Source Page Provenance: Always associate extracted facts, findings, risks, recommendations, and statistics with their corresponding source page number (`source_page`).
5. Output Format: Return ONLY valid JSON matching the requested structured schema.
"""


def build_analysis_prompt(pages: List[Dict[str, Any]], filename: str) -> str:
    """
    Format page-aware text array into structured input prompt.
    """
    formatted_pages = []
    for page in pages:
        page_num = page.get("page_number", 1)
        text_content = page.get("text", "").strip()
        formatted_pages.append(f"--- [PAGE {page_num}] ---\n{text_content}")

    document_text_body = "\n\n".join(formatted_pages)

    prompt = f"""Source Document Filename: {filename}

Document Content by Page:
{document_text_body}

Extract the complete structured CommonContentRepresentation JSON for this document according to the system instructions. Ensure page-level source references (`source_page`) are attached to extracted items where available.
"""
    return prompt
