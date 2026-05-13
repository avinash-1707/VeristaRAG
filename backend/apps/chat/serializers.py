from rest_framework import serializers

from .models import ChatSession, Citation, Message, QueryLog


class CitationSerializer(serializers.ModelSerializer):
    content = serializers.CharField(source='chunk.content', read_only=True)
    document_name = serializers.CharField(source='chunk.document.filename', read_only=True)
    page_number = serializers.IntegerField(source='chunk.page_number', read_only=True)

    class Meta:
        model = Citation
        fields = ('id', 'chunk_id', 'content', 'document_name', 'page_number',
                  'similarity_score', 'citation_order')


class MessageSerializer(serializers.ModelSerializer):
    citations = CitationSerializer(many=True, read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'role', 'content', 'retrieval_score', 'grounding_score',
                  'latency_ms', 'cache_hit', 'created_at', 'citations')
        read_only_fields = fields


class ChatSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatSession
        fields = ('id', 'title', 'document_ids', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class ChatSessionCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=500)
    document_ids = serializers.ListField(child=serializers.UUIDField(), min_length=1)

    def validate_document_ids(self, value: list) -> list:
        return [str(uid) for uid in value]


class QuerySerializer(serializers.Serializer):
    question = serializers.CharField(min_length=1, max_length=2000)
    session_id = serializers.UUIDField()
    document_ids = serializers.ListField(child=serializers.UUIDField(), min_length=1)

    def validate_document_ids(self, value: list) -> list:
        return [str(uid) for uid in value]
