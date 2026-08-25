import React, { useState } from 'react';
import { BetaBadge } from '../components/BetaBadge';
import { CameraUpload } from '../components/BetaBadge';

export function EnergyScanner() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);
  };

  const handleFileError = (errorMessage) => {
    setError(errorMessage);
  };

  const handleScan = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/quash-bill', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `Error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Energy scanner error:', err);
      setError(err.message || 'Failed to scan bill');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents) => {
    if (cents == null) return 'N/A';
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="container">
      <div className="scanner-header">
        <div className="scanner-breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <span>Energy Scanner</span>
        </div>
        <h1 className="scanner-title">
          Energy Bill Scanner <BetaBadge size="medium" />
        </h1>
        <p className="scanner-subtitle">
          Scan your electricity/gas bill to extract your rates. This tool does not make savings claims - use it to compare against the regulator's reference prices.
        </p>
      </div>

      {!result && (
        <div className="scanner-content">
          <div className="upload-section">
            <h2>1. Upload or Capture Your Bill</h2>
            <CameraUpload 
              onFileSelect={handleFileSelect}
              onError={handleFileError}
            />
          </div>

          {file && (
            <div className="action-section">
              <h2>2. Scan Bill</h2>
              <button 
                className="btn btn-primary btn-large"
                onClick={handleScan}
                disabled={loading}
              >
                {loading ? 'Scanning...' : '🔍 Scan Bill'}
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="error-card">
          <h3>Error</h3>
          <p>{error}</p>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setError(null);
              setResult(null);
              setFile(null);
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {result && (
        <div className="results-section">
          <div className="section-header">
            <h2>Results</h2>
          </div>

          <div className="results-card">
            <div className="results-summary">
              <h3>Extracted Details</h3>
              <div className="results-grid">
                <div className="result-item">
                  <span className="result-label">Daily Supply Charge</span>
                  <span className="result-value">
                    {formatCurrency(result.extracted?.daily_charge_cents)} / day
                  </span>
                </div>
                <div className="result-item">
                  <span className="result-label">Usage Charge</span>
                  <span className="result-value">
                    {result.extracted?.usage_charge_cents?.toFixed(2)} c/kWh
                  </span>
                </div>
                <div className="result-item">
                  <span className="result-label">Usage This Period</span>
                  <span className="result-value">
                    {result.extracted?.usage_kwh?.toFixed(0)} kWh
                  </span>
                </div>
                <div className="result-item">
                  <span className="result-label">Billing Days</span>
                  <span className="result-value">
                    {result.extracted?.billing_days} days
                  </span>
                </div>
              </div>
            </div>

            {result.reference_price_available && (
              <div className="results-summary">
                <h3>AER Reference Price</h3>
                <div className="results-grid">
                  <div className="result-item">
                    <span className="result-label">Daily Supply Charge</span>
                    <span className="result-value">
                      {formatCurrency(result.aer_reference?.daily_charge_cents)} / day
                    </span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Usage Charge</span>
                    <span className="result-value">
                      {result.aer_reference?.usage_charge_cents?.toFixed(2)} c/kWh
                    </span>
                  </div>
                </div>
                <p className="result-disclaimer">{result.aer_reference.disclaimer}</p>
              </div>
            )}

            <div className="results-actions">
              <p className="result-disclaimer">{result.disclaimer}</p>
              <a href="/compare?vertical=energy" className="btn btn-primary">
                Compare Plans
              </a>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setResult(null);
                  setFile(null);
                  setError(null);
                }}
              >
                Scan Another Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
