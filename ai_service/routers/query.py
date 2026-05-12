import asyncio

from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from config import settings
from services.embedder import embed_single
from services.generator import generate
from services.reranker import rerank
from services.retriever import retrieve

router = APIRouter()


class QueryRequest(BaseModel):
    question: str
    document_ids: list[str]
    session_id: str
    history: list[dict] = []


@router.post('/query')
async def query(
    request: QueryRequest,
    x_internal_key: str = Header(...),
) -> StreamingResponse:
    if x_internal_key != settings.internal_api_key:
        raise HTTPException(status_code=403, detail='Forbidden')

    async def _stream():
        question_embedding = await embed_single(request.question)
        raw_chunks = await retrieve(
            question_embedding=question_embedding,
            question_text=request.question,
            document_ids=request.document_ids,
            top_k=20,
        )
        reranked = await asyncio.get_event_loop().run_in_executor(
            None, rerank, request.question, raw_chunks, 5
        )
        async for event in generate(request.question, reranked, history=request.history):
            yield event

    return StreamingResponse(_stream(), media_type='text/event-stream')
