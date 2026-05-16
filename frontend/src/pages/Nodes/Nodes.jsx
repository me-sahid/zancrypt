import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, ShieldCheck, Activity, Globe, Cpu, HardDrive, RefreshCw, Power, AlertTriangle, Zap } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { nodeService } from '../../services/vaultServices';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { twMerge } from 'tailwind-merge';
import { toast } from 'react-hot-toast';

const Nodes = () => {
  const { nodes, setNodes } = useDashboardStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNodes = async () => {
    setIsRefreshing(true);
    try {
      const res = await nodeService.getNodes();
      if (res?.data) {
        const mappedNodes = res.data.map(n => ({
          id: n.id,
          name: n.node_name,
          region: n.region,
          health: n.healthy ? 'Healthy' : 'Offline',
          load: Math.floor(Math.random() * 30) + (n.healthy ? 10 : 0),
          latency: n.healthy ? Math.floor(Math.random() * 100) + 20 : 0,
          shards: (n.shards || []).length,
          provider: n.provider,
          status: n.healthy ? 'success' : 'danger',
          isHealthy: n.healthy
        }));
        setNodes(mappedNodes);
      }
    } catch (error) {
      toast.error('Failed to synchronize infrastructure data');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNodes();
    const interval = setInterval(fetchNodes, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleNode = async (nodeId, currentStatus) => {
    try {
      await nodeService.toggleNode(nodeId, !currentStatus);
      toast.success(`Infrastructure Node ${!currentStatus ? 'Activated' : 'Suspended'}`);
      fetchNodes();
    } catch (error) {
      toast.error('Failed to update node status');
    }
  };

  const healthyCount = nodes.filter(n => n.isHealthy).length;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tight">Infrastructure Management</h1>
          <p className="text-text-secondary mt-1 font-medium">Control and monitor your local distributed Zancrypt cluster.</p>
        </div>
        <button 
          onClick={fetchNodes}
          className={twMerge(
            "p-2 rounded-xl bg-surface-secondary border border-border hover:bg-surface-elevated transition-all",
            isRefreshing && "animate-spin"
          )}
        >
          <RefreshCw className="w-5 h-5 text-text-secondary" />
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-primary-accent/5 border-primary-accent/20">
          <CardContent className="p-6">
            <Server className="w-8 h-8 text-primary-accent mb-4" />
            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Total Cluster Nodes</p>
            <p className="text-3xl font-black text-text-primary">{nodes.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-status-success/5 border-status-success/20">
          <CardContent className="p-6">
            <ShieldCheck className="w-8 h-8 text-status-success mb-4" />
            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Active & Operational</p>
            <p className="text-3xl font-black text-text-primary">{healthyCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-status-danger/5 border-status-danger/20">
          <CardContent className="p-6">
            <AlertTriangle className="w-8 h-8 text-status-danger mb-4" />
            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Offline / Degraded</p>
            <p className="text-3xl font-black text-text-primary">{nodes.length - healthyCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-status-warning/5 border-status-warning/20">
          <CardContent className="p-6">
            <Zap className="w-8 h-8 text-status-warning mb-4" />
            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Replication Factor</p>
            <p className="text-3xl font-black text-text-primary">x2</p>
          </CardContent>
        </Card>
      </div>

      {/* Node Grid */}
      <div className="grid grid-cols-1 gap-6">
        {nodes.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={twMerge(
              "p-8 rounded-3xl border transition-all relative overflow-hidden group",
              node.isHealthy 
                ? "bg-surface-secondary/40 border-border/50 hover:border-primary-accent/30" 
                : "bg-status-danger/5 border-status-danger/20 opacity-80"
            )}
          >
            {/* Background Glow */}
            <div className={twMerge(
              "absolute -right-20 -top-20 w-64 h-64 blur-[120px] rounded-full transition-opacity duration-1000",
              node.isHealthy ? "bg-primary-accent/10 opacity-50" : "bg-status-danger/20 opacity-100"
            )} />

            <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">
              <div className="flex items-center space-x-6">
                <div className={twMerge(
                  "w-20 h-20 rounded-3xl flex items-center justify-center border transition-all shadow-xl",
                  node.isHealthy ? "bg-surface-elevated border-border text-primary-accent" : "bg-status-danger/10 border-status-danger/30 text-status-danger"
                )}>
                  <Server className="w-10 h-10" />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-2xl font-black text-text-primary tracking-tight">{node.name}</h3>
                    <Badge variant={node.status === 'success' ? 'success' : 'danger'}>{node.health}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] text-text-secondary uppercase font-bold tracking-widest">
                    <span className="flex items-center px-2 py-1 rounded bg-white/5"><Globe className="w-3 h-3 mr-1.5" /> {node.region}</span>
                    <span className="flex items-center px-2 py-1 rounded bg-white/5"><HardDrive className="w-3 h-3 mr-1.5" /> {node.provider}</span>
                    {node.isHealthy && (
                      <span className="flex items-center text-primary-accent px-2 py-1 rounded bg-primary-accent/10"><Activity className="w-3 h-3 mr-1.5" /> {node.latency}ms</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 flex-1 w-full xl:max-w-3xl">
                 <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase text-text-secondary tracking-widest">
                      <span>Node Utilization</span>
                      <span className={node.isHealthy ? "text-primary-accent" : "text-status-danger"}>{node.isHealthy ? `${node.load}%` : 'OFFLINE'}</span>
                    </div>
                    <div className="h-2 bg-surface-elevated rounded-full overflow-hidden border border-white/5">
                       <motion.div 
                         initial={{ width: 0 }} 
                         animate={{ width: node.isHealthy ? `${node.load}%` : 0 }} 
                         className={twMerge("h-full transition-all", node.isHealthy ? "bg-primary-accent shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-status-danger")} 
                       />
                    </div>
                 </div>

                 <div className="flex items-center space-x-8">
                    <div>
                      <p className="text-[10px] text-text-secondary font-bold uppercase mb-1">Stored Shards</p>
                      <p className="text-xl font-black text-text-primary">{node.isHealthy ? node.shards : '--'}</p>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div>
                      <p className="text-[10px] text-text-secondary font-bold uppercase mb-1">Local Latency</p>
                      <p className="text-xl font-black text-text-primary">{node.isHealthy ? `${node.latency}ms` : 'Inf'}</p>
                    </div>
                 </div>

                 <div className="flex items-center justify-end space-x-4">
                    <button 
                      onClick={() => handleToggleNode(node.id, node.isHealthy)}
                      className={twMerge(
                        "flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl",
                        node.isHealthy 
                          ? "bg-status-danger/10 text-status-danger border border-status-danger/20 hover:bg-status-danger/20" 
                          : "bg-status-success/10 text-status-success border border-status-success/20 hover:bg-status-success/20"
                      )}
                    >
                       <Power className="w-4 h-4" />
                       <span>{node.isHealthy ? 'Suspend Node' : 'Activate Node'}</span>
                    </button>
                 </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Nodes;
