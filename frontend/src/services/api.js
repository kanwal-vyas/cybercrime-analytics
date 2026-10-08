/**
 * API Client Layer for Cyber Crime Analytics Backend
 * Future FastAPI integration (Stage 20+)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}, params = {}) {
    let url = `${this.baseUrl}${endpoint}`;
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, val);
        }
      });
      const qs = searchParams.toString();
      if (qs) {
        url += (url.includes('?') ? '&' : '?') + qs;
      }
    }

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

  // Endpoint Contracts
  async getHealth() {
    return this.request('/health');
  }

  async getSummary() {
    return this.request('/summary');
  }

  async getStates(params = {}) {
    return this.request('/states', {}, params);
  }

  async getCategories(params = {}) {
    return this.request('/categories', {}, params);
  }

  async getMotives(params = {}) {
    return this.request('/motives', {}, params);
  }

  async getTrend(params = {}) {
    return this.request('/trend', {}, params);
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
