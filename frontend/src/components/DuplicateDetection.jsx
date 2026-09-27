import React, { useState } from 'react';
import './styles/index.css';

const DuplicateDetection = () => {
  const [inputMethod, setInputMethod] = useState('textarea'); // 'textarea' or 'csv'
  const [descriptions, setDescriptions] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [csvColumn, setCsvColumn] = useState('');
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [threshold, setThreshold] = useState(0.8);

  const handleDescriptionsChange = (e) => {
    setDescriptions(e.target.value);
  };

  const handleCsvFileChange = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);
    setCsvColumn('');
    setCsvHeaders([]);
    setPreviewData([]);

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csvText = event.target.result;
          const lines = csvText.split('\n').filter(line => line.trim());

          if (lines.length === 0) {
            setError('CSV file is empty');
            return;
          }

          const headers = lines[0].split(',').map(h => h.trim());
          setCsvHeaders(headers);

          // Preview first 5 rows (excluding header)
          const preview = lines.slice(1, 6).map(line => {
            const values = line.split(',').map(v => v.trim());
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index] !== undefined ? values[index] : '';
            });
            return row;
          });

          setPreviewData(preview);
        } catch (err) {
          setError('Error parsing CSV file');
        }
      };
      reader.onerror = () => {
        setError('Error reading CSV file');
      };
      reader.readAsText(file);
    }
  };

  const handleCsvColumnChange = (e) => {
    setCsvColumn(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResults(null);
    setLoading(true);

    try {
      let descriptionArray = [];

      if (inputMethod === 'textarea') {
        if (!descriptions.trim()) {
          setError('Please enter material descriptions');
          return;
        }
        descriptionArray = descriptions
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
      } else {
        if (!csvFile) {
          setError('Please select a CSV file');
          return;
        }
        if (!csvColumn) {
          setError('Please select a column containing descriptions');
          return;
        }

        // Extract descriptions from selected column
        const reader = new FileReader();
        const csvText = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.target.result);
          reader.onerror = () => reject('Error reading CSV file');
          reader.readAsText(csvFile);
        });

        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length <= 1) {
          setError('CSV file has no data rows');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const columnIndex = headers.indexOf(csvColumn);

        if (columnIndex === -1) {
          setError('Selected column not found in CSV');
          return;
        }

        descriptionArray = lines.slice(1).map(line => {
          const values = line.split(',');
          return values[columnIndex] !== undefined ? values[columnIndex].trim() : '';
        }).filter(desc => desc.length > 0);
      }

      if (descriptionArray.length < 2) {
        setError('Please enter at least 2 material descriptions');
        return;
      }

      const response = await fetch('http://localhost:8000/duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(descriptionArray.map(desc => ({ description: desc })))
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setDescriptions('');
    setCsvFile(null);
    setCsvColumn('');
    setCsvHeaders([]);
    setPreviewData([]);
    setResults(null);
    setError(null);
  };

  const handleDownloadResults = () => {
    if (!results) return;

    // Convert results to CSV
    const headers = ['Index 1', 'Index 2', 'Description 1', 'Description 2', 'Combined Score', 'Match Type', 'Confidence'];
    const csvRows = [
      headers.join(',')
    ];

    results.duplicates.forEach(dup => {
      const row = [
        dup.index_1,
        dup.index_2,
        `"${dup.description_1.replace(/"/g, '""')}"`,
        `"${dup.description_2.replace(/"/g, '""')}"`,
        dup.combined_score.toFixed(4),
        dup.match_type,
        dup.confidence
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'duplicate_detection_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!results) {
    return (
      <div className="container-fluid px-4 py-3">
        {/* Page Header */}
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <h1 className="h2">Duplicate Detection</h1>
        </div>

        {/* Input Section */}
        <div className="row g-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header pb-0 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Input Material Descriptions</h5>
                <div className="btn-group btn-group-sm">
                  <button
                    className={`${inputMethod === 'textarea' ? 'btn btn-primary active' : 'btn btn-outline-primary'}`}
                    onClick={() => setInputMethod('textarea')}
                  >
                    Text Area
                  </button>
                  <button
                    className={`${inputMethod === 'csv' ? 'btn btn-primary active' : 'btn btn-outline-primary'}`}
                    onClick={() => setInputMethod('csv')}
                  >
                    CSV Upload
                  </button>
                </div>
              </div>
              <div className="card-body p-4">
                {inputMethod === 'textarea' ? (
                  <div className="mb-3">
                    <label className="form-label">Material Descriptions (one per line)</label>
                    <textarea
                      className="form-control"
                      rows="8"
                      value={descriptions}
                      onChange={handleDescriptionsChange}
                      placeholder="Enter material descriptions, one per line\nExample:\nBALL VL 2 IN CL300\nBALL VALVE 2\" CLASS 300\nGATE VALVE 4\" CLASS 150"
                    />
                    <div className="form-text mt-2">
                      Enter one material description per line. The system will compare all pairs to find duplicates.
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <label className="form-label">CSV File Upload</label>
                      <input
                        type="file"
                        className="form-control"
                        accept=".csv"
                        onChange={handleCsvFileChange}
                      />
                      {csvFile && (
                        <div className="form-text mt-2">
                          Selected file: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                        </div>
                      )}
                    </div>

                    {csvHeaders.length > 0 && (
                      <div className="mb-3">
                        <label className="form-label">Description Column</label>
                        <select
                          className="form-select"
                          value={csvColumn}
                          onChange={handleCsvColumnChange}
                        >
                          <option value="">-- Select Column --</option>
                          {csvHeaders.map(header => (
                            <option key={header} value={header}>
                              {header}
                            </option>
                          ))}
                        </select>
                        {csvColumn === '' && (
                          <div className="form-text mt-2 text-danger">
                            Please select a column containing the material descriptions
                          </div>
                        )}
                      </div>
                    )}

                    {previewData.length > 0 && (
                      <div className="mb-3">
                        <label className="form-label">Data Preview</label>
                        <div className="table-responsive">
                          <table className="table table-sm table-bordered">
                            <thead className="table-light">
                              <tr>
                                {csvHeaders.map(header => (
                                  <th key={header}>{header}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {previewData.map((row, index) => (
                                <tr key={index}>
                                  {csvHeaders.map(header => (
                                    <td key={header}>{row[header] || ''}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {previewData.length === 5 && (
                          <div className="mt-2 text-small text-muted">
                            Showing first 5 rows of {previewData.length} preview rows
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="btn btn-outline-secondary me-2"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Find Duplicates'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similarity Threshold */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header pb-0 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Similarity Threshold</h5>
              </div>
              <div className="card-body p-4">
                <div className="d-flex align-items-center">
                  <label className="form-label me-3 mb-0">Minimum similarity score to consider a match:</label>
                  <div className="flex-grow-1 me-3">
                    <input
                      type="range"
                      className="form-range"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      value={threshold}
                      onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    />
                  </div>
                  <span className="fw-medium">{threshold * 100}%</span>
                </div>
                <p className="text-muted mt-2 mb-0">
                  Adjust the threshold to control sensitivity. Higher values = fewer but stronger matches. Lower values = more matches including weaker similarities.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {error}
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If we have results, show the results view
  return (
    <div className="container-fluid px-4 py-3">
      {/* Page Header */}
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <div>
          <h1 className="h2">Duplicate Detection Results</h1>
          <p className="text-muted mb-0">Analysis of {results?.total_pairs_checked || 0} material pairs</p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={handleClear}
            className="btn btn-outline-secondary"
          >
            New Analysis
          </button>
          <button
            onClick={handleDownloadResults}
            className="btn btn-outline-success"
            disabled={!results || results.duplicates.length === 0}
          >
            Export Results
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="row mb-4">
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body p-4">
              <h5 className="card-title">{results?.total_pairs_checked || 0}</h5>
              <p className="card-text text-muted mb-0">Total Pairs Compared</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body p-4">
              <h5 className="card-title">{results?.duplicates?.length || 0}</h5>
              <p className="card-text text-muted mb-0">Duplicates Found</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body p-4">
              <h5 className="card-title">
                {results?.duplicates?.length && results?.total_pairs_checked ?
                  ((results.duplicates.length / results.total_pairs_checked) * 100).toFixed(1) + '%' : '0%'}
              </h5>
              <p className="card-text text-muted mb-0">Duplication Rate</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body p-4">
              <h5 className="card-title">{new Set([
                ...(results?.duplicates?.map(d => d.match_type) || []),
                ...(results?.duplicates?.map(d => d.confidence) || [])
              ]).size}</h5>
              <p className="card-text text-muted mb-0">Match Types Found</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header pb-0 border-bottom d-flex justify-content-between align-items-center">
              <h5 class1="card-title mb-0">Duplicate Pairs</h5>
              {results?.duplicates?.length > 0 && (
                <span className="badge bg-info rounded-pill">
                  {results.duplicates.length} pairs
                </span>
              )}
            </div>
            <div className="card-body p-0">
              {results?.duplicates?.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  No duplicate pairs found above the selected threshold.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Description 1</th>
                        <th>Description 2</th>
                        <th>Score</th>
                        <th>Match Type</th>
                        <th>Confidence</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results?.duplicates?.map((dup, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '200px' }} title={dup.description_1}>
                              {dup.description_1}
                            </div>
                          </td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '200px' }} title={dup.description_2}>
                              {dup.description_2}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="fw-medium">{dup.combined_score.toFixed(3)}</div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge bg-${getMatchTypeClass(dup.match_type)}`}>
                              {dup.match_type.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td>
                            <span className={`badge bg-${getConfidenceClass(dup.confidence)}`}>
                              {dup.confidence.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                title="View Details"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                  <path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-success btn-sm"
                                title="Mark as Duplicate"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Duplicate Groups Summary */}
      {results?.duplicates?.length > 0 && (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header pb-0 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Duplicate Groups Summary</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-4">
                  {/* Group by Match Type */}
                  <div className="col-12 col-md-6">
                    <div className="border rounded p-3 bg-light h-100">
                      <h6 className="mb-3">By Match Type</h6>
                      <div className="mb-3">
                        {getMatchTypeCounts(results.duplicates).map(({ type, count }) => (
                          <div className="d-flex justify-content-between mb-2" key={type}>
                            <span>{type.replace(/_/g, ' ')}:</span>
                            <span className="fw-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Group by Confidence */}
                  <div className="col-12 col-md-6">
                    <div className="border rounded p-3 bg-light h-100">
                      <h6 className="mb-3">By Confidence Level</h6>
                      <div className="mb-3">
                        {getConfidenceCounts(results.duplicates).map(({ level, count }) => (
                          <div className="d-flex justify-content-between mb-2" key={level}>
                            <span>{level.replace(/_/g, ' ')}:</span>
                            <span className="fw-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions for determining badge colors
const getMatchTypeClass = (matchType) => {
  switch (matchType) {
    case 'TECHNICAL_IDENTICAL':
    case 'TECHNICAL_EQUIVALENT':
      return 'success';
    case 'FUNCTIONALLY_SIMILAR':
      return 'info';
    case 'SEMANTICALLY_RELATED':
      return 'warning';
    default:
      return 'secondary';
  }
};

const getConfidenceClass = (confidence) => {
  switch (confidence) {
    case 'HIGH':
    case 'MEDIUM_HIGH':
      return 'success';
    case 'MEDIUM':
      return 'info';
    case 'LOW_MEDIUM':
      return 'warning';
    default:
      return 'secondary';
  }
};

const getMatchTypeCounts = (duplicates) => {
  const counts = {};
  duplicates.forEach(dup => {
    counts[dup.match_type] = (counts[dup.match_type] || 0) + 1;
  });
  return Object.entries(counts).map(([type, count]) => ({ type, count }));
};

const getConfidenceCounts = (duplicates) => {
  const counts = {};
  duplicates.forEach(dup => {
    counts[dup.confidence] = (counts[dup.confidence] || 0) + 1;
  });
  return Object.entries(counts).map(([level, count]) => ({ level, count }));
};

export default DuplicateDetection;