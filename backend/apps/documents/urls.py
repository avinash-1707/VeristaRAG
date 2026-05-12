from django.urls import path

from .views import CloudinarySignatureView, DocumentDetailView, DocumentListCreateView, DocumentRetryView

urlpatterns = [
    path('documents/', DocumentListCreateView.as_view(), name='document-list'),
    path('documents/signature/', CloudinarySignatureView.as_view(), name='upload-signature'),
    path('documents/<uuid:document_id>/', DocumentDetailView.as_view(), name='document-detail'),
    path('documents/<uuid:document_id>/retry/', DocumentRetryView.as_view(), name='document-retry'),
]
