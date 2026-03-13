// client/src/services/drugService.js
import api from './api';

const drugService = {
  // Registration
  registerDrug: (data) => api.post('/drugs/register', data),

  // Transfer
  transferDrug: (data) => api.post('/drugs/transfer', data),

  // Verification (public)
  verifyDrug: (batchId) => api.get(`/drugs/verify/${batchId}`),

  // History
  getDrugHistory: (batchId) => api.get(`/drugs/history/${batchId}`),

  // Quarantine
  quarantineDrug: (data) => api.post('/drugs/quarantine', data),

  // Batches list (role-filtered)
  getMyBatches: () => api.get('/drugs/my-batches'),

  // QR
  generateQR: (data) => api.post('/qr/generate', data),

  // Analytics
  getDashboard: () => api.get('/analytics/dashboard'),
};

export default drugService;
