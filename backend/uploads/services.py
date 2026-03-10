import os
import uuid
from datetime import datetime
from pymongo import MongoClient
from django.conf import settings

class MongoFileService:
    def __init__(self):
        self.client = MongoClient(settings.MONGO_URI)
        self.db = self.client[settings.MONGO_DB_NAME]
        self.collection = self.db['files']

    def save_metadata(self, original_filename, stored_filename, size, file_type):
        file_id = str(uuid.uuid4())
        
        document = {
            "file_id": file_id,
            "original_filename": original_filename,
            "stored_filename": stored_filename,
            "size": size,
            "file_type": file_type,
            "created_at": datetime.utcnow().isoformat()
        }
        
        self.collection.insert_one(document)
        document.pop('_id', None)
        return document

    def get_all_files(self):
        # Sort by most recent
        cursor = self.collection.find({}, {"_id": 0}).sort("created_at", -1)
        return list(cursor)

    def get_file_metadata(self, file_id):
        return self.collection.find_one({"file_id": file_id}, {"_id": 0})

    def delete_metadata(self, file_id):
        # Delete document from MongoDB and return boolean indicating success
        result = self.collection.delete_one({"file_id": file_id})
        return result.deleted_count > 0
