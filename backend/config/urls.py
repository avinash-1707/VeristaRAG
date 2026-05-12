from django.contrib import admin
from django.urls import include, path
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):  # type: ignore[override]
        return Response({'status': 'ok'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', HealthView.as_view(), name='health'),
    path('api/', include('apps.users.urls')),
    path('api/', include('apps.documents.urls')),
    path('api/', include('apps.chat.urls')),
    path('api/', include('apps.stats.urls')),
]
