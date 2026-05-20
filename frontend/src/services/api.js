import axios from 'axios';
import { useAuthStore } from '../store/useStore';
import { useNetworkStore } from '../store/useNetworkStore';
import { getAuthHeader } from '../utils/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/',
  // Required so httpOnly cookies (refresh token) are sent with every request
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  // Read token via the unified getAuthHeader helper
  const authHeaders = getAuthHeader();
  if (authHeaders.Authorization) {
    config.headers.Authorization = authHeaders.Authorization;
  }
  // Let axios auto-set Content-Type for FormData (multipart/form-data with boundary)
  // Only set JSON for non-FormData requests
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

let _isRefreshing = false;
let _pendingQueue = [];

function processQueue(error, token = null) {
  _pendingQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  _pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we are already refreshing, queue this request
      if (_isRefreshing) {
        return new Promise((resolve, reject) => {
          _pendingQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      _isRefreshing = true;

      try {
        // httpOnly cookie is sent automatically — no need to pass refresh token manually
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || ''}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.access_token;
        useAuthStore.getState().restoreToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        _isRefreshing = false;
      }
    }

    // Connectivity tracking
    if (!error.response || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      useNetworkStore.getState().setConnectivity({ isBackendReachable: false });
    }

    return Promise.reject(error);
  }
);

/**
 * Call this once on app startup (e.g., in main.jsx) to silently restore
 * an in-memory token from the httpOnly refresh cookie if the user was
 * previously logged in. The access token itself is never stored on disk.
 */
export async function silentRefresh() {
  const { isAuthenticated, restoreToken, logout } = useAuthStore.getState();
  if (!isAuthenticated) return;
  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL || ''}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    restoreToken(data.access_token);
  } catch {
    // Refresh token expired or missing — clear stale state
    logout();
  }
}

export default api;

