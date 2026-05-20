import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { silentRefresh } from './services/api';
import './index.css';

// Clear localStorage completely if both old/renamed auth keys exist simultaneously
if (localStorage.getItem('zancrypt-auth') && localStorage.getItem('yuuvault-auth')) {
  localStorage.clear();
}

// Clear chunk failure reload flag on successful load
if (sessionStorage.getItem('zancrypt-reload-on-chunk-fail')) {
  setTimeout(() => {
    sessionStorage.removeItem('zancrypt-reload-on-chunk-fail');
  }, 2000);
}

// Global error display for debugging headless environments
window.addEventListener('error', (event) => {
  // Handle dynamic module load failures gracefully by reloading to sync latest server assets
  if (event.message && (
    event.message.includes('Importing a module script failed') || 
    event.message.includes('Loading chunk') || 
    event.message.includes('dynamically imported module')
  )) {
    const hasReloaded = sessionStorage.getItem('zancrypt-reload-on-chunk-fail');
    if (!hasReloaded) {
      sessionStorage.setItem('zancrypt-reload-on-chunk-fail', 'true');
      window.location.reload();
      return;
    }
  }

  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; background: #1a0b16; color: #ff4a7d; font-family: monospace; border: 2px solid #ff4a7d; border-radius: 8px; margin: 20px; box-shadow: 0 0 20px rgba(255, 74, 125, 0.2);">
        <h1 style="margin-top: 0; font-size: 20px;">⚠️ Zancrypt Runtime Error Catcher</h1>
        <p><strong>Message:</strong> ${event.message}</p>
        <p><strong>Source:</strong> ${event.filename}:${event.lineno}:${event.colno}</p>
        <p><strong>Stack Trace:</strong></p>
        <pre style="background: #0d040a; padding: 10px; border-radius: 4px; overflow-x: auto; color: #a19ba0; font-size: 12px; white-space: pre-wrap; word-break: break-all;">${event.error ? event.error.stack : 'No stack trace available'}</pre>
      </div>
    `;
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
    
    // Automatically reload the application if a lazy-loaded chunk fails due to a stale client manifest after deployment
    if (error.message && (
      error.message.includes('Importing a module script failed') || 
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Loading chunk')
    )) {
      const hasReloaded = sessionStorage.getItem('zancrypt-reload-on-chunk-fail');
      if (!hasReloaded) {
        sessionStorage.setItem('zancrypt-reload-on-chunk-fail', 'true');
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
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

// Initialize authentication state from httpOnly cookie before rendering
silentRefresh().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
});

