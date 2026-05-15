import React from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  Globe, 
  Zap, 
  Clock, 
  BarChart3, 
  Server,
  Terminal,
  RefreshCcw,
  Wifi
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const performanceData = [
  { time: '10:00', latency: 42, requests: 2400, cpu: 12 },
  { time: '10:15', latency: 38, requests: 1398, cpu: 15 },
  { time: '10:30', latency: 65, requests: 9800, cpu: 45 },
  { time: '10:45', latency: 44, requests: 3908, cpu: 22 },
  { time: '11:00', latency: 32, requests: 4800, cpu: 18 },
  { time: '11:15', latency: 40, requests: 3800, cpu: 14 },
  { time: '11:30', latency: 35, requests: 4300, cpu: 11 },
];

const Monitoring = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">System Telemetry</h1>
          <p className="text-text-secondary mt-1">Full-stack observability for the distributed vault network.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="animate-pulse">
            <Wifi className="w-3 h-3 mr-1 text-status-success" />
            Live Stream
          </Badge>
          <Button variant="outline" size="sm" leftIcon={<RefreshCcw className="w-4 h-4" />}>
            Force Refresh
          </Button>
        </div>
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Avg Latency', value: '42ms', icon: zap, status: 'Optimal' },
          { label: 'Request Vol', value: '1.2M/hr', icon: BarChart3, status: 'Peak' },
          { label: 'Node Uptime', value: '99.998%', icon: Server, status: 'High' },
          { label: 'Worker Health', value: 'Healthy', icon: Cpu, status: 'Verified' },
        ].map((stat, i) => (
          <Card key={i} className="bg-surface-secondary/20">
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-surface-elevated border border-border">
                <stat.icon className="w-5 h-5 text-primary-accent" />
              </div>
              <div>
                <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest leading-none mb-1">{stat.label}</p>
                <div className="flex items-baseline space-x-2">
                   <h3 className="text-xl font-bold text-text-primary">{stat.value}</h3>
                   <span className="text-[10px] text-status-success font-bold">{stat.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latency & CPU Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Core Latency vs CPU</CardTitle>
            <CardDescription>Correlation between request processing time and node utilization.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }}
                />
                <Line type="monotone" dataKey="latency" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4, fill: '#3B82F6' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="cpu" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Request Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Global Ingestion Volume</CardTitle>
            <CardDescription>Total encrypted shards processed by the edge workers.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="requests" stroke="#06B6D4" fillOpacity={1} fill="url(#colorRequests)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Technical Infrastructure Log Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 overflow-hidden">
           <CardHeader className="bg-surface-elevated/20">
              <div className="flex items-center space-x-2">
                 <Terminal className="w-4 h-4 text-text-secondary" />
                 <CardTitle className="text-sm">Edge Worker Logs</CardTitle>
              </div>
           </CardHeader>
           <CardContent className="p-0">
              <div className="bg-black/40 font-mono text-[10px] p-4 h-[240px] overflow-y-auto space-y-1 custom-scrollbar">
                 <p className="text-text-secondary">[10:42:01] <span className="text-status-success">INFO</span>: Shard 0xAF92 distributed to ap-northeast-1.</p>
                 <p className="text-text-secondary">[10:42:05] <span className="text-status-success">INFO</span>: Key rotation successful for cluster BOM-01.</p>
                 <p className="text-text-secondary">[10:43:12] <span className="text-status-warning">WARN</span>: High latency detected on EU-Central-1 edge node.</p>
                 <p className="text-text-secondary">[10:43:15] <span className="text-status-success">INFO</span>: Auto-scaling edge worker group (size: 14).</p>
                 <p className="text-text-secondary">[10:44:00] <span className="text-primary-accent">SYNC</span>: Initializing global state reconciliation.</p>
                 <p className="text-text-secondary">[10:45:10] <span className="text-status-success">INFO</span>: Shard integrity verified (hash: 4f2a...c3d1).</p>
                 <p className="text-text-secondary">[10:45:12] <span className="text-status-success">INFO</span>: Garbage collection completed (Redis cluster-A).</p>
                 <p className="text-text-secondary">[10:46:00] <span className="text-status-success">INFO</span>: Heartbeat received from Tokyo-Alpha.</p>
              </div>
           </CardContent>
        </Card>

        {/* Worker Queue Status */}
        <Card>
          <CardHeader>
            <CardTitle>Queue Status</CardTitle>
            <CardDescription>Shard processing backlog telemetry.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             {[
               { name: 'Encryption Queue', count: 0, load: '0%', status: 'success' },
               { name: 'Node Replication', count: 12, load: '24%', status: 'success' },
               { name: 'Integrity Check', count: 450, load: '88%', status: 'warning' },
             ].map((q, i) => (
               <div key={i} className="space-y-2">
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                   <span className="text-text-primary">{q.name}</span>
                   <span className="text-text-secondary">{q.count} items</span>
                 </div>
                 <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: q.load }}
                      className={`h-full ${q.status === 'success' ? 'bg-primary-accent' : 'bg-status-warning'}`} 
                    />
                 </div>
               </div>
             ))}
             <div className="pt-4 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs text-text-secondary uppercase tracking-widest mb-2 font-bold">Health Status</p>
                  <div className="flex items-center space-x-1">
                    {[1,1,1,1,1,1,1,1,0,1,1,1,1].map((h, i) => (
                      <div key={i} className={`w-1.5 h-6 rounded-sm ${h ? 'bg-status-success' : 'bg-status-warning'}`} />
                    ))}
                  </div>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Simplified icon mapping helper
const zap = Zap;

export default Monitoring;
