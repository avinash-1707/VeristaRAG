import uuid

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from config import settings
from db.pool import get_pool
from services.chunker import chunk
from services.embedder import embed
from services.extractor import ExtractedPage, extract, fetch_file

router = APIRouter()


class IngestRequest(BaseModel):
    document_id: str
    storage_key: str
    file_type: str


class IngestResponse(BaseModel):
    chunk_count: int


@router.post('/ingest', response_model=IngestResponse)
async def ingest(
    request: IngestRequest,
    x_internal_key: str = Header(...),
) -> IngestResponse:
    if x_internal_key != settings.internal_api_key:
        raise HTTPException(status_code=403, detail='Forbidden')

    file_bytes = await fetch_file(request.storage_key, settings.cloudinary_url)
    pages: list[ExtractedPage] = extract(file_bytes, request.file_type)
    chunks = chunk(pages)

    if not chunks:
        raise HTTPException(status_code=422, detail='No text could be extracted from document')

    texts = [c.content for c in chunks]
    embeddings = await embed(texts)

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            for c, emb in zip(chunks, embeddings):
                chunk_id = str(uuid.uuid4())
                await conn.execute(
                    '''
                    INSERT INTO chunks (id, document_id, chunk_index, content, token_count, page_number, section_heading)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ''',
                    chunk_id,
                    request.document_id,
                    c.chunk_index,
                    c.content,
                    c.token_count,
                    c.page_number,
                    '',
                )
                vector_str = '[' + ','.join(str(v) for v in emb) + ']'
                await conn.execute(
                    '''
                    INSERT INTO embeddings (id, chunk_id, embedding_768, model_name)
                    VALUES ($1, $2, $3::vector, $4)
                    ''',
                    str(uuid.uuid4()),
                    chunk_id,
                    vector_str,
                    'text-embedding-004',
                )

    return IngestResponse(chunk_count=len(chunks))
