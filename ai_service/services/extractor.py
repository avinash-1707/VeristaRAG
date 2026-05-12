import io
import time
from typing import NamedTuple
from urllib.parse import urlparse

import cloudinary
import cloudinary.utils
import httpx
import pdfplumber
from docx import Document as DocxDocument


class ExtractedPage(NamedTuple):
    page_number: int
    text: str


async def fetch_file(storage_key: str, cloudinary_url: str) -> bytes:
    parsed = urlparse(cloudinary_url)
    cloudinary.config(
        cloud_name=parsed.hostname,
        api_key=parsed.username,
        api_secret=parsed.password,
    )
    url = cloudinary.utils.private_download_url(
        storage_key,
        format=None,
        resource_type='raw',
        type='upload',
        expires_at=int(time.time()) + 600,
    )
    async with httpx.AsyncClient() as client:
        response = await client.get(url, follow_redirects=True, timeout=60.0)
        response.raise_for_status()
        return response.content


def extract(file_bytes: bytes, file_type: str) -> list[ExtractedPage]:
    if file_type == 'pdf':
        return _extract_pdf(file_bytes)
    elif file_type == 'docx':
        return _extract_docx(file_bytes)
    elif file_type == 'txt':
        return _extract_txt(file_bytes)
    raise ValueError(f'Unsupported file type: {file_type}')


def _extract_pdf(file_bytes: bytes) -> list[ExtractedPage]:
    pages: list[ExtractedPage] = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for i, page in enumerate(pdf.pages, start=1):
            text = page.extract_text() or ''
            if text.strip():
                pages.append(ExtractedPage(page_number=i, text=text))
    return pages


def _extract_docx(file_bytes: bytes) -> list[ExtractedPage]:
    doc = DocxDocument(io.BytesIO(file_bytes))
    full_text = '\n'.join(p.text for p in doc.paragraphs if p.text.strip())
    return [ExtractedPage(page_number=1, text=full_text)] if full_text else []


def _extract_txt(file_bytes: bytes) -> list[ExtractedPage]:
    text = file_bytes.decode('utf-8', errors='replace')
    return [ExtractedPage(page_number=1, text=text)] if text.strip() else []
