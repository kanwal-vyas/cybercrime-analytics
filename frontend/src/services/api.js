/**
 * API Client Layer for Cyber Crime Analytics Backend
 * Future FastAPI integration (Stage 20+)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.detail || `API Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`[ApiClient] Request failed for ${endpoint}:`, err.message);
      throw err;
    }
  }

  // Future Endpoint Contracts (Stage 20+)
  async getSummary() {
    return this.request('/summary');
  }

  async getStates() {
    return this.request('/states');
  }

  async getCategories() {
    return this.request('/categories');
  }

  async getMotives() {
    return this.request('/motives');
  }

  async getTrend() {
    return this.request('/trend');
  }

  async getClassificationMetrics() {
    return this.request('/models/classification');
  }

  async getRegressionMetrics() {
    return this.request('/models/regression');
  }

  async getAssociationRules() {
    return this.request('/models/association');
  }

  async getClusterProfiles() {
    return this.request('/models/clustering');
  }

  async getOutlierConsensus() {
    return this.request('/models/outliers');
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
