from typing import Any

import asyncpg

from db.pool import get_pool


async def retrieve_stratified(
    document_ids: list[str],
    chunks_per_page: int = 3,
    max_chunks: int = 25,
) -> list[dict[str, Any]]:
    """Sample chunks spread across all pages — used for summary/extraction intents.

    Uses RANDOM() ordering per partition so repeated calls get varied coverage
    rather than always returning the same leading chunks from each page.
    """
    pool = await get_pool()
    rows = await pool.fetch(
        '''
        WITH ranked AS (
            SELECT
                c.id::text AS chunk_id,
                c.content,
                c.page_number,
                c.document_id::text,
                d.filename AS document_name,
                0.5 AS similarity_score,
                ROW_NUMBER() OVER (PARTITION BY c.page_number ORDER BY RANDOM()) AS rn
            FROM chunks c
            JOIN documents d ON d.id = c.document_id
            WHERE c.document_id = ANY($1::uuid[])
        )
        SELECT chunk_id, content, page_number, document_id, document_name, similarity_score
        FROM ranked
        WHERE rn <= $2
        ORDER BY page_number, rn
        LIMIT $3
        ''',
        document_ids,
        chunks_per_page,
        max_chunks,
    )
    return [dict(r) for r in rows]


async def retrieve(
    question_embedding: list[float],
    question_text: str,
    document_ids: list[str],
    top_k: int = 20,
) -> list[dict[str, Any]]:
    pool = await get_pool()
    ann_results = await _ann_search(pool, question_embedding, document_ids, top_k)
    bm25_results = await _bm25_search(pool, question_text, document_ids, top_k)
    merged = _reciprocal_rank_fusion(ann_results, bm25_results)
    return merged[:top_k]


async def _ann_search(
    pool: asyncpg.Pool,
    embedding: list[float],
    document_ids: list[str],
    limit: int,
) -> list[dict[str, Any]]:
    vector_str = '[' + ','.join(str(v) for v in embedding) + ']'
    rows = await pool.fetch(
        '''
        SELECT
            c.id::text AS chunk_id,
            c.content,
            c.page_number,
            c.document_id::text,
            d.filename AS document_name,
            1 - (e.embedding_768 <=> $1::vector) AS similarity_score
        FROM embeddings e
        JOIN chunks c ON c.id = e.chunk_id
        JOIN documents d ON d.id = c.document_id
        WHERE c.document_id = ANY($2::uuid[])
        ORDER BY e.embedding_768 <=> $1::vector
        LIMIT $3
        ''',
        vector_str,
        document_ids,
        limit,
    )
    return [dict(r) for r in rows]


async def _bm25_search(
    pool: asyncpg.Pool,
    query_text: str,
    document_ids: list[str],
    limit: int,
) -> list[dict[str, Any]]:
    rows = await pool.fetch(
        '''
        SELECT
            c.id::text AS chunk_id,
            c.content,
            c.page_number,
            c.document_id::text,
            d.filename AS document_name,
            ts_rank_cd(to_tsvector('english', c.content), plainto_tsquery('english', $1)) AS similarity_score
        FROM chunks c
        JOIN documents d ON d.id = c.document_id
        WHERE c.document_id = ANY($2::uuid[])
          AND to_tsvector('english', c.content) @@ plainto_tsquery('english', $1)
        ORDER BY similarity_score DESC
        LIMIT $3
        ''',
        query_text,
        document_ids,
        limit,
    )
    return [dict(r) for r in rows]


def _reciprocal_rank_fusion(
    ann_results: list[dict],
    bm25_results: list[dict],
    k: int = 60,
) -> list[dict]:
    """Merge ANN and BM25 results by reciprocal rank fusion.

    similarity_score on each returned chunk is the original ANN cosine similarity
    (or BM25 ts_rank for BM25-only hits). rrf_score holds the fusion rank value.
    Keeping cosine similarity intact lets the generator's low-confidence check
    use a meaningful [0, 1] threshold instead of the tiny RRF rank fractions.
    """
    rrf_scores: dict[str, float] = {}
    ann_data: dict[str, dict] = {item['chunk_id']: item for item in ann_results}
    bm25_data: dict[str, dict] = {item['chunk_id']: item for item in bm25_results}

    for rank, item in enumerate(ann_results, start=1):
        cid = item['chunk_id']
        rrf_scores[cid] = rrf_scores.get(cid, 0.0) + 1.0 / (k + rank)

    for rank, item in enumerate(bm25_results, start=1):
        cid = item['chunk_id']
        rrf_scores[cid] = rrf_scores.get(cid, 0.0) + 1.0 / (k + rank)

    sorted_ids = sorted(rrf_scores, key=lambda x: rrf_scores[x], reverse=True)

    merged = []
    for cid in sorted_ids:
        # Prefer ANN data: it carries cosine similarity_score in [0, 1]
        base = ann_data.get(cid) or bm25_data[cid]
        merged.append({**base, 'rrf_score': rrf_scores[cid]})
    return merged
