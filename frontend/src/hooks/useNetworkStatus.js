import { useNetworkStore } from '../store/useNetworkStore';

export const useNetworkStatus = () => {
  const { 
    status, 
    lastOnline, 
    retryCount, 
    nextRetryAt, 
    services,
    isInternetReachable,
    isBackendReachable,
    isWebsocketConnected
  } = useNetworkStore();

  return {
    isOnline: status === 'online',
    isOffline: status === 'offline',
    isReconnecting: status === 'reconnecting',
    isDegraded: status === 'degraded',
    status,
    lastOnline,
    retryCount,
    nextRetryAt,
    services,
    isInternetReachable,
    isBackendReachable,
    isWebsocketConnected
  };
};
