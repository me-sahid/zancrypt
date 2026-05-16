import { create } from 'zustand';

export const useNetworkStore = create((set) => ({
  status: 'online', // 'online', 'offline', 'reconnecting', 'degraded', 'backend_unreachable', 'websocket_disconnected'
  lastOnline: new Date(),
  retryCount: 0,
  nextRetryAt: null,
  isInternetReachable: true,
  isBackendReachable: true,
  isWebsocketConnected: true,
  
  // Infrastructure sub-states
  services: {
    gateway: 'healthy',
    redis: 'healthy',
    telemetry: 'healthy',
    sync: 'healthy'
  },

  setStatus: (status) => set({ status }),
  
  setConnectivity: (updates) => set((state) => {
    const newState = { ...state, ...updates };
    
    // Determine overall status based on sub-states
    let status = 'online';
    if (!newState.isInternetReachable || !newState.isBackendReachable) {
      status = 'offline';
    } else if (!newState.isWebsocketConnected) {
      status = 'degraded';
    }
    
    return { ...newState, status };
  }),

  setServices: (services) => set((state) => ({
    services: { ...state.services, ...services }
  })),

  incrementRetry: () => set((state) => ({ 
    retryCount: state.retryCount + 1,
    status: 'reconnecting'
  })),

  resetRetry: () => set({ retryCount: 0, status: 'online' }),
  
  setNextRetry: (time) => set({ nextRetryAt: time })
}));
