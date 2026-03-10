import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import { Cloud, Heart, Upload, FolderOpen } from 'lucide-react';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('upload');

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    // Conditionally render the files list once a file is successfully uploaded
    setActiveTab('files');
  };

  return (
    <div className="app-container">
        <div className="ambient-background">
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
        </div>

        <header className="app-header fade-in">
            <div className="logo-container">
                <div className="logo-glow">
                    <Cloud className="logo-icon" size={40} />
                </div>
                <h1>SkyVault</h1>
            </div>
            <p className="subtitle">Next-Generation File Storage</p>
        </header>

        <main className="main-content slide-up">
            <div className="tabs-wrapper">
                <div className="tabs-container">
                    <button 
                        className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upload')}
                    >
                        <Upload size={18} />
                        <span>Upload</span>
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
                        onClick={() => setActiveTab('files')}
                    >
                        <FolderOpen size={18} />
                        <span>My Files</span>
                    </button>
                </div>
            </div>

            <div className="tab-pane-container">
                {/* Conditional Rendering Method explicitly used here */}
                {activeTab === 'upload' && (
                    <div className="tab-pane animate-in">
                        <FileUpload onUploadSuccess={handleUploadSuccess} />
                    </div>
                )}
                {activeTab === 'files' && (
                    <div className="tab-pane animate-in">
                        <FileList refreshTrigger={refreshTrigger} />
                    </div>
                )}
            </div>
        </main>

        <footer className="app-footer fade-in">
            <p className="flex-center">
                Built with React & Django <Heart size={14} className="icon-danger ml-2 fill-current animate-pulse" />
            </p>
        </footer>
    </div>
  );
}

export default App;
