import axios from 'axios';
import { useAuthStore } from '../store/useStore';
import { useNetworkStore } from '../store/useNetworkStore';
import { getAuthHeader } from '../utils/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const authHeaders = getAuthHeader();
  if (authHeaders.Authorization) {
    config.headers.Authorization = authHeaders.Authorization;
  }
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

    const isPasswordError = typeof detail === 'string' && detail.toLowerCase().includes('password');

    if (error.response?.status === 401 && !originalRequest._retry && !isPasswordError) {
      if (_isRefreshing) {
        return new Promise((resolve, reject) => {
          _pendingQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest._retry = true;
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      _isRefreshing = true;

      try {
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
        // ── FIXED: only logout on explicit auth rejection ──
        const status = refreshError?.response?.status;
        if (status === 401 || status === 403) {
          useAuthStore.getState().logout();
        }
        // Network errors / 5xx / timeouts → do NOT logout
        return Promise.reject(refreshError);
      } finally {
        _isRefreshing = false;
      }
    }

    if (!error.response || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      useNetworkStore.getState().setConnectivity({ isBackendReachable: false });
    }

    return Promise.reject(error);
  }
);

let _silentRefreshPromise = null;

export async function silentRefresh() {
  if (_silentRefreshPromise) return _silentRefreshPromise;

  _silentRefreshPromise = _runSilentRefresh().finally(() => {
    _silentRefreshPromise = null;
  });

  return _silentRefreshPromise;
}

async function _runSilentRefresh() {
  if (sessionStorage.getItem('zancrypt-logged-out')) {
    useAuthStore.getState().setInitialized();
    return;
  }

  const { restoreToken, setInitialized, logout } = useAuthStore.getState();

  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL || ''}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    sessionStorage.removeItem('zancrypt-logged-out');
    restoreToken(data.access_token, data.user ?? null);

    try {
      const keyMatRes = await api.get('/auth/key-material', {
        headers: { Authorization: `Bearer ${data.access_token}` }
      });
      useAuthStore.getState().setKeyMaterial(keyMatRes.data.master_key_salt);
    } catch (e) {
      console.error('Failed to fetch key material during refresh', e);
    }
  } catch (error) {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      logout();
    }
    // Network errors → preserve auth state
  } finally {
    setInitialized();
  }
}

export default api;