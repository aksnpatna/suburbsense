import React, { useState, useRef, useEffect } from 'react';

export function BetaBadge({ size = 'medium', className = '' }) {
  const sizeClasses = {
    small: 'beta-small',
    medium: 'beta-medium',
    large: 'beta-large'
  };

  return (
    <span className={`beta-badge ${sizeClasses[size]} ${className}`}>
      <span className="beta-dot"></span>
      <span className="beta-text">Beta</span>
    </span>
  );
}

export function CameraUpload({ onFileSelect, onError }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        onError('File too large. Please select an image under 10MB.');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        onError('Please select an image file.');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      onFileSelect(file);
    }
  };

  const handleCameraClick = () => {
    setIsCapturing(true);
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  useEffect(() => {
    if (isCapturing) {
      const timer = setTimeout(() => {
        setIsCapturing(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isCapturing]);

  return (
    <div className="camera-upload">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <div className="camera-button-wrapper">
        <button 
          className={`camera-button ${isCapturing ? 'capturing' : ''}`}
          onClick={handleCameraClick}
          disabled={isCapturing}
        >
          {isCapturing ? '📸 Capturing...' : '📱 Take Photo'}
        </button>
      </div>

      <div className="file-input-wrapper">
        <label className="file-input-label">
          📂 Choose File
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {preview && (
        <div className="image-preview">
          <img src={preview} alt="Preview" className="preview-image" />
          <button 
            className="remove-preview"
            onClick={() => {
              setPreview(null);
              onFileSelect(null);
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="upload-hints">
        <p>Supported formats: JPG, PNG, WEBP (Max size: 10MB)</p>
        <p>Position receipt/bill flat in good lighting for best results</p>
      </div>
    </div>
  );
}
