import json
import logging
from typing import Any, AsyncIterator

from google import genai
from google.genai import errors as genai_errors
from google.genai import types

from config import settings

logger = logging.getLogger(__name__)

_client: genai.Client | None = None
_LOW_SIMILARITY_THRESHOLD = 0.05
_LOW_GROUNDING_THRESHOLD = 0.6
_MAX_HISTORY_TURNS = 10

_SYSTEM_PROMPT = (
    'You are a precise document assistant. '
    'Answer ONLY using the provided source excerpts below. '
    'If the answer is not present in the excerpts, state clearly: '
    '"The provided documents do not contain sufficient information to answer this question." '
    'Never invent facts, cite sources, or draw on outside knowledge.'
)


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.google_api_key)
    return _client


def _get_models() -> list[str]:
    return [m.strip() for m in settings.gemini_chat_models.split(',') if m.strip()]


def _build_context(chunks: list[dict[str, Any]]) -> str:
    parts: list[str] = []
    for i, c in enumerate(chunks, start=1):
        parts.append(
            f'[Source {i}] {c["document_name"]}, page {c["page_number"]}\n{c["content"]}'
        )
    return '\n\n---\n\n'.join(parts)


def _build_contents(
    question: str,
    context: str,
    history: list[dict[str, Any]],
) -> list[types.Content]:
    contents: list[types.Content] = []
    for msg in history[-_MAX_HISTORY_TURNS:]:
        role = 'user' if msg['role'] == 'user' else 'model'
        contents.append(types.Content(role=role, parts=[types.Part(text=msg['content'])]))
    contents.append(types.Content(
        role='user',
        parts=[types.Part(text=f'Source excerpts:\n\n{context}\n\nQuestion: {question}')],
    ))
    return contents



async def _stream_with_fallback(
    client: genai.Client,
    contents: list[types.Content],
    answer_parts: list[str],
) -> AsyncIterator[str]:
    models = _get_models()
    last_exc: Exception | None = None

    for model in models:
        try:
            async for chunk in await client.aio.models.generate_content_stream(
                model=model,
                contents=contents,
                config=types.GenerateContentConfig(system_instruction=_SYSTEM_PROMPT),
            ):
                token = chunk.text or ''
                if token:
                    answer_parts.append(token)
                    yield f'data: {json.dumps({"token": token})}\n\n'
            yield f'__model__:{model}'
            return
        except genai_errors.ClientError as exc:
            if exc.code == 429:
                logger.warning('Model %s quota exhausted, trying next', model)
                last_exc = exc
                continue
            raise
        except Exception as exc:
            logger.warning('Model %s failed (%s), trying next', model, exc)
            last_exc = exc
            continue

    raise RuntimeError('All Gemini models exhausted') from last_exc


async def generate(
    question: str,
    chunks: list[dict[str, Any]],
    history: list[dict[str, Any]] | None = None,
) -> AsyncIterator[str]:
    client = _get_client()
    top_sim = max((c.get('rerank_score', c.get('similarity_score', 0.0)) for c in chunks), default=0.0)
    grounding_score = round(top_sim, 4)
    low_confidence = top_sim < _LOW_SIMILARITY_THRESHOLD

    context = _build_context(chunks)
    contents = _build_contents(question, context, history or [])

    citations = [
        {
            'chunk_id': c['chunk_id'],
            'document_name': c['document_name'],
            'page_number': c['page_number'],
            'similarity_score': round(c.get('rerank_score', c.get('similarity_score', 0.0)), 4),
            'content': c.get('content', ''),
        }
        for c in chunks
    ]

    answer_parts: list[str] = []
    model_used = _get_models()[0]

    if low_confidence:
        answer = (
            'The provided documents do not contain sufficient information to answer this question.'
        )
        yield f'data: {json.dumps({"token": answer})}\n\n'
        answer_parts.append(answer)
    else:
        try:
            async for event in _stream_with_fallback(client, contents, answer_parts):
                if event.startswith('__model__:'):
                    model_used = event[len('__model__:'):]
                else:
                    yield event
        except Exception as exc:
            logger.exception('All models failed: %s', exc)
            error_msg = 'Service temporarily unavailable. Please try again in a moment.'
            yield f'data: {json.dumps({"token": error_msg})}\n\n'
            answer_parts.append(error_msg)

    full_answer = ''.join(answer_parts)
    final = {
        'answer': full_answer,
        'citations': citations,
        'grounding_score': grounding_score if not low_confidence else 0.0,
        'top_similarity_score': round(top_sim, 4),
        'model_used': model_used,
    }
    yield f'data: {json.dumps({"done": True, **final})}\n\n'
