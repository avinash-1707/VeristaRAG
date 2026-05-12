from typing import NamedTuple


class Chunk(NamedTuple):
    chunk_index: int
    content: str
    token_count: int
    page_number: int


def chunk(pages: list, max_tokens: int = 512, overlap: int = 50) -> list[Chunk]:
    """Sliding-window chunk extracted pages into token-bounded segments.

    Implemented in Unit 07 (fastapi-ingest).
    """
    raise NotImplementedError
