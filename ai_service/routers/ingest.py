from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from config import settings

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
    # Full pipeline implemented in Unit 07 (fastapi-ingest)
    raise HTTPException(status_code=501, detail='Not implemented')
