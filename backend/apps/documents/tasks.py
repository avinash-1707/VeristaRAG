import logging

import httpx
from celery import shared_task
from django.conf import settings
from django.utils import timezone

from .models import Document

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def process_document(self, document_id: str) -> None:
    try:
        doc = Document.objects.get(id=document_id)
    except Document.DoesNotExist:
        logger.error('Document %s not found', document_id)
        return

    doc.status = Document.STATUS_PROCESSING
    doc.save(update_fields=['status'])

    try:
        response = httpx.post(
            f'{settings.AI_SERVICE_URL}/ingest',
            json={
                'document_id': document_id,
                'storage_key': doc.storage_key,
                'file_type': doc.file_type,
            },
            headers={'X-Internal-Key': settings.INTERNAL_API_KEY},
            timeout=300.0,
        )
        response.raise_for_status()
        data = response.json()

        doc.status = Document.STATUS_READY
        doc.chunk_count = data['chunk_count']
        doc.processed_at = timezone.now()
        doc.save(update_fields=['status', 'chunk_count', 'processed_at'])

    except Exception as exc:
        logger.exception('Ingestion failed for document %s', document_id)
        doc.status = Document.STATUS_FAILED
        doc.save(update_fields=['status'])
        raise self.retry(exc=exc)
