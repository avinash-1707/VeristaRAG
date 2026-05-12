import logging
from typing import Any

import cohere
from fastembed.rerank.cross_encoder import TextCrossEncoder

from config import settings

logger = logging.getLogger(__name__)

_FASTEMBED_MODEL = 'cross-encoder/ms-marco-MiniLM-L-6-v2'
_fastembed_model: TextCrossEncoder | None = None


def _get_fastembed_model() -> TextCrossEncoder:
    global _fastembed_model
    if _fastembed_model is None:
        _fastembed_model = TextCrossEncoder(_FASTEMBED_MODEL)
    return _fastembed_model


def _rerank_cohere(query: str, chunks: list[dict[str, Any]], top_n: int) -> list[dict[str, Any]]:
    co = cohere.ClientV2(api_key=settings.cohere_api_key)
    docs = [c['content'] for c in chunks]
    response = co.rerank(model='rerank-v3.5', query=query, documents=docs, top_n=top_n)
    return [
        {**chunks[r.index], 'rerank_score': r.relevance_score}
        for r in response.results
    ]


def _rerank_fastembed(query: str, chunks: list[dict[str, Any]], top_n: int) -> list[dict[str, Any]]:
    model = _get_fastembed_model()
    docs = [c['content'] for c in chunks]
    scores = list(model.rerank(query, docs))
    ranked = sorted(zip(scores, chunks), key=lambda x: x[0], reverse=True)
    return [{**c, 'rerank_score': float(score)} for score, c in ranked[:top_n]]


def rerank(query: str, chunks: list[dict[str, Any]], top_n: int = 5) -> list[dict[str, Any]]:
    if not chunks:
        return []
    if settings.cohere_api_key:
        try:
            return _rerank_cohere(query, chunks, top_n)
        except Exception as e:
            logger.warning('Cohere rerank failed, falling back to fastembed: %s', e)
    return _rerank_fastembed(query, chunks, top_n)
