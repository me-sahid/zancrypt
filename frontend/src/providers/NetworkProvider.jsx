import React, { useEffect, useCallback, useRef } from 'react';
import { useNetworkStore } from '../store/useNetworkStore';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const HEALTH_CHECK_INTERVAL = 10000; // 10s
const RECONNECT_INTERVAL = 5000;    // 5s

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

  const checkHealth = useCallback(async () => {
    try {
      const response = await api.get('/health', { timeout: 5000 });
      const data = response.data;
      
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

      if (status === 'offline' || status === 'backend_unreachable') {
        toast.success('Infrastructure services restored.', { id: 'network-status' });
        resetRetry();
      }
    } catch (error) {
      setConnectivity({ isBackendReachable: false });
      setServices({ gateway: 'unreachable' });
      
      if (status === 'online') {
        toast.error('Infrastructure connection lost.', { id: 'network-status' });
      }
    }
  }, [status, setConnectivity, setServices, resetRetry]);

  // Handle Internet Connectivity
  useEffect(() => {
    const handleOnline = () => {
      setConnectivity({ isInternetReachable: true });
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

  // Health Polling Loop
  useEffect(() => {
    healthTimerRef.current = setInterval(checkHealth, HEALTH_CHECK_INTERVAL);
    checkHealth(); // Initial check

    return () => {
      if (healthTimerRef.current) clearInterval(healthTimerRef.current);
    };
  }, [checkHealth]);

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
