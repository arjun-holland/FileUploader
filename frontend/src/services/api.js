import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
});

export const uploadFile = async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
    });
    return response.data;
};

export const getFiles = async () => {
    const response = await api.get('/files');
    return response.data;
};

export const downloadFile = (fileId) => {
    // Open in new tab or trigger download directly
    window.location.href = `${API_URL}/download/${fileId}`;
};

export const deleteFile = async (fileId) => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
};

export default api;
