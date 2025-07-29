import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
function PDFViewer({ file, pageNumber, setPageNumber, numPages, setNumPages }) {
  const [scale, setScale] = useState(1.13);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setError(null);
    setLoading(true);
    setPageNumber(1);
  }, [file, setPageNumber]);
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };
  const onDocumentLoadError = (err) => {
    console.error('Error loading PDF:', err);
    setError('Failed to load PDF document. Please try again.');
    setLoading(false);
  };
  const handlePrev = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };
  const handleNext = () => {
    setPageNumber((prev) => Math.min(numPages || Infinity, prev + 1));
  };
  const handlePageInputChange = (e) => {
    let val = parseInt(e.target.value);
    if (!val) return;
    if (val < 1) val = 1;
    if (numPages && val > numPages) val = numPages;
    setPageNumber(val);
  };
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };
  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };
  const handleResetZoom = () => {
    setScale(1.13);
  };
  return (
    <div className="pdf-viewer">
      <div className="pdf-controls-top">
        <button onClick={handlePrev} disabled={pageNumber <= 1} className="nav-btn">
          ← Prev
        </button>
        <div className="page-info">
          <input
            type="number"
            min="1"
            max={numPages || 1}
            value={pageNumber}
            onChange={handlePageInputChange}
            className="page-input"
          />
          <span> / {numPages || '-'}</span>
        </div>
        <button onClick={handleNext} disabled={numPages ? pageNumber >= numPages : true} className="nav-btn">
          Next →
        </button>
        <div style={{ flexGrow: 1 }} /> {/* Spacer */}
        <div className="zoom-controls">
          <button onClick={handleZoomOut} disabled={scale <= 0.5}>
            -
          </button>
          <span className="zoom-level">{Math.round(scale * 100)}%</span>
          <button onClick={handleZoomIn} disabled={scale >= 3.0}>
            +
          </button>
          <button onClick={handleResetZoom}>Reset</button>
        </div>
      </div>
      <div className="pdf-view-wrapper" style={{ minHeight: 460, background: '#F7F4FB' }}>
        {loading && (
          <div style={{ padding: 40, textAlign: 'center', color: '#8157A6' }}>
            Loading PDF...
          </div>
        )}
        {error && (
          <div className="pdf-error">
            <h3>Error Loading PDF</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="reset-btn">
              Reload Page
            </button>
          </div>
        )}
        {!error && file && (
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading=""
            options={{ workerSrc: pdfjs.GlobalWorkerOptions.workerSrc }}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              loading=""
              width={540}
              renderMode="canvas"
              className="pdf-page"
            />
          </Document>
        )}
      </div>
    </div>
  );
}

export default PDFViewer;
