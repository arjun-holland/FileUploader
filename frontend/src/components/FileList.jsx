import React, { useEffect, useState } from 'react';
import { getFiles, downloadFile, deleteFile } from '../services/api';
import { Download, File as FileIcon, Clock, Database, RefreshCw, Trash2 } from 'lucide-react';

const FileList = ({ refreshTrigger }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFiles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getFiles();
      setFiles(data);
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setError('Could not load files. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Unknown date';
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteFile(fileId);
        fetchFiles(); // Refresh the list after successful deletion
      } catch (err) {
        console.error('Failed to delete file:', err);
        alert('Failed to delete file.');
      }
    }
  };

  return (
    <div className="file-list-container glass-panel">
      <div className="flex justify-end mb-4">
        <button className="btn btn-outline btn-sm" onClick={fetchFiles} disabled={loading} title="Refresh list">
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span className="ml-2">Refresh</span>
        </button>
      </div>

      {loading && files.length === 0 ? (
        <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading files...</p>
        </div>
      ) : error ? (
        <div className="error-state">
            <p>{error}</p>
            <button className="btn btn-outline mt-4" onClick={fetchFiles}>Retry</button>
        </div>
      ) : files.length === 0 ? (
        <div className="empty-state">
            <Database size={48} className="icon-muted mb-4" />
            <h3>No files found</h3>
            <p>Upload a file to see it appear here.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="files-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Uploaded At</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.file_id} className="fade-in">
                  <td>
                    <div className="flex items-center gap-3">
                        <div className="file-icon-wrapper">
                            <FileIcon size={18} className="icon-primary" />
                        </div>
                        <span className="font-medium text-truncate max-w-200" title={file.filename}>
                            {file.filename}
                        </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-muted">
                        <Database size={14} />
                        {formatSize(file.size)}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-muted">
                        <Clock size={14} />
                        {formatDate(file.uploaded_at)}
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                          className="btn btn-sm btn-primary btn-download"
                          onClick={() => downloadFile(file.file_id)}
                          title="Download File"
                        >
                          <Download size={16} />
                          <span>Download</span>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline btn-delete"
                          onClick={() => handleDelete(file.file_id)}
                          title="Delete File"
                        >
                          <Trash2 size={16} className="icon-danger" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FileList;
