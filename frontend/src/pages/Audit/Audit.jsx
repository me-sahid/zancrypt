import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { History, Search, Filter } from 'lucide-react';

const Audit = () => (
  <div className="space-y-8">
    <div className="flex justify-between items-center">
      <h1 className="text-4xl font-black text-text-primary tracking-tight">System Audit Logs</h1>
      <div className="flex space-x-3">
         <button className="p-2 rounded-lg bg-surface-elevated border border-border"><Filter className="w-4 h-4" /></button>
         <button className="p-2 rounded-lg bg-surface-elevated border border-border"><Search className="w-4 h-4" /></button>
      </div>
    </div>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><History className="w-5 h-5 mr-2 text-primary-accent" /> Infrastructure Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
               <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded bg-surface-elevated flex items-center justify-center text-[10px] font-bold text-text-secondary">{i}</div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">System Integrity Scan #{1024 + i}</p>
                    <p className="text-[10px] text-text-secondary uppercase">2h ago · AUTOMATED · TOKYO-ALPHA</p>
                  </div>
               </div>
               <span className="text-[10px] font-black text-status-success uppercase tracking-widest">SUCCESS</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default Audit;
