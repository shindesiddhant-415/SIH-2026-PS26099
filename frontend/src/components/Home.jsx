import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './styles/index.css';

const Home = ({ apiStatus }) => {
  const [stats, setStats] = useState({
    matcherInitialized: false,
    technicalWeight: 0.7,
    semanticWeight: 0.3,
    similarityThreshold: 0.8,
    cachedFingerprints: 0,
    cachedEmbeddings: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState(null);

  // Fetch API stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      if (apiStatus.isConnected) {
        try {
          setLoadingStats(true);
          const response = await fetch('http://localhost:8000/stats');
          if (response.ok) {
            const data = await response.json();
            setStats(data);
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoadingStats(false);
        }
      } else {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [apiStatus.isConnected]);

  return (
    <div className="container-fluid px-4 py-3">
      {/* Page Header */}
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Dashboard</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <div className="btn-group me-2">
            <Link to="/matching" className="btn btn-sm btn-outline-primary">
              Material Matching
            </Link>
          </div>
          <div className="btn-group me-2">
            <Link to="/duplicates" className="btn btn-sm btn-outline-primary">
              Duplicate Detection
            </Link>
          </div>
          <div className="btn-group">
            <Link to="/clustering" className="btn btn-sm btn-outline-primary">
              Material Clustering
            </Link>
          </div>
        </div>
      </div>

      {/* API Status Card */}
      <div className="row mb-4">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="card-title text-muted mb-1">System Status</h6>
                  {!apiStatus.isConnected && apiStatus.isChecking === false ? (
                    <p className="mb-0"><span className="badge bg-danger">Disconnected</span></p>
                  ) : apiStatus.isChecking ? (
                    <p className="mb-0"><span className="badge bg-warning text-dark">Checking...</span></p>
                  ) : (
                    <p className="mb-0"><span className="badge bg-success">Connected</span></p>
                  )}
                </div>
                <div className="text-end">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {!apiStatus.isConnected && !apiStatus.isChecking && apiStatus.error && (
                <div className="mt-3 p-3 bg-danger-subtle border border-danger rounded small">
                  ⚠️ {apiStatus.error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Matcher Statistics */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body p-4">
              <h6 className="card-title text-muted mb-1">Matching Engine</h6>
              {loadingStats ? (
                <p className="text-muted mb-0">Loading...</p>
              ) : error ? (
                <p className="text-danger mb-0">Error loading stats</p>
              ) : (
                <>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-sm">Matcher Initialized:</span>
                    <span className="text-sm fw-medium">{stats.matcherInitialized ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-sm">Technical Weight:</span>
                    <span className="text-sm fw-medium">{stats.technicalWeight * 100}%</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-sm">Semantic Weight:</span>
                    <span className="text-sm fw-medium">{stats.semanticWeight * 100}%</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-sm">Similarity Threshold:</span>
                    <span className="text-sm fw-medium">{stats.similarityThreshold * 100}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-sm">Cached Fingerprints:</span>
                    <span className="text-sm fw-medium">{stats.cachedFingerprints}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-0">
                    <span className="text-sm">Cached Embeddings:</span>
                    <span className="text-sm fw-medium">{stats.cachedEmbeddings}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body p-4">
              <h6 className="card-title text-muted mb-1">Platform Overview</h6>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-sm">Features Available:</span>
                <span className="text-sm fw-medium">4/4</span>
              </div>
              <div className="progress mb-3" style={{ height: '8px' }}>
                <div className="progress-bar bg-primary" style={{ width: '100%' }}></div>
              </div>
              <div className="d-flex justify-content-between text-muted mb-2">
                <span>Material Matching</span>
                <span>✓ Operational</span>
              </div>
              <div className="d-flex justify-content-between text-muted mb-2">
                <span>Duplicate Detection</span>
                <span>✓ Operational</span>
              </div>
              <div className="d-flex justify-content-between text-muted mb-2">
                <span>Material Clustering</span>
                <span>✓ Operational</span>
              </div>
              <div className="d-flex justify-content-between text-muted mb-0">
                <span>API Explorer</span>
                <span>✓ Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="row g-4">
        {/* Material Matching */}
        <div className="col-12 col-md-4">
          <div className="card h-100 border-0 shadow-sm hover-lift transition-all duration-200">
            <div className="card-body p-4 d-flex flex-column">
              <div className="mb-3">
                <div className="avatar-lg bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2h2c0-2.21-1.79-4-4-4z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
              <h5 className="card-title mb-3">Material Matching</h5>
              <p className="card-text text-muted flex-grow-1 mb-3">
                Compare two materials to determine if they are technically identical, functionally similar, or not equivalent using our hybrid AI matching algorithm.
              </p>
              <Link to="/matching" className="mt-auto btn btn-sm btn-primary d-flex align-items-center">
                Start Matching
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ms-2">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Duplicate Detection */}
        <div className="col-12 col-md-4">
          <div className="card h-100 border-0 shadow-sm hover-lift transition-all duration-200">
            <div className="card-body p-4 d-flex flex-column">
              <div className="mb-3">
                <div className="avatar-lg bg-info-subtle text-info rounded-circle d-flex align-items-center justify-content-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2h2c0-2.21-1.79-4-4-4z" fill="currentColor"/>
                    <path d="M9 17V7m6 0V7m6 10V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <h5 className="card-title mb-3">Duplicate Detection</h5>
              <p className="card-text text-muted flex-grow-1 mb-3">
                Identify duplicate, near-duplicate, and functionally similar materials in bulk datasets to support material master harmonization initiatives.
              </p>
              <Link to="/duplicates" className="mt-auto btn btn-sm btn-info d-flex align-items-center">
                Find Duplicates
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ms-2">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Material Clustering */}
        <div className="col-12 col-md-4">
          <div className="card h-100 border-0 shadow-sm hover-lift transition-all duration-200">
            <div className="card-body p-4 d-flex flex-column">
              <div className="mb-3">
                <div className="avatar-lg bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2h2c0-2.21-1.79-4-4-4z" fill="currentColor"/>
                    <path d="M2 12h20M12 2v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <h5 className="card-title mb-3">Material Clustering</h5>
              <p className="card-text text-muted flex-grow-1 mb-3">
                Group similar materials into clusters for efficient review, standardization, and assignment of Common National Material Codes (CNMC).
              </p>
              <Link to="/clustering" className="mt-auto btn btn-sm btn-success d-flex align-items-center">
                Perform Clustering
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ms-2">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Demonstrations */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header pb-0 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Sample Demonstrations</h5>
              <small className="text-muted">See how the platform works with real CPSE material examples</small>
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                {/* Technical Match Example */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <h6 className="card-title mb-3">Technical Match Example</h6>
                      <div className="mb-3 p-3 bg-light rounded">
                        <div className="mb-2">
                          <small className="text-muted">Material 1:</small>
                          <p className="mb-1" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>BALL VL 2 IN CL300</p>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted">Material 2:</small>
                          <p className="mb-1" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>BALL VALVE 2" CLASS 300</p>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="badge bg-success">TECHNICAL_IDENTICAL</span>
                        <span className="text-muted fw-medium">98% Match</span>
                      </div>
                      <p className="text-muted small mb-0">
                        Despite different abbreviations and formatting, these materials are technically identical with the same pressure class, size, and category.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pressure Class Difference Example */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <h6 className="card-title mb-3">Pressure Class Difference</h6>
                      <div className="mb-3 p-3 bg-light rounded">
                        <div className="mb-2">
                          <small className="text-muted">Material 1:</small>
                          <p className="mb-1" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>GATE VALVE 4" CLASS 150</p>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted">Material 2:</small>
                          <p className="mb-1" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>GATE VALVE 4" CLASS 300</p>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="badge bg-warning text-dark">FUNCTIONALLY_SIMILAR</span>
                        <span className="text-muted fw-medium">85% Match</span>
                      </div>
                      <p className="text-muted small mb-0">
                        Same valve type and size but different pressure ratings (CLASS 150 vs CLASS 300) - functionally similar but not technically interchangeable.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Different Material Types Example */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <h6 className="card-title mb-3">Different Material Types</h6>
                      <div className="mb-3 p-3 bg-light rounded">
                        <div className="mb-2">
                          <small className="text-muted">Material 1:</small>
                          <p className="mb-1" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>CS PIPE 6" SCH 40</p>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted">Material 2:</small>
                          <p className="mb-1" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>SS PIPE 6" SCH 40</p>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="badge bg-info text-dark">SEMANTICALLY_RELATED</span>
                        <span className="text-muted fw-medium">75% Match</span>
                      </div>
                      <p className="text-muted small mb-0">
                        Same size and schedule but different material grades (Carbon Steel vs Stainless Steel) - semantically related but different material properties.
                      </p>
                    </div>
                  </div>
                </div>

                {/* No Match Example */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <h6 className="card-title mb-3">No Match Example</h6>
                      <div className="mb-3 p-3 bg-light rounded">
                        <div className="mb-2">
                          <small className="text-muted">Material 1:</small>
                          <p className="mb-1" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>FLANGE RF 4"</p>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted">Material 2:</small>
                          <p className="mb-1" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>BOLT HEX M12</p>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="badge bg-secondary">NOT_MATCH</span>
                        <span className="text-muted fw-medium">15% Match</span>
                      </div>
                      <p className="text-muted small mb-0">
                        Completely different material types (flange vs bolt) with no technical or semantic relationship.
                      </p>
                    </div>
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

export default Home;