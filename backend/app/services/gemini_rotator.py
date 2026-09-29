import json
import logging
import threading
import time
from typing import Any, Dict, List, Optional, Type
from pydantic import BaseModel
from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiKeyRotator:
    """
    Thread-safe round-robin API key rotator with per-key exhaustion tracking.

    When a key hits a quota / rate-limit error it is temporarily marked as
    exhausted and the rotator moves to the next available key. Keys are
    re-enabled after `cooldown_seconds` (default 60s) so they can be retried
    once their quota window resets.
    """

    def __init__(self, keys: List[str], cooldown_seconds: float = 60.0) -> None:
        if not keys and settings.LLM_PROVIDER.lower() != "local":
            raise ValueError(
                "No Gemini API keys configured. "
                "Set GEMINI_API_KEYS or GEMINI_API_KEY in backend/.env, or set LLM_PROVIDER=local."
            )
        self._keys = keys or ["local-llm-mode"]
        self._cooldown = cooldown_seconds
        self._index = 0
        self._exhausted_until: Dict[str, float] = {}  # key -> epoch when re-enabled
        self._lock = threading.Lock()

    @property
    def total(self) -> int:
        return len(self._keys)

    def get_current(self) -> str:
        """Return the active key without advancing the index."""
        with self._lock:
            return self._keys[self._index % len(self._keys)]

    def mark_exhausted(self, key: str) -> Optional[str]:
        """
        Mark *key* as quota-exhausted and rotate to the next available key.
        Returns the new active key, or None if ALL keys are currently exhausted.
        """
        with self._lock:
            self._exhausted_until[key] = time.monotonic() + self._cooldown
            key_num = self._keys.index(key) + 1 if key in self._keys else -1
            logger.warning(
                "Gemini key #%d marked exhausted (cooldown %.0fs). Rotating to next key...",
                key_num,
                self._cooldown,
            )
            return self._rotate_locked()

    def next_key(self) -> Optional[str]:
        """Advance to the next non-exhausted key and return it."""
        with self._lock:
            return self._rotate_locked()

    def _rotate_locked(self) -> Optional[str]:
        """Must be called with self._lock held."""
        now = time.monotonic()
        for _ in range(len(self._keys)):
            self._index = (self._index + 1) % len(self._keys)
            candidate = self._keys[self._index]
            if now >= self._exhausted_until.get(candidate, 0):
                logger.info(
                    "GeminiKeyRotator: switched to key #%d of %d.",
                    self._index + 1,
                    len(self._keys),
                )
                return candidate
        # All keys exhausted
        logger.error("GeminiKeyRotator: all %d API keys are currently exhausted.", len(self._keys))
        return None


# Module-level singleton rotator – shared across document analysis and all output generators
_shared_rotator: Optional[GeminiKeyRotator] = None
_rotator_lock = threading.Lock()


def get_gemini_rotator() -> GeminiKeyRotator:
    """Return (or lazily create) the shared GeminiKeyRotator singleton."""
    global _shared_rotator
    if _shared_rotator is None:
        with _rotator_lock:
            if _shared_rotator is None:
                keys = settings.get_api_keys()
                if not keys and settings.LLM_PROVIDER.lower() == "local":
                    keys = ["local-llm-mode"]
                _shared_rotator = GeminiKeyRotator(keys)
    return _shared_rotator


def is_quota_error(err: Exception) -> bool:
    """Check if exception represents a quota / 429 / resource exhausted error."""
    err_str = str(err).lower()
    quota_indicators = [
        "quota",
        "429",
        "rate limit",
        "rate_limit",
        "resource_exhausted",
        "resourceexhausted",
        "generaterequestsperday",
    ]
    if any(q in err_str for q in quota_indicators):
        return True

    code = getattr(err, "code", None)
    if code in (429, "429", "RESOURCE_EXHAUSTED"):
        return True
    status_code = getattr(err, "status_code", None)
    if status_code in (429, "429"):
        return True
    return False


def extract_and_parse_json(raw_text: str, response_schema: Type[BaseModel]) -> BaseModel:
    """Robustly extract, unwrap, and parse structured JSON from LLM output into Pydantic model."""
    text = raw_text.strip()

    # Strip markdown code blocks
    if "```json" in text:
        text = text.split("```json", 1)[1].split("```", 1)[0].strip()
    elif "```" in text:
        text = text.split("```", 1)[1].split("```", 1)[0].strip()

    first_brace = text.find("{")
    last_brace = text.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        text = text[first_brace : last_brace + 1]

    data = json.loads(text)

    # Unwrap top-level schema name if the LLM placed fields under {"SchemaName": {...}}
    schema_name = response_schema.__name__
    if schema_name in data and isinstance(data[schema_name], dict):
        data = data[schema_name]
    elif len(data) == 1 and isinstance(next(iter(data.values())), dict):
        first_val = next(iter(data.values()))
        schema_fields = set(response_schema.model_fields.keys())
        if any(f in first_val for f in schema_fields):
            data = first_val

    return response_schema.model_validate(data)


def call_local_llm(
    prompt: str,
    system_instruction: str,
    response_schema: Type[BaseModel],
    temperature: float = 0.1,
    timeout: Optional[float] = None,
) -> Any:
    """
    Execute structured content generation call against local OpenAI-compatible
    endpoint (llama-server running Qwen 2.5 3B Instruct).
    """
    import httpx

    schema_json = json.dumps(response_schema.model_json_schema(), indent=2)
    full_system = (
        f"{system_instruction}\n\n"
        f"CRITICAL REQUIREMENT: Respond ONLY with a direct, valid JSON object conforming to the schema below. "
        f"Do NOT nest under an outer wrapper object. Do NOT include markdown code blocks, "
        f"explanations, or conversational text outside the JSON.\n"
        f"JSON Schema:\n{schema_json}"
    )

    url = f"{settings.LOCAL_LLM_URL.rstrip('/')}/chat/completions"
    payload = {
        "model": settings.LOCAL_LLM_MODEL,
        "messages": [
            {"role": "system", "content": full_system},
            {"role": "user", "content": prompt},
        ],
        "temperature": temperature,
        "response_format": {"type": "json_object"},
    }

    req_timeout = timeout or settings.LOCAL_LLM_TIMEOUT

    try:
        with httpx.Client(timeout=req_timeout) as client:
            resp = client.post(url, json=payload)
            resp.raise_for_status()
            res_data = resp.json()

        choices = res_data.get("choices", [])
        if not choices:
            raise ValueError("No completions returned from local LLM.")
        raw_text = choices[0].get("message", {}).get("content", "")
        if not raw_text or not raw_text.strip():
            raise ValueError("Empty completion text returned from local LLM.")

        return extract_and_parse_json(raw_text, response_schema)

    except (httpx.ConnectError, httpx.ConnectTimeout) as conn_err:
        logger.error("Local LLM connection failed: %s", conn_err)
        raise ValueError(
            f"Could not connect to local LLM server at {settings.LOCAL_LLM_URL}. "
            "Please ensure llama-server is running (use 'run_llm.bat' or run "
            "llama-server -hf Qwen/Qwen2.5-3B-Instruct-GGUF:Q4_K_M --port 8080)."
        )
    except httpx.HTTPStatusError as http_err:
        logger.error("Local LLM HTTP error: %s", http_err)
        raise ValueError(f"Local LLM returned HTTP error: {http_err.response.status_code}")
    except json.JSONDecodeError as json_err:
        logger.error("Local LLM response is not valid JSON: %s", json_err)
        raise ValueError("Local LLM returned malformed JSON structured output.")
    except Exception as err:
        logger.error("Local LLM execution error: %s", err)
        raise


def call_gemini_with_rotation(
    prompt: str,
    system_instruction: str,
    response_schema: Type[BaseModel],
    model_name: Optional[str] = None,
    rotator: Optional[GeminiKeyRotator] = None,
    temperature: float = 0.1,
) -> Any:
    """
    Execute structured content generation.
    Dispatches to local LLM (Qwen via llama.cpp) when LLM_PROVIDER="local" (and no explicit Gemini rotator given),
    or Google Gemini with automatic key rotation when LLM_PROVIDER="gemini" or explicit rotator provided.
    """
    if settings.LLM_PROVIDER.lower() == "local" and rotator is None:
        return call_local_llm(
            prompt=prompt,
            system_instruction=system_instruction,
            response_schema=response_schema,
            temperature=temperature,
        )

    active_rotator = rotator or get_gemini_rotator()
    total_keys = active_rotator.total
    m_name = model_name or settings.GEMINI_MODEL or "gemini-3.5-flash"
    if m_name in ("gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-2.5-flash", "gemini-flash-latest", "gemini-3.6-flash", "gemini-3.8-flash"):
        m_name = "gemini-3.5-flash"

    last_exception: Optional[Exception] = None

    for key_attempt in range(total_keys):
        api_key = active_rotator.get_current()
        if not api_key or api_key.strip() == "" or api_key.startswith("your_"):
            raise ValueError(
                "GEMINI_API_KEY environment variable is not configured. "
                "Please add a valid GEMINI_API_KEY in backend/.env file."
            )

        max_retries = 2
        for attempt in range(max_retries + 1):
            try:
                from google import genai
                from google.genai import types

                client = genai.Client(api_key=api_key)
                response = client.models.generate_content(
                    model=m_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        response_mime_type="application/json",
                        response_schema=response_schema,
                        temperature=temperature,
                    ),
                )
                raw_json = response.text
                if not raw_json or not raw_json.strip():
                    raise ValueError("Received empty content response from Gemini API.")

                json_data = json.loads(raw_json)
                return response_schema(**json_data)

            except json.JSONDecodeError as json_err:
                logger.error("Gemini output is not valid JSON: %s", json_err)
                raise ValueError("AI service returned malformed structured response.")

            except Exception as err:
                err_msg = str(err).lower()

                if "api key" in err_msg or "invalid_argument" in err_msg:
                    logger.warning("Key #%d invalid or rejected: %s", key_attempt + 1, err)

                # Quota exhausted -> rotate key immediately
                if is_quota_error(err):
                    logger.warning(
                        "Quota/429 encountered on key #%d of %d. Rotating key immediately...",
                        key_attempt + 1,
                        total_keys,
                    )
                    next_key = active_rotator.mark_exhausted(api_key)
                    if next_key is None:
                        raise ValueError(
                            "All configured Gemini API keys have exceeded their quota. "
                            "Please add more keys to GEMINI_API_KEYS in .env or wait for quota reset."
                        )
                    api_key = next_key
                    break  # Break inner attempt loop to try with new key

                # Transient server errors (503 / timeout) -> retry on same key
                if any(t in err_msg for t in ["503", "unavailable", "timeout"]):
                    if attempt < max_retries:
                        time.sleep(1.0 * (attempt + 1))
                        continue
                    raise ValueError("AI service is temporarily unavailable. Please retry.")

                last_exception = err

    raise ValueError(
        f"AI generation failed after trying all {total_keys} configured key(s): "
        f"{str(last_exception or 'Unexpected error')}"
    )
