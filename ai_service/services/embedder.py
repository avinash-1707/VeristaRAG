from google import genai
from google.genai import types

from config import settings

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.google_api_key)
    return _client


async def embed(texts: list[str]) -> list[list[float]]:
    client = _get_client()
    response = await client.aio.models.embed_content(
        model='text-embedding-004',
        contents=texts,
        config=types.EmbedContentConfig(output_dimensionality=768),
    )
    return [e.values for e in response.embeddings]


async def embed_single(text: str) -> list[float]:
    results = await embed([text])
    return results[0]
