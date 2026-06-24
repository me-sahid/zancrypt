import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RiAddLargeLine } from 'react-icons/ri';
import { 
  Server, 
  Database,
  Activity,
  FileText,
  Share2,
  HardDrive,
  Zap
} from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { useAuthStore } from '../../store/useStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useSimulationEngine } from '../../hooks/useSimulationEngine';
import MetricCard from '../../components/dashboard/MetricCard';
import { fileService, adminService, shareService } from '../../services/vaultServices';
import DashboardSkeleton from '../../components/skeletons/DashboardSkeleton';
import { useUploadStore } from '../../store/useUploadStore';

// --- Real-time Node Shard Distribution Panel ---
const NodeShardPanel = ({ nodes, uploadQueue }) => {
  // Build a live map of which nodes have which file shards
  // nodes come from the store; uploadQueue gives live uploading progress

  // Monochrome white palette — no colored accents
  const NODE_STYLE = {
    dot:   '#e2e8f0',
    bar:   '#cbd5e1',
    badge: 'rgba(226,232,240,0.08)',
    text:  '#e2e8f0',
    muted: '#94a3b8',
  };

  const getColor = () => NODE_STYLE;

  const activeUploads = (uploadQueue || []).filter(f => f.status === 'uploading');

  return (
    <div className="grid grid-cols-1 gap-2">
      {(!nodes || nodes.length === 0) && (
        <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
          <Server className="w-8 h-8 mb-3 text-text-muted" />
          <p className="font-mono text-xs text-text-muted uppercase tracking-widest">No nodes found</p>
        </div>
      )}

      {(nodes || []).map((node, i) => {
        const colors = getColor();
        const isOnline = node.health === 'Healthy';

        // Find uploads going through this node (by shards/provider match)
        const liveUpload = activeUploads.find(() => true); // all active uploads distribute across all nodes

        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex flex-col gap-2 p-3 border border-border bg-void hover:bg-surface-raised transition-colors"
          >
            {/* Node header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {/* Status dot — no blinking */}
                <span
                  className="flex-shrink-0 w-2 h-2 rounded-full"
                  style={{ backgroundColor: isOnline ? colors.dot : '#475569' }}
                />
                <span className="font-mono text-[11px] text-white truncate">{node.name}</span>
              </div>

              {/* Provider badge */}
              <span
                className="flex-shrink-0 font-mono text-[10px] uppercase tracking-widest px-2 py-0.5"
                style={{ color: colors.text, backgroundColor: colors.badge }}
              >
                {node.provider}
              </span>
            </div>

            {/* File parts bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">
                  File Parts
                </span>
                <span className="font-mono text-[10px] text-white">
                  {isOnline ? `${node.shards || 0} shards` : 'OFFLINE'}
                </span>
              </div>

              {/* Load bar */}
              <div className="h-1 bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: isOnline ? colors.bar : '#334155' }}
                  initial={{ width: 0 }}
                  animate={{ width: isOnline ? `${Math.max(2, node.load || 0)}%` : '100%' }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.05 }}
                />
              </div>

              {/* Live upload indicator */}
              <AnimatePresence>
                {liveUpload && isOnline && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-1.5 pt-0.5"
                  >
                    <Zap className="w-2.5 h-2.5 flex-shrink-0 text-white/70" />
                    <div className="flex-1 h-0.5 bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full bg-white/60"
                        animate={{ width: [`${liveUpload.progress}%`, `${Math.min(100, liveUpload.progress + 3)}%`] }}
                        transition={{ duration: 0.3, ease: 'linear' }}
                      />
                    </div>
                    <span className="font-mono text-[10px]" style={{ color: colors.dot }}>
                      {liveUpload.progress}%
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Region */}
            <p className="font-mono text-[10px] text-white/40 truncate">{node.region}</p>
          </motion.div>
        );
      })}
    </div>
  );
};

const Dashboard = () => {
  useSimulationEngine();
  
  const { metrics, nodes, files, setFiles, setNodes, updateMetrics } = useDashboardStore();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const { uploadQueue } = useUploadStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeShares, setActiveShares] = React.useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const [filesResult, nodesResult, metricsResult, sharesResult] = await Promise.allSettled([
          fileService.listFiles(),
          adminService.getNodes(),
          adminService.getSystemMetrics(),
          shareService.listShares(),
        ]);

        if (isMounted) {
          if (filesResult.status === 'fulfilled' && filesResult.value?.data) {
            setFiles(filesResult.value.data);
          } else if (filesResult.status === 'rejected') {
            console.error('Failed to fetch files:', filesResult.reason);
          }

          if (sharesResult.status === 'fulfilled' && sharesResult.value?.data) {
            const now = new Date();
            const active = sharesResult.value.data.filter(s => {
              if (!s.is_active) return false;
              if (s.expires_at && new Date(s.expires_at) < now) return false;
              return true;
            });
            setActiveShares(active.length);
          }

          if (metricsResult.status === 'fulfilled' && metricsResult.value?.data) {
            const data = metricsResult.value.data;
            updateMetrics({
              totalStorage: data.total_storage_bytes || 0,
              securityScore: 100,
              networkHealth: data.network_health_score,
              activeShards: data.total_files * 4,
            });
          } else if (metricsResult.status === 'rejected') {
            console.error('Failed to fetch metrics:', metricsResult.reason);
          }

          if (nodesResult.status === 'fulfilled' && nodesResult.value?.data) {
            const data = nodesResult.value.data;
            const mappedNodes = data.map(n => {
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
                isCloudNode: ['S3', 'SUPABASE', 'STORJ'].includes(n.provider)
              };
            });
            setNodes(mappedNodes);
          } else if (nodesResult.status === 'rejected') {
            console.error('Failed to fetch nodes:', nodesResult.reason);
          }
        }
      } catch (error) {
        console.error('Failed to fetch initial stats:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => { 
      isMounted = false; 
      clearInterval(interval);
    };
  }, [setFiles, setNodes, updateMetrics]);

  // Safety checks to prevent crashing if metrics are missing
  const safeMetrics = metrics || {
    latency: 0,
    totalStorage: 0,
    securityScore: 100,
    throughput: 0,
    activeShards: 0
  };

  // Only real cloud-backed nodes shown in overview (Backblaze B2 + Supabase)
  const CLOUD_PROVIDERS = ['S3', 'SUPABASE', 'STORJ'];
  const cloudNodes = (nodes || []).filter(n => CLOUD_PROVIDERS.includes(n.provider));

  const liveNodesCount = nodes ? nodes.filter(n => n.health === 'Healthy').length : 0;
  const activeNodesCount = cloudNodes.length > 0
    ? cloudNodes.filter(n => n.health === 'Healthy').length
    : liveNodesCount;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4 md:pb-6">
        <div>
          <h1 className="font-mono text-2xl text-text-primary tracking-widest uppercase">
            {t('dashboard', 'title')}
          </h1>
          <p className="text-text-muted mt-2 font-mono text-xs uppercase tracking-widest">
            {t('dashboard', 'welcome')}, {user?.full_name?.split(' ')[0] || user?.username || 'Operator'}
          </p>
        </div>
        
        <Link
          to="/uploads"
          className="inline-flex items-center gap-2 px-5 py-2.5 w-full md:w-auto justify-center border border-accent text-accent font-mono text-xs uppercase tracking-widest hover:bg-accent/10 transition-colors"
        >
          <RiAddLargeLine className="w-4 h-4" />
          New
        </Link>
      </div>

      {/* Stats Cards — flex row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <MetricCard
          label="Active Shares"
          value={activeShares}
          icon={Share2}
          trend="LIVE"
          isPositive={true}
          className="flex-1"
        />
        <MetricCard
          label={t('dashboard', 'encryptedItems')}
          value={files ? files.length : 0}
          icon={Database}
          className="flex-1"
        />
        <MetricCard
          label={t('dashboard', 'activeNodes')}
          value={activeNodesCount}
          icon={Server}
          trend="ONLINE"
          isPositive={true}
          className="flex-1"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Files Preview */}
        <div className="lg:col-span-2 flex flex-col bg-surface border border-border h-[400px]">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="font-mono text-[11px] uppercase tracking-widest text-text-muted flex items-center">
              <FileText className="w-3.5 h-3.5 mr-2" />
              {t('dashboard', 'recentFiles')}
            </div>
            <Link to="/vault" className="text-accent hover:underline font-mono text-xs uppercase tracking-widest">
              {t('dashboard', 'viewLog')}
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
                        <p className="font-mono text-[11px] text-text-muted">
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
                <p className="font-mono text-xs text-text-muted uppercase tracking-widest">{t('dashboard', 'vaultEmpty')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Node File Distribution — Real-time */}
        <div className="bg-surface border border-border h-[400px] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="font-mono text-[11px] uppercase tracking-widest text-text-muted flex items-center">
              <Activity className="w-3.5 h-3.5 mr-2" />
              Node Distribution
            </div>
            {uploadQueue.some(f => f.status === 'uploading') && (
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="font-mono text-[10px] text-accent uppercase tracking-widest">Live</span>
              </motion.div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            <NodeShardPanel nodes={cloudNodes.length > 0 ? cloudNodes : nodes} uploadQueue={uploadQueue} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
