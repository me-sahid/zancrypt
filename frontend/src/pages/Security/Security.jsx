import React from 'react';
import { Shield, ShieldAlert, Key, Fingerprint, Eye, Lock, Zap } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import SecurityFeed from '../../components/dashboard/SecurityFeed';
import MetricCard from '../../components/dashboard/MetricCard';

const Security = () => {
  const { events } = useDashboardStore();

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-mono text-2xl text-text-primary tracking-widest uppercase flex items-center">
            <Shield className="w-5 h-5 mr-3 text-accent" />
            Security Command Center
          </h1>
          <p className="text-text-muted mt-2 font-mono text-xs uppercase tracking-widest">
            Cryptographic integrity monitoring & access control oversight
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Security Score" value={98} suffix="%" icon={Shield} trend="Healthy" isPositive={true} />
        <MetricCard label="Active Threats" value={0} icon={ShieldAlert} trend="None Detected" isPositive={true} />
        <MetricCard label="Keys Rotated" value={14} icon={Key} trend="30d average" isPositive={true} />
        <MetricCard label="MFA Logins" value={1240} icon={Fingerprint} trend="+15%" isPositive={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Logs */}
        <div className="lg:col-span-2 bg-surface border border-border flex flex-col">
          <div className="p-4 border-b border-border bg-surface-raised flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Eye className="w-4 h-4 text-accent" />
              <h3 className="font-mono text-xs text-text-primary uppercase tracking-widest">Live Integrity Monitoring</h3>
            </div>
            <span className="text-[11px] font-mono text-accent uppercase tracking-widest animate-pulse flex items-center">
              <span className="w-1.5 h-1.5 bg-accent mr-1.5" /> Streaming
            </span>
          </div>
          <div className="p-0 flex-1 bg-void">
            <SecurityFeed events={events} />
          </div>
        </div>

        {/* Security Controls */}
        <div className="space-y-6">
           <div className="bg-surface border border-accent">
              <div className="p-4 border-b border-accent bg-accent/5">
                 <h3 className="font-mono text-xs text-accent uppercase tracking-widest flex items-center">
                   <Lock className="w-4 h-4 mr-2" />
                   Encryption Status
                 </h3>
              </div>
              <div className="p-4 space-y-4 font-mono text-xs">
                 <div className="flex items-center justify-between">
                    <span className="text-text-muted uppercase tracking-widest">Master Key</span>
                    <span className="text-accent bg-accent/10 border border-accent/20 px-2 py-1 text-[11px] uppercase tracking-widest">Active</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-text-muted uppercase tracking-widest">Shard Keys</span>
                    <span className="text-accent bg-accent/10 border border-accent/20 px-2 py-1 text-[11px] uppercase tracking-widest">Distributed</span>
                 </div>
                 <div className="pt-4 border-t border-border">
                    <button className="w-full py-3 border border-accent text-accent font-mono text-xs uppercase tracking-widest hover:bg-accent hover:text-white transition-colors">
                       [ Initiate Key Rotation ]
                    </button>
                 </div>
              </div>
           </div>

           <div className="bg-surface border border-border">
              <div className="p-4 border-b border-border bg-surface-raised">
                 <h3 className="font-mono text-xs text-text-primary uppercase tracking-widest flex items-center">
                   <Zap className="w-4 h-4 mr-2 text-accent" />
                   Threat Intelligence
                 </h3>
              </div>
              <div className="p-4 space-y-4 font-mono text-xs text-text-muted">
                 <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent" />
                    <p className="truncate uppercase tracking-widest text-[11px]">Zero suspicious patterns in 24h.</p>
                 </div>
                 <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent" />
                    <p className="truncate uppercase tracking-widest text-[11px]">All regions reporting 100% integrity.</p>
                 </div>
                 <div className="pt-4 mt-4 border-t border-border">
                    <div className="aspect-video bg-void border border-border flex items-center justify-center relative overflow-hidden">
                       <Zap className="w-8 h-8 text-accent opacity-20" />
                       <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
                       <div className="absolute inset-0 border border-accent/10 animate-pulse"></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
