/**
 * API Client Layer for Cyber Crime Analytics Backend
 * Future FastAPI integration (Stage 20+)
 */

function resolveApiBaseUrl() {
  let raw = import.meta.env.VITE_API_BASE_URL || '';
  raw = raw.trim();

  // If in browser on Render and no explicit API base was injected, fallback to known backend
  if (!raw && typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    raw = 'https://niriksha-backend-nlln.onrender.com/api';
  } else if (!raw) {
    raw = 'http://localhost:8000/api';
  }

  // Render fromService returns internal hostname without domain (e.g. niriksha-backend-nlln)
  let hostPart = raw.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (hostPart && !hostPart.includes('.') && !hostPart.includes('localhost') && !hostPart.includes(':')) {
    raw = raw.replace(hostPart, `${hostPart}.onrender.com`);
  }

  // Ensure protocol is present
  if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
    raw = `https://${raw}`;
  }
  // Ensure /api suffix is present
  if (!raw.endsWith('/api') && !raw.includes('/api/')) {
    raw = raw.replace(/\/+$/, '') + '/api';
  }
  return raw;
}

const API_BASE_URL = resolveApiBaseUrl();

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

  // Live Threat Intelligence & Triage Streams
  async getCertInAdvisories() {
    return this.request('/live/cert-in');
  }

  async getThreatRadar() {
    return this.request('/live/threat-radar');
  }

  async getLiveEvents(limit = 25) {
    return this.request('/live/events', {}, { limit });
  }

  async triggerLiveEvent() {
    return this.request('/live/generate-event', { method: 'POST' });
  }

  getWebSocketUrl(path = '/live/ws-triage') {
    const isHttps = this.baseUrl.startsWith('https');
    const wsProto = isHttps ? 'wss:' : 'ws:';
    const host = this.baseUrl.replace(/^https?:\/\//, '');
    return `${wsProto}//${host}${path}`;
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
