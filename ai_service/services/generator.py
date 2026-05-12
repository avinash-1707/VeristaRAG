import json
from typing import Any, AsyncIterator

from google import genai
from google.genai import types

from config import settings

_client: genai.Client | None = None
_LOW_SIMILARITY_THRESHOLD = 0.75
_LOW_GROUNDING_THRESHOLD = 0.6

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


def _build_context(chunks: list[dict[str, Any]]) -> str:
    parts: list[str] = []
    for i, c in enumerate(chunks, start=1):
        parts.append(
            f'[Source {i}] {c["document_name"]}, page {c["page_number"]}\n{c["content"]}'
        )
    return '\n\n---\n\n'.join(parts)


def _compute_grounding_score(chunks: list[dict[str, Any]]) -> float:
    if not chunks:
        return 0.0
    scores = [c.get('similarity_score', 0.0) for c in chunks]
    return round(sum(scores) / len(scores), 4)


async def generate(
    question: str,
    chunks: list[dict[str, Any]],
) -> AsyncIterator[str]:
    client = _get_client()
    top_sim = max((c.get('similarity_score', 0.0) for c in chunks), default=0.0)
    grounding_score = _compute_grounding_score(chunks)
    low_confidence = top_sim < _LOW_SIMILARITY_THRESHOLD

    context = _build_context(chunks)
    prompt = f'Source excerpts:\n\n{context}\n\nQuestion: {question}'

    citations = [
        {
            'chunk_id': c['chunk_id'],
            'document_name': c['document_name'],
            'page_number': c['page_number'],
            'similarity_score': round(c.get('similarity_score', 0.0), 4),
        }
        for c in chunks
    ]

    answer_parts: list[str] = []

    if low_confidence:
        answer = (
            'The provided documents do not contain sufficient information to answer this question.'
        )
        yield f'data: {json.dumps({"token": answer})}\n\n'
        answer_parts.append(answer)
    else:
        async for chunk in await client.aio.models.generate_content_stream(
            model='gemini-2.0-flash',
            contents=prompt,
            config=types.GenerateContentConfig(system_instruction=_SYSTEM_PROMPT),
        ):
            token = chunk.text or ''
            if token:
                answer_parts.append(token)
                yield f'data: {json.dumps({"token": token})}\n\n'

    full_answer = ''.join(answer_parts)
    final = {
        'answer': full_answer,
        'citations': citations,
        'grounding_score': grounding_score if not low_confidence else 0.0,
        'top_similarity_score': round(top_sim, 4),
    }
    yield f'data: {json.dumps({"done": True, **final})}\n\n'
