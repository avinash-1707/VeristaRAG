from django.urls import path

from .views import ChatSessionDetailView, ChatSessionListCreateView, QueryView

urlpatterns = [
    path('chat/sessions/', ChatSessionListCreateView.as_view(), name='chat-session-list'),
    path('chat/sessions/<uuid:session_id>/', ChatSessionDetailView.as_view(), name='chat-session-detail'),
    path('chat/query/', QueryView.as_view(), name='chat-query'),
]
