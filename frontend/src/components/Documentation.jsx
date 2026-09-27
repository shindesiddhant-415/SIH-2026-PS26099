import React, { useState } from 'react';
import './styles/index.css';

const Documentation = () => {
  const [activeTab, setActiveTab] = useState('user-guide'); // 'user-guide', 'api-reference', 'faq'

  return (
    <div className="container-fluid px-4 py-3">
      {/* Page Header */}
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Documentation</h1>
      </div>

      {/* Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header pb-0 border-bottom">
              <div className="nav nav-tabs" id="docsTab" role="tablist">
                <button
                  className={`nav-link ${activeTab === 'user-guide' ? 'active' : ''}`}
                  id="user-guide-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#user-guide"
                  type="button"
                  role="tab"
                  aria-controls="user-guide"
                  aria-selected={activeTab === 'user-guide'}
                  onClick={() => setActiveTab('user-guide')}
                >
                  User Guide
                </button>
                <button
                  className={`nav-link ${activeTab === 'api-reference' ? 'active' : ''}`}
                  id="api-reference-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#api-reference"
                  type="button"
                  role="tab"
                  aria-controls="api-reference"
                  aria-selected={activeTab === 'api-reference'}
                  onClick={() => setActiveTab('api-reference')}
                >
                  API Reference
                </button>
                <button
                  className={`nav-link ${activeTab === 'faq' ? 'active' : ''}`}
                  id="faq-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#faq"
                  type="button"
                  role="tab"
                  aria-controls="faq"
                  aria-selected={activeTab === 'faq'}
                  onClick={() => setActiveTab('faq')}
                >
                  FAQ
                </button>
              </div>
            </div>
            <div className="tab-content" id="docsTabContent">
              {/* User Guide Tab */}
              <div className="tab-pane fade ${activeTab === 'user-guide' ? 'show active' : ''}" id="user-guide" role="tabpanel" aria-labelledby="user-guide-tab">
                <div className="card-body p-4">
                  <h2 className="h4 mb-4">User Guide</h2>
                  <p className="lead">Welcome to the NMIG Platform User Guide. This document will help you understand how to use the platform for material master harmonization.</p>

                  <div className="mb-5">
                    <h3 className="h5">Getting Started</h3>
                    <p>The NMIG Platform is designed to help Central Public Sector Enterprises (CPSEs) standardize their material master data through AI-powered matching, duplicate detection, and clustering.</p>
                    <ol className="ps-4">
                      <li><strong>Access the Platform:</strong> Ensure the backend API is running (<code>uvicorn backend.api.main:app --reload</code>) and access the frontend at <code>http://localhost:8501</code></li>
                      <li><strong>Navigate the Interface:</strong> Use the sidebar to access different modules:</li>
                      <ul className="ps-4 mb-0">
                        <li><strong>Dashboard:</strong> System overview and quick actions</li>
                        <li><strong>Material Matching:</strong> Compare two materials for similarity</li>
                        <li><strong>Duplicate Detection:</strong> Find duplicates in bulk datasets</li>
                        <li><strong>Material Clustering:</strong> Group similar materials for standardization</li>
                        <li><strong>API Explorer:</strong> Test API endpoints directly</li>
                        <li><strong>Documentation:</strong> This user guide</li>
                      </ul>
                      <li><strong>Start with Sample Data:</strong> Each module includes sample data examples to help you understand the functionality</li>
                    </ol>
                  </div>

                  <div className="mb-5">
                    <h3 className="h5">Material Matching</h3>
                    <p>The Material Matching module compares two materials to determine if they are technically identical, functionally similar, or not equivalent.</p>
                    <div className="accordion" id="matchingAccordion">
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="headingOne">
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseOne"
                            aria-expanded="false"
                            aria-controls="collapseOne"
                          >
                            How Material Matching Works
                          </button>
                        </h2>
                        <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#matchingAccordion">
                          <div className="accordion-body">
                            <p>The platform uses a hybrid AI matching algorithm that combines:</p>
                            <ul className="ps-4 mb-0">
                              <li><strong>Technical Identity (70% weight):</strong> Exact matching of engineered specifications like category, size, pressure class, material grade, etc.</li>
                              <li><strong>Semantic Similarity (30% weight):</strong> Meaning-based comparison using natural language processing</li>
                            </ul>
                            <p>This approach ensures that materials with identical technical specifications are correctly identified as matches, even if their descriptions vary in formatting or terminology.</p>
                          </div>
                        </div>
                      </div>

                      <div className="accordion-item">
                        <h2 className="accordion-header" id="headingTwo">
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseTwo"
                            aria-expanded="false"
                            aria-controls="collapseTwo"
                          >
                            Understanding Match Results
                          </button>
                        </h2>
                        <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#matchingAccordion">
                          <div className="accordion-body">
                            <p>Match results include:</p>
                            <ul className="ps-4 mb-0">
                              <li><strong>Match Type:</strong> Categorization of the relationship (TECHNICAL_IDENTICAL, TECHNICAL_EQUIVALENT, FUNCTIONALLY_SIMILAR, SEMANTICALLY_RELATED, NOT_MATCH)</li>
                              <li><strong>Scores:</strong> Technical, semantic, and combined similarity scores (0-1)</li>
                              <li><strong>Confidence:</strong> Qualitative assessment of result reliability (HIGH, MEDIUM_HIGH, MEDIUM, LOW_MEDIUM, LOW)</li>
                              <li><strong>Technical Identity:</strong> Boolean indicating if technical specs are identical</li>
                              <li><strong>Human Review Flag:</strong> Indicates if expert review is recommended</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <h3 className="h5">Duplicate Detection</h3>
                    <p>The Duplicate Detection module identifies duplicate, near-duplicate, and functionally similar materials in bulk datasets.</p>
                    <div className="accordion" id="duplicateAccordion">
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="headingThree">
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseThree"
                            aria-expanded="false"
                            aria-controls="collapseThree"
                          >
                            How Duplicate Detection Works
                          </button>
                        </h2>
                        <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#duplicateAccordion">
                          <div className="accordion-body">
                            <p>The platform compares all pairs of materials in your dataset using the same hybrid AI matching algorithm as the Material Matching module.</p>
                            <p>Features include:</p>
                            <ul className="ps-4 mb-0">
                              <li>Flexible input methods (text area or CSV upload)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* API Reference Tab */}
              <div className="tab-pane fade ${activeTab === 'api-reference' ? 'show active' : ''}" id="api-reference" role="tabpanel" aria-labelledby="api-reference-tab">
                <div className="card-body p-4">
                  <h2 className="h4 mb-4">API Reference</h2>
                  <p className="lead">The NMIG Platform provides a RESTful API for programmatic access to all matching, clustering, and duplication detection functionalities.</p>

                  <div className="mb-5">
                    <h3 className="h5">Base URL</h3>
                    <p className="bg-light p-3 rounded"><code>http://localhost:8000</code></p>
                    <p className="text-muted mt-2 mb-0">All API endpoints are relative to this base URL.</p>
                  </div>

                  <div className="mb-5">
                    <h3 className="h5">Endpoints</h3>
                    <div className="accordion" id="apiAccordion">
                      {/* Health Endpoint */}
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="headingHealth">
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseHealth"
                            aria-expanded="false"
                            aria-controls="collapseHealth"
                          >
                            GET /health
                          </button>
                        </h2>
                        <div id="collapseHealth" className="accordion-collapse collapse" aria-labelledby="headingHealth" data-bs-parent="#apiAccordion">
                          <div className="accordion-body">
                            <p><strong>Description:</strong> Check the health status of the API service.</p>
                            <p><strong>Method:</strong> GET</p>
                            <p><strong>Parameters:</strong> None</p>
                            <p><strong>Response:</strong></p>
                            <div className="bg-light p-3 rounded mb-3">
                              <pre className="mb-0 f-monospace"><code>{
  "status": "healthy",
  "service": "NMIG Matching Engine",
  "version": "1.0.0"
}</code></pre>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats Endpoint */}
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="headingStats">
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseStats"
                            aria-expanded="false"
                            aria-controls="collapseStats"
                          >
                            GET /stats
                          </button>
                        </h2>
                        <div id="collapseStats" className="accordion-collapse collapse" aria-labelledby="headingStats" data-bs-parent="#apiAccordion">
                          <div className="accordion-body">
                            <p><strong>Description:</strong> Get API usage statistics and configuration.</p>
                            <p><strong>Method:</strong> GET</p>
                            <p><strong>Parameters:</strong> None</p>
                            <p><strong>Response:</strong></p>
                            <div className="bg-light p-3 rounded mb-3">
                              <pre className="mb-0 f-monospace"><code>{
  "matcher_initialized": true,
  "technical_weight": 0.7,
  "semantic_weight": 0.3,
  "similarity_threshold": 0.8,
  "cached_fingerprints": 1250,
  "cached_embeddings": 1250
}</code></pre>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Fingerprint Endpoint */}
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="headingFingerprint">
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseFingerprint"
                            aria-expanded="false"
                            aria-controls="collapseFingerprint"
                          >
                            POST /fingerprint
                          </button>
                        </h2>
                        <div id="collapseFingerprint" className="accordion-collapse collapse" aria-labelledby="headingFingerprint" data-bs-parent="#apiAccordion">
                          <div className="accordion-body">
                            <p><strong>Description:</strong> Generate a Material Fingerprint from a free-text description.</p>
                            <p><strong>Method:</strong> POST</p>
                            <p><strong>Request Body:</strong></p>
                            <div className="bg-light p-3 rounded mb-3">
                              <pre className="mb-0 f-monospace"><code>{
  "description": "string (required)"
}</code></pre>
                            </div>
                            <p><strong>Response:</strong></p>
                            <div className="bg-light p-3 rounded mb-3">
                              <pre className="mb-0 f-monospace"><code>{
  "description": "string (echoed input)",
  "fingerprint": {
    "category": "string or null",
    "subtype": "string or null",
    "nominal_size": "string or null",
    "size_unit": "string or null",
    "pressure_class": "string or null",
    "pressure_unit": "string or null",
    "material_grade": "string or null",
    "material_type": "string or null",
    "end_connection": "string or null",
    "facing_type": "string or null",
    "schedule": "string or null",
    "standard": "string or null",
    "description_original": "string (echoed input)"
              }
            }
          </code></pre>
                            </div>
                            <p><strong>Example:</strong></p>
                            <div className="bg-light p-3 rounded">
                              <pre className="mb-0 f-monospace"><code>Request:
{
  "description": "BALL VL 2 IN CL300"
}

Response:
{
  "description": "BALL VL 2 IN CL300",
  "fingerprint": {
    "category": "VALVE",
    "subtype": "BALL_VALVE",
    "nominal_size": "2",
    "size_unit": "IN",
    "pressure_class": "300",
    "pressure_unit": "CLASS",
    "material_grade": null,
    "material_type": null,
    "end_connection": null,
    "facing_type": null,
    "schedule": null,
    "standard": null,
    "description_original": "BALL VL 2 IN CL300"
              }
            }
          }</code></pre>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Match Endpoint */}
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="headingMatch">
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseMatch"
                            aria-expanded="false"
                            aria-controls="collapseMatch"
                          >
                            POST /match
                          </button>
                        </h2>
                        <div id="collapseMatch" className="accordion-collapse collapse" aria-labelledby="headingMatch" data-bs-parent="#apiAccordion">
                          <div className="accordion-body">
                            <p><strong>Description:</strong> Compare two materials for similarity and technical identity.</p>
                            <p><strong>Method:</strong> POST</p>
                            <p><strong>Request Body:</strong></p>
                            <div className="bg-light p-3 rounded mb-3">
                              <pre className="mb-0 f-monospace"><code>{
  "description_1": "string (required)",
  "description_2": "string (required)"
}</code></pre>
                            </div>
                            <p><strong>Response:</strong></p>
                            <div className="bg-light p-3 rounded mb-3">
                              <pre className="mb-0 f-monospace"><code>{
  "description_1": "string",
  "description_2": "string",
  "fingerprint_1": { /* Fingerprint object */ },
  "fingerprint_2": { /* Fingerprint object */ },
  "technical_score": "number (0-1)",
  "semantic_score": "number (0-1)",
  "combined_score": "number (0-1)",
  "match_type": "string (one of: TECHNICAL_IDENTICAL, TECHNICAL_EQUIVALENT, FUNCTIONALLY_SIMILAR, SEMANTICALLY_RELATED, NOT_MATCH)",
  "confidence": "string (one of: HIGH, MEDIUM_HIGH, MEDIUM, LOW_MEDIUM, LOW)",
  "is_match": "boolean",
  "technical_identity": "boolean",
  "requires_human_review": "boolean"
}</code></pre>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Duplicates Endpoint */}
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="headingDuplicates">
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseDuplicates"
                            aria-expanded="false"
                            aria-controls="collapseDuplicates"
                          >
                            POST /duplicates
                          </button>
                        </h2>
                        <div id="collapseDuplicates" className="accordion-collapse collapse" aria-labelledby="headingDuplicates" data-bs-parent="#apiAccordion">
                          <div className="accordion-body">
                            <p><strong>Description:</strong> Find duplicate materials in a list of descriptions.</p>
                            <p><strong>Method:</strong> POST</p>
                            <p><strong>Request Body:</strong></p>
                            <div className="bg-light p-3 rounded mb-3">
                              <pre className="mb-0 f-monospace"><code>[
  {
    "description": "string (required)"
  },
  ...
]</code></pre>
                            </div>
                            <p><strong>Response:</strong></p>
                            <div className="bg-light p-3 rounded mb-3">
                              <pre className="mb-0 f-monospace"><code>{
  "duplicates": [
    {
      "index_1": "integer",
      "index_2": "integer",
      "description_1": "string",
      "description_2": "string",
      "combined_score": "number (0-1)",
      "match_type": "string (same as above)",
      "confidence": "string (same as above)"
    }
  ],
  "total_pairs_checked": "integer"
}</code></pre>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cluster Endpoint */}
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="headingCluster">
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseCluster"
                            aria-expanded="false"
                            aria-controls="collapseCluster"
                          >
                            POST /cluster
                          </button>
                        </h2>
                        <div id="collapseCluster" className="accordion-collapse collapse" aria-labelledby="headingCluster" data-bs-parent="#apiAccordion">
                          <div className="accordion-body">
                            <p><strong>Description:</strong> Cluster similar materials into groups.</p>
                            <p><strong>Method:</strong> POST</p>
                            <p><strong>Request Body:</strong></p>
                            <div className="bg-light p-3 rounded mb-3">
                              <pre className="mb-0 f-monospace"><code>[
  {
    "description": "string (required)"
  },
  ...
]</code></pre>
                            </div>
                            <p><strong>Response:</strong></p>
                            <div className="bg-light p-3 rounded mb-3">
                              <pre className="mb-0 f-monospace"><code>{
  "clusters": {
    "integer (cluster ID)": [
      "string (material description)",
      ...
    ],
    ...
  },
  "total_clusters": "integer"
}</code></pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Tab */}
              <div className="tab-pane fade ${activeTab === 'faq' ? 'show active' : ''}" id="faq" role="tabpanel" aria-labelledby="faq-tab">
                <div className="card-body p-4">
                  <h2 className="h4 mb-4">Frequently Asked Questions</h2>

                  <div className="accordion" id="faqAccordion">
                    {/* General Questions */}
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="headingGeneral">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapseGeneral"
                          aria-expanded="false"
                          aria-controls="collapseGeneral"
                        >
                            General Questions
                          </button>
                        </h2>
                        <div id="collapseGeneral" className="accordion-collapse collapse" aria-labelledby="headingGeneral" data-bs-parent="#faqAccordion">
                          <div className="accordion-body">
                            <div className="mb-3">
                              <strong>Q: What is the NMIG Platform?</strong>
                              <p className="mb-2">A: NMIG (National Material Intelligence & Harmonization Platform) is an AI-powered platform designed to standardize and harmonize material codes across Central Public Sector Enterprises (CPSEs). It helps identify duplicate materials, determine technical equivalence, and support material master data governance initiatives.</p>
                            </div>
                            <div className="mb-3">
                              <strong>Q: What problem does NMIG solve?</strong>
                              <p className="mb-2">A: CPSEs often have inconsistent material master data where the same material may have different codes, descriptions, or naming conventions across different enterprises. This leads to inefficiencies in procurement, inventory management, and spending analysis. NMIG uses AI to identify these inconsistencies and support standardization efforts.</p>
                            </div>
                            <div className="mb-3">
                              <strong>Q: Is NMIG a mockup or a working prototype?</strong>
                              <p className="mb-2">A: NMIG is a working end-to-end prototype, not a mockup. It includes functional backend APIs, frontend interfaces, and demonstrates the complete workflow from raw material descriptions through AI processing to results visualization and export.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                    {/* Technical Questions */}
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="headingTechnical">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapseTechnical"
                          aria-expanded="false"
                          aria-controls="collapseTechnical"
                        >
                            Technical Questions
                          </button>
                        </h2>
                        <div id="collapseTechnical" className="accordion-collapse collapse" aria-labelledby="headingTechnical" data-bs-parent="#faqAccordion">
                          <div className="mb-3">
                              <strong>Q: What AI models does NMIG use?</strong>
                              <p className="mb-2">A: NMIG uses the sentence-transformers/all-MiniLM-L6-v2 model for semantic understanding and a rule-based technical attribute parser for extracting engineered specifications from material descriptions.</p>
                            </div>
                            <div className="mb-3">
                              <strong>Q: How does the hybrid matching algorithm work?</strong>
                              <p className="mb-2">A: The platform uses a hybrid approach with 70% weight on technical identity and 30% weight on semantic similarity. Technical identity requires exact match of engineered specifications (category, size, pressure class, material grade, etc.), while semantic similarity uses NLP to understand the meaning of descriptions.</p>
                            </div>
                            <div className="mb-3">
                              <strong>Q: Can high similarity scores be trusted as proof of technical equivalence?</strong>
                              <p className="mb-2">A: No. As per the platform's core principle: "Similarity suggests. Technical identity and constraints decide. Humans govern uncertainty." High embedding similarity alone is never treated as proof of technical equivalence. Technical identity must be established through exact matching of engineered specifications.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                    {/* Usage Questions */}
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="headingUsage">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapseUsage"
                          aria-expanded="false"
                          aria-controls="collapseUsage"
                        >
                            Usage Questions
                          </button>
                        </h2>
                        <div id="collapseUsage" className="accordion-collapse collapse" aria-labelledby="headingUsage" data-bs-parent="#faqAccordion">
                          <div className="mb-3">
                              <strong>Q: What input formats does NMIG support?</strong>
                              <p className="mb-2">A: NMIG supports manual text input (one description per line) and CSV file uploads. For CSV files, you can specify which column contains the material descriptions.</p>
                            </div>
                            <div className="mb-3">
                              <strong>Q: How do I interpret the match types?</strong>
                              <p className="mb-2">A:
                                <ul className="ps-3 mb-0">
                                  <li><strong>TECHNICAL_IDENTICAL:</strong> Materials have identical technical specifications</li>
                                  <li><strong>TECHNICAL_EQUIVALENT:</strong> Materials have equivalent technical specs for the same applications</li>
                                  <li><strong>FUNCTIONALLY_SIMILAR:</strong> Materials serve similar functions but may have technical differences</li>
                                  <li><strong>SEMANTICALLY_RELATED:</strong> Materials are related in meaning but have significant technical differences</li>
                                  <li><strong>NOT_MATCH:</strong> Materials show little to no technical or semantic similarity</li>
                                </ul>
                              </p>
                            </div>
                            <div className="mb-3">
                              <strong>Q: Can I export the results?</strong>
                              <p className="mb-2">A: Yes, all modules support exporting results. The Duplicate Detection and Material Clustering modules allow exporting to CSV or JSON formats. The API Explorer also supports downloading API responses as JSON files.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Deployment Questions */}
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="headingDeployment">
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseDeployment"
                            aria-expanded="false"
                            aria-controls="collapseDeployment"
                          >
                            Deployment Questions
                          </button>
                        </h2>
                        <div id="collapseDeployment" className="accordion-collapse collapse" aria-labelledby="headingDeployment" data-bs-parent="#faqAccordion">
                          <div className="mb-3">
                              <strong>Q: How do I run the NMIG Platform locally?</strong>
                              <p className="mb-2">A:
                                <ol className="ps-3 mb-0">
                                  <li>Clone the repository</li>
                                  <li>Create a virtual environment: <code>python -m venv venv</code></li>
                                  <li>Activate the environment: <code>venv\Scripts\activate</code> (Windows) or <code>source venv/bin/activate</code> (Linux/Mac)</li>
                                  <li>Install dependencies: <code>pip install -r backend/requirements.txt</code></li>
                                  <li>Start the backend: <code>uvicorn backend.api.main:app --reload</code></li>
                                  <li>In a new terminal, start the frontend: <code>streamlit run frontend/streamlit_app.py</code></li>
                                </ol>
                              </p>
                            </div>
                            <div className="mb-3">
                              <strong>Q: What are the system requirements?</strong>
                              <p className="mb-2">A:
                                <ul className="ps-3 mb-0">
                                  <li>Python 3.8 or higher</li>
                                  <li>At least 4GB RAM (8GB recommended for larger datasets)</li>
                                  <li>Internet connection for initial model download (approximately 200MB)</li>
                                  <li>Compatible with Windows, Linux, and macOS</li>
                                </ul>
                              </p>
                            </div>
                            <div className="mb-3">
                              <strong>Q: Is the platform production-ready?</strong>
                              <p className="mb-2">A: The current implementation is a working prototype focused on demonstrating the core AI innovation for SIH 26099. For production deployment, additional considerations would include authentication, authorization, scalability testing, security hardening, and integration with enterprise material master systems.</p>
                            </div>
                          </div>
                        </div>
                      </div>
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

export default Documentation;