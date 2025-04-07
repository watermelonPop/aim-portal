import React, { useRef, useState } from 'react';
import './CustomFileInput.css';

function CustomFileInput({ onFileChange, fileLabel = "Upload Supporting Form (optional)" }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState("No file chosen");

  const handleBrowseClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      if (onFileChange) {
        onFileChange(file);
      }
    }
  };

  return (
    <div className="customFileInputWrapper">
      <label>{fileLabel}</label>
      <div className="customFileInputRow">
        <button type="button" onClick={handleBrowseClick} className="customBrowseButton">
          Browse
        </button>
        <span className="fileNameSpan" aria-live="polite">{fileName}</span>
      </div>
      <input
        type="file"
        accept="application/pdf"
        ref={inputRef}
        className="realFileInput"
        onChange={handleFileChange}
        aria-label="Upload PDF file"
      />
    </div>
  );
}

export default CustomFileInput;
