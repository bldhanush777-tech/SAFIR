import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'Network error communicating with NASA FireSafe API';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

// Investigations & Telemetry
export const getFleetStats = () => apiClient.get('/investigations/summary/stats');
export const getInvestigations = (params) => apiClient.get('/investigations', { params });
export const getInvestigationDetail = (code) => apiClient.get(`/investigations/${encodeURIComponent(code)}`);

// Experiments & Comparison
export const getExperimentalRuns = (params) => apiClient.get('/experiments/runs', { params });
export const compareInvestigations = (codes) => apiClient.post('/experiments/compare', codes);

// RAG Assistant
export const askAssistant = (query, investigationFilter = null, categoryFilter = null) =>
  apiClient.post('/assistant/chat', {
    query,
    investigation_filter: investigationFilter,
    category_filter: categoryFilter,
  });
export const getSuggestedQueries = () => apiClient.get('/assistant/suggested-queries');

// Habitats & Scoring
export const getTargetHabitats = () => apiClient.get('/habitats/target-habitats');
export const getHabitatRankings = (habitat) => apiClient.get('/habitats/rankings', { params: { habitat } });
export const recalculateHabitatRankings = (config) => apiClient.post('/habitats/recalculate', config);

// Gaps & Radar
export const getResearchGaps = () => apiClient.get('/gaps');
export const getRadarScanData = () => apiClient.get('/gaps/radar');

// Scientific Visualizations
export const getFlammabilityEnvelope = () => apiClient.get('/visualizations/flammability-envelope');
export const getFlameSpreadCurves = () => apiClient.get('/visualizations/flame-spread-velocity');
export const getSmokeDistribution = () => apiClient.get('/visualizations/smoke-distribution');

// Earth Applications
export const getEarthApplications = () => apiClient.get('/earth-applications');

// Sources & PDF Ingestion
export const getIndexedDocuments = () => apiClient.get('/sources/documents');
export const getDocumentChunks = (sourceFilename) =>
  apiClient.get('/sources/chunks', { params: { source_filename: sourceFilename } });

export const uploadPsiDocument = (file, investigationCode = null) => {
  const formData = new FormData();
  formData.append('file', file);
  if (investigationCode) {
    formData.append('investigation_code', investigationCode);
  }
  return axios.post(`${API_BASE}/sources/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(res => res.data);
};
