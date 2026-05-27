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
    const detail = error.response?.data?.detail;

    // Skip intercepting 401s that are explicitly about share passwords
    const isPasswordError = typeof detail === 'string' && detail.toLowerCase().includes('password');

    if (error.response?.status === 401 && !originalRequest._retry && !isPasswordError) {
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
 *
 * IMPORTANT: Only clears auth state when the server explicitly rejects
 * the refresh token (401/403). Network errors or backend unavailability
 * are ignored so the user is NOT logged out on transient failures.
 */
export async function silentRefresh() {
  const { isAuthenticated, restoreToken, logout, setInitialized } = useAuthStore.getState();
  if (!isAuthenticated) {
    // Not logged in — mark init done immediately
    setInitialized();
    return;
  }
  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL || ''}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    restoreToken(data.access_token);
  } catch (err) {
    // Only logout if the server explicitly rejected the refresh token (401/403).
    // Network errors, timeouts, or 5xx failures should NOT log the user out —
    // their persisted session may still be valid on the next attempt.
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      logout(); // logout() sets isInitializing: false internally
    }
  } finally {
    // Always clear the initializing gate so ProtectedRoute can proceed.
    // Safe to call multiple times — it's idempotent.
    setInitialized();
  }
}

export default api;

