# File Upload Service - SkyVault API

A production-ready full-stack application built with React, Django REST Framework, and MongoDB for uploading files and retrieving metadata.

## Architecture
- **Frontend**: React 18, Vite, Axios, Lucide Icons, Custom Glassmorphism CSS
- **Backend**: Python 3.11+, Django, Django REST Framework, PyMongo
- **Database**: MongoDB
- **Infrastructure**: Docker, Docker Compose, Nginx (for React)

## Setup Instructions

### Prerequisites
- Docker and Docker Compose installed on your system.

### Running the Application

1. Navigate to the project root directory where `docker-compose.yml` is located.
2. Build and start the services using Docker Compose:
   ```bash
   docker-compose up --build
   ```
   *Note: On the first run, Django might complain about unapplied migrations for default apps (admin, auth). This won't affect the file upload endpoints since they use MongoDB.*
3. Access the web interface at `http://localhost:3000/`. The backend API runs cleanly abstracting behind this.

## API Endpoints (Backend is on port 8000)
- `POST /api/upload`: Uploads a file, saves it to `media/uploads/` directory, and stores its metadata in MongoDB.
- `GET /api/files`: Returns all uploaded file metadata stored in MongoDB.
- `GET /api/files/{file_id}`: Returns exact metadata for a specific file.
- `GET /api/download/{file_id}`: Retrieves the stored file and returns it as a downloadable attachment with proper CORS extraction mapping headers.
