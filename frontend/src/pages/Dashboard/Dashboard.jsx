import React from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Server, 
  ShieldCheck, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock,
  Globe,
  HardDrive
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { twMerge } from 'tailwind-merge';

const metricsData = [
  { name: '00:00', throughput: 400, requests: 240 },
  { name: '04:00', throughput: 300, requests: 138 },
  { name: '08:00', throughput: 200, requests: 980 },
  { name: '12:00', throughput: 278, requests: 390 },
  { name: '16:00', throughput: 189, requests: 480 },
  { name: '20:00', throughput: 239, requests: 380 },
  { name: '23:59', throughput: 349, requests: 430 },
];

const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">System Overview</h1>
        <p className="text-text-secondary mt-1">Real-time status of your distributed vault infrastructure.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Vault Capacity', value: '1.2 TB', icon: HardDrive, trend: '+12%', isPositive: true },
          { label: 'Security Score', value: '98/100', icon: ShieldCheck, trend: 'Optimal', isPositive: true },
          { label: 'Network Throughput', value: '450 Mbps', icon: Activity, trend: '-5%', isPositive: false },
          { label: 'Active Shards', value: '8,432', icon: Database, trend: '+240', isPositive: true },
        ].map((stat, i) => (
          <Card key={i} className="group hover:border-primary-accent/30">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-surface-elevated text-text-secondary group-hover:text-primary-accent transition-colors border border-border">
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className={twMerge(
                  'flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border',
                  stat.isPositive ? 'text-status-success bg-status-success/10 border-status-success/20' : 'text-status-warning bg-status-warning/10 border-status-warning/20'
                )}>
                  {stat.isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {stat.trend}
                </div>
              </div>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold text-text-primary mt-1 tracking-tight">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Network Analytics Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Network Traffic</CardTitle>
            <CardDescription>Global request volume and shard distribution throughput.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricsData}>
                <defs>
                  <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94A3B8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94A3B8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `${value}mb`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="throughput" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorThroughput)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Global Node Health */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Active Nodes</CardTitle>
              <Badge variant="success">All Online</Badge>
            </div>
            <CardDescription>Distributed storage cluster status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Tokyo-Alpha', region: 'ap-northeast-1', health: 'Healthy', load: '12%', status: 'success' },
              { name: 'Frankfurt-01', region: 'eu-central-1', health: 'Syncing', load: '85%', status: 'warning' },
              { name: 'US-West-Legacy', region: 'us-west-2', health: 'Healthy', load: '44%', status: 'success' },
              { name: 'Mumbai-Primary', region: 'ap-south-1', health: 'Healthy', load: '05%', status: 'success' },
            ].map((node, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated/30 border border-border/50">
                <div className="flex items-center space-x-3">
                  <div className={twMerge(
                    'w-2 h-2 rounded-full',
                    node.status === 'success' ? 'bg-status-success' : 'bg-status-warning'
                  )} />
                  <div>
                    <p className="text-sm font-bold text-text-primary">{node.name}</p>
                    <p className="text-[10px] text-text-secondary uppercase">{node.region}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-text-primary">{node.load}</p>
                  <p className="text-[10px] text-text-secondary">{node.health}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Security Events</CardTitle>
            <CardDescription>Recent cryptographic and access control logs.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-border">
              {[
                { event: 'Encryption Key Rotation', time: '12m ago', user: 'System', severity: 'low' },
                { event: 'Suspicious IP Blocked', time: '45m ago', user: 'Firewall', severity: 'danger' },
                { event: 'Root Access Login', time: '1h ago', user: 'Admin', severity: 'warning' },
                { event: 'Integrity Check Passed', time: '2h ago', user: 'Auditor', severity: 'success' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-text-secondary" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{log.event}</p>
                      <p className="text-[10px] text-text-secondary uppercase tracking-tight">{log.user} · {log.time}</p>
                    </div>
                  </div>
                  <Badge variant={log.severity === 'danger' ? 'danger' : log.severity === 'warning' ? 'warning' : 'default'}>
                    {log.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shard Distribution Status */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Shards</CardTitle>
            <CardDescription>Live distribution of file chunks across the network.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-2">
              {Array.from({ length: 48 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    opacity: [0.3, 1, 0.3],
                    backgroundColor: i % 7 === 0 ? '#F59E0B' : '#10B981'
                  }}
                  transition={{ 
                    duration: Math.random() * 3 + 2, 
                    repeat: Infinity,
                    delay: Math.random() * 2 
                  }}
                  className="h-3 rounded-sm bg-status-success/20"
                  title={`Shard ${i + 1024}: Healthy`}
                />
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between text-[10px] text-text-secondary font-bold uppercase tracking-widest">
              <span>Shard Cluster 0xFA...92</span>
              <span>Total: 8,432 Healthy</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
