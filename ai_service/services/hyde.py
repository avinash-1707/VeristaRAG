import logging

from google import genai
from google.genai import errors as genai_errors
from google.genai import types

from config import settings

logger = logging.getLogger(__name__)

_client: genai.Client | None = None

_HYDE_PROMPT = (
    'Write a short passage (2-4 sentences) that would appear in a document and directly '
    'answer the following question. Use formal, document-like language. '
    'Output only the passage, no preamble or explanation.'
)


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.google_api_key)
    return _client


def _get_models() -> list[str]:
    return [m.strip() for m in settings.gemini_chat_models.split(',') if m.strip()]


async def generate_hypothetical(question: str) -> str:
    """Generate a hypothetical document passage that would answer the question.

    The passage uses corpus-like vocabulary, improving ANN and BM25 recall
    for indirect or paraphrased queries (HyDE technique).
    Tries each model in gemini_chat_models in order, falls back to raw question
    if all models fail so retrieval still runs.
    """
    client = _get_client()
    prompt = f'{_HYDE_PROMPT}\n\nQuestion: {question}'
    config = types.GenerateContentConfig(max_output_tokens=150, temperature=0.1)

    for model in _get_models():
        try:
            response = await client.aio.models.generate_content(
                model=model,
                contents=prompt,
                config=config,
            )
            text = (response.text or '').strip()
            return text if text else question
        except genai_errors.ClientError as exc:
            if exc.code == 429:
                logger.warning('HyDE: model %s quota exhausted, trying next', model)
                continue
            logger.warning('HyDE: model %s client error, trying next: %s', model, exc)
            continue
        except Exception as exc:
            logger.warning('HyDE: model %s failed, trying next: %s', model, exc)
            continue

    logger.warning('HyDE: all models exhausted, falling back to raw question')
    return question
