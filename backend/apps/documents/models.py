import uuid

from django.db import models
from pgvector.django import VectorField

from apps.users.models import CustomUser


class Document(models.Model):
    STATUS_UPLOADED = 'uploaded'
    STATUS_PROCESSING = 'processing'
    STATUS_READY = 'ready'
    STATUS_FAILED = 'failed'

    STATUS_CHOICES = [
        (STATUS_UPLOADED, 'Uploaded'),
        (STATUS_PROCESSING, 'Processing'),
        (STATUS_READY, 'Ready'),
        (STATUS_FAILED, 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='documents')
    filename = models.CharField(max_length=255)
    storage_key = models.CharField(max_length=500, unique=True)
    file_type = models.CharField(max_length=10)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_UPLOADED, db_index=True)
    file_size_bytes = models.BigIntegerField()
    chunk_count = models.IntegerField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'documents'
        ordering = ['-uploaded_at']

    def __str__(self) -> str:
        return f'{self.filename} ({self.status})'


class Chunk(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='chunks', db_index=True)
    chunk_index = models.IntegerField()
    content = models.TextField()
    token_count = models.IntegerField()
    page_number = models.IntegerField()
    section_heading = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chunks'
        ordering = ['document', 'chunk_index']

    def __str__(self) -> str:
        return f'Chunk {self.chunk_index} of {self.document_id}'


class Embedding(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chunk = models.OneToOneField(Chunk, on_delete=models.CASCADE, related_name='embedding')
    embedding_768 = VectorField(dimensions=768)
    model_name = models.CharField(max_length=100, default='text-embedding-004')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'embeddings'

    def __str__(self) -> str:
        return f'Embedding for chunk {self.chunk_id}'
