from django.urls import path

from .views import CloudinarySignatureView, DocumentDetailView, DocumentListCreateView

urlpatterns = [
    path('documents/', DocumentListCreateView.as_view(), name='document-list'),
    path('documents/<uuid:document_id>/', DocumentDetailView.as_view(), name='document-detail'),
    path('documents/upload-signature/', CloudinarySignatureView.as_view(), name='upload-signature'),
]
