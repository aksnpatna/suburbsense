import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { BetaBadge } from '../components/BetaBadge';
import { CameraUpload } from '../components/BetaBadge';

export function GroceryScanner() {
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

      const response = await fetch('/api/quash-grocery', {
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
      console.error('Grocery scanner error:', err);
      setError(err.message || 'Failed to scan receipt');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value == null) return 'N/A';
    return `$${parseFloat(value).toFixed(2)}`;
  };

  return (
    <div className="container">
      <Helmet>
        <title>Grocery Receipt Scanner — Community Price Comparison | SuburbSense</title>
        <meta name="description" content="Scan your grocery receipt to extract items and see local community prices. Free beta tool from SuburbSense." />
      </Helmet>

      <div className="scanner-header">
        <div className="scanner-breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <span>Grocery Scanner</span>
        </div>
        <h1 className="scanner-title">
          Grocery Receipt Scanner <BetaBadge size="medium" />
        </h1>
        <p className="scanner-subtitle">
          Scan your grocery receipt to extract items and see local community prices. This tool is in beta - the more people contribute, the better it gets!
        </p>
        <p className="scanner-liability-notice">
          Grocery prices are community-reported and may vary by store, location, and date. Not a representation of any retailer's current pricing.
        </p>
      </div>

      {!result && (
        <div className="scanner-content">
          <div className="upload-section">
            <h2>1. Upload or Capture Your Receipt</h2>
            <CameraUpload 
              onFileSelect={handleFileSelect}
              onError={handleFileError}
            />
          </div>

          {file && (
            <div className="action-section">
              <h2>2. Scan Receipt</h2>
              <button 
                className="btn btn-primary btn-large"
                onClick={handleScan}
                disabled={loading}
              >
                {loading ? 'Scanning...' : '🔍 Scan Receipt'}
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
              <h3>Store Details</h3>
              <div className="results-grid">
                <div className="result-item">
                  <span className="result-label">Store</span>
                  <span className="result-value">{result.extracted?.store_name || 'Unknown'}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Suburb</span>
                  <span className="result-value">{result.extracted?.store_suburb || 'Unknown'}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Date</span>
                  <span className="result-value">{result.extracted?.date || 'Unknown'}</span>
                </div>
              </div>
            </div>

            {result.extracted?.items?.length > 0 && (
              <div className="results-summary">
                <h3>Items Purchased</h3>
                <div className="items-table">
                  <div className="table-header">
                    <div className="cell">Item</div>
                    <div className="cell">Price</div>
                    <div className="cell">Community Median</div>
                    <div className="cell">Observations</div>
                  </div>
                  {result.extracted.items.map((item, index) => {
                    const match = result.matches.find(m => m.original.name === item.name);
                    return (
                      <div key={index} className="table-row">
                        <div className="cell">{item.name}</div>
                        <div className="cell">{formatCurrency(item.price)}</div>
                        <div className="cell">{match ? formatCurrency(match.median_price) : 'N/A'}</div>
                        <div className="cell">{match ? match.observation_count : 'N/A'}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="total-row">
                  <div className="total-label">Original Total:</div>
                  <div className="total-value">{formatCurrency(result.original_total)}</div>
                  {result.matched_total > 0 && (
                    <>
                      <div className="total-label">Matched Items Total:</div>
                      <div className="total-value">{formatCurrency(result.matched_total)}</div>
                      {result.original_total > 0 && (
                        <>
                          <div className="total-label">Difference:</div>
                          <div className="total-value">
                            {formatCurrency(result.original_total - result.matched_total)}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
                <p className="item-count">
                  {result.extracted.items.length} items purchased ({result.matches.length} with median prices)
                </p>
              </div>
            )}

            <div className="results-summary">
              <h3>Community Benchmark</h3>
              <p className="benchmark-text">{result.choice_benchmark.description}</p>
              <p className="benchmark-source">
                Source: <a href={result.choice_benchmark.url} target="_blank" rel="noopener noreferrer">
                  {result.choice_benchmark.name} ({result.choice_benchmark.date})
                </a>
              </p>
            </div>

            <div className="results-actions">
              <p className="result-disclaimer">{result.disclaimer}</p>
              <p className="beta-disclaimer">{result.beta_label}</p>
              <a href="/compare?vertical=energy" className="btn btn-primary">
                Compare Energy Plans
              </a>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setResult(null);
                  setFile(null);
                  setError(null);
                }}
              >
                Scan Another Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
