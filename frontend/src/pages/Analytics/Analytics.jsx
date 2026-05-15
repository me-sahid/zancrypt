import React from 'react';
import { 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Globe, 
  Database, 
  ArrowUpRight,
  HardDrive
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';

const storageHistory = [
  { month: 'Jan', used: 400, capacity: 1000 },
  { month: 'Feb', used: 550, capacity: 1000 },
  { month: 'Mar', used: 600, capacity: 1000 },
  { month: 'Apr', used: 750, capacity: 1200 },
  { month: 'May', used: 890, capacity: 1200 },
];

const regionData = [
  { name: 'Tokyo', value: 45, color: '#3B82F6' },
  { name: 'Mumbai', value: 25, color: '#06B6D4' },
  { name: 'Frankfurt', value: 20, color: '#10B981' },
  { name: 'San Jose', value: 10, color: '#F59E0B' },
];

const Analytics = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Intelligence Dashboard</h1>
        <p className="text-text-secondary mt-1">Advanced data insights and lifecycle analytics for your vault cluster.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Storage Forecast */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Storage Utilization Over Time</CardTitle>
              <TrendingUp className="w-5 h-5 text-status-success" />
            </div>
            <CardDescription>Historical storage growth and dynamic capacity scaling.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storageHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar dataKey="used" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="capacity" fill="rgba(255,255,255,0.05)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Regional Distribution */}
        <Card>
          <CardHeader>
             <CardTitle>Data Locality</CardTitle>
             <CardDescription>Shard distribution by geographical region.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-6">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    formatter={(value) => <span className="text-[10px] text-text-secondary uppercase font-bold ml-1">{value}</span>}
                  />
                </PieChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {[
           { label: 'Ingestion Rate', value: '+45%', desc: 'Week-over-week growth in encrypted payloads.', icon: HardDrive },
           { label: 'Replication Cost', value: '$1.2k', desc: 'Estimated cross-region data transfer egress.', icon: Globe },
           { label: 'Shard Health', value: '99.98%', desc: 'Consistency level across all redundant nodes.', icon: Database },
         ].map((insight, i) => (
            <Card key={i} className="bg-surface-elevated/20">
               <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                     <div className="p-2 rounded-lg bg-primary-accent/10 text-primary-accent">
                        <insight.icon className="w-5 h-5" />
                     </div>
                     <p className="text-xs font-bold text-text-primary uppercase tracking-widest">{insight.label}</p>
                  </div>
                  <h3 className="text-3xl font-bold text-text-primary flex items-baseline">
                     {insight.value}
                     <ArrowUpRight className="w-4 h-4 ml-2 text-status-success" />
                  </h3>
                  <p className="text-xs text-text-secondary mt-2 leading-relaxed">{insight.desc}</p>
               </CardContent>
            </Card>
         ))}
      </div>
    </div>
  );
};

export default Analytics;
