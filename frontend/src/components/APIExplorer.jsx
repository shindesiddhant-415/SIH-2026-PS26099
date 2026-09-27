import React, { useState } from 'react';
import './styles/index.css';

const APIExplorer = () => {
  const [endpoint, setEndpoint] = useState('health');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timestamp, setTimestamp] = useState(null);

  const endpoints = [
    { value: 'health', label: 'GET /health - Health Check' },
    { value: 'stats', label: 'GET /stats - API Statistics' },
    { value: 'fingerprint', label: 'POST /fingerprint - Generate Fingerprint' },
    { value: 'match', label: 'POST /match - Compare Two Materials' },
    { value: 'duplicates', label: 'POST /duplicates - Find Duplicates' },
    { value: 'cluster', label: 'POST /cluster - Cluster Materials' }
  ];

  const handleEndpointChange = (e) => {
    setEndpoint(e.target.value);
    setRequestBody(getDefaultBodyForEndpoint(e.target.value));
    setResponse(null);
    setError(null);
    setTimestamp(null);
  };

  const getDefaultBodyForEndpoint = (endpoint) => {
    switch (endpoint) {
      case 'fingerprint':
        return JSON.stringify({ description: 'BALL VL 2 IN CL300' }, null, 2);
      case 'match':
        return JSON.stringify({
          description_1: 'BALL VL 2 IN CL300',
          description_2: 'BALL VALVE 2" CLASS 300'
        }, null, 2);
      case 'duplicates':
        return JSON.stringify([
          { description: 'BALL VL 2 IN CL300' },
          { description: 'BALL VALVE 2" CLASS 300' },
          { description: 'GATE VALVE 4" CLASS 150' },
          { description: 'GATE VALVE 4" CLASS 300' }
        ], null, 2);
      case 'cluster':
        return JSON.stringify([
          { description: 'BALL VL 2 IN CL300' },
          { description: 'BALL VALVE 2" CLASS 300' },
          { description: 'GATE VALVE 4" CLASS 150' },
          { description: 'GATE VALVE 4" CLASS 300' },
          { description: 'CS PIPE 6" SCH 40' },
          { description: 'SS PIPE 6" SCH 40' }
        ], null, 2);
      default:
        return '';
    }
  };

  const handleRequestBodyChange = (e) => {
    setRequestBody(e.target.value);
  };

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setTimestamp(null);

    try {
      let url = 'http://localhost:8000/';
      let options = {};

      switch (endpoint) {
        case 'health':
          url += 'health';
          break;
        case 'stats':
          url += 'stats';
          break;
        case 'fingerprint':
          url += 'fingerprint';
          options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: requestBody
          };
          break;
        case 'match':
          url += 'match';
          options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: requestBody
          };
          break;
        case 'duplicates':
          url += 'duplicates';
          options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: requestBody
          };
          break;
        case 'cluster':
          url += 'cluster';
          options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: requestBody
          };
          break;
      }

      if (endpoint === 'health' || endpoint === 'stats') {
        const responseData = await fetch(url);
        if (!responseData.ok) {
          throw new Error(`HTTP ${responseData.status}: ${responseData.statusText}`);
        }
        const data = await responseData.json();
        setResponse(data);
      } else {
        const responseData = await fetch(url, options);
        if (!responseData.ok) {
          throw new Error(`HTTP ${responseData.status}: ${responseData.statusText}`);
        }
        const data = await responseData.json();
        setResponse(data);
      }

      setTimestamp(new Date().toLocaleString());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResponse(null);
    setError(null);
    setTimestamp(null);
  };

  const handleCopyResponse = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response, null, 2)).then(() => {
      alert('Response copied to clipboard!');
    });
  };

  const handleDownloadResponse = () => {
    if (!response) return;
    const jsonContent = JSON.stringify(response, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `api-response-${endpoint}-${new Date().toISOString().slice(0,19)}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container-fluid px-4 py-3">
      {/* Page Header */}
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">API Explorer</h1>
        <p className="text-muted mb-0">Test and examine API endpoints directly</p>
      </div>

      {/* Control Panel */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header pb-0 border-bottom">
              <h5 className="card-title mb-0">Endpoint Selection</h5>
            </div>
            <div className="card-body p-4">
              <select
                className="form-select"
                value={endpoint}
                onChange={handleEndpointChange}
              >
                {endpoints.map((ep) => (
                  <option key={ep.value} value={ep.value}>
                    {ep.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header pb-0 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Request Configuration</h5>
            </div>
            <div className="card-body p-4">
              <div className="mb-3">
                <label className="form-label">Request Body (JSON)</label>
                <div className="position-relative">
                  <textarea
                    className="form-control f-monospace"
                    rows="8"
                    value={requestBody}
                    onChange={handleRequestBodyChange}
                    placeholder="Enter JSON request body..."
                  />
                  {endpoint === 'health' || endpoint === 'stats' && (
                    <div className="position-absolute top-0 end-0 mt-2 me-2 text-sm text-muted">
                      GET request - body ignored
                    </div>
                  )}
                </div>
                <div className="form-text mt-2">
                  Edit the JSON request body for POST requests. GET requests ignore the body.
                </div>
              </div>
              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <button
                  type="button"
                  onClick={handleClear}
                  className="btn btn-outline-secondary me-2"
                >
                  Clear Response
                </button>
                <button
                  type="button"
                  onClick={handleExecute}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Executing...' : 'Execute Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Response Section */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header pb-0 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Response</h5>
              <div className="d-flex gap-2">
                {response && (
                  <>
                    <button
                      onClick={handleCopyResponse}
                      className="btn btn-outline-primary btn-sm"
                      title="Copy to Clipboard"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2z"/>
                      </svg>
                    </button>
                    <button
                      onClick={handleDownloadResponse}
                      className="btn btn-outline-success btn-sm"
                      title="Download as JSON"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8r-7 7 7-7h8z"/>
                      </svg>
                    </button>
                  </>
                }
                {timestamp && (
                  <span className="text-muted small">Last updated: {timestamp}</span>
                )}
              </div>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="p-4 text-center text-danger">
                  <h6>Error</h6>
                  <p>{error}</p>
                </div>
              ) : response === null ? (
                <div className="p-4 text-center text-muted">
                  <p>No response yet. Configure a request and click "Execute Request".</p>
                </div>
              ) : (
                <div className="p-4">
                  <div className="json-viewer">
                    <pre className="mb-0 f-monospace"><code>{JSON.stringify(response, null, 2)}</code></pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Example Requests */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header pb-0 border-bottom">
              <h5 className="card-title mb-0">Example Requests</h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                {/* Fingerprint Example */}
                <div className="col-12 col-md-4">
                  <div className="border rounded p-3 bg-light cursor-pointer hover-lift transition-all duration-200" onClick={() => {
                    setEndpoint('fingerprint');
                    setRequestBody(JSON.stringify({ description: 'BALL VL 2 IN CL300' }, null, 2));
                  }}>
                    <small className="text-muted d-block">Generate Fingerprint</small>
                    <div class="fw-medium">BALL VL 2 IN CL300</div>
                  </div>
                </div>

                {/* Match Example */}
                <div className="col-12 col-md-4">
                  <div className="border rounded p-3 bg-light cursor-pointer hover-lift transition-all duration-200" onClick={() => {
                    setEndpoint('match');
                    setRequestBody(JSON.stringify({
                      description_1: 'BALL VL 2 IN CL300',
                      description_2: 'BALL VALVE 2" CLASS 300'
                    }, null, 2));
                  }}>
                    <small className="text-muted d-block">Compare Materials</small>
                    <div class="fw-medium">BALL VL 2 IN CL300</div>
                    <div class="fw-medium">BALL VALVE 2" CLASS 300</div>
                  </div>
                </div>

                {/* Duplicates Example */}
                <div className="col-12 col-md-4">
                  <div className="border rounded p-3 bg-light cursor-pointer hover-lift transition-all duration-200" onClick={() => {
                    setEndpoint('duplicates');
                    setRequestBody(JSON.stringify([
                      { description: 'BALL VL 2 IN CL300' },
                      { description: 'BALL VALVE 2" CLASS 300' },
                      { description: 'GATE VALVE 4" CLASS 150' },
                      { description: 'GATE VALVE 4" CLASS 300' }
                    ], null, 2));
                  }}>
                    <small className="text-muted d-block">Find Duplicates</small>
                    <div class="fw-medium">4 materials</div>
                  </div>
                </div>

                {/* Cluster Example */}
                <div className="col-12 col-md-4">
                  <div className="border rounded p-3 bg-light cursor-pointer hover-lift transition-all duration-200" onClick={() => {
                    setEndpoint('cluster');
                    setRequestBody(JSON.stringify([
                      { description: 'BALL VL 2 IN CL300' },
                      { description: 'BALL VALVE 2" CLASS 300' },
                      { description: 'GATE VALVE 4" CLASS 150' },
                      { description: 'GATE VALVE 4" CLASS 300' },
                      { description: 'CS PIPE 6" SCH 40' },
                      { description: 'SS PIPE 6" SCH 40' }
                    ], null, 2));
                  }}>
                    <small className="text-muted d-block">Cluster Materials</small>
                    <div class="fw-medium">6 materials</div>
                  </div>
                </div>

                {/* Health Check */}
                <div className="col-12 col-md-4">
                  <div className="border rounded p-3 bg-light cursor-pointer hover-lift transition-all duration-200" onClick={() => {
                    setEndpoint('health');
                    setRequestBody('');
                  }}>
                    <small className="text-muted d-block">Health Check</small>
                    <div class="fw-medium">GET /health</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="col-12 col-md-4">
                  <div className="border rounded p-3 bg-light cursor-pointer hover-lift transition-all duration-200" onClick={() => {
                    setEndpoint('stats');
                    setRequestBody('');
                  }}>
                    <small className="text-muted d-block">API Statistics</small>
                    <div class="fw-medium">GET /stats</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIExplorer;