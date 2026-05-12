from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from config import settings

router = APIRouter()


class QueryRequest(BaseModel):
    question: str
    document_ids: list[str]
    session_id: str


@router.post('/query')
async def query(
    request: QueryRequest,
    x_internal_key: str = Header(...),
) -> None:
    if x_internal_key != settings.internal_api_key:
        raise HTTPException(status_code=403, detail='Forbidden')
    # Full RAG pipeline implemented in Unit 11 (fastapi-generator)
    raise HTTPException(status_code=501, detail='Not implemented')
