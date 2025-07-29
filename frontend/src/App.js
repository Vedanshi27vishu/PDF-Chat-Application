import React, { useState } from 'react';
import UploadSection from './UploadSection';
import PDFViewer from './PDFViewer';
import ChatBox from './ChatBox';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [pdfId, setPdfId] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleUpload = async (uploadedFile) => {
    if (uploadedFile) {
      try {
        const fileUrl = URL.createObjectURL(uploadedFile);
        setFile(fileUrl);
        setFileName(uploadedFile.name);
        setPageNumber(1);
        setNumPages(null);
        const formData = new FormData();
        formData.append('pdf', uploadedFile);

        const response = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setPdfId(data.pdfId);
        } else {
          setPdfId('local-' + Date.now().toString());
        }
      } catch (error) {
        setFile(URL.createObjectURL(uploadedFile));
        setFileName(uploadedFile.name);
        setPageNumber(1);
        setNumPages(null);
        setPdfId('local-' + Date.now().toString());
      }
    }
  };
  const handleReset = () => {
    if (file) {
      URL.revokeObjectURL(file);
    }
    setFile(null);
    setFileName('');
    setPageNumber(1);
    setNumPages(null);
    setPdfId(null);
  };
  return (
    <div className="app">
      <div className="header">
        <h1>
          PDF Chat Application
          <div className="byline">by Vedanshi Aggarwal</div>
        </h1>
        {fileName && (
          <div className="file-info">
            <span>Current file: {fileName}</span>
            <button onClick={handleReset} className="reset-btn">
              Upload New File
            </button>
          </div>
        )}
      </div>
   {!file ? (
        <UploadSection onUpload={handleUpload} />
      ) : (
        <div className="main-content">
          <div className="pdf-section card">
            <PDFViewer
              file={file}
              pageNumber={pageNumber}
              setPageNumber={setPageNumber}
              numPages={numPages}
              setNumPages={setNumPages}
            />
          </div>
          <div className="chat-section card">
            <ChatBox pdfId={pdfId} setPageNumber={setPageNumber} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
