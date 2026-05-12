from typing import NamedTuple

import tiktoken

from .extractor import ExtractedPage

_enc = tiktoken.get_encoding('cl100k_base')


class Chunk(NamedTuple):
    chunk_index: int
    content: str
    token_count: int
    page_number: int


def chunk(pages: list[ExtractedPage], max_tokens: int = 512, overlap: int = 50) -> list[Chunk]:
    chunks: list[Chunk] = []
    chunk_index = 0

    for page in pages:
        tokens = _enc.encode(page.text)
        start = 0
        while start < len(tokens):
            end = min(start + max_tokens, len(tokens))
            window_tokens = tokens[start:end]
            text = _enc.decode(window_tokens)
            chunks.append(Chunk(
                chunk_index=chunk_index,
                content=text,
                token_count=len(window_tokens),
                page_number=page.page_number,
            ))
            chunk_index += 1
            if end == len(tokens):
                break
            start = end - overlap

    return chunks
