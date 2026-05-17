import { create } from 'zustand';

export const useDashboardStore = create((set) => ({
  // Infrastructure Metrics
  metrics: {
    throughput: 0,
    requestVolume: 0,
    latency: 0,
    activeShards: 0,
    totalStorage: 0,
    networkHealth: 0,
    securityScore: 0,
  },
  
  // Historical data for charts
  history: {
    throughput: [],
    requests: [],
  },

  // Nodes Status
  nodes: [
    { id: 'tokyo-01', name: 'Tokyo-Alpha', region: 'ap-northeast-1', health: 'Healthy', load: 12, latency: 45, shards: 1240, provider: 'AWS', status: 'success' },
    { id: 'frankfurt-01', name: 'Frankfurt-01', region: 'eu-central-1', health: 'Healthy', load: 85, latency: 120, shards: 3420, provider: 'GCP', status: 'success' },
    { id: 'us-west-01', name: 'US-West-Legacy', region: 'us-west-2', health: 'Healthy', load: 44, latency: 85, shards: 890, provider: 'Azure', status: 'success' },
    { id: 'mumbai-01', name: 'Mumbai-Primary', region: 'ap-south-1', health: 'Syncing', load: 5, latency: 32, shards: 210, provider: 'DigitalOcean', status: 'warning' },
  ],

  // Security Events Feed
  events: [
    { id: 1, event: 'Encryption Key Rotation', time: 'Just now', user: 'System', severity: 'low', type: 'crypto' },
    { id: 2, event: 'Integrity Check Passed', time: '2m ago', user: 'Auditor', severity: 'success', type: 'audit' },
  ],
  
  files: [],
  searchQuery: "",
  isSidebarOpenMobile: false,

  // Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSidebarOpenMobile: (open) => set({ isSidebarOpenMobile: open }),
  setFiles: (files) => set({ files }),
  setNodes: (nodes) => set({ nodes }),
  updateMetrics: (newMetrics) => set((state) => ({ 
    metrics: { ...state.metrics, ...newMetrics } 
  })),

  addEvent: (event) => set((state) => ({ 
    events: [event, ...state.events.slice(0, 19)] 
  })),

  updateNode: (nodeId, updates) => set((state) => ({
    nodes: state.nodes.map(node => node.id === nodeId ? { ...node, ...updates } : node)
  })),

  setHistory: (history) => set({ history }),
  
  reset: () => set({
    metrics: {
      throughput: 0,
      requestVolume: 0,
      latency: 0,
      activeShards: 0,
      totalStorage: 0,
      networkHealth: 0,
      securityScore: 0,
    },
    history: { throughput: [], requests: [] },
    nodes: [],
    events: [],
    files: [],
    searchQuery: "",
    isSidebarOpenMobile: false
  })
}));
