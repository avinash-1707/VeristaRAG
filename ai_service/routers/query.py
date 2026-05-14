import asyncio
import json

from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from config import settings
from services.embedder import embed_single
from services.generator import generate
from services.intent import classify_intent
from services.reranker import rerank
from services.retriever import retrieve, retrieve_stratified

router = APIRouter()

_CHITCHAT_RESPONSE = (
    'Hi! I can help you explore and understand your documents — '
    'ask me to summarize, find specific facts, explain terms, compare sections, or walk through procedures. '
    'What would you like to know?'
)
_OUT_OF_SCOPE_RESPONSE = (
    'That question doesn\'t appear to be related to your uploaded documents. '
    'I\'m best suited for questions about document content — '
    'try asking about something specific in the files you\'ve uploaded.'
)


def _static_events(message: str, model: str = 'none') -> list[str]:
    return [
        f'data: {json.dumps({"token": message})}\n\n',
        f'data: {json.dumps({"done": True, "answer": message, "citations": [], "grounding_score": 0.0, "top_similarity_score": 0.0, "model_used": model})}\n\n',
    ]


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
        result = await classify_intent(request.question, request.history)
        intent = result.intent

        if intent == 'chitchat':
            for event in _static_events(_CHITCHAT_RESPONSE):
                yield event
            return

        if intent == 'out_of_scope':
            for event in _static_events(_OUT_OF_SCOPE_RESPONSE):
                yield event
            return

        # Prefer standalone rewrite for follow-up queries; fall back to original
        retrieval_query = result.standalone_query or request.question

        if intent in ('summary', 'extraction'):
            # Broad stratified coverage; precision not the goal
            chunks_per_page = 3 if intent == 'summary' else 4
            max_chunks = 25 if intent == 'summary' else 30
            top_chunks = await retrieve_stratified(
                document_ids=request.document_ids,
                chunks_per_page=chunks_per_page,
                max_chunks=max_chunks,
            )

        elif intent == 'comparison':
            question_embedding = await embed_single(retrieval_query)
            raw_chunks = await retrieve(
                question_embedding=question_embedding,
                question_text=retrieval_query,
                document_ids=request.document_ids,
                top_k=20,
            )
            top_chunks = await asyncio.get_event_loop().run_in_executor(
                None, rerank, request.question, raw_chunks, 12
            )

        elif intent == 'factual':
            # HyDE: embed hypothetical passage when available; improves recall for
            # indirect/paraphrased queries. BM25 still uses the original retrieval_query.
            embed_text = result.hypothetical or retrieval_query
            question_embedding = await embed_single(embed_text)
            raw_chunks = await retrieve(
                question_embedding=question_embedding,
                question_text=retrieval_query,
                document_ids=request.document_ids,
                top_k=20,
            )
            top_chunks = await asyncio.get_event_loop().run_in_executor(
                None, rerank, request.question, raw_chunks, 8
            )

        else:
            # boolean, definition, procedural, analytical, troubleshooting, recommendation
            # — raw query embedding is precise enough; no HyDE needed
            question_embedding = await embed_single(retrieval_query)
            raw_chunks = await retrieve(
                question_embedding=question_embedding,
                question_text=retrieval_query,
                document_ids=request.document_ids,
                top_k=15,
            )
            top_chunks = await asyncio.get_event_loop().run_in_executor(
                None, rerank, request.question, raw_chunks, 8
            )

        async for event in generate(
            request.question, top_chunks, history=request.history, intent=intent
        ):
            yield event

    return StreamingResponse(_stream(), media_type='text/event-stream')
