import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';

const TrafficChart = ({ data, title, description }) => {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255,255,255,0.03)" 
            vertical={false} 
          />
          <XAxis 
            dataKey="name" 
            stroke="#475569" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#475569" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `${value}mb`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.9)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '12px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }} 
            itemStyle={{ color: '#fff' }}
            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
          />
          <Area 
            type="monotone" 
            dataKey="throughput" 
            stroke="#3B82F6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorPrimary)" 
            animationDuration={2000}
          />
          <Area 
            type="monotone" 
            dataKey="requests" 
            stroke="#10B981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorSecondary)" 
            animationDuration={2500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrafficChart;
