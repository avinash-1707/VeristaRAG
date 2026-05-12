from typing import Any


async def retrieve(
    question_embedding: list[float],
    question_text: str,
    document_ids: list[str],
    top_k: int = 20,
) -> list[dict[str, Any]]:
    """Hybrid ANN + BM25 retrieval with Reciprocal Rank Fusion merge.

    Implemented in Unit 09 (fastapi-retriever).
    Returns top_k chunks with similarity scores.
    """
    raise NotImplementedError
