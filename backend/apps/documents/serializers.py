from rest_framework import serializers

from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = (
            'id', 'filename', 'file_type', 'status',
            'file_size_bytes', 'chunk_count', 'uploaded_at', 'processed_at',
        )
        read_only_fields = fields


class DocumentCreateSerializer(serializers.Serializer):
    filename = serializers.CharField(max_length=255)
    storage_key = serializers.CharField(max_length=500)
    file_type = serializers.ChoiceField(choices=['pdf', 'docx', 'txt'])
    file_size_bytes = serializers.IntegerField(min_value=1)


class CloudinarySignatureSerializer(serializers.Serializer):
    filename = serializers.CharField(max_length=255)
    file_type = serializers.ChoiceField(choices=['pdf', 'docx', 'txt'])
