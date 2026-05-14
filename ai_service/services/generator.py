import json
import logging
from typing import Any, AsyncIterator

from google import genai
from google.genai import errors as genai_errors
from google.genai import types

from config import settings

logger = logging.getLogger(__name__)

_client: genai.Client | None = None
_LOW_GROUNDING_THRESHOLD = 0.30
_MAX_HISTORY_TURNS = 10

_SYSTEM_PROMPT = (
    'You are a helpful document assistant. '
    'Answer the user\'s question using only the source excerpts provided in the message. '
    'You may synthesize information across multiple excerpts to form a complete answer. '
    'If the excerpts genuinely do not contain enough information to answer the question, '
    'say so briefly and specifically — explain what is missing rather than giving a generic refusal. '
    'Do not use outside knowledge or invent facts not present in the excerpts.'
)

_SUMMARY_SYSTEM_PROMPT = (
    'You are a helpful document assistant. '
    'Produce a structured summary of the document based on the source excerpts provided. '
    'Cover the main themes, key points, and notable details present in the excerpts. '
    'Use bullet points or clear sections for readability. '
    'Note at the end if the excerpts are a sample and may not represent all content. '
    'Do not use outside knowledge or invent facts not present in the excerpts.'
)

_EXTRACTION_SYSTEM_PROMPT = (
    'You are a professional document analysis assistant. '
    'Extract and list every instance of what the user is asking about from the source excerpts. '
    'Format the output as a structured, numbered or bulleted list. '
    'Include the source reference (document name and page) for each item. '
    'Do not infer, group, or add information not explicitly present in the excerpts.'
)

_COMPARISON_SYSTEM_PROMPT = (
    'You are a professional document analysis assistant. '
    'Compare the items, sections, or concepts the user is asking about using only the source excerpts. '
    'Present the comparison in a structured format — a table or side-by-side bullet points. '
    'Clearly highlight similarities and differences. '
    'Do not use outside knowledge or invent details not present in the excerpts.'
)

_BOOLEAN_SYSTEM_PROMPT = (
    'You are a professional document analysis assistant. '
    'Answer the user\'s question with "Yes" or "No" as the first word, '
    'followed by a single sentence citing the specific part of the document that supports the answer. '
    'Do not elaborate beyond what the excerpts directly support. '
    'Do not use outside knowledge.'
)

_DEFINITION_SYSTEM_PROMPT = (
    'You are a professional document analysis assistant. '
    'Explain the term or concept the user is asking about strictly as it is defined or used in the source excerpts. '
    'Do not use dictionary definitions or outside knowledge. '
    'If the document does not explicitly define the term but uses it in context, describe how it is used. '
    'Keep the response concise and precise.'
)

_NO_CONTEXT_SYSTEM_PROMPT = (
    'You are a professional document analysis assistant. '
    'The document does not contain information relevant to the user\'s question. '
    'Respond with a single, concise, formally worded sentence stating that the specific subject '
    'from the question is not present in the document. '
    'Use professional language. No explanation, no elaboration, no outside knowledge.'
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


_REFUSAL_MARKER = 'do not contain sufficient information'


def _build_contents(
    question: str,
    context: str,
    history: list[dict[str, Any]],
) -> list[types.Content]:
    contents: list[types.Content] = []

    # Strip assistant refusals — they bias Gemini to refuse again even when the
    # current turn has valid excerpts. Keep the user message so conversation
    # thread stays intact for follow-up resolution.
    filtered: list[dict[str, Any]] = []
    for msg in history[-_MAX_HISTORY_TURNS:]:
        if msg['role'] == 'assistant' and _REFUSAL_MARKER in msg['content']:
            pass  # drop only the refusal; preceding user message is retained
        else:
            filtered.append(msg)

    for msg in filtered:
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
    system_prompt: str = _SYSTEM_PROMPT,
) -> AsyncIterator[str]:
    models = _get_models()
    last_exc: Exception | None = None

    for model in models:
        try:
            async for chunk in await client.aio.models.generate_content_stream(
                model=model,
                contents=contents,
                config=types.GenerateContentConfig(system_instruction=system_prompt),
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
    intent: str = 'factual',
) -> AsyncIterator[str]:
    client = _get_client()
    raw_scores = [float(c.get('rerank_score', c.get('similarity_score', 0.0))) for c in chunks]
    top_sim = max(raw_scores, default=0.0)

    _stratified_intents = {'summary', 'extraction'}
    if intent in _stratified_intents:
        # Stratified chunks have flat scores — only refuse if empty
        low_confidence = len(chunks) == 0
        grounding_score = round(sum(raw_scores) / len(raw_scores), 4) if raw_scores else 0.0
    else:
        low_confidence = top_sim < _LOW_GROUNDING_THRESHOLD
        grounding_score = round(top_sim, 4)

    _prompt_map = {
        'summary': _SUMMARY_SYSTEM_PROMPT,
        'extraction': _EXTRACTION_SYSTEM_PROMPT,
        'comparison': _COMPARISON_SYSTEM_PROMPT,
        'boolean': _BOOLEAN_SYSTEM_PROMPT,
        'definition': _DEFINITION_SYSTEM_PROMPT,
    }
    system_prompt = _prompt_map.get(intent, _SYSTEM_PROMPT)
    context = _build_context(chunks)
    contents = _build_contents(question, context, history or [])

    citations = [
        {
            'chunk_id': c['chunk_id'],
            'document_name': c['document_name'],
            'page_number': c['page_number'],
            'similarity_score': round(float(c.get('rerank_score', c.get('similarity_score', 0.0))), 4),
            'content': c.get('content', ''),
        }
        for c in chunks
    ]

    answer_parts: list[str] = []
    model_used = _get_models()[0]

    if low_confidence:
        no_context_contents = [types.Content(
            role='user',
            parts=[types.Part(text=f'Question: {question}')],
        )]
        try:
            async for event in _stream_with_fallback(client, no_context_contents, answer_parts, _NO_CONTEXT_SYSTEM_PROMPT):
                if event.startswith('__model__:'):
                    model_used = event[len('__model__:'):]
                else:
                    yield event
        except Exception as exc:
            logger.exception('Low-confidence fallback failed: %s', exc)
            answer = 'The provided documents do not contain information to answer this question.'
            yield f'data: {json.dumps({"token": answer})}\n\n'
            answer_parts.append(answer)
    else:
        try:
            async for event in _stream_with_fallback(client, contents, answer_parts, system_prompt):
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
        'grounding_score': grounding_score,
        'top_similarity_score': round(top_sim, 4),
        'model_used': model_used,
    }
    yield f'data: {json.dumps({"done": True, **final})}\n\n'
