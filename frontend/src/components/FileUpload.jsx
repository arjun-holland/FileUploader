import React, { useState, useRef } from 'react';
import { uploadFile } from '../services/api';
import { UploadCloud, CheckCircle, AlertCircle, File as FileIcon } from 'lucide-react';

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setProgress(0);
    }
  };

  const clearFile = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setProgress(0);
    
    try {
      await uploadFile(file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      });
      
      setStatus('success');
      setMessage('File uploaded successfully!');
      
      // Notify parent to refresh list
      if (onUploadSuccess) onUploadSuccess();
      
      // Reset after a delay
      setTimeout(() => {
        clearFile();
      }, 3000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setStatus('error');
      setMessage(error.response?.data?.error || 'Failed to upload file. Please try again.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setStatus('idle');
      setProgress(0);
    }
  };

  return (
    <div className="upload-container glass-panel">
        <div 
          className={`drop-zone ${file ? 'has-file' : ''} ${status === 'uploading' ? 'disabled' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => status !== 'uploading' && fileInputRef.current?.click()}
        >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              disabled={status === 'uploading'}
            />
            
            {!file ? (
                <div className="drop-content">
                    <UploadCloud size={48} className="icon-primary rotate-pulse" />
                    <h3>Click or drag file to this area to upload</h3>
                    <p className="text-sm">Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files</p>
                </div>
            ) : (
                <div className="file-selected-content">
                    <FileIcon size={40} className="icon-secondary" />
                    <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                </div>
            )}
        </div>

        {file && status !== 'success' && status !== 'uploading' && (
            <div className="actions">
                <button className="btn btn-outline" onClick={clearFile}>Cancel</button>
                <button className="btn btn-primary" onClick={handleUpload}>
                    Upload File
                </button>
            </div>
        )}

        {status === 'uploading' && (
            <div className="progress-container">
                <div className="progress-info">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                </div>
                <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        )}

        {status === 'success' && (
            <div className="status-message success slide-up">
                <CheckCircle size={20} />
                <span>{message}</span>
            </div>
        )}

        {status === 'error' && (
            <div className="status-message error shake">
                <AlertCircle size={20} />
                <span>{message}</span>
                <button className="btn btn-sm btn-outline ml-auto" onClick={clearFile}>Try Again</button>
            </div>
        )}
    </div>
  );
};

export default FileUpload;
