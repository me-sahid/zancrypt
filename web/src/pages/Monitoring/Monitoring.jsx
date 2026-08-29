import React from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Activity, Zap, Shield, Database } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const mockData = Array.from({ length: 24 }).map((_, i) => ({
  time: `${i}:00`,
  cpu: 40 + Math.random() * 30,
  memory: 50 + Math.random() * 20,
  latency: 20 + Math.random() * 40,
  throughput: 200 + Math.random() * 300,
}));

const Monitoring = () => {
  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-4xl font-black text-text-primary tracking-tight">Observability Center</h1>
        <p className="text-text-secondary mt-1 font-medium">Real-time telemetry and infrastructure performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latency & Throughput */}
        <Card className="h-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 text-primary-accent mr-2" />
              Network Latency (ms)
            </CardTitle>
            <CardDescription>Average response time across all distributed nodes.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="latency" stroke="#3B82F6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="h-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 text-status-success mr-2" />
              Resource Utilization
            </CardTitle>
            <CardDescription>Aggregate CPU and Memory usage across the network.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                   itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#10B981" fillOpacity={1} fill="url(#colorCpu)" />
                <Area type="monotone" dataKey="memory" stroke="#F59E0B" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
               <Database className="w-5 h-5 text-primary-accent mr-2" />
               Shard Replication Throughput
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                     cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="throughput" fill="#3B82F6" radius={[4, 4, 0, 0]} />
               </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
           <CardHeader>
              <CardTitle className="flex items-center">
                 <Shield className="w-5 h-5 text-status-danger mr-2" />
                 Integrity Status
              </CardTitle>
           </CardHeader>
           <CardContent className="space-y-6">
              {[
                { label: 'Verified Shards', value: '100%', status: 'success' },
                { label: 'Sync Failures', value: '0', status: 'success' },
                { label: 'Replication Queue', value: '12', status: 'warning' },
                { label: 'Audit Compliance', value: 'AAA', status: 'success' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-surface-elevated/30 border border-border/50">
                   <p className="text-xs font-bold text-text-secondary uppercase">{item.label}</p>
                   <span className={twMerge(
                     "text-sm font-black",
                     item.status === 'success' ? "text-status-success" : "text-status-warning"
                   )}>{item.value}</span>
                </div>
              ))}
           </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Monitoring;
