import React, { useState } from 'react';
import './styles/index.css';

const Clustering = () => {
  const [inputMethod, setInputMethod] = useState('textarea'); // 'textarea' or 'csv'
  const [descriptions, setDescriptions] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [csvColumn, setCsvColumn] = useState('');
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [method, setMethod] = useState('hybrid'); // 'hybrid', 'technical', 'semantic'
  const [minClusterSize, setMinClusterSize] = useState(2);

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

      if (descriptionArray.length < minClusterSize) {
        setError(`Please enter at least ${minClusterSize} material descriptions`);
        return;
      }

      const response = await fetch('http://localhost:8000/cluster', {
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

    // Convert results to JSON for download
    const jsonContent = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'clustering_results.json');
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
          <h1 className="h2">Material Clustering</h1>
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
                      Enter one material description per line. The system will group similar materials into clusters.
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
                    {loading ? 'Processing...' : 'Perform Clustering'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clustering Parameters */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header pb-0 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Clustering Parameters</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-4">
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Clustering Method</label>
                      <select
                        className="form-select"
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                      >
                        <option value="hybrid">Hybrid (Technical + Semantic)</option>
                        <option value="technical">Technical Identity Only</option>
                        <option value="semantic">Semantic Similarity Only</option>
                      </select>
                      <div className="form-text mt-2">
                        Choose how to measure similarity between materials for clustering.
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Minimum Cluster Size</label>
                      <input
                        type="number"
                        className="form-control"
                        min="2"
                        max="20"
                        value={minClusterSize}
                        onChange={(e) => setMinClusterSize(parseInt(e.target.value))}
                      />
                      <div className="form-text mt-2">
                        Minimum number of materials required to form a cluster.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    );
  }

  // If we have results, show the results view
  return (
    <div className="container-fluid px-4 py-3">
      {/* Page Header */}
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <div>
          <h1 className="h2">Clustering Results</h1>
          <p className="text-muted mb-0">Grouped {results?.total_clusters || 0} clusters from material descriptions</p>
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
            disabled={!results || Object.keys(results.clusters || {}).length === 0}
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
              <h5 className="card-title">{results?.total_clusters || 0}</h5>
              <p className="card-text text-muted mb-0">Clusters Formed</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body p-4">
              <h5 className="card-title">
                {results?.total_clusters && results?.total_clusters > 0 ?
                  Object.values(results.clusters).reduce((sum, cluster) => sum + cluster.length, 0) : 0}
              </h5>
              <p className="card-text text-muted mb-0">Total Materials</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body p-4">
              <h5 className="card-title">
                {results?.total_clusters && results?.total_clusters > 0 ?
                  (Object.values(results.clusters).reduce((sum, cluster) => sum + cluster.length, 0) / results.total_clusters).toFixed(1) : 0}
              </h5>
              <p className="card-text text-muted mb-0">Avg. Cluster Size</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body p-4">
              <h5 className="card-title">{getSingletonCount(results)}</h5>
              <p className="card-text text-muted mb-0">Singleton Items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clusters */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header pb-0 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Material Clusters</h5>
              {results?.total_clusters && results?.total_clusters > 0 ? (
                <span className="badge bg-info rounded-pill">
                  {results.total_clusters} clusters
                </span>
              ) : (
                <span className="badge bg-secondary rounded-pill">No clusters</span>
              )}
            </div>
            <div className="card-body p-0">
              {results?.total_clusters === 0 ? (
                <div className="p-4 text-center text-muted">
                  No clusters formed. Try reducing the minimum cluster size or adjusting the clustering method.
                </div>
              ) : (
                <div className="p-4">
                  {/* Sort clusters by size (largest first) */}
                  {Object.entries(results.clusters || {})
                    .sort(([, a], [, b]) => b.length - a.length)
                    .map(([clusterId, clusterItems], index) => (
                      <div key={clusterId} className="mb-4 p-3 border rounded bg-light">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h6 className="mb-1">
                              Cluster #{parseInt(clusterId) + 1}
                              <span className="badge bg-primary ms-2">{clusterItems.length} items</span>
                            </h6>
                            <p className="text-muted mb-0">
                              Suggested for Common National Material Code (CNMC) assignment
                            </p>
                          </div>
                          <div className="text-end">
                            <div className="btn-group btn-group-sm">
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                title="Review Cluster"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                  <path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-success btn-sm"
                                title="Assign CNMC"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <h6 className="mb-2">Materials in this cluster:</h6>
                          <div className="list-group list-group-flush">
                            {clusterItems.map((item, itemIndex) => (
                              <div key={itemIndex} className="list-group-item list-group-item-action p-2">
                                <div className="d-flex justify-content-between">
                                  <div className="fw-medium">{item}</div>
                                  <small className="text-muted">#{parseInt(clusterId) * 100 + itemIndex + 1}</small>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="pt-3 border-top">
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-outline-secondary me-2"
                              title="Export Cluster"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 0v16h16V4H4z"/>
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-primary me-2"
                              title="View Technical Details"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Singleton Items (if any) */}
      {getSingletons(results).length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header pb-0 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Singleton Items</h5>
                <span className="badge bg-warning text-dark rounded-pill">
                  {getSingletons(results).length} items
                </span>
              </div>
              <div className="card-body p-4">
                <p className="text-muted mb-3">
                  These materials did not form clusters with any other items and may represent unique materials or outliers.
                </p>
                <div className="list-group list-group-flush">
                  {getSingletons(results).map((item, index) => (
                    <div key={index} className="list-group-item list-group-item-action p-2">
                      <div className="d-flex justify-content-between">
                        <div className="fw-medium">{item}</div>
                        <small className="text-muted">#{index + 1}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
const getSingletonCount = (results) => {
  if (!results || !results.clusters) return 0;
  let totalInClusters = 0;
  Object.values(results.clusters).forEach(cluster => {
    totalInClusters += cluster.length;
  });
  // Assuming we don't have access to total input count, we'll estimate singletons differently
  // For now, return a placeholder - in a real implementation, we'd compare with input count
  return 0;
};

const getSingletons = (results) => {
  // In a real implementation, we would compare clustered items with original input
  // For this demo, we'll return an empty array
  return [];
};

export default Clustering;