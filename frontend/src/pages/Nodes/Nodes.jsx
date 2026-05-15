import React from 'react';
import { motion } from 'framer-motion';
import { 
  Server, 
  Globe, 
  Activity, 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  AlertTriangle,
  Zap,
  ArrowRight,
  Database
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const nodes = [
  { id: 'tyo-01', name: 'Tokyo Alpha', provider: 'AWS', region: 'ap-northeast-1', health: 'Healthy', uptime: '99.99%', load: '24%', shards: 2431, status: 'success' },
  { id: 'fra-02', name: 'Frankfurt Core', provider: 'GCP', region: 'eu-central-1', health: 'Healthy', uptime: '99.98%', load: '62%', shards: 1842, status: 'success' },
  { id: 'bom-01', name: 'Mumbai Primary', provider: 'Oracle', region: 'ap-south-1', health: 'Recovering', uptime: '98.45%', load: '12%', shards: 942, status: 'warning' },
  { id: 'sjc-04', name: 'San Jose Legacy', provider: 'Azure', region: 'us-west-2', health: 'Healthy', uptime: '99.99%', load: '45%', shards: 2109, status: 'success' },
  { id: 'sin-01', name: 'Singapore Edge', provider: 'DigitalOcean', region: 'ap-southeast-1', health: 'Healthy', uptime: '99.99%', load: '08%', shards: 1104, status: 'success' },
];

const Nodes = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Infrastructure Topology</h1>
          <p className="text-text-secondary mt-1">Global distribution of zero-knowledge storage nodes.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="success">5 Nodes Active</Badge>
          <Badge variant="outline">24 Regions Covered</Badge>
        </div>
      </div>

      {/* Interactive Topology Visualizer */}
      <Card className="bg-black/40 border-primary-accent/20 overflow-hidden">
        <CardContent className="p-0 h-[400px] relative flex items-center justify-center">
          {/* Animated Map Background (Simplified) */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <Globe className="w-full h-full text-primary-accent stroke-[0.5]" />
          </div>

          {/* Central Network Hub */}
          <div className="relative z-10">
            <div className="w-24 h-24 rounded-full bg-primary-accent/10 border-2 border-primary-accent flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)]">
              <Database className="w-10 h-10 text-primary-accent" />
            </div>
            
            {/* Connection Lines & Orbiting Nodes */}
            {nodes.map((node, i) => {
              const angle = (i * 360) / nodes.length;
              const distance = 140;
              const x = Math.cos((angle * Math.PI) / 180) * distance;
              const y = Math.sin((angle * Math.PI) / 180) * distance;

              return (
                <div key={node.id} className="absolute top-1/2 left-1/2" style={{ transform: `translate(${x}px, ${y}px)` }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative group cursor-pointer"
                  >
                    {/* Connection Line to Center */}
                    <div 
                      className="absolute top-1/2 left-1/2 origin-left h-[1px] bg-gradient-to-r from-primary-accent/50 to-transparent"
                      style={{ 
                        width: distance, 
                        transform: `translate(-50%, -50%) rotate(${angle + 180}deg)`,
                        zIndex: -1
                      }}
                    />

                    {/* Node Icon */}
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-2xl transition-all group-hover:scale-110 ${
                      node.status === 'success' ? 'bg-surface-elevated border-status-success/50 text-status-success' : 'bg-surface-elevated border-status-warning/50 text-status-warning'
                    }`}>
                      <Server className="w-6 h-6" />
                    </div>

                    {/* Tooltip on Hover */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 p-3 bg-surface-elevated border border-border rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 z-50">
                      <p className="text-xs font-bold text-text-primary uppercase">{node.name}</p>
                      <div className="flex justify-between mt-2 text-[10px] text-text-secondary">
                        <span>Load: {node.load}</span>
                        <span>Shards: {node.shards}</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-primary-accent" style={{ width: node.load }} />
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="absolute bottom-6 left-6 space-y-2">
            <div className="flex items-center space-x-2 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-status-success" />
              <span>Healthy Cluster</span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-status-warning" />
              <span>Syncing / Degraded</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Node Management List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nodes.map((node) => (
          <Card key={node.id} className="group hover:border-primary-accent/30 transition-all">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center border border-border">
                    <Server className={`w-5 h-5 ${node.status === 'success' ? 'text-status-success' : 'text-status-warning'}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{node.name}</CardTitle>
                    <CardDescription className="text-[10px] uppercase">{node.provider} · {node.region}</CardDescription>
                  </div>
                </div>
                <Badge variant={node.status === 'success' ? 'success' : 'warning'}>{node.health}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">Load Average</p>
                  <p className="text-lg font-bold text-text-primary">{node.load}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">Shard Count</p>
                  <p className="text-lg font-bold text-text-primary">{node.shards.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Uptime</span>
                  <span className="text-text-primary font-medium">{node.uptime}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Latency</span>
                  <span className="text-text-primary font-medium">12ms</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: node.load }}
                    className={`h-full ${node.status === 'success' ? 'bg-status-success' : 'bg-status-warning'}`} 
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                 <button className="text-[10px] font-bold text-primary-accent uppercase hover:underline flex items-center">
                   View Metrics <ArrowRight className="w-3 h-3 ml-1" />
                 </button>
                 <div className="flex -space-x-1">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-5 h-5 rounded-full bg-surface-elevated border border-border text-[8px] flex items-center justify-center font-bold">
                        {i}
                      </div>
                    ))}
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Node CTA */}
        <Card className="border-dashed flex flex-col items-center justify-center p-8 bg-transparent hover:bg-primary-accent/5 cursor-pointer group transition-all">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center mb-4 group-hover:border-primary-accent transition-colors">
            <Zap className="w-6 h-6 text-text-secondary group-hover:text-primary-accent" />
          </div>
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">Provision Node</h3>
          <p className="text-[10px] text-text-secondary mt-1">Scale your distributed cluster.</p>
        </Card>
      </div>
    </div>
  );
};

export default Nodes;
