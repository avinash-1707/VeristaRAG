from typing import Any

import asyncpg

from db.pool import get_pool


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
    scores: dict[str, float] = {}
    data: dict[str, dict] = {}

    for rank, item in enumerate(ann_results, start=1):
        cid = item['chunk_id']
        scores[cid] = scores.get(cid, 0.0) + 1.0 / (k + rank)
        data[cid] = item

    for rank, item in enumerate(bm25_results, start=1):
        cid = item['chunk_id']
        scores[cid] = scores.get(cid, 0.0) + 1.0 / (k + rank)
        data[cid] = item

    sorted_ids = sorted(scores, key=lambda x: scores[x], reverse=True)
    return [{**data[cid], 'similarity_score': scores[cid]} for cid in sorted_ids]
