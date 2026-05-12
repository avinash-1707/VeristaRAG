import re
from typing import NamedTuple

import tiktoken

from .extractor import ExtractedPage

_enc = tiktoken.get_encoding('cl100k_base')

# Split on sentence-ending punctuation + whitespace, or on paragraph breaks
_SENT_RE = re.compile(r'(?<=[.!?])\s+|\n{2,}')


class Chunk(NamedTuple):
    chunk_index: int
    content: str
    token_count: int
    page_number: int


def _sentences(text: str) -> list[str]:
    parts = _SENT_RE.split(text.strip())
    return [p.strip() for p in parts if p.strip()]


def chunk(pages: list[ExtractedPage], max_tokens: int = 256, overlap: int = 64) -> list[Chunk]:
    chunks: list[Chunk] = []
    chunk_index = 0

    for page in pages:
        sents = _sentences(page.text)
        if not sents:
            continue
        encoded = [_enc.encode(s) for s in sents]

        i = 0
        while i < len(sents):
            win_tokens: list[int] = []
            j = i

            while j < len(sents):
                stoks = encoded[j]
                # stop if adding this sentence exceeds limit (unless window still empty)
                if win_tokens and len(win_tokens) + len(stoks) > max_tokens:
                    break
                win_tokens.extend(stoks)
                j += 1
                # single sentence longer than max_tokens: hard-truncate and move on
                if len(win_tokens) >= max_tokens:
                    win_tokens = win_tokens[:max_tokens]
                    break

            if not win_tokens:
                i += 1
                continue

            content = ' '.join(sents[i:j]).strip()
            chunks.append(Chunk(
                chunk_index=chunk_index,
                content=content,
                token_count=len(win_tokens),
                page_number=page.page_number,
            ))
            chunk_index += 1

            if j >= len(sents):
                break

            # Back next chunk start up by ~overlap tokens (sentence-aligned)
            overlap_tokens = 0
            new_i = j
            for k in range(j - 1, i, -1):
                if overlap_tokens + len(encoded[k]) <= overlap:
                    overlap_tokens += len(encoded[k])
                    new_i = k
                else:
                    break
            i = max(new_i, i + 1)  # always advance to prevent infinite loop

    return chunks
