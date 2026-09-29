import unittest
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from app.core.config import settings
from app.services.gemini_rotator import extract_and_parse_json, call_gemini_with_rotation
from app.schemas.output_schemas import ExecutiveSummaryOutput
from app.schemas.content_representation import CommonContentRepresentation


class TestLocalLLMIntegration(unittest.TestCase):

    def test_extract_and_parse_json_direct(self):
        sample = '{"title": "Test Title", "executive_summary": "Summary text", "key_points": [], "important_statistics": [], "risks": [], "recommendations": [], "source_references": []}'
        res = extract_and_parse_json(sample, ExecutiveSummaryOutput)
        self.assertEqual(res.title, "Test Title")
        self.assertEqual(res.executive_summary, "Summary text")

    def test_extract_and_parse_json_with_codeblock_markdown(self):
        sample = '```json\n{"title": "Markdown Title", "executive_summary": "Extracted from markdown fence", "key_points": []}\n```'
        res = extract_and_parse_json(sample, ExecutiveSummaryOutput)
        self.assertEqual(res.title, "Markdown Title")

    def test_extract_and_parse_json_with_schema_wrapper(self):
        sample = '{"ExecutiveSummaryOutput": {"title": "Wrapped Title", "executive_summary": "Unwrapped successfully"}}'
        res = extract_and_parse_json(sample, ExecutiveSummaryOutput)
        self.assertEqual(res.title, "Wrapped Title")

    def test_call_local_llm_live(self):
        """Test against running local llama-server if available."""
        import httpx
        try:
            r = httpx.get(f"{settings.LOCAL_LLM_URL.rstrip('/')}/health", timeout=1.0)
            server_available = r.status_code == 200
        except Exception:
            try:
                r = httpx.get("http://127.0.0.1:8080/health", timeout=1.0)
                server_available = r.status_code == 200
            except Exception:
                server_available = False

        if not server_available:
            self.skipTest("Local llama-server not running on port 8080.")

        res = call_gemini_with_rotation(
            prompt="Generate a brief executive summary for a network defense inspection.",
            system_instruction="You are an AI generating structured executive summaries.",
            response_schema=ExecutiveSummaryOutput,
            temperature=0.1,
        )
        self.assertIsInstance(res, ExecutiveSummaryOutput)
        self.assertTrue(len(res.title) > 0)
        self.assertTrue(len(res.executive_summary) > 0)


if __name__ == "__main__":
    unittest.main()
