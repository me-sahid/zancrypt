import axios from 'axios';
import { useAuthStore } from '../store/useStore';
import { useNetworkStore } from '../store/useNetworkStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Let axios auto-set Content-Type for FormData (multipart/form-data with boundary)
  // Only set JSON for non-FormData requests
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    
    // Connectivity tracking
    if (!error.response || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      useNetworkStore.getState().setConnectivity({ isBackendReachable: false });
    }
    
    return Promise.reject(error);
  }
);

export default api;
