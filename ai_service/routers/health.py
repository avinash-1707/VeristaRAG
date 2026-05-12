from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    model: str
    reranker: str


@router.get('/health', response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        status='ok',
        model='text-embedding-004',
        reranker='cross-encoder/ms-marco-MiniLM-L-6-v2',
    )
