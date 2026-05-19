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
  nodes: [],

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
