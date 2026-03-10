from django.urls import path
from .views import FileUploadView, FileListView, FileMetadataView, FileDownloadView

urlpatterns = [
    path('upload', FileUploadView.as_view(), name='file-upload'),
    path('files', FileListView.as_view(), name='file-list'),
    path('files/<str:file_id>', FileMetadataView.as_view(), name='file-metadata'),
    path('download/<str:file_id>', FileDownloadView.as_view(), name='file-download'),
]
