import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Medication APIs
export const medicationAPI = {
  getAll: () => api.get('/medications'),
  getOne: (id) => api.get(`/medications/${id}`),
  create: (data) => api.post('/medications', data),
  update: (id, data) => api.put(`/medications/${id}`, data),
  delete: (id) => api.delete(`/medications/${id}`),
};

// Adherence APIs
export const adherenceAPI = {
  getLogs: () => api.get('/adherence/logs'),
  getTodayReminders: () => api.get('/adherence/today'),
  getMedicationLogs: (medId) => api.get(`/adherence/medication/${medId}`),
  createLog: (data) => api.post('/adherence/log', data),
  updateLog: (id, data) => api.put(`/adherence/log/${id}`, data),
};

// Report APIs
export const reportAPI = {
  getStats: (startDate, endDate) => {
    let url = '/reports/stats';
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    return api.get(url);
  },
  getMedicationWise: () => api.get('/reports/medication-wise'),
  getWeeklyTrend: () => api.get('/reports/weekly-trend'),
};

export default api;