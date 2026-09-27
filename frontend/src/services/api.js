/**
 * API Service Layer for NMIG Frontend
 * Handles all communication with the backend API
 */

// Base URL for API - in development, this will be relative to current origin
// In production, you might want to set this via environment variable
const getBaseUrl = () => {
  // If we're on localhost or 127.0.0.1, use the default port
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }

  // In production, assume API is on same origin
  return window.location.origin;
};

const API_BASE_URL = getBaseUrl();

/**
 * Make an API request with proper error handling
 * @param {string} endpoint - API endpoint (without leading slash)
 * @param {Object} options - Fetch API options
 * @returns {Promise<Object>} - Parsed JSON response
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}/${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    // Handle non-2xx responses
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        // If we can't parse JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }

    // Handle empty responses
    if (response.status === 204) {
      return {};
    }

    return await response.json();
  } catch (error) {
    // Re-throw fetch errors (network issues) with more context
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the API. Please ensure the backend is running.');
    }
    throw error;
  }
};

/**
 * API Service Methods
 */
const apiService = {
  // Health check
  healthCheck: () => apiRequest('health', { method: 'GET' }),

  // Get API statistics
  getStats: () => apiRequest('stats', { method: 'GET' }),

  // Generate material fingerprint
  generateFingerprint: (description) =>
    apiRequest('fingerprint', {
      method: 'POST',
      body: JSON.stringify({ description })
    }),

  // Match two materials
  matchMaterials: (description1, description2) =>
    apiRequest('match', {
      method: 'POST',
      body: JSON.stringify({
        description_1: description1,
        description_2: description2
      })
    }),

  // Find duplicates in a list of materials
  findDuplicates: (descriptions) =>
    apiRequest('duplicates', {
      method: 'POST',
      body: JSON.stringify(descriptions.map(desc => ({ description: desc })))
    }),

  // Cluster similar materials
  clusterMaterials: (descriptions) =>
    apiRequest('cluster', {
      method: 'POST',
      body: JSON.stringify(descriptions.map(desc => ({ description: desc })))
    }),
};

export default apiService;