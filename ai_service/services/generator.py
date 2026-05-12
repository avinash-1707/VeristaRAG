from typing import Any, AsyncIterator


async def generate(
    question: str,
    chunks: list[dict[str, Any]],
) -> AsyncIterator[str]:
    """Build grounding prompt and stream gemini-2.0-flash response via SSE.

    Implemented in Unit 11 (fastapi-generator).
    Yields SSE-formatted token strings.
    """
    raise NotImplementedError
    yield  # makes this an async generator
