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
          originalRequest._retry = true;
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

let _silentRefreshPromise = null;

export async function silentRefresh() {
  // If already running — return same promise, don't start another
  if (_silentRefreshPromise) return _silentRefreshPromise;

  _silentRefreshPromise = _runSilentRefresh().finally(() => {
    _silentRefreshPromise = null;
  });

  return _silentRefreshPromise;
}

async function _runSilentRefresh() {
  // If the user explicitly logged out this session, do not silently re-authenticate
  // them via a surviving httpOnly cookie.
  if (sessionStorage.getItem('zancrypt-logged-out')) {
    useAuthStore.getState().setInitialized();
    return;
  }

  const { restoreToken, setInitialized, logout } = useAuthStore.getState()
  
  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL || ''}/auth/refresh`,
      {},
      { withCredentials: true }
    )
    // Clear the logged-out flag on a successful token restore (e.g. user
    // opened a fresh login in the same tab)
    sessionStorage.removeItem('zancrypt-logged-out');
    restoreToken(data.access_token, data.user ?? null)

    try {
      const keyMatRes = await api.get('/auth/key-material', {
        headers: { Authorization: `Bearer ${data.access_token}` }
      });
      useAuthStore.getState().setKeyMaterial(keyMatRes.data.master_key_salt);
    } catch (e) {
      console.error("Failed to fetch key material during refresh", e);
    }
  } catch (error) {
    // On page refresh, if the cookie is gone or session expired,
    // just mark as initialized (not authenticated) — do NOT call logout()
    // because that wipes sessionStorage and breaks future login.
    // logout() is only for explicit user-initiated sign-out.
    //
    // Only call setInitialized so ProtectedRoute redirects to /login cleanly.
    // (Network errors also land here — in that case user stays on their page
    //  because isAuthenticated remains false but no redirect happens because
    //  App doesn't forcibly navigate.)
  } finally {
    setInitialized()
  }
}

export default api;

