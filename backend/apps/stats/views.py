from django.core.cache import cache
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.chat.models import QueryLog
from apps.documents.models import Document

STATS_CACHE_TTL = 300  # 5 minutes


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        cache_key = f'stats:{request.user.id}'
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        user = request.user
        doc_count = Document.objects.filter(user=user).count()
        query_count = QueryLog.objects.filter(user=user).count()

        logs = QueryLog.objects.filter(user=user)
        avg_grounding = None
        cache_hits = 0
        if query_count > 0:
            grounding_scores = [q.grounding_score for q in logs if q.grounding_score is not None]
            avg_grounding = sum(grounding_scores) / len(grounding_scores) if grounding_scores else None
            cache_hits = logs.filter(cache_hit=True).count()

        stats = {
            'document_count': doc_count,
            'query_count': query_count,
            'avg_grounding_score': round(avg_grounding, 3) if avg_grounding is not None else None,
            'cache_hit_rate': round(cache_hits / query_count, 3) if query_count > 0 else 0.0,
        }
        cache.set(cache_key, stats, STATS_CACHE_TTL)
        return Response(stats)


class QueryLogListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        logs = QueryLog.objects.filter(user=request.user).order_by('-created_at')[:100]
        return Response([
            {
                'id': str(q.id),
                'question_text': q.question_text,
                'latency_ms': q.latency_ms,
                'grounding_score': q.grounding_score,
                'cache_hit': q.cache_hit,
                'low_confidence': q.low_confidence,
                'model_used': q.model_used,
                'created_at': q.created_at.isoformat(),
            }
            for q in logs
        ])
