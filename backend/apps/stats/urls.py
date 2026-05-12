from django.urls import path

from .views import DashboardStatsView, QueryLogListView

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('stats/logs/', QueryLogListView.as_view(), name='query-logs'),
]
