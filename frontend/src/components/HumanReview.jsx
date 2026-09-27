import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import './styles/index.css';

const HumanReview = () => {
  const [reviewItems, setReviewItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewedItems, setReviewedItems] = useState(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('humanReviewDecisions');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    // Fetch items that require human review from the AI
    // For now, we'll use a predefined set of examples from the corpus
    // In a real system, this would come from a backend endpoint
    const fetchReviewItems = async () => {
      try {
        setLoading(true);
        // We'll use the matching engine to get pairs from the corpus that the AI flags for review
        // For demo, we'll use a few known examples
        const examplePairs = [
          { desc1: 'GATE VALVE 4" CLASS 150', desc2: 'GATE VALVE 4" CLASS 300' },
          { desc1: 'BALL VL 2 IN CL300', desc2: 'BALL VALVE 2" CLASS 300' },
          { desc1: 'CS PIPE 6" SCH 40', desc2: 'SS PIPE 6" SCH 40' },
          { desc1: 'CU CABLE 11KV 3CX4MM2 XLPE', desc2: 'COPPER CABLE 11000V 3 CORE 4 SQ MM XLPE' },
          { desc1: 'BEARING 6205 25X52X15 MM', desc2: 'BEARING 6205 25MM ID 52MM OD 15MM WIDTH' },
        ];

        const itemsWithAIResults = [];
        for (const pair of examplePairs) {
          try {
            const result = await apiService.matchMaterials(pair.desc1, pair.desc2);
            // Only include items that the AI flagged for review or are uncertain
            if (result.requires_human_review ||
                result.match_type === 'FUNCTIONAL_ALTERNATIVE' ||
                result.match_type === 'TECHNICALLY_EQUIVALENT' ||
                result.combined_score < 0.9) {
              itemsWithAIResults.push({
                id: Math.random().toString(36).substr(2, 9),
                description1: pair.desc1,
                description2: pair.desc2,
                aiResult: result,
                status: 'pending', // pending, approved, rejected, corrected
                userDecision: null,
                userReason: '',
                timestamp: null
              });
            }
          } catch (err) {
            console.error('Error getting AI result for pair:', pair, err);
          }
        }

        setReviewItems(itemsWithAIResults);
        setLoading(false);
      } catch (err) {
        setError('Failed to load review items: ' + err.message);
        setLoading(false);
      }
    };

    fetchReviewItems();
  }, []);

  const handleDecision = async (itemId, decision, reason) => {
    try {
      setLoading(true);
      const itemIndex = reviewItems.findIndex(item => item.id === itemId);
      if (itemIndex === -1) return;

      const updatedItem = {
        ...reviewItems[itemIndex],
        status: decision,
        userDecision: decision,
        userReason: reason,
        timestamp: new Date().toISOString()
      };

      // Update the item in the list
      const updatedItems = [...reviewItems];
      updatedItems[itemIndex] = updatedItem;
      setReviewItems(updatedItems);

      // Update reviewedItems in localStorage
      const updatedReviewed = { ...reviewedItems };
      updatedReviewed[itemId] = {
        decision,
        reason,
        timestamp: new Date().toISOString(),
        item: updatedItem
      };
      localStorage.setItem('humanReviewDecisions', JSON.stringify(updatedReviewed));
      setReviewedItems(updatedReviewed);

      setLoading(false);
    } catch (err) {
      setError('Failed to save decision: ' + err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid px-4 py-3">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid px-4 py-3">
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-3">
      {/* Page Header */}
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Human Review Queue</h1>
        <p className="text-muted mb-0">Review AI matching decisions that require human judgment</p>
        <div>
          <buttononClick={() => window.location.reload()} className="btn btn-outline-primary">
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Review Items */}
      {reviewItems.length === 0 ? (
        <div className="alert alert-info">
          No items currently require human review.
        </div>
      ) : (
        <>
          {reviewItems.map((item) => (
            <div key={item.id} className="card border-0 shadow-sm mb-4">
              <div className="card-header pb-0 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Review Item #{item.id.substring(0, 6)}</h5>
                <span className={`badge bg-${item.status === 'pending' ? 'warning' : item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : 'info'} px-2 py-1`}>
                  {item.status.toUpperCase()}
                </span>
              </div>
              <div className="card-body p-4">
                {/* Material Descriptions */}
                <div className="row mb-4">
                  <div className="col-12 col-md-6">
                    <div className="border rounded p-3 bg-light">
                      <p className="text-muted small mb-2" style={{ fontStyle: 'italic' }}>{item.description1}</p>
                      <h6 className="h6 mb-2">Material 1</h6>
                      <div className="mb-3">
                        {Object.entries(item.aiResult.fingerprint_1).map(([key, value]) => {
                          if (key !== 'description_original' && value !== null) {
                            const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                            return (
                              <div className="row g-2 mb-2" key={key}>
                                <div className="col-4">
                                  <small className="text-muted">{formattedKey}:</small>
                                </div>
                                <div className="col-8">
                                  <span className="d-block fw-medium">{value}</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="border rounded p-3 bg-light">
                      <p className="text-muted small mb-2" style={{ fontStyle: 'italic' }}>{item.description2}</p>
                      <h6 className="h6 mb-2">Material 2</h6>
                      <div className="mb-3">
                        {Object.entries(item.aiResult.fingerprint_2).map(([key, value]) => {
                          if (key !== 'description_original' && value !== null) {
                            const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                            return (
                              <div className="row g-2 mb-2" key={key}>
                                <div className="col-4">
                                  <small className="text-muted">{formattedKey}:</small>
                                </div>
                                <div className="col-8">
                                  <span className="d-block fw-medium">{value}</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Result */}
                <div className="border rounded p-3 mb-4">
                  <h6 className="mb-3">AI Analysis</h6>
                  <div className="row g-4">
                    <div className="col-12 col-md-3">
                      <div className="text-center">
                        <div className="fs-2 fw-medium text-info mb-1">{item.aiResult.combined_score.toFixed(2)}</div>
                        <div className="text-muted small">Combined Score</div>
                      </div>
                    </div>
                    <div className="col-12 col-md-3">
                      <div className="text-center">
                        <div className="fs-2 fw-medium text-primary mb-1">{item.aiResult.technical_score.toFixed(2)}</div>
                        <div className="text-muted small">Technical Score</div>
                      </div>
                    </div>
                    <div className="col-12 col-md-3">
                      <div className="text-center">
                        <div className="fs-2 fw-medium text-success mb-1">{item.aiResult.semantic_score.toFixed(2)}</div>
                        <div className="text-muted small">Semantic Score</div>
                      </div>
                    </div>
                    <div className="col-12 col-md-3">
                      <div className="text-center">
                        <div className="fs-2 fw-medium text-warning mb-1">{item.aiResult.match_type.replace(/_/g, ' ')}</div>
                        <div className="text-muted small">Match Type</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-light rounded">
                    <p className="mb-0"><strong>AI Reason:</strong> {item.aiResult.decision_reason}</p>
                    {item.aiResult.requires_human_review && (
                      <div className="mt-2 p-2 bg-warning bg-opacity-10 border rounded">
                        <small className="text-warning"><strong>AI Note:</strong> This item was flagged for human review by the AI.</small>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Decision */}
                <div className="border rounded p-3">
                  <h6 className="mb-3">Your Decision</h6>
                  {item.status !== 'pending' && (
                    <div className="alert alert-info">
                      <strong>Decision:</strong> {item.userDecision?.toUpperCase()} <br />
                      <strong>Reason:</strong> {item.userReason || 'No reason provided'} <br />
                      <strong>Timestamp:</strong> {new Date(item.timestamp).toLocaleString()}
                    </div>
                  )}
                  {item.status === 'pending' && (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const decision = e.target.elements.decision.value;
                      const reason = e.target.elements.reason.value.trim();
                      if (!reason) {
                        alert('Please provide a reason for your decision');
                        return;
                      }
                      handleDecision(item.id, decision, reason);
                    }} className="row g-3">
                      <div className="col-12">
                        <label className="form-label">Decision</label>
                        <select className="form-select" name="decision" required>
                          <option value="">-- Select Decision --</option>
                          <option value="approved">Approve as Equivalent</option>
                          <option value="rejected">Reject as Not Equivalent</option>
                          <option value="corrected">Correct Match Type</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Reason (required)</label>
                        <textarea className="form-control" name="reason" rows="3" placeholder="Explain your decision..." required></textarea>
                      </div>
                      <div className="col-12">
                        <button type="submit" className="btn btn-primary">
                          Submit Decision
                        </button>
                        <button type="button" onClick={(e) => {
                          e.preventDefault();
                          // Reset form
                          const form = e.target.closest('form');
                          form.reset();
                        }} className="btn btn-outline-secondary ms-2">
                          Clear
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div className="text-center mt-4">
            <button className="btn btn-outline-secondary me-2" onClick={() => {
              // Clear all decisions
              if (window.confirm('Clear all review decisions?')) {
                localStorage.removeItem('humanReviewDecisions');
                setReviewedItems({});
                // Reset items to pending
                setReviewItems(prev => prev.map(item => ({
                  ...item,
                  status: 'pending',
                  userDecision: null,
                  userReason: '',
                  timestamp: null
                })));
              }
            }}>
              Clear All Decisions
            </button>
            <button className="btn btn-success" onClick={() => {
              const pendingCount = reviewItems.filter(item => item.status === 'pending').length;
              if (pendingCount > 0) {
                window.alert(`Please review ${pendingCount} pending item(s) before exporting.`);
              } else {
                // Export decisions
                const exportData = Object.values(reviewedItems).map(review => ({
                  itemId: review.item.id,
                  description1: review.item.description1,
                  description2: review.item.description2,
                  aiMatchType: review.item.aiResult.match_type,
                  aiScore: review.item.aiResult.combined_score,
                  humanDecision: review.decision,
                  humanReason: review.reason,
                  timestamp: review.timestamp
                }));
                const jsonStr = JSON.stringify(exportData, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `human-review-decisions-${new Date().toISOString().slice(0,10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }
            }}>
              Export Decisions
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default HumanReview;