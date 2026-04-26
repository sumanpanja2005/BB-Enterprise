import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL || '';
const fallbackProdApiUrl = 'https://bb-enterprise.onrender.com';
const baseURL =
  configuredApiUrl || (import.meta.env.PROD ? fallbackProdApiUrl : '');

const api = axios.create({
  baseURL: baseURL || undefined,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
