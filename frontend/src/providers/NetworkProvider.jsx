import React, { useEffect, useCallback, useRef } from 'react';
import { useNetworkStore } from '../store/useNetworkStore';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const HEALTH_CHECK_INTERVAL = 30000; // 30s — reduced polling pressure
const RECONNECT_INTERVAL = 8000;     // 8s — more breathing room
// Must fail this many consecutive times before flipping to offline
const FAILURE_THRESHOLD = 3;

export const NetworkProvider = ({ children }) => {
  const {
    status,
    setConnectivity,
    incrementRetry,
    resetRetry,
    setServices,
    setNextRetry
  } = useNetworkStore();

  const healthTimerRef = useRef(null);
  const retryTimerRef = useRef(null);
  // Track consecutive failures without causing re-renders
  const failureCountRef = useRef(0);
  // Stable ref for status so checkHealth never has status as a dep
  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);

  // Stable callback — status is read via ref, not as a dep
  const checkHealth = useCallback(async () => {
    try {
      const response = await api.get('/health/', { timeout: 8000 });
      const data = response.data;

      // Success — reset failure counter
      failureCountRef.current = 0;

      setConnectivity({
        isBackendReachable: true,
        isInternetReachable: navigator.onLine
      });

      setServices({
        gateway: 'healthy',
        redis: data.redis === 'connected' ? 'healthy' : 'degraded',
        telemetry: data.nodes === 'healthy' ? 'healthy' : 'degraded',
        sync: 'healthy'
      });

      const currentStatus = statusRef.current;
      if (
        currentStatus === 'offline' ||
        currentStatus === 'backend_unreachable' ||
        currentStatus === 'reconnecting'
      ) {
        toast.success('Infrastructure services restored.', { id: 'network-status' });
        resetRetry();
      }
    } catch {
      failureCountRef.current += 1;

      // Only flip to offline after FAILURE_THRESHOLD consecutive failures
      // This prevents a single slow response from crashing the whole UI
      if (failureCountRef.current >= FAILURE_THRESHOLD) {
        setConnectivity({ isBackendReachable: false });
        setServices({ gateway: 'unreachable' });

        if (statusRef.current === 'online') {
          toast.error('Infrastructure connection lost.', { id: 'network-status' });
        }
      }
      // If under threshold — stay online silently, no UI disruption
    }
  }, [setConnectivity, setServices, resetRetry]); // stable — no status dep

  // Handle Internet Connectivity
  useEffect(() => {
    const handleOnline = () => {
      setConnectivity({ isInternetReachable: true });
      failureCountRef.current = 0;
      checkHealth();
    };

    const handleOffline = () => {
      setConnectivity({ isInternetReachable: false });
      toast.error('Internet connection lost.', { id: 'network-status' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setConnectivity, checkHealth]);

  // Health Polling Loop — registers once, never re-registers
  useEffect(() => {
    // Delay initial check so the app can fully paint before any requests
    const initialCheckTimer = setTimeout(() => checkHealth(), 2500);
    healthTimerRef.current = setInterval(checkHealth, HEALTH_CHECK_INTERVAL);

    return () => {
      clearTimeout(initialCheckTimer);
      if (healthTimerRef.current) clearInterval(healthTimerRef.current);
    };
  }, [checkHealth]); // checkHealth is stable so this runs once

  // Reconnection Logic
  useEffect(() => {
    if (status === 'offline' || status === 'backend_unreachable') {
      const attemptReconnect = () => {
        incrementRetry();
        checkHealth();
        setNextRetry(Date.now() + RECONNECT_INTERVAL);
      };

      retryTimerRef.current = setInterval(attemptReconnect, RECONNECT_INTERVAL);
      return () => {
        if (retryTimerRef.current) clearInterval(retryTimerRef.current);
      };
    }
  }, [status, incrementRetry, checkHealth, setNextRetry]);

  return children;
};
