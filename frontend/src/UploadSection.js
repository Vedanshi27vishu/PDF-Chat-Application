import React, { useRef, useState } from "react";

function UploadSection({ onUpload }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    await processFile(file);
  };
  const processFile = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file only.');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 10MB.');
      return;
    }

    setUploading(true);
    try {
      await onUpload(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  return (
    <div className="upload-container">
      <div 
        className={`upload-area ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={uploading}
        />
        
        <div className="upload-content">
          {uploading ? (
            <div className="upload-spinner">
              <div className="spinner"></div>
              <p>Processing PDF...</p>
            </div>
          ) : (
            <>
              <div className="upload-icon">📄</div>
              <h3>Upload PDF Document</h3>
              <p>
                Drag and drop your PDF file here, or{' '}
                <span className="upload-link">click to browse</span>
              </p>
              <div className="upload-requirements">
                <small>
                  • PDF files only<br/>
                  • Maximum file size: 10MB
                </small>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadSection;