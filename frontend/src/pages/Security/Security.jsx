import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Key, 
  Fingerprint, 
  Eye, 
  MapPin, 
  Smartphone, 
  Monitor,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const Security = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Security Command Center</h1>
          <p className="text-text-secondary mt-1">Governance, identity, and cryptographic integrity monitoring.</p>
        </div>
        <Button variant="security" leftIcon={<Shield className="w-4 h-4" />}>
          Run Integrity Audit
        </Button>
      </div>

      {/* Top Row: Security Score & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Security Score Gauge */}
        <Card className="flex flex-col items-center justify-center p-8 text-center bg-primary-accent/5 border-primary-accent/20">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Simple SVG Circular Progress */}
            <svg className="w-full h-full -rotate-90">
              <circle 
                cx="50%" cy="50%" r="70" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="12" 
                className="text-white/5" 
              />
              <motion.circle 
                cx="50%" cy="50%" r="70" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="12" 
                strokeDasharray="440"
                initial={{ strokeDashoffset: 440 }}
                animate={{ strokeDashoffset: 440 - (440 * 0.98) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-security" 
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-text-primary">98</span>
              <span className="text-xs text-text-secondary font-bold uppercase tracking-widest">Optimal</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-text-primary mt-6">Zero-Knowledge Trust Score</h3>
          <p className="text-xs text-text-secondary mt-2 px-4">Your infrastructure is currently operating at maximum cryptographic security levels.</p>
        </Card>

        {/* Security Checklist */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Governance Checklist</CardTitle>
            <CardDescription>Required actions to maintain high-grade security status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {[
               { label: 'Multi-Factor Authentication', desc: 'Enforced for all administrative nodes.', status: 'completed' },
               { label: 'Encryption Key Rotation', desc: 'Scheduled for completion in 14 days.', status: 'pending' },
               { label: 'IP Access Whitelisting', desc: 'Currently restricting access to 3 verified CIDRs.', status: 'completed' },
               { label: 'Hardware Security Module (HSM)', desc: 'Detected and verified in Tokyo-Alpha.', status: 'completed' },
             ].map((item, i) => (
               <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-surface-elevated/30 border border-border">
                  <div className="flex items-center space-x-4">
                    {item.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-status-success" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-status-warning animate-pulse" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-text-primary">{item.label}</p>
                      <p className="text-[10px] text-text-secondary uppercase tracking-tight">{item.desc}</p>
                    </div>
                  </div>
                  <Badge variant={item.status === 'completed' ? 'success' : 'warning'}>
                    {item.status === 'completed' ? 'Verified' : 'Required'}
                  </Badge>
               </div>
             ))}
          </CardContent>
        </Card>
      </div>

      {/* Sessions & Access Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Sessions */}
        <Card>
          <CardHeader>
             <div className="flex justify-between items-center">
                <CardTitle>Active Admin Sessions</CardTitle>
                <Badge variant="security">Live</Badge>
             </div>
             <CardDescription>Authorized identities currently accessing the vault.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-border">
                {[
                  { device: 'Desktop Chrome', os: 'macOS 14.2', location: 'Tokyo, JP', ip: '192.168.1.45', isCurrent: true, icon: Monitor },
                  { device: 'Vault Mobile', os: 'iOS 17.1', location: 'Singapore', ip: '10.0.4.12', isCurrent: false, icon: Smartphone },
                ].map((session, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-surface-elevated border border-border">
                        <session.icon className="w-5 h-5 text-text-secondary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                           <p className="text-sm font-bold text-text-primary">{session.device} · {session.os}</p>
                           {session.isCurrent && <Badge variant="success" className="text-[8px] py-0">Current</Badge>}
                        </div>
                        <p className="text-[10px] text-text-secondary uppercase">{session.location} · {session.ip}</p>
                      </div>
                    </div>
                    <button className="text-text-secondary hover:text-status-danger transition-colors">
                       <ShieldAlert className="w-4 h-4" />
                    </button>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>

        {/* Cryptographic Audit Trail */}
        <Card>
           <CardHeader>
              <CardTitle>Integrity Alerts</CardTitle>
              <CardDescription>Recent tamper-detection and integrity verification logs.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
              {[
                { event: 'Shard Corrupted (Node 04)', action: 'Auto-replicated from Cluster B', time: '5m ago', severity: 'danger' },
                { event: 'MFA Hardware Challenge', action: 'Identity Verified (Success)', time: '1h ago', severity: 'success' },
                { event: 'Suspicious Auth Attempt', action: 'Rate-limited (Blocked IP)', time: '3h ago', severity: 'warning' },
              ].map((alert, i) => (
                <div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 border border-border">
                   <div className={`mt-1 p-1 rounded-full ${
                     alert.severity === 'danger' ? 'bg-status-danger/20 text-status-danger' : 
                     alert.severity === 'warning' ? 'bg-status-warning/20 text-status-warning' : 
                     'bg-status-success/20 text-status-success'
                   }`}>
                     <ShieldAlert className="w-3 h-3" />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between">
                         <p className="text-xs font-bold text-text-primary">{alert.event}</p>
                         <span className="text-[10px] text-text-secondary">{alert.time}</span>
                      </div>
                      <p className="text-[10px] text-text-secondary mt-1">{alert.action}</p>
                   </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full text-[10px] uppercase tracking-widest font-bold">
                 View Full Security Audit
              </Button>
           </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Security;
