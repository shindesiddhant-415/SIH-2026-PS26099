import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import './styles/index.css';

const Matching = () => {
  const navigate = useNavigate();
  const [description1, setDescription1] = useState('');
  const [description2, setDescription2] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMatch = async (e) => {
    e.preventDefault();
    if (!description1.trim() || !description2.trim()) {
      setError('Please enter both material descriptions');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await apiService.matchMaterials(
        description1.trim(),
        description2.trim()
      );
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setDescription1('');
    setDescription2('');
    setResult(null);
    setError(null);
  };

  const handleSwap = () => {
    setDescription1(description2);
    setDescription2(description1);
  };

  if (!result) {
    return (
      <div className="container-fluid px-4 py-3">
        {/* Page Header */}
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <h1 className="h2">Material Matching</h1>
        </div>

        {/* Matching Form */}
        <div className="row g-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <form onSubmit={handleMatch} className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Material Description 1</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={description1}
                      onChange={(e) => setDescription1(e.target.value)}
                      placeholder="Enter first material description (e.g., BALL VL 2 IN CL300)"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Material Description 2</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={description2}
                      onChange={(e) => setDescription2(e.target.value)}
                      placeholder="Enter second material description (e.g., BALL VALVE 2\" CLASS 300)"
                    />
                  </div>
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <button type="button" onClick={handleClear} className="btn btn-outline-secondary me-2">
                          Clear
                        </button>
                        <button type="button" onClick={handleSwap} className="btn btn-outline-primary me-2">
                          Swap
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                          {loading ? 'Analyzing...' : 'Analyze Match'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
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

        {/* Sample Data Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header pb-0 border-bottom">
                <h5 className="card-title mb-0">Sample Data Examples</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <div className="border rounded p-3 bg-light cursor-pointer hover-lift transition-all duration-200" onClick={() => {
                      setDescription1('BALL VL 2 IN CL300');
                      setDescription2('BALL VALVE 2" CLASS 300');
                    }}>
                      <small className="text-muted d-block">Technical Match</small>
                      <div class="fw-medium">BALL VL 2 IN CL300</div>
                      <div class="fw-medium">BALL VALVE 2" CLASS 300</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="border rounded p-3 bg-light cursor-pointer hover-lift transition-all duration-200" onClick={() => {
                      setDescription1('GATE VALVE 4" CLASS 150');
                      setDescription2('GATE VALVE 4" CLASS 300');
                    }}>
                      <small className="text-muted d-block">Pressure Class Difference</small>
                      <div class="fw-medium">GATE VALVE 4" CLASS 150</div>
                      <div class="fw-medium">GATE VALVE 4" CLASS 300</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="border rounded p-3 bg-light cursor-pointer hover-lift transition-all duration-200" onClick={() => {
                      setDescription1('CS PIPE 6" SCH 40');
                      setDescription2('SS PIPE 6" SCH 40');
                    }}>
                      <small className="text-muted d-block">Different Material Types</small>
                      <div class="fw-medium">CS PIPE 6" SCH 40</div>
                      <div class="fw-medium">SS PIPE 6" SCH 40</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If we have results, show the results view
  return (
    <div className="container-fluid px-4 py-3">
      {/* Page Header */}
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <div>
          <h1 className="h2">Material Matching Results</h1>
          <p className="text-muted mb-0">Analysis of material descriptions</p>
        </div>
        <div>
          <button onClick={handleClear} className="btn btn-outline-secondary">
            New Comparison
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="row g-4">
        {/* Material 1 Fingerprint */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header pb-0 border-bottom">
              <h5 className="card-title mb-0">Material 1</h5>
            </div>
            <div className="card-body p-4">
              <p className="text-muted small mb-2" style={{ fontStyle: 'italic' }}>{result.description_1}</p>
              <div className="mb-3">
                <h6 className="h6 mb-2">Technical Attributes</h6>
                <div className="row g-2">
                  {Object.entries(result.fingerprint_1).map(([key, value]) => {
                    if (key !== 'description_original' && value !== null) {
                      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                      return (
                        <div className="col-6" key={key}>
                          <small className="text-muted d-block">{formattedKey}:</small>
                          <span className="d-block fw-medium">{value}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Material 2 Fingerprint */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header pb-0 border-bottom">
              <h5 className="card-title mb-0">Material 2</h5>
            </div>
            <div className="card-body p-4">
              <p className="text-muted small mb-2" style={{ fontStyle: 'italic' }}>{result.description_2}</p>
              <div className="mb-3">
                <h6 className="h6 mb-2">Technical Attributes</h6>
                <div className="row g-2">
                  {Object.entries(result.fingerprint_2).map(([key, value]) => {
                    if (key !== 'description_original' && value !== null) {
                      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                      return (
                        <div className="col-6" key={key}>
                          <small className="text-muted d-block">{formattedKey}:</small>
                          <span className="d-block fw-medium">{value}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Match Analysis */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header pb-0 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Match Analysis</h5>
            </div>
            <div className="card-body p-4">
              {/* Score Breakdown */}
              <div className="mb-4">
                <h6 className="mb-3">Score Breakdown</h6>
                <div className="row g-4">
                  <div className="col-12 col-md-4">
                    <div className="text-center">
                      <div className="fs-1 fw-medium text-primary mb-1">{result.technical_score.toFixed(2)}</div>
                      <div className="text-muted small">Technical Score</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="text-center">
                      <div className="fs-1 fw-medium text-info mb-1">{result.semantic_score.toFixed(2)}</div>
                      <div className="text-muted small">Semantic Score</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="text-center">
                      <div className="fs-1 fw-medium text-success mb-1">{result.combined_score.toFixed(2)}</div>
                      <div className="text-muted small">Combined Score</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Type and Confidence */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h6 className="mb-1">Match Classification</h6>
                    <span className={`badge bg-${getMatchTypeClass(result.match_type)} px-3 py-2 fw-medium`}>
                      {result.match_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-end">
                    <span className={`badge bg-${getConfidenceClass(result.confidence)} px-3 py-2`}>
                      {result.confidence.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-3 bg-light rounded">
                  <p className="mb-0"><strong>Explanation:</strong> {getMatchExplanation(result)}</p>
                </div>
              </div>

              {/* Action Recommendations */}
              <div className="border-top pt-3">
                <h6 className="mb-3">Recommended Actions</h6>
                <div className="d-flex flex-wrap gap-2">
                  {getActionButtons(result, navigate)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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

const getMatchExplanation = (result) => {
  const { match_type, technical_score, semantic_score, combined_score, technical_identity, requires_human_review } = result;

  if (match_type === 'TECHNICAL_IDENTICAL') {
    return `The materials have identical technical specifications (score: ${technical_score.toFixed(2)}), indicating they are the same material with possible variations in naming or formatting.`;
  } else if (match_type === 'TECHNICAL_EQUIVALENT') {
    return `The materials have equivalent technical specifications suitable for the same applications (score: ${technical_score.toFixed(2)}), though they may have minor differences in non-critical attributes.`;
  } else if (match_type === 'FUNCTIONALLY_SIMILAR') {
    return `The materials serve similar functions but have technical differences that may affect interchangeability (technical score: ${technical_score.toFixed(2)}, semantic score: ${semantic_score.toFixed(2)}).`;
  } else if (match_type === 'SEMANTICALLY_RELATED') {
    return `The materials are related in meaning or application but have significant technical differences (semantic score: ${semantic_score.toFixed(2)}, technical score: ${technical_score.toFixed(2)}).`;
  } else {
    return `The materials show little to no technical or semantic similarity (combined score: ${combined_score.toFixed(2)}).`;
  }
};

const getActionButtons = (result, navigate) => {
  const { match_type, requires_human_review, technical_identity } = result;

  if (requires_human_review) {
    return [
      <button key="review" className="btn btn-outline-warning me-2">
        Flag for Expert Review
      </button>,
      <button key="details" className="btn btn-outline-info me-2">
        View Detailed Analysis
      </button>
    ];
  } else if (technical_identity || match_type === 'TECHNICAL_EQUIVALENT') {
    return [
      <button key="approve" className="btn btn-success me-2">
        Approve as Equivalent
      </button>,
      <button key="standardize" className="btn btn-outline-primary me-2">
        Suggest for CNMC Assignment
      </button>
    ];
  } else {
    return [
      <button key="investigate" className="btn btn-outline-secondary me-2">
        Investigate Further
      </button>,
      <button key="separate" className="btn btn-outline-danger">
        Keep as Separate Items
      </button>
    ];
  }
};

export default Matching;