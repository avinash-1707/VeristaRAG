import hashlib
import time

import cloudinary
import cloudinary.utils
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Document
from .serializers import CloudinarySignatureSerializer, DocumentCreateSerializer, DocumentSerializer
from .tasks import process_document


class DocumentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        docs = Document.objects.filter(user=request.user)
        return Response(DocumentSerializer(docs, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = DocumentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        doc = Document.objects.create(
            user=request.user,
            **serializer.validated_data,
        )
        process_document.delay(str(doc.id))
        return Response(DocumentSerializer(doc).data, status=status.HTTP_201_CREATED)


class DocumentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, document_id: str) -> Response:
        try:
            doc = Document.objects.get(id=document_id, user=request.user)
        except Document.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(DocumentSerializer(doc).data)

    def delete(self, request: Request, document_id: str) -> Response:
        try:
            doc = Document.objects.get(id=document_id, user=request.user)
        except Document.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        cloudinary.uploader.destroy(doc.storage_key, resource_type='raw')
        doc.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CloudinarySignatureView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        serializer = CloudinarySignatureSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        timestamp = int(time.time())
        folder = f'veritasrag/{request.user.id}'
        params = {
            'timestamp': timestamp,
            'folder': folder,
            'resource_type': 'raw',
        }
        cloudinary.config(cloudinary_url=settings.CLOUDINARY_URL)
        cfg = cloudinary.config()
        signature = cloudinary.utils.api_sign_request(params, cfg.api_secret)

        return Response({
            'signature': signature,
            'timestamp': timestamp,
            'folder': folder,
            'api_key': cfg.api_key,
            'cloud_name': cfg.cloud_name,
        })
