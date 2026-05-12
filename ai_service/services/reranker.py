from typing import Any


def rerank(query: str, chunks: list[dict[str, Any]], top_n: int = 5) -> list[dict[str, Any]]:
    """Rerank chunks using cross-encoder/ms-marco-MiniLM-L-6-v2.

    Implemented in Unit 10 (fastapi-reranker).
    Returns top_n chunks sorted by cross-encoder score.
    """
    raise NotImplementedError
