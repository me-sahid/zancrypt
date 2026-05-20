import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Database, 
  Server, 
  ShieldCheck, 
  HardDrive,
  Activity,
  FileText
} from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { useAuthStore } from '../../store/useStore';
import { useSimulationEngine } from '../../hooks/useSimulationEngine';
import MetricCard from '../../components/dashboard/MetricCard';
import NodeStatusGrid from '../../components/dashboard/NodeStatusGrid';
import { fileService, adminService } from '../../services/vaultServices';

const Dashboard = () => {
  useSimulationEngine();
  
  const { metrics, nodes, files, setFiles, setNodes, updateMetrics } = useDashboardStore();
  const { user } = useAuthStore();

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const [filesRes, nodesRes, metricsRes] = await Promise.all([
          fileService.listFiles(),
          adminService.getNodes(),
          adminService.getSystemMetrics()
        ]);

        if (isMounted) {
          if (filesRes?.data) setFiles(filesRes.data);
          if (metricsRes?.data) {
            updateMetrics({
              totalStorage: metricsRes.data.total_storage_bytes || 0,
              securityScore: 100,
              networkHealth: metricsRes.data.network_health_score,
              activeShards: metricsRes.data.total_files * 4,
            });
          }
          if (nodesRes?.data) {
            const mappedNodes = nodesRes.data.map(n => {
              const capacityGB = n.node_metadata?.capacity_gb || 1024;
              const capacityBytes = capacityGB * 1024 * 1024 * 1024;
              const storageUsed = n.storage_used || 0;
              const loadPercent = n.healthy ? Math.min(100, Math.max(0.1, (storageUsed / capacityBytes) * 100)) : 0;
              
              return {
                id: n.id,
                name: n.node_name,
                region: n.region,
                health: n.healthy ? 'Healthy' : 'Offline',
                load: parseFloat(loadPercent.toFixed(2)),
                latency: n.healthy ? 25 : 0,
                shards: (n.shards || []).length,
                provider: n.provider,
                status: n.healthy ? 'success' : 'danger',
                isCloudNode: ['S3', 'SUPABASE'].includes(n.provider)
              };
            });
            setNodes(mappedNodes);
          }
        }
      } catch (error) {
        console.error('Failed to fetch initial stats:', error);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => { 
      isMounted = false; 
      clearInterval(interval);
    };
  }, [setFiles, setNodes, updateMetrics]);

  const CLOUD_PROVIDERS = ['S3', 'SUPABASE'];
  const cloudNodes = (nodes || []).filter(n => CLOUD_PROVIDERS.includes(n.provider));

  const formatTotalStorage = (bytes) => {
    if (!bytes || bytes === 0) return { value: '0', suffix: ' B' };
    if (bytes < 1024) return { value: bytes.toFixed(2), suffix: ' B' };
    if (bytes < 1048576) return { value: (bytes / 1024).toFixed(2), suffix: ' KB' };
    if (bytes < 1073741824) return { value: (bytes / 1048576).toFixed(2), suffix: ' MB' };
    return { value: (bytes / 1073741824).toFixed(2), suffix: ' GB' };
  };

  const safeMetrics = metrics || { totalStorage: 0, securityScore: 100 };
  const realTotalStorage = files.reduce((acc, f) => acc + (f.file_size || 0), 0);
  const displayStorage = Math.max(safeMetrics.totalStorage || 0, realTotalStorage);
  
  const storageInfo = formatTotalStorage(displayStorage);
  const liveNodesCount = nodes ? nodes.filter(n => n.health === 'Healthy').length : 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-mono text-2xl text-text-primary tracking-widest uppercase">
            Dashboard
          </h1>
          <p className="text-text-muted mt-2 font-mono text-xs uppercase tracking-widest">
            Welcome, {user?.full_name?.split(' ')[0] || user?.username || 'Operator'}
          </p>
        </div>
        
        <Link to="/uploads" className="px-6 py-3 border border-accent text-accent font-mono text-[10px] uppercase tracking-widest hover:bg-accent/10 transition-colors">
          [ Init Upload ]
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Total Storage" 
          value={storageInfo.value} 
          suffix={storageInfo.suffix} 
          icon={HardDrive} 
          trend="NOMINAL" 
          isPositive={true} 
        />
        <MetricCard 
          label="Security Protocol" 
          value={safeMetrics.securityScore || 100} 
          suffix="%" 
          icon={ShieldCheck} 
          trend="LOCKED" 
          isPositive={true} 
        />
        <MetricCard 
          label="Encrypted Items" 
          value={files ? files.length : 0} 
          icon={Database} 
        />
        <MetricCard 
          label="Active Nodes" 
          value={cloudNodes.length > 0 ? cloudNodes.filter(n => n.health === 'Healthy').length : liveNodesCount} 
          icon={Server} 
          trend="ONLINE" 
          isPositive={true} 
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Files Preview */}
        <div className="lg:col-span-2 flex flex-col bg-surface border border-border h-[400px]">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="font-mono text-[11px] uppercase tracking-widest text-text-muted flex items-center">
              <FileText className="w-3.5 h-3.5 mr-2" />
              Recent Ciphertexts
            </div>
            <Link to="/vault" className="text-accent hover:underline font-mono text-[10px] uppercase tracking-widest">
              View Log
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {files.length > 0 ? (
              <div className="space-y-1">
                {files.slice(0, 6).map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 hover:bg-surface-raised transition-colors group">
                    <div className="flex items-center min-w-0">
                      <div className="w-6 h-6 border border-border flex items-center justify-center mr-3 bg-void">
                        <FileText className="w-3 h-3 text-text-secondary" />
                      </div>
                      <div className="truncate">
                        <p className="font-mono text-[11px] text-text-primary truncate">
                          {file.encrypted_filename || file.filename || file.name}
                        </p>
                        <p className="font-mono text-[9px] text-text-muted">
                          {file.file_size ? (file.file_size / 1024).toFixed(1) + ' KB' : '0 KB'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <FileText className="w-6 h-6 mb-2 text-text-muted" />
                <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Vault Empty</p>
              </div>
            )}
          </div>
        </div>

        {/* Node Health Grid */}
        <div className="bg-surface border border-border h-[400px] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="font-mono text-[11px] uppercase tracking-widest text-text-muted flex items-center">
              <Activity className="w-3.5 h-3.5 mr-2" />
              Node Matrix
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            <NodeStatusGrid nodes={cloudNodes} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
