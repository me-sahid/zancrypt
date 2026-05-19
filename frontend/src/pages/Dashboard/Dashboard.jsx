import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Database, 
  Server, 
  ShieldCheck, 
  Activity, 
  HardDrive,
  Cpu,
  Globe,
  Zap
} from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { useAuthStore } from '../../store/useStore';
import { useSimulationEngine } from '../../hooks/useSimulationEngine';
import MetricCard from '../../components/dashboard/MetricCard';
import TrafficChart from '../../components/dashboard/TrafficChart';
import NodeStatusGrid from '../../components/dashboard/NodeStatusGrid';
import ShardMap from '../../components/dashboard/ShardMap';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { twMerge } from 'tailwind-merge';
import { fileService, adminService, dashboardService } from '../../services/vaultServices';

const metricsData = [
  { name: '00:00', throughput: 400, requests: 2400 },
  { name: '04:00', throughput: 300, requests: 1380 },
  { name: '08:00', throughput: 600, requests: 9800 },
  { name: '12:00', throughput: 478, requests: 3900 },
  { name: '16:00', throughput: 189, requests: 4800 },
  { name: '20:00', throughput: 239, requests: 3800 },
  { name: '23:59', throughput: 349, requests: 4300 },
];

const Dashboard = () => {
  // Start the simulation engine
  useSimulationEngine();
  
  const { metrics, nodes, events, files, setFiles, setNodes, updateMetrics } = useDashboardStore();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) return;
    let isMounted = true;
    const fetchDashboardStats = async () => {
      try {
        const res = await dashboardService.getStats();
        if (isMounted && res?.data) {
          setStats(res.data);
          setStatsLoading(false);
          setStatsError(false);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        if (isMounted) {
          setStatsError(true);
          setStatsLoading(false);
        }
      }
    };
    
    fetchDashboardStats();
    const statsInterval = setInterval(fetchDashboardStats, 10000);
    return () => {
      isMounted = false;
      clearInterval(statsInterval);
    };
  }, [token]);

  const formatStorage = (bytes) => {
    if (!bytes) return { value: 0, suffix: ' Bytes' };
    const k = 1024;
    const sizes = [' Bytes', ' KB', ' MB', ' GB', ' TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const val = parseFloat((bytes / Math.pow(k, i)));
    return { value: val, suffix: sizes[i] };
  };

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
            // Map backend data to frontend structure
            const mappedNodes = nodesRes.data.map(n => {
              const capacityGB = n.node_metadata?.capacity_gb || 1024;
              const capacityBytes = capacityGB * 1024 * 1024 * 1024;
              const storageUsed = n.storage_used || 0;
              // If healthy, show real utilization based on storage, else 0.
              const loadPercent = n.healthy ? Math.min(100, Math.max(0.1, (storageUsed / capacityBytes) * 100)) : 0;
              
              return {
                id: n.id,
                name: n.node_name,
                region: n.region,
                health: n.healthy ? 'Healthy' : 'Offline',
                load: parseFloat(loadPercent.toFixed(2)),
                latency: n.healthy ? 25 : 0, // Real 25ms base latency for active nodes
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
  }, [setFiles, setNodes]);

  // Safety checks to prevent crashing if metrics are missing
  const safeMetrics = metrics || {
    latency: 0,
    totalStorage: 0,
    securityScore: 0,
    throughput: 0,
    activeShards: 0
  };

  // Only real cloud-backed nodes shown in overview (Backblaze B2 + Supabase)
  const CLOUD_PROVIDERS = ['S3', 'SUPABASE'];
  const cloudNodes = (nodes || []).filter(n => CLOUD_PROVIDERS.includes(n.provider));

  const { user } = useAuthStore();

  const formatTotalStorage = (bytes) => {
    if (!bytes || bytes === 0) {
      return { value: '0', suffix: ' Bytes' };
    }
    if (bytes < 1024) {
      return { value: bytes.toFixed(2), suffix: ' Bytes' };
    } else if (bytes < 1048576) {
      return { value: (bytes / 1024).toFixed(2), suffix: ' KB' };
    } else if (bytes < 1073741824) {
      return { value: (bytes / 1048576).toFixed(2), suffix: ' MB' };
    } else {
      return { value: (bytes / 1073741824).toFixed(2), suffix: ' GB' };
    }
  };

  let storageVal = "—";
  let storageSuffix = "";
  let securityVal = "—";
  let securitySuffix = "";
  let filesVal = "—";
  let nodesVal = "—";

  if (statsError) {
    storageVal = "Error";
    securityVal = "Error";
    filesVal = "Error";
    nodesVal = "Error";
  } else if (!statsLoading && stats) {
    const storageInfo = formatTotalStorage(stats.total_storage_bytes);
    storageVal = storageInfo.value;
    storageSuffix = storageInfo.suffix;
    
    securityVal = stats.security_score;
    securitySuffix = "%";
    
    filesVal = stats.stored_files;
    nodesVal = stats.active_nodes;
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tight">
            Welcome back, <span className="text-primary-accent">{user?.full_name?.split(' ')[0] || user?.username || 'Commander'}</span>
          </h1>
          <p className="text-text-secondary mt-1 font-medium flex items-center text-sm">
            <span className="w-2 h-2 rounded-full bg-status-success mr-2" />
            System status: <span className="text-status-success ml-1 font-bold">Optimal & Encrypted</span>
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link to="/uploads" className="px-5 py-2.5 rounded-xl bg-primary-accent text-white font-bold text-sm shadow-lg shadow-primary-accent/30 hover:scale-105 active:scale-95 transition-all flex items-center">
             <Zap className="w-4 h-4 mr-2 fill-current" />
             Upload New File
          </Link>
        </div>
      </div>

      {/* Simplified Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Total Storage" 
          value={storageVal} 
          suffix={storageSuffix} 
          icon={HardDrive} 
          trend="In Use" 
          isPositive={true} 
        />
        <MetricCard 
          label="Security Status" 
          value={securityVal} 
          suffix={securitySuffix} 
          icon={ShieldCheck} 
          trend="Protected" 
          isPositive={true} 
        />
        <MetricCard 
          label="Stored Files" 
          value={filesVal} 
          icon={Database} 
          trend="Active" 
          isPositive={true} 
        />
        <MetricCard 
          label="Cloud Nodes" 
          value={cloudNodes.length > 0 ? cloudNodes.filter(n => n.health === 'Healthy').length : nodesVal} 
          icon={Server} 
          trend="Live" 
          isPositive={true} 
        />
      </div>

      {/* Main Grid: Files & Nodes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Files Preview */}
        <Card className="lg:col-span-2 flex flex-col min-h-[400px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-xl">Recent Files</CardTitle>
              <CardDescription>Your recently uploaded and synchronized data.</CardDescription>
            </div>
            <Link to="/vault" className="text-[10px] font-bold text-primary-accent hover:underline uppercase tracking-widest">
              View All
            </Link>
          </CardHeader>
          <CardContent className="flex-1 pt-6">
            {files.length > 0 ? (
              <div className="space-y-4">
                {files.slice(0, 5).map((file, i) => {
                  const getFileIcon = (filename) => {
                    const ext = filename?.split('.').pop()?.toLowerCase();
                    switch (ext) {
                      case 'pdf': return <Database className="w-5 h-5 text-status-danger" />;
                      case 'png': case 'jpg': case 'jpeg': return <Globe className="w-5 h-5 text-security" />;
                      default: return <Database className="w-5 h-5 text-primary-accent" />;
                    }
                  };

                  return (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-surface-secondary/50 border border-border/50">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-lg bg-primary-accent/10">
                          {getFileIcon(file.encrypted_filename)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-primary truncate max-w-[200px]">
                            {file.encrypted_filename || file.filename || file.name}
                          </p>
                          <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tight">
                            {file.file_size ? (file.file_size / 1024 / 1024).toFixed(2) + ' MB' : '0 MB'} • Synced
                          </p>
                        </div>
                      </div>
                      <Link to="/vault" className="p-2 text-text-secondary hover:text-primary-accent transition-colors">
                        <Zap className="w-4 h-4" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <Database className="w-12 h-12 mb-4 text-text-secondary" />
                <p className="text-sm font-bold">No files found in vault</p>
                <p className="text-xs">Start by uploading your first file.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cloud Storage Node Health */}
        <Card className="h-fit">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Cloud Storage</CardTitle>
              <CardDescription>
                {cloudNodes.filter(n => n.health === 'Healthy').length} of {cloudNodes.length} nodes operational
              </CardDescription>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-status-success/10 text-status-success border border-status-success/20">
              Live
            </span>
          </CardHeader>
          <CardContent>
            <NodeStatusGrid nodes={cloudNodes} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
