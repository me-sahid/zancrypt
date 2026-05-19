import { useEffect, useRef } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { useNetworkStore } from '../store/useNetworkStore';

export const useSimulationEngine = () => {
  const timerRef = useRef(null);

  useEffect(() => {
    const runSimulation = () => {
      // Access the freshest state directly from the store to avoid stale closures
      const state = useDashboardStore.getState();
      const networkState = useNetworkStore.getState();
      
      // Stop simulation if offline
      if (networkState.status === 'offline') return;

      const { metrics, nodes, files, updateMetrics, updateNode, addEvent } = state;

      // 1. Update Metrics based on REAL data from store
      const hasFiles = files.length > 0;
      
      // Keep metrics stable for "Enterprise" feel, only simulate throughput and latency
      const newThroughput = hasFiles ? 450 + Math.floor(Math.random() * 20) : 0; 
      
      updateMetrics({
        throughput: newThroughput,
        latency: metrics.latency || (hasFiles ? 32 : 0),
        // Storage, Shards, and NetworkHealth are now updated via fetchStats in Dashboard.jsx
      });

      // 2. Randomly update a node health (but rarely)
      if (nodes && nodes.length > 0 && Math.random() > 0.95) {
        const randomIndex = Math.floor(Math.random() * nodes.length);
        const randomNode = nodes[randomIndex];
        updateNode(randomNode.id, {
          load: Math.min(100, Math.max(0, randomNode.load + (Math.random() * 4 - 2))),
          latency: Math.min(200, Math.max(20, randomNode.latency + (Math.random() * 10 - 5))),
        });
      }

      // 3. Occasionally add a system event (less frequent, more realistic)
      if (Math.random() > 0.98) {
        const eventTypes = [
          { event: 'Background shard verification completed', severity: 'success', type: 'system', user: 'ZanBot' },
          { event: 'Node synchronization check passed', severity: 'success', type: 'system', user: 'ZanBot' },
          { event: 'New security patch verified', severity: 'low', type: 'audit', user: 'Admin' }
        ];
        const selected = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        addEvent({
          id: Date.now(),
          ...selected,
          time: 'Just now'
        });
      }
    };

    // Initial run
    runSimulation();
    
    // Set interval
    timerRef.current = setInterval(runSimulation, 10000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []); // Empty dependency array is safe now because we use getState()
};
