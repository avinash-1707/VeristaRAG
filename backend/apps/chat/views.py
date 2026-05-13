import hashlib
import json
import logging
import time

import httpx
from asgiref.sync import sync_to_async
from django.conf import settings
from django.core.cache import cache
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ChatSession, Citation, Message, QueryLog
from .serializers import (
    ChatSessionCreateSerializer,
    ChatSessionSerializer,
    MessageSerializer,
    QuerySerializer,
)

logger = logging.getLogger(__name__)

QUERY_CACHE_TTL = 3600       # 1 hour
RETRIEVAL_CACHE_TTL = 1800   # 30 min


def _cache_key(question: str, doc_ids: list[str]) -> str:
    key_data = question + '|' + ','.join(sorted(doc_ids))
    return 'query:' + hashlib.sha256(key_data.encode()).hexdigest()


class ChatSessionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        sessions = ChatSession.objects.filter(user=request.user)
        return Response(ChatSessionSerializer(sessions, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = ChatSessionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session = ChatSession.objects.create(user=request.user, **serializer.validated_data)
        return Response(ChatSessionSerializer(session).data, status=status.HTTP_201_CREATED)


class ChatSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, session_id: str) -> Response:
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        messages = Message.objects.filter(session=session).prefetch_related('citations__chunk__document')
        return Response({
            'session': ChatSessionSerializer(session).data,
            'messages': MessageSerializer(messages, many=True).data,
        })

    def delete(self, request: Request, session_id: str) -> Response:
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        session.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class QueryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        from django.http import StreamingHttpResponse

        serializer = QuerySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        question: str = data['question']
        session_id: str = str(data['session_id'])
        doc_ids: list[str] = data['document_ids']

        cache_key = _cache_key(question, doc_ids)
        start_ts = time.monotonic()

        # ── Cache hit path ────────────────────────────────────────────────
        cached = cache.get(cache_key)
        if cached:
            payload = json.loads(cached)
            # Evict stale low-confidence entries cached by old code
            if payload.get('grounding_score', 0) < 0.30:
                cache.delete(cache_key)
            else:
                latency_ms = int((time.monotonic() - start_ts) * 1000)
                self._persist(request.user, session_id, question, doc_ids, payload, latency_ms, cache_hit=True)
                return Response({**payload, 'cache_hit': True, 'latency_ms': latency_ms})

        # ── Fetch conversation history (sync ORM, fine in sync view) ──────
        prior_messages = list(
            Message.objects.filter(session_id=session_id).order_by('-created_at')[:20]
        )
        history = [
            {'role': m.role, 'content': m.content}
            for m in reversed(prior_messages)
        ]

        user = request.user

        # ── Cache miss → async stream from FastAPI ────────────────────────
        async def _stream():
            buffer: list[str] = []
            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    async with client.stream(
                        'POST',
                        f'{settings.AI_SERVICE_URL}/query',
                        json={
                            'question': question,
                            'document_ids': doc_ids,
                            'session_id': session_id,
                            'history': history,
                        },
                        headers={'X-Internal-Key': settings.INTERNAL_API_KEY},
                    ) as resp:
                        resp.raise_for_status()
                        async for chunk in resp.aiter_text():
                            buffer.append(chunk)
                            yield chunk

            except Exception:
                logger.exception('Query stream failed')
                yield f'data: {json.dumps({"error": "Query failed"})}\n\n'
                return

            full_response = ''.join(buffer)
            latency_ms = int((time.monotonic() - start_ts) * 1000)
            try:
                payload = None
                for line in full_response.splitlines():
                    if not line.startswith('data: '):
                        continue
                    try:
                        event = json.loads(line[6:])
                        if event.get('done'):
                            payload = event
                    except json.JSONDecodeError:
                        continue
                if payload and payload.get('grounding_score', 0) >= 0.30:
                    await sync_to_async(cache.set)(cache_key, json.dumps(payload), QUERY_CACHE_TTL)
                    await sync_to_async(self._persist)(
                        user, session_id, question, doc_ids, payload, latency_ms, cache_hit=False
                    )
                else:
                    logger.warning('No done event found in stream response')
            except Exception:
                logger.exception('Failed to cache/persist query result')

        response = StreamingHttpResponse(_stream(), content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        return response

    def _persist(self, user, session_id: str, question: str, doc_ids: list, payload: dict, latency_ms: int, cache_hit: bool) -> None:
        try:
            session = ChatSession.objects.get(id=session_id, user=user)
        except ChatSession.DoesNotExist:
            return

        user_msg = Message.objects.create(session=session, role=Message.ROLE_USER, content=question)
        grounding_score = payload.get('grounding_score')
        assistant_msg = Message.objects.create(
            session=session,
            role=Message.ROLE_ASSISTANT,
            content=payload.get('answer', ''),
            grounding_score=grounding_score,
            retrieval_score=payload.get('top_similarity_score'),
            latency_ms=latency_ms,
            cache_hit=cache_hit,
        )

        from apps.documents.models import Chunk
        for i, citation_data in enumerate(payload.get('citations', [])):
            try:
                chunk = Chunk.objects.get(id=citation_data['chunk_id'])
                Citation.objects.create(
                    message=assistant_msg,
                    chunk=chunk,
                    similarity_score=citation_data.get('similarity_score', 0.0),
                    citation_order=i,
                )
            except Chunk.DoesNotExist:
                logger.warning('Citation chunk not found: %s', citation_data.get('chunk_id'))
            except Exception:
                logger.exception('Failed to create citation for chunk %s', citation_data.get('chunk_id'))

        QueryLog.objects.create(
            user=user,
            question_text=question,
            doc_ids=doc_ids,
            latency_ms=latency_ms,
            chunk_count=len(payload.get('citations', [])),
            top_similarity_score=payload.get('top_similarity_score'),
            grounding_score=grounding_score,
            cache_hit=cache_hit,
            model_used=payload.get('model_used', 'unknown'),
            low_confidence=(grounding_score is not None and grounding_score < 0.6),
        )

        session.save(update_fields=['updated_at'])
