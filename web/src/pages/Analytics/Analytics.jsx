import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { PieChart, TrendingUp, BarChart3 } from 'lucide-react';

const Analytics = () => (
  <div className="space-y-8">
    <h1 className="text-4xl font-black text-text-primary tracking-tight">Infrastructure Analytics</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center"><PieChart className="w-5 h-5 mr-2 text-primary-accent" /> Storage Growth</CardTitle></CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-text-secondary">Analytics processing...</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-status-success" /> Replication Trends</CardTitle></CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-text-secondary">Analyzing trends...</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center"><BarChart3 className="w-5 h-5 mr-2 text-status-warning" /> Traffic Distribution</CardTitle></CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-text-secondary">Calculating metrics...</CardContent>
      </Card>
    </div>
  </div>
);

export default Analytics;
