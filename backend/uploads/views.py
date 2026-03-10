import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from .serializers import FileUploadSerializer
from .services import MongoFileService
from django.http import FileResponse, Http404

class FileUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        if serializer.is_valid():
            uploaded_file = request.FILES['file']
            
            fs = FileSystemStorage(location=os.path.join(settings.MEDIA_ROOT, 'uploads'))
            filename = fs.save(uploaded_file.name, uploaded_file)
            
            file_size = uploaded_file.size
            file_type = uploaded_file.content_type
            
            mongo_service = MongoFileService()
            metadata = mongo_service.save_metadata(
                original_filename=uploaded_file.name,
                stored_filename=filename,
                size=file_size,
                file_type=file_type
            )
            
            return Response({
                "file_id": metadata["file_id"],
                "filename": metadata["original_filename"],
                "size": metadata["size"],
                "uploaded_at": metadata["created_at"]
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FileListView(APIView):
    def get(self, request, *args, **kwargs):
        mongo_service = MongoFileService()
        files = mongo_service.get_all_files()
        
        response_data = []
        for file in files:
            response_data.append({
                "file_id": file["file_id"],
                "filename": file["original_filename"],
                "size": file["size"],
                "uploaded_at": file.get("created_at")
            })
            
        return Response(response_data, status=status.HTTP_200_OK)

class FileMetadataView(APIView):
    def get(self, request, file_id, *args, **kwargs):
        mongo_service = MongoFileService()
        metadata = mongo_service.get_file_metadata(file_id)
        
        if not metadata:
            return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)
            
        return Response(metadata, status=status.HTTP_200_OK)

    def delete(self, request, file_id, *args, **kwargs):
        mongo_service = MongoFileService()
        # Retrieve metadata first to get the stored filename
        metadata = mongo_service.get_file_metadata(file_id)
        
        if not metadata:
            return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Delete file from the disk
        stored_filename = metadata.get("stored_filename")
        if stored_filename:
            file_path = os.path.join(settings.MEDIA_ROOT, 'uploads', stored_filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                
        # Delete metadata from MongoDB
        deleted = mongo_service.delete_metadata(file_id)
        if deleted:
            return Response({"message": "File deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({"error": "Failed to delete file metadata"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FileDownloadView(APIView):
    def get(self, request, file_id, *args, **kwargs):
        mongo_service = MongoFileService()
        metadata = mongo_service.get_file_metadata(file_id)
        
        if not metadata:
            raise Http404("File metadata not found")
            
        stored_filename = metadata.get("stored_filename")
        if not stored_filename:
            raise Http404("Stored filename not found")
            
        file_path = os.path.join(settings.MEDIA_ROOT, 'uploads', stored_filename)
        
        if not os.path.exists(file_path):
            raise Http404("File missing from disk")
            
        response = FileResponse(open(file_path, 'rb'))
        response['Content-Disposition'] = f'attachment; filename="{metadata["original_filename"]}"'
        # Add CORS header manually just for FileResponse to ensure frontend can access via JS blob
        response["Access-Control-Expose-Headers"] = "Content-Disposition"
        return response
