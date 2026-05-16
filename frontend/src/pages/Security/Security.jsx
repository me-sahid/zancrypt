import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, Key, Fingerprint, Eye, Lock, Zap } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import SecurityFeed from '../../components/dashboard/SecurityFeed';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import MetricCard from '../../components/dashboard/MetricCard';
import { twMerge } from 'tailwind-merge';
import Badge from '../../components/ui/Badge';

const Security = () => {
  const { events } = useDashboardStore();

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-4xl font-black text-text-primary tracking-tight">Security Command Center</h1>
        <p className="text-text-secondary mt-1 font-medium">Cryptographic integrity monitoring and access control oversight.</p>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Security Score" value={98} suffix="%" icon={Shield} trend="Healthy" isPositive={true} />
        <MetricCard label="Active Threats" value={0} icon={ShieldAlert} trend="None Detected" isPositive={true} />
        <MetricCard label="Keys Rotated" value={14} icon={Key} trend="30d average" isPositive={true} />
        <MetricCard label="MFA Logins" value={1240} icon={Fingerprint} trend="+15%" isPositive={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Security Logs Deep Dive */}
        <Card className="lg:col-span-2">
          <CardHeader>
             <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 text-primary-accent mr-2" />
                Live Integrity Monitoring
             </CardTitle>
             <CardDescription>Streaming security logs from the distributed network.</CardDescription>
          </CardHeader>
          <CardContent>
             <SecurityFeed events={events} />
          </CardContent>
        </Card>

        {/* Security Controls */}
        <div className="space-y-8">
           <Card className="bg-primary-accent/5 border-primary-accent/20">
              <CardHeader>
                 <CardTitle className="text-primary-accent">Encryption Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-text-secondary uppercase">Master Key</span>
                    <Badge variant="success">Active</Badge>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-text-secondary uppercase">Shard Keys</span>
                    <Badge variant="success">Distributed</Badge>
                 </div>
                 <div className="pt-4">
                    <button className="w-full py-2 rounded-lg bg-primary-accent text-white font-bold text-xs uppercase tracking-[0.1em] shadow-lg shadow-primary-accent/20">
                       Initiate Key Rotation
                    </button>
                 </div>
              </CardContent>
           </Card>

           <Card>
              <CardHeader>
                 <CardTitle>Threat Intelligence</CardTitle>
                 <CardDescription>Global attack vector analysis.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-status-success" />
                    <p className="text-xs font-medium text-text-secondary truncate">Zero suspicious patterns in last 24h.</p>
                 </div>
                 <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-status-success" />
                    <p className="text-xs font-medium text-text-secondary truncate">All 5 regions reporting 100% integrity.</p>
                 </div>
                 <div className="pt-4">
                    <div className="aspect-video bg-surface-elevated rounded-xl border border-border flex items-center justify-center">
                       <Zap className="w-12 h-12 text-primary-accent opacity-20" />
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default Security;
