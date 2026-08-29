import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { silentRefresh } from './services/api';
import { useThemeStore } from './store/useThemeStore';
import './index.css';
import 'remixicon/fonts/remixicon.css';

// Clear localStorage completely if both old/renamed auth keys exist simultaneously
if (localStorage.getItem('zancrypt-auth') && localStorage.getItem('yuuvault-auth')) {
  localStorage.clear();
}

// Apply persisted theme before first paint to avoid flash
(function bootstrapTheme() {
  try {
    const stored = localStorage.getItem('zancrypt-theme');
    const theme = stored ? JSON.parse(stored)?.state?.theme : 'dark';
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  } catch {
    // defaults to dark
  }
})();

// Keep html class in sync with theme store changes
useThemeStore.subscribe((state) => {
  if (state.theme === 'light') {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
});

// Clear chunk failure reload flag on successful load
if (sessionStorage.getItem('zancrypt-reload-on-chunk-fail')) {
  setTimeout(() => {
    sessionStorage.removeItem('zancrypt-reload-on-chunk-fail');
  }, 2000);
}

// Detect stale chunk errors (window error events)
window.addEventListener('error', (event) => {
  if (event.message && (
    event.message.includes('Importing a module script failed') || 
    event.message.includes('Loading chunk') || 
    event.message.includes('dynamically imported module') ||
    event.message.includes('Failed to fetch')
  )) {
    const hasReloaded = sessionStorage.getItem('zancrypt-reload-on-chunk-fail');
    if (!hasReloaded) {
      sessionStorage.setItem('zancrypt-reload-on-chunk-fail', 'true');
      window.location.reload();
    }
  }
});

// Detect stale chunk errors (unhandled promise rejections from dynamic imports)
window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || '';
  if (
    msg.includes('dynamically imported module') ||
    msg.includes('Failed to fetch') ||
    msg.includes('Loading chunk') ||
    msg.includes('Importing a module script failed')
  ) {
    const hasReloaded = sessionStorage.getItem('zancrypt-reload-on-chunk-fail');
    if (!hasReloaded) {
      event.preventDefault();
      sessionStorage.setItem('zancrypt-reload-on-chunk-fail', 'true');
      window.location.reload();
    }
  }
});

// React Error Boundary for rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    
    // Silently reload on stale chunk errors — no crash UI shown
    const isChunkError = error.message && (
      error.message.includes('Importing a module script failed') || 
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('Loading chunk')
    );
    if (isChunkError) {
      const hasReloaded = sessionStorage.getItem('zancrypt-reload-on-chunk-fail');
      if (!hasReloaded) {
        sessionStorage.setItem('zancrypt-reload-on-chunk-fail', 'true');
        window.location.reload();
        return;
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // For chunk errors: show blank screen while reload is in flight
      const isChunkError = this.state.error?.message && (
        this.state.error.message.includes('dynamically imported module') ||
        this.state.error.message.includes('Failed to fetch') ||
        this.state.error.message.includes('Loading chunk')
      );
      if (isChunkError) {
        return <div style={{ background: '#0a0a0f', minHeight: '100vh' }} />;
      }
      return (
        <div style={{ padding: '20px', background: '#1a0b16', color: '#ff4a7d', fontFamily: 'monospace', border: '2px solid #ff4a7d', borderRadius: '8px', margin: '20px', boxShadow: '0 0 20px rgba(255, 74, 125, 0.2)' }}>
          <h1 style={{ marginTop: 0, fontSize: '20px' }}>⚠️ Zancrypt React Mount Crash</h1>
          <p><strong>Message:</strong> {this.state.error?.message}</p>
          <p><strong>Stack Trace:</strong></p>
          <pre style={{ background: '#0d040a', padding: '10px', borderRadius: '4px', overflowX: 'auto', color: '#a19ba0', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60 * 1000,        // 1 min — avoid redundant refetches
      gcTime: 5 * 60 * 1000,       // 5 min garbage-collect time
    },
  },
});

// Initialize authentication state from httpOnly cookie, then mount React
async function init() {
  await silentRefresh();
  ReactDOM.createRoot(document.getElementById('root')).render(
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}


// ─── Drive domain bootstrap ───────────────────────────────────────────────────
// On drive.zancrypt.in, enforce the new UUID-based URL structure BEFORE mounting.
// Uses async IIFE instead of top-level await for wider browser/bundler compat.
;(async () => {
  const isDrive = window.location.hostname === 'drive.zancrypt.in';
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const ON_DRIVE = isDrive || isLocal;

  if (ON_DRIVE) {
    const { getWorkspaceId } = await import('./hooks/useWorkspace.js');
    const wid = getWorkspaceId();
    const path = window.location.pathname;

    // Map of old paths → new UUID-based paths
    // history.replaceState rewrites URL without a full page reload
    const LEGACY_REDIRECTS = {
      '/dashboard':   `/home/${wid}`,
      '/vault':       `/drive/${wid}`,
      '/uploads':     `/drive/${wid}/upload`,
      '/shares':      `/drive/${wid}/shared`,
      '/bin':         `/drive/${wid}/bin`,
      '/settings':    `/workspace/${wid}/settings`,
      '/profile':     `/workspace/${wid}/profile`,
      '/security':    `/workspace/${wid}/security`,
      '/nodes':       `/workspace/${wid}/nodes`,
      '/monitoring':  `/workspace/${wid}/monitor`,
      '/analytics':   `/workspace/${wid}/analytics`,
      '/audit':       `/workspace/${wid}/audit`,
      '/login':       '/auth/login',
      '/register':    '/auth/register',
    };

    if (isDrive) {
      LEGACY_REDIRECTS['/'] = `/drive/${wid}`;
    }

    const newPath = LEGACY_REDIRECTS[path];
    if (newPath && newPath !== path) {
      window.history.replaceState(null, '', newPath + window.location.search);
    }
  }

  init();
})();

