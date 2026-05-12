from typing import Any

from sentence_transformers import CrossEncoder

_model: CrossEncoder | None = None
_MODEL_NAME = 'cross-encoder/ms-marco-MiniLM-L-6-v2'


def _get_model() -> CrossEncoder:
    global _model
    if _model is None:
        _model = CrossEncoder(_MODEL_NAME)
    return _model


def rerank(query: str, chunks: list[dict[str, Any]], top_n: int = 5) -> list[dict[str, Any]]:
    if not chunks:
        return []
    model = _get_model()
    pairs = [(query, c['content']) for c in chunks]
    scores = model.predict(pairs)
    ranked = sorted(zip(scores, chunks), key=lambda x: x[0], reverse=True)
    return [{**c, 'rerank_score': float(score)} for score, c in ranked[:top_n]]
