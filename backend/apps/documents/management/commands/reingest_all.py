from django.core.management.base import BaseCommand

from apps.documents.models import Chunk, Document
from apps.documents.tasks import process_document


class Command(BaseCommand):
    help = 'Delete all chunks/embeddings and re-ingest every document'

    def handle(self, *args, **options):
        docs = list(Document.objects.all())
        if not docs:
            self.stdout.write('No documents found.')
            return

        self.stdout.write(f'Deleting chunks for {len(docs)} document(s)...')
        deleted, _ = Chunk.objects.filter(document__in=docs).delete()
        self.stdout.write(f'  Deleted {deleted} chunk(s) (embeddings cascade-deleted).')

        self.stdout.write('Resetting document statuses and queuing ingest tasks...')
        for doc in docs:
            doc.status = Document.STATUS_UPLOADED
            doc.chunk_count = None
            doc.processed_at = None
            doc.save(update_fields=['status', 'chunk_count', 'processed_at'])
            process_document.delay(str(doc.id))
            self.stdout.write(f'  Queued: {doc.filename} ({doc.id})')

        self.stdout.write(self.style.SUCCESS(f'Done. {len(docs)} document(s) queued for re-ingestion.'))
