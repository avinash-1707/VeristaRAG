from typing import NamedTuple


class ExtractedPage(NamedTuple):
    page_number: int
    text: str


def extract(file_bytes: bytes, file_type: str) -> list[ExtractedPage]:
    """Extract text pages from a document.

    Implemented in Unit 07 (fastapi-ingest).
    Supports file_type: 'pdf', 'docx', 'txt'.
    """
    raise NotImplementedError
